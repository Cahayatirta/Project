const { ApiError } = require("../../utils/api-error");
const { resolveDateRange, toIsoDate } = require("../../utils/period");
const {
  formatDateLabel,
  formatHours,
  formatMonthLabel,
  normalizeDateValue,
  titleCaseStatus,
} = require("../../utils/presentation");
const {
  deriveStressStatusFromLegacyScore,
  generateStressStatusFromSignals,
  getDominantStressStatus,
  normalizeStressStatus,
} = require("../../utils/stress");
const {
  createHistory,
  findHistoryById,
  updateHistoryById,
  findHistoryByUserAndDate,
  findHistoriesByRange,
  getAverageFactorsByRange,
  getHistoryMonthsByUser,
  getLatestHistoryDateByUser,
} = require("./activity.repository");

const mapHistory = (row) => ({
  id: row.id,
  userId: row.id_user,
  date: row.date,
  screenTime: Number(row.screen_time),
  sleepHours: Number(row.sleep_hours),
  stressLevel: normalizeStressStatus(row.stress_status || deriveStressStatusFromLegacyScore(row.stress_level)),
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
  dateRaw: normalizeDateValue(history.date),
  title: "Daily Activity Log",
  stressStatus: titleCaseStatus(history.stressLevel),
  stressLevel: history.stressLevel,
  details: buildHistoryDetails(history),
});

const parseDurationToMinutes = (value) => {
  if (!value || typeof value !== "string") {
    return 0;
  }

  const normalized = value.trim().toLowerCase();
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*h/);
  const minuteMatch = normalized.match(/(\d+(?:\.\d+)?)\s*m/);

  if (hourMatch || minuteMatch) {
    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
    return Math.round((hours * 60) + minutes);
  }

  const plainNumberMatch = normalized.match(/(\d+(?:\.\d+)?)/);

  if (plainNumberMatch && normalized.includes("min")) {
    return Math.round(Number(plainNumberMatch[1]));
  }

  return 0;
};

const formatMinutes = (value) => `${Math.round(Number(value || 0))}m`;

const buildSummary = (histories) => {
  if (!histories.length) {
    return [
      { label: "Avg Exercise", value: "0m" },
      { label: "Avg Screen Time", value: "0.0h" },
      { label: "Avg Sleep Duration", value: "0.0h" },
      { label: "Stress Level", value: "Normal" },
    ];
  }

  const totals = histories.reduce(
    (accumulator, item) => ({
      exerciseMinutes: accumulator.exerciseMinutes + parseDurationToMinutes(item.physicalActivity),
      screenTime: accumulator.screenTime + item.screenTime,
      sleepHours: accumulator.sleepHours + item.sleepHours,
      stressLevels: [...accumulator.stressLevels, item.stressLevel],
    }),
    { exerciseMinutes: 0, screenTime: 0, sleepHours: 0, stressLevels: [] }
  );

  const count = histories.length;

  return [
    { label: "Avg Exercise", value: formatMinutes(totals.exerciseMinutes / count) },
    { label: "Avg Screen Time", value: formatHours(totals.screenTime / count) },
    { label: "Avg Sleep Duration", value: formatHours(totals.sleepHours / count) },
    { label: "Stress Level", value: titleCaseStatus(getDominantStressStatus(totals.stressLevels)) },
  ];
};

const buildMonthCard = (monthPath, histories) => {
  const dominantStressLevel = histories.length
    ? getDominantStressStatus(histories.map((item) => item.stressLevel))
    : "normal";

  return {
    month: formatMonthLabel(`${monthPath}-01`),
    monthPath,
    recordedDays: histories.length,
    stressStatus: titleCaseStatus(dominantStressLevel),
    stressLevel: dominantStressLevel,
    metrics: buildSummary(histories),
  };
};

const normalizeActivityPayload = (payload) => ({
  date: payload.date ? toIsoDate(payload.date) : undefined,
  screenTime: payload.screenTime ?? 0,
  sleepHours: payload.sleepHours ?? 0,
  wellnessIndex: payload.wellnessIndex ?? 0,
  sleepQuality: payload.sleepQuality ?? 0,
  fatigueScore: payload.fatigueScore ?? 0,
  digitalBalance: payload.digitalBalance ?? 0,
  screenTimeCategory: payload.screenTimeCategory ?? null,
  physicalActivity: payload.physicalActivity ?? null,
  caffeineIntake: payload.caffeineIntake ?? 0,
  workHours: payload.workHours ?? 0,
  mood: payload.mood ?? null,
  stressStatus: generateStressStatusFromSignals(payload),
  stressLevel: 0,
});

const addActivity = async (userId, payload) => {
  const normalized = normalizeActivityPayload(payload);

  if (!normalized.date) {
    throw new ApiError(400, "Validation failed", [
      { property: "date", message: "Date is required" },
    ]);
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
    stress_status: generateStressStatusFromSignals({
      screenTime: payload.screenTime ?? history.screen_time,
      sleepHours: payload.sleepHours ?? history.sleep_hours,
      caffeineIntake: payload.caffeineIntake ?? history.caffeine_intake,
      workHours: payload.workHours ?? history.work_hours,
      physicalActivity: payload.physicalActivity ?? history.physical_activity,
      mood: payload.mood ?? history.mood,
    }),
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

  if (range.period === "monthly") {
    return {
      month: formatMonthLabel(`${range.selectedMonth}-01`),
      monthPath: range.selectedMonth,
      summary: buildSummary(items),
      history: items.slice().reverse().map(buildHistoryCard),
    };
  }

  return {
    period: range.period,
    range,
    summary: buildSummary(items),
    history: items.slice().reverse().map(buildHistoryCard),
    items,
  };
};

const getMonthlyHistories = async (userId) => {
  const months = await getHistoryMonthsByUser(userId);

  if (!months.length) {
    return [];
  }

  const allRows = await Promise.all(
    months.map((month) =>
      findHistoriesByRange(userId, `${month.month_path}-01`, month.last_date)
    )
  );

  return months.map((month, index) => {
    const items = allRows[index].map(mapHistory);
    return buildMonthCard(month.month_path, items);
  });
};

const getMonthlyHistoryDetail = async (userId, query = {}) => {
  let selectedMonth = query.month;

  if (!selectedMonth) {
    const latestDate = await getLatestHistoryDateByUser(userId);
    selectedMonth = latestDate ? String(latestDate).slice(0, 7) : toIsoDate(new Date()).slice(0, 7);
  }

  return getActivities(userId, {
    period: "monthly",
    month: selectedMonth,
  });
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
      { label: "Stress Level", value: titleCaseStatus(averages.dominant_stress_status || "normal") },
    ],
    averages: {
      screenTime: Number(averages.avg_screen_time || 0),
      sleepHours: Number(averages.avg_sleep_hours || 0),
      stressLevel: normalizeStressStatus(averages.dominant_stress_status),
      wellnessIndex: Number(averages.avg_wellness_index || 0),
      sleepQuality: Number(averages.avg_sleep_quality || 0),
      fatigueScore: Number(averages.avg_fatigue_score || 0),
      digitalBalance: Number(averages.avg_digital_balance || 0),
      caffeineIntake: Number(averages.avg_caffeine_intake || 0),
      workHours: Number(averages.avg_work_hours || 0),
    },
  };
};

module.exports = {
  addActivity,
  updateActivity,
  getActivities,
  getAverageFactors,
  getMonthlyHistories,
  getMonthlyHistoryDetail,
  mapHistory,
  buildHistoryCard,
  buildSummary,
};
