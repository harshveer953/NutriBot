import React, { useEffect, useState } from 'react'
import { Flame, Zap, Target, Calendar, TrendingUp, Award } from 'lucide-react'
import useTrackerStore from '../../store/trackerStore'
import useMealStore    from '../../store/mealStore'
import useWorkoutStore from '../../store/workoutStore'
import { format, subDays, parseISO, isSameDay } from 'date-fns'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function HeatCell({ day, intensity }) {
  const colors = ['#111', '#7c2d12', '#b45309', '#ca8a04', '#f5c518']
  const borders = ['border-[#1a1a1a]', '', '', '', '']
  const i = Math.min(intensity, 4)
  return (
    <div
      title={`${day.date} — Activity: ${['None','Low','Moderate','Good','Full'][i]}`}
      className={`w-3 h-3 rounded-sm transition-all hover:scale-125 cursor-pointer border
        ${intensity === 0 ? 'border-[#1a1a1a]' : 'border-transparent'}`}
      style={{ background: colors[i] }}
    />
  )
}

function StatCard({ icon: Icon, label, value, unit, color, sub }) {
  return (
    <div className="gym-card p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="stat-number text-3xl sm:text-4xl text-white">
        {value}
        <span className="text-sm font-body font-normal text-[#4b5563] ml-1">{unit}</span>
      </p>
      <p className="text-xs font-condensed text-[#4b5563] uppercase tracking-widest mt-1">{label}</p>
      {sub && <p className="text-xs text-[#3a3a3a] font-condensed mt-0.5">{sub}</p>}
    </div>
  )
}

