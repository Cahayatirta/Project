const db = require("../../config/database");

const getDailyActivity = async (userId, date) => {
  const result = await db.query(
    `
      SELECT *
      FROM histories
      WHERE id_user = $1 AND date = $2
    `,
    [userId, date]
  );

  return result.rows[0] || null;
};

const getHistoriesByDateRange = async (userId, startDate, endDate) => {
  const result = await db.query(
    `
      SELECT *
      FROM histories
      WHERE id_user = $1
        AND date BETWEEN $2::date AND $3::date
      ORDER BY date ASC
    `,
    [userId, startDate, endDate]
  );

  return result.rows;
};

module.exports = { getDailyActivity, getHistoriesByDateRange };
