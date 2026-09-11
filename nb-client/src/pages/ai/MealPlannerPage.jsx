import React, { useState } from 'react'
import {
  Zap, ShoppingCart, Coffee, Sun, Sunset, Apple,
  RotateCcw, ChevronRight, CheckCircle, CalendarDays
} from 'lucide-react'
import { aiApi }          from '../../api/aiApi'
import useMealStore       from '../../store/mealStore'
import useMealPlanStore   from '../../store/mealPlanStore'
import toast              from 'react-hot-toast'
import { useNavigate }    from 'react-router-dom'

const MEAL_COLORS = { breakfast: '#f97316', lunch: '#f5c518', dinner: '#8b5cf6', snack: '#22c55e' }
const MEAL_ICONS  = { breakfast: Coffee, lunch: Sun, dinner: Sunset, snack: Apple }

// ─── Single meal row ──────────────────────────────────────────────
function MealRow({ meal }) {
  const key   = meal.mealType?.toLowerCase()
  const color = MEAL_COLORS[key] || '#f5c518'
  const Icon  = MEAL_ICONS[key]  || Sun
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#1e1e1e] last:border-0">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-condensed font-bold tracking-widest uppercase" style={{ color }}>
          {meal.mealType}
        </p>
        <p className="text-sm font-condensed font-semibold text-[#e5e5e5] leading-tight truncate">
          {meal.title}
        </p>
      </div>
      <p className="text-sm font-condensed font-bold text-[#f5c518] shrink-0">{meal.calories} kcal</p>
    </div>
  )
}

