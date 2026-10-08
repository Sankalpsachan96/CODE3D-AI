
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const TIME_LIMIT = 3000;
const MAX_OUTPUT = 100 * 1024;

function commandAvailable(command, args = ["--version"]) {
  try {
    const result = spawnSync(command, args, {
      stdio: "ignore",
      windowsHide: true,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

function getPythonCommand() {
  if (commandAvailable("python3")) return "python3";
  if (commandAvailable("python")) return "python";
  return null;
}

let sandboxAvailabilityCache;

function sandboxAvailable() {
  if (sandboxAvailabilityCache !== undefined) return sandboxAvailabilityCache;
  if (!commandAvailable("bwrap", ["--version"])) {
    sandboxAvailabilityCache = false;
    return false;
  }

  // Probe actual namespace setup, not just whether the binary exists.
  const args = ["--unshare-all", "--die-with-parent"];
  for (const directory of ["/usr", "/etc", "/lib", "/lib64"]) {
    if (fs.existsSync(directory)) args.push("--ro-bind", directory, directory);
  }
  args.push(
    "--proc", "/proc",
    "--dev", "/dev",
    "--tmpfs", "/tmp",
    "--",
    "/usr/bin/prlimit",
    "--cpu=2",
    "--as=2147483648",
    "--nproc=64",
    "--fsize=104857600",
    "--nofile=64",
    "--",
    "/usr/bin/true"
  );
  try {
    const result = spawnSync("bwrap", args, {
      encoding: "utf8",
      windowsHide: true,
      timeout: 2500,
      env: { PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" },
    });
    sandboxAvailabilityCache = result.status === 0;
    if (!sandboxAvailabilityCache) {
      const reason = (result.error?.message || result.stderr || result.stdout || `bwrap probe exited with status ${result.status}`)
        .toString()
        .trim()
        .slice(0, 1000);
      console.error("[sandbox] Bubblewrap probe failed:", reason || "no diagnostic output");
    }
  } catch {
    sandboxAvailabilityCache = false;
  }
  return sandboxAvailabilityCache;
}

const JUDGE0_URL = (process.env.JUDGE0_URL || "").trim().replace(/\/+$/, "");
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_LANGUAGES = {
  c: 50,
  cpp: 54,
  java: 62,
  javascript: 63,
  python: 71,
};

function getRuntimeAvailability() {
  return {
    javascript: Boolean(process.execPath),
    cpp: commandAvailable("g++"),
    c: commandAvailable("gcc"),
    python: Boolean(getPythonCommand()),
    java: commandAvailable("javac") && commandAvailable("java"),
    sandbox: sandboxAvailable() || Boolean(JUDGE0_URL),
    executionProvider: sandboxAvailable() ? "local-bubblewrap" : (JUDGE0_URL ? "remote-judge0" : "unavailable"),
    nodeVersion: process.version,
  };
}

async function executeWithJudge0(language, code, input = "") {
  if (!JUDGE0_URL) {
    return {
      success: false, stage: "sandbox", output: "",
      error: "Secure execution sandbox is unavailable and no remote sandbox provider is configured. Code was not executed.",
      executionTime: null,
    };
  }

  const normalizedLanguage = String(language).toLowerCase().trim();
  const languageKey = ["c++", "cpp"].includes(normalizedLanguage) ? "cpp"
    : ["py", "python"].includes(normalizedLanguage) ? "python"
    : ["js", "node", "javascript"].includes(normalizedLanguage) ? "javascript"
    : normalizedLanguage;
  const languageId = JUDGE0_LANGUAGES[languageKey];
  if (!languageId) {
    return { success: false, stage: "validation", output: "", error: `Language "${language}" is not supported.`, executionTime: null };
  }

  const startedAt = Date.now();
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (JUDGE0_API_KEY) headers["X-Auth-Token"] = JUDGE0_API_KEY;
  const requestTimeout = 12000;

  try {
    const createResponse = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: input,
        cpu_time_limit: 3,
        cpu_extra_time: 1,
        wall_time_limit: 6,
        memory_limit: 128000,
        stack_limit: 64000,
        max_processes_and_or_threads: 30,
        enable_network: false,
      }),
      signal: AbortSignal.timeout(requestTimeout),
    });
    if (!createResponse.ok) {
      const details = (await createResponse.text()).slice(0, 500);
      throw new Error(`Remote sandbox submission failed (HTTP ${createResponse.status}): ${details}`);
    }
    const submission = await createResponse.json();
    if (!submission.token) throw new Error("Remote sandbox did not return a submission token.");

    const deadline = Date.now() + 20000;
    let result;
    while (Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pollResponse = await fetch(
        `${JUDGE0_URL}/submissions/${encodeURIComponent(submission.token)}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status,time`,
        { headers, signal: AbortSignal.timeout(requestTimeout) }
      );
      if (!pollResponse.ok) {
        const details = (await pollResponse.text()).slice(0, 500);
        throw new Error(`Remote sandbox status check failed (HTTP ${pollResponse.status}): ${details}`);
      }
      result = await pollResponse.json();
      if (result.status?.id > 2) break;
    }
    if (!result || result.status?.id <= 2) {
      return { success: false, stage: "timeout", output: "", error: "Remote sandbox timed out while waiting for execution. Please retry.", executionTime: Date.now() - startedAt };
    }

    const output = String(result.stdout || "");
    const error = String(result.compile_output || result.stderr || result.message || "");
    if (Buffer.byteLength(output, "utf8") > MAX_OUTPUT) {
      return { success: false, stage: "runtime", output: output.slice(0, MAX_OUTPUT), error: "Output Limit Exceeded.", executionTime: Date.now() - startedAt };
    }
    const accepted = result.status?.id === 3;
    return {
      success: accepted,
      stage: accepted ? "complete" : (result.status?.id === 6 ? "compile" : "runtime"),
      output,
      error: accepted ? "" : (error || `Remote execution failed: ${result.status?.description || "unknown status"}`),
      executionTime: Date.now() - startedAt,
    };
  } catch (error) {
    console.error("[sandbox] Remote Judge0 execution failed:", error.message);
    return {
      success: false, stage: "sandbox", output: "",
      error: "Secure remote code execution is currently unavailable. Please try again later; code was not executed locally.",
      executionTime: Date.now() - startedAt,
    };
  }
}

function createTempDirectory() {
  const id = crypto.randomBytes(8).toString("hex");
  const directory = path.join(os.tmpdir(), `code3d-${id}`);

  fs.mkdirSync(directory, { recursive: true });

  return directory;
}

function sandboxArguments(command, args, cwd) {
  const bwrapArgs = ["--unshare-all", "--die-with-parent", "--new-session"];
  for (const directory of ["/usr", "/etc", "/lib", "/lib64"]) {
    if (fs.existsSync(directory)) bwrapArgs.push("--ro-bind", directory, directory);
  }
  bwrapArgs.push(
    "--proc", "/proc",
    "--dev", "/dev",
    "--tmpfs", "/tmp",
    "--bind", cwd, "/work",
    "--chdir", "/work",
    "--setenv", "PATH", "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
    "--setenv", "HOME", "/work",
    "--setenv", "TMPDIR", "/tmp",
    "--setenv", "LANG", "C.UTF-8",
    "--",
    "/usr/bin/prlimit",
    "--cpu=20",
    "--as=2147483648",
    "--nproc=64",
    "--fsize=104857600",
    "--nofile=64",
    "--",
    command,
    ...args.map((arg) => {
      if (typeof arg !== "string") return String(arg);
      if (arg === cwd) return "/work";
      if (arg.startsWith(cwd + path.sep)) return "/work" + arg.slice(cwd.length);
      return arg;
    })
  );
  return bwrapArgs;
}

function killProcessTree(child) {
  if (!child?.pid) return;
  try {
    if (process.platform !== "win32") process.kill(-child.pid, "SIGKILL");
    else child.kill();
  } catch {
    try { child.kill("SIGKILL"); } catch {}
  }
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve) => {
    if (!options.cwd || !sandboxAvailable()) {
      resolve({
        success: false,
        stdout: "",
        stderr: "Secure execution sandbox is unavailable. The backend must permit bubblewrap user, PID, and network namespaces; unisolated execution is disabled.",
        timedOut: false,
        outputLimitExceeded: false,
        exitCode: null,
      });
      return;
    }

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let outputLimitExceeded = false;
    const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : TIME_LIMIT;

    const child = spawn("bwrap", sandboxArguments(command, args, options.cwd), {
      cwd: options.cwd,
      shell: false,
      detached: process.platform !== "win32",
      windowsHide: true,
      env: {
        PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
        HOME: options.cwd,
        TMPDIR: "/tmp",
        LANG: "C.UTF-8",
      },
    });

    const timer = setTimeout(() => {
      timedOut = true;
      killProcessTree(child);
    }, timeoutMs);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
      if (Buffer.byteLength(stdout, "utf8") > MAX_OUTPUT) {
        outputLimitExceeded = true;
        killProcessTree(child);
      }
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
      if (Buffer.byteLength(stderr, "utf8") > MAX_OUTPUT) {
        outputLimitExceeded = true;
        killProcessTree(child);
      }
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        success: false,
        stdout,
        stderr: error.message,
        timedOut,
        outputLimitExceeded,
        exitCode: null,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        success: code === 0 && !timedOut && !outputLimitExceeded,
        stdout,
        stderr,
        timedOut,
        outputLimitExceeded,
        exitCode: code,
      });
    });

    if (options.input) child.stdin.write(options.input);
    child.stdin.end();
  });
}

