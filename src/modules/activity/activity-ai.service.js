const path = require("path");
const { spawnSync } = require("child_process");

const { ApiError } = require("../../utils/api-error");

const scriptPath = path.join(__dirname, "predict_stress.py");

const predictStressFromActivity = (payload) => {
  const pythonCommand = process.env.AI_PYTHON_COMMAND || "python";
  const result = spawnSync(pythonCommand, [scriptPath], {
    input: JSON.stringify(payload),
    encoding: "utf8",
    timeout: 60000,
    maxBuffer: 1024 * 1024 * 5,
  });

  if (result.error) {
    throw new ApiError(500, `AI prediction failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const errorMessage = (result.stderr || result.stdout || "Unknown AI prediction error").trim();
    throw new ApiError(500, `AI prediction failed: ${errorMessage}`);
  }

  try {
    return JSON.parse(result.stdout);
  } catch (_error) {
    throw new ApiError(500, "AI prediction returned an invalid response");
  }
};

module.exports = { predictStressFromActivity };
