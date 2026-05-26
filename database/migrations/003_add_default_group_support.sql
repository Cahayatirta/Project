ALTER TABLE groups
ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_owner_default
ON groups(id_user)
WHERE is_default = true;

INSERT INTO groups (id_user, group_name, is_default)
SELECT u.id, 'Friends', true
FROM users u
WHERE NOT EXISTS (
  SELECT 1
  FROM groups g
  WHERE g.id_user = u.id
    AND g.is_default = true
);

INSERT INTO group_members (id_group, id_user)
SELECT g.id, g.id_user
FROM groups g
WHERE g.is_default = true
  AND NOT EXISTS (
    SELECT 1
    FROM group_members gm
    WHERE gm.id_group = g.id
      AND gm.id_user = g.id_user
  );

INSERT INTO group_history_permissions (id_group)
SELECT g.id
FROM groups g
WHERE g.is_default = true
  AND NOT EXISTS (
    SELECT 1
    FROM group_history_permissions p
    WHERE p.id_group = g.id
  );

INSERT INTO group_members (id_group, id_user)
SELECT g.id, friend.friend_id
FROM groups g
JOIN LATERAL (
  SELECT CASE
    WHEN s.user_sender_id = g.id_user THEN s.user_receiver_id
    ELSE s.user_sender_id
  END AS friend_id
  FROM socials s
  WHERE (s.user_sender_id = g.id_user OR s.user_receiver_id = g.id_user)
    AND s.status = 'accepted'
) friend ON true
WHERE g.is_default = true
  AND NOT EXISTS (
    SELECT 1
    FROM group_members gm
    WHERE gm.id_group = g.id
      AND gm.id_user = friend.friend_id
  );
