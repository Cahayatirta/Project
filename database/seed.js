require("dotenv").config();

const bcrypt = require("bcryptjs");

const db = require("../src/config/database");
const { deriveStressStatusFromLegacyScore } = require("../src/utils/stress");

const users = [
  {
    id: "8d6bb8a1-8d1c-4c0e-a8c1-111111111111",
    name: "Cahaya Tirta",
    username: "cahayatirta",
    emailAddress: "cahaya@example.com",
    password: "password123",
    birthDate: "2000-01-01",
    gender: "male",
    job: "Backend Engineer",
    workLocation: "hybrid",
    hobby: "Reading and walking",
    biodata: "Backend engineer who enjoys shipping features with a calm daily rhythm and evening walks.",
  },
  {
    id: "8d6bb8a1-8d1c-4c0e-a8c1-222222222222",
    name: "Friend Account",
    username: "friendaccount",
    emailAddress: "friend@example.com",
    password: "password123",
    birthDate: "2001-02-01",
    gender: "female",
    job: "Designer",
    workLocation: "on_site",
    hobby: "Music and journaling",
    biodata: "Designer who keeps a balanced schedule and likes slow evenings.",
  },
  {
    id: "8d6bb8a1-8d1c-4c0e-a8c1-333333333333",
    name: "Sarah Johnson",
    username: "sarahjohnson",
    emailAddress: "sarah@example.com",
    password: "password123",
    birthDate: "1999-07-11",
    gender: "female",
    job: "Product Designer",
    workLocation: "anywhere",
    hobby: "Morning walk and journaling",
    biodata: "Sarah keeps a steady routine with short screen breaks, consistent sleep, and light activity after work.",
  },
  {
    id: "8d6bb8a1-8d1c-4c0e-a8c1-444444444444",
    name: "Michael Chen",
    username: "michaelchen",
    emailAddress: "michael@example.com",
    password: "password123",
    birthDate: "1998-05-21",
    gender: "male",
    job: "Data Analyst",
    workLocation: "hybrid",
    hobby: "Gaming",
    biodata: "Data analyst navigating busy weekdays and trying to recover better on weekends.",
  },
  {
    id: "8d6bb8a1-8d1c-4c0e-a8c1-555555555555",
    name: "Nadia Putri",
    username: "nadiaputri",
    emailAddress: "nadia@example.com",
    password: "password123",
    birthDate: "2002-03-14",
    gender: "female",
    job: "QA Engineer",
    workLocation: "hybrid",
    hobby: "Badminton and baking",
    biodata: "QA engineer who likes structured routines, badminton on weekends, and keeping stress levels in check.",
  },
];

