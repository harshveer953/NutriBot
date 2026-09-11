import api from './axios'

// Backend routes (server.js): app.use("/api/daily-logs", dailyLogRoutes)
// PUT  /api/daily-logs         → upsertDailyLog
// GET  /api/daily-logs/today   → getTodayLog
// GET  /api/daily-logs/weekly  → getWeeklyLogs

export const dailyLogApi = {
  upsertLog:     (data) => api.put('/daily-logs', data),
  getTodayLog:   ()     => api.get('/daily-logs/today'),
  getWeeklyLogs: ()     => api.get('/daily-logs/weekly'),
}
