import express from "express";
import {
  analyzeMealImage,
  generateMealPlan,
  generateGroceryList,
  healthCoachChat,
} from "../controller/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/imageUploadMiddleware.js";


const router = express.Router();

router.post("/analyze-meal", protect, upload.single("image"), analyzeMealImage);
router.post("/meal-plan", protect, generateMealPlan);
router.post("/grocery-list", protect, generateGroceryList);
router.post("/chat", protect, healthCoachChat);

export default router;