/* =========================
   C++ EXECUTION
========================= */

async function executeCpp(code, input = "") {
  if (!commandAvailable("g++")) {
    return {
      success: false,
      stage: "environment",
      output: "",
      error: "C++ compiler (g++) is not installed in the backend runtime. Deploy the Node server with server/Dockerfile so g++ is available.",
      executionTime: null,
    };
  }

  const tempDirectory = createTempDirectory();

  const sourceFile = path.join(tempDirectory, "main.cpp");
  const executableFile = path.join(tempDirectory, "main.exe");

  try {
    fs.writeFileSync(sourceFile, code, "utf8");

    const compileResult = await runProcess(
      "g++",
      [
        "-std=c++20",
        "-O2",
        sourceFile,
        "-o",
        executableFile,
      ],
      {
        cwd: tempDirectory,
        timeoutMs: 15000,
      }
    );

    if (!compileResult.success) {
      return {
        success: false,
        stage: "compile",
        output: "",
        error: compileResult.timedOut
          ? "C++ compilation timed out. The backend is under heavy load; please try again."
          : compileResult.stderr || "C++ compilation failed.",
        executionTime: null,
      };
    }

    const startTime = Date.now();

    const executionResult = await runProcess(
      executableFile,
      [],
      {
        cwd: tempDirectory,
        input,
      }
    );

    const executionTime = Date.now() - startTime;

    if (executionResult.timedOut) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        error:
          "Time Limit Exceeded. The program may contain an infinite loop or excessive computation.",
        executionTime,
      };
    }

    if (executionResult.outputLimitExceeded) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout.slice(0, MAX_OUTPUT),
        error: "Output Limit Exceeded.",
        executionTime,
      };
    }

    if (!executionResult.success) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        error:
          executionResult.stderr ||
          "Program terminated with an error.",
        executionTime,
      };
    }

    return {
      success: true,
      stage: "complete",
      output: executionResult.stdout,
      error: "",
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      stage: "server",
      output: "",
      error: error.message,
      executionTime: null,
    };
  } finally {
    try {
      fs.rmSync(tempDirectory, {
        recursive: true,
        force: true,
      });
    } catch (error) {
      console.error(
        "Temporary file cleanup failed:",
        error.message
      );
    }
  }
}


