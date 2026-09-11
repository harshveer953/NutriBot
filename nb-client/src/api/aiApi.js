import api from './axios'

// ─── /api/ai ───────────────────────────────────────────────────────────────
//
// POST /api/ai/analyze-meal  (multipart)
//   body:     { image: File }
//   response: { success: true, message: "Image AI analysis not supported yet" }
//   NOTE: backend stub — not implemented yet, handle gracefully
//
// POST /api/ai/meal-plan
//   body:     { goal, caloriesTarget, dietaryPreference, days? }
//   response: { success, message, planId, meals: Meal[] }
//   NOTE: backend ALREADY saves meals to DB with planId. No need to save again.
//
// POST /api/ai/grocery-list
//   body:     { mealPlan }   ← pass anything, backend stringifies it
//   response: { success, groceryList }   ← raw LLM text (may not be JSON)
//
// POST /api/ai/chat
//   body:     { message }
//   response: { success, reply }
//
// ─── /api/meals-ai ─────────────────────────────────────────────────────────
//
// POST /api/meals-ai/analyze-text
//   body:     { text }  ← e.g. "2 plates of paneer rice"
//   response: { success, meal: { title, calories, protein, carbs, fats } }
//   NOTE: looks up Food collection — food must exist in DB

export const aiApi = {
  // Image analyze — backend stub, returns success:true with stub message
  analyzeMeal: (formData) =>
    api.post('/ai/analyze-meal', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    }),

  // Returns { planId, meals[] } — backend already saved to DB
  generateMealPlan: (data) => api.post('/ai/meal-plan', data),

  generateGroceryList: (mealPlan) =>
    api.post('/ai/grocery-list', { mealPlan }),

  chat: (message) => api.post('/ai/chat', { message }),

  // NEW — text → macros via Food DB lookup
  analyzeMealText: (text) => api.post('/meals-ai/analyze-text', { text }),
}
