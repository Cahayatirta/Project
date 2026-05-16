const db = require("../../config/database");

const findUserById = async (id) => {
  const result = await db.query(
    `
      SELECT id, full_name, email, role, created_at, updated_at
      FROM users
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

module.exports = { findUserById };
