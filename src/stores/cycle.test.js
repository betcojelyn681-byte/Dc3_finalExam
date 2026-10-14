import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import { dateKey, addDays } from '../utils/cycle'

const STORAGE_KEY = 'bloom-cycle-care-v1'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

async function importStore() {
  const mod = await import('./cycle')
  return mod.useCycleStore()
}

async function flush() {
  await nextTick()
  await nextTick()
}

describe('initial state', () => {
  it('starts with empty periods and logs', async () => {
    const store = await importStore()
    expect(store.data.periods).toEqual([])
    expect(store.data.logs).toEqual([])
    expect(store.averageCycle).toBe(28)
    expect(store.nextPeriod).toBeNull()
    expect(store.cycleDay).toBeNull()
  })

  it('seeds a sensible default profile', async () => {
    const store = await importStore()
    expect(store.data.profile.name).toBe('Friend')
    expect(store.data.profile.cycleLength).toBe(28)
    expect(store.data.profile.periodLength).toBe(5)
  })
})

describe('period CRUD', () => {
  it('creates a period and persists it', async () => {
    const store = await importStore()
    const result = store.addPeriod('2024-01-01', '2024-01-05', 'Started late')
    expect(result.ok).toBe(true)
    expect(store.data.periods).toHaveLength(1)
    expect(store.data.periods[0].start).toBe('2024-01-01')
    expect(store.data.periods[0].end).toBe('2024-01-05')
    expect(store.data.periods[0].notes).toBe('Started late')
    await flush()
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toContain('2024-01-01')
  })

  it('rejects missing dates', async () => {
    const store = await importStore()
    expect(store.addPeriod('', '2024-01-05').ok).toBe(false)
    expect(store.addPeriod('2024-01-01', '').ok).toBe(false)
  })

  it('rejects impossible calendar dates', async () => {
    const store = await importStore()
    expect(store.addPeriod('2024-02-31', '2024-03-05').ok).toBe(false)
    expect(store.addPeriod('2024-02-01', '2024-02-30').ok).toBe(false)
  })

  it('rejects end before start', async () => {
    const store = await importStore()
    const result = store.addPeriod('2024-01-10', '2024-01-05')
    expect(result.ok).toBe(false)
  })

  it('rejects overlapping periods', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    const result = store.addPeriod('2024-01-03', '2024-01-07')
    expect(result.ok).toBe(false)
    expect(store.data.periods).toHaveLength(1)
  })

  it('prevents duplicate period starts', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    const result = store.addPeriod('2024-01-01', '2024-01-03')
    expect(result.ok).toBe(false)
  })

  it('allows back-to-back periods', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    const result = store.addPeriod('2024-01-06', '2024-01-10')
    expect(result.ok).toBe(true)
    expect(store.data.periods).toHaveLength(2)
  })

  it('sorts periods chronologically on add', async () => {
    const store = await importStore()
    store.addPeriod('2024-03-01', '2024-03-05')
    store.addPeriod('2024-01-01', '2024-01-05')
    store.addPeriod('2024-02-01', '2024-02-05')
    expect(store.data.periods[0].start).toBe('2024-01-01')
    expect(store.data.periods[2].start).toBe('2024-03-01')
  })

  it('updates an existing period', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    const id = store.data.periods[0].id
    const result = store.updatePeriod(id, '2024-01-01', '2024-01-07', 'Extended')
    expect(result.ok).toBe(true)
    expect(store.data.periods[0].end).toBe('2024-01-07')
    expect(store.data.periods[0].notes).toBe('Extended')
  })

  it('rejects period not found', async () => {
    const store = await importStore()
    const result = store.updatePeriod('nonexistent', '2024-01-01', '2024-01-05')
    expect(result.ok).toBe(false)
  })

  it('deletes a period', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    const id = store.data.periods[0].id
    store.deletePeriod(id)
    expect(store.data.periods).toHaveLength(0)
  })

  it('persists after reload (simulated)', async () => {
    const store1 = await importStore()
    store1.addPeriod('2024-01-01', '2024-01-05')
    store1.saveLog({ date: '2024-01-03', mood: 'Good', symptoms: ['Cramps'] })
    await flush()
    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).toBeTruthy()
    const store2 = await importStore()
    expect(store2.data.periods).toHaveLength(1)
    expect(store2.data.periods[0].start).toBe('2024-01-01')
    expect(store2.data.logs).toHaveLength(1)
    expect(store2.data.logs[0].mood).toBe('Good')
  })
})

describe('daily log CRUD', () => {
  it('creates a log and preserves id on update', async () => {
    const store = await importStore()
    store.saveLog({ date: '2024-01-05', mood: 'Good', flow: 'Light', energy: 'High', symptoms: ['Headache'] })
    const originalId = store.data.logs[0].id
    expect(store.data.logs).toHaveLength(1)
    expect(store.data.logs[0].symptoms).toEqual(['Headache'])
    store.saveLog({ date: '2024-01-05', mood: 'Great', symptoms: ['Headache', 'Cramps'] })
    expect(store.data.logs).toHaveLength(1)
    expect(store.data.logs[0].id).toBe(originalId)
    expect(store.data.logs[0].mood).toBe('Great')
    expect(store.data.logs[0].symptoms).toEqual(['Headache', 'Cramps'])
  })

  it('does not create duplicate entries for the same date', async () => {
    const store = await importStore()
    store.saveLog({ date: '2024-01-05', mood: 'Good' })
    store.saveLog({ date: '2024-01-05', mood: 'Great' })
    expect(store.data.logs).toHaveLength(1)
  })

  it('deletes a log', async () => {
    const store = await importStore()
    store.saveLog({ date: '2024-01-05', mood: 'Good' })
    const id = store.data.logs[0].id
    store.deleteLog(id)
    expect(store.data.logs).toHaveLength(0)
  })

  it('defaults missing fields', async () => {
    const store = await importStore()
    store.saveLog({ date: '2024-01-05' })
    expect(store.data.logs[0].mood).toBe('Okay')
    expect(store.data.logs[0].flow).toBe('None')
    expect(store.data.logs[0].energy).toBe('Medium')
  })

  it('rejects invalid dates without creating a log', async () => {
    const store = await importStore()
    expect(store.saveLog({ date: '2024-02-31' }).ok).toBe(false)
    expect(store.data.logs).toHaveLength(0)
  })
})

