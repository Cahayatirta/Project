const db = require("../../config/database");

const insertGroupWithDefaults = async (client, ownerId, groupName, isDefault = false, description = null) => {
  const groupResult = await client.query(
    `
      INSERT INTO groups (id_user, group_name, is_default, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, id_user, group_name, is_default, description, created_at, updated_at
    `,
    [ownerId, groupName, isDefault, description]
  );

  const group = groupResult.rows[0];

  await client.query(
    `
      INSERT INTO group_members (id_group, id_user)
      VALUES ($1, $2)
      ON CONFLICT (id_group, id_user) DO NOTHING
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
      ON CONFLICT (id_group) DO NOTHING
    `,
    [group.id]
  );

  return group;
};

const createGroupWithDefaults = async (ownerId, groupName, description = null) => {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");
    const group = await insertGroupWithDefaults(client, ownerId, groupName, false, description);

    await client.query("COMMIT");
    return group;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const createDefaultGroupForUser = async (ownerId) => {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");
    const existing = await client.query(
      `
        SELECT id, id_user, group_name, is_default, description, created_at, updated_at
        FROM groups
        WHERE id_user = $1 AND is_default = true
        LIMIT 1
      `,
      [ownerId]
    );

    if (existing.rows[0]) {
      await client.query("COMMIT");
      return existing.rows[0];
    }

    const group = await insertGroupWithDefaults(
      client,
      ownerId,
      "Friends",
      true,
      "Default group for accepted friends who are not placed in a custom group yet."
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
      SELECT id, id_user, group_name, is_default, description, created_at, updated_at
      FROM groups
      WHERE id = $1
    `,
    [groupId]
  );

  return result.rows[0] || null;
};

const findDefaultGroupByOwnerId = async (ownerId) => {
  const result = await db.query(
    `
      SELECT id, id_user, group_name, is_default, description, created_at, updated_at
      FROM groups
      WHERE id_user = $1 AND is_default = true
      LIMIT 1
    `,
    [ownerId]
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

const addGroupMemberIfNotExists = async (groupId, userId) => {
  const result = await db.query(
    `
      INSERT INTO group_members (id_group, id_user)
      VALUES ($1, $2)
      ON CONFLICT (id_group, id_user) DO NOTHING
      RETURNING id
    `,
    [groupId, userId]
  );

  return result.rows[0] || null;
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

const listGroupsByOwnerId = async (ownerId) => {
  const result = await db.query(
    `
      SELECT
        g.id,
        g.id_user,
        g.group_name,
        g.is_default,
        g.description,
        g.created_at,
        g.updated_at,
        COUNT(gm.id_user) FILTER (WHERE gm.id_user <> g.id_user) AS member_count,
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
      LEFT JOIN group_members gm ON gm.id_group = g.id
      LEFT JOIN group_history_permissions p ON p.id_group = g.id
      WHERE g.id_user = $1
      GROUP BY
        g.id,
        g.id_user,
        g.group_name,
        g.is_default,
        g.description,
        g.created_at,
        g.updated_at,
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
      ORDER BY g.is_default DESC, g.group_name ASC
    `,
    [ownerId]
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
  createDefaultGroupForUser,
  findGroupById,
  findDefaultGroupByOwnerId,
  findGroupMember,
  addGroupMember,
  addGroupMemberIfNotExists,
  removeGroupMember,
  listGroupMembers,
  listGroupsByOwnerId,
  getGroupPermission,
  updateGroupPermission,
};
