import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Coffee, Sun, Sunset, Apple, Trash2, Plus,
  Zap, UtensilsCrossed, ImageOff
} from 'lucide-react'
import useMealStore from '../../store/mealStore'
import useTrackerStore from '../../store/trackerStore'
import toast from 'react-hot-toast'

const GROUPS = [
  { key: 'breakfast', label: 'Breakfast', Icon: Coffee,  color: '#f97316', bg: '#f9731618' },
  { key: 'lunch',     label: 'Lunch',     Icon: Sun,     color: '#f5c518', bg: '#f5c51818' },
  { key: 'dinner',    label: 'Dinner',    Icon: Sunset,  color: '#8b5cf6', bg: '#8b5cf618' },
  { key: 'snack',     label: 'Snacks',    Icon: Apple,   color: '#22c55e', bg: '#22c55e18' },
]

// ─── Single meal card ────────────────────────────────────────────
function MealCard({ meal, color, onDelete }) {
  const imgSrc = meal?.image
    ? (meal.image.startsWith('http') ? meal.image : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://nutribot-fw8p.onrender.com'}/${meal.image}`)
    : null

  return (
    <div className="gym-card flex flex-col overflow-hidden group">
      {/* Meal image or placeholder */}
      <div className="relative h-32 sm:h-36 bg-[#111] flex items-center justify-center overflow-hidden shrink-0">
        {imgSrc ? (
          <img src={imgSrc} alt={meal.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 opacity-20">
            <ImageOff size={22} className="text-[#4b5563]" />
            <p className="text-[10px] font-condensed text-[#4b5563]">No image</p>
          </div>
        )}
        {/* Calorie badge on image */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg
          px-2 py-1 flex items-center gap-1">
          <p className="text-xs font-condensed font-bold" style={{ color }}>
            {meal.calories}
          </p>
          <p className="text-[10px] text-[#6b7280] font-condensed">kcal</p>
        </div>
        {/* Delete button */}
        <button onClick={() => onDelete(meal)}
          className="absolute top-2 left-2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-lg
            flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
            text-[#4b5563] hover:text-[#ef4444]">
          <Trash2 size={13} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-sm font-condensed font-bold text-[#e5e5e5] leading-tight line-clamp-2">
          {meal.title}
        </p>

        {/* Macro pills */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {[
            { label: 'P', value: meal.protein,  color: '#22c55e' },
            { label: 'C', value: meal.carbs,    color: '#f97316' },
            { label: 'F', value: meal.fats,     color: '#8b5cf6' },
          ].map(({ label, value, color: c }) => value > 0 ? (
            <span key={label} className="text-[10px] font-condensed font-bold px-1.5 py-0.5
              rounded-md border"
              style={{ color: c, borderColor: `${c}30`, background: `${c}10` }}>
              {label} {value}g
            </span>
          ) : null)}
        </div>
      </div>
    </div>
  )
}

// ─── Group section ────────────────────────────────────────────────
function MealGroup({ group, meals, onDelete }) {
  const { key, label, Icon, color, bg } = group
  const groupMeals = meals.filter((m) => m.mealType?.toLowerCase() === key)
  const totalCal   = groupMeals.reduce((s, m) => s + (m.calories || 0), 0)

  return (
    <div className="space-y-3">
      {/* Group header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: bg }}>
            <Icon size={16} style={{ color }} />
          </div>
          <div>
            <p className="font-condensed font-bold text-sm text-[#e5e5e5]">{label}</p>
            <p className="text-[10px] font-condensed text-[#4b5563]">
              {groupMeals.length} {groupMeals.length === 1 ? 'meal' : 'meals'}
              {totalCal > 0 && ` · ${totalCal} kcal`}
            </p>
          </div>
        </div>
        <Link to="/meals/add"
          className="flex items-center gap-1.5 text-xs font-condensed text-[#4b5563]
            hover:text-[#f5c518] transition-colors">
          <Plus size={13} /> Add
        </Link>
      </div>

      {/* Cards grid or empty state */}
      {groupMeals.length === 0 ? (
        <div className="flex items-center gap-3 bg-[#111] rounded-xl border border-dashed
          border-[#1e1e1e] p-4">
          <UtensilsCrossed size={18} className="text-[#2a2a2a] shrink-0" />
          <p className="text-xs font-condensed text-[#3a3a3a]">
            No {label.toLowerCase()} logged yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {groupMeals.map((meal) => (
            <MealCard key={meal._id} meal={meal} color={color} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function MyMealPlanPage() {
  const { meals, loading, fetchMeals, deleteMeal } = useMealStore()
  const { subtractMacros }                         = useTrackerStore()
  const [filter, setFilter]                        = useState('all')

  useEffect(() => { fetchMeals() }, [])

  const handleDelete = async (meal) => {
    const r = await deleteMeal(meal._id)
    if (r.success) {
      subtractMacros(meal.calories, meal.protein, meal.carbs, meal.fats)
      toast.success('Meal removed')
    } else {
      toast.error(r.error || 'Failed to delete')
    }
  }

  // Total stats
  const totalCal  = meals.reduce((s, m) => s + (m.calories || 0), 0)
  const totalProt = meals.reduce((s, m) => s + (m.protein  || 0), 0)

  // Filter by date: 'all' | 'today'
  const todayStr     = new Date().toISOString().split('T')[0]
  const filteredMeals = filter === 'today'
    ? meals.filter((m) => m.loggedAt?.startsWith(todayStr))
    : meals

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="section-eyebrow">Meals</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white">MY MEAL PLAN</h1>
          <p className="text-[#6b7280] text-sm mt-1 font-condensed">
            Apne logged meals grouped by meal type
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/ai/planner" className="btn-outline gap-2 text-sm">
            <Zap size={14} /> Generate New Plan
          </Link>
          <Link to="/meals/add" className="btn-yellow gap-2 text-sm">
            <Plus size={14} /> Add Meal
          </Link>
        </div>
      </div>

      {/* Summary strip */}
      {meals.length > 0 && (
        <div className="gym-card gym-card-glow p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: 'Total Meals',  value: meals.length,              unit: '',      color: '#f5c518' },
              { label: 'Total Cals',   value: totalCal,                  unit: 'kcal',  color: '#f97316' },
              { label: 'Total Protein',value: totalProt,                 unit: 'g',     color: '#22c55e' },
              { label: 'Today',
                value: meals.filter((m) => m.loggedAt?.startsWith(todayStr)).length,
                unit: 'meals', color: '#8b5cf6' },
            ].map(({ label, value, unit, color }) => (
              <div key={label}>
                <p className="stat-number text-2xl sm:text-3xl" style={{ color }}>{value}</p>
                <p className="text-[10px] font-condensed text-[#3a3a3a] uppercase tracking-widest">{unit}</p>
                <p className="text-[11px] text-[#4b5563] font-condensed mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[#111] rounded-xl p-1 border border-[#1a1a1a] w-full sm:w-64">
        {[
          { key: 'all',   label: `All (${meals.length})` },
          { key: 'today', label: `Today (${meals.filter((m) => m.loggedAt?.startsWith(todayStr)).length})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex-1 py-2 rounded-lg text-xs font-condensed font-bold tracking-wide transition-all
              ${filter === key ? 'bg-[#f5c518] text-black' : 'text-[#4b5563] hover:text-[#e5e5e5]'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          {GROUPS.map((g) => (
            <div key={g.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="skeleton w-8 h-8 rounded-xl" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="gym-card overflow-hidden">
                    <div className="skeleton h-32 sm:h-36 w-full" />
                    <div className="p-3 space-y-2">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredMeals.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-5 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#111] border border-[#242424]
            flex items-center justify-center">
            <UtensilsCrossed size={32} className="text-[#2a2a2a]" />
          </div>
          <div>
            <p className="font-condensed font-bold text-[#6b7280] text-xl mb-1">
              {filter === 'today' ? 'No meals logged today' : 'No meals yet'}
            </p>
            <p className="text-sm text-[#3a3a3a] font-condensed max-w-xs mx-auto">
              Generate an AI meal plan or manually log your first meal
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link to="/ai/planner" className="btn-yellow">
              <Zap size={15} fill="black" /> AI Meal Plan
            </Link>
            <Link to="/meals/add" className="btn-outline">
              <Plus size={15} /> Add Manually
            </Link>
          </div>
        </div>
      )}

      {/* Grouped sections */}
      {!loading && filteredMeals.length > 0 && (
        <div className="space-y-8">
          {GROUPS.map((group) => (
            <MealGroup
              key={group.key}
              group={group}
              meals={filteredMeals}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
