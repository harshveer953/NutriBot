import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Default to OpenRouter free Qwen model, or NVIDIA NIM / OpenAI compatible endpoint
const aiClient = new OpenAI({
  apiKey: process.env.AI_API_KEY || process.env.GROQ_API_KEY || "sk-or-v1-dummy",
  baseURL: process.env.AI_BASE_URL || "https://openrouter.ai/api/v1",
});

export const AI_MODEL = process.env.AI_MODEL || "qwen/qwen-2.5-72b-instruct:free";

export default aiClient;
