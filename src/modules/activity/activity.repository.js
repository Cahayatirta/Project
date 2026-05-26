const db = require("../../config/database");

const historyColumns = `
  id,
  id_user,
  date,
  screen_time,
  sleep_hours,
  stress_status,
  stress_level,
  wellness_index,
  sleep_quality,
  fatigue_score,
  digital_balance,
  screen_time_category,
  physical_activity,
  caffeine_intake,
  work_hours,
  mood,
  created_at,
  updated_at
`;

const createHistory = async (payload) => {
  const result = await db.query(
    `
      INSERT INTO histories (
        id_user,
        date,
        screen_time,
        sleep_hours,
        stress_status,
        stress_level,
        wellness_index,
        sleep_quality,
        fatigue_score,
        digital_balance,
        screen_time_category,
        physical_activity,
        caffeine_intake,
        work_hours,
        mood
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING ${historyColumns}
    `,
    [
      payload.idUser,
      payload.date,
      payload.screenTime,
      payload.sleepHours,
      payload.stressStatus,
      payload.stressLevel,
      payload.wellnessIndex,
      payload.sleepQuality,
      payload.fatigueScore,
      payload.digitalBalance,
      payload.screenTimeCategory,
      payload.physicalActivity,
      payload.caffeineIntake,
      payload.workHours,
      payload.mood,
    ]
  );

  return result.rows[0];
};

const findHistoryById = async (id) => {
  const result = await db.query(
    `SELECT ${historyColumns} FROM histories WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
};

const updateHistoryById = async (id, payload) => {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return findHistoryById(id);
  }

  const assignments = entries.map(([key], index) => `${key} = $${index + 2}`);
  const values = entries.map(([, value]) => value);
  const result = await db.query(
    `
      UPDATE histories
      SET ${assignments.join(", ")}
      WHERE id = $1
      RETURNING ${historyColumns}
    `,
    [id, ...values]
  );

  return result.rows[0] || null;
};

const findHistoryByUserAndDate = async (userId, date) => {
  const result = await db.query(
    `SELECT ${historyColumns} FROM histories WHERE id_user = $1 AND date = $2`,
    [userId, date]
  );

  return result.rows[0] || null;
};

const findHistoriesByRange = async (userId, startDate, endDate) => {
  const result = await db.query(
    `
      SELECT ${historyColumns}
      FROM histories
      WHERE id_user = $1 AND date BETWEEN $2 AND $3
      ORDER BY date ASC
    `,
    [userId, startDate, endDate]
  );

  return result.rows;
};

const getAverageFactorsByRange = async (userId, startDate, endDate) => {
  const result = await db.query(
    `
      SELECT
        ROUND(AVG(screen_time)::numeric, 2) AS avg_screen_time,
        ROUND(AVG(sleep_hours)::numeric, 2) AS avg_sleep_hours,
        MODE() WITHIN GROUP (ORDER BY stress_status) AS dominant_stress_status,
        ROUND(AVG(wellness_index)::numeric, 2) AS avg_wellness_index,
        ROUND(AVG(sleep_quality)::numeric, 2) AS avg_sleep_quality,
        ROUND(AVG(fatigue_score)::numeric, 2) AS avg_fatigue_score,
        ROUND(AVG(digital_balance)::numeric, 2) AS avg_digital_balance,
        ROUND(AVG(caffeine_intake)::numeric, 2) AS avg_caffeine_intake,
        ROUND(AVG(work_hours)::numeric, 2) AS avg_work_hours
      FROM histories
      WHERE id_user = $1 AND date BETWEEN $2 AND $3
    `,
    [userId, startDate, endDate]
  );

  return result.rows[0];
};

const getHistoryMonthsByUser = async (userId) => {
  const result = await db.query(
    `
      SELECT
        TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month_path,
        MIN(date) AS first_date,
        MAX(date) AS last_date,
        COUNT(*) AS recorded_days,
        ROUND(AVG(screen_time)::numeric, 2) AS avg_screen_time,
        ROUND(AVG(sleep_hours)::numeric, 2) AS avg_sleep_hours,
        MODE() WITHIN GROUP (ORDER BY stress_status) AS dominant_stress_status
      FROM histories
      WHERE id_user = $1
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY DATE_TRUNC('month', date) DESC
    `,
    [userId]
  );

  return result.rows;
};

const getLatestHistoryDateByUser = async (userId) => {
  const result = await db.query(
    `
      SELECT date
      FROM histories
      WHERE id_user = $1
      ORDER BY date DESC, created_at DESC
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0]?.date || null;
};

module.exports = {
  createHistory,
  findHistoryById,
  updateHistoryById,
  findHistoryByUserAndDate,
  findHistoriesByRange,
  getAverageFactorsByRange,
  getHistoryMonthsByUser,
  getLatestHistoryDateByUser,
};
