const stressStatusLabelMap = {
  exhausted: "Exhausted",
  normal: "Normal",
  relaxed: "Relaxed",
};

const normalizeStressStatus = (value) => {
  if (!value) {
    return "normal";
  }

  const normalized = String(value).trim().toLowerCase();

  if (["exhausted", "normal", "relaxed"].includes(normalized)) {
    return normalized;
  }

  return "normal";
};

const titleCaseStressStatus = (value) => stressStatusLabelMap[normalizeStressStatus(value)] || "Normal";

const deriveStressStatusFromLegacyScore = (value) => {
  const score = Number(value || 0);

  if (score >= 7) {
    return "exhausted";
  }

  if (score >= 4) {
    return "normal";
  }

  return "relaxed";
};

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

  const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);

  if (numberMatch && normalized.includes("min")) {
    return Math.round(Number(numberMatch[1]));
  }

  return 0;
};

const moodStressWeights = {
  anxious: 3,
  overwhelmed: 3,
  drained: 2,
  tired: 2,
  balanced: -1,
  calm: -2,
  focused: -1,
  relaxed: -2,
  good: -1,
  great: -2,
  steady: 0,
  better: 0,
};

const generateStressStatusFromSignals = (payload = {}) => {
  let score = 0;

  const screenTime = Number(payload.screenTime || 0);
  const sleepHours = Number(payload.sleepHours || 0);
  const caffeineIntake = Number(payload.caffeineIntake || 0);
  const workHours = Number(payload.workHours || 0);
  const exerciseMinutes = parseDurationToMinutes(payload.physicalActivity);
  const mood = String(payload.mood || "").trim().toLowerCase();

  if (screenTime >= 9) score += 2;
  else if (screenTime >= 7) score += 1;

  if (sleepHours < 5.5) score += 3;
  else if (sleepHours < 6.5) score += 2;
  else if (sleepHours >= 8) score -= 1;

  if (caffeineIntake >= 4) score += 2;
  else if (caffeineIntake >= 2) score += 1;

  if (workHours >= 10) score += 2;
  else if (workHours >= 8.5) score += 1;

  if (exerciseMinutes >= 45) score -= 2;
  else if (exerciseMinutes >= 20) score -= 1;
  else if (exerciseMinutes === 0) score += 1;

  score += moodStressWeights[mood] || 0;

  if (score >= 5) {
    return "exhausted";
  }

  if (score >= 2) {
    return "normal";
  }

  return "relaxed";
};

const countStressStatuses = (statuses) => {
  const totals = {
    relaxed: 0,
    normal: 0,
    exhausted: 0,
  };

  statuses.forEach((status) => {
    totals[normalizeStressStatus(status)] += 1;
  });

  return totals;
};

const getDominantStressStatus = (statuses) => {
  const totals = countStressStatuses(statuses);
  const priority = ["exhausted", "normal", "relaxed"];

  return priority.reduce((selected, current) => {
    if (totals[current] > totals[selected]) {
      return current;
    }

    return selected;
  }, "normal");
};

module.exports = {
  normalizeStressStatus,
  titleCaseStressStatus,
  deriveStressStatusFromLegacyScore,
  generateStressStatusFromSignals,
  countStressStatuses,
  getDominantStressStatus,
};
