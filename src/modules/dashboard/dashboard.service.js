const { ApiError } = require("../../utils/api-error");
const { toIsoDate } = require("../../utils/period");
const { classifyStressLevel } = require("../../utils/stress");
const {
  titleCaseStatus,
  toStressPercent,
  formatDateLabel,
  formatHours,
} = require("../../utils/presentation");
const { getDailyActivity, getHistoriesForLastThirtyDays } = require("./dashboard.repository");

const mapDailyActivity = (row) => ({
  id: row.id,
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
  const selectedDate = toIsoDate(query.date || new Date());
  const histories = await getHistoriesForLastThirtyDays(userId, selectedDate);

  const totals = {
    refreshed: 0,
    strained: 0,
    nearBurnout: 0,
  };

  let totalStressLevel = 0;

  histories.forEach((history) => {
    const stressLevel = Number(history.stress_level || 0);
    const category = classifyStressLevel(stressLevel);
    totalStressLevel += stressLevel;

    if (category === "refreshed") totals.refreshed += 1;
    if (category === "strained") totals.strained += 1;
    if (category === "near_burnout") totals.nearBurnout += 1;
  });

  const averageStressLevel = histories.length ? Number((totalStressLevel / histories.length).toFixed(2)) : 0;

  return {
    startDate: histories[0]?.date || selectedDate,
    endDate: selectedDate,
    totalDays: histories.length,
    averageStressLevel,
    status: classifyStressLevel(averageStressLevel),
    statusLabel: titleCaseStatus(classifyStressLevel(averageStressLevel)),
    summary: [
      { label: "Refreshed", value: `${totals.refreshed}` },
      { label: "Strained", value: `${totals.strained}` },
      { label: "Near-Burnout", value: `${totals.nearBurnout}` },
      { label: "Avg Stress", value: `${toStressPercent(averageStressLevel)}%` },
    ],
    totals,
    items: histories.map((history) => ({
      date: history.date,
      dateLabel: formatDateLabel(history.date),
      stressLevel: Number(history.stress_level),
      stressPercent: toStressPercent(history.stress_level),
      status: classifyStressLevel(history.stress_level),
      statusLabel: titleCaseStatus(classifyStressLevel(history.stress_level)),
    })),
  };
};

const buildLocalRecommendation = (stressSummary, todayActivity) => {
  if (!todayActivity) {
    return "Belum ada aktivitas hari ini. Mulai dengan input activity harian terlebih dahulu agar rekomendasinya lebih akurat.";
  }

  if (stressSummary.status === "near_burnout") {
    return "Prioritaskan istirahat malam yang cukup, kurangi screen time setelah jam kerja, pilih aktivitas fisik ringan 20-30 menit, dan batasi kafein di sore hari.";
  }

  if (stressSummary.status === "strained") {
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
  const [dailyResult, stressSummary] = await Promise.all([
    getDashboardDailyActivity(userId, { date: selectedDate }),
    getStressSummary(userId, { date: selectedDate }),
  ]);

  const histories = await getHistoriesForLastThirtyDays(userId, selectedDate);

  if (!histories.length) {
    throw new ApiError(404, "No activity data found for recommendation");
  }

  const prompt = [
    "You are a wellness assistant.",
    `Today's date: ${selectedDate}.`,
    `Average stress level in last 30 days: ${stressSummary.averageStressLevel}.`,
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

module.exports = {
  getDashboardDailyActivity,
  getStressSummary,
  getActivityRecommendation,
};
