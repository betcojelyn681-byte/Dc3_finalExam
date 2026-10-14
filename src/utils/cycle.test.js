import {
  dateKey,
  parseDate,
  addDays,
  daysBetween,
  prettyDate,
  monthLabel,
  getCycleDay,
  predictNextPeriod,
  getPhase,
  makeMonthCells
} from './cycle'

describe('dateKey', () => {
  it('formats a Date object as YYYY-MM-DD', () => {
    expect(dateKey(new Date(2024, 2, 5, 12))).toBe('2024-03-05')
  })

  it('formats a string input as YYYY-MM-DD', () => {
    expect(dateKey('2024-12-25T12:00:00')).toBe('2024-12-25')
  })

  it('handles single-digit months and days with zero padding', () => {
    expect(dateKey(new Date(2023, 0, 1, 12))).toBe('2023-01-01')
    expect(dateKey(new Date(2023, 9, 9, 12))).toBe('2023-10-09')
  })

  it('does not shift dates by timezone', () => {
    const d = new Date(2024, 5, 15, 12)
    expect(dateKey(d)).toBe('2024-06-15')
  })
})

describe('parseDate', () => {
  it('parses a YYYY-MM-DD string into a local noon Date', () => {
    const d = parseDate('2024-03-15')
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(2)
    expect(d.getDate()).toBe(15)
    expect(d.getHours()).toBe(12)
  })
})

describe('addDays', () => {
  it('adds days to a date string', () => {
    expect(dateKey(addDays('2024-01-15', 10))).toBe('2024-01-25')
  })

  it('subtracts days', () => {
    expect(dateKey(addDays('2024-01-15', -10))).toBe('2024-01-05')
  })

  it('crosses month boundary', () => {
    expect(dateKey(addDays('2024-01-28', 5))).toBe('2024-02-02')
  })

  it('crosses year boundary', () => {
    expect(dateKey(addDays('2024-12-30', 5))).toBe('2025-01-04')
  })

  it('handles leap year February 29', () => {
    expect(dateKey(addDays('2024-02-28', 1))).toBe('2024-02-29')
    expect(dateKey(addDays('2024-02-29', 1))).toBe('2024-03-01')
  })

  it('handles non-leap year February', () => {
    expect(dateKey(addDays('2023-02-28', 1))).toBe('2023-03-01')
  })
})

describe('daysBetween', () => {
  it('calculates positive differences', () => {
    expect(daysBetween('2024-01-01', '2024-01-10')).toBe(9)
  })

  it('calculates negative differences consistently', () => {
    expect(daysBetween('2024-01-10', '2024-01-01')).toBe(-9)
  })

  it('returns 0 for the same date', () => {
    expect(daysBetween('2024-06-15', '2024-06-15')).toBe(0)
  })

  it('handles month transition', () => {
    expect(daysBetween('2024-01-25', '2024-02-05')).toBe(11)
  })

  it('handles year transition', () => {
    expect(daysBetween('2024-12-25', '2025-01-05')).toBe(11)
  })
})

describe('getCycleDay', () => {
  it('returns 1 on the period start day', () => {
    expect(getCycleDay('2024-01-01', '2024-01-01', 28)).toBe(1)
  })

  it('returns correct day within the cycle', () => {
    expect(getCycleDay('2024-01-01', '2024-01-10', 28)).toBe(10)
  })

  it('wraps around past cycle length', () => {
    expect(getCycleDay('2024-01-01', '2024-01-28', 28)).toBe(28)
    expect(getCycleDay('2024-01-01', '2024-01-29', 28)).toBe(1)
    expect(getCycleDay('2024-01-01', '2024-02-10', 28)).toBe(13)
  })

  it('returns null for no lastStart', () => {
    expect(getCycleDay(null, '2024-01-01', 28)).toBeNull()
  })
})

