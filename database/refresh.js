require("dotenv").config();

const { spawn } = require("child_process");

const runScript = (scriptPath) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      stdio: "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${scriptPath} failed with exit code ${code}`));
    });
  });

const run = async () => {
  try {
    await runScript("database/reset.js");
    await runScript("database/migrate.js");
    await runScript("database/seed.js");
    console.log("Database refresh completed successfully");
  } catch (error) {
    console.error("Database refresh failed");
    console.error(error);
    process.exitCode = 1;
  }
};

run();
