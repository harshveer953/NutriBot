# 🧠 NutriBot — Project Brain & Architecture Documentation

NutriBot is a comprehensive AI-powered fitness, nutrition tracking, and health coaching application built with a modern decoupled client-server architecture.

---

## 🏗️ 1. High-Level Architecture

```mermaid
graph TD
    User([User Browser]) <--> Client[Frontend: nb-client (React + Vite + Zustand)]
    Client <-->|REST API / JSON| Server[Backend: nutriBot-api (Node.js + Express)]
    Server <--> Database[(MongoDB Atlas)]
    Server <--> Cloudinary[Cloudinary Media Storage]
    Server <--> QwenAI[Qwen 3.8 AI Engine via Groq]
```

* **Frontend (`nb-client`)**: React 18 SPA built on Vite, styled with custom Gym/Cyberpunk design system, state-managed with Zustand.
* **Backend (`nutriBot-api`)**: Modular Express.js REST API with ES modules (`"type": "module"`), MongoDB via Mongoose, JWT authentication, and AI completion services.
* **AI Provider**: Qwen 3.8 model (`qwen/qwen3.8-27b`) running with high-speed inference.

---

## 🤖 2. AI Engine & Architecture (Qwen Integration)

### Configuration: `server/config/aiConfig.js`
Uses the standard OpenAI SDK client configured with Groq API credentials for high-throughput, low-latency Qwen model inference.

```javascript
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const aiClient = new OpenAI({
  apiKey: process.env.AI_API_KEY || process.env.GROQ_API_KEY,
  baseURL: process.env.AI_BASE_URL || "https://api.groq.com/openai/v1",
});

export const AI_MODEL = process.env.AI_MODEL || "qwen/qwen3.8-27b";
export default aiClient;
```

### AI Capabilities:
1. **Health Coach Chat (`/api/ai/chat`)**: Personalized conversational health and nutrition coaching incorporating user's recent meals and 7-day logs.
2. **Automated Meal Planner (`/api/ai/meal-plan`)**: Generates structured 3-7 day nutrition plans with calorie and macro targets, automatically saved into the database with unique `planId`.
3. **Smart Grocery List (`/api/ai/grocery-list`)**: Transforms structured meal plans into categorized shopping lists (Proteins, Veggies, Grains, Dairy, etc.).
4. **Food Text Macro Extraction (`/api/meals-ai/analyze-text`)**: Parses natural language text into portion quantities and maps them to food database macros.

---

## ⚙️ 3. Backend Endpoints & Data Flow (`nutriBot-api`)

| Category | Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :---: | :--- |
| **Auth** | `/api/auth/register` | `POST` | ❌ | Register user with hashed password & JWT generation |
| | `/api/auth/login` | `POST` | ❌ | User login & return user object with JWT |
| **User Profile** | `/api/user/profile` | `GET` | ✅ | Fetch profile details & macro targets |
| | `/api/user/profile` | `PUT` | ✅ | Update biometric info & auto-calculate BMR/macros |
| **Meals** | `/api/meals` | `GET` | ✅ | Fetch logged meals (sorted newest first) |
| | `/api/meals` | `POST` | ✅ | Create meal (optional image upload to Cloudinary) & updates DailyLog |
| | `/api/meals/:id` | `DELETE` | ✅ | Delete meal & subtract macros from DailyLog |
| **Workouts** | `/api/workouts` | `GET` | ✅ | Fetch user workouts |
| | `/api/workouts` | `POST` | ✅ | Log new workout (duration, calories, notes) |
| | `/api/workouts/:id` | `DELETE` | ✅ | Delete workout record |
| **Daily Logs** | `/api/daily-logs/today` | `GET` | ✅ | Get today's water, steps, sleep, and macro totals |
| | `/api/daily-logs/weekly` | `GET` | ✅ | Get 7-day tracking history |
| | `/api/daily-logs` | `PUT` | ✅ | Upsert daily tracking (water, steps, sleep) |
| **Analytics** | `/api/analytics` | `GET` | ✅ | 14-day aggregate health analytics & health summary |
| **AI Services** | `/api/ai/chat` | `POST` | ✅ | Interactive Qwen Health Coach chat |
| | `/api/ai/meal-plan` | `POST` | ✅ | AI meal plan generator |
| | `/api/ai/grocery-list` | `POST` | ✅ | Convert meal plan to shopping list |
| | `/api/meals-ai/analyze-text` | `POST` | ✅ | Natural language meal text analyzer |

---

## 💻 4. Frontend State & Architecture (`nb-client`)

### Zustand Stores:
* **`authStore.js`**: Manages user authentication state, token persistence in `localStorage ('nf_token')`, and hydration.
* **`trackerStore.js`**: Handles optimistic UI updates for water, steps, sleep, and synchronizes macro totals with backend.
* **`mealStore.js`**: Manages logged meals, image creation fallbacks, and deletions.
* **`workoutStore.js`**: Manages workout history and active logging.
* **`mealPlanStore.js`**: Stores active generated AI meal plans and user preferences.

### Dynamic API Client: `nb-client/src/api/axios.js`
* Base URL is configured dynamically via environment variables:
  `baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'`
* Automatically attaches JWT `Authorization: Bearer <token>` header to all requests.
* Dispatches `nf:unauthorized` custom event on `401 Unauthorized` without forcing a full page reload.

---

## 🌐 5. Deployment Guide (Render)

### Step 1: Deploy Backend (`nutriBot-api`) on Render
1. Create a **New Web Service** on [Render Dashboard](https://dashboard.render.com).
2. Connect your Git repository.
3. Set the following Build & Run settings:
   * **Root Directory**: `nutriBot-api`
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start` (or `node server/server.js`)
4. Add **Environment Variables** in Render:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `10000` | Port provided by Render (or leave default) |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB connection URI |
| `JWT_SECRET` | `your_secret_key_here` | Secret key for signing JWTs |
| `JWT_EXPIRE` | `30d` | JWT expiration duration |
| `CLOUDINARY_API_KEY` | `your_key` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `your_secret` | Cloudinary API Secret |
| `CLOUDINARY_URL` | `cloudinary://...` | Full Cloudinary connection string |
| `GROQ_API_KEY` | `gsk_...` | Groq API Key |
| `AI_API_KEY` | `gsk_...` | AI Key (same as Groq Key) |
| `AI_BASE_URL` | `https://api.groq.com/openai/v1` | AI endpoint |
| `AI_MODEL` | `qwen/qwen3.8-27b` | Qwen model identifier |
| `CLIENT_URL` | `https://your-frontend-domain.vercel.app` | Allowed CORS origin (or `*`) |

---

### Step 2: Connect Frontend (`nb-client`) to Deployed Backend
Once Render gives you the live backend URL (e.g. `https://nutribot-api.onrender.com`):

1. In `nb-client/.env`, update:
```env
VITE_API_URL=https://nutribot-api.onrender.com/api
```
2. Build or deploy frontend on Vercel / Netlify / Render Static Site.
