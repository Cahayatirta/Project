const classifyStressLevel = (averageStressLevel) => {
  const value = Number(averageStressLevel || 0);

  if (value >= 7) {
    return "near_burnout";
  }

  if (value >= 4) {
    return "strained";
  }

  return "refreshed";
};

module.exports = { classifyStressLevel };
