import React, { useState, useEffect } from 'react'
import {
  ShoppingCart, Check, Zap, RefreshCw,
  ChevronDown, ChevronUp, ArrowLeft, Package
} from 'lucide-react'
import { aiApi }       from '../../api/aiApi'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const CAT_EMOJI = {
  protein: '🥩', meat: '🥩', poultry: '🍗', fish: '🐟', seafood: '🦐',
  dairy: '🥛', eggs: '🥚', vegetables: '🥦', veggies: '🥦', fruits: '🍎',
  grains: '🌾', cereals: '🌾', bread: '🍞', pasta: '🍝', rice: '🍚',
  legumes: '🫘', beans: '🫘', nuts: '🥜', seeds: '🌱', oils: '🫙',
  fats: '🫙', spices: '🧂', condiments: '🧴', beverages: '🥤',
  drinks: '🥤', snacks: '🍿', frozen: '🧊', canned: '🥫',
}
const getEmoji = (cat) => {
  const k = Object.keys(CAT_EMOJI).find((k) => cat?.toLowerCase().includes(k))
  return k ? CAT_EMOJI[k] : '🛒'
}

// ─── Parse backend response into groups ──────────────────────────
// Backend returns groceryList as raw LLM text OR structured object
// We handle both cases
function parseGroceryResponse(raw) {
  if (!raw) return []

  // Case 1: already structured { groups: [{ category, items[] }] }
  if (raw.groups && Array.isArray(raw.groups)) return raw.groups

  // Case 2: raw string — parse line by line
  if (typeof raw === 'string') {
    const lines   = raw.split('\n').map((l) => l.trim()).filter(Boolean)
    const groups  = []
    let current   = null

    for (const line of lines) {
      // Category header: "**Vegetables:**" or "## Vegetables" or "Vegetables:"
      if (/^(\*\*|##|###)?[A-Z][^:*\n]{1,30}(:|\*\*)?\s*$/.test(line) || line.endsWith(':')) {
        const cat = line.replace(/[*#:]/g, '').trim()
        if (cat.length > 1 && cat.length < 40) {
          current = { category: cat, items: [] }
          groups.push(current)
          continue
        }
      }
      // Item: "- item" or "* item" or "• item" or numbered "1. item"
      const itemMatch = line.match(/^[-*•\d.]\s*(.+)/)
      if (itemMatch && current) {
        const item = itemMatch[1].replace(/\*+/g, '').trim()
        if (item.length > 0) current.items.push(item)
      }
    }

    // Fallback: no structure detected — dump everything under "Items"
    if (groups.length === 0 || groups.every((g) => g.items.length === 0)) {
      return [{ category: 'Items', items: lines.filter((l) => l.length > 2) }]
    }
    return groups.filter((g) => g.items.length > 0)
  }

  return []
}

function CategoryGroup({ group, globalChecked, toggleItem }) {
  const [collapsed, setCollapsed] = useState(false)
  const doneCount = group.items.filter((_, i) =>
    globalChecked.has(`${group.category}_${i}`)
  ).length
  const allDone = doneCount === group.items.length

  return (
    <div className={`gym-card overflow-hidden transition-all ${allDone ? 'opacity-60' : ''}`}>
      <button onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left
          hover:bg-[#111] transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xl">{getEmoji(group.category)}</span>
          <div>
            <p className="font-condensed font-bold text-sm text-[#e5e5e5] capitalize">
              {group.category}
            </p>
            <p className="text-xs font-condensed text-[#4b5563]">
              {doneCount}/{group.items.length} items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div className="h-full bg-[#22c55e] rounded-full transition-all"
              style={{ width: `${group.items.length ? (doneCount / group.items.length) * 100 : 0}%` }} />
          </div>
          {allDone
            ? <Check size={15} className="text-[#22c55e]" />
            : collapsed
              ? <ChevronDown size={15} className="text-[#4b5563]" />
              : <ChevronUp size={15} className="text-[#4b5563]" />
          }
        </div>
      </button>

      {!collapsed && (
        <div className="border-t border-[#1a1a1a] divide-y divide-[#111]">
          {group.items.map((item, i) => {
            const key  = `${group.category}_${i}`
            const done = globalChecked.has(key)
            return (
              <button key={i} onClick={() => toggleItem(key)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left
                  hover:bg-[#111] transition-colors group">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0
                  border-2 transition-all
                  ${done ? 'bg-[#22c55e] border-[#22c55e]' : 'border-[#2a2a2a] group-hover:border-[#3a3a3a]'}`}>
                  {done && <Check size={11} className="text-black" strokeWidth={3} />}
                </div>
                <span className={`flex-1 text-sm font-condensed font-semibold transition-colors
                  ${done ? 'text-[#3a3a3a] line-through' : 'text-[#e5e5e5]'}`}>
                  {item}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function GroceryListPage() {
  const [loading, setLoading] = useState(false)
  const [groups, setGroups]   = useState([])
  const [checked, setChecked] = useState(new Set())
  const [filter, setFilter]   = useState('all')
  const location              = useLocation()
  const navigate              = useNavigate()
  const mealPlan              = location.state?.mealPlan

  useEffect(() => { if (mealPlan) fetchList() }, [])

  const fetchList = async () => {
    setLoading(true)
    setChecked(new Set())
    try {
      const { data } = await aiApi.generateGroceryList(mealPlan)
      // data.groceryList may be string or { groups: [] }
      const parsed = parseGroceryResponse(data.groceryList)
      if (!parsed.length) {
        toast.error('Could not parse grocery list. Try generating a new meal plan.')
      }
      setGroups(parsed)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate list')
    }
    setLoading(false)
  }

  const toggleItem = (key) => setChecked((prev) => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })

  const totalItems = groups.reduce((a, g) => a + g.items.length, 0)
  const doneItems  = checked.size
  const pct        = totalItems ? Math.round((doneItems / totalItems) * 100) : 0

  const filteredGroups = groups.map((g) => {
    if (filter === 'all') return g
    const items = g.items.filter((_, i) => {
      const done = checked.has(`${g.category}_${i}`)
      return filter === 'done' ? done : !done
    })
    return { ...g, items }
  }).filter((g) => g.items.length > 0)

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => navigate('/ai/planner')}
            className="text-[#4b5563] hover:text-[#f5c518] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <p className="section-eyebrow">AI Tools</p>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <h1 className="font-display text-4xl sm:text-5xl text-white">GROCERY LIST</h1>
          {mealPlan && (
            <button onClick={fetchList} disabled={loading} className="btn-ghost gap-2 text-sm">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Regenerate
            </button>
          )}
        </div>
        <p className="text-[#6b7280] text-sm font-condensed mt-1">
          Meal plan se auto-generate kiya gaya hai
        </p>
      </div>

      {/* No plan */}
      {!mealPlan && !loading && groups.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-5 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#111] border border-[#242424]
            flex items-center justify-center">
            <ShoppingCart size={36} className="text-[#2a2a2a]" />
          </div>
          <div>
            <p className="font-condensed font-bold text-[#6b7280] text-xl mb-1">
              Koi meal plan nahi mila
            </p>
            <p className="text-sm text-[#3a3a3a] font-condensed max-w-xs mx-auto">
              Pehle meal plan banao, phir grocery list auto-generate hogi
            </p>
          </div>
          <button onClick={() => navigate('/ai/planner')} className="btn-yellow">
            <Zap size={16} fill="black" /> Create Meal Plan
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="gym-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-8 h-8 rounded" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
                <div className="skeleton h-3 w-16 rounded" />
              </div>
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="skeleton w-5 h-5 rounded-md" />
                  <div className="skeleton h-3 flex-1 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {!loading && groups.length > 0 && (
        <>
          {/* Progress */}
          <div className="gym-card gym-card-glow p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-[#f5c518]" />
                <p className="font-condensed font-bold text-sm tracking-widest
                  text-[#6b7280] uppercase">Shopping Progress</p>
              </div>
              <p className="font-display text-2xl text-[#f5c518]">{pct}%</p>
            </div>
            <div className="progress-track h-3 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct === 100
                    ? '#22c55e'
                    : 'linear-gradient(90deg, #f5c518, #f97316)',
                }} />
            </div>
            <div className="flex items-center justify-between text-xs font-condensed text-[#4b5563]">
              <span>{doneItems} checked</span>
              <span>{totalItems - doneItems} remaining</span>
            </div>
            {pct === 100 && (
              <p className="text-center text-sm font-condensed font-bold text-[#22c55e]">
                ✅ All done! Time to cook 🔥
              </p>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-[#111] rounded-xl p-1 border border-[#1a1a1a]">
            {[
              { key: 'all',     label: `All (${totalItems})` },
              { key: 'pending', label: `Pending (${totalItems - doneItems})` },
              { key: 'done',    label: `Done (${doneItems})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`flex-1 py-2 rounded-lg text-xs font-condensed font-bold
                  tracking-wide transition-all
                  ${filter === key
                    ? 'bg-[#f5c518] text-black'
                    : 'text-[#4b5563] hover:text-[#e5e5e5]'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Groups */}
          <div className="space-y-2">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-10 text-[#4b5563] font-condensed">
                {filter === 'done' ? 'Nothing checked yet' : 'All items checked! ✅'}
              </div>
            ) : (
              filteredGroups.map((group) => (
                <CategoryGroup
                  key={group.category}
                  group={group}
                  globalChecked={checked}
                  toggleItem={toggleItem}
                />
              ))
            )}
          </div>

          {/* Quick actions */}
          <div className="flex gap-3 pb-6">
            <button onClick={() => setChecked(new Set())}
              className="btn-ghost flex-1 justify-center text-sm py-2.5">
              Uncheck All
            </button>
            <button onClick={() => {
              const all = new Set()
              groups.forEach((g) => g.items.forEach((_, i) => all.add(`${g.category}_${i}`)))
              setChecked(all)
            }} className="btn-outline flex-1 justify-center text-sm py-2.5">
              Check All
            </button>
          </div>
        </>
      )}
    </div>
  )
}
