import DailyLog from "../models/DailyLog.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const getDateString = (date = new Date()) => {
  return new Date(date).toISOString().split("T")[0];
};

const upsertDailyLog = asyncHandler(async (req, res) => {
  const { waterMl, steps, sleepHours } = req.body;
  const today = getDateString();

  let dailyLog = await DailyLog.findOne({
    user: req.user._id,
    date: today,
  });

  if (!dailyLog) {
    dailyLog = await DailyLog.create({
      user: req.user._id,
      date: today,
    });
  }

  if (waterMl !== undefined) dailyLog.waterMl = waterMl;
  if (steps !== undefined) dailyLog.steps = steps;
  if (sleepHours !== undefined) dailyLog.sleepHours = sleepHours;

  await dailyLog.save();

  await User.findByIdAndUpdate(req.user._id, {
    todayWaterMl: dailyLog.waterMl,
    todaySteps: dailyLog.steps,
  });

  res.status(200).json({
    success: true,
    message: "Daily log updated successfully",
    dailyLog,
  });
});

const getTodayLog = asyncHandler(async (req, res) => {
  const today = getDateString();

  const dailyLog = await DailyLog.findOne({
    user: req.user._id,
    date: today,
  });

  res.status(200).json({
    success: true,
    dailyLog: dailyLog || null,
  });
});

const getWeeklyLogs = asyncHandler(async (req, res) => {
  const logs = await DailyLog.find({ user: req.user._id })
    .sort({ date: -1 })
    .limit(7);

  res.status(200).json({
    success: true,
    logs: logs.reverse(),
  });
});

export { upsertDailyLog, getTodayLog, getWeeklyLogs };