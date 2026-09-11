export const clsx = (...classes) => classes.filter(Boolean).join(' ')

export const fmtNumber = (n, decimals = 0) =>
  Number(n || 0).toFixed(decimals)

export const pct = (val, goal) =>
  goal ? Math.min(Math.round((val / goal) * 100), 100) : 0

export const macroColor = (macro) => ({
  calories: '#f5c518',
  protein:  '#22c55e',
  carbs:    '#f97316',
  fats:     '#8b5cf6',
  water:    '#38bdf8',
  sleep:    '#a78bfa',
}[macro] || '#6b7280')
