const { ApiError } = require("./api-error");

const toIsoDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "Invalid date");
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
      throw new ApiError(400, "month must use YYYY-MM format");
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

  throw new ApiError(400, "period must be daily or monthly");
};

module.exports = { resolveDateRange, toIsoDate };
