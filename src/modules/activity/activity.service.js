const { ApiError } = require("../../utils/api-error");
const { resolveDateRange, toIsoDate } = require("../../utils/period");
const {
  formatDateLabel,
  formatHours,
  titleCaseStatus,
  toStressPercent,
} = require("../../utils/presentation");
const { classifyStressLevel } = require("../../utils/stress");
const {
  createHistory,
  findHistoryById,
  updateHistoryById,
  findHistoryByUserAndDate,
  findHistoriesByRange,
  getAverageFactorsByRange,
} = require("./activity.repository");

const mapHistory = (row) => ({
  id: row.id,
  userId: row.id_user,
  date: row.date,
  screenTime: Number(row.screen_time),
  sleepHours: Number(row.sleep_hours),
  stressLevel: Number(row.stress_level),
  wellnessIndex: Number(row.wellness_index),
  sleepQuality: Number(row.sleep_quality),
  fatigueScore: Number(row.fatigue_score),
  digitalBalance: Number(row.digital_balance),
  screenTimeCategory: row.screen_time_category,
  physicalActivity: row.physical_activity,
  caffeineIntake: Number(row.caffeine_intake),
  workHours: Number(row.work_hours),
  mood: row.mood,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const buildHistoryDetails = (history) => [
  { label: "Screen Time", value: formatHours(history.screenTime) },
  { label: "Sleep Duration", value: formatHours(history.sleepHours) },
  { label: "Physical Activity", value: history.physicalActivity || "-" },
  { label: "Caffeine Intake", value: `${history.caffeineIntake} cups` },
  { label: "Work Hours", value: formatHours(history.workHours) },
  { label: "Mood", value: history.mood || "-" },
];

const buildHistoryCard = (history) => ({
  id: history.id,
  date: formatDateLabel(history.date),
  title: "Daily Activity Log",
  stressStatus: titleCaseStatus(classifyStressLevel(history.stressLevel)),
  stressLevel: toStressPercent(history.stressLevel),
  details: buildHistoryDetails(history),
  raw: history,
});

const buildSummary = (histories) => {
  if (!histories.length) {
    return [
      { label: "Avg Screen Time", value: "0.0h" },
      { label: "Avg Sleep Duration", value: "0.0h" },
      { label: "Avg Work Hours", value: "0.0h" },
      { label: "Avg Stress", value: "0%" },
    ];
  }

  const totals = histories.reduce(
    (accumulator, item) => ({
      screenTime: accumulator.screenTime + item.screenTime,
      sleepHours: accumulator.sleepHours + item.sleepHours,
      workHours: accumulator.workHours + item.workHours,
      stressLevel: accumulator.stressLevel + item.stressLevel,
    }),
    { screenTime: 0, sleepHours: 0, workHours: 0, stressLevel: 0 }
  );

  const count = histories.length;

  return [
    { label: "Avg Screen Time", value: formatHours(totals.screenTime / count) },
    { label: "Avg Sleep Duration", value: formatHours(totals.sleepHours / count) },
    { label: "Avg Work Hours", value: formatHours(totals.workHours / count) },
    { label: "Avg Stress", value: `${toStressPercent(totals.stressLevel / count)}%` },
  ];
};

const normalizeActivityPayload = (payload) => ({
  date: payload.date ? toIsoDate(payload.date) : undefined,
  screenTime: payload.screenTime ?? 0,
  sleepHours: payload.sleepHours ?? 0,
  stressLevel: payload.stressLevel ?? 0,
  wellnessIndex: payload.wellnessIndex ?? 0,
  sleepQuality: payload.sleepQuality ?? 0,
  fatigueScore: payload.fatigueScore ?? 0,
  digitalBalance: payload.digitalBalance ?? 0,
  screenTimeCategory: payload.screenTimeCategory ?? null,
  physicalActivity: payload.physicalActivity ?? null,
  caffeineIntake: payload.caffeineIntake ?? 0,
  workHours: payload.workHours ?? 0,
  mood: payload.mood ?? null,
});

const addActivity = async (userId, payload) => {
  const normalized = normalizeActivityPayload(payload);

  if (!normalized.date) {
    throw new ApiError(400, "date is required");
  }

  const existing = await findHistoryByUserAndDate(userId, normalized.date);

  if (existing) {
    throw new ApiError(409, "Activity for this date already exists");
  }

  const history = await createHistory({
    idUser: userId,
    ...normalized,
  });

  return mapHistory(history);
};

const updateActivity = async (userId, historyId, payload) => {
  const history = await findHistoryById(historyId);

  if (!history || history.id_user !== userId) {
    throw new ApiError(404, "Activity not found");
  }

  const updated = await updateHistoryById(historyId, {
    date: payload.date ? toIsoDate(payload.date) : undefined,
    screen_time: payload.screenTime,
    sleep_hours: payload.sleepHours,
    stress_level: payload.stressLevel,
    wellness_index: payload.wellnessIndex,
    sleep_quality: payload.sleepQuality,
    fatigue_score: payload.fatigueScore,
    digital_balance: payload.digitalBalance,
    screen_time_category: payload.screenTimeCategory,
    physical_activity: payload.physicalActivity,
    caffeine_intake: payload.caffeineIntake,
    work_hours: payload.workHours,
    mood: payload.mood,
  });

  return mapHistory(updated);
};

const getActivities = async (userId, query) => {
  const range = resolveDateRange(query);
  const histories = await findHistoriesByRange(userId, range.startDate, range.endDate);
  const items = histories.map(mapHistory);

  return {
    period: range.period,
    range,
    summary: buildSummary(items),
    history: items.map(buildHistoryCard),
    items,
  };
};

const getAverageFactors = async (userId, query) => {
  const range = resolveDateRange(query);
  const averages = await getAverageFactorsByRange(userId, range.startDate, range.endDate);

  return {
    period: range.period,
    range,
    summary: [
      { label: "Avg Screen Time", value: formatHours(averages.avg_screen_time || 0) },
      { label: "Avg Sleep Duration", value: formatHours(averages.avg_sleep_hours || 0) },
      { label: "Avg Work Hours", value: formatHours(averages.avg_work_hours || 0) },
      { label: "Avg Stress", value: `${toStressPercent(averages.avg_stress_level || 0)}%` },
    ],
    averages: {
      screenTime: Number(averages.avg_screen_time || 0),
      sleepHours: Number(averages.avg_sleep_hours || 0),
      stressLevel: Number(averages.avg_stress_level || 0),
      wellnessIndex: Number(averages.avg_wellness_index || 0),
      sleepQuality: Number(averages.avg_sleep_quality || 0),
      fatigueScore: Number(averages.avg_fatigue_score || 0),
      digitalBalance: Number(averages.avg_digital_balance || 0),
      caffeineIntake: Number(averages.avg_caffeine_intake || 0),
      workHours: Number(averages.avg_work_hours || 0),
    },
  };
};

module.exports = { addActivity, updateActivity, getActivities, getAverageFactors, mapHistory };
