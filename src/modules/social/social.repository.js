const db = require("../../config/database");

const socialSelect = `
  SELECT
    s.id,
    s.user_sender_id,
    s.user_receiver_id,
    s.status,
    s.created_at,
    s.updated_at,
    sender.name AS sender_name,
    sender.username AS sender_username,
    sender.email_address AS sender_email_address,
    receiver.name AS receiver_name,
    receiver.username AS receiver_username,
    receiver.email_address AS receiver_email_address
  FROM socials s
  JOIN users sender ON sender.id = s.user_sender_id
  JOIN users receiver ON receiver.id = s.user_receiver_id
`;

const findUserByEmail = async (emailAddress) => {
  const result = await db.query(
    `SELECT id, name, username, email_address, biodata FROM users WHERE email_address = $1`,
    [emailAddress]
  );

  return result.rows[0] || null;
};

const findSocialBetweenUsers = async (firstUserId, secondUserId) => {
  const result = await db.query(
    `
      ${socialSelect}
      WHERE
        (s.user_sender_id = $1 AND s.user_receiver_id = $2)
        OR
        (s.user_sender_id = $2 AND s.user_receiver_id = $1)
    `,
    [firstUserId, secondUserId]
  );

  return result.rows[0] || null;
};

const findSocialById = async (socialId) => {
  const result = await db.query(
    `
      ${socialSelect}
      WHERE s.id = $1
    `,
    [socialId]
  );

  return result.rows[0] || null;
};

const createFriendRequest = async (senderId, receiverId) => {
  const result = await db.query(
    `
      INSERT INTO socials (user_sender_id, user_receiver_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING id
    `,
    [senderId, receiverId]
  );

  return result.rows[0];
};

const updateSocialStatus = async (socialId, status) => {
  const result = await db.query(
    `
      UPDATE socials
      SET status = $2
      WHERE id = $1
      RETURNING id
    `,
    [socialId, status]
  );

  return result.rows[0] || null;
};

const getPendingRequests = async (userId) => {
  const result = await db.query(
    `${socialSelect} WHERE s.user_receiver_id = $1 AND s.status = 'pending' ORDER BY s.created_at DESC`,
    [userId]
  );

  return result.rows;
};

const getAcceptedFriends = async (userId) => {
  const result = await db.query(
    `
      SELECT
        s.id,
        s.status,
        s.created_at,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.id
          ELSE sender.id
        END AS friend_id,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.name
          ELSE sender.name
        END AS friend_name,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.username
          ELSE sender.username
        END AS friend_username,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.email_address
          ELSE sender.email_address
        END AS friend_email_address,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.job
          ELSE sender.job
        END AS friend_job,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.work_location
          ELSE sender.work_location
        END AS friend_work_location,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.hobby
          ELSE sender.hobby
        END AS friend_hobby,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.biodata
          ELSE sender.biodata
        END AS friend_biodata,
        last_history.date AS last_activity_date,
        last_history.created_at AS last_activity_created_at,
        last_history.stress_status AS last_stress_status
      FROM socials s
      JOIN users sender ON sender.id = s.user_sender_id
      JOIN users receiver ON receiver.id = s.user_receiver_id
      LEFT JOIN LATERAL (
        SELECT h.date, h.created_at, h.stress_status
        FROM histories h
        WHERE h.id_user = CASE
          WHEN s.user_sender_id = $1 THEN s.user_receiver_id
          ELSE s.user_sender_id
        END
        ORDER BY h.created_at DESC, h.date DESC
        LIMIT 1
      ) last_history ON true
      WHERE (s.user_sender_id = $1 OR s.user_receiver_id = $1)
        AND s.status = 'accepted'
      ORDER BY friend_name ASC
    `,
    [userId]
  );

  return result.rows;
};

const getAcceptedFriendById = async (userId, friendId) => {
  const result = await db.query(
    `
      SELECT
        s.id,
        s.status,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.id
          ELSE sender.id
        END AS friend_id,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.name
          ELSE sender.name
        END AS friend_name,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.username
          ELSE sender.username
        END AS friend_username,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.email_address
          ELSE sender.email_address
        END AS friend_email_address,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.job
          ELSE sender.job
        END AS friend_job,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.work_location
          ELSE sender.work_location
        END AS friend_work_location,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.hobby
          ELSE sender.hobby
        END AS friend_hobby,
        CASE
          WHEN s.user_sender_id = $1 THEN receiver.biodata
          ELSE sender.biodata
        END AS friend_biodata,
        last_history.date AS last_activity_date,
        last_history.created_at AS last_activity_created_at,
        last_history.stress_status AS last_stress_status
      FROM socials s
      JOIN users sender ON sender.id = s.user_sender_id
      JOIN users receiver ON receiver.id = s.user_receiver_id
      LEFT JOIN LATERAL (
        SELECT h.date, h.created_at, h.stress_status
        FROM histories h
        WHERE h.id_user = CASE
          WHEN s.user_sender_id = $1 THEN s.user_receiver_id
          ELSE s.user_sender_id
        END
        ORDER BY h.created_at DESC, h.date DESC
        LIMIT 1
      ) last_history ON true
      WHERE (s.user_sender_id = $1 OR s.user_receiver_id = $1)
        AND s.status = 'accepted'
        AND (
          CASE
            WHEN s.user_sender_id = $1 THEN s.user_receiver_id
            ELSE s.user_sender_id
          END
        ) = $2
      LIMIT 1
    `,
    [userId, friendId]
  );

  return result.rows[0] || null;
};