// ─── Summary stats bar ────────────────────────────────────────────
function PlanSummary({ meals }) {
  const totalCal   = meals.reduce((s, m) => s + (m.calories || 0), 0)
  const totalProt  = meals.reduce((s, m) => s + (m.protein  || 0), 0)
  const byType     = {}
  meals.forEach((m) => { byType[m.mealType] = (byType[m.mealType] || 0) + 1 })

  return (
    <div className="gym-card p-4 sm:p-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {[
          { label: 'Total Meals',  value: meals.length, unit: 'meals', color: '#f5c518' },
          { label: 'Total Cals',   value: totalCal,     unit: 'kcal',  color: '#f97316' },
          { label: 'Total Protein',value: totalProt,    unit: 'g',     color: '#22c55e' },
          { label: 'Meal Types',   value: Object.keys(byType).length, unit: 'types', color: '#8b5cf6' },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="bg-[#111] rounded-xl p-3 border border-[#1a1a1a]">
            <p className="stat-number text-2xl sm:text-3xl" style={{ color }}>{value}</p>
            <p className="text-[10px] font-condensed text-[#3a3a3a] uppercase tracking-widest">{unit}</p>
            <p className="text-[11px] text-[#4b5563] font-condensed mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Grouped meals by type ────────────────────────────────────────
function MealsByType({ meals }) {
  const grouped = { breakfast: [], lunch: [], dinner: [], snack: [] }
  meals.forEach((m) => {
    const k = m.mealType?.toLowerCase()
    if (grouped[k]) grouped[k].push(m)
  })

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([type, items]) => {
        if (!items.length) return null
        const color = MEAL_COLORS[type]
        const Icon  = MEAL_ICONS[type] || Sun
        return (
          <div key={type} className="gym-card overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1a1a1a]">
              <div className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: `${color}18` }}>
                <Icon size={13} style={{ color }} />
              </div>
              <p className="text-xs font-condensed font-bold tracking-widest uppercase capitalize"
                style={{ color }}>{type}</p>
              <span className="ml-auto text-[10px] font-condensed text-[#4b5563]">
                {items.length} meal{items.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="px-4">
              {items.map((meal) => <MealRow key={meal._id || meal.title} meal={meal} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function MealPlannerPage() {
  // FIX 4: plan = flat Meal[] from backend (already saved to DB)
  const { plan, prefs, setPlan, clearPlan, setPrefs } = useMealPlanStore()
  const [loading, setLoading] = useState(false)
  const { addMealsToStore }   = useMealStore()
  const navigate              = useNavigate()

  const setField = (k) => (e) => setPrefs({ [k]: e.target.value })

  const generate = async () => {
    setLoading(true)
    clearPlan()
    try {
      const { data } = await aiApi.generateMealPlan({
        goal:              prefs.goal,
        caloriesTarget:    Number(prefs.caloriesTarget),
        dietaryPreference: prefs.dietaryPreference,
        days:              Number(prefs.days),
      })

      // Backend response: { success, message, planId, meals: Meal[] }
      // Backend already saved to DB — just store in Zustand for display
      if (!data.meals || !data.meals.length) {
        toast.error('AI returned empty plan. Try again.')
        setLoading(false)
        return
      }

      setPlan(data.meals)                  // flat Meal[] — already in DB
      addMealsToStore(data.meals)          // sync into mealStore so MealsPage shows them
      toast.success(`Meal plan generated & saved! (${data.meals.length} meals)`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed. Try again.')
    }
    setLoading(false)
  }

  // Build grocery list from saved meals
  const goToGrocery = () => {
    const mealPlan = { meals: plan }
    navigate('/ai/grocery', { state: { mealPlan } })
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="section-eyebrow">AI Tools</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white">MEAL PLANNER</h1>
          <p className="text-[#6b7280] text-sm mt-1 font-condensed">
            Qwen 2.5 AI generates & saves your full meal plan automatically
          </p>
        </div>
        {plan && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={clearPlan} className="btn-ghost gap-2 text-sm">
              <RotateCcw size={14} /> New Plan
            </button>
            <button onClick={goToGrocery} className="btn-outline gap-2 text-sm">
              <ShoppingCart size={14} /> Grocery List
            </button>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="gym-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#f5c51818] flex items-center justify-center">
            <Zap size={14} className="text-[#f5c518]" fill="#f5c518" />
          </div>
          <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase">
            Customize Your Plan
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="gym-label">Goal</label>
            <select className="gym-input" value={prefs.goal} onChange={setField('goal')}>
              {['Lose Weight', 'Build Muscle', 'Maintain', 'Bulk Up'].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="gym-label">Calories / day</label>
            <input type="number" className="gym-input" value={prefs.caloriesTarget}
              onChange={setField('caloriesTarget')} min={1000} max={5000} step={50} />
          </div>
          <div>
            <label className="gym-label">Diet Type</label>
            <select className="gym-input" value={prefs.dietaryPreference}
              onChange={setField('dietaryPreference')}>
              {['None', 'Vegetarian', 'Vegan', 'Keto', 'High Protein', 'Mediterranean'].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="gym-label">Days</label>
            <select className="gym-input" value={prefs.days} onChange={setField('days')}>
              {[3, 5, 7].map((d) => <option key={d} value={d}>{d} days</option>)}
            </select>
          </div>
        </div>

        <button onClick={generate} disabled={loading}
          className="btn-yellow w-full justify-center py-3 text-base">
          {loading ? (
            <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Qwen is generating your plan…</>
          ) : (
            <><Zap size={18} fill="black" /> Generate & Save Meal Plan</>
          )}
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="gym-card p-4 flex gap-3 items-center">
              <div className="skeleton w-7 h-7 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-2.5 w-16 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
              </div>
              <div className="skeleton h-4 w-14 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Results — plan is flat Meal[] already saved in DB */}
      {plan && !loading && (
        <div className="space-y-4 animate-slide-up">

          {/* Success banner */}
          <div className="flex items-center gap-3 bg-[#22c55e10] border border-[#22c55e30]
            rounded-xl px-4 py-3">
            <CheckCircle size={18} className="text-[#22c55e] shrink-0" />
            <div>
              <p className="text-sm font-condensed font-bold text-[#22c55e]">
                Plan generated & saved to DB
              </p>
              <p className="text-xs text-[#4b5563] font-condensed">
                {plan.length} meals added · visible in My Meal Plan
              </p>
            </div>
            <button onClick={() => navigate('/meals/my-plan')}
              className="ml-auto btn-outline text-xs py-1.5 px-3 shrink-0 gap-1">
              View Plan <ChevronRight size={12} />
            </button>
          </div>

          {/* Summary */}
          <PlanSummary meals={plan} />

          {/* Grouped by meal type */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={14} className="text-[#4b5563]" />
              <p className="text-xs font-condensed tracking-widest text-[#4b5563] uppercase">
                Generated Meals
              </p>
            </div>
            <MealsByType meals={plan} />
          </div>

          {/* CTAs */}
          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={() => navigate('/meals/my-plan')}
              className="gym-card gym-card-glow p-4 flex items-center gap-3 text-left group">
              <div className="w-10 h-10 rounded-xl bg-[#f5c51818] border border-[#f5c51830]
                flex items-center justify-center shrink-0">
                <CheckCircle size={20} className="text-[#f5c518]" />
              </div>
              <div className="flex-1">
                <p className="font-condensed font-bold text-[#e5e5e5] text-sm">View My Meal Plan</p>
                <p className="text-xs text-[#4b5563] font-condensed">See all saved meals</p>
              </div>
              <ChevronRight size={16} className="text-[#3a3a3a] group-hover:text-[#f5c518] transition-colors" />
            </button>

            <button onClick={goToGrocery}
              className="gym-card p-4 flex items-center gap-3 text-left group">
              <div className="w-10 h-10 rounded-xl bg-[#22c55e18] border border-[#22c55e20]
                flex items-center justify-center shrink-0">
                <ShoppingCart size={20} className="text-[#22c55e]" />
              </div>
              <div className="flex-1">
                <p className="font-condensed font-bold text-[#e5e5e5] text-sm">Grocery List</p>
                <p className="text-xs text-[#4b5563] font-condensed">Auto-generate from plan</p>
              </div>
              <ChevronRight size={16} className="text-[#3a3a3a] group-hover:text-[#22c55e] transition-colors" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
