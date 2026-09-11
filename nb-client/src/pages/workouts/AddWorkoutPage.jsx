import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import useWorkoutStore from '../../store/workoutStore'
import toast from 'react-hot-toast'

const TYPES = ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Cycling', 'Swimming', 'Running', 'Walking', 'Crossfit', 'Other']

export default function AddWorkoutPage() {
  const [form, setForm] = useState({
    type: '', durationMinutes: '', caloriesBurned: '', notes: ''
  })
  const [saving, setSaving] = useState(false)
  const { addWorkout }      = useWorkoutStore()
  const navigate            = useNavigate()

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.type)            return toast.error('Select workout type')
    if (!form.durationMinutes) return toast.error('Enter duration')

    setSaving(true)
    const result = await addWorkout({
      type:            form.type,
      durationMinutes: Number(form.durationMinutes),
      caloriesBurned:  form.caloriesBurned ? Number(form.caloriesBurned) : undefined,
      notes:           form.notes || undefined,
    })

    if (result.success) {
      toast.success('Workout logged! 💪')
      navigate('/workouts')
    } else {
      toast.error(result.error || 'Failed')
    }
    setSaving(false)
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <p className="section-eyebrow">Training</p>
        <h1 className="font-display text-4xl text-white">LOG WORKOUT</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type selector */}
        <div className="gym-card p-5">
          <label className="gym-label mb-3 block">Workout Type *</label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`px-3 py-2 rounded-lg text-sm font-condensed font-bold border transition-all
                  ${form.type === t ? 'bg-[#f5c518] text-black border-[#f5c518]' : 'border-[#242424] text-[#6b7280] hover:border-[#f5c518]/40 hover:text-[#e5e5e5]'}`}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="gym-card p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="gym-label">Duration (minutes) *</label>
              <input type="number" min={1} className="gym-input" placeholder="e.g. 45"
                value={form.durationMinutes} onChange={setField('durationMinutes')} required />
            </div>
            <div>
              <label className="gym-label">Calories Burned (optional)</label>
              <input type="number" min={0} className="gym-input" placeholder="e.g. 350"
                value={form.caloriesBurned} onChange={setField('caloriesBurned')} />
            </div>
          </div>
          <div>
            <label className="gym-label">Notes (optional)</label>
            <textarea className="gym-input resize-none h-24" placeholder="How did it go? Any PRs?"
              value={form.notes} onChange={setField('notes')} />
          </div>
        </div>

        <div className="flex gap-3 pb-6">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1 justify-center py-3">Cancel</button>
          <button type="submit" disabled={saving} className="btn-yellow flex-1 justify-center py-3">
            {saving
              ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              : <>Save Workout <ChevronRight size={16} /></>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
