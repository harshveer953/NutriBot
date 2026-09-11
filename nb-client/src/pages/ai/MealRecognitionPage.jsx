import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera, Upload, Zap, CheckCircle, Plus, RotateCcw, AlertCircle, Type } from 'lucide-react'
import { aiApi }          from '../../api/aiApi'
import useMealStore       from '../../store/mealStore'
import useTrackerStore    from '../../store/trackerStore'
import toast              from 'react-hot-toast'
import { useNavigate }    from 'react-router-dom'

export default function MealRecognitionPage() {
  const [preview, setPreview]   = useState(null)
  const [file, setFile]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [stubMsg, setStubMsg]   = useState(null) // backend stub message

  const { createMeal }  = useMealStore()
  const { bumpMacros }  = useTrackerStore()
  const navigate        = useNavigate()

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setStubMsg(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: false,
  })

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await aiApi.analyzeMeal(fd)

      // FIX 6: Backend currently returns stub:
      // { success: true, message: "Image AI analysis not supported yet" }
      // Check if we got real data or just the stub message
      if (data.data && data.data.title) {
        // Real data (future when backend implements it)
        setResult(data.data)
      } else {
        // Stub — show friendly message + offer text analyzer
        setStubMsg(data.message || 'Image analysis not available yet.')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed.')
    }
    setLoading(false)
  }

  const logMeal = async () => {
    if (!result) return
    const mealResult = await createMeal({
      mealType:    result.mealType || 'snack',
      title:       result.title,
      calories:    result.calories,
      protein:     result.protein,
      carbs:       result.carbs,
      fats:        result.fats,
      ingredients: result.ingredients || [],
    }, file)

    if (mealResult.success) {
      bumpMacros(result.calories, result.protein, result.carbs, result.fats)
      toast.success('Meal logged!')
      setResult(null); setPreview(null); setFile(null)
    } else {
      toast.error(mealResult.error || 'Failed to log')
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <p className="section-eyebrow">AI Tools</p>
        <h1 className="font-display text-4xl sm:text-5xl text-white">SNAP & LOG</h1>
        <p className="text-[#6b7280] text-sm mt-1 font-condensed">
          Photo lelo — AI food identify karke macros estimate karega
        </p>
      </div>

      {/* Drop zone */}
      <div {...getRootProps()}
        className={`gym-card cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-[#f5c518] bg-[#f5c51808]' : 'hover:border-[rgba(245,197,24,0.25)]'}`}>
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Meal"
              className="w-full max-h-64 object-cover rounded-xl" />
            <button onClick={(e) => {
              e.stopPropagation()
              setPreview(null); setFile(null); setResult(null); setStubMsg(null)
            }} className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white
              rounded-full p-1.5 hover:bg-black/80 transition">
              <RotateCcw size={15} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#f5c51812] border border-[#f5c51830]
              flex items-center justify-center">
              <Camera size={28} className="text-[#f5c518]" />
            </div>
            <div className="text-center">
              <p className="font-condensed font-bold text-[#e5e5e5]">Drop your meal photo here</p>
              <p className="text-sm text-[#4b5563] mt-1">or click to browse · JPG, PNG, WEBP</p>
            </div>
            <span className="badge badge-yellow"><Upload size={11} /> Upload Photo</span>
          </div>
        )}
      </div>

      {/* Analyze button */}
      {preview && !result && !stubMsg && (
        <button onClick={analyze} disabled={loading}
          className="btn-yellow w-full justify-center py-3 text-base">
          {loading ? (
            <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Analyzing…</>
          ) : (
            <><Zap size={18} fill="black" /> Analyze with AI</>
          )}
        </button>
      )}

      {/* FIX 6: Stub message — backend hasn't implemented image AI yet */}
      {stubMsg && (
        <div className="gym-card p-5 space-y-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f9731618] flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-[#f97316]" />
            </div>
            <div>
              <p className="font-condensed font-bold text-[#e5e5e5]">Image Analysis Coming Soon</p>
              <p className="text-sm text-[#6b7280] font-condensed mt-1">{stubMsg}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/ai/text-analyzer')}
              className="btn-yellow flex-1 justify-center gap-2">
              <Type size={15} /> Use Text Analyzer Instead
            </button>
            <button onClick={() => navigate('/meals/add')}
              className="btn-outline flex-1 justify-center gap-2">
              <Plus size={15} /> Log Manually
            </button>
          </div>
        </div>
      )}

      {/* Real result (when backend implements image AI) */}
      {result && (
        <div className="gym-card gym-card-glow p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-[#22c55e]" />
            <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase">
              AI Detected
            </h3>
          </div>
          <div>
            <p className="font-display text-2xl text-white">{result.title}</p>
            <span className="badge badge-orange mt-1 capitalize">{result.mealType}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Cal',  value: result.calories,      color: '#f5c518' },
              { label: 'Pro',  value: `${result.protein}g`, color: '#22c55e' },
              { label: 'Carb', value: `${result.carbs}g`,   color: '#f97316' },
              { label: 'Fat',  value: `${result.fats}g`,    color: '#8b5cf6' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#111] rounded-xl p-3 border border-[#1a1a1a]">
                <p className="stat-number text-xl" style={{ color }}>{value}</p>
                <p className="text-[10px] font-condensed text-[#4b5563] uppercase tracking-widest mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setResult(null)} className="btn-ghost flex-1 justify-center">
              Retake
            </button>
            <button onClick={logMeal} className="btn-yellow flex-1 justify-center">
              <Plus size={16} /> Log This Meal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
