const db = require("../../config/database");

const findUserByEmail = async (email) => {
  const result = await db.query(
    `
      SELECT id, full_name, email, password, role, created_at, updated_at
      FROM users
      WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
};

const createUser = async ({ fullName, email, password, role }) => {
  const result = await db.query(
    `
      INSERT INTO users (full_name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, role, created_at, updated_at
    `,
    [fullName, email, password, role]
  );

  return result.rows[0];
};

module.exports = { findUserByEmail, createUser };
