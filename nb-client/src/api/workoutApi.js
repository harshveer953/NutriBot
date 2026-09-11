import api from './axios'

// POST /api/workouts
// body: { type, durationMinutes, caloriesBurned?, notes? }
// response: { success, message, workout }

// GET  /api/workouts
// response: { success, count, workouts[] }

// DELETE /api/workouts/:id
// response: { success, message }

export const workoutApi = {
  addWorkout:    (data) => api.post('/workouts', data),
  getWorkouts:   ()     => api.get('/workouts'),
  deleteWorkout: (id)   => api.delete(`/workouts/${id}`),
}
