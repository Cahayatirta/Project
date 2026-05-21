require("dotenv").config();

const fs = require("fs");
const path = require("path");

const db = require("../src/config/database");

const migrationsDirectory = path.join(__dirname, "migrations");

const ensureMigrationsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
};

const getExecutedMigrations = async () => {
  const result = await db.query("SELECT filename FROM schema_migrations ORDER BY filename ASC");
  return new Set(result.rows.map((row) => row.filename));
};

const getMigrationFiles = () =>
  fs
    .readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith(".sql"))
    .sort((first, second) => first.localeCompare(second));

const run = async () => {
  const client = await db.pool.connect();

  try {
    await ensureMigrationsTable();
    const executed = await getExecutedMigrations();
    const files = getMigrationFiles();

    for (const file of files) {
      if (executed.has(file)) {
        console.log(`Skipping ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDirectory, file), "utf8");

      console.log(`Running ${file}`);
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`Completed ${file}`);
    }

    console.log("Database migrations finished");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed");
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.pool.end();
  }
};

run();
