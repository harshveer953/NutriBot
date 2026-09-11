import api from './axios'

// POST /api/auth/register  → { name, email, password }
// response: { success, message, user: { _id, name, email, token } }

// POST /api/auth/login     → { email, password }
// response: { success, message, user: { _id, name, email, token } }

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
}
