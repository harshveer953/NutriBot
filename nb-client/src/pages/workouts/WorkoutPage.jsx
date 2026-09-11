import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Dumbbell, Clock, Flame, Trash2 } from 'lucide-react'
import useWorkoutStore from '../../store/workoutStore'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

function WorkoutCard({ workout, onDelete }) {
  const date = workout.workoutDate ? format(parseISO(workout.workoutDate), 'MMM d') : ''
  return (
    <div className="gym-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <span className="badge badge-yellow mb-1">{date}</span>
          <h3 className="font-condensed font-bold text-base text-[#e5e5e5]">{workout.type}</h3>
          {workout.notes && <p className="text-xs text-[#4b5563] mt-0.5 line-clamp-1">{workout.notes}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#f5c51818] flex items-center justify-center">
            <Dumbbell size={18} className="text-[#f5c518]" />
          </div>
          <button onClick={() => onDelete(workout._id)} className="text-[#3a3a3a] hover:text-[#ef4444] transition-colors p-1">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#111] rounded-lg p-2.5 border border-[#1a1a1a] flex items-center gap-2">
          <Clock size={14} className="text-[#f5c518]" />
          <div>
            <p className="text-[10px] font-condensed tracking-widest text-[#3a3a3a] uppercase">Duration</p>
            <p className="text-sm font-condensed font-bold text-[#f5c518]">{workout.durationMinutes} min</p>
          </div>
        </div>
        <div className="bg-[#111] rounded-lg p-2.5 border border-[#1a1a1a] flex items-center gap-2">
          <Flame size={14} className="text-[#f97316]" />
          <div>
            <p className="text-[10px] font-condensed tracking-widest text-[#3a3a3a] uppercase">Burned</p>
            <p className="text-sm font-condensed font-bold text-[#f97316]">{workout.caloriesBurned || '—'} kcal</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorkoutPage() {
  const { workouts, loading, fetchWorkouts, deleteWorkout } = useWorkoutStore()

  useEffect(() => { fetchWorkouts() }, [])

  const handleDelete = async (id) => {
    const result = await deleteWorkout(id)
    if (result.success) toast.success('Workout deleted')
    else toast.error(result.error || 'Failed')
  }

  // Weekly summary
  const weekTotal = workouts.slice(0, 7).reduce((acc, w) => ({
    sessions:  acc.sessions + 1,
    minutes:   acc.minutes  + (w.durationMinutes  || 0),
    calories:  acc.calories + (w.caloriesBurned   || 0),
  }), { sessions: 0, minutes: 0, calories: 0 })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-eyebrow">Training</p>
          <h1 className="font-display text-4xl text-white">WORKOUTS</h1>
        </div>
        <Link to="/workouts/add" className="btn-yellow"><Plus size={16} /> Log Workout</Link>
      </div>

      {/* Weekly summary */}
      {workouts.length > 0 && (
        <div className="gym-card gym-card-glow p-5">
          <p className="text-xs font-condensed tracking-widest text-[#6b7280] uppercase mb-4">Recent Summary</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Sessions', value: weekTotal.sessions, unit: '' },
              { label: 'Minutes',  value: weekTotal.minutes,  unit: 'min' },
              { label: 'Calories', value: weekTotal.calories, unit: 'kcal' },
            ].map(({ label, value, unit }) => (
              <div key={label}>
                <p className="stat-number text-3xl text-[#f5c518]">{value}<span className="text-sm text-[#4b5563] ml-1 font-body">{unit}</span></p>
                <p className="text-xs font-condensed tracking-widest text-[#4b5563] uppercase mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="gym-card p-4 space-y-3">
              <div className="skeleton h-4 w-16 rounded" />
              <div className="skeleton h-5 w-1/2 rounded" />
              <div className="grid grid-cols-2 gap-2">{[...Array(2)].map((_, j) => <div key={j} className="skeleton h-14 rounded-lg" />)}</div>
            </div>
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#242424] flex items-center justify-center">
            <Dumbbell size={28} className="text-[#2a2a2a]" />
          </div>
          <p className="font-condensed text-[#4b5563] text-lg">No workouts logged yet</p>
          <Link to="/workouts/add" className="btn-yellow"><Plus size={16} /> Log First Workout</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((w) => <WorkoutCard key={w._id} workout={w} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  )
}
