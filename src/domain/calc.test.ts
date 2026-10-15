import { describe, expect, it } from 'vitest'
import { calculateSummary } from './calc'
import type { AppState } from './types'

const emptyState: AppState = {
  schemaVersion: 3,
  income: 0,
  recurring: [],
  oneOffs: [],
  debts: [],
  dailySpend: [],
  categories: [],
}

describe('calculateSummary', () => {
  it('calculates commitments and current-month spending', () => {
    const summary = calculateSummary(
      {
        ...emptyState,
        income: 100000,
        recurring: [{ id: 'r1', name: 'Rent', amount: 30000, dayOfMonth: 1, note: '' }],
        oneOffs: [{ id: 'o1', name: 'Cost', amount: 10000, date: '2026-10-10', note: '' }],
        debts: [{ id: 'd1', name: 'Debt', amount: 20000, dayOfMonth: 15, endDate: null, note: '' }],
        dailySpend: [{ id: 's1', amount: 5000, category: 'cat-food', date: '2026-10-08', note: '' }],
      },
      '2026-10-08',
    )

    expect(summary).toMatchObject({
      recurringTotal: 30000,
      oneOffTotal: 10000,
      debtTotal: 20000,
      outflow: 60000,
      remaining: 40000,
      spentThisMonth: 5000,
      remainingToSpend: 35000,
    })
  })

  it('returns zeroes for an empty state', () => {
    expect(calculateSummary(emptyState, '2026-10-08')).toEqual({
      recurringTotal: 0,
      oneOffTotal: 0,
      debtTotal: 0,
      outflow: 0,
      income: 0,
      remaining: 0,
      spentThisMonth: 0,
      remainingToSpend: 0,
    })
  })

  it('only includes spending from the supplied current month', () => {
    const summary = calculateSummary(
      {
        ...emptyState,
        dailySpend: [
          { id: 'last', amount: 900, category: 'cat-food', date: '2026-09-30', note: '' },
          { id: 'today', amount: 100, category: 'cat-food', date: '2026-10-08', note: '' },
        ],
      },
      '2026-10-08',
    )

    expect(summary.spentThisMonth).toBe(100)
  })

  it('treats non-numeric amounts as zero', () => {
    const summary = calculateSummary(
      {
        ...emptyState,
        income: Number.NaN,
        recurring: [{ id: 'r1', name: 'Invalid', amount: Number.NaN, dayOfMonth: null, note: '' }],
      },
      '2026-10-08',
    )

    expect(summary.income).toBe(0)
    expect(summary.recurringTotal).toBe(0)
  })

  it('rounds money after summing floating-point inputs', () => {
    const summary = calculateSummary(
      {
        ...emptyState,
        recurring: [
          { id: 'r1', name: 'First', amount: 0.1, dayOfMonth: null, note: '' },
          { id: 'r2', name: 'Second', amount: 0.2, dayOfMonth: null, note: '' },
        ],
      },
      '2026-10-08',
    )

    expect(summary.recurringTotal).toBe(0.3)
  })

  it('keeps overspending negative', () => {
    const summary = calculateSummary(
      {
        ...emptyState,
        income: 100,
        dailySpend: [{ id: 's1', amount: 150, category: 'cat-food', date: '2026-10-08', note: '' }],
      },
      '2026-10-08',
    )

    expect(summary.remainingToSpend).toBe(-50)
  })
})
