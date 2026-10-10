import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const executor = require('../src/services/universalExecutor.cjs');

test('JavaScript trace wrapper uses module names and syntax supported by older Node runtimes', () => {
  const runner = executor.buildJavaScriptTraceRunnerSource('console.log(1);');

  assert.doesNotMatch(runner, /require\\(["']node:/);
  assert.doesNotMatch(runner, /\\?\\./);
  assert.doesNotMatch(runner, /\\.at\\(/);
});

test('JavaScript runtime tracer captures executed lines and real local values without changing stdout', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'code3d-js-trace-'));
  const runner = path.join(directory, 'trace-runner.js');
  const sourceFile = path.join(directory, 'main.js');
  const source = [
    'const values = [2, 4];',
    'let total = 0;',
    'for (let i = 0; i < values.length; i++) {',
    '  total += values[i];',
    '}',
    'console.log(total);',
  ].join('\n');

  try {
    fs.writeFileSync(runner, executor.buildJavaScriptTraceRunnerSource());
    fs.writeFileSync(sourceFile, source);
    const run = spawnSync(process.execPath, [runner, sourceFile], { encoding: 'utf8', timeout: 5000 });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(run.stdout, '6\n');
    const trace = executor.extractRuntimeTrace(run.stderr);
    assert.equal(trace.stderr, '');
    assert.ok(trace.runtimeTrace.length >= 6, JSON.stringify({ stderr: run.stderr, trace }));
    assert.ok(trace.runtimeTrace.every((step) => Number.isInteger(step.line) && step.line >= 1 && step.line <= 6));
    const loopStates = trace.runtimeTrace.filter((step) => step.line === 4);
    assert.equal(loopStates.length, 2);
    assert.deepEqual(loopStates.map((step) => step.variables.i), [0, 1]);
    assert.deepEqual(loopStates.map((step) => step.variables.total), [0, 2]);
    assert.deepEqual(loopStates[0].variables.values, [2, 4]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('JavaScript runtime tracer preserves the actual runtime error and captured state', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'code3d-js-error-'));
  const runner = path.join(directory, 'trace-runner.js');
  const sourceFile = path.join(directory, 'main.js');
  try {
    fs.writeFileSync(runner, executor.buildJavaScriptTraceRunnerSource());
    fs.writeFileSync(sourceFile, 'let value = 3;\nthrow new Error("boom");');
    const run = spawnSync(process.execPath, [runner, sourceFile], { encoding: 'utf8', timeout: 5000 });
    assert.notEqual(run.status, 0);
    const trace = executor.extractRuntimeTrace(run.stderr);
    assert.match(trace.stderr, /boom/);
    assert.ok(trace.runtimeTrace.some((step) => step.line === 2 && step.variables.value === 3));
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('Python runtime tracer captures actual executed loop state and preserves stdout', () => {
  const source = 'values = [2, 4]\ntotal = 0\nfor i, value in enumerate(values):\n    total += value\nprint(total)';
  const python = ['python3', 'python'].find((command) => spawnSync(command, ['--version'], { encoding: 'utf8' }).status === 0);
  assert.ok(python, 'Python runtime is required for the instrumentation test');
  const run = spawnSync(python, ['-c', executor.buildPythonInstrumentedSource(source)], { encoding: 'utf8', timeout: 5000 });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout.replace(/\r\n/g, '\n'), '6\n');
  const trace = executor.extractRuntimeTrace(run.stderr);
  assert.ok(!trace.stderr.includes('__CODE3D_RUNTIME_TRACE__'));
  const loopStates = trace.runtimeTrace.filter((step) => step.line === 4);
  assert.equal(loopStates.length, 2);
  assert.deepEqual(loopStates.map((step) => step.variables.i), [0, 1]);
  assert.deepEqual(loopStates.map((step) => step.variables.total), [0, 2]);
  assert.deepEqual(loopStates[0].variables.values, [2, 4]);
});

test('GDB tracer records actual C line mappings and array values while preserving program stdout', { skip: spawnSync('gdb', ['--version'], { stdio: 'ignore' }).status !== 0 || spawnSync('gcc', ['--version'], { stdio: 'ignore' }).status !== 0 }, () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'code3d-gdb-trace-'));
  const sourceFile = path.join(directory, 'main.c');
  const binaryFile = path.join(directory, process.platform === 'win32' ? 'main.exe' : 'main');
  const stdinFile = path.join(directory, 'input.txt');
  const stdoutFile = path.join(directory, 'stdout.txt');
  const stderrFile = path.join(directory, 'stderr.txt');
  const scriptFile = path.join(directory, 'trace.gdb');
  const source = ['#include <stdio.h>', 'int main(void) {', '  int values[2] = {2, 4};', '  int total = 0;', '  for (int i = 0; i < 2; ++i) {', '    total += values[i];', '  }', '  printf("%d\\n", total);', '  return 0;', '}'].join('\n');
  try {
    fs.writeFileSync(sourceFile, source);
    fs.writeFileSync(stdinFile, '');
    const compile = spawnSync('gcc', ['-g', '-O0', '-fno-omit-frame-pointer', sourceFile, '-o', binaryFile], { encoding: 'utf8', timeout: 15000 });
    assert.equal(compile.status, 0, compile.stderr);
    fs.writeFileSync(scriptFile, executor.buildGdbTraceScript(sourceFile, stdinFile, stdoutFile, stderrFile, directory, directory));
    const run = spawnSync('gdb', ['--quiet', '--batch', '-x', scriptFile, '--args', binaryFile], { encoding: 'utf8', timeout: 10000 });
    assert.equal(run.status, 0, run.stderr || run.stdout);
    assert.equal(fs.readFileSync(stdoutFile, 'utf8').replace(/\r\n/g, '\n'), '6\n');
    const trace = executor.extractRuntimeTrace(run.stderr);
    const loopStates = trace.runtimeTrace.filter((step) => step.line === 6);
    assert.equal(loopStates.length, 2, JSON.stringify({ stderr: run.stderr, stdout: run.stdout }));
    assert.deepEqual(loopStates.map((step) => step.variables.i), [0, 1]);
    assert.deepEqual(loopStates.map((step) => step.variables.total), [0, 2]);
    assert.deepEqual(loopStates[0].variables.values, [2, 4]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('GDB tracer records actual C++ loop state and preserves standard output', { skip: spawnSync('gdb', ['--version'], { stdio: 'ignore' }).status !== 0 || spawnSync('g++', ['--version'], { stdio: 'ignore' }).status !== 0 }, () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'code3d-cpp-trace-'));
  const sourceFile = path.join(directory, 'main.cpp');
  const binaryFile = path.join(directory, process.platform === 'win32' ? 'main.exe' : 'main');
  const stdinFile = path.join(directory, 'input.txt');
  const stdoutFile = path.join(directory, 'stdout.txt');
  const stderrFile = path.join(directory, 'stderr.txt');
  const scriptFile = path.join(directory, 'trace.gdb');
  const source = ['#include <iostream>', '#include <vector>', 'int main() {', '  std::vector<int> values = {3, 5};', '  int total = 0;', '  for (int i = 0; i < 2; ++i) {', '    total += values[i];', '  }', '  std::cout << total << "\\n";', '  return 0;', '}'].join('\n');
  try {
    fs.writeFileSync(sourceFile, source);
    fs.writeFileSync(stdinFile, '');
    const compile = spawnSync('g++', ['-std=c++20', '-g', '-O0', '-fno-omit-frame-pointer', sourceFile, '-o', binaryFile], { encoding: 'utf8', timeout: 15000 });
    assert.equal(compile.status, 0, compile.stderr);
    fs.writeFileSync(scriptFile, executor.buildGdbTraceScript(sourceFile, stdinFile, stdoutFile, stderrFile, directory, directory));
    const run = spawnSync('gdb', ['--quiet', '--batch', '-x', scriptFile, '--args', binaryFile], { encoding: 'utf8', timeout: 10000 });
    assert.equal(run.status, 0, run.stderr || run.stdout);
    assert.equal(fs.readFileSync(stdoutFile, 'utf8').replace(/\r\n/g, '\n'), '8\n');
    const trace = executor.extractRuntimeTrace(run.stderr);
    const loopStates = trace.runtimeTrace.filter((step) => step.line === 7);
    assert.equal(loopStates.length, 2, JSON.stringify({ stderr: run.stderr, stdout: run.stdout }));
    assert.deepEqual(loopStates.map((step) => step.variables.i), [0, 1]);
    assert.deepEqual(loopStates.map((step) => step.variables.total), [0, 3]);
    assert.deepEqual(loopStates[0].variables.values, [3, 5]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('Java JDI tracer records actual source lines and array/loop variables without changing stdout', { skip: spawnSync('javac', ['-version'], { stdio: 'ignore' }).status !== 0 || spawnSync('java', ['--list-modules'], { encoding: 'utf8' }).stdout?.includes('jdk.jdi') !== true }, () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'code3d-java-trace-'));
  const sourceFile = path.join(directory, 'demo', 'Main.java');
  const runnerFile = path.join(directory, 'Code3dJavaTraceRunner.java');
  const source = ['package demo;', 'import java.util.ArrayDeque;', 'public class Main {', '  public static void main(String[] args) {', '    int[] values = {2, 4};', '    int total = 0;', '    ArrayDeque<Integer> stack = new ArrayDeque<>();', '    stack.push(9);', '    ArrayDeque<Integer> queue = new ArrayDeque<>();', '    queue.add(8);', '    for (int i = 0; i < values.length; i++) {', '      total += values[i];', '    }', '    System.out.println(total);', '  }', '}'].join('\n');
  try {
    fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
    fs.writeFileSync(sourceFile, source);
    fs.writeFileSync(runnerFile, executor.buildJavaTraceRunnerSource());
    const compile = spawnSync('javac', ['--add-modules', 'jdk.jdi', '-g', '-d', directory, sourceFile, runnerFile], { encoding: 'utf8', timeout: 20000 });
    assert.equal(compile.status, 0, compile.stderr);
    const run = spawnSync('java', ['--add-modules', 'jdk.jdi', '-cp', directory, 'Code3dJavaTraceRunner', directory, 'demo.Main', 'Main.java'], { encoding: 'utf8', timeout: 15000 });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(run.stdout.replace(/\r\n/g, '\n'), '6\n');
    const trace = executor.extractRuntimeTrace(run.stderr);
    assert.equal(trace.stderr, '', `unexpected Java stderr: ${trace.stderr}`);
    const loopStates = trace.runtimeTrace.filter((step) => step.line === 12);
    assert.equal(loopStates.length, 2, JSON.stringify({ stderr: run.stderr, stdout: run.stdout }));
    assert.deepEqual(loopStates.map((step) => step.variables.i), [0, 1]);
    assert.deepEqual(loopStates.map((step) => step.variables.total), [0, 2]);
    assert.deepEqual(loopStates[0].variables.values, [2, 4]);
    assert.deepEqual(loopStates[0].variables.stack, [9]);
    assert.deepEqual(loopStates[0].variables.queue, [8]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

