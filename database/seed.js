require("dotenv").config();

const bcrypt = require("bcryptjs");

const db = require("../src/config/database");

const users = [
  {
    id: "8d6bb8a1-8d1c-4c0e-a8c1-111111111111",
    name: "Cahaya Tirta",
    emailAddress: "cahaya@example.com",
    password: "password123",
    birthDate: "2000-01-01",
    gender: "male",
    job: "Backend Engineer",
    workLocation: "hybrid",
    hobby: "Reading",
  },
  {
    id: "8d6bb8a1-8d1c-4c0e-a8c1-222222222222",
    name: "Friend Account",
    emailAddress: "friend@example.com",
    password: "password123",
    birthDate: "2001-02-01",
    gender: "female",
    job: "Designer",
    workLocation: "on_site",
    hobby: "Music",
  },
  {
    id: "8d6bb8a1-8d1c-4c0e-a8c1-333333333333",
    name: "Sarah Johnson",
    emailAddress: "sarah@example.com",
    password: "password123",
    birthDate: "1999-07-11",
    gender: "female",
    job: "Product Manager",
    workLocation: "anywhere",
    hobby: "Yoga",
  },
  {
    id: "8d6bb8a1-8d1c-4c0e-a8c1-444444444444",
    name: "Michael Chen",
    emailAddress: "michael@example.com",
    password: "password123",
    birthDate: "1998-05-21",
    gender: "male",
    job: "Data Analyst",
    workLocation: "hybrid",
    hobby: "Gaming",
  },
];

const histories = [
  {
    id: "f1a11111-1111-4111-8111-111111111111",
    idUser: users[0].id,
    date: "2026-05-20",
    screenTime: 7.5,
    sleepHours: 6.0,
    stressLevel: 7.2,
    wellnessIndex: 5.1,
    sleepQuality: 5.3,
    fatigueScore: 7.0,
    digitalBalance: 4.2,
    screenTimeCategory: "high",
    physicalActivity: "walking",
    caffeineIntake: 2,
    workHours: 9,
    mood: "tired",
    createdAt: "2026-05-20T08:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-222222222222",
    idUser: users[0].id,
    date: "2026-05-21",
    screenTime: 6.5,
    sleepHours: 6.8,
    stressLevel: 5.8,
    wellnessIndex: 6.0,
    sleepQuality: 6.1,
    fatigueScore: 5.9,
    digitalBalance: 5.4,
    screenTimeCategory: "high",
    physicalActivity: "light jog",
    caffeineIntake: 2,
    workHours: 8.5,
    mood: "better",
    createdAt: "2026-05-21T08:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-333333333333",
    idUser: users[0].id,
    date: "2026-05-22",
    screenTime: 5.8,
    sleepHours: 7.2,
    stressLevel: 4.0,
    wellnessIndex: 6.8,
    sleepQuality: 6.7,
    fatigueScore: 4.2,
    digitalBalance: 6.0,
    screenTimeCategory: "medium",
    physicalActivity: "cycling",
    caffeineIntake: 1,
    workHours: 8,
    mood: "calm",
    createdAt: "2026-05-22T08:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-444444444444",
    idUser: users[1].id,
    date: "2026-05-20",
    screenTime: 4.5,
    sleepHours: 8.1,
    stressLevel: 2.6,
    wellnessIndex: 8.0,
    sleepQuality: 8.2,
    fatigueScore: 3.0,
    digitalBalance: 7.8,
    screenTimeCategory: "medium",
    physicalActivity: "pilates",
    caffeineIntake: 1,
    workHours: 7,
    mood: "good",
    createdAt: "2026-05-20T09:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-555555555555",
    idUser: users[1].id,
    date: "2026-05-21",
    screenTime: 4.0,
    sleepHours: 8.0,
    stressLevel: 2.0,
    wellnessIndex: 8.3,
    sleepQuality: 8.0,
    fatigueScore: 2.8,
    digitalBalance: 8.1,
    screenTimeCategory: "medium",
    physicalActivity: "yoga",
    caffeineIntake: 1,
    workHours: 7,
    mood: "great",
    createdAt: "2026-05-21T09:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-666666666666",
    idUser: users[2].id,
    date: "2026-05-21",
    screenTime: 3.8,
    sleepHours: 8.4,
    stressLevel: 2.4,
    wellnessIndex: 8.5,
    sleepQuality: 8.4,
    fatigueScore: 2.9,
    digitalBalance: 8.2,
    screenTimeCategory: "low",
    physicalActivity: "stretching",
    caffeineIntake: 1,
    workHours: 6.5,
    mood: "relaxed",
    createdAt: "2026-05-21T06:30:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-777777777777",
    idUser: users[3].id,
    date: "2026-05-21",
    screenTime: 8.5,
    sleepHours: 5.6,
    stressLevel: 6.5,
    wellnessIndex: 4.9,
    sleepQuality: 5.0,
    fatigueScore: 6.8,
    digitalBalance: 3.9,
    screenTimeCategory: "high",
    physicalActivity: "none",
    caffeineIntake: 4,
    workHours: 10,
    mood: "anxious",
    createdAt: "2026-05-21T11:30:00Z",
  },
];

