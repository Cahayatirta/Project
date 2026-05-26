const { ApiError } = require("../../utils/api-error");
const { resolveRollingWindowRange, toIsoDate } = require("../../utils/period");
const {
  deriveStressStatusFromLegacyScore,
  getDominantStressStatus,
  normalizeStressStatus,
} = require("../../utils/stress");
const { buildHistoryCard } = require("../activity/activity.service");
const {
  titleCaseStatus,
  formatHours,
  normalizeDateValue,
} = require("../../utils/presentation");
const { getDailyActivity, getHistoriesByDateRange } = require("./dashboard.repository");

const mapDailyActivity = (row) => ({
  id: row.id,
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
});

const getDashboardDailyActivity = async (userId, query) => {
  const selectedDate = toIsoDate(query.date || new Date());
  const history = await getDailyActivity(userId, selectedDate);

  if (!history) {
    return {
      date: selectedDate,
      activity: null,
    };
  }

  return {
    date: selectedDate,
    activity: mapDailyActivity(history),
    details: [
      { label: "Screen Time", value: formatHours(history.screen_time) },
      { label: "Sleep Duration", value: formatHours(history.sleep_hours) },
      { label: "Physical Activity", value: history.physical_activity || "-" },
      { label: "Caffeine Intake", value: `${Number(history.caffeine_intake || 0)} cups` },
      { label: "Work Hours", value: formatHours(history.work_hours) },
      { label: "Mood", value: history.mood || "-" },
    ],
  };
};

const getStressSummary = async (userId, query) => {
  const range = resolveRollingWindowRange(query);
  const histories = await getHistoriesByDateRange(userId, range.startDate, range.endDate);

  const totals = {
    relaxed: 0,
    normal: 0,
    exhausted: 0,
  };

  histories.forEach((history) => {
    const stressLevel = normalizeStressStatus(history.stress_status || deriveStressStatusFromLegacyScore(history.stress_level));
    totals[stressLevel] += 1;
  });
  const dominantStressLevel = histories.length
    ? getDominantStressStatus(histories.map((history) => normalizeStressStatus(history.stress_status || deriveStressStatusFromLegacyScore(history.stress_level))))
    : "normal";

  return {
    startDate: range.startDate,
    endDate: range.endDate,
    isDefaultRange: range.isDefaultRange,
    totalDays: histories.length,
    dominantStressLevel,
    status: dominantStressLevel,
    statusLabel: titleCaseStatus(dominantStressLevel),
    summary: [
      { label: "Relaxed", value: `${totals.relaxed}` },
      { label: "Normal", value: `${totals.normal}` },
      { label: "Exhausted", value: `${totals.exhausted}` },
      { label: "Stress Level", value: titleCaseStatus(dominantStressLevel) },
    ],
    totals,
    items: histories.map((history) => ({
      date: normalizeDateValue(history.date),
      stressLevel: normalizeStressStatus(history.stress_status || deriveStressStatusFromLegacyScore(history.stress_level)),
      status: normalizeStressStatus(history.stress_status || deriveStressStatusFromLegacyScore(history.stress_level)),
      statusLabel: titleCaseStatus(history.stress_status || deriveStressStatusFromLegacyScore(history.stress_level)),
    })),
  };
};

const buildLocalRecommendation = (stressSummary, todayActivity) => {
  if (!todayActivity) {
    return "Belum ada aktivitas hari ini. Mulai dengan input activity harian terlebih dahulu agar rekomendasinya lebih akurat.";
  }

  if (stressSummary.status === "exhausted") {
    return "Prioritaskan istirahat malam yang cukup, kurangi screen time setelah jam kerja, pilih aktivitas fisik ringan 20-30 menit, dan batasi kafein di sore hari.";
  }

  if (stressSummary.status === "normal") {
    return "Pertahankan ritme kerja dengan jeda singkat tiap 90 menit, tambah aktivitas fisik ringan, dan usahakan jam tidur lebih konsisten malam ini.";
  }

  return "Kondisi relatif refreshed. Pertahankan pola tidur, aktivitas fisik, dan digital balance yang sudah baik, lalu tambah satu aktivitas pemulihan seperti jalan santai atau hobi.";
};

const getGeminiRecommendation = async (payload) => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  if (typeof fetch !== "function") {
    return null;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: payload,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
};

const getActivityRecommendation = async (userId, query) => {
  const selectedDate = toIsoDate(query.date || new Date());
  const range = resolveRollingWindowRange(query);
  const [dailyResult, stressSummary] = await Promise.all([
    getDashboardDailyActivity(userId, { date: selectedDate }),
    getStressSummary(userId, range),
  ]);

  const histories = await getHistoriesByDateRange(userId, range.startDate, range.endDate);

  if (!histories.length) {
    throw new ApiError(404, "No activity data found for recommendation");
  }

  const prompt = [
    "You are a wellness assistant.",
    `Today's date: ${selectedDate}.`,
    `History range start date: ${range.startDate}.`,
    `History range end date: ${range.endDate}.`,
    `Dominant stress level in selected history range: ${stressSummary.dominantStressLevel}.`,
    `Current status: ${stressSummary.status}.`,
    `Today activity: ${JSON.stringify(dailyResult.activity)}.`,
    `Monthly activities: ${JSON.stringify(histories)}.`,
    "Recommend activities for one day in concise Indonesian. Focus on stress recovery, sleep, work-life balance, and realistic habits.",
  ].join("\n");

  const aiRecommendation = await getGeminiRecommendation(prompt);

  return {
    date: selectedDate,
    source: aiRecommendation ? "gemini" : "local_fallback",
    stressSummary,
    recommendation: aiRecommendation || buildLocalRecommendation(stressSummary, dailyResult.activity),
  };
};

const getDashboardOverview = async (userId, query) => {
  const range = resolveRollingWindowRange(query);
  const selectedDate = range.endDate;
  const [stressSummary, recommendationResult] = await Promise.all([
    getStressSummary(userId, range),
    getActivityRecommendation(userId, { ...query, date: selectedDate, startDate: range.startDate, endDate: range.endDate }),
  ]);

  const histories = await getHistoriesByDateRange(userId, range.startDate, range.endDate);

  return {
    range,
    summary: {
      Relaxed: stressSummary.totals.relaxed,
      Normal: stressSummary.totals.normal,
      Exhausted: stressSummary.totals.exhausted,
    },
    histories: histories
      .map((history) =>
        buildHistoryCard({
          id: history.id,
          date: history.date,
          screenTime: Number(history.screen_time),
          sleepHours: Number(history.sleep_hours),
          stressLevel: normalizeStressStatus(history.stress_status || deriveStressStatusFromLegacyScore(history.stress_level)),
          physicalActivity: history.physical_activity,
          caffeineIntake: Number(history.caffeine_intake),
          workHours: Number(history.work_hours),
          mood: history.mood,
        })
      )
      .reverse(),
    shap: [],
    recommendation: {
      date: selectedDate,
      source: recommendationResult.source,
      text: recommendationResult.recommendation,
    },
  };
};

module.exports = {
  getDashboardOverview,
  getDashboardDailyActivity,
  getStressSummary,
  getActivityRecommendation,
};
