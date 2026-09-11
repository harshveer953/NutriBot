# NutriFit Frontend

React + Tailwind v4 frontend for NutriFit. Fully wired to the Express/MongoDB backend.

## Setup

```bash
npm install
cp .env.example .env
# Set VITE_API_URL in .env to your backend URL
npm run dev
```

## Backend API Routes (exact match)

| Method | Route                  | Controller         |
|--------|------------------------|--------------------|
| POST   | /auth/register         | registerUser       |
| POST   | /auth/login            | loginUser          |
| GET    | /user/profile          | getProfile         |
| PUT    | /user/profile          | updateProfile      |
| POST   | /meals                 | createMeal         |
| GET    | /meals                 | getMeals           |
| DELETE | /meals/:id             | deleteMeal         |
| POST   | /workouts              | addWorkout         |
| GET    | /workouts              | getWorkouts        |
| DELETE | /workouts/:id          | deleteWorkout      |
| PUT    | /daily-log             | upsertDailyLog     |
| GET    | /daily-log/today       | getTodayLog        |
| GET    | /daily-log/weekly      | getWeeklyLogs      |
| GET    | /analytics             | getAnalytics       |
| POST   | /ai/analyze-meal       | analyzeMealImage   |
| POST   | /ai/meal-plan          | generateMealPlan   |
| POST   | /ai/grocery-list       | generateGroceryList|
| POST   | /ai/chat               | healthCoachChat    |

## Auth

Token is returned inside `user.token` from register/login.
Frontend extracts it and stores in `localStorage` as `nf_token`.
All protected routes use `Authorization: Bearer <token>`.
