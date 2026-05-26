const { ApiError } = require("./api-error");

const toIsoDate = (value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "Validation failed", [
      { property: "date", message: "Date must be a valid date" },
    ]);
  }

  return date.toISOString().slice(0, 10);
};

const resolveDateRange = ({ period = "daily", date, month }) => {
  if (period === "daily") {
    const selectedDate = toIsoDate(date || new Date());
    return {
      period,
      selectedDate,
      startDate: selectedDate,
      endDate: selectedDate,
    };
  }

  if (period === "monthly") {
    const source = month || toIsoDate(new Date()).slice(0, 7);

    if (!/^\d{4}-\d{2}$/.test(source)) {
      throw new ApiError(400, "Validation failed", [
        { property: "month", message: "Month must use YYYY-MM format" },
      ]);
    }

    const startDate = `${source}-01`;
    const end = new Date(`${source}-01T00:00:00.000Z`);
    end.setUTCMonth(end.getUTCMonth() + 1);
    end.setUTCDate(0);

    return {
      period,
      selectedMonth: source,
      startDate,
      endDate: end.toISOString().slice(0, 10),
    };
  }

  throw new ApiError(400, "Validation failed", [
    { property: "period", message: "Period must be daily or monthly" },
  ]);
};

const resolveRollingWindowRange = ({ startDate, endDate, date, defaultDays = 30 }) => {
  if ((startDate && !endDate) || (!startDate && endDate)) {
    throw new ApiError(400, "Validation failed", [
      {
        property: startDate ? "endDate" : "startDate",
        message: "startDate and endDate must be provided together",
      },
    ]);
  }

  if (startDate && endDate) {
    const normalizedStartDate = toIsoDate(startDate);
    const normalizedEndDate = toIsoDate(endDate);

    if (normalizedStartDate > normalizedEndDate) {
      throw new ApiError(400, "Validation failed", [
        { property: "startDate", message: "startDate must be earlier than or equal to endDate" },
      ]);
    }

    return {
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      isDefaultRange: false,
    };
  }

  const normalizedEndDate = toIsoDate(date || new Date());
  const end = new Date(`${normalizedEndDate}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() - (defaultDays - 1));

  return {
    startDate: end.toISOString().slice(0, 10),
    endDate: normalizedEndDate,
    isDefaultRange: true,
  };
};

module.exports = { resolveDateRange, resolveRollingWindowRange, toIsoDate };
