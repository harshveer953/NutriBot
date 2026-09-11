import React, { useState, useEffect } from 'react'
import { Save, Target, Zap, Info } from 'lucide-react'
import useAuthStore    from '../../store/authStore'
import useTrackerStore from '../../store/trackerStore'
import { userApi }     from '../../api/userApi'
import toast           from 'react-hot-toast'

// FIX 5: Backend enum values ↔ display labels
const ACTIVITY_OPTIONS = [
  { value: 'sedentary',   label: 'Sedentary'         },
  { value: 'light',       label: 'Lightly Active'    },
  { value: 'moderate',    label: 'Moderately Active' },
  { value: 'active',      label: 'Very Active'       },
  { value: 'very-active', label: 'Extremely Active'  },
]

// Backend goal enum: "weight-loss" | "muscle-gain" | "maintenance"
const GOAL_OPTIONS = [
  { value: 'weight-loss',  label: 'Lose Weight'   },
  { value: 'muscle-gain',  label: 'Build Muscle'  },
  { value: 'maintenance',  label: 'Maintain'      },
]

const TABS = ['Profile', 'Goals']

function TargetCard({ label, value, unit, color }) {
  return (
    <div className="bg-[#111] rounded-xl border border-[#1a1a1a] p-3 sm:p-4">
      <p className="text-[10px] font-condensed font-bold tracking-widest uppercase mb-2"
        style={{ color }}>{label}</p>
      <p className="stat-number text-2xl sm:text-3xl text-white">
        {value || '—'}
        <span className="text-xs font-body font-normal text-[#4b5563] ml-1">{unit}</span>
      </p>
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { setTargets }       = useTrackerStore()
  const [tab, setTab]        = useState('Profile')
  const [saving, setSaving]  = useState(false)
  const [loading, setLoading]= useState(true)
  const [autoCalc, setAutoCalc] = useState(false)

  const [profile, setProfile] = useState({
    name: '', age: '', gender: 'male',
    heightCm: '', weightKg: '', goal: '', activityLevel: '',
  })
  const [goals, setGoals] = useState({
    caloriesTarget: '', proteinTarget: '', carbsTarget: '',
    fatsTarget: '', waterTargetMl: '', sleepTargetHours: '',
  })

  useEffect(() => {
    userApi.getProfile()
      .then(({ data }) => {
        const u = data.user
        setProfile({
          name:          u.name          || '',
          age:           u.age           || '',
          gender:        u.gender        || 'male',
          heightCm:      u.heightCm      || '',
          weightKg:      u.weightKg      || '',
          goal:          u.goal          || '',
          activityLevel: u.activityLevel || '',
        })
        const g = {
          caloriesTarget:   u.caloriesTarget   || '',
          proteinTarget:    u.proteinTarget     || '',
          carbsTarget:      u.carbsTarget       || '',
          fatsTarget:       u.fatsTarget        || '',
          waterTargetMl:    u.waterTargetMl     || '',
          sleepTargetHours: u.sleepTargetHours  || '',
        }
        setGoals(g)
        if (u.caloriesTarget) {
          setAutoCalc(true)
          setTargets({
            caloriesTarget:   Number(u.caloriesTarget),
            proteinTarget:    Number(u.proteinTarget),
            carbsTarget:      Number(u.carbsTarget),
            fatsTarget:       Number(u.fatsTarget),
            waterTargetMl:    Number(u.waterTargetMl)    || 2500,
            sleepTargetHours: Number(u.sleepTargetHours) || 8,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const setP = (k) => (e) => setProfile((p) => ({ ...p, [k]: e.target.value }))
  const setG = (k) => (e) => setGoals((g)   => ({ ...g, [k]: e.target.value }))

  const saveProfile = async () => {
    if (!profile.name.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      // Send exact backend enum values — they're already correct since we
      // use value= on the select options matching the enum
      const { data } = await userApi.updateProfile({
        ...profile,
        age:       profile.age       ? Number(profile.age)       : undefined,
        heightCm:  profile.heightCm  ? Number(profile.heightCm)  : undefined,
        weightKg:  profile.weightKg  ? Number(profile.weightKg)  : undefined,
        waterTargetMl:    Number(goals.waterTargetMl)    || undefined,
        sleepTargetHours: Number(goals.sleepTargetHours) || undefined,
      })
      const { password, ...safeUser } = data.user
      updateUser(safeUser)

      if (data.user.caloriesTarget) {
        const u = data.user
        setGoals((prev) => ({
          ...prev,
          caloriesTarget: u.caloriesTarget,
          proteinTarget:  u.proteinTarget,
          carbsTarget:    u.carbsTarget,
          fatsTarget:     u.fatsTarget,
        }))
        setTargets({
          caloriesTarget:   Number(u.caloriesTarget),
          proteinTarget:    Number(u.proteinTarget),
          carbsTarget:      Number(u.carbsTarget),
          fatsTarget:       Number(u.fatsTarget),
          waterTargetMl:    Number(u.waterTargetMl)    || 2500,
          sleepTargetHours: Number(u.sleepTargetHours) || 8,
        })
        setAutoCalc(true)
        toast.success('Profile saved! Targets auto-calculated ✨')
      } else {
        toast.success('Profile updated!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    }
    setSaving(false)
  }

  const saveGoals = async () => {
    setSaving(true)
    try {
      const payload = {
        caloriesTarget:   Number(goals.caloriesTarget)   || 0,
        proteinTarget:    Number(goals.proteinTarget)     || 0,
        carbsTarget:      Number(goals.carbsTarget)       || 0,
        fatsTarget:       Number(goals.fatsTarget)        || 0,
        waterTargetMl:    Number(goals.waterTargetMl)     || 0,
        sleepTargetHours: Number(goals.sleepTargetHours)  || 0,
      }
      const { data } = await userApi.updateProfile(payload)
      const { password, ...safeUser } = data.user
      updateUser(safeUser)
      setTargets(payload)
      setAutoCalc(false)
      toast.success('Goals saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const hasFullProfile = profile.age && profile.heightCm && profile.weightKg &&
    profile.activityLevel && profile.goal
  const hasTargets     = Number(goals.caloriesTarget) > 0

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div>
        <p className="section-eyebrow">Account</p>
        <h1 className="font-display text-4xl sm:text-5xl text-white">PROFILE</h1>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#f5c518] flex items-center
          justify-center text-black font-display text-3xl sm:text-4xl shrink-0">
          {(profile.name || user?.name || 'U')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="font-condensed font-bold text-lg sm:text-xl text-[#e5e5e5] truncate">
            {profile.name || user?.name}
          </h2>
          <p className="text-sm text-[#4b5563] truncate">{user?.email}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {profile.goal && (
              <span className="badge badge-yellow">
                {GOAL_OPTIONS.find((g) => g.value === profile.goal)?.label || profile.goal}
              </span>
            )}
            {profile.activityLevel && (
              <span className="badge badge-green">
                {ACTIVITY_OPTIONS.find((a) => a.value === profile.activityLevel)?.label || profile.activityLevel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Auto-calculated targets */}
      {hasTargets && (
        <div className="gym-card gym-card-glow p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f5c51818] flex items-center justify-center">
                <Zap size={14} className="text-[#f5c518]" fill="#f5c518" />
              </div>
              <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase">
                Health Targets
              </h3>
            </div>
            {autoCalc && (
              <div className="flex items-center gap-1 text-[10px] font-condensed text-[#22c55e]">
                <Info size={11} /> Auto-calculated from your profile (BMR)
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <TargetCard label="Calories" value={goals.caloriesTarget} unit="kcal/day" color="#f5c518" />
            <TargetCard label="Protein"  value={goals.proteinTarget}  unit="g/day"   color="#22c55e" />
            <TargetCard label="Carbs"    value={goals.carbsTarget}    unit="g/day"   color="#f97316" />
            <TargetCard label="Fats"     value={goals.fatsTarget}     unit="g/day"   color="#8b5cf6" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <TargetCard label="Water" value={goals.waterTargetMl}    unit="ml/day"    color="#38bdf8" />
            <TargetCard label="Sleep" value={goals.sleepTargetHours} unit="hrs/night" color="#a78bfa" />
          </div>
          {autoCalc && (
            <p className="text-[11px] text-[#3a3a3a] font-condensed text-center pt-1">
              Update profile to recalculate · or override in Goals tab
            </p>
          )}
        </div>
      )}

      {!hasFullProfile && (
        <div className="flex items-start gap-3 bg-[#f5c51808] border border-[#f5c51825] rounded-xl p-3.5">
          <Info size={15} className="text-[#f5c518] shrink-0 mt-0.5" />
          <p className="text-xs font-condensed text-[#9ca3af] leading-relaxed">
            Fill in <span className="text-[#f5c518]">age, height, weight, activity level & goal</span> to
            get auto-calculated nutrition targets using the BMR formula.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111] rounded-xl p-1 border border-[#1a1a1a]">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-condensed font-bold tracking-wide transition-all
              ${tab === t ? 'bg-[#f5c518] text-black' : 'text-[#4b5563] hover:text-[#e5e5e5]'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'Profile' && (
        <div className="gym-card p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="gym-label">Full Name *</label>
              <input className="gym-input" value={profile.name} onChange={setP('name')} />
            </div>
            <div>
              <label className="gym-label">Age</label>
              <input type="number" min={10} max={100} className="gym-input" placeholder="25"
                value={profile.age} onChange={setP('age')} />
            </div>
            <div>
              <label className="gym-label">Gender</label>
              <select className="gym-input" value={profile.gender} onChange={setP('gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            {/* FIX 5: goal uses backend enum values */}
            <div>
              <label className="gym-label">Goal</label>
              <select className="gym-input" value={profile.goal} onChange={setP('goal')}>
                <option value="">— Select —</option>
                {GOAL_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="gym-label">Height (cm)</label>
              <input type="number" min={100} max={250} className="gym-input" placeholder="175"
                value={profile.heightCm} onChange={setP('heightCm')} />
            </div>
            <div>
              <label className="gym-label">Weight (kg)</label>
              <input type="number" min={30} max={300} className="gym-input" placeholder="70"
                value={profile.weightKg} onChange={setP('weightKg')} />
            </div>
            {/* FIX 5: activityLevel uses backend enum values */}
            <div className="sm:col-span-2">
              <label className="gym-label">Activity Level</label>
              <select className="gym-input" value={profile.activityLevel} onChange={setP('activityLevel')}>
                <option value="">— Select —</option>
                {ACTIVITY_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          {hasFullProfile && (
            <div className="flex items-center gap-1.5 text-xs font-condensed text-[#22c55e]">
              <Zap size={12} /> Saving will auto-calculate your nutrition targets via BMR
            </div>
          )}
          <button onClick={saveProfile} disabled={saving}
            className="btn-yellow w-full justify-center py-3">
            {saving
              ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              : <><Save size={16} /> Save Profile</>}
          </button>
        </div>
      )}

      {/* Goals tab */}
      {tab === 'Goals' && (
        <div className="gym-card p-4 sm:p-5 space-y-4">
          <div className="flex items-start gap-2.5 bg-[#f5c51808] border border-[#f5c51820] rounded-xl p-3">
            <Info size={14} className="text-[#f5c518] shrink-0 mt-0.5" />
            <p className="text-xs font-condensed text-[#9ca3af] leading-relaxed">
              {autoCalc
                ? 'Currently auto-calculated via BMR — override below to set custom values.'
                : 'Fill your profile to get auto-calculated targets, or set them manually.'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { k: 'caloriesTarget',   label: 'Calories',  unit: 'kcal', color: '#f5c518' },
              { k: 'proteinTarget',    label: 'Protein',   unit: 'g',    color: '#22c55e' },
              { k: 'carbsTarget',      label: 'Carbs',     unit: 'g',    color: '#f97316' },
              { k: 'fatsTarget',       label: 'Fats',      unit: 'g',    color: '#8b5cf6' },
              { k: 'waterTargetMl',    label: 'Water',     unit: 'ml',   color: '#38bdf8' },
              { k: 'sleepTargetHours', label: 'Sleep',     unit: 'hrs',  color: '#a78bfa' },
            ].map(({ k, label, unit, color }) => (
              <div key={k}>
                <label className="gym-label" style={{ color }}>
                  {label} <span className="text-[#3a3a3a] font-normal">({unit})</span>
                </label>
                <input type="number" min={0} className="gym-input"
                  placeholder="0" value={goals[k]} onChange={setG(k)} />
              </div>
            ))}
          </div>
          <button onClick={saveGoals} disabled={saving}
            className="btn-yellow w-full justify-center py-3">
            {saving
              ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              : <><Target size={16} /> Save Custom Goals</>}
          </button>
        </div>
      )}
    </div>
  )
}
