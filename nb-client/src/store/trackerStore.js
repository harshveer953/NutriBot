import { create } from 'zustand'
import { dailyLogApi } from '../api/dailyLogApi'

const useTrackerStore = create((set, get) => ({
  todayLog:   null,
  weeklyLogs: [],
  loading:    false,

  targets: {
    caloriesTarget:   2000,
    proteinTarget:    150,
    carbsTarget:      200,
    fatsTarget:       65,
    waterTargetMl:    2500,
    sleepTargetHours: 8,
  },

  setTargets: (t) => set({ targets: t }),

  fetchTodayLog: async () => {
    set({ loading: true })
    try {
      const { data } = await dailyLogApi.getTodayLog()
      set({
        todayLog: data.dailyLog || {
          waterMl: 0, steps: 0, sleepHours: 0,
          totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0,
        },
        loading: false,
      })
    } catch (_) {
      set({ loading: false })
    }
  },

  fetchWeeklyLogs: async () => {
    try {
      const { data } = await dailyLogApi.getWeeklyLogs()
      set({ weeklyLogs: data.logs || [] })
    } catch (_) {}
  },

  // FIX 2: updateLog must NOT overwrite todayLog with the API response.
  // Doing so causes the store value to change → MetricCard's useEffect
  // fires → resets the user's locally edited value mid-interaction.
  // We only merge in the specific fields that were sent, leaving the
  // rest of todayLog (macro totals etc.) intact.
  updateLog: async (fields) => {
    try {
      await dailyLogApi.upsertLog(fields)
      // Intentionally NOT doing: set({ todayLog: data.dailyLog })
      // Optimistic state set by setWater/setSteps/setSleep is already correct.
      return { success: true }
    } catch (err) {
      // On failure: re-fetch to get truth from server
      get().fetchTodayLog()
      return { success: false, error: err.response?.data?.message }
    }
  },

  // Optimistic helpers: update UI instantly, then fire-and-forget sync
  setWater: async (waterMl) => {
    set((s) => ({ todayLog: { ...s.todayLog, waterMl } }))
    return await get().updateLog({ waterMl })
  },

  setSteps: async (steps) => {
    set((s) => ({ todayLog: { ...s.todayLog, steps } }))
    return await get().updateLog({ steps })
  },

  setSleep: async (sleepHours) => {
    set((s) => ({ todayLog: { ...s.todayLog, sleepHours } }))
    return await get().updateLog({ sleepHours })
  },

  bumpMacros: (calories, protein, carbs, fats) => {
    set((s) => ({
      todayLog: {
        ...s.todayLog,
        totalCalories: (s.todayLog?.totalCalories || 0) + Number(calories),
        totalProtein:  (s.todayLog?.totalProtein  || 0) + Number(protein),
        totalCarbs:    (s.todayLog?.totalCarbs    || 0) + Number(carbs),
        totalFats:     (s.todayLog?.totalFats     || 0) + Number(fats),
      },
    }))
  },

  subtractMacros: (calories, protein, carbs, fats) => {
    set((s) => ({
      todayLog: {
        ...s.todayLog,
        totalCalories: Math.max(0, (s.todayLog?.totalCalories || 0) - Number(calories)),
        totalProtein:  Math.max(0, (s.todayLog?.totalProtein  || 0) - Number(protein)),
        totalCarbs:    Math.max(0, (s.todayLog?.totalCarbs    || 0) - Number(carbs)),
        totalFats:     Math.max(0, (s.todayLog?.totalFats     || 0) - Number(fats)),
      },
    }))
  },

  getProgress: () => {
    const { todayLog, targets } = get()
    if (!todayLog) return {}
    const pct = (val, goal) => Math.min(Math.round((val / goal) * 100), 100)
    return {
      calories: pct(todayLog.totalCalories, targets.caloriesTarget),
      protein:  pct(todayLog.totalProtein,  targets.proteinTarget),
      carbs:    pct(todayLog.totalCarbs,    targets.carbsTarget),
      fats:     pct(todayLog.totalFats,     targets.fatsTarget),
      water:    pct(todayLog.waterMl,       targets.waterTargetMl),
      sleep:    pct(todayLog.sleepHours,    targets.sleepTargetHours),
    }
  },
}))

export default useTrackerStore
