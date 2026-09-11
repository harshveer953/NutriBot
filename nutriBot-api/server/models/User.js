import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password required"],
      minlength: 6,
    },

    age: Number,

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    heightCm: Number,
    weightKg: Number,

    goal: {
      type: String,
      enum: ["weight-loss", "muscle-gain", "maintenance"],
      default: "maintenance",
    },

    // 🔥 FIXED (REAL WORLD VALUES)
    activityLevel: {
      type: String,
      enum: [
        "sedentary",
        "light",
        "moderate",
        "active",
        "very-active",
      ],
      default: "moderate",
    },

    // 🔹 Nutrition Targets
    caloriesTarget: {
      type: Number,
      default: 2000,
    },

    proteinTarget: {
      type: Number,
      default: 100,
    },

    carbsTarget: {
      type: Number,
      default: 250,
    },

    fatsTarget: {
      type: Number,
      default: 70,
    },

    // 🔹 Health Goals
    waterTargetMl: {
      type: Number,
      default: 3000,
    },

    sleepTargetHours: {
      type: Number,
      default: 8,
    },

    // 🔹 Daily Tracking
    todayWaterMl: {
      type: Number,
      default: 0,
    },

    todaySteps: {
      type: Number,
      default: 0,
    },

    // 🔹 Gamification
    streak: {
      type: Number,
      default: 0,
    },

    badges: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// 🔐 Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔐 Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;