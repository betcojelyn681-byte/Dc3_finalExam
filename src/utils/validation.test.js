import {
  clampCycle,
  clampPeriod,
  clampReminderDays,
  validateDateRange,
  periodOverlaps,
  sanitizeNotes,
  sanitizeLogNotes,
  sanitizeName,
  validateProfile,
  validatePeriodRecord,
  validateLogRecord,
  isValidDateKey,
  safeDateKey
} from './validation'

describe('clampCycle', () => {
  it('clamps to minimum', () => {
    expect(clampCycle(5)).toBe(15)
  })

  it('clamps to maximum', () => {
    expect(clampCycle(100)).toBe(45)
  })

  it('passes valid value through', () => {
    expect(clampCycle(28)).toBe(28)
    expect(clampCycle(30)).toBe(30)
    expect(clampCycle(15)).toBe(15)
    expect(clampCycle(45)).toBe(45)
  })

  it('falls back to 28 for NaN', () => {
    expect(clampCycle('abc')).toBe(28)
  })
})

describe('clampPeriod', () => {
  it('clamps to minimum', () => {
    expect(clampPeriod(0)).toBe(1)
  })

  it('clamps to maximum', () => {
    expect(clampPeriod(20)).toBe(10)
  })

  it('passes valid value through', () => {
    expect(clampPeriod(5)).toBe(5)
  })

  it('falls back to 5 for NaN', () => {
    expect(clampPeriod(undefined)).toBe(5)
  })
})

describe('clampReminderDays', () => {
  it('clamps to minimum', () => {
    expect(clampReminderDays(0)).toBe(1)
  })

  it('clamps to maximum', () => {
    expect(clampReminderDays(99)).toBe(7)
  })

  it('falls back to 2 for NaN/undefined', () => {
    expect(clampReminderDays(undefined)).toBe(2)
    expect(clampReminderDays('abc')).toBe(2)
  })

  it('clamps 0 to minimum', () => {
    expect(clampReminderDays(0)).toBe(1)
    expect(clampReminderDays(null)).toBe(1)
  })
})

describe('validateDateRange', () => {
  it('accepts a valid range', () => {
    expect(validateDateRange('2024-01-01', '2024-01-05')).toEqual({ ok: true })
  })

  it('rejects missing start', () => {
    expect(validateDateRange('', '2024-01-05').ok).toBe(false)
  })

  it('rejects missing end', () => {
    expect(validateDateRange('2024-01-01', '').ok).toBe(false)
  })

  it('rejects end before start', () => {
    const result = validateDateRange('2024-01-05', '2024-01-01')
    expect(result.ok).toBe(false)
  })

  it('accepts same start and end (single day)', () => {
    expect(validateDateRange('2024-01-01', '2024-01-01')).toEqual({ ok: true })
  })

  it('rejects impossible calendar dates', () => {
    expect(validateDateRange('2024-02-31', '2024-03-05').ok).toBe(false)
    expect(validateDateRange('2024-02-01', '2024-02-30').ok).toBe(false)
  })
})

describe('periodOverlaps', () => {
  const periods = [
    { id: 'a', start: '2024-01-01', end: '2024-01-05' },
    { id: 'b', start: '2024-02-01', end: '2024-02-05' }
  ]

  it('detects a fully-contained overlap', () => {
    expect(periodOverlaps(periods, '2024-01-02', '2024-01-04')).toBe(true)
  })

  it('detects a partial overlap', () => {
    expect(periodOverlaps(periods, '2024-01-03', '2024-01-10')).toBe(true)
  })

  it('detects the same start date', () => {
    expect(periodOverlaps(periods, '2024-01-01', '2024-01-03')).toBe(true)
  })

  it('allows back-to-back dates', () => {
    expect(periodOverlaps(periods, '2024-01-06', '2024-01-10')).toBe(false)
  })

  it('allows non-overlapping dates', () => {
    expect(periodOverlaps(periods, '2024-01-10', '2024-01-15')).toBe(false)
  })

  it('excludes a record by id (for editing)', () => {
    expect(periodOverlaps(periods, '2024-01-01', '2024-01-05', 'a')).toBe(false)
  })

  it('detects an overlapping record that is not excluded', () => {
    expect(periodOverlaps(periods, '2024-01-01', '2024-01-05', 'b')).toBe(true)
  })
})

describe('sanitizeNotes', () => {
  it('truncates to max length', () => {
    expect(sanitizeNotes('x'.repeat(300), 240).length).toBe(240)
  })

  it('returns empty string for null/undefined', () => {
    expect(sanitizeNotes(null)).toBe('')
    expect(sanitizeNotes(undefined)).toBe('')
  })

  it('uses the default max of 240', () => {
    expect(sanitizeNotes('x'.repeat(300)).length).toBe(240)
  })
})

