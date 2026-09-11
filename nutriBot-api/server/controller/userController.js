import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";

/**
 * 🔥 Utility: Auto Calories + Macros
 */
const calculateNutrition = ({
  gender,
  weightKg,
  heightCm,
  age,
  activityLevel,
  goal,
}) => {
  if (!gender || !weightKg || !heightCm || !age) return null;

  // 🔹 BMR (Mifflin-St Jeor)
  let bmr;

  if (gender === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  // 🔹 Activity multiplier
  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    "very-active": 1.9,
  };

  const activityMultiplier = activityMap[activityLevel] || 1.55;

  let calories = bmr * activityMultiplier;

  // 🔹 Goal adjustment
  if (goal === "weight-loss") calories -= 400;
  if (goal === "muscle-gain") calories += 300;

  calories = Math.round(calories);

  // 🔹 Macros
  const protein = Math.round(weightKg * 1.8);
  const fats = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - (protein * 4 + fats * 9)) / 4);

  return {
    calories,
    protein,
    carbs,
    fats,
  };
};

/**
 * GET PROFILE
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    success: true,
    user,
  });
});

/**
 * UPDATE PROFILE
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const {
    name,
    age,
    gender,
    heightCm,
    weightKg,
    goal,
    activityLevel,
    caloriesTarget,
    proteinTarget,
    carbsTarget,
    fatsTarget,
    waterTargetMl,
    sleepTargetHours,
  } = req.body;

  // 🔥 Activity mapping
  const activityMap = {
    "Sedentary": "sedentary",
    "Lightly Active": "light",
    "Moderately Active": "moderate",
    "Very Active": "active",
    "Super Active": "very-active",
  };

  const allowedActivity = [
    "sedentary",
    "light",
    "moderate",
    "active",
    "very-active",
  ];

  // ✅ update basic fields
  if (name !== undefined) user.name = name;
  if (age !== undefined) user.age = Number(age);
  if (gender !== undefined) user.gender = gender;
  if (heightCm !== undefined) user.heightCm = Number(heightCm);
  if (weightKg !== undefined) user.weightKg = Number(weightKg);
  if (goal !== undefined) user.goal = goal;

  if (activityLevel !== undefined) {
    const mapped = activityMap[activityLevel] || activityLevel;

    user.activityLevel = allowedActivity.includes(mapped)
      ? mapped
      : "moderate";
  }

  if (waterTargetMl !== undefined) user.waterTargetMl = Number(waterTargetMl);
  if (sleepTargetHours !== undefined) user.sleepTargetHours = Number(sleepTargetHours);

  // 🔥 AUTO CALCULATION (MAIN LOGIC)
  const nutrition = calculateNutrition({
    gender: user.gender,
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    age: user.age,
    activityLevel: user.activityLevel,
    goal: user.goal,
  });

  // 👉 Manual override OR auto
  if (caloriesTarget !== undefined) {
    user.caloriesTarget = Number(caloriesTarget);
  } else if (nutrition) {
    user.caloriesTarget = nutrition.calories;
  }

  if (proteinTarget !== undefined) {
    user.proteinTarget = Number(proteinTarget);
  } else if (nutrition) {
    user.proteinTarget = nutrition.protein;
  }

  if (carbsTarget !== undefined) {
    user.carbsTarget = Number(carbsTarget);
  } else if (nutrition) {
    user.carbsTarget = nutrition.carbs;
  }

  if (fatsTarget !== undefined) {
    user.fatsTarget = Number(fatsTarget);
  } else if (nutrition) {
    user.fatsTarget = nutrition.fats;
  }

  try {
    const updatedUser = await user.save();

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.log("❌ SAVE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

export { getProfile, updateProfile };