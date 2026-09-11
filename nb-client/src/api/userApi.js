import api from './axios'

// GET  /api/user/profile
// response: { success, user }

// PUT  /api/user/profile
// body: { name, age, gender, heightCm, weightKg, goal, activityLevel,
//         caloriesTarget, proteinTarget, carbsTarget, fatsTarget,
//         waterTargetMl, sleepTargetHours }
// response: { success, message, user }

export const userApi = {
  getProfile:    ()     => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
}