describe('cycle calculations', () => {
  it('predicts next period after one period', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    expect(store.nextPeriod).toBe('2024-01-29')
  })

  it('predicts next period after one period with custom length', async () => {
    const store = await importStore()
    store.saveProfile({ cycleLength: 35 })
    store.addPeriod('2024-01-01', '2024-01-05')
    expect(store.nextPeriod).toBe('2024-02-05')
  })

  it('calculates average cycle from multiple starts', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    store.addPeriod('2024-01-29', '2024-02-02')
    store.addPeriod('2024-02-26', '2024-03-01')
    expect(store.averageCycle).toBe(28)
  })

  it('uses default cycle length when no history', async () => {
    const store = await importStore()
    expect(store.averageCycle).toBe(28)
    expect(store.nextPeriod).toBeNull()
  })

  it('updates predictions when cycle length changes', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    expect(store.nextPeriod).toBe('2024-01-29')
    store.saveProfile({ cycleLength: 35, periodLength: 4 })
    expect(store.nextPeriod).toBe('2024-02-05')
  })

  it('updates predictions after editing a period start', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    const id = store.data.periods[0].id
    store.updatePeriod(id, '2024-01-05', '2024-01-07')
    expect(store.nextPeriod).toBe('2024-02-02')
  })

  it('recalculates after deleting the latest period', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    store.addPeriod('2024-02-10', '2024-02-14')
    expect(store.nextPeriod).toBe('2024-03-09')
    store.deletePeriod(store.data.periods[1].id)
    expect(store.nextPeriod).toBe('2024-01-29')
  })

  it('predicts next period from the most recent start only', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    store.addPeriod('2024-03-01', '2024-03-05')
    expect(store.nextPeriod).toBe('2024-03-29')
  })

  it('determines phase correctly', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    const phase = store.phase
    expect(phase.name).toBeTruthy()
  })
})

describe('calendar date helpers', () => {
  it('detects period dates correctly', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    expect(store.isPeriodDate('2024-01-03')).toBe(true)
    expect(store.isPeriodDate('2024-01-06')).toBe(false)
  })

  it('detects predicted dates', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    expect(store.isPredictedDate('2024-01-29')).toBe(true)
    expect(store.isPredictedDate('2024-02-02')).toBe(true)
    expect(store.isPredictedDate('2024-02-03')).toBe(false)
  })

  it('detects estimated ovulation', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    const ovulation = dateKey(addDays('2024-01-29', -14))
    expect(store.isEstimatedOvulation(ovulation)).toBe(true)
  })
})

describe('settings persistence', () => {
  it('saves and reloads profile', async () => {
    const store1 = await importStore()
    store1.saveProfile({ name: 'Ada', cycleLength: 30, periodLength: 4, reminders: false, reminderDays: 3 })
    await flush()
    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).not.toBeNull()
    expect(stored).toContain('"name":"Ada"')
    expect(stored).toContain('"cycleLength":30')
    const store2 = await importStore()
    expect(store2.data.profile.name).toBe('Ada')
    expect(store2.data.profile.cycleLength).toBe(30)
    expect(store2.data.profile.reminders).toBe(false)
  })

  it('clamps invalid profile values on save', async () => {
    const store = await importStore()
    store.saveProfile({ cycleLength: 5, periodLength: 99 })
    expect(store.data.profile.cycleLength).toBe(15)
    expect(store.data.profile.periodLength).toBe(10)
  })

  it('clamps invalid values on load', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: { cycleLength: 5, periodLength: 99 } }))
    const store = await importStore()
    expect(store.data.profile.cycleLength).toBe(15)
    expect(store.data.profile.periodLength).toBe(10)
  })
})

describe('malformed data handling', () => {
  it('handles corrupt JSON gracefully', async () => {
    localStorage.setItem(STORAGE_KEY, '{ broken')
    const store = await importStore()
    expect(store.data.periods).toEqual([])
    expect(store.data.logs).toEqual([])
    expect(store.data.profile.name).toBe('Friend')
  })

  it('handles non-array periods on load', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ periods: 'not-an-array' }))
    const store = await importStore()
    expect(store.data.periods).toEqual([])
  })

  it('handles non-object profile on load', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: 'string' }))
    const store = await importStore()
    expect(store.data.profile.cycleLength).toBe(28)
  })

  it('filters invalid period records on load', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ periods: [
      { start: 'x', end: 'y' },
      { id: 'impossible', start: '2024-02-31', end: '2024-03-05' },
      { id: 'ok', start: '2024-01-01', end: '2024-01-05' }
    ] }))
    const store = await importStore()
    expect(store.data.periods).toHaveLength(1)
    expect(store.data.periods[0].id).toBe('ok')
  })
})

describe('resetAll', () => {
  it('wipes all data to seed state', async () => {
    const store = await importStore()
    store.addPeriod('2024-01-01', '2024-01-05')
    store.saveLog({ date: '2024-01-03', mood: 'Good' })
    store.resetAll()
    expect(store.data.periods).toEqual([])
    expect(store.data.logs).toEqual([])
    expect(store.data.profile.name).toBe('Friend')
    expect(store.data.profile.cycleLength).toBe(28)
  })
})
