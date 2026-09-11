import express from "express";
import {  createMeal,  getMeals,  deleteMeal,} from "../controller/mealController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/imageUploadMiddleware.js";


const router = express.Router();

router
  .route("/")
  .post(protect, upload.single("image"), createMeal)
  .get(protect, getMeals);

router.delete("/:id", protect, deleteMeal);

export default router;