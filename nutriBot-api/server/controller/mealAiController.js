import asyncHandler from "../utils/asyncHandler.js";
import aiClient, { AI_MODEL } from "../config/aiConfig.js";
import Food from "../models/Food.js";

const analyzeMealText = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error("Food text required");
  }

  // AI request
  const aiResponse = await aiClient.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a food and nutrition analysis assistant. Extract the food name and numeric quantity from the user's input. Return valid JSON only.",
      },
      {
        role: "user",
        content: `
Extract food name and quantity from this text.

Text: ${text}

Return ONLY valid JSON.

Example:
{
 "food": "paneer rice",
 "quantity": 2
}
`,
      },
    ],
  });

  const raw = aiResponse.choices[0].message.content;

  // SAFE JSON extraction
  const jsonMatch = raw.match(/\{[\s\S]*?\}/);

  if (!jsonMatch) {
    res.status(500);
    throw new Error("AI did not return valid JSON");
  }

  let parsed;

  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    res.status(500);
    throw new Error("Failed to parse AI JSON response");
  }

  const foodName = parsed.food?.toLowerCase();
  const quantity = Number(parsed.quantity) || 1;

  if (!foodName) {
    res.status(400);
    throw new Error("Food name not detected");
  }

  // DB lookup
  let food = await Food.findOne({ name: foodName });

  // If not found in exact food DB, calculate estimated macros gracefully
  let meal;
  if (food) {
    meal = {
      title: food.name,
      calories: food.calories * quantity,
      protein: food.protein * quantity,
      carbs: food.carbs * quantity,
      fats: food.fats * quantity,
    };
  } else {
    // Fallback estimation so user request doesn't fail if food DB is empty
    meal = {
      title: foodName,
      calories: Math.round(250 * quantity),
      protein: Math.round(10 * quantity),
      carbs: Math.round(30 * quantity),
      fats: Math.round(8 * quantity),
    };
  }

  res.status(200).json({
    success: true,
    meal,
  });
});

export { analyzeMealText };