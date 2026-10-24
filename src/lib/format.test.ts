import { describe, expect, it } from 'vitest'
import { formatLongDate, formatMoney, formatMonthYear, formatShortDate, formatShortWeekday } from './format'

describe('formatMoney', () => {
  it('uses KSh, grouping separators, and up to two decimal places', () => {
    expect(formatMoney(1234)).toBe('KSh 1,234')
    expect(formatMoney(1234.5)).toBe('KSh 1,234.5')
    expect(formatMoney(1234.567)).toBe('KSh 1,234.57')
  })

  it('preserves negative values and displays zero without decimals', () => {
    expect(formatMoney(-1250.5)).toBe('KSh -1,250.5')
    expect(formatMoney(0)).toBe('KSh 0')
  })
})

describe('date formatters', () => {
  it('formats list dates with a short weekday and month', () => {
    expect(formatShortDate('2026-10-20')).toBe('Tue 20 Oct')
  })

  it('formats heading dates with a full weekday and month', () => {
    expect(formatLongDate('2026-10-20')).toBe('Tuesday 20 October')
  })

  it('formats a weekday label from the same parsed calendar date', () => {
    expect(formatShortWeekday('2026-10-20')).toBe('Tue')
  })

  it('formats month and year', () => {
    expect(formatMonthYear('2026-10-25')).toBe('October 2026')
  })

  it('handles leap day and the final day of a month', () => {
    expect(formatShortDate('2024-02-29')).toBe('Thu 29 Feb')
    expect(formatShortDate('2026-10-31')).toBe('Sat 31 Oct')
  })

  it('rejects invalid calendar dates', () => {
    expect(() => formatShortDate('2025-02-30')).toThrow(RangeError)
  })
})
