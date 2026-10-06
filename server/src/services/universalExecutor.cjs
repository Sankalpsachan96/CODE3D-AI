
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

function getRuntimeAvailability() {
  return {
    javascript: Boolean(process.execPath),
    cpp: commandAvailable("g++"),
    c: commandAvailable("gcc"),
    python: Boolean(getPythonCommand()),
    java: commandAvailable("javac") && commandAvailable("java"),
    nodeVersion: process.version,
  };
}

function createTempDirectory() {
  const id = crypto.randomBytes(8).toString("hex");
  const directory = path.join(os.tmpdir(), `code3d-${id}`);

  fs.mkdirSync(directory, { recursive: true });

  return directory;
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: false,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let outputLimitExceeded = false;

    const timeoutMs = Number.isFinite(options.timeoutMs)
      ? options.timeoutMs
      : TIME_LIMIT;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    child.stdout.on("data", (data) => {
      stdout += data.toString();

      if (Buffer.byteLength(stdout, "utf8") > MAX_OUTPUT) {
        outputLimitExceeded = true;
        child.kill();
      }
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();

      if (Buffer.byteLength(stderr, "utf8") > MAX_OUTPUT) {
        outputLimitExceeded = true;
        child.kill();
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
        success:
          code === 0 &&
          !timedOut &&
          !outputLimitExceeded,

        stdout,
        stderr,
        timedOut,
        outputLimitExceeded,
        exitCode: code,
      });
    });

    if (options.input) {
      child.stdin.write(options.input);
    }

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


