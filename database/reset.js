require("dotenv").config();

const db = require("../src/config/database");

const run = async () => {
  const client = await db.pool.connect();

  try {
    console.log("Resetting database schema...");
    await client.query("BEGIN");
    await client.query("DROP SCHEMA IF EXISTS public CASCADE");
    await client.query("CREATE SCHEMA public");
    await client.query("GRANT ALL ON SCHEMA public TO public");
    await client.query("GRANT ALL ON SCHEMA public TO CURRENT_USER");
    await client.query("COMMIT");
    console.log("Database schema reset successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database reset failed");
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.pool.end();
  }
};

run();
