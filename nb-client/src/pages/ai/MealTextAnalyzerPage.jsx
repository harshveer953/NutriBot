import React, { useState } from 'react'
import { Type, Zap, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { aiApi }          from '../../api/aiApi'
import useMealStore       from '../../store/mealStore'
import useTrackerStore    from '../../store/trackerStore'
import toast              from 'react-hot-toast'

const EXAMPLES = [
  '2 plates of paneer rice',
  '1 bowl of dal and 3 rotis',
  '200g grilled chicken with salad',
  '1 cup oats with banana',
]

export default function MealTextAnalyzerPage() {
  const [text, setText]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)  // { title, calories, protein, carbs, fats }
  const [mealType, setMealType] = useState('lunch')
  const [logging, setLogging]   = useState(false)

  const { createMeal }  = useMealStore()
  const { bumpMacros }  = useTrackerStore()

  const analyze = async () => {
    if (!text.trim()) return toast.error('Enter food description first')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await aiApi.analyzeMealText(text)
      // Response: { success, meal: { title, calories, protein, carbs, fats } }
      setResult(data.meal)
    } catch (err) {
      const msg = err.response?.data?.message || 'Analysis failed'
      // Common: food not in DB
      toast.error(msg.includes('not found')
        ? `"${text}" not in food database. Try a more common food name.`
        : msg)
    }
    setLoading(false)
  }

  const logMeal = async () => {
    if (!result) return
    setLogging(true)
    const r = await createMeal({
      mealType,
      title:       result.title,
      calories:    result.calories,
      protein:     result.protein,
      carbs:       result.carbs,
      fats:        result.fats,
      ingredients: [],
    }, null)

    if (r.success) {
      bumpMacros(result.calories, result.protein, result.carbs, result.fats)
      toast.success('Meal logged!')
      setText('')
      setResult(null)
    } else {
      toast.error(r.error || 'Failed to log')
    }
    setLogging(false)
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div>
        <p className="section-eyebrow">AI Tools</p>
        <h1 className="font-display text-4xl sm:text-5xl text-white">TEXT ANALYZER</h1>
        <p className="text-[#6b7280] text-sm mt-1 font-condensed">
          Apna meal text mein describe karo — AI macros nikaal dega
        </p>
      </div>

      {/* Input */}
      <div className="gym-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[#f5c51818] flex items-center justify-center">
            <Type size={14} className="text-[#f5c518]" />
          </div>
          <label className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase">
            Describe Your Meal
          </label>
        </div>

        <textarea
          className="gym-input resize-none h-24 text-base"
          placeholder="e.g. 2 plates of paneer rice, 1 bowl of dal…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), analyze())}
        />

        {/* Example chips */}
        <div className="flex flex-wrap gap-2">
          <p className="w-full text-[10px] font-condensed text-[#3a3a3a] uppercase tracking-widest">
            Examples
          </p>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => setText(ex)}
              className="text-xs font-condensed px-2.5 py-1.5 rounded-lg border border-[#242424]
                text-[#4b5563] hover:border-[#f5c518]/40 hover:text-[#f5c518] transition-all">
              {ex}
            </button>
          ))}
        </div>

        <button onClick={analyze} disabled={loading || !text.trim()}
          className="btn-yellow w-full justify-center py-3 text-base">
          {loading ? (
            <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Analyzing…</>
          ) : (
            <><Zap size={18} fill="black" /> Analyze Macros</>
          )}
        </button>
      </div>

      {/* DB note */}
      <div className="flex items-start gap-2.5 bg-[#38bdf808] border border-[#38bdf820] rounded-xl p-3">
        <AlertCircle size={14} className="text-[#38bdf8] shrink-0 mt-0.5" />
        <p className="text-xs font-condensed text-[#6b7280] leading-relaxed">
          This looks up foods from the NutriBot food database. Common Indian & global foods are supported.
          If your food isn't found, try a simpler name (e.g. "paneer" instead of "shahi paneer masala").
        </p>
      </div>

      {/* Result */}
      {result && (
        <div className="gym-card gym-card-glow p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-[#22c55e]" />
            <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase">
              Macros Detected
            </h3>
          </div>

          <div>
            <p className="font-display text-2xl text-white capitalize">{result.title}</p>
          </div>

          {/* Macro grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Calories', value: result.calories,      color: '#f5c518' },
              { label: 'Protein',  value: `${result.protein}g`, color: '#22c55e' },
              { label: 'Carbs',    value: `${result.carbs}g`,   color: '#f97316' },
              { label: 'Fats',     value: `${result.fats}g`,    color: '#8b5cf6' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#111] rounded-xl p-3 border border-[#1a1a1a]">
                <p className="stat-number text-xl sm:text-2xl" style={{ color }}>{value}</p>
                <p className="text-[10px] font-condensed text-[#4b5563] uppercase tracking-widest mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Meal type selector */}
          <div>
            <label className="gym-label mb-2 block">Log as</label>
            <div className="flex gap-2 flex-wrap">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((t) => (
                <button key={t} onClick={() => setMealType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-condensed font-bold border capitalize
                    transition-all ${mealType === t
                      ? 'bg-[#f5c518] text-black border-[#f5c518]'
                      : 'border-[#242424] text-[#6b7280] hover:border-[#f5c518]/40'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setResult(null)} className="btn-ghost flex-1 justify-center">
              Try Another
            </button>
            <button onClick={logMeal} disabled={logging}
              className="btn-yellow flex-1 justify-center">
              {logging
                ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                : <><Plus size={15} /> Log Meal</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