describe('sanitizeLogNotes', () => {
  it('truncates to 500', () => {
    expect(sanitizeLogNotes('x'.repeat(600)).length).toBe(500)
  })
})

describe('sanitizeName', () => {
  it('uses fallback for empty', () => {
    expect(sanitizeName('')).toBe('Friend')
    expect(sanitizeName('   ')).toBe('Friend')
  })

  it('truncates to 40 chars', () => {
    expect(sanitizeName('x'.repeat(50)).length).toBe(40)
  })

  it('trims whitespace', () => {
    expect(sanitizeName('  Alice  ')).toBe('Alice')
  })
})

describe('validateProfile', () => {
  it('fills defaults for empty input', () => {
    const p = validateProfile({})
    expect(p.cycleLength).toBe(28)
    expect(p.periodLength).toBe(5)
    expect(p.reminders).toBe(true)
    expect(p.reminderDays).toBe(2)
    expect(p.theme).toBe('light')
  })

  it('preserves valid values', () => {
    const p = validateProfile({ name: 'Ada', cycleLength: 30, periodLength: 4, reminders: false, reminderDays: 3, theme: 'dark' })
    expect(p.name).toBe('Ada')
    expect(p.cycleLength).toBe(30)
    expect(p.periodLength).toBe(4)
    expect(p.reminders).toBe(false)
    expect(p.reminderDays).toBe(3)
    expect(p.theme).toBe('dark')
  })

  it('clamps out-of-range values', () => {
    const p = validateProfile({ cycleLength: 100, periodLength: 0 })
    expect(p.cycleLength).toBe(45)
    expect(p.periodLength).toBe(1)
  })
})

describe('validatePeriodRecord', () => {
  it('accepts a valid record', () => {
    expect(validatePeriodRecord({ id: 'x', start: '2024-01-01', end: '2024-01-05' })).toBe(true)
  })

  it('rejects missing fields', () => {
    expect(validatePeriodRecord({ start: '2024-01-01', end: '2024-01-05' })).toBe(false)
    expect(validatePeriodRecord({ id: 'x', start: '2024-01-01' })).toBe(false)
  })

  it('rejects reversed dates', () => {
    expect(validatePeriodRecord({ id: 'x', start: '2024-01-10', end: '2024-01-05' })).toBe(false)
  })

  it('rejects non-object input', () => {
    expect(validatePeriodRecord(null)).toBe(false)
    expect(validatePeriodRecord('string')).toBe(false)
    expect(validatePeriodRecord(undefined)).toBe(false)
  })

  it('rejects malformed date strings', () => {
    expect(validatePeriodRecord({ id: 'x', start: 'not-a-date', end: '2024-01-05' })).toBe(false)
  })
})

describe('validateLogRecord', () => {
  it('accepts a valid log', () => {
    expect(validateLogRecord({ id: 'x', date: '2024-01-01', mood: 'Okay' })).toBe(true)
  })

  it('rejects missing id or date', () => {
    expect(validateLogRecord({ date: '2024-01-01' })).toBe(false)
    expect(validateLogRecord({ id: 'x' })).toBe(false)
  })

  it('rejects null/undefined', () => {
    expect(validateLogRecord(null)).toBe(false)
  })

  it('rejects malformed date', () => {
    expect(validateLogRecord({ id: 'x', date: '2024/01/01' })).toBe(false)
  })
})

describe('isValidDateKey', () => {
  it('accepts valid YYYY-MM-DD', () => {
    expect(isValidDateKey('2024-06-15')).toBe(true)
  })

  it('rejects invalid format', () => {
    expect(isValidDateKey('2024-6-15')).toBe(false)
    expect(isValidDateKey('06-15-2024')).toBe(false)
    expect(isValidDateKey(null)).toBe(false)
  })

  it('rejects impossible dates', () => {
    expect(isValidDateKey('2024-02-30')).toBe(false)
    expect(isValidDateKey('2024-13-01')).toBe(false)
  })

  it('rejects non-strings', () => {
    expect(isValidDateKey(20240115)).toBe(false)
    expect(isValidDateKey({})).toBe(false)
  })
})

describe('safeDateKey', () => {
  it('returns a date key for valid dates', () => {
    expect(safeDateKey(new Date(2024, 5, 15, 12))).toBe('2024-06-15')
  })

  it('returns null for invalid input', () => {
    expect(safeDateKey('not-a-date')).toBeNull()
  })
})
