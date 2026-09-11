import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const { register, loading, token } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await register(form)
    if (result.success) {
      toast.success('Account created! Let\'s crush it 💪')
    } else {
      toast.error(result.error)
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-lg bg-[#f5c518] flex items-center justify-center">
            <Zap size={20} className="text-black" fill="black" />
          </div>
          <span className="font-display text-2xl text-white">NUTRIFIT</span>
        </div>

        <p className="section-eyebrow mb-2">Create account</p>
        <h2 className="font-display text-5xl text-white mb-8">GET STARTED</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="gym-label">Full Name</label>
            <input className="gym-input" placeholder="John Doe"
              value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="gym-label">Email</label>
            <input type="email" className="gym-input" placeholder="you@example.com"
              value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="gym-label">Password</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} className="gym-input pr-12"
                placeholder="Min 8 characters" value={form.password}
                onChange={set('password')} required minLength={8} />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b5563] hover:text-[#9ca3af]">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-yellow w-full justify-center py-3 text-base mt-2">
            {loading
              ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              : <>Create Account <ArrowRight size={17} /></>
            }
          </button>
        </form>

        <p className="text-xs text-[#3a3a3a] text-center mt-4">
          You can set your goals & targets from your profile after signing up.
        </p>

        <p className="text-center text-[#4b5563] text-sm mt-4">
          Have an account?{' '}
          <Link to="/login" className="text-[#f5c518] hover:text-[#fbbf24] font-condensed font-semibold tracking-wide">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
