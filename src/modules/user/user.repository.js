const db = require("../../config/database");

const findUserById = async (id) => {
  const result = await db.query(
    `
      SELECT
        id,
        name,
        username,
        email_address,
        birth_date,
        gender,
        job,
        work_location,
        hobby,
        biodata,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

const updateUserById = async (id, payload) => {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return findUserById(id);
  }

  const assignments = entries.map(([key], index) => `${key} = $${index + 2}`);
  const values = entries.map(([, value]) => value);

  const result = await db.query(
    `
      UPDATE users
      SET ${assignments.join(", ")}
      WHERE id = $1
      RETURNING
        id,
        name,
        username,
        email_address,
        birth_date,
        gender,
        job,
        work_location,
        hobby,
        biodata,
        created_at,
        updated_at
    `,
    [id, ...values]
  );

  return result.rows[0] || null;
};

const findUserByUsername = async (username) => {
  const result = await db.query(
    `
      SELECT
        id,
        name,
        username,
        email_address,
        birth_date,
        gender,
        job,
        work_location,
        hobby,
        biodata,
        created_at,
        updated_at
      FROM users
      WHERE username = $1
    `,
    [username]
  );

  return result.rows[0] || null;
};

module.exports = { findUserById, updateUserById, findUserByUsername };
