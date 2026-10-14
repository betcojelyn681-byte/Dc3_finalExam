import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { dateKey, addDays, daysBetween, predictNextPeriod, getCycleDay, getPhase } from '../utils/cycle.js'
import { isValidDateKey, validatePeriodRecord, validateLogRecord, validateProfile, sanitizeNotes, sanitizeLogNotes } from '../utils/validation.js'

const STORAGE_KEY = 'bloom-cycle-care-v1'
const today = dateKey(new Date())
const seed = {
  profile: { name: 'Friend', cycleLength: 28, periodLength: 5, reminders: true, reminderDays: 2, theme: 'light' },
  periods: [],
  logs: [],
  createdAt: today
}
function safeProfile(saved) {
  return validateProfile({ ...seed.profile, ...(saved && typeof saved === 'object' ? saved : {}) })
}
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(seed)
    const saved = JSON.parse(raw)
    return {
      profile: safeProfile(saved.profile),
      periods: Array.isArray(saved.periods)
        ? saved.periods.filter(validatePeriodRecord).map(p => ({ id: String(p.id), start: p.start, end: p.end, notes: sanitizeNotes(p.notes) })).sort((a, b) => a.start.localeCompare(b.start))
        : [],
      logs: Array.isArray(saved.logs) ? saved.logs.filter(validateLogRecord).map(l => ({
        id: String(l.id), date: l.date, mood: String(l.mood || 'Okay'), flow: String(l.flow || 'None'), energy: String(l.energy || 'Medium'),
        symptoms: Array.isArray(l.symptoms) ? l.symptoms.filter(s => typeof s === 'string').slice(0, 10) : [], notes: sanitizeLogNotes(l.notes)
      })).sort((a, b) => b.date.localeCompare(a.date)) : [],
      createdAt: typeof saved.createdAt === 'string' ? saved.createdAt : today
    }
  } catch {
    return structuredClone(seed)
  }
}
export const useCycleStore = defineStore('cycle', () => {
  const data = ref(loadData())
  const selectedDate = ref(today)
  const notice = ref('')
  watch(data, value => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)) } catch { /* browser storage may be unavailable */ }
  }, { deep: true })
  const periodStarts = computed(() => data.value.periods.map(p => p.start).sort())
  const nextPeriod = computed(() => predictNextPeriod(periodStarts.value, data.value.profile.cycleLength))
  const cycleDay = computed(() => periodStarts.value.length ? getCycleDay(periodStarts.value[periodStarts.value.length - 1], today, data.value.profile.cycleLength) : null)
  const phase = computed(() => getPhase(cycleDay.value, data.value.profile.periodLength, data.value.profile.cycleLength))
  const averageCycle = computed(() => {
    const starts = periodStarts.value
    if (starts.length < 2) return data.value.profile.cycleLength
    const intervals = starts.slice(1).map((d, i) => daysBetween(starts[i], d)).filter(n => n >= 15 && n <= 60)
    return intervals.length ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : data.value.profile.cycleLength
  })
  const latestLog = computed(() => data.value.logs.find(l => l.date === selectedDate.value))
  function showNotice(message) {
    notice.value = message
    window.setTimeout(() => { if (notice.value === message) notice.value = '' }, 3200)
  }
  function saveProfile(profile) {
    data.value.profile = safeProfile({ ...data.value.profile, ...profile })
    showNotice('Your preferences have been saved.')
  }
  function addPeriod(start, end, notes = '') {
    if (!isValidDateKey(start) || !isValidDateKey(end) || end < start) return { ok: false, message: 'Choose valid dates and make sure the end date is not before the start date.' }
    const overlap = data.value.periods.some(p => start <= p.end && end >= p.start)
    if (overlap) return { ok: false, message: 'These dates overlap an existing period record.' }
    data.value.periods.push({ id: globalThis.crypto?.randomUUID?.() || String(Date.now()) + Math.random(), start, end, notes: sanitizeNotes(notes) })
    data.value.periods.sort((a, b) => a.start.localeCompare(b.start))
    showNotice('Period record saved.')
    return { ok: true }
  }
  function updatePeriod(id, start, end, notes = '') {
    const old = data.value.periods.find(p => p.id === id)
    if (!old) return { ok: false, message: 'Record not found.' }
    if (!isValidDateKey(start) || !isValidDateKey(end) || end < start) return { ok: false, message: 'Choose valid dates and make sure the end date is not before the start date.' }
    const overlap = data.value.periods.some(p => p.id !== id && start <= p.end && end >= p.start)
    if (overlap) return { ok: false, message: 'These dates overlap another record.' }
    Object.assign(old, { start, end, notes: sanitizeNotes(notes) })
    data.value.periods.sort((a, b) => a.start.localeCompare(b.start))
    showNotice('Period record updated.')
    return { ok: true }
  }
  function deletePeriod(id) {
    data.value.periods = data.value.periods.filter(p => p.id !== id)
    showNotice('Period record removed.')
  }
  function saveLog(log) {
    const logDate = log && log.date !== undefined && log.date !== null ? log.date : selectedDate.value
    if (!log || !isValidDateKey(logDate)) {
      showNotice('Choose a valid date before saving your check-in.')
      return { ok: false, message: 'Choose a valid date before saving your check-in.' }
    }
    const entry = {
      id: log.id || (globalThis.crypto?.randomUUID?.() || String(Date.now()) + Math.random()),
      date: logDate,
      mood: log.mood || 'Okay',
      flow: log.flow || 'None',
      energy: log.energy || 'Medium',
      symptoms: Array.isArray(log.symptoms) ? log.symptoms.filter(s => typeof s === 'string').slice(0, 10) : [],
      notes: sanitizeLogNotes(log.notes)
    }
    const index = data.value.logs.findIndex(item => item.date === entry.date)
    if (index >= 0) data.value.logs[index] = { ...data.value.logs[index], ...entry, id: data.value.logs[index].id }
    else data.value.logs.push(entry)
    data.value.logs.sort((a, b) => b.date.localeCompare(a.date))
    selectedDate.value = entry.date
    showNotice('Daily check-in saved.')
    return { ok: true }
  }
  function deleteLog(id) {
    data.value.logs = data.value.logs.filter(l => l.id !== id)
    showNotice('Check-in deleted.')
  }
  function resetAll() {
    data.value = structuredClone(seed)
    selectedDate.value = today
    showNotice('Demo data has been reset.')
  }
  function isPeriodDate(date) {
    return data.value.periods.some(p => date >= p.start && date <= p.end)
  }
  function isPredictedDate(date) {
    if (!nextPeriod.value) return false
    const end = dateKey(addDays(nextPeriod.value, data.value.profile.periodLength - 1))
    return date >= nextPeriod.value && date <= end && !isPeriodDate(date)
  }
  function isEstimatedOvulation(date) {
    if (!nextPeriod.value) return false
    const ovulation = dateKey(addDays(nextPeriod.value, -14))
    return date === ovulation
  }
  function exportData() {
    return JSON.stringify(data.value, null, 2)
  }
  return {
    data, selectedDate, notice, periodStarts, nextPeriod, cycleDay, phase, averageCycle, latestLog,
    saveProfile, addPeriod, updatePeriod, deletePeriod, saveLog, deleteLog, resetAll,
    isPeriodDate, isPredictedDate, isEstimatedOvulation, exportData, showNotice
  }
})
