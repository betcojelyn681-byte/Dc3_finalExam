import { dateKey } from './cycle.js'

export const CYCLE_MIN = 15
export const CYCLE_MAX = 45
export const PERIOD_MIN = 1
export const PERIOD_MAX = 10
export const NOTES_MAX = 240
export const SYMPTOMS_MAX = 10
export const LOG_NOTES_MAX = 500
export const NAME_MAX = 40

export function clampCycle(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 28
  return Math.round(Math.min(CYCLE_MAX, Math.max(CYCLE_MIN, n)))
}

export function clampPeriod(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 5
  return Math.round(Math.min(PERIOD_MAX, Math.max(PERIOD_MIN, n)))
}

export function clampReminderDays(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 2
  return Math.round(Math.min(7, Math.max(1, n)))
}

export function validateDateRange(start, end) {
  if (!isValidDateKey(start) || !isValidDateKey(end)) return { ok: false, message: 'Choose valid start and end dates.' }
  if (end < start) return { ok: false, message: 'The end date cannot be before the start date.' }
  return { ok: true }
}

export function periodOverlaps(periods, start, end, excludeId = null) {
  return periods.some(p => p.id !== excludeId && start <= p.end && end >= p.start)
}

export function sanitizeNotes(value, max = NOTES_MAX) {
  return String(value || '').slice(0, max)
}

export function sanitizeLogNotes(value) {
  return String(value || '').slice(0, LOG_NOTES_MAX)
}

export function sanitizeName(value) {
  const trimmed = String(value || '').trim().slice(0, NAME_MAX)
  return trimmed || 'Friend'
}

export function validateProfile(profile) {
  return {
    name: sanitizeName(profile?.name),
    cycleLength: clampCycle(profile?.cycleLength),
    periodLength: clampPeriod(profile?.periodLength),
    reminders: typeof profile?.reminders === 'boolean' ? profile.reminders : true,
    reminderDays: clampReminderDays(profile?.reminderDays),
    theme: profile?.theme === 'dark' || profile?.theme === 'light' ? profile.theme : 'light'
  }
}

export function validatePeriodRecord(p) {
  if (!p || typeof p !== 'object' || !p.id) return false
  if (!isValidDateKey(p.start) || !isValidDateKey(p.end)) return false
  return p.start <= p.end
}

export function validateLogRecord(l) {
  return !!l && typeof l === 'object' && !!l.id && isValidDateKey(l.date)
}

export function isValidDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const d = new Date(year, month - 1, day, 12)
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
}

export function safeDateKey(date) {
  try {
    const key = dateKey(date)
    return key || null
  } catch {
    return null
  }
}

export default {
  clampCycle, clampPeriod, clampReminderDays,
  validateDateRange, periodOverlaps,
  sanitizeNotes, sanitizeLogNotes, sanitizeName,
  validateProfile, validatePeriodRecord, validateLogRecord,
  isValidDateKey, safeDateKey
}
