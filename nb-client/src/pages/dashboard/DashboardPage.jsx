import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Camera, Plus, Droplets, Moon, Footprints,
  Flame, ArrowRight, Dumbbell, Zap, TrendingUp,
} from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import useAuthStore from '../../store/authStore'
import useTrackerStore from '../../store/trackerStore'
import useMealStore from '../../store/mealStore'
import { format } from 'date-fns'

// ─── Calorie ring ──────────────────────────────────────────────
function CalorieRing({ current, goal }) {
  const pct  = Math.min((current / (goal || 2000)) * 100, 100)
  const data = [
    { value: pct,       fill: '#f5c518' },
    { value: 100 - pct, fill: '#1a1a1a' },
  ]
  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
          startAngle={90} endAngle={-270} data={data} barSize={10}>
          <RadialBar dataKey="value" cornerRadius={5} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="stat-number text-xl sm:text-2xl text-white">{current}</p>
        <p className="text-[10px] font-condensed tracking-widest text-[#4b5563] uppercase">
          / {goal || 2000}
        </p>
        <p className="text-[10px] font-condensed text-[#4b5563]">kcal</p>
      </div>
    </div>
  )
}

// ─── Macro progress bar ────────────────────────────────────────
function MacroBar({ label, current, goal, color }) {
  const pct = Math.min(Math.round(((current || 0) / (goal || 1)) * 100), 100)
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-condensed font-semibold tracking-widest
          text-[#6b7280] uppercase">{label}</span>
        <span className="text-xs font-condensed text-[#9ca3af]">
          {current || 0}g / {goal || 0}g
        </span>
      </div>
      <div className="progress-track h-1.5">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ─── Stat tile ─────────────────────────────────────────────────
function StatTile({ icon: Icon, label, value, unit, max, color }) {
  const pct = max ? Math.min(Math.round((value / max) * 100), 100) : null
  return (
    <div className="gym-card p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span className="text-[10px] font-condensed tracking-widest text-[#4b5563] uppercase">
          {label}
        </span>
      </div>
      <p className="stat-number text-2xl sm:text-3xl text-white">
        {value ?? 0}
        <span className="text-xs sm:text-sm text-[#4b5563] ml-1 font-body font-normal">{unit}</span>
      </p>
      {pct !== null && (
        <div className="progress-track h-1 mt-2">
          <div className="progress-fill h-full" style={{ width: `${pct}%`, background: color }} />
        </div>
      )}
    </div>
  )
}

// ─── Today's Nutrition card (from GET /daily-log/today) ─────────
function NutritionCard({ log, targets }) {
  const macros = [
    { label: 'Protein', key: 'totalProtein', goal: targets.proteinTarget, color: '#f5c518' },
    { label: 'Carbs',   key: 'totalCarbs',   goal: targets.carbsTarget,   color: '#f97316' },
    { label: 'Fats',    key: 'totalFats',    goal: targets.fatsTarget,    color: '#8b5cf6' },
  ]
  const calPct = Math.min(
    Math.round(((log.totalCalories || 0) / (targets.caloriesTarget || 2000)) * 100),
    100
  )
  const remaining = (targets.caloriesTarget || 2000) - (log.totalCalories || 0)

  return (
    <div className="gym-card gym-card-glow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase">
          Today's Nutrition
        </h3>
        <Link to="/daily-log"
          className="text-xs text-[#f5c518] font-condensed flex items-center gap-1">
          Log <ArrowRight size={13} />
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
        {/* Calorie ring */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <CalorieRing current={log.totalCalories || 0} goal={targets.caloriesTarget} />
          <span className={`badge text-xs ${remaining > 0 ? 'badge-yellow' : 'badge-green'}`}>
            {remaining > 0 ? `${remaining} kcal left` : 'Goal hit! 🎉'}
          </span>
        </div>

        {/* Macro bars */}
        <div className="flex-1 w-full space-y-3 sm:space-y-4">
          {macros.map(({ label, key, goal, color }) => (
            <MacroBar key={label} label={label}
              current={log[key]} goal={goal} color={color} />
          ))}
          {/* Calorie overall */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs font-condensed font-semibold tracking-widest
                text-[#6b7280] uppercase">Calories</span>
              <span className="text-xs font-condensed text-[#9ca3af]">
                {log.totalCalories || 0} / {targets.caloriesTarget || 2000} kcal
              </span>
            </div>
            <div className="progress-track h-1.5">
              <div className="progress-fill"
                style={{
                  width: `${calPct}%`,
                  background: calPct >= 100 ? '#22c55e' : '#f5c518',
                }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ─────────────────────────────────────────────────
export default function DashboardPage() {
  const { user }                                        = useAuthStore()
  const { todayLog, targets, fetchTodayLog }           = useTrackerStore()
  const { meals, fetchMeals }                          = useMealStore()

  useEffect(() => {
    fetchTodayLog()
    fetchMeals()
  }, [])

  const today     = format(new Date(), 'EEEE, MMMM d')
  const log       = todayLog || {}
  const todayStr  = format(new Date(), 'yyyy-MM-dd')
  const todayMeals = meals.filter((m) => m.loggedAt?.startsWith(todayStr))

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="section-eyebrow">{today}</p>
          <h1 className="font-display text-3xl sm:text-4xl text-white mt-1">
            HEY, {user?.name?.split(' ')[0]?.toUpperCase() || 'CHAMP'} 💪
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/ai/snap"   className="btn-yellow gap-2 text-sm">
            <Camera size={15} /> Snap Meal
          </Link>
          <Link to="/meals/add" className="btn-outline gap-2 text-sm">
            <Plus size={15} /> Log Food
          </Link>
        </div>
      </div>

      {/* ── Today's Nutrition (from /daily-log/today) ── */}
      <NutritionCard log={log} targets={targets} />

      {/* ── Stat tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile icon={Droplets}   label="Water"  value={log.waterMl || 0}
          unit="ml"     max={targets.waterTargetMl}    color="#38bdf8" />
        <StatTile icon={Footprints} label="Steps"  value={log.steps || 0}
          unit="steps"  max={10000}                    color="#f5c518" />
        <StatTile icon={Moon}       label="Sleep"  value={log.sleepHours || 0}
          unit="hrs"    max={targets.sleepTargetHours} color="#8b5cf6" />
        <StatTile icon={Flame}      label="Meals"  value={todayMeals.length}
          unit="logged" color="#f97316" />
      </div>

      {/* ── Today's meals + Quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Meals list */}
        <div className="lg:col-span-2 gym-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-condensed font-bold text-sm tracking-widest
              text-[#6b7280] uppercase">Today's Meals</h3>
            <Link to="/meals/my-plan"
              className="text-xs text-[#f5c518] font-condensed flex items-center gap-1">
              My Plan <ArrowRight size={13} />
            </Link>
          </div>

          {todayMeals.length === 0 ? (
            <div className="flex flex-col items-center py-8 sm:py-10 gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#111] border border-[#242424]
                flex items-center justify-center">
                <Plus size={20} className="text-[#3a3a3a]" />
              </div>
              <p className="text-sm text-[#4b5563] font-condensed">No meals logged today</p>
              <Link to="/meals/add" className="btn-outline text-xs py-1.5 px-4">
                Log First Meal
              </Link>
            </div>
          ) : (
            <div className="space-y-0">
              {todayMeals.slice(0, 5).map((meal) => (
                <div key={meal._id}
                  className="flex items-center justify-between py-2.5
                    border-b border-[#1a1a1a] last:border-0 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-condensed font-semibold text-[#e5e5e5] truncate">
                      {meal.title}
                    </p>
                    <span className="badge badge-orange mt-0.5 capitalize">{meal.mealType}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-condensed font-bold text-[#f5c518]">
                      {meal.calories} kcal
                    </p>
                    <p className="text-xs text-[#4b5563]">
                      P:{meal.protein}g C:{meal.carbs}g F:{meal.fats}g
                    </p>
                  </div>
                </div>
              ))}
              {todayMeals.length > 5 && (
                <p className="text-xs text-center text-[#4b5563] font-condensed pt-2">
                  +{todayMeals.length - 5} more ·{' '}
                  <Link to="/meals/my-plan" className="text-[#f5c518]">View all</Link>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="font-condensed font-bold text-sm tracking-widest
            text-[#4b5563] uppercase px-1">Quick Actions</h3>
          {[
            { to: '/ai/snap',      icon: Camera,     label: 'Snap & Log Meal',    sub: 'AI food recognition', color: '#f5c518' },
            { to: '/ai/planner',   icon: Zap,        label: 'Generate Meal Plan', sub: 'AI weekly planner',   color: '#f97316' },
            { to: '/workouts/add', icon: Dumbbell,   label: 'Log Workout',        sub: 'Track your session',  color: '#8b5cf6' },
            { to: '/analytics',    icon: TrendingUp, label: 'View Insights',      sub: 'AI trend analysis',   color: '#22c55e' },
          ].map(({ to, icon: Icon, label, sub, color }) => (
            <Link key={to} to={to}
              className="gym-card flex items-center gap-3 p-3 sm:p-3.5 group cursor-pointer">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}>
                <Icon size={17} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-condensed font-semibold text-[#e5e5e5]
                  group-hover:text-white truncate">{label}</p>
                <p className="text-xs text-[#4b5563] truncate">{sub}</p>
              </div>
              <ArrowRight size={14}
                className="text-[#2a2a2a] group-hover:text-[#f5c518] transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
