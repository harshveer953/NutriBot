import Meal from "../models/Meal.js";
import DailyLog from "../models/DailyLog.js";
import asyncHandler from "../utils/asyncHandler.js";
import fs from "node:fs"
import uploadToCloudinary from "../middleware/cloudinaryMiddleware.js"

const getDateString = (date = new Date()) => {
  return new Date(date).toISOString().split("T")[0];
};

const createMeal = asyncHandler(async (req, res) => {
  const {
    mealType,
    title,
    ingredients = [],
    calories = 0,
    protein = 0,
    carbs = 0,
    fats = 0,
  } = req.body;

  if (!mealType || !title) {
    res.status(400);
    throw new Error("Meal type and title are required");
  }

  let imageUrl = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60";
  if (req.file && req.file.path) {
    try {
      // upload to cloudinary
      const uploadResult = await uploadToCloudinary(req.file.path);
      imageUrl = uploadResult.secure_url;
      // Remove image from server
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  }

  const meal = await Meal.create({
    user: req.user._id,
    mealType,
    title,
    ingredients:
      typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients,
    calories: Number(calories) || 0,
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fats: Number(fats) || 0,
    image: imageUrl,
  });

  

  const today = getDateString();

  let dailyLog = await DailyLog.findOne({ user: req.user._id, date: today });

  if (!dailyLog) {
    dailyLog = await DailyLog.create({
      user: req.user._id,
      date: today,
    });
  }

  dailyLog.totalCalories += Number(calories);
  dailyLog.totalProtein += Number(protein);
  dailyLog.totalCarbs += Number(carbs);
  dailyLog.totalFats += Number(fats);

  await dailyLog.save();

  res.status(201).json({
    success: true,
    message: "Meal logged successfully",
    meal,
  });

  
});

const getMeals = asyncHandler(async (req, res) => {
  const meals = await Meal.find({ user: req.user._id }).sort({ loggedAt: -1 });

  res.status(200).json({
    success: true,
    count: meals.length,
    meals,
  });
});

const deleteMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });

  if (!meal) {
    res.status(404);
    throw new Error("Meal not found");
  }

  const date = getDateString(meal.loggedAt);
  const dailyLog = await DailyLog.findOne({ user: req.user._id, date });

  if (dailyLog) {
    dailyLog.totalCalories = Math.max(0, dailyLog.totalCalories - meal.calories);
    dailyLog.totalProtein = Math.max(0, dailyLog.totalProtein - meal.protein);
    dailyLog.totalCarbs = Math.max(0, dailyLog.totalCarbs - meal.carbs);
    dailyLog.totalFats = Math.max(0, dailyLog.totalFats - meal.fats);
    await dailyLog.save();
  }

  await meal.deleteOne();

  res.status(200).json({
    success: true,
    message: "Meal deleted successfully",
  });
});

export { createMeal, getMeals, deleteMeal };