export default function StreaksPage() {
  const { weeklyLogs, fetchWeeklyLogs } = useTrackerStore()
  const { meals, fetchMeals }           = useMealStore()
  const { workouts, fetchWorkouts }     = useWorkoutStore()
  const [heatmap, setHeatmap]           = useState([])
  const [weeks, setWeeks]               = useState([])

  useEffect(() => {
    fetchWeeklyLogs()
    fetchMeals()
    fetchWorkouts()
  }, [])

  // Build 84-day (12-week) heatmap
  useEffect(() => {
    const grid = []
    for (let i = 83; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const ds   = format(date, 'yyyy-MM-dd')
      const log  = weeklyLogs.find((l) => l.date?.startsWith(ds))

      // Score: calories logged (2pts), water logged (1pt), sleep logged (1pt)
      let score = 0
      if (log) {
        if ((log.totalCalories || 0) > 0) score += 2
        if ((log.waterMl       || 0) > 0) score += 1
        if ((log.sleepHours    || 0) > 0) score += 1
      }
      grid.push({ date: ds, intensity: Math.min(score, 4) })
    }

    // Group into weeks of 7
    const w = []
    for (let i = 0; i < grid.length; i += 7) {
      w.push(grid.slice(i, i + 7))
    }
    setHeatmap(grid)
    setWeeks(w)
  }, [weeklyLogs])

  // Streak calculation
  const { currentStreak, longestStreak, activeDays } = (() => {
    let cur = 0, longest = 0, temp = 0, active = 0
    heatmap.forEach((d) => {
      if (d.intensity > 0) {
        temp++
        active++
        if (temp > longest) longest = temp
      } else {
        temp = 0
      }
    })
    // current = from today backwards
    for (let i = heatmap.length - 1; i >= 0; i--) {
      if (heatmap[i].intensity > 0) cur++
      else break
    }
    return { currentStreak: cur, longestStreak: longest, activeDays: active }
  })()

  // Day labels
  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  // Weekly activity for last 7 days
  const last7 = heatmap.slice(-7)
  const weekScore = last7.filter((d) => d.intensity > 0).length

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div>
        <p className="section-eyebrow">Gamification</p>
        <h1 className="font-display text-4xl sm:text-5xl text-white">STREAKS</h1>
        <p className="text-[#6b7280] text-sm font-condensed mt-1">
          Consistency is your superpower. Don't break the chain.
        </p>
      </div>

      {/* Streak hero */}
      {currentStreak >= 1 && (
        <div className="gym-card gym-card-glow p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 text-[120px] opacity-5 select-none">🔥</div>
          <div className="relative z-10 flex items-center gap-4 sm:gap-6">
            <div className="text-5xl sm:text-6xl animate-streak-flame select-none">🔥</div>
            <div>
              <p className="text-xs font-condensed tracking-widest text-[#f97316] uppercase mb-1">
                Current Streak
              </p>
              <p className="font-display text-5xl sm:text-7xl text-white leading-none">
                {currentStreak}
                <span className="text-2xl sm:text-3xl text-[#f5c518] ml-2">days</span>
              </p>
              <p className="text-sm text-[#6b7280] font-condensed mt-2">
                {currentStreak >= 7
                  ? '🏆 You\'re on fire! Keep crushing it.'
                  : currentStreak >= 3
                  ? '💪 Great momentum. Keep it up!'
                  : '✅ Good start! Build that habit.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {currentStreak === 0 && (
        <div className="gym-card p-5 flex items-center gap-4 border-dashed">
          <div className="text-4xl opacity-40">🔥</div>
          <div>
            <p className="font-condensed font-bold text-[#6b7280]">No active streak</p>
            <p className="text-xs text-[#3a3a3a] font-condensed">
              Log meals, water, or sleep today to start your streak!
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Flame}     label="Current Streak" value={currentStreak} unit="days"
          color="#f97316" sub="Days in a row" />
        <StatCard icon={Award}     label="Longest Streak" value={longestStreak} unit="days"
          color="#f5c518" sub="Personal best" />
        <StatCard icon={Calendar}  label="Active Days"    value={activeDays}    unit=""
          color="#22c55e" sub="Last 12 weeks" />
        <StatCard icon={TrendingUp} label="This Week"     value={weekScore}     unit="/ 7"
          color="#38bdf8" sub="Days active" />
      </div>

      {/* Heatmap */}
      <div className="gym-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase">
            12-Week Activity Map
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-xs font-condensed text-[#3a3a3a]">Less</p>
            {['#111','#7c2d12','#b45309','#ca8a04','#f5c518'].map((c, i) => (
              <div key={i} className="w-3 h-3 rounded-sm border border-[#1a1a1a20]"
                style={{ background: c }} />
            ))}
            <p className="text-xs font-condensed text-[#3a3a3a]">More</p>
          </div>
        </div>

        {/* Day labels */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <HeatCell key={di} day={day} intensity={day.intensity} />
              ))}
            </div>
          ))}
        </div>

        <p className="text-xs text-[#2a2a2a] font-condensed text-center">
          Each cell = 1 day · Darker = more activity logged
        </p>
      </div>

      {/* Last 7 days breakdown */}
      <div className="gym-card p-4 sm:p-5 space-y-4">
        <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase">
          This Week
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {last7.map((day, i) => {
            const isToday  = day.date === format(new Date(), 'yyyy-MM-dd')
            const dayLabel = format(parseISO(day.date), 'EEE')
            const dateNum  = format(parseISO(day.date), 'd')
            const colors   = ['#111','#7c2d12','#b45309','#ca8a04','#f5c518']
            const active   = day.intensity > 0
            return (
              <div key={i} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl
                ${isToday ? 'bg-[#f5c51810] border border-[#f5c51830]' : ''}`}>
                <p className={`text-[10px] font-condensed font-bold uppercase tracking-widest
                  ${isToday ? 'text-[#f5c518]' : 'text-[#3a3a3a]'}`}>
                  {dayLabel}
                </p>
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: active ? `${colors[day.intensity]}40` : '#111' }}>
                  <p className={`text-sm font-condensed font-bold
                    ${active ? 'text-[#f5c518]' : 'text-[#2a2a2a]'}`}>
                    {dateNum}
                  </p>
                </div>
                {active
                  ? <p className="text-[10px] text-[#22c55e]">✓</p>
                  : <p className="text-[10px] text-[#2a2a2a]">–</p>
                }
              </div>
            )
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="gym-card p-4 sm:p-5 border-[#f5c51830]">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-[#f5c518]" />
          <p className="font-condensed font-bold text-xs tracking-widest text-[#f5c518] uppercase">
            How to Build Streaks
          </p>
        </div>
        <div className="space-y-2">
          {[
            { emoji: '🍽️', text: 'Log at least one meal with calories' },
            { emoji: '💧', text: 'Log your water intake (any amount)' },
            { emoji: '😴', text: 'Log your sleep hours for the day' },
          ].map(({ emoji, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <span className="text-base">{emoji}</span>
              <p className="text-sm font-condensed text-[#6b7280]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
