const db = require("../../config/database");

const userSelect = `
  SELECT
    id,
    name,
    username,
    email_address,
    password,
    birth_date,
    gender,
    job,
    work_location,
    hobby,
    biodata,
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

const findUserByUsername = async (username) => {
  const result = await db.query(
    `${userSelect} WHERE username = $1`,
    [username]
  );

  return result.rows[0] || null;
};

const createUser = async ({
  name,
  username,
  emailAddress,
  password,
  birthDate,
  gender,
  job,
  workLocation,
  hobby,
  biodata,
}) => {
  const result = await db.query(
    `
      INSERT INTO users (
        name,
        username,
        email_address,
        password,
        birth_date,
        gender,
        job,
        work_location,
        hobby,
        biodata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
    [
      name,
      username,
      emailAddress,
      password,
      birthDate || null,
      gender || null,
      job || null,
      workLocation || null,
      hobby || null,
      biodata || null,
    ]
  );

  return result.rows[0];
};

module.exports = { findUserByEmail, findUserByUsername, createUser };
