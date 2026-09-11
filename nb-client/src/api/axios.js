import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://nutribot-fw8p.onrender.com/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// FIX 1: DO NOT use window.location.href — it wipes all React state.
// Fire a custom event instead; AppRoutes catches it and navigates cleanly.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nf_token')
      window.dispatchEvent(new CustomEvent('nf:unauthorized'))
    }
    return Promise.reject(err)
  }
)

export default api
