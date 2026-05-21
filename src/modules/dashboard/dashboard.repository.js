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

const getHistoriesForLastThirtyDays = async (userId, endDate) => {
  const result = await db.query(
    `
      SELECT *
      FROM histories
      WHERE id_user = $1
        AND date BETWEEN ($2::date - INTERVAL '29 day') AND $2::date
      ORDER BY date ASC
    `,
    [userId, endDate]
  );

  return result.rows;
};

module.exports = { getDailyActivity, getHistoriesForLastThirtyDays };
