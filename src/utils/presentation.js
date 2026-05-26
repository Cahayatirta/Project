const { titleCaseStressStatus } = require("./stress");

const titleCaseStatus = (value) => titleCaseStressStatus(value);

const formatHours = (value) => `${Number(value || 0).toFixed(1)}h`;

const formatCount = (value) => `${Number(value || 0)}`;

const normalizeDateValue = (value) => {
  if (typeof value === "string") {
    const exactDateMatch = value.match(/^\d{4}-\d{2}-\d{2}/);

    if (exactDateMatch) {
      return exactDateMatch[0];
    }
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

const formatDateLabel = (value) => {
  const normalizedDate = normalizeDateValue(value);
  const date = normalizedDate ? new Date(`${normalizedDate}T00:00:00.000Z`) : new Date(value);

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replace(/^([A-Za-z]{3})/, (weekday) => {
      const map = {
        Mon: "Sen",
        Tue: "Sel",
        Wed: "Rab",
        Thu: "Kam",
        Fri: "Jum",
        Sat: "Sab",
        Sun: "Min",
      };

      return map[weekday] || weekday;
    });
};

const formatMonthLabel = (value) => {
  const normalizedDate = normalizeDateValue(value);
  const date = normalizedDate ? new Date(`${normalizedDate}T00:00:00.000Z`) : new Date(value);

  return new Intl.DateTimeFormat("en-GB", {
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

const describeStress = (stressLevel) => titleCaseStatus(stressLevel);

module.exports = {
  titleCaseStatus,
  formatHours,
  formatCount,
  normalizeDateValue,
  formatDateLabel,
  formatMonthLabel,
  formatRelativeTime,
  describeStress,
};
