import api from './axios'

// POST /api/meals  (multipart/form-data)
// body: { mealType, title, ingredients (JSON string or array),
//         calories, protein, carbs, fats, image? (file) }
// response: { success, message, meal }

// GET  /api/meals
// response: { success, count, meals[] }

// DELETE /api/meals/:id
// response: { success, message }

export const mealApi = {
  createMeal: (formData) =>
    api.post('/meals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getMeals: () => api.get('/meals'),

  deleteMeal: (id) => api.delete(`/meals/${id}`),
}
