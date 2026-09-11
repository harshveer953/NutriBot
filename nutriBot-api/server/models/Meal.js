import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String },
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    ingredients: [ingredientSchema],

    calories: {
      type: Number,
      default: 0,
      min: 0,
    },
    protein: {
      type: Number,
      default: 0,
      min: 0,
    },
    carbs: {
      type: Number,
      default: 0,
      min: 0,
    },
    fats: {
      type: Number,
      default: 0,
      min: 0,
    },

    image: {
      type: String,
      required: [true, "Please Enter Image URL"],
    },

    // 🔥 IMPORTANT: day-wise tracking
    loggedAt: {
      type: Date,
      default: Date.now,
    },

    // 🔥 NEW: plan grouping (VERY IMPORTANT)
    planId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// 🔥 index for fast queries
mealSchema.index({ user: 1, loggedAt: -1 });

const Meal = mongoose.model("Meal", mealSchema);

export default Meal;