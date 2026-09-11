import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number
});

const Food = mongoose.model("Food", foodSchema);

export default Food;