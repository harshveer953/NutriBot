import React, { useEffect, useState } from 'react'
import { Trophy, Lock, Zap } from 'lucide-react'
import useMealStore    from '../../store/mealStore'
import useWorkoutStore from '../../store/workoutStore'
import useTrackerStore from '../../store/trackerStore'

const BADGE_TIERS = {
  bronze: { color: '#cd7f32', bg: '#cd7f3218', label: 'Bronze' },
  silver: { color: '#c0c0c0', bg: '#c0c0c018', label: 'Silver' },
  gold:   { color: '#f5c518', bg: '#f5c51818', label: 'Gold'   },
  fire:   { color: '#f97316', bg: '#f9731618', label: 'Elite'  },
}

const BADGES = [
  {
    id: 'first_meal', emoji: '🍽️', title: 'First Bite', tier: 'bronze',
    desc: 'Log your first meal',
    check: ({ meals }) => meals.length >= 1,
  },
  {
    id: 'meal_10', emoji: '🥗', title: 'Food Logger', tier: 'silver',
    desc: 'Log 10 meals total',
    progress: ({ meals }) => ({ cur: meals.length, max: 10 }),
    check: ({ meals }) => meals.length >= 10,
  },
  {
    id: 'meal_50', emoji: '👨‍🍳', title: 'Meal Master', tier: 'gold',
    desc: 'Log 50 meals total',
    progress: ({ meals }) => ({ cur: meals.length, max: 50 }),
    check: ({ meals }) => meals.length >= 50,
  },
  {
    id: 'first_workout', emoji: '💪', title: 'First Rep', tier: 'bronze',
    desc: 'Log your first workout',
    check: ({ workouts }) => workouts.length >= 1,
  },
  {
    id: 'workout_10', emoji: '🏋️', title: 'Iron Addict', tier: 'silver',
    desc: 'Log 10 workouts',
    progress: ({ workouts }) => ({ cur: workouts.length, max: 10 }),
    check: ({ workouts }) => workouts.length >= 10,
  },
  {
    id: 'workout_30', emoji: '🏆', title: 'Gym Rat', tier: 'gold',
    desc: 'Log 30 workouts',
    progress: ({ workouts }) => ({ cur: workouts.length, max: 30 }),
    check: ({ workouts }) => workouts.length >= 30,
  },
  {
    id: 'water_goal', emoji: '💧', title: 'Hydrated', tier: 'silver',
    desc: 'Hit your water goal today',
    check: ({ todayLog, targets }) =>
      (todayLog?.waterMl || 0) >= (targets?.waterTargetMl || 2500),
  },
  {
    id: 'calorie_hit', emoji: '🎯', title: 'On Target', tier: 'silver',
    desc: 'Hit your calorie goal today',
    check: ({ todayLog, targets }) =>
      (todayLog?.totalCalories || 0) >= (targets?.caloriesTarget || 2000),
  },
  {
    id: 'sleep_well', emoji: '😴', title: 'Well Rested', tier: 'bronze',
    desc: 'Log 8+ hours of sleep',
    check: ({ todayLog }) => (todayLog?.sleepHours || 0) >= 8,
  },
  {
    id: 'snap_meal', emoji: '📸', title: 'Snap Chef', tier: 'silver',
    desc: 'Log a meal using AI Snap',
    check: ({ meals }) => meals.some((m) => m.image),
  },
  {
    id: 'all_macros', emoji: '⚡', title: 'Macro Maniac', tier: 'gold',
    desc: 'Hit all macro goals in one day',
    check: ({ todayLog, targets }) => {
      if (!todayLog || !targets) return false
      return (
        (todayLog.totalProtein || 0) >= (targets.proteinTarget || 1) &&
        (todayLog.totalCarbs   || 0) >= (targets.carbsTarget   || 1) &&
        (todayLog.totalFats    || 0) >= (targets.fatsTarget    || 1)
      )
    },
  },
  {
    id: 'diverse_workouts', emoji: '🌟', title: 'All-Rounder', tier: 'fire',
    desc: 'Log 5 different workout types',
    progress: ({ workouts }) => {
      const types = new Set(workouts.map((w) => w.type))
      return { cur: types.size, max: 5 }
    },
    check: ({ workouts }) => new Set(workouts.map((w) => w.type)).size >= 5,
  },
]

function BadgeCard({ badge, unlocked, ctx }) {
  const tier = BADGE_TIERS[badge.tier] || BADGE_TIERS.bronze
  const prog = badge.progress?.(ctx)

  return (
    <div className={`gym-card p-4 sm:p-5 flex flex-col items-center text-center gap-3
      transition-all duration-300 relative overflow-hidden
      ${unlocked
        ? 'border-opacity-40 hover:border-opacity-80'
        : 'opacity-50 grayscale'}`}
      style={unlocked ? { borderColor: `${tier.color}40` } : {}}>

      {/* Tier indicator */}
      {unlocked && (
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-condensed font-bold px-1.5 py-0.5 rounded-full border"
            style={{ color: tier.color, borderColor: `${tier.color}40`, background: tier.bg }}>
            {tier.label}
          </span>
        </div>
      )}

      {/* Emoji */}
      <div className="relative">
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl
          ${unlocked ? '' : 'bg-[#111] border border-[#1a1a1a]'}`}
          style={unlocked ? { background: tier.bg, border: `1px solid ${tier.color}30` } : {}}>
          {unlocked ? badge.emoji : <Lock size={22} className="text-[#2a2a2a]" />}
        </div>
        {unlocked && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e]
            flex items-center justify-center border-2 border-[#161616]">
            <span className="text-[10px]">✓</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1 min-w-0 w-full">
        <p className={`font-condensed font-bold text-sm ${unlocked ? 'text-[#e5e5e5]' : 'text-[#3a3a3a]'}`}>
          {badge.title}
        </p>
        <p className="text-xs font-condensed text-[#4b5563] leading-snug">{badge.desc}</p>
      </div>

      {/* Progress bar if applicable and not yet unlocked */}
      {!unlocked && prog && (
        <div className="w-full space-y-1">
          <div className="progress-track h-1.5 rounded-full w-full">
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((prog.cur / prog.max) * 100, 100)}%`,
                background: tier.color,
                opacity: 0.6,
              }} />
          </div>
          <p className="text-[10px] font-condensed text-[#3a3a3a]">
            {prog.cur} / {prog.max}
          </p>
        </div>
      )}

      {unlocked && (
        <span className="text-[10px] font-condensed text-[#22c55e] font-bold uppercase tracking-widest">
          ✓ Unlocked
        </span>
      )}
    </div>
  )
}

export default function BadgesPage() {
  const { meals, fetchMeals }                              = useMealStore()
  const { workouts, fetchWorkouts }                        = useWorkoutStore()
  const { todayLog, targets, fetchTodayLog, fetchWeeklyLogs } = useTrackerStore()
  const [activeFilter, setFilter]                          = useState('all')

  useEffect(() => {
    fetchMeals()
    fetchWorkouts()
    fetchTodayLog()
    fetchWeeklyLogs()
  }, [])

  const ctx      = { meals, workouts, todayLog, targets }
  const unlocked = BADGES.filter((b) => b.check(ctx))
  const locked   = BADGES.filter((b) => !b.check(ctx))
  const pct      = Math.round((unlocked.length / BADGES.length) * 100)

  const tierCounts = {}
  unlocked.forEach((b) => {
    tierCounts[b.tier] = (tierCounts[b.tier] || 0) + 1
  })

  const filtered = activeFilter === 'all'
    ? BADGES
    : activeFilter === 'unlocked'
    ? unlocked
    : locked

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div>
        <p className="section-eyebrow">Gamification</p>
        <h1 className="font-display text-4xl sm:text-5xl text-white">BADGES</h1>
        <p className="text-[#6b7280] text-sm font-condensed mt-1">
          Milestones achieve karo — apni progress celebrate karo
        </p>
      </div>

      {/* Progress hero */}
      <div className="gym-card gym-card-glow p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f5c51818] border border-[#f5c51830]
              flex items-center justify-center">
              <Trophy size={24} className="text-[#f5c518]" />
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl text-[#f5c518]">
                {unlocked.length}
                <span className="text-[#4b5563] text-xl"> / {BADGES.length}</span>
              </p>
              <p className="text-xs font-condensed text-[#4b5563] uppercase tracking-widest">
                Badges Collected
              </p>
            </div>
          </div>
          <p className="font-display text-4xl text-[#f5c518]">{pct}%</p>
        </div>

        {/* Overall progress bar */}
        <div className="progress-track h-3 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #f5c518, #f97316)'
            }} />
        </div>

        {/* Tier breakdown */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {Object.entries(BADGE_TIERS).map(([key, tier]) => (
            <div key={key} className="rounded-xl p-2.5 border"
              style={{ background: tier.bg, borderColor: `${tier.color}20` }}>
              <p className="font-condensed font-bold text-lg" style={{ color: tier.color }}>
                {tierCounts[key] || 0}
              </p>
              <p className="text-[10px] font-condensed text-[#4b5563] uppercase tracking-widest mt-0.5">
                {tier.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[#111] rounded-xl p-1 border border-[#1a1a1a]">
        {[
          { key: 'all',      label: `All (${BADGES.length})` },
          { key: 'unlocked', label: `Unlocked (${unlocked.length})` },
          { key: 'locked',   label: `Locked (${locked.length})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex-1 py-2 rounded-lg text-xs font-condensed font-bold tracking-wide transition-all
              ${activeFilter === key
                ? 'bg-[#f5c518] text-black'
                : 'text-[#4b5563] hover:text-[#e5e5e5]'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <span className="text-5xl">{activeFilter === 'unlocked' ? '🔒' : '✅'}</span>
          <p className="font-condensed text-[#4b5563]">
            {activeFilter === 'unlocked'
              ? 'No badges unlocked yet. Start logging!'
              : 'All badges unlocked! You\'re a legend 🏆'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              unlocked={badge.check(ctx)}
              ctx={ctx}
            />
          ))}
        </div>
      )}

      {/* Motivational tip */}
      <div className="gym-card p-4 sm:p-5 border-[#f5c51820]">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-[#f5c518]" />
          <p className="text-xs font-condensed font-bold tracking-widest text-[#f5c518] uppercase">
            Next Badge Tips
          </p>
        </div>
        <div className="space-y-2">
          {locked.slice(0, 3).map((badge) => {
            const prog = badge.progress?.(ctx)
            return (
              <div key={badge.id} className="flex items-center gap-3">
                <span className="text-lg opacity-60">{badge.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-condensed font-bold text-[#6b7280]">{badge.title}</p>
                  <p className="text-[11px] text-[#3a3a3a] font-condensed">{badge.desc}</p>
                </div>
                {prog && (
                  <p className="text-xs font-condensed text-[#4b5563] shrink-0">
                    {prog.cur}/{prog.max}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
