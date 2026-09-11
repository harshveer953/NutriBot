import DailyLog from "../models/DailyLog.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAnalytics = asyncHandler(async (req, res) => {
  const logs = await DailyLog.find({ user: req.user._id })
    .sort({ date: -1 })
    .limit(14);

  if (!logs.length) {
    return res.status(200).json({
      success: true,
      summary: "No analytics available yet",
      logs: [],
    });
  }

  const totalSleep =
    logs.reduce((sum, log) => sum + (log.sleepHours || 0), 0) / logs.length;

  const totalWater =
    logs.reduce((sum, log) => sum + (log.waterMl || 0), 0) / logs.length;

  const totalCalories =
    logs.reduce((sum, log) => sum + (log.totalCalories || 0), 0) / logs.length;

  let summary = "You are building consistency.";
  if (totalSleep < 6) {
    summary = "Your sleep is low on average. Recovery may be affected.";
  } else if (totalWater < 2000) {
    summary = "Your hydration is below ideal. Try increasing water intake.";
  } else if (totalCalories > 2800) {
    summary = "Your calorie intake is relatively high recently.";
  }

  res.status(200).json({
    success: true,
    summary,
    averages: {
      sleepHours: Number(totalSleep.toFixed(1)),
      waterMl: Number(totalWater.toFixed(0)),
      calories: Number(totalCalories.toFixed(0)),
    },
    logs: logs.reverse(),
  });
});

export { getAnalytics };