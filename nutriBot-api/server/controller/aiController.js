import fs from "fs";
import mime from "mime-types";
import aiClient, { AI_MODEL } from "../config/aiConfig.js";
import Meal from "../models/Meal.js";
import DailyLog from "../models/DailyLog.js";
import asyncHandler from "../utils/asyncHandler.js";

const safeJsonParse = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// 🔹 Image analyze
const analyzeMealImage = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Image AI analysis not supported yet",
  });
});

// 🔥 FINAL: Generate + Save Meal Plan (WITH planId + duplicate fix)
const generateMealPlan = asyncHandler(async (req, res) => {
  const { goal, caloriesTarget, dietaryPreference, days = 7 } = req.body;

  const response = await aiClient.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a professional nutrition expert. Always return responses in valid JSON format only, without markdown fences.",
      },
      {
        role: "user",
        content: `Create a ${days}-day meal plan.

Goal: ${goal}
Calories target: ${caloriesTarget}
Dietary preference: ${dietaryPreference}

Return JSON in this format:
{
  "breakfast": { "title": "Oatmeal with Almonds", "calories": 400, "protein": 15, "carbs": 55, "fats": 12 },
  "lunch": { "title": "Grilled Chicken Salad", "calories": 650, "protein": 45, "carbs": 40, "fats": 20 },
  "dinner": { "title": "Salmon with Quinoa", "calories": 600, "protein": 40, "carbs": 50, "fats": 18 },
  "snack": { "title": "Greek Yogurt with Berries", "calories": 250, "protein": 18, "carbs": 25, "fats": 5 }
}
ONLY JSON.`,
      },
    ],
  });

  const result = safeJsonParse(response.choices[0].message.content);

  if (!result) {
    res.status(500);
    throw new Error("Invalid AI response format");
  }

  const userId = req.user._id;

  // 🔥 UNIQUE planId (each plan alag rahega)
  const planId = new Date().getTime().toString();

  // 🔥 (OPTIONAL) old auto-generated meals delete (clean UX)
  await Meal.deleteMany({ user: userId, planId: { $ne: null } });

  // 👉 Convert AI → Meal docs
  const mealsToSave = Object.entries(result).map(([type, meal]) => ({
    user: userId,
    mealType: type,
    title: meal?.title || meal?.name || "Meal",
    calories: Number(meal?.calories) || 0,
    protein: Number(meal?.protein) || 0,
    carbs: Number(meal?.carbs) || 0,
    fats: Number(meal?.fats) || 0,
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60",
    planId, // 🔥 important
  }));

  const savedMeals = await Meal.insertMany(mealsToSave);

  res.status(201).json({
    success: true,
    message: "Meal plan generated & saved",
    planId,
    meals: savedMeals,
  });
});

// 🔹 Grocery list
const generateGroceryList = asyncHandler(async (req, res) => {
  const { mealPlan } = req.body;

  if (!mealPlan) {
    res.status(400);
    throw new Error("Meal plan is required");
  }

  const response = await aiClient.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a meal preparation and grocery planning assistant. Convert the given meal plan into a clean categorized grocery shopping list.",
      },
      {
        role: "user",
        content: `Convert this meal plan into a grouped grocery list by categories (e.g., Protein, Vegetables, Fruits, Grains, Dairy, Spices & Pantry).

Meal plan:
${JSON.stringify(mealPlan, null, 2)}

Provide clear item names with quantities.`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  const parsed = safeJsonParse(content);

  res.status(200).json({
    success: true,
    groceryList: parsed || content,
  });
});

// 🔹 Health coach chat
const healthCoachChat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }

  const recentMeals = await Meal.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const recentLogs = await DailyLog.find({ user: req.user._id })
    .sort({ date: -1 })
    .limit(7)
    .lean();

  const response = await aiClient.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: "You are NutriBot, an encouraging and highly knowledgeable AI health & fitness coach powered by Qwen. Give practical, actionable nutrition and fitness advice.",
      },
      {
        role: "user",
        content: `
User message:
${message}

Recent meals:
${JSON.stringify(recentMeals)}

Recent logs:
${JSON.stringify(recentLogs)}

Give practical nutrition and fitness advice tailored to the user.`,
      },
    ],
  });

  res.status(200).json({
    success: true,
    reply: response.choices[0].message.content,
  });
});

export {
  analyzeMealImage,
  generateMealPlan,
  generateGroceryList,
  healthCoachChat,
};