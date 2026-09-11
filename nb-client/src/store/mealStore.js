import { create } from 'zustand'
import { mealApi } from '../api/mealApi'

// ─── Placeholder image ────────────────────────────────────────────────────
// Backend mealController REQUIRES req.file (Cloudinary upload).
// If no image is provided (e.g. AI plan meals), we send a tiny placeholder PNG
// as a File so multer/Cloudinary still works.
const PLACEHOLDER_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

const makePlaceholderFile = () => {
  const byteStr = atob(PLACEHOLDER_PNG_B64)
  const buf     = new Uint8Array(byteStr.length)
  for (let i = 0; i < byteStr.length; i++) buf[i] = byteStr.charCodeAt(i)
  const blob    = new Blob([buf], { type: 'image/png' })
  return new File([blob], 'placeholder.png', { type: 'image/png' })
}

const useMealStore = create((set) => ({
  meals:   [],
  loading: false,
  error:   null,

  fetchMeals: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await mealApi.getMeals()
      set({ meals: data.meals, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false })
    }
  },

  // FIX 3: always attach an image file — use placeholder if none provided
  createMeal: async (fields, imageFile = null) => {
    try {
      const fd = new FormData()
      fd.append('mealType',    fields.mealType)
      fd.append('title',       fields.title)
      fd.append('calories',    fields.calories  ?? 0)
      fd.append('protein',     fields.protein   ?? 0)
      fd.append('carbs',       fields.carbs     ?? 0)
      fd.append('fats',        fields.fats      ?? 0)
      fd.append('ingredients', JSON.stringify(fields.ingredients || []))
      // Always attach a file — backend will crash without it
      fd.append('image', imageFile ?? makePlaceholderFile())

      const { data } = await mealApi.createMeal(fd)
      set((s) => ({ meals: [data.meal, ...s.meals] }))
      return { success: true, meal: data.meal }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to log meal' }
    }
  },

  // Add AI-plan meals directly to store (they're already in DB via backend)
  addMealsToStore: (meals) => {
    set((s) => ({ meals: [...meals, ...s.meals] }))
  },

  deleteMeal: async (id) => {
    try {
      await mealApi.deleteMeal(id)
      set((s) => ({ meals: s.meals.filter((m) => m._id !== id) }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message }
    }
  },
}))

export default useMealStore
