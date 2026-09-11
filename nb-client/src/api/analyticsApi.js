import api from './axios'

// GET /api/analytics
// response: { success, summary, averages: { sleepHours, waterMl, calories }, logs[] }

export const analyticsApi = {
  getAnalytics: () => api.get('/analytics'),
}
