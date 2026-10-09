import assert from 'node:assert/strict';
import test from 'node:test';
import executor from '../src/services/universalExecutor.cjs';

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => typeof data === 'string' ? data : JSON.stringify(data),
  };
}

function judge0Fetch(result, onCreate = () => {}) {
  return async (url, options = {}) => {
    if (options.method === 'POST') {
      onCreate(JSON.parse(options.body), options);
      return jsonResponse({ token: 'test-token' }, 201);
    }
    if (options.method === 'DELETE') return jsonResponse({ status: { id: 3 } });
    return jsonResponse(result);
  };
}

const finalResult = (id, fields = {}) => ({
  status: { id, description: ({ 3: 'Accepted', 5: 'Time Limit Exceeded', 6: 'Compilation Error', 11: 'Runtime Error' })[id] || 'Error' },
  ...fields,
});

test('Judge0 maps all five editor languages and sends source plus stdin unchanged', async () => {
  const cases = [
    ['c', 50], ['cpp', 54], ['java', 62], ['javascript', 63], ['python', 71],
  ];
  for (const [language, languageId] of cases) {
    let body;
    const result = await executor.executeWithJudge0(language, `// ${language}`, 'sample input\n', {
      judge0Url: 'https://judge0.example/',
      judge0ApiKey: 'test-key',
      fetchImpl: judge0Fetch(finalResult(3, { stdout: 'ok\n', time: '0.01' }), (payload, request) => {
        body = payload;
        assert.equal(request.headers['X-Auth-Token'], 'test-key');
      }),
      pollIntervalMs: 0,
    });
    assert.equal(body.language_id, languageId);
    if (language === 'python') {
      assert.match(body.source_code, /__CODE3D_RUNTIME_TRACE__/);
      assert.match(body.source_code, /sys\.settrace/);
    } else {
      assert.equal(body.source_code, `// ${language}`);
    }
    assert.equal(body.stdin, 'sample input\n');
    assert.equal(body.enable_network, false);
    assert.equal(result.success, true);
    assert.equal(result.output, 'ok\n');
    assert.equal(result.executionTime, 10, 'Judge0 time is reported as program time, not network polling duration');
  }
});

test('Python Judge0 execution returns real line snapshots without changing stdout', async () => {
  const marker = '__CODE3D_RUNTIME_TRACE__';
  const snapshots = [{ step: 1, line: 1, event: 'runtime_line', variables: { value: 7 } }];
  const result = await executor.executeWithJudge0('python', 'value = 7\nprint(value)', '', {
    judge0Url: 'https://judge0.example',
    fetchImpl: judge0Fetch(finalResult(3, { stdout: '7\n', stderr: marker + JSON.stringify(snapshots) + '\n', time: '0.01' })),
    pollIntervalMs: 0,
  });
  assert.equal(result.success, true);
  assert.equal(result.output, '7\n');
  assert.deepEqual(result.runtimeTrace, snapshots);
  assert.equal(result.stderr, '');
});
test('Judge0 compile and runtime errors preserve their stages and diagnostics', async () => {
  const compile = await executor.executeWithJudge0('java', 'bad source', '', {
    judge0Url: 'https://judge0.example',
    fetchImpl: judge0Fetch(finalResult(6, { compile_output: 'Main.java:1: error: expected' })),
    pollIntervalMs: 0,
  });
  assert.equal(compile.stage, 'compile');
  assert.match(compile.error, /expected/);

  const runtime = await executor.executeWithJudge0('python', 'raise Exception()', '', {
    judge0Url: 'https://judge0.example',
    fetchImpl: judge0Fetch(finalResult(11, { stderr: 'Traceback: boom' })),
    pollIntervalMs: 0,
  });
  assert.equal(runtime.stage, 'runtime');
  assert.match(runtime.error, /Traceback/);
});

test('Judge0 reports execution time limits distinctly and bounds stdout', async () => {
  const timeout = await executor.executeWithJudge0('javascript', 'while(true){}', '', {
    judge0Url: 'https://judge0.example',
    fetchImpl: judge0Fetch(finalResult(5)),
    pollIntervalMs: 0,
  });
  assert.equal(timeout.stage, 'timeout');
  assert.match(timeout.error, /Time Limit Exceeded/);

  const large = await executor.executeWithJudge0('python', 'print("x")', '', {
    judge0Url: 'https://judge0.example',
    fetchImpl: judge0Fetch(finalResult(3, { stdout: 'x'.repeat(110 * 1024) })),
    pollIntervalMs: 0,
  });
  assert.equal(large.success, false);
  assert.equal(Buffer.byteLength(large.output), 100 * 1024);
  assert.match(large.error, /Output Limit/);
});

test('Judge0 rate limits and cancellation are surfaced without local execution fallback', async () => {
  const limited = await executor.executeWithJudge0('c', 'int main(){}', '', {
    judge0Url: 'https://judge0.example',
    fetchImpl: async () => jsonResponse({ error: 'slow down' }, 429),
  });
  assert.equal(limited.stage, 'rate_limit');
  assert.match(limited.error, /rate limiting/);

  const controller = new AbortController();
  let deleteRequested = false;
  let pollStarted;
  const pollStartedPromise = new Promise((resolve) => { pollStarted = resolve; });
  const fetchImpl = async (url, options = {}) => {
    if (options.method === 'POST') return jsonResponse({ token: 'cancel-token' }, 201);
    if (options.method === 'DELETE') { deleteRequested = true; return jsonResponse({}); }
    pollStarted();
    return new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })), { once: true });
    });
  };
  const running = executor.executeWithJudge0('python', 'while True: pass', '', {
    judge0Url: 'https://judge0.example', fetchImpl, signal: controller.signal, pollIntervalMs: 0,
  });
  await pollStartedPromise;
  controller.abort();
  const cancelled = await running;
  assert.equal(cancelled.stage, 'cancelled');
  assert.equal(deleteRequested, true);
  assert.match(cancelled.error, /may continue/);
});

test('Judge0 without a successful local sandbox is not silently replaced by local execution', async () => {
  const result = await executor.executeWithJudge0('ruby', 'puts 1', '', {
    judge0Url: 'https://judge0.example', fetchImpl: judge0Fetch(finalResult(3)),
  });
  assert.equal(result.stage, 'validation');
  assert.match(result.error, /not supported/);
});
