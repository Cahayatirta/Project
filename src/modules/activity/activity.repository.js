const db = require("../../config/database");

const historyColumns = `
  id,
  id_user,
  date,
  screen_time,
  sleep_hours,
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING ${historyColumns}
    `,
    [
      payload.idUser,
      payload.date,
      payload.screenTime,
      payload.sleepHours,
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
        ROUND(AVG(stress_level)::numeric, 2) AS avg_stress_level,
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

module.exports = {
  createHistory,
  findHistoryById,
  updateHistoryById,
  findHistoryByUserAndDate,
  findHistoriesByRange,
  getAverageFactorsByRange,
};
