import { describe, expect, it } from 'vitest'
import { dueItemsForDate, dueItemsForRange } from './calendar'
import type { AppState } from './types'

const baseState: AppState = {
  schemaVersion: 3,
  income: 0,
  recurring: [],
  oneOffs: [],
  debts: [],
  dailySpend: [],
  categories: [],
}

describe('calendar logic', () => {
  it('clamps day 31 to the final day of shorter months', () => {
    const state = {
      ...baseState,
      recurring: [{ id: 'r31', name: 'Rent', amount: 1, dayOfMonth: 31, note: '' }],
    }

    expect(dueItemsForDate(state, '2025-02-28')).toHaveLength(1)
    expect(dueItemsForDate(state, '2024-02-29')).toHaveLength(1)
    expect(dueItemsForDate(state, '2026-04-30')).toHaveLength(1)
    expect(dueItemsForDate(state, '2026-05-31')).toHaveLength(1)
  })

  it('supports the last day of every month', () => {
    const state = {
      ...baseState,
      recurring: [{ id: 'rlast', name: 'Last', amount: 1, dayOfMonth: 'last' as const, note: '' }],
    }

    expect(dueItemsForDate(state, '2026-02-28')).toHaveLength(1)
    expect(dueItemsForDate(state, '2026-03-31')).toHaveLength(1)
    expect(dueItemsForDate(state, '2026-04-30')).toHaveLength(1)
  })

  it('includes one-offs only on their exact date', () => {
    const state = {
      ...baseState,
      oneOffs: [{ id: 'o1', name: 'School', amount: 1, date: '2026-11-03', note: '' }],
    }

    expect(dueItemsForDate(state, '2026-11-03')[0]?.kind).toBe('oneOff')
    expect(dueItemsForDate(state, '2026-11-04')).toHaveLength(0)
  })

  it('stops debts after their end date', () => {
    const state = {
      ...baseState,
      debts: [{ id: 'd1', name: 'Loan', amount: 1, dayOfMonth: 15, endDate: '2026-12-15', note: '' }],
    }

    expect(dueItemsForDate(state, '2026-12-15')).toHaveLength(1)
    expect(dueItemsForDate(state, '2027-01-15')).toHaveLength(0)
  })

  it('ignores items without a date or monthly day', () => {
    const state = {
      ...baseState,
      recurring: [{ id: 'r1', name: 'No date', amount: 1, dayOfMonth: null, note: '' }],
      oneOffs: [{ id: 'o1', name: 'No date', amount: 1, date: null, note: '' }],
      debts: [{ id: 'd1', name: 'No date', amount: 1, dayOfMonth: null, endDate: null, note: '' }],
    }

    expect(dueItemsForDate(state, '2026-10-15')).toHaveLength(0)
  })

  it('returns range results in date order across month boundaries', () => {
    const state = {
      ...baseState,
      recurring: [{ id: 'r1', name: 'Rent', amount: 1, dayOfMonth: 1, note: '' }],
      oneOffs: [{ id: 'o1', name: 'Cost', amount: 1, date: '2026-11-03', note: '' }],
    }

    const result = dueItemsForRange(state, '2026-10-31', '2026-11-03')
    expect(result.map((entry) => entry.date)).toEqual(['2026-11-01', '2026-11-03'])
    expect(result.map((entry) => entry.item.name)).toEqual(['Rent', 'Cost'])
  })
})
