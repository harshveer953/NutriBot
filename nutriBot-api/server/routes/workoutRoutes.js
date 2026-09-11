import express from "express";
import {
  addWorkout,
  getWorkouts,
  deleteWorkout,
} from "../controller/workoutController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, addWorkout).get(protect, getWorkouts);
router.delete("/:id", protect, deleteWorkout);

export default router;