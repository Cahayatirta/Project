const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined) {
    return defaultValue;
  }

  return value === "true";
};

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || "cognicare",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    ssl: parseBoolean(process.env.DB_SSL, false),
  },
};

module.exports = { env };