const histories = [
  {
    id: "f1a11111-1111-4111-8111-111111111111",
    idUser: users[0].id,
    date: "2026-04-28",
    screenTime: 9.2,
    sleepHours: 5.5,
    stressLevel: 8.2,
    wellnessIndex: 4.8,
    sleepQuality: 4.9,
    fatigueScore: 8.0,
    digitalBalance: 3.7,
    screenTimeCategory: "high",
    physicalActivity: "0 min",
    caffeineIntake: 4,
    workHours: 10,
    mood: "anxious",
    createdAt: "2026-04-28T08:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-111111111112",
    idUser: users[0].id,
    date: "2026-04-29",
    screenTime: 8.4,
    sleepHours: 6.0,
    stressLevel: 7.6,
    wellnessIndex: 5.0,
    sleepQuality: 5.2,
    fatigueScore: 7.3,
    digitalBalance: 4.1,
    screenTimeCategory: "high",
    physicalActivity: "20 min",
    caffeineIntake: 3,
    workHours: 9.5,
    mood: "overwhelmed",
    createdAt: "2026-04-29T08:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-111111111113",
    idUser: users[0].id,
    date: "2026-04-30",
    screenTime: 7.6,
    sleepHours: 6.4,
    stressLevel: 6.9,
    wellnessIndex: 5.8,
    sleepQuality: 5.9,
    fatigueScore: 6.5,
    digitalBalance: 4.8,
    screenTimeCategory: "high",
    physicalActivity: "30 min",
    caffeineIntake: 2,
    workHours: 8.5,
    mood: "drained",
    createdAt: "2026-04-30T08:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-111111111114",
    idUser: users[0].id,
    date: "2026-05-01",
    screenTime: 6.8,
    sleepHours: 6.9,
    stressLevel: 5.9,
    wellnessIndex: 6.1,
    sleepQuality: 6.2,
    fatigueScore: 5.8,
    digitalBalance: 5.3,
    screenTimeCategory: "medium",
    physicalActivity: "45 min",
    caffeineIntake: 2,
    workHours: 8,
    mood: "steady",
    createdAt: "2026-05-01T08:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-111111111115",
    idUser: users[0].id,
    date: "2026-05-02",
    screenTime: 6.1,
    sleepHours: 7.1,
    stressLevel: 4.8,
    wellnessIndex: 6.9,
    sleepQuality: 6.8,
    fatigueScore: 4.9,
    digitalBalance: 6.1,
    screenTimeCategory: "medium",
    physicalActivity: "50 min",
    caffeineIntake: 1,
    workHours: 7.5,
    mood: "calm",
    createdAt: "2026-05-02T08:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-111111111116",
    idUser: users[0].id,
    date: "2026-05-03",
    screenTime: 5.9,
    sleepHours: 7.4,
    stressLevel: 4.3,
    wellnessIndex: 7.0,
    sleepQuality: 7.1,
    fatigueScore: 4.4,
    digitalBalance: 6.5,
    screenTimeCategory: "medium",
    physicalActivity: "1h",
    caffeineIntake: 1,
    workHours: 7,
    mood: "focused",
    createdAt: "2026-05-03T08:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-111111111117",
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
    physicalActivity: "25 min",
    caffeineIntake: 2,
    workHours: 9,
    mood: "tired",
    createdAt: "2026-05-20T08:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-111111111118",
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
    physicalActivity: "35 min",
    caffeineIntake: 2,
    workHours: 8.5,
    mood: "better",
    createdAt: "2026-05-21T08:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-111111111119",
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
    physicalActivity: "45 min",
    caffeineIntake: 1,
    workHours: 8,
    mood: "calm",
    createdAt: "2026-05-22T08:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-444444444444",
    idUser: users[1].id,
    date: "2026-04-27",
    screenTime: 5.4,
    sleepHours: 7.8,
    stressLevel: 2.4,
    wellnessIndex: 8.2,
    sleepQuality: 8.1,
    fatigueScore: 2.7,
    digitalBalance: 8.0,
    screenTimeCategory: "medium",
    physicalActivity: "45 min",
    caffeineIntake: 1,
    workHours: 7,
    mood: "calm",
    createdAt: "2026-04-27T09:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-444444444445",
    idUser: users[1].id,
    date: "2026-04-28",
    screenTime: 6.1,
    sleepHours: 7.4,
    stressLevel: 2.8,
    wellnessIndex: 7.9,
    sleepQuality: 7.8,
    fatigueScore: 3.1,
    digitalBalance: 7.6,
    screenTimeCategory: "medium",
    physicalActivity: "40 min",
    caffeineIntake: 2,
    workHours: 7.5,
    mood: "focused",
    createdAt: "2026-04-28T09:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-444444444446",
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
    physicalActivity: "50 min",
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
    physicalActivity: "35 min",
    caffeineIntake: 1,
    workHours: 7,
    mood: "great",
    createdAt: "2026-05-21T09:00:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-666666666666",
    idUser: users[2].id,
    date: "2026-04-27",
    screenTime: 5.4,
    sleepHours: 7.8,
    stressLevel: 2.4,
    wellnessIndex: 8.1,
    sleepQuality: 8.0,
    fatigueScore: 2.8,
    digitalBalance: 7.9,
    screenTimeCategory: "medium",
    physicalActivity: "45 min",
    caffeineIntake: 1,
    workHours: 7.2,
    mood: "calm",
    createdAt: "2026-04-27T06:30:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-666666666667",
    idUser: users[2].id,
    date: "2026-04-28",
    screenTime: 6.1,
    sleepHours: 7.4,
    stressLevel: 2.8,
    wellnessIndex: 7.8,
    sleepQuality: 7.7,
    fatigueScore: 3.2,
    digitalBalance: 7.5,
    screenTimeCategory: "medium",
    physicalActivity: "40 min",
    caffeineIntake: 2,
    workHours: 7.6,
    mood: "focused",
    createdAt: "2026-04-28T06:30:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-666666666668",
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
    physicalActivity: "42 min",
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
    physicalActivity: "0 min",
    caffeineIntake: 4,
    workHours: 10,
    mood: "anxious",
    createdAt: "2026-05-21T11:30:00Z",
  },
  {
    id: "f1a11111-1111-4111-8111-888888888888",
    idUser: users[4].id,
    date: "2026-05-21",
    screenTime: 5.2,
    sleepHours: 7.1,
    stressLevel: 3.4,
    wellnessIndex: 7.2,
    sleepQuality: 7.0,
    fatigueScore: 3.9,
    digitalBalance: 6.9,
    screenTimeCategory: "medium",
    physicalActivity: "1.5h",
    caffeineIntake: 1,
    workHours: 8,
    mood: "balanced",
    createdAt: "2026-05-21T07:30:00Z",
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
  {
    id: "a2b22222-2222-4222-8222-555555555555",
    senderId: users[0].id,
    receiverId: users[4].id,
    status: "accepted",
  },
];

const groups = [
  {
    id: "c3c33333-3333-4333-8333-000000000001",
    ownerId: users[0].id,
    groupName: "Friends",
    isDefault: true,
    description: "Default group for accepted friends who are not assigned to a custom group.",
  },
  {
    id: "c3c33333-3333-4333-8333-000000000002",
    ownerId: users[1].id,
    groupName: "Friends",
    isDefault: true,
    description: "Default group for accepted friends who are not assigned to a custom group.",
  },
  {
    id: "c3c33333-3333-4333-8333-000000000003",
    ownerId: users[2].id,
    groupName: "Friends",
    isDefault: true,
    description: "Default group for accepted friends who are not assigned to a custom group.",
  },
  {
    id: "c3c33333-3333-4333-8333-000000000004",
    ownerId: users[3].id,
    groupName: "Friends",
    isDefault: true,
    description: "Default group for accepted friends who are not assigned to a custom group.",
  },
  {
    id: "c3c33333-3333-4333-8333-000000000005",
    ownerId: users[4].id,
    groupName: "Friends",
    isDefault: true,
    description: "Default group for accepted friends who are not assigned to a custom group.",
  },
  {
    id: "c3c33333-3333-4333-8333-111111111111",
    ownerId: users[0].id,
    groupName: "Inner Circle",
    isDefault: false,
    description: "Closest friends with full wellness sharing permissions.",
  },
];

const groupMembers = [
  {
    id: "d4d44444-4444-4444-8444-000000000001",
    groupId: groups[0].id,
    userId: users[0].id,
  },
  {
    id: "d4d44444-4444-4444-8444-000000000002",
    groupId: groups[0].id,
    userId: users[1].id,
  },
  {
    id: "d4d44444-4444-4444-8444-000000000003",
    groupId: groups[0].id,
    userId: users[2].id,
  },
  {
    id: "d4d44444-4444-4444-8444-000000000004",
    groupId: groups[0].id,
    userId: users[4].id,
  },
  {
    id: "d4d44444-4444-4444-8444-000000000005",
    groupId: groups[1].id,
    userId: users[1].id,
  },
  {
    id: "d4d44444-4444-4444-8444-000000000006",
    groupId: groups[1].id,
    userId: users[0].id,
  },
  {
    id: "d4d44444-4444-4444-8444-000000000007",
    groupId: groups[2].id,
    userId: users[2].id,
  },
  {
    id: "d4d44444-4444-4444-8444-000000000008",
    groupId: groups[2].id,
    userId: users[0].id,
  },
  {
    id: "d4d44444-4444-4444-8444-000000000009",
    groupId: groups[3].id,
    userId: users[3].id,
  },
  {
    id: "d4d44444-4444-4444-8444-000000000010",
    groupId: groups[4].id,
    userId: users[4].id,
  },
  {
    id: "d4d44444-4444-4444-8444-000000000011",
    groupId: groups[4].id,
    userId: users[0].id,
  },
  {
    id: "d4d44444-4444-4444-8444-111111111111",
    groupId: groups[5].id,
    userId: users[0].id,
  },
  {
    id: "d4d44444-4444-4444-8444-222222222222",
    groupId: groups[5].id,
    userId: users[1].id,
  },
  {
    id: "d4d44444-4444-4444-8444-333333333333",
    groupId: groups[5].id,
    userId: users[2].id,
  },
  {
    id: "d4d44444-4444-4444-8444-555555555555",
    groupId: groups[5].id,
    userId: users[4].id,
  },
];

const groupPermissions = [
  {
    id: "e5e55555-5555-4555-8555-000000000001",
    groupId: groups[0].id,
    canViewScreenTime: false,
    canViewSleepHours: false,
    canViewWellnessIndex: false,
    canViewSleepQuality: false,
    canViewFatigueScore: false,
    canViewDigitalBalance: false,
    canViewScreenTimeCategory: false,
    canViewPhysicalActivity: false,
    canViewCaffeineIntake: false,
    canViewWorkHours: false,
    canViewMood: false,
  },
  {
    id: "e5e55555-5555-4555-8555-000000000002",
    groupId: groups[1].id,
    canViewScreenTime: false,
    canViewSleepHours: false,
    canViewWellnessIndex: false,
    canViewSleepQuality: false,
    canViewFatigueScore: false,
    canViewDigitalBalance: false,
    canViewScreenTimeCategory: false,
    canViewPhysicalActivity: false,
    canViewCaffeineIntake: false,
    canViewWorkHours: false,
    canViewMood: false,
  },
  {
    id: "e5e55555-5555-4555-8555-000000000003",
    groupId: groups[2].id,
    canViewScreenTime: false,
    canViewSleepHours: false,
    canViewWellnessIndex: false,
    canViewSleepQuality: false,
    canViewFatigueScore: false,
    canViewDigitalBalance: false,
    canViewScreenTimeCategory: false,
    canViewPhysicalActivity: false,
    canViewCaffeineIntake: false,
    canViewWorkHours: false,
    canViewMood: false,
  },
  {
    id: "e5e55555-5555-4555-8555-000000000004",
    groupId: groups[3].id,
    canViewScreenTime: false,
    canViewSleepHours: false,
    canViewWellnessIndex: false,
    canViewSleepQuality: false,
    canViewFatigueScore: false,
    canViewDigitalBalance: false,
    canViewScreenTimeCategory: false,
    canViewPhysicalActivity: false,
    canViewCaffeineIntake: false,
    canViewWorkHours: false,
    canViewMood: false,
  },
  {
    id: "e5e55555-5555-4555-8555-000000000005",
    groupId: groups[4].id,
    canViewScreenTime: false,
    canViewSleepHours: false,
    canViewWellnessIndex: false,
    canViewSleepQuality: false,
    canViewFatigueScore: false,
    canViewDigitalBalance: false,
    canViewScreenTimeCategory: false,
    canViewPhysicalActivity: false,
    canViewCaffeineIntake: false,
    canViewWorkHours: false,
    canViewMood: false,
  },
  {
    id: "e5e55555-5555-4555-8555-111111111111",
    groupId: groups[5].id,
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        user.id,
        user.name,
        user.username,
        user.emailAddress,
        hashedPassword,
        user.birthDate,
        user.gender,
        user.job,
        user.workLocation,
        user.hobby,
        user.biodata,
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
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $17)
      `,
      [
        history.id,
        history.idUser,
        history.date,
        history.screenTime,
        history.sleepHours,
        history.stressStatus || deriveStressStatusFromLegacyScore(history.stressLevel),
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
        INSERT INTO groups (id, id_user, group_name, is_default, description)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [group.id, group.ownerId, group.groupName, group.isDefault, group.description || null]
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
