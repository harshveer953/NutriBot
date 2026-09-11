import express from "express";
import { analyzeMealText } from "../controller/mealAiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/analyze-text", protect, analyzeMealText);

export default router;