import React, { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, Brain, Lightbulb } from 'lucide-react'
import { analyticsApi } from '../../api/analyticsApi'
import { format, parseISO } from 'date-fns'

const TOOLTIP_STYLE = {

  contentStyle: {
    background: '#161616', border: '1px solid #242424', borderRadius: '8px',
    color: '#e5e5e5', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13
  },
  labelStyle: { color: '#f5c518' },
  cursor: { stroke: 'rgba(245,197,24,0.1)', strokeWidth: 20 },
  
}

export default function AnalyticsDashboard() {
  const [data, setData]     = useState(null)   // { success, summary, averages, logs[] }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.getAnalytics()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Format logs for charts — logs are DailyLog docs
  const chartLogs = (data?.logs || []).map((log) => ({
    day:      log.date ? format(parseISO(log.date), 'MMM d') : '',
    calories: log.totalCalories || 0,
    protein:  log.totalProtein  || 0,
    carbs:    log.totalCarbs    || 0,
    fats:     log.totalFats     || 0,
    water:    log.waterMl       || 0,
    sleep:    log.sleepHours    || 0,
    steps:    log.steps         || 0,
  }))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <p className="section-eyebrow">Progress</p>
        <h1 className="font-display text-4xl text-white">ANALYTICS</h1>
        <p className="text-[#6b7280] text-sm mt-1">Last 14 days of your health data.</p>
      </div>

      {/* AI Summary */}
      {data?.summary && (
        <div className="gym-card gym-card-glow p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#f5c51812] border border-[#f5c51830] flex items-center justify-center shrink-0">
            <Brain size={20} className="text-[#f5c518]" />
          </div>
          <div>
            <p className="text-xs font-condensed tracking-widest text-[#f5c518] uppercase mb-1">AI Summary</p>
            <p className="text-[#d1d5db] text-sm leading-relaxed">{data.summary}</p>
          </div>
        </div>
      )}

      {/* Averages — averages.{ sleepHours, waterMl, calories } */}
      {data?.averages && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Avg Calories', value: data.averages.calories, unit: 'kcal', color: '#f5c518' },
            { label: 'Avg Water',    value: data.averages.waterMl,  unit: 'ml',   color: '#38bdf8' },
            { label: 'Avg Sleep',    value: data.averages.sleepHours, unit: 'hrs', color: '#8b5cf6' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="gym-card p-4 text-center">
              <p className="stat-number text-3xl" style={{ color }}>{value}</p>
              <p className="text-xs font-condensed text-[#4b5563] uppercase tracking-widest mt-0.5">{unit}</p>
              <p className="text-xs text-[#3a3a3a] font-condensed mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="gym-card p-5 h-56 skeleton rounded-xl" />)}
        </div>
      )}

      {!loading && chartLogs.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-4">
          <Lightbulb size={40} className="text-[#2a2a2a]" />
          <p className="font-condensed text-[#4b5563] text-lg">No data yet</p>
          <p className="text-sm text-[#3a3a3a] text-center max-w-xs">Log meals, workouts, water and sleep for a few days to see your analytics.</p>
        </div>
      )}

      {chartLogs.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">

          {/* Calories */}
          <div className="gym-card p-5">
            <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase mb-4">Calorie Intake</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartLogs} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f5c518" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f5c518" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#4b5563', fontSize: 11, fontFamily: 'Barlow Condensed' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 11, fontFamily: 'Barlow Condensed' }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="calories" stroke="#f5c518" strokeWidth={2} fill="url(#calGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Macros */}
          <div className="gym-card p-5">
            <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase mb-4">Macro Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartLogs} barSize={5} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: '#4b5563', fontSize: 11, fontFamily: 'Barlow Condensed' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 11, fontFamily: 'Barlow Condensed' }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="protein" fill="#f5c518" radius={[3, 3, 0, 0]} />
                <Bar dataKey="carbs"   fill="#f97316" radius={[3, 3, 0, 0]} />
                <Bar dataKey="fats"    fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {[['Protein', '#f5c518'], ['Carbs', '#f97316'], ['Fats', '#8b5cf6']].map(([l, c]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                  <span className="text-xs font-condensed text-[#6b7280]">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Water */}
          <div className="gym-card p-5">
            <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase mb-4">Water Intake (ml)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartLogs} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#4b5563', fontSize: 11, fontFamily: 'Barlow Condensed' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 11, fontFamily: 'Barlow Condensed' }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="water" stroke="#38bdf8" strokeWidth={2} fill="url(#waterGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sleep */}
          <div className="gym-card p-5">
            <h3 className="font-condensed font-bold text-sm tracking-widest text-[#6b7280] uppercase mb-4">Sleep (hours)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartLogs} barSize={18} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: '#4b5563', fontSize: 11, fontFamily: 'Barlow Condensed' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#4b5563', fontSize: 11, fontFamily: 'Barlow Condensed' }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="sleep" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
