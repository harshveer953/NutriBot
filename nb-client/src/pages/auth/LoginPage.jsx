import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const { login, loading, token } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form)
    if (result.success) {
      toast.success('Welcome back!')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0d0d0d] border-r border-[#1a1a1a] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#f5c518 1px,transparent 1px),linear-gradient(90deg,#f5c518 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#f5c518] opacity-5 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f5c518] flex items-center justify-center">
            <Zap size={22} className="text-black" fill="black" />
          </div>
          <span className="font-display text-2xl text-white">NUTRIFIT</span>
        </div>

        <div className="relative z-10">
          <p className="section-eyebrow mb-4">Your fitness journey</p>
          <h1 className="font-display text-7xl text-white leading-none mb-6">
            BUILD<br />YOUR<br /><span className="text-[#f5c518]">BODY.</span>
          </h1>
          <p className="text-[#6b7280] text-base max-w-xs leading-relaxed">
            Track macros, log workouts, snap meals with AI, and crush your goals every single day.
          </p>
          <div className="flex gap-8 mt-10">
            {[['10K+', 'Members'], ['95%', 'Goal Rate'], ['4.9★', 'Rating']].map(([val, label]) => (
              <div key={label}>
                <p className="stat-number text-3xl text-white">{val}</p>
                <p className="text-xs font-condensed tracking-widest text-[#4b5563] uppercase mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#2a2a2a] font-condensed tracking-widest uppercase">© 2025 NutriFit</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-md bg-[#f5c518] flex items-center justify-center">
              <Zap size={18} className="text-black" fill="black" />
            </div>
            <span className="font-display text-xl text-white">NUTRIFIT</span>
          </div>

          <p className="section-eyebrow mb-2">Welcome back</p>
          <h2 className="font-display text-5xl text-white mb-8">SIGN IN</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="gym-label">Email</label>
              <input type="email" className="gym-input" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="gym-label">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} className="gym-input pr-12" placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b5563] hover:text-[#9ca3af] transition-colors">
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-yellow w-full justify-center py-3 text-base mt-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                : <>Sign In <ArrowRight size={17} /></>
              }
            </button>
          </form>

          <p className="text-center text-[#4b5563] text-sm mt-6">
            No account?{' '}
            <Link to="/register" className="text-[#f5c518] hover:text-[#fbbf24] font-condensed font-semibold tracking-wide">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
