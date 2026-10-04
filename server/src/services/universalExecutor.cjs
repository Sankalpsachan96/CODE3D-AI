
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const TIME_LIMIT = 3000;
const MAX_OUTPUT = 100 * 1024;

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

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, TIME_LIMIT);

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
  const tempDirectory = createTempDirectory();

  const sourceFile = path.join(tempDirectory, "main.cpp");
  const executableFile = path.join(tempDirectory, "main.exe");

  try {
    fs.writeFileSync(sourceFile, code, "utf8");

    const compileResult = await runProcess(
      "g++",
      [
        "-std=c++17",
        "-O2",
        sourceFile,
        "-o",
        executableFile,
      ],
      {
        cwd: tempDirectory,
      }
    );

    if (!compileResult.success) {
      return {
        success: false,
        stage: "compile",
        output: "",
        error:
          compileResult.stderr ||
          "C++ compilation failed.",
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
      }
    );

    if (!compileResult.success) {
      return {
        success: false,
        stage: "compile",
        output: "",
        error:
          compileResult.stderr ||
          "C compilation failed.",
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
  const tempDirectory = createTempDirectory();

  const sourceFile = path.join(tempDirectory, "main.py");

  try {
    fs.writeFileSync(sourceFile, code, "utf8");

    const startTime = Date.now();

    const executionResult = await runProcess(
      "python",
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
  const tempDirectory = createTempDirectory();

  const sourceFile = path.join(tempDirectory, "Main.java");

  try {
    fs.writeFileSync(sourceFile, code, "utf8");

    const compileResult = await runProcess(
      "javac",
      [sourceFile],
      {
        cwd: tempDirectory,
      }
    );

    if (!compileResult.success) {
      return {
        success: false,
        stage: "compile",
        output: "",
        error:
          compileResult.stderr ||
          "Java compilation failed.",
        executionTime: null,
      };
    }

    const startTime = Date.now();

    const executionResult = await runProcess(
      "java",
      ["-cp", tempDirectory, "Main"],
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
};