const getFriendStats = async (userId) => {
  const result = await db.query(
    `
      WITH latest_friend_histories AS (
        SELECT
          CASE
            WHEN s.user_sender_id = $1 THEN s.user_receiver_id
            ELSE s.user_sender_id
          END AS friend_id,
          latest_history.stress_status
        FROM socials s
        LEFT JOIN LATERAL (
          SELECT h.stress_status
          FROM histories h
          WHERE h.id_user = CASE
            WHEN s.user_sender_id = $1 THEN s.user_receiver_id
            ELSE s.user_sender_id
          END
            AND h.date >= CURRENT_DATE - INTERVAL '30 day'
          ORDER BY h.date DESC, h.created_at DESC
          LIMIT 1
        ) latest_history ON true
        WHERE (s.user_sender_id = $1 OR s.user_receiver_id = $1)
          AND s.status = 'accepted'
      )
      SELECT
        (SELECT COUNT(*) FROM socials WHERE (user_sender_id = $1 OR user_receiver_id = $1) AND status = 'accepted') AS total_friend,
        COUNT(*) FILTER (WHERE stress_status = 'relaxed') AS total_relaxed_friend,
        COUNT(*) FILTER (WHERE stress_status = 'normal') AS total_normal_friend,
        COUNT(*) FILTER (WHERE stress_status = 'exhausted') AS total_exhausted_friend
      FROM latest_friend_histories
    `,
    [userId]
  );

  return result.rows[0];
};

const getPermittedFriendAverages = async (ownerId, groupId, startDate, endDate) => {
  const result = await db.query(
    `
      SELECT
        u.id AS friend_id,
        u.name AS friend_name,
        u.email_address AS friend_email_address,
        ROUND(AVG(h.screen_time)::numeric, 2) AS avg_screen_time,
        ROUND(AVG(h.sleep_hours)::numeric, 2) AS avg_sleep_hours,
        ROUND(AVG(h.wellness_index)::numeric, 2) AS avg_wellness_index,
        ROUND(AVG(h.sleep_quality)::numeric, 2) AS avg_sleep_quality,
        ROUND(AVG(h.fatigue_score)::numeric, 2) AS avg_fatigue_score,
        ROUND(AVG(h.digital_balance)::numeric, 2) AS avg_digital_balance,
        ROUND(AVG(h.caffeine_intake)::numeric, 2) AS avg_caffeine_intake,
        ROUND(AVG(h.work_hours)::numeric, 2) AS avg_work_hours,
        MODE() WITHIN GROUP (ORDER BY h.screen_time_category) AS top_screen_time_category,
        MODE() WITHIN GROUP (ORDER BY h.physical_activity) AS top_physical_activity,
        MODE() WITHIN GROUP (ORDER BY h.mood) AS top_mood,
        p.can_view_screen_time,
        p.can_view_sleep_hours,
        p.can_view_wellness_index,
        p.can_view_sleep_quality,
        p.can_view_fatigue_score,
        p.can_view_digital_balance,
        p.can_view_screen_time_category,
        p.can_view_physical_activity,
        p.can_view_caffeine_intake,
        p.can_view_work_hours,
        p.can_view_mood
      FROM groups g
      JOIN group_members gm ON gm.id_group = g.id
      JOIN users u ON u.id = gm.id_user
      LEFT JOIN histories h ON h.id_user = u.id AND h.date BETWEEN $3 AND $4
      JOIN group_history_permissions p ON p.id_group = g.id
      WHERE g.id = $2
        AND g.id_user = $1
        AND u.id <> $1
      GROUP BY
        u.id,
        u.name,
        u.email_address,
        p.can_view_screen_time,
        p.can_view_sleep_hours,
        p.can_view_wellness_index,
        p.can_view_sleep_quality,
        p.can_view_fatigue_score,
        p.can_view_digital_balance,
        p.can_view_screen_time_category,
        p.can_view_physical_activity,
        p.can_view_caffeine_intake,
        p.can_view_work_hours,
        p.can_view_mood
      ORDER BY u.name ASC
    `,
    [ownerId, groupId, startDate, endDate]
  );

  return result.rows;
};

module.exports = {
  findUserByEmail,
  findSocialBetweenUsers,
  findSocialById,
  createFriendRequest,
  updateSocialStatus,
  getPendingRequests,
  getAcceptedFriends,
  getAcceptedFriendById,
  getFriendStats,
  getPermittedFriendAverages,
};