/* =========================
   C EXECUTION
========================= */

async function executeC(code, input = "") {
  if (!commandAvailable("gcc")) {
    return {
      success: false,
      stage: "environment",
      output: "",
      error: "C compiler (gcc) is not installed in the backend runtime. Deploy the Node server with server/Dockerfile so gcc is available.",
      executionTime: null,
    };
  }

  const tempDirectory = createTempDirectory();

  const sourceFile = path.join(tempDirectory, "main.c");
  const executableFile = path.join(tempDirectory, "main.exe");

  try {
    fs.writeFileSync(sourceFile, code, "utf8");

    const compileResult = await runProcess(
      "gcc",
      [
        "-std=c17",
        "-O2",
        sourceFile,
        "-o",
        executableFile,
      ],
      {
        cwd: tempDirectory,
        timeoutMs: 15000,
      }
    );

    if (!compileResult.success) {
      return {
        success: false,
        stage: "compile",
        output: "",
        error: compileResult.timedOut
          ? "C compilation timed out. The backend is under heavy load; please try again."
          : compileResult.stderr || "C compilation failed.",
        executionTime: null,
      };
    }

    const startTime = Date.now();

    const executionResult = await runProcess(
      executableFile,
      [],
      {
        cwd: tempDirectory,
        input,
      }
    );

    const executionTime = Date.now() - startTime;

    if (executionResult.timedOut) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        error:
          "Time Limit Exceeded. The program may contain an infinite loop or excessive computation.",
        executionTime,
      };
    }

    if (executionResult.outputLimitExceeded) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout.slice(0, MAX_OUTPUT),
        error: "Output Limit Exceeded.",
        executionTime,
      };
    }

    if (!executionResult.success) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        error:
          executionResult.stderr ||
          "Program terminated with an error.",
        executionTime,
      };
    }

    return {
      success: true,
      stage: "complete",
      output: executionResult.stdout,
      error: "",
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      stage: "server",
      output: "",
      error: error.message,
      executionTime: null,
    };
  } finally {
    try {
      fs.rmSync(tempDirectory, {
        recursive: true,
        force: true,
      });
    } catch (error) {
      console.error(
        "Temporary file cleanup failed:",
        error.message
      );
    }
  }
}


