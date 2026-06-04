const { spawn } = require("child_process");
const path = require("path");

function startProcess(cwd, scriptName) {
  let command, args, options;

  if (process.platform === "win32") {
    // On Windows, use cmd.exe to properly handle npm scripts
    command = "cmd.exe";
    args = ["/c", "npm", "run", "dev"];
    options = {
      cwd,
      stdio: "inherit",
      shell: true,
    };
  } else {
    // On Unix-like systems, spawn npm directly
    command = "npm";
    args = ["run", "dev"];
    options = {
      cwd,
      stdio: "inherit",
    };
  }

  const child = spawn(command, args, options);

  child.on("error", (err) => {
    console.error(`Failed to start ${scriptName} in ${cwd}:`, err);
    shutdown(1);
  });

  return child;
}

const backend = startProcess(process.cwd(), "Backend");
const frontend = startProcess(path.join(process.cwd(), "Frontend"), "Frontend");

function stopChild(child) {
  if (child && !child.killed) {
    child.kill();
  }
}

function shutdown(code = 0) {
  stopChild(backend);
  stopChild(frontend);
  process.exit(code);
}

backend.on("exit", (code) => {
  if (code && code !== 0) {
    shutdown(code);
  }
});

frontend.on("exit", (code) => {
  if (code && code !== 0) {
    shutdown(code);
  }
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