const socials = [
  {
    id: "a2b22222-2222-4222-8222-111111111111",
    senderId: users[0].id,
    receiverId: users[1].id,
    status: "accepted",
  },
  {
    id: "a2b22222-2222-4222-8222-222222222222",
    senderId: users[0].id,
    receiverId: users[2].id,
    status: "accepted",
  },
  {
    id: "a2b22222-2222-4222-8222-333333333333",
    senderId: users[3].id,
    receiverId: users[0].id,
    status: "pending",
  },
];

const groups = [
  {
    id: "c3c33333-3333-4333-8333-111111111111",
    ownerId: users[0].id,
    groupName: "Inner Circle",
  },
];

const groupMembers = [
  {
    id: "d4d44444-4444-4444-8444-111111111111",
    groupId: groups[0].id,
    userId: users[0].id,
  },
  {
    id: "d4d44444-4444-4444-8444-222222222222",
    groupId: groups[0].id,
    userId: users[1].id,
  },
  {
    id: "d4d44444-4444-4444-8444-333333333333",
    groupId: groups[0].id,
    userId: users[2].id,
  },
];

const groupPermissions = [
  {
    id: "e5e55555-5555-4555-8555-111111111111",
    groupId: groups[0].id,
    canViewScreenTime: true,
    canViewSleepHours: true,
    canViewWellnessIndex: true,
    canViewSleepQuality: true,
    canViewFatigueScore: true,
    canViewDigitalBalance: true,
    canViewScreenTimeCategory: true,
    canViewPhysicalActivity: true,
    canViewCaffeineIntake: true,
    canViewWorkHours: true,
    canViewMood: true,
  },
];

const clearTables = async (client) => {
  await client.query(`
    TRUNCATE TABLE
      group_history_permissions,
      group_members,
      groups,
      socials,
      histories,
      users
    RESTART IDENTITY CASCADE
  `);
};

const insertUsers = async (client) => {
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await client.query(
      `
        INSERT INTO users (
          id,
          name,
          email_address,
          password,
          birth_date,
          gender,
          job,
          work_location,
          hobby
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        user.id,
        user.name,
        user.emailAddress,
        hashedPassword,
        user.birthDate,
        user.gender,
        user.job,
        user.workLocation,
        user.hobby,
      ]
    );
  }
};

const insertHistories = async (client) => {
  for (const history of histories) {
    await client.query(
      `
        INSERT INTO histories (
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
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $16)
      `,
      [
        history.id,
        history.idUser,
        history.date,
        history.screenTime,
        history.sleepHours,
        history.stressLevel,
        history.wellnessIndex,
        history.sleepQuality,
        history.fatigueScore,
        history.digitalBalance,
        history.screenTimeCategory,
        history.physicalActivity,
        history.caffeineIntake,
        history.workHours,
        history.mood,
        history.createdAt,
      ]
    );
  }
};

const insertSocials = async (client) => {
  for (const social of socials) {
    await client.query(
      `
        INSERT INTO socials (
          id,
          user_sender_id,
          user_receiver_id,
          status
        )
        VALUES ($1, $2, $3, $4)
      `,
      [social.id, social.senderId, social.receiverId, social.status]
    );
  }
};

const insertGroups = async (client) => {
  for (const group of groups) {
    await client.query(
      `
        INSERT INTO groups (id, id_user, group_name)
        VALUES ($1, $2, $3)
      `,
      [group.id, group.ownerId, group.groupName]
    );
  }
};

const insertGroupMembers = async (client) => {
  for (const member of groupMembers) {
    await client.query(
      `
        INSERT INTO group_members (id, id_group, id_user)
        VALUES ($1, $2, $3)
      `,
      [member.id, member.groupId, member.userId]
    );
  }
};

const insertGroupPermissions = async (client) => {
  for (const permission of groupPermissions) {
    await client.query(
      `
        INSERT INTO group_history_permissions (
          id,
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `,
      [
        permission.id,
        permission.groupId,
        permission.canViewScreenTime,
        permission.canViewSleepHours,
        permission.canViewWellnessIndex,
        permission.canViewSleepQuality,
        permission.canViewFatigueScore,
        permission.canViewDigitalBalance,
        permission.canViewScreenTimeCategory,
        permission.canViewPhysicalActivity,
        permission.canViewCaffeineIntake,
        permission.canViewWorkHours,
        permission.canViewMood,
      ]
    );
  }
};

const run = async () => {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");
    await clearTables(client);
    await insertUsers(client);
    await insertHistories(client);
    await insertSocials(client);
    await insertGroups(client);
    await insertGroupMembers(client);
    await insertGroupPermissions(client);
    await client.query("COMMIT");

    console.log("Database seeded successfully");
    console.log("Primary user: cahaya@example.com / password123");
    console.log("Friend user: friend@example.com / password123");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seeding failed");
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.pool.end();
  }
};

run();
