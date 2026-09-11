// FIX 4: plan is flat Meal[] (backend already saves, returns flat array with planId)
import { create } from 'zustand'

const useMealPlanStore = create((set) => ({
  plan:   null,   // Meal[] from backend response
  planId: null,   // planId returned by backend
  prefs: {
    goal: 'Build Muscle', caloriesTarget: 2400,
    dietaryPreference: 'None', days: 7,
  },

  setPlan:   (meals, planId = null) => set({ plan: meals, planId }),
  clearPlan: ()                     => set({ plan: null, planId: null }),
  setPrefs:  (p)                    => set((s) => ({ prefs: { ...s.prefs, ...p } })),
}))

export default useMealPlanStore
