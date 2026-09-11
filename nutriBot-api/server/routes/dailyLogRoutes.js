import express from "express";
import {
  upsertDailyLog,
  getTodayLog,
  getWeeklyLogs,
} from "../controller/dailyLogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/", protect, upsertDailyLog);
router.get("/today", protect, getTodayLog);
router.get("/weekly", protect, getWeeklyLogs);

export default router;