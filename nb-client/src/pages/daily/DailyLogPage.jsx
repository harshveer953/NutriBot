import React, { useEffect, useRef, useState } from 'react'
import {
  Droplets, Footprints, Moon, Save, Plus, Minus,
  TrendingUp, CheckCircle
} from 'lucide-react'
import useTrackerStore from '../../store/trackerStore'
import toast from 'react-hot-toast'

// FIX 3: MetricCard previously had:
//   useEffect(() => setLocal(value), [value])
// This caused the local edit state to be RESET every time the Zustand store
// updated (which happens immediately on every optimistic write). The user would
// click "+250ml", the store would update, the effect would fire, and local would
// be overwritten back to the store value before they could click Save.
//
// Solution: use a ref to track whether the user has an uncommitted local edit.
// Only sync from props on the FIRST render (initialisation). After that, the
// component owns its local value until the user explicitly saves.

function MetricCard({ icon: Icon, label, color, value, unit, step, max, quickAdds, onSave }) {
  const [local, setLocal]   = useState(value)
  const [saving, setSaving] = useState(false)
  // Track if user has made a local change that hasn't been saved yet
  const dirtyRef = useRef(false)

  // Only sync incoming value when user has NO pending edit.
  // This handles the initial load (null → real value from API).
  useEffect(() => {
    if (!dirtyRef.current) {
      setLocal(value)
    }
  }, [value])

  const pct     = max ? Math.min(Math.round((local / max) * 100), 100) : 0
  const changed = local !== value

  const change = (fn) => {
    dirtyRef.current = true
    setLocal(fn)
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await onSave(local)
    // After successful save the store now matches local — clear dirty flag
    if (!result || result.success !== false) {
      dirtyRef.current = false
    }
    setSaving(false)
  }

  return (
    <div className="gym-card p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${color}18` }}>
            <Icon size={18} style={{ color }} />
          </div>
          <div>
            <p className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase">
              {label}
            </p>
            <p className="text-xs text-[#3a3a3a] font-condensed">Target: {max} {unit}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="stat-number text-3xl" style={{ color }}>{local}</p>
          <p className="text-[10px] font-condensed text-[#3a3a3a] uppercase tracking-widest">{unit}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between mb-1.5">
          <p className="text-xs font-condensed text-[#4b5563]">{pct}% of daily goal</p>
          {pct >= 100 && (
            <div className="flex items-center gap-1 text-xs font-condensed text-[#22c55e]">
              <CheckCircle size={12} /> Goal hit!
            </div>
          )}
        </div>
        <div className="progress-track h-2.5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: pct >= 100 ? '#22c55e' : color }} />
        </div>
      </div>

      {/* Quick add buttons */}
      {quickAdds && (
        <div className="flex flex-wrap gap-2">
          <p className="w-full text-xs font-condensed text-[#3a3a3a] uppercase tracking-widest">
            Quick Add
          </p>
          {quickAdds.map(({ label: qLabel, amount }) => (
            <button key={qLabel}
              onClick={() => change((v) => Math.min(v + amount, max * 2))}
              className="px-2.5 py-1.5 rounded-lg text-xs font-condensed font-bold border
                border-[#242424] text-[#6b7280] hover:border-[#f5c518]/40 hover:text-[#f5c518]
                transition-all">
              +{qLabel}
            </button>
          ))}
        </div>
      )}

      {/* +/- controls */}
      <div className="flex items-center gap-3">
        <button onClick={() => change((v) => Math.max(0, v - step))}
          className="w-10 h-10 rounded-xl bg-[#111] border border-[#242424] flex items-center
            justify-center text-[#6b7280] hover:border-[#f5c518]/40 hover:text-[#f5c518]
            transition-all">
          <Minus size={16} />
        </button>

        <input
          type="number" min={0} max={max * 2} step={step}
          value={local}
          onChange={(e) => {
            dirtyRef.current = true
            setLocal(Math.max(0, Number(e.target.value)))
          }}
          className="gym-input flex-1 text-center text-base font-condensed font-bold"
          style={{ color }}
        />

        <button onClick={() => change((v) => v + step)}
          className="w-10 h-10 rounded-xl bg-[#111] border border-[#242424] flex items-center
            justify-center text-[#6b7280] hover:border-[#f5c518]/40 hover:text-[#f5c518]
            transition-all">
          <Plus size={16} />
        </button>

        <button onClick={handleSave} disabled={!changed || saving}
          className={`flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-condensed
            font-bold border transition-all shrink-0
            ${changed
              ? 'bg-[#f5c518] text-black border-[#f5c518]'
              : 'border-[#1a1a1a] text-[#2a2a2a] cursor-not-allowed'}`}>
          {saving
            ? <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            : <Save size={13} />
          }
          Save
        </button>
      </div>
    </div>
  )
}

function WeekTrend({ logs, field, color, label, unit }) {
  if (!logs.length) return null
  const vals   = logs.map((l) => l[field] || 0)
  const maxVal = Math.max(...vals, 1)
  return (
    <div className="gym-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-condensed tracking-widest text-[#4b5563] uppercase">
          {label} — Last 7 Days
        </p>
        <p className="text-xs font-condensed text-[#4b5563]">
          avg {Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)} {unit}
        </p>
      </div>
      <div className="flex items-end gap-1 h-12">
        {vals.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-sm transition-all"
              style={{
                height: `${(v / maxVal) * 100}%`,
                minHeight: v > 0 ? 4 : 0,
                background: color,
                opacity: i === vals.length - 1 ? 1 : 0.4,
              }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {logs.map((l, i) => (
          <p key={i} className="flex-1 text-center text-[9px] font-condensed text-[#2a2a2a]">
            {l.date?.slice(5) || ''}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function DailyLogPage() {
  const {
    todayLog, targets, fetchTodayLog, fetchWeeklyLogs,
    weeklyLogs, setWater, setSteps, setSleep,
  } = useTrackerStore()

  useEffect(() => {
    fetchTodayLog()
    fetchWeeklyLogs()
  }, [])

  const log = todayLog || {}

  const handleSaveWater = async (val) => {
    const r = await setWater(val)
    if (r?.success === false) toast.error(r.error || 'Failed')
    else toast.success('Water updated!')
    return r
  }
  const handleSaveSteps = async (val) => {
    const r = await setSteps(val)
    if (r?.success === false) toast.error(r.error || 'Failed')
    else toast.success('Steps updated!')
    return r
  }
  const handleSaveSleep = async (val) => {
    const r = await setSleep(val)
    if (r?.success === false) toast.error(r.error || 'Failed')
    else toast.success('Sleep updated!')
    return r
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div>
        <p className="section-eyebrow">Today's Log</p>
        <h1 className="font-display text-4xl sm:text-5xl text-white">DAILY TRACKER</h1>
        <p className="text-[#6b7280] text-sm font-condensed mt-1">
          Aaj ka water, steps aur sleep track karo
        </p>
      </div>

      {/* Summary bar */}
      {log && (
        <div className="gym-card gym-card-glow p-4 sm:p-5">
          <p className="text-xs font-condensed tracking-widest text-[#6b7280] uppercase mb-4">
            Today's Overview
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Water', val: log.waterMl,    max: targets.waterTargetMl,    unit: 'ml',  color: '#38bdf8' },
              { label: 'Steps', val: log.steps,      max: 10000,                    unit: 'steps',color: '#f5c518' },
              { label: 'Sleep', val: log.sleepHours, max: targets.sleepTargetHours, unit: 'hrs', color: '#8b5cf6' },
            ].map(({ label, val, max, unit, color }) => {
              const p = max ? Math.min(Math.round(((val || 0) / max) * 100), 100) : 0
              return (
                <div key={label}>
                  <p className="stat-number text-2xl sm:text-3xl" style={{ color }}>{val || 0}</p>
                  <p className="text-[10px] font-condensed text-[#3a3a3a] uppercase tracking-widest">{unit}</p>
                  <div className="progress-track h-1.5 rounded-full mt-2 mx-auto max-w-[80px]">
                    <div className="h-full rounded-full" style={{ width: `${p}%`, background: color }} />
                  </div>
                  <p className="text-[10px] font-condensed text-[#4b5563] mt-1">{p}%</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <MetricCard icon={Droplets} label="Water Intake" color="#38bdf8"
        value={log.waterMl || 0} unit="ml" step={250} max={targets.waterTargetMl || 2500}
        quickAdds={[
          { label: '250ml', amount: 250 },
          { label: '500ml', amount: 500 },
          { label: '1L',    amount: 1000 },
        ]}
        onSave={handleSaveWater}
      />

      <MetricCard icon={Footprints} label="Steps" color="#f5c518"
        value={log.steps || 0} unit="steps" step={500} max={10000}
        quickAdds={[
          { label: '1k', amount: 1000 },
          { label: '2k', amount: 2000 },
          { label: '5k', amount: 5000 },
        ]}
        onSave={handleSaveSteps}
      />

      <MetricCard icon={Moon} label="Sleep" color="#8b5cf6"
        value={log.sleepHours || 0} unit="hours" step={0.5} max={targets.sleepTargetHours || 8}
        quickAdds={[
          { label: '30m', amount: 0.5 },
          { label: '1h',  amount: 1 },
          { label: '2h',  amount: 2 },
        ]}
        onSave={handleSaveSleep}
      />

      {weeklyLogs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-[#4b5563]" />
            <p className="text-xs font-condensed tracking-widest text-[#4b5563] uppercase">
              Weekly Trends
            </p>
          </div>
          <WeekTrend logs={weeklyLogs} field="waterMl"    color="#38bdf8" label="Water"  unit="ml" />
          <WeekTrend logs={weeklyLogs} field="steps"      color="#f5c518" label="Steps"  unit="steps" />
          <WeekTrend logs={weeklyLogs} field="sleepHours" color="#8b5cf6" label="Sleep"  unit="hrs" />
        </div>
      )}
    </div>
  )
}
