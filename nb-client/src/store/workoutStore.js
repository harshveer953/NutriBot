import { create } from 'zustand'
import { workoutApi } from '../api/workoutApi'

// Workout fields from backend:
// _id, user, type, durationMinutes, caloriesBurned, notes, workoutDate

const WORKOUT_TYPES = [
  'Strength', 'Cardio', 'HIIT', 'Yoga', 'Cycling',
  'Swimming', 'Running', 'Walking', 'Crossfit', 'Other',
]

const useWorkoutStore = create((set) => ({
  workouts:     [],
  loading:      false,
  error:        null,
  WORKOUT_TYPES,

  fetchWorkouts: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await workoutApi.getWorkouts()
      set({ workouts: data.workouts, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false })
    }
  },

  // body: { type, durationMinutes, caloriesBurned?, notes? }
  addWorkout: async (fields) => {
    try {
      const { data } = await workoutApi.addWorkout(fields)
      set((s) => ({ workouts: [data.workout, ...s.workouts] }))
      return { success: true, workout: data.workout }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to log workout' }
    }
  },

  deleteWorkout: async (id) => {
    try {
      await workoutApi.deleteWorkout(id)
      set((s) => ({ workouts: s.workouts.filter((w) => w._id !== id) }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message }
    }
  },
}))

export default useWorkoutStore
