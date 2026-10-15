import { describe, expect, it } from 'vitest'
import { daysInMonth, isValidDateString, lastDayOfMonth, today } from './dates'

describe('date helpers', () => {
  it('uses the local calendar date for today', () => {
    const localMorning = new Date(2026, 9, 8, 0, 30)
    expect(today(localMorning)).toBe('2026-10-08')
  })

  it('returns leap-year and regular February lengths', () => {
    expect(daysInMonth(2024, 2)).toBe(29)
    expect(daysInMonth(2025, 2)).toBe(28)
  })

  it('returns the final date in a month', () => {
    expect(lastDayOfMonth(2026, 2)).toBe('2026-02-28')
    expect(lastDayOfMonth(2024, 2)).toBe('2024-02-29')
  })

  it('validates strict calendar dates', () => {
    expect(isValidDateString('2026-10-08')).toBe(true)
    expect(isValidDateString('2025-02-30')).toBe(false)
    expect(isValidDateString('2026-2-8')).toBe(false)
    expect(isValidDateString('not-a-date')).toBe(false)
  })
})
