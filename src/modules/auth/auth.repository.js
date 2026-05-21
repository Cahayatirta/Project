const db = require("../../config/database");

const userSelect = `
  SELECT
    id,
    name,
    email_address,
    password,
    birth_date,
    gender,
    job,
    work_location,
    hobby,
    created_at,
    updated_at
  FROM users
`;

const findUserByEmail = async (email) => {
  const result = await db.query(
    `${userSelect} WHERE email_address = $1`,
    [email]
  );

  return result.rows[0] || null;
};

const createUser = async ({
  name,
  emailAddress,
  password,
  birthDate,
  gender,
  job,
  workLocation,
  hobby,
}) => {
  const result = await db.query(
    `
      INSERT INTO users (
        name,
        email_address,
        password,
        birth_date,
        gender,
        job,
        work_location,
        hobby
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        name,
        email_address,
        birth_date,
        gender,
        job,
        work_location,
        hobby,
        created_at,
        updated_at
    `,
    [name, emailAddress, password, birthDate || null, gender || null, job || null, workLocation || null, hobby || null]
  );

  return result.rows[0];
};

module.exports = { findUserByEmail, createUser };
