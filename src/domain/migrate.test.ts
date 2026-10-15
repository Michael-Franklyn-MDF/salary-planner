import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES, UnsupportedSchemaError, migrateState } from './migrate'

describe('migrateState', () => {
  it('migrates v1 items without losing data', () => {
    const state = migrateState({
      income: 100000,
      exp: [{ name: 'Rent', amount: 30000, due: '5th' }],
      oneoff: [{ name: 'School', amount: 10000, due: '2026-11-03' }],
      debt: [{ name: 'Loan', amount: 20000, due: 'when Dad pays' }],
    })

    expect(state.schemaVersion).toBe(3)
    expect(state.recurring[0]).toMatchObject({ name: 'Rent', amount: 30000, dayOfMonth: 5, note: '' })
    expect(state.oneOffs[0]).toMatchObject({ name: 'School', amount: 10000, date: '2026-11-03', note: '' })
    expect(state.debts[0]).toMatchObject({ name: 'Loan', amount: 20000, dayOfMonth: null, note: 'when Dad pays' })
  })

  it('preserves v2 spending and categories', () => {
    const state = migrateState({
      schemaVersion: 2,
      dailySpend: [{ id: 'spend-1', amount: 250, category: 'cat-food', date: '2026-10-08', note: 'Lunch' }],
      categories: [{ id: 'cat-food', name: 'Food' }, { id: 'cat-other', name: 'Other' }],
    })

    expect(state.dailySpend[0]).toEqual({
      id: 'spend-1',
      amount: 250,
      category: 'cat-food',
      date: '2026-10-08',
      note: 'Lunch',
    })
    expect(state.categories).toEqual([
      { id: 'cat-food', name: 'Food' },
      { id: 'cat-other', name: 'Other' },
    ])
  })

  it('parses recurring due text and one-off dates', () => {
    const state = migrateState({
      exp: [
        { name: 'First', amount: 1, due: '5th' },
        { name: 'Last', amount: 1, due: 'end of month' },
      ],
      oneoff: [
        { name: 'Dated', amount: 1, due: '2026-11-03' },
        { name: 'Unclear', amount: 1, due: 'soon' },
      ],
    })

    expect(state.recurring.map((item) => [item.dayOfMonth, item.note])).toEqual([[5, ''], ['last', '']])
    expect(state.oneOffs.map((item) => [item.date, item.note])).toEqual([
      ['2026-11-03', ''],
      [null, 'soon'],
    ])
  })

  it('returns safe defaults for garbage input', () => {
    for (const input of [null, 'invalid', []]) {
      expect(migrateState(input)).toMatchObject({
        schemaVersion: 3,
        income: 0,
        recurring: [],
        oneOffs: [],
        debts: [],
      })
    }
    expect(migrateState(null).categories).toEqual(DEFAULT_CATEGORIES)
  })

  it('is idempotent', () => {
    const state = migrateState({ income: 100, exp: [{ name: 'Rent', amount: 10, due: '1st' }] })
    expect(migrateState(state)).toEqual(state)
  })

  it('rejects a future schema', () => {
    expect(() => migrateState({ schemaVersion: 4 })).toThrow(UnsupportedSchemaError)
  })
})