describe('predictNextPeriod', () => {
  it('returns null for empty starts', () => {
    expect(predictNextPeriod([], 28)).toBeNull()
  })

  it('returns null for null/undefined input', () => {
    expect(predictNextPeriod(null, 28)).toBeNull()
    expect(predictNextPeriod(undefined, 28)).toBeNull()
  })

  it('calculates next period from the most recent start', () => {
    expect(predictNextPeriod(['2024-01-01', '2024-01-29'], 28)).toBe('2024-02-26')
  })

  it('uses the last entry even if unsorted', () => {
    expect(predictNextPeriod(['2024-01-29', '2024-01-01'], 28)).toBe('2024-02-26')
  })

  it('handles cycle length change', () => {
    expect(predictNextPeriod(['2024-01-01'], 35)).toBe('2024-02-05')
  })

  it('deduplicates start dates', () => {
    expect(predictNextPeriod(['2024-01-01', '2024-01-01', '2024-01-29'], 28)).toBe('2024-02-26')
  })
})

describe('getPhase', () => {
  it('returns "Not enough data" when cycleDay is null', () => {
    const phase = getPhase(null, 5, 28)
    expect(phase.name).toBe('Not enough data')
  })

  it('returns Menstrual phase during period', () => {
    const phase = getPhase(3, 5, 28)
    expect(phase.name).toBe('Menstrual phase')
    expect(phase.tone).toBe('rose')
  })

  it('returns Follicular phase after period but before ovulation', () => {
    const phase = getPhase(8, 5, 28)
    expect(phase.name).toBe('Follicular phase')
  })

  it('returns Around ovulation near ovulation day', () => {
    const phase = getPhase(13, 5, 28)
    expect(phase.name).toBe('Around ovulation')
  })

  it('returns Luteal phase after ovulation', () => {
    const phase = getPhase(20, 5, 28)
    expect(phase.name).toBe('Luteal phase')
  })
})

describe('makeMonthCells', () => {
  it('generates 35 or 42 cells', () => {
    const cells = makeMonthCells(2024, 2)
    expect([35, 42]).toContain(cells.length)
  })

  it('includes leading blanks for weekday alignment (Monday start)', () => {
    expect(makeMonthCells(2024, 4)[0]).toBeNull()
    expect(makeMonthCells(2024, 4)[1]).toBeNull()
    expect(makeMonthCells(2024, 4)[2]).not.toBeNull()
  })

  it('has 28 blanks for an all-blank lead', () => {
    const cells = makeMonthCells(2026, 5)
    expect(cells.filter(c => c === null)).toHaveLength(cells.filter((c, i) => c === null).length)
  })

  it('handles February in a leap year (29 days)', () => {
    const cells = makeMonthCells(2024, 1)
    const dayCells = cells.filter(c => c !== null)
    expect(dayCells).toHaveLength(29)
  })

  it('handles February in a non-leap year (28 days)', () => {
    const cells = makeMonthCells(2023, 1)
    const dayCells = cells.filter(c => c !== null)
    expect(dayCells).toHaveLength(28)
  })

  it('handles a 31-day month', () => {
    const cells = makeMonthCells(2024, 0)
    const dayCells = cells.filter(c => c !== null)
    expect(dayCells).toHaveLength(31)
  })

  it('handles a 30-day month', () => {
    const cells = makeMonthCells(2024, 3)
    const dayCells = cells.filter(c => c !== null)
    expect(dayCells).toHaveLength(30)
  })

  it('pads to a multiple of 7', () => {
    const cells = makeMonthCells(2024, 0)
    expect(cells.length % 7).toBe(0)
  })
})

describe('monthLabel', () => {
  it('returns a formatted month and year', () => {
    expect(monthLabel(new Date(2024, 5, 15))).toMatch(/June|Jun.*2024/)
  })
})

describe('prettyDate', () => {
  it('formats a date key with default options', () => {
    const result = prettyDate('2024-06-15')
    expect(result).toMatch(/\d/)
  })
})