/* =========================
   PYTHON EXECUTION
========================= */

async function executePython(code, input = "") {
  const pythonCommand = getPythonCommand();

  if (!pythonCommand) {
    return {
      success: false,
      stage: "environment",
      output: "",
      error: "Python runtime is not installed in the backend runtime. Deploy the Node server with server/Dockerfile so Python 3 is available.",
      executionTime: null,
    };
  }

  const tempDirectory = createTempDirectory();

  const sourceFile = path.join(tempDirectory, "main.py");

  try {
    fs.writeFileSync(sourceFile, code, "utf8");

    const startTime = Date.now();

    const executionResult = await runProcess(
      pythonCommand,
      [sourceFile],
      {
        cwd: tempDirectory,
        input,
      }
    );

    const executionTime = Date.now() - startTime;

    if (executionResult.timedOut) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        error:
          "Time Limit Exceeded. The program may contain an infinite loop or excessive computation.",
        executionTime,
      };
    }

    if (executionResult.outputLimitExceeded) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout.slice(0, MAX_OUTPUT),
        error: "Output Limit Exceeded.",
        executionTime,
      };
    }

    if (!executionResult.success) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        error:
          executionResult.stderr ||
          "Python program terminated with an error.",
        executionTime,
      };
    }

    return {
      success: true,
      stage: "complete",
      output: executionResult.stdout,
      error: "",
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      stage: "server",
      output: "",
      error: error.message,
      executionTime: null,
    };
  } finally {
    try {
      fs.rmSync(tempDirectory, {
        recursive: true,
        force: true,
      });
    } catch (error) {
      console.error(
        "Temporary file cleanup failed:",
        error.message
      );
    }
  }
}


/* =========================
   JAVA EXECUTION
========================= */

async function executeJava(code, input = "") {
  if (!commandAvailable("javac") || !commandAvailable("java")) {
    return {
      success: false,
      stage: "environment",
      output: "",
      error: "Java runtime (javac/java) is not installed in the backend runtime. Deploy the Node server with server/Dockerfile so OpenJDK is available.",
      executionTime: null,
    };
  }

  const tempDirectory = createTempDirectory();

  // Java requires a public class to live in a file with the same name.
  // Support normal editor code such as "public class Solution" instead
  // of forcing every program to be named Main.
  const publicClassMatch = code.match(
    /\bpublic\s+class\s+([A-Za-z_$][\w$]*)/
  );
  const mainClass = publicClassMatch?.[1] || "Main";
  const sourceFile = path.join(tempDirectory, `${mainClass}.java`);

  try {
    fs.writeFileSync(sourceFile, code, "utf8");

    const compileResult = await runProcess(
      "javac",
      [sourceFile],
      {
        cwd: tempDirectory,
        timeoutMs: 15000,
      }
    );

    if (!compileResult.success) {
      return {
        success: false,
        stage: "compile",
        output: "",
        error: compileResult.timedOut
          ? "Java compilation timed out. The backend is under heavy load; please try again."
          : compileResult.stderr || "Java compilation failed.",
        executionTime: null,
      };
    }

    const startTime = Date.now();

    const executionResult = await runProcess(
      "java",
      ["-cp", tempDirectory, mainClass],
      {
        cwd: tempDirectory,
        input,
      }
    );

    const executionTime = Date.now() - startTime;

    if (executionResult.timedOut) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        error:
          "Time Limit Exceeded. The program may contain an infinite loop or excessive computation.",
        executionTime,
      };
    }

    if (executionResult.outputLimitExceeded) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout.slice(0, MAX_OUTPUT),
        error: "Output Limit Exceeded.",
        executionTime,
      };
    }

    if (!executionResult.success) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        error:
          executionResult.stderr ||
          "Java program terminated with an error.",
        executionTime,
      };
    }

    return {
      success: true,
      stage: "complete",
      output: executionResult.stdout,
      error: "",
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      stage: "server",
      output: "",
      error: error.message,
      executionTime: null,
    };
  } finally {
    try {
      fs.rmSync(tempDirectory, {
        recursive: true,
        force: true,
      });
    } catch (error) {
      console.error(
        "Temporary file cleanup failed:",
        error.message
      );
    }
  }
}


