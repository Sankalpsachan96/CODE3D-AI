
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
    "--as=536870912",
    "--nproc=32",
    "--fsize=1048576",
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

const JUDGE0_LANGUAGES = {
  c: 50,
  cpp: 54,
  java: 62,
  javascript: 63,
  python: 71,
};

function getJudge0Config(options = {}) {
  return {
    url: String(options.judge0Url ?? process.env.JUDGE0_URL ?? "").trim().replace(/\/+$/, ""),
    apiKey: options.judge0ApiKey ?? process.env.JUDGE0_API_KEY ?? "",
  };
}

function getRuntimeAvailability() {
  const judge0 = getJudge0Config();
  const localSandbox = sandboxAvailable();
  return {
    javascript: Boolean(process.execPath),
    cpp: commandAvailable("g++"),
    c: commandAvailable("gcc"),
    python: Boolean(getPythonCommand()),
    java: commandAvailable("javac") && commandAvailable("java"),
    sandbox: localSandbox || Boolean(judge0.url),
    executionProvider: localSandbox ? "local-bubblewrap" : (judge0.url ? "remote-judge0" : "unavailable"),
    nodeVersion: process.version,
  };
}

const RUNTIME_TRACE_MARKER = "__CODE3D_RUNTIME_TRACE__";
function buildPythonInstrumentedSource(source) {
  const encoded = Buffer.from(source, "utf8").toString("base64");
  return [
    "import sys, json, base64"
    ,"__code3d_source = base64.b64decode(\"" + encoded + "\").decode(\"utf-8\")"
    ,"__code3d_events = []"
    ,"__code3d_steps = 0"
    ,"def __code3d_safe(value, depth=0):"
    ," if depth > 3: return '<max-depth>'"
    ," if value is None or isinstance(value, (bool, int, float, str)): return value if not isinstance(value, str) or len(value) <= 200 else value[:200] + \"…\""
    ," if isinstance(value, (list, tuple)): return [__code3d_safe(v, depth + 1) for v in value[:100]]"
    ," if isinstance(value, dict): return {str(k)[:80]: __code3d_safe(v, depth + 1) for k, v in list(value.items())[:100] if not str(k).startswith(\"__code3d_\")}"
    ," return '<' + type(value).__name__ + '>'"
    ,"def __code3d_trace(frame, event, arg):"
    ," global __code3d_steps"
    ," if event == \"line\" and frame.f_code.co_filename == \"<user_code>\":"
    ,"  __code3d_steps += 1"
    ,"  if __code3d_steps <= 500: __code3d_events.append({\"step\": __code3d_steps, \"line\": frame.f_lineno, \"event\": \"runtime_line\", \"variables\": {k: __code3d_safe(v) for k, v in frame.f_locals.items() if not k.startswith(\"__code3d_\") and not k.startswith(\"__\")}, \"message\": \"Runtime snapshot captured at this executed line.\"})"
    ,"  elif __code3d_steps == 501: __code3d_events.append({\"step\": 501, \"event\": \"trace_limit\", \"message\": \"Runtime trace capped at 500 line events.\"})"
    ," return __code3d_trace"
    ,"try:"
    ," sys.settrace(__code3d_trace)"
    ," exec(compile(__code3d_source, \"<user_code>\", \"exec\"), {\"__name__\": \"__main__\"})"
    ,"except SystemExit:"
    ," pass"
    ,"finally:"
    ," sys.settrace(None)"
    ," print(\"" + RUNTIME_TRACE_MARKER + "\" + json.dumps(__code3d_events, separators=(\",\", \":\")), file=sys.stderr)"
  ].join("\n");
}
function extractPythonRuntimeTrace(stderr) {
  const text = String(stderr || "");
  const i = text.lastIndexOf(RUNTIME_TRACE_MARKER);
  if (i < 0) return { stderr: text, runtimeTrace: null };
  const before = text.slice(0, i).trimEnd();
  const payload = text.slice(i + RUNTIME_TRACE_MARKER.length).split(/\r?\n/, 1)[0];
  try { const events = JSON.parse(payload); return { stderr: before, runtimeTrace: Array.isArray(events) ? events : null }; }
  catch { return { stderr: text, runtimeTrace: null }; }
}
async function executeWithJudge0(language, code, input = "", options = {}) {
  const { signal, fetchImpl = fetch } = options;
  const { url: judge0Url, apiKey } = getJudge0Config(options);
  if (!judge0Url) {
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
  if (apiKey) headers["X-Auth-Token"] = apiKey;
  const requestTimeout = Number.isFinite(options.requestTimeoutMs) ? options.requestTimeoutMs : 12000;
  const pollInterval = Number.isFinite(options.pollIntervalMs) ? options.pollIntervalMs : 500;
  const deadlineMs = Number.isFinite(options.deadlineMs) ? options.deadlineMs : 20000;
  let token;

  const failure = (stage, error, executionTime) => ({
    success: false, stage, output: "", error, executionTime,
  });
  const responseDetails = async (response) => {
    try { return (await response.text()).slice(0, 500); } catch { return ""; }
  };
  const cancelRemoteSubmission = async () => {
    if (!token) return;
    try {
      await fetchImpl(`${judge0Url}/submissions/${encodeURIComponent(token)}?fields=status`, {
        method: "DELETE",
        headers,
        signal: AbortSignal.timeout(2000),
      });
    } catch (error) {
      console.warn("[sandbox] Judge0 cancellation request failed:", error.message);
    }
  };
  const waitForPoll = (duration) => new Promise((resolve, reject) => {
    const finish = () => {
      signal?.removeEventListener("abort", cancel);
      resolve();
    };
    const timer = setTimeout(finish, duration);
    const cancel = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
      reject(Object.assign(new Error("Execution cancelled"), { name: "AbortError" }));
    };
    if (signal?.aborted) cancel();
    else signal?.addEventListener("abort", cancel, { once: true });
  });

  try {
    if (signal?.aborted) return failure("cancelled", "Execution was cancelled before submission.", 0);
    const createResponse = await fetchImpl(`${judge0Url}/submissions?base64_encoded=false&wait=false`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language_id: languageId,
        source_code: languageKey === "python" ? buildPythonInstrumentedSource(code) : code,
        stdin: input,
        cpu_time_limit: 3,
        cpu_extra_time: 1,
        wall_time_limit: 6,
        memory_limit: 128000,
        stack_limit: 64000,
        max_processes_and_or_threads: 30,
        enable_network: false,
      }),
      signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(requestTimeout)]),
    });
    if (!createResponse.ok) {
      const details = await responseDetails(createResponse);
      if (createResponse.status === 429) throw Object.assign(new Error("Judge0 is rate limiting submissions. Wait briefly, then retry."), { stage: "rate_limit" });
      if (createResponse.status === 401 || createResponse.status === 403) throw Object.assign(new Error("Judge0 rejected the configured credentials or access policy."), { stage: "provider" });
      if (createResponse.status === 503 || createResponse.status === 502 || createResponse.status === 504) throw Object.assign(new Error("Judge0 is temporarily unavailable or its queue is full. Retry shortly."), { stage: "provider" });
      throw Object.assign(new Error(`Judge0 rejected the submission (HTTP ${createResponse.status})${details ? `: ${details}` : "."}`), { stage: "provider" });
    }
    const submission = await createResponse.json();
    if (typeof submission.token !== "string" || !submission.token) throw Object.assign(new Error("Judge0 returned an invalid submission response."), { stage: "provider" });
    token = submission.token;

    const deadline = Date.now() + deadlineMs;
    let result;
    while (Date.now() < deadline) {
      if (signal?.aborted) {
        await cancelRemoteSubmission();
        return failure("cancelled", "Execution was cancelled. Judge0 cancellation was requested; the provider may continue the submission if deletion is unavailable.", Date.now() - startedAt);
      }
      await waitForPoll(pollInterval);
      const pollResponse = await fetchImpl(
        `${judge0Url}/submissions/${encodeURIComponent(token)}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status,time,memory`,
        { headers, signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(requestTimeout)]) }
      );
      if (!pollResponse.ok) {
        const details = await responseDetails(pollResponse);
        if (pollResponse.status === 429) throw Object.assign(new Error("Judge0 is rate limiting status checks. Retry shortly."), { stage: "rate_limit" });
        throw Object.assign(new Error(`Judge0 status check failed (HTTP ${pollResponse.status})${details ? `: ${details}` : "."}`), { stage: "provider" });
      }
      result = await pollResponse.json();
      if (!result || typeof result !== "object" || !Number.isInteger(result.status?.id)) throw Object.assign(new Error("Judge0 returned an invalid execution status."), { stage: "provider" });
      if (result.status?.id > 2) break;
    }
    if (!result || result.status?.id <= 2) {
      await cancelRemoteSubmission();
      return failure("timeout", "Judge0 did not finish before the 20 second execution deadline. The provider may still be processing the submission.", Date.now() - startedAt);
    }

    const output = String(result.stdout || "");
    const rawError = String(result.compile_output || result.stderr || result.message || "");
    const traced = languageKey === "python" ? extractPythonRuntimeTrace(result.stderr || "") : { stderr: String(result.stderr || ""), runtimeTrace: null };
    const error = String(result.compile_output || traced.stderr || result.message || "");
    const judge0Seconds = Number.parseFloat(result.time);
    const executionTime = Number.isFinite(judge0Seconds)
      ? Math.max(0, Math.round(judge0Seconds * 1000))
      : Date.now() - startedAt;
    const outputBytes = Buffer.from(output, "utf8");
    if (outputBytes.length > MAX_OUTPUT) {
      return { success: false, stage: "runtime", output: outputBytes.subarray(0, MAX_OUTPUT).toString("utf8"), error: "Output Limit Exceeded (100 KiB).", executionTime };
    }
    const statusId = result.status.id;
    if (statusId === 5) return { success: false, stage: "timeout", output, error: "Time Limit Exceeded. Judge0 stopped the program after its execution limit.", executionTime };
    if (statusId === 13) return failure("provider", "Judge0 reported an internal execution error. Retry later.", executionTime);
    const accepted = statusId === 3;
    const stage = statusId === 6 ? "compile" : ([7, 8, 9, 10, 11, 12, 14].includes(statusId) ? "runtime" : "provider");
    return {
      success: accepted,
      stage: accepted ? "complete" : stage,
      output,
      stderr: traced.stderr,
      runtimeTrace: traced.runtimeTrace,
      error: accepted ? "" : (error || `Judge0 execution failed: ${result.status?.description || "unknown status"}`),
      executionTime,
    };
  } catch (error) {
    console.error("[sandbox] Remote Judge0 execution failed:", error.message);
    if (signal?.aborted || error?.name === "AbortError") {
      await cancelRemoteSubmission();
      return failure("cancelled", "Execution was cancelled. Judge0 cancellation was requested; the provider may continue the submission if deletion is unavailable.", Date.now() - startedAt);
    }
    return {
      success: false, stage: error.stage || "sandbox", output: "",
      error: error.stage ? error.message : `Could not reach the configured Judge0 service (${error.name === "TimeoutError" ? "request timed out" : "network or provider error"}). Code was not executed locally.`,
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

function sandboxArguments(command, args, cwd, timeoutMs) {
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
    `--cpu=${Math.max(1, Math.ceil(timeoutMs / 1000))}`,
    "--as=536870912",
    "--nproc=32",
    "--fsize=1048576",
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
    let cancelled = false;
    let outputLimitExceeded = false;
    const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : TIME_LIMIT;

    const child = spawn("bwrap", sandboxArguments(command, args, options.cwd, timeoutMs), {
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

    const cancel = () => {
      cancelled = true;
      killProcessTree(child);
    };
    if (options.signal?.aborted) cancel();
    else options.signal?.addEventListener("abort", cancel, { once: true });

    const appendBounded = (current, data) => {
      const totalBytes = Buffer.byteLength(stdout, "utf8") + Buffer.byteLength(stderr, "utf8");
      const remaining = Math.max(0, MAX_OUTPUT - totalBytes);
      const chunk = data.toString("utf8");
      const bounded = Buffer.from(chunk, "utf8").subarray(0, remaining).toString("utf8");
      return { value: current + bounded, exceeded: Buffer.byteLength(chunk, "utf8") > remaining };
    };

    child.stdout.on("data", (data) => {
      const result = appendBounded(stdout, data);
      stdout = result.value;
      if (result.exceeded) {
        outputLimitExceeded = true;
        killProcessTree(child);
      }
    });

    child.stderr.on("data", (data) => {
      const result = appendBounded(stderr, data);
      stderr = result.value;
      if (result.exceeded) {
        outputLimitExceeded = true;
        killProcessTree(child);
      }
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", cancel);
      resolve({
        success: false,
        stdout,
        stderr: error.message,
        timedOut,
        cancelled,
        outputLimitExceeded,
        exitCode: null,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", cancel);
      resolve({
        success: code === 0 && !timedOut && !outputLimitExceeded,
        stdout,
        stderr,
        timedOut,
        cancelled,
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

async function executeCpp(code, input = "", signal) {
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
        signal,
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
        signal,
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

async function executeC(code, input = "", signal) {
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
        signal,
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
        signal,
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

async function executePython(code, input = "", signal) {
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
        signal,
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

async function executeJava(code, input = "", signal) {
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
        signal,
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
        signal,
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

async function executeJavaScript(code, input = "", signal) {
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
        signal,
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

async function executeCode(language, code, input = "", options = {}) {
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
    return executeWithJudge0(language, code, input, options);
  }

  const normalizedLanguage = language
    .toLowerCase()
    .trim();

  if (
    normalizedLanguage === "c++" ||
    normalizedLanguage === "cpp"
  ) {
    return executeCpp(code, input, options.signal);
  }

  if (normalizedLanguage === "c") {
    return executeC(code, input, options.signal);
  }

  if (
    normalizedLanguage === "python" ||
    normalizedLanguage === "py"
  ) {
    return executePython(code, input, options.signal);
  }

  if (normalizedLanguage === "java") {
    return executeJava(code, input, options.signal);
  }

  if (
    normalizedLanguage === "javascript" ||
    normalizedLanguage === "js" ||
    normalizedLanguage === "node"
  ) {
    return executeJavaScript(code, input, options.signal);
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
  executeWithJudge0,
  getRuntimeAvailability,
};


