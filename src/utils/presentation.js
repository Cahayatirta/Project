const { classifyStressLevel } = require("./stress");

const statusLabelMap = {
  refreshed: "Refreshed",
  strained: "Strained",
  near_burnout: "Near-Burnout",
};

const titleCaseStatus = (value) => statusLabelMap[value] || "Unknown";

const toStressPercent = (value) => Math.max(0, Math.min(100, Math.round(Number(value || 0) * 10)));

const formatHours = (value) => `${Number(value || 0).toFixed(1)}h`;

const formatCount = (value) => `${Number(value || 0)}`;

const formatDateLabel = (value) => {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const formatRelativeTime = (value) => {
  if (!value) {
    return "No activity yet";
  }

  const target = new Date(value);

  if (Number.isNaN(target.getTime())) {
    return "No activity yet";
  }

  const seconds = Math.round((target.getTime() - Date.now()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(seconds) < 60) {
    return rtf.format(seconds, "second");
  }

  if (Math.abs(minutes) < 60) {
    return rtf.format(minutes, "minute");
  }

  if (Math.abs(hours) < 24) {
    return rtf.format(hours, "hour");
  }

  return rtf.format(days, "day");
};

const describeStress = (stressLevel) => titleCaseStatus(classifyStressLevel(stressLevel));

module.exports = {
  titleCaseStatus,
  toStressPercent,
  formatHours,
  formatCount,
  formatDateLabel,
  formatRelativeTime,
  describeStress,
};