/* =========================
   JAVASCRIPT EXECUTION
========================= */

async function executeJavaScript(code, input = "") {
  const tempDirectory = createTempDirectory();
  const sourceFile = path.join(tempDirectory, "main.js");

  try {
    fs.writeFileSync(sourceFile, code, "utf8");

    const startTime = Date.now();
    const executionResult = await runProcess(
      process.execPath,
      [sourceFile],
      {
        cwd: tempDirectory,
        input,
      }
    );
    const executionTime = Date.now() - startTime;

    if (executionResult.timedOut) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        error: "Time Limit Exceeded. The program may contain an infinite loop or excessive computation.",
        executionTime,
      };
    }

    if (executionResult.outputLimitExceeded) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout.slice(0, MAX_OUTPUT),
        error: "Output Limit Exceeded.",
        executionTime,
      };
    }

    if (!executionResult.success) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        error: executionResult.stderr || "JavaScript program terminated with an error.",
        executionTime,
      };
    }

    return {
      success: true,
      stage: "complete",
      output: executionResult.stdout,
      error: "",
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      stage: "server",
      output: "",
      error: error.message,
      executionTime: null,
    };
  } finally {
    try {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    } catch (error) {
      console.error("Temporary file cleanup failed:", error.message);
    }
  }
}


/* =========================
   MAIN EXECUTOR
========================= */

async function executeCode(language, code, input = "") {
  if (!code || !code.trim()) {
    return {
      success: false,
      stage: "validation",
      output: "",
      error: "Code cannot be empty.",
      executionTime: null,
    };
  }

  if (Buffer.byteLength(code, "utf8") > 100 * 1024) {
    return {
      success: false,
      stage: "validation",
      output: "",
      error: "Code exceeds the 100 KB execution limit.",
      executionTime: null,
    };
  }
  if (typeof input !== "string" || Buffer.byteLength(input, "utf8") > 20 * 1024) {
    return {
      success: false,
      stage: "validation",
      output: "",
      error: "Execution input must be a string no larger than 20 KB.",
      executionTime: null,
    };
  }

  if (!sandboxAvailable()) {
    return executeWithJudge0(language, code, input);
  }

  const normalizedLanguage = language
    .toLowerCase()
    .trim();

  if (
    normalizedLanguage === "c++" ||
    normalizedLanguage === "cpp"
  ) {
    return executeCpp(code, input);
  }

  if (normalizedLanguage === "c") {
    return executeC(code, input);
  }

  if (
    normalizedLanguage === "python" ||
    normalizedLanguage === "py"
  ) {
    return executePython(code, input);
  }

  if (normalizedLanguage === "java") {
    return executeJava(code, input);
  }

  if (
    normalizedLanguage === "javascript" ||
    normalizedLanguage === "js" ||
    normalizedLanguage === "node"
  ) {
    return executeJavaScript(code, input);
  }

  return {
    success: false,
    stage: "validation",
    output: "",
    error: `Language "${language}" is not supported yet.`,
    executionTime: null,
  };
}

module.exports = {
  executeCode,
  getRuntimeAvailability,
};


