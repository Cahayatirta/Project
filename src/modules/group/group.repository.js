const db = require("../../config/database");

const createGroupWithDefaults = async (ownerId, groupName) => {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    const groupResult = await client.query(
      `
        INSERT INTO groups (id_user, group_name)
        VALUES ($1, $2)
        RETURNING id, id_user, group_name, created_at, updated_at
      `,
      [ownerId, groupName]
    );

    const group = groupResult.rows[0];

    await client.query(
      `
        INSERT INTO group_members (id_group, id_user)
        VALUES ($1, $2)
      `,
      [group.id, ownerId]
    );

    await client.query(
      `
        INSERT INTO group_history_permissions (
          id_group,
          can_view_screen_time,
          can_view_sleep_hours,
          can_view_wellness_index,
          can_view_sleep_quality,
          can_view_fatigue_score,
          can_view_digital_balance,
          can_view_screen_time_category,
          can_view_physical_activity,
          can_view_caffeine_intake,
          can_view_work_hours,
          can_view_mood
        )
        VALUES ($1, false, false, false, false, false, false, false, false, false, false, false)
      `,
      [group.id]
    );

    await client.query("COMMIT");
    return group;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const findGroupById = async (groupId) => {
  const result = await db.query(
    `
      SELECT id, id_user, group_name, created_at, updated_at
      FROM groups
      WHERE id = $1
    `,
    [groupId]
  );

  return result.rows[0] || null;
};

const findGroupMember = async (groupId, userId) => {
  const result = await db.query(
    `SELECT id FROM group_members WHERE id_group = $1 AND id_user = $2`,
    [groupId, userId]
  );

  return result.rows[0] || null;
};

const addGroupMember = async (groupId, userId) => {
  const result = await db.query(
    `
      INSERT INTO group_members (id_group, id_user)
      VALUES ($1, $2)
      RETURNING id
    `,
    [groupId, userId]
  );

  return result.rows[0];
};

const removeGroupMember = async (groupId, userId) => {
  await db.query(
    `DELETE FROM group_members WHERE id_group = $1 AND id_user = $2`,
    [groupId, userId]
  );
};

const listGroupMembers = async (groupId) => {
  const result = await db.query(
    `
      SELECT u.id, u.name, u.email_address, gm.created_at
      FROM group_members gm
      JOIN users u ON u.id = gm.id_user
      WHERE gm.id_group = $1
      ORDER BY u.name ASC
    `,
    [groupId]
  );

  return result.rows;
};

const getGroupPermission = async (groupId) => {
  const result = await db.query(
    `
      SELECT *
      FROM group_history_permissions
      WHERE id_group = $1
    `,
    [groupId]
  );

  return result.rows[0] || null;
};

const updateGroupPermission = async (groupId, payload) => {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return getGroupPermission(groupId);
  }

  const assignments = entries.map(([key], index) => `${key} = $${index + 2}`);
  const values = entries.map(([, value]) => value);

  const result = await db.query(
    `
      UPDATE group_history_permissions
      SET ${assignments.join(", ")}
      WHERE id_group = $1
      RETURNING *
    `,
    [groupId, ...values]
  );

  return result.rows[0] || null;
};

module.exports = {
  createGroupWithDefaults,
  findGroupById,
  findGroupMember,
  addGroupMember,
  removeGroupMember,
  listGroupMembers,
  getGroupPermission,
  updateGroupPermission,
};
