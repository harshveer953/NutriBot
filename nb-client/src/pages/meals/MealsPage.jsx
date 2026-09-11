import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2, UtensilsCrossed } from 'lucide-react'
import useMealStore from '../../store/mealStore'
import useTrackerStore from '../../store/trackerStore'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

const TYPES = ['All', 'breakfast', 'lunch', 'dinner', 'snack']

function MealCard({ meal, onDelete }) {
  const date = meal.loggedAt ? format(parseISO(meal.loggedAt), 'MMM d, h:mm a') : ''
  return (
    <div className="gym-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <span className="badge badge-orange mb-1 capitalize">{meal.mealType}</span>
          <h3 className="font-condensed font-bold text-base text-[#e5e5e5] leading-tight">{meal.title}</h3>
          <p className="text-xs text-[#4b5563] mt-0.5">{date}</p>
        </div>
        <button onClick={() => onDelete(meal)} className="p-2 text-[#3a3a3a] hover:text-[#ef4444] transition-colors">
          <Trash2 size={15} />
        </button>
      </div>

      {/* Macro grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'CAL',  value: meal.calories,       color: '#f5c518' },
          { label: 'PRO',  value: `${meal.protein}g`,  color: '#22c55e' },
          { label: 'CARB', value: `${meal.carbs}g`,    color: '#f97316' },
          { label: 'FAT',  value: `${meal.fats}g`,     color: '#8b5cf6' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#111] rounded-lg p-2 text-center border border-[#1a1a1a]">
            <p className="text-[10px] font-condensed tracking-widest text-[#3a3a3a] uppercase">{label}</p>
            <p className="text-sm font-condensed font-bold mt-0.5" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Ingredients */}
      {meal.ingredients?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {meal.ingredients.slice(0, 4).map((ing, i) => (
            <span key={i} className="text-xs bg-[#111] border border-[#1a1a1a] rounded px-2 py-0.5 text-[#4b5563] font-condensed">
              {ing.name} {ing.quantity}
            </span>
          ))}
          {meal.ingredients.length > 4 && (
            <span className="text-xs text-[#3a3a3a] font-condensed">+{meal.ingredients.length - 4} more</span>
          )}
        </div>
      )}
    </div>
  )
}

export default function MealsPage() {
  const { meals, loading, fetchMeals, deleteMeal } = useMealStore()
  const { subtractMacros } = useTrackerStore()
  const [search, setSearch] = useState('')
  const [type, setType]     = useState('All')

  useEffect(() => { fetchMeals() }, [])

  const filtered = meals.filter((m) => {
    const matchSearch = m.title?.toLowerCase().includes(search.toLowerCase())
    const matchType   = type === 'All' || m.mealType === type
    return matchSearch && matchType
  })

  const handleDelete = async (meal) => {
    const result = await deleteMeal(meal._id)
    if (result.success) {
      subtractMacros(meal.calories, meal.protein, meal.carbs, meal.fats)
      toast.success('Meal deleted')
    } else {
      toast.error(result.error || 'Failed to delete')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-eyebrow">Nutrition</p>
          <h1 className="font-display text-4xl text-white">YOUR MEALS</h1>
        </div>
        <Link to="/meals/add" className="btn-yellow"><Plus size={16} /> Log Meal</Link>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]" />
          <input className="gym-input pl-10" placeholder="Search meals…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-condensed font-bold border capitalize transition-all
                ${type === t ? 'bg-[#f5c518] text-black border-[#f5c518]' : 'border-[#242424] text-[#6b7280] hover:border-[#f5c518]/40'}`}
            >{t}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="gym-card p-4 space-y-3">
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="grid grid-cols-4 gap-2">{[...Array(4)].map((_, j) => <div key={j} className="skeleton h-12 rounded-lg" />)}</div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#242424] flex items-center justify-center">
            <UtensilsCrossed size={28} className="text-[#2a2a2a]" />
          </div>
          <p className="font-condensed text-[#4b5563] text-lg">No meals found</p>
          <Link to="/meals/add" className="btn-yellow"><Plus size={16} /> Log First Meal</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((meal) => <MealCard key={meal._id} meal={meal} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  )
}
