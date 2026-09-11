import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, ChevronRight, Camera } from 'lucide-react'
import useMealStore from '../../store/mealStore'
import useTrackerStore from '../../store/trackerStore'
import toast from 'react-hot-toast'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

export default function AddMealPage() {
  const [form, setForm] = useState({
    mealType: 'lunch', title: '',
    calories: '', protein: '', carbs: '', fats: '',
  })
  const [ingredients, setIngr] = useState([{ name: '', quantity: '' }])
  const [imageFile, setImageFile]   = useState(null)
  const [imagePreview, setPreview]  = useState(null)
  const [saving, setSaving]         = useState(false)

  const { createMeal }  = useMealStore()
  const { bumpMacros }  = useTrackerStore()
  const navigate        = useNavigate()

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addRow    = () => setIngr([...ingredients, { name: '', quantity: '' }])
  const removeRow = (i) => setIngr(ingredients.filter((_, idx) => idx !== i))
  const updateRow = (i, k, v) => {
    const updated = [...ingredients]
    updated[i][k] = v
    setIngr(updated)
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.mealType)     return toast.error('Select meal type')

    setSaving(true)
    const filledIngredients = ingredients.filter((i) => i.name.trim())

    const result = await createMeal(
      {
        mealType:    form.mealType,
        title:       form.title,
        calories:    Number(form.calories) || 0,
        protein:     Number(form.protein)  || 0,
        carbs:       Number(form.carbs)    || 0,
        fats:        Number(form.fats)     || 0,
        ingredients: filledIngredients,
      },
      imageFile
    )

    if (result.success) {
      bumpMacros(result.meal.calories, result.meal.protein, result.meal.carbs, result.meal.fats)
      toast.success('Meal logged!')
      navigate('/meals')
    } else {
      toast.error(result.error)
    }
    setSaving(false)
  }

  const totalCalories = Math.round(
    (Number(form.protein) || 0) * 4 +
    (Number(form.carbs)   || 0) * 4 +
    (Number(form.fats)    || 0) * 9
  )

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <p className="section-eyebrow">Nutrition</p>
        <h1 className="font-display text-4xl text-white">LOG MEAL</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="gym-card p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="gym-label">Meal Title *</label>
              <input className="gym-input" placeholder="e.g. Chicken Rice Bowl"
                value={form.title} onChange={setField('title')} required />
            </div>
            <div>
              <label className="gym-label mb-2 block">Meal Type *</label>
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, mealType: t }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-condensed font-bold border capitalize transition-all
                      ${form.mealType === t ? 'bg-[#f5c518] text-black border-[#f5c518]' : 'border-[#242424] text-[#6b7280] hover:border-[#f5c518]/40'}`}
                  >{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: 'calories', label: 'Calories', unit: 'kcal', color: '#f5c518' },
              { k: 'protein',  label: 'Protein',  unit: 'g',    color: '#22c55e' },
              { k: 'carbs',    label: 'Carbs',    unit: 'g',    color: '#f97316' },
              { k: 'fats',     label: 'Fats',     unit: 'g',    color: '#8b5cf6' },
            ].map(({ k, label, unit, color }) => (
              <div key={k}>
                <label className="gym-label" style={{ color }}>{label} ({unit})</label>
                <input type="number" min={0} className="gym-input text-center" placeholder="0"
                  value={form[k]} onChange={setField(k)} />
              </div>
            ))}
          </div>

          {/* Auto-calc hint */}
          {(form.protein || form.carbs || form.fats) && !form.calories && (
            <button type="button" onClick={() => setForm((f) => ({ ...f, calories: String(totalCalories) }))}
              className="text-xs text-[#f5c518] font-condensed hover:underline">
              Auto-fill from macros: {totalCalories} kcal
            </button>
          )}
        </div>

        {/* Ingredients */}
        <div className="gym-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase">Ingredients</h3>
            <button type="button" onClick={addRow} className="text-xs text-[#f5c518] font-condensed flex items-center gap-1 hover:text-[#fbbf24]">
              <Plus size={13} /> Add Row
            </button>
          </div>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="gym-input flex-1" placeholder="Ingredient name"
                value={ing.name} onChange={(e) => updateRow(i, 'name', e.target.value)} />
              <input className="gym-input w-28" placeholder="100g"
                value={ing.quantity} onChange={(e) => updateRow(i, 'quantity', e.target.value)} />
              {ingredients.length > 1 && (
                <button type="button" onClick={() => removeRow(i)} className="text-[#3a3a3a] hover:text-[#ef4444] transition-colors">
                  <X size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Image upload */}
        <div className="gym-card p-5">
          <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase mb-3">Meal Photo (optional)</h3>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Meal" className="w-full max-h-48 object-cover rounded-xl" />
              <button type="button" onClick={() => { setImageFile(null); setPreview(null) }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80">
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center py-8 border border-dashed border-[#242424] rounded-xl cursor-pointer hover:border-[#f5c518]/40 transition-colors">
              <Camera size={24} className="text-[#3a3a3a] mb-2" />
              <p className="text-sm font-condensed text-[#4b5563]">Click to upload a photo</p>
              <input type="file" accept="image/*" className="sr-only" onChange={handleImage} />
            </label>
          )}
        </div>

        {/* Save */}
        <div className="flex gap-3 pb-6">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1 justify-center py-3">Cancel</button>
          <button type="submit" disabled={saving} className="btn-yellow flex-1 justify-center py-3">
            {saving
              ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              : <>Save Meal <ChevronRight size={16} /></>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
