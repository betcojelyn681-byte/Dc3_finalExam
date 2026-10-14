export const DAY = 86400000
export const dateKey = (date) => {
  // Date-only ISO strings must be parsed as local calendar dates, not UTC timestamps.
  const input = typeof date === 'string' ? date.trim() : ''
  let d
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split('-').map(Number)
    d = new Date(year, month - 1, day, 12)
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return ''
  } else {
    d = date instanceof Date ? new Date(date.getTime()) : new Date(date)
  }
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const parseDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value))
  if (!match) return new Date(Number.NaN)
  const [, year, month, day] = match.map(Number)
  const date = new Date(year, month - 1, day, 12)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return new Date(Number.NaN)
  return date
}
export const addDays = (value, amount) => {
  const d = typeof value === 'string' ? parseDate(value) : new Date(value)
  d.setDate(d.getDate() + amount)
  return d
}
export const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / DAY)
export const periodDuration = (start, end) => Math.max(1, daysBetween(start, end) + 1)
export const prettyDate = (value, options = { month: 'short', day: 'numeric' }) =>
  parseDate(value).toLocaleDateString(undefined, options)
export const monthLabel = (date) => date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
export const getCycleDay = (lastStart, today = dateKey(new Date()), length = 28) => {
  if (!lastStart) return null
  const diff = daysBetween(lastStart, today)
  return ((diff % length) + length) % length + 1
}
export const predictNextPeriod = (starts, cycleLength = 28) => {
  if (!starts?.length) return null
  const sorted = [...new Set(starts)].sort()
  return dateKey(addDays(sorted[sorted.length - 1], cycleLength))
}
export const getPhase = (cycleDay, periodLength = 5, cycleLength = 28) => {
  if (!cycleDay) return { name: 'Not enough data', tone: 'neutral', description: 'Log your period start to begin estimating your cycle.' }
  if (cycleDay <= periodLength) return { name: 'Menstrual phase', tone: 'rose', description: 'Rest, hydrate, and check in with how you feel.' }
  if (cycleDay < Math.max(periodLength + 1, Math.round(cycleLength * 0.45))) return { name: 'Follicular phase', tone: 'peach', description: 'Energy and symptoms can vary from person to person.' }
  if (cycleDay >= Math.round(cycleLength * 0.45) && cycleDay <= Math.round(cycleLength * 0.58)) return { name: 'Around ovulation', tone: 'lavender', description: 'This is only a calendar estimate, not confirmation of ovulation.' }
  return { name: 'Luteal phase', tone: 'sage', description: 'Notice changes in mood, sleep, appetite, or energy.' }
}
export const makeMonthCells = (year, month) => {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= count; d++) cells.push(new Date(year, month, d, 12))
  while (cells.length % 7) cells.push(null)
  return cells
}
