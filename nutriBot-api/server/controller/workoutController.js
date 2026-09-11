import Workout from "../models/Workout.js";
import asyncHandler from "../utils/asyncHandler.js";

const addWorkout = asyncHandler(async (req, res) => {
  const { type, durationMinutes, caloriesBurned, notes } = req.body;

  if (!type || !durationMinutes) {
    res.status(400);
    throw new Error("Workout type and duration are required");
  }

  const workout = await Workout.create({
    user: req.user._id,
    type,
    durationMinutes,
    caloriesBurned,
    notes,
  });

  res.status(201).json({
    success: true,
    message: "Workout logged successfully",
    workout,
  });
});

const getWorkouts = asyncHandler(async (req, res) => {
  const workouts = await Workout.find({ user: req.user._id }).sort({
    workoutDate: -1,
  });

  res.status(200).json({
    success: true,
    count: workouts.length,
    workouts,
  });
});

const deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!workout) {
    res.status(404);
    throw new Error("Workout not found");
  }

  await workout.deleteOne();

  res.status(200).json({
    success: true,
    message: "Workout deleted successfully",
  });
});

export { addWorkout, getWorkouts, deleteWorkout };