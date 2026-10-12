import { describe, expect, it } from 'vitest'
import type { AppState } from '@/domain/types'
import { appReducer, type AppAction } from './reducer'

const initialState: AppState = {
  schemaVersion: 3,
  income: 100000,
  recurring: [
    { id: 'recurring-1', name: 'Rent', amount: 30000, dayOfMonth: 5, note: '' },
  ],
  oneOffs: [
    { id: 'one-off-1', name: 'School', amount: 10000, date: '2026-11-03', note: '' },
  ],
  debts: [
    { id: 'debt-1', name: 'Loan', amount: 20000, dayOfMonth: 'last', endDate: null, note: '' },
  ],
  dailySpend: [
    { id: 'spend-1', amount: 250, category: 'cat-food', date: '2026-10-08', note: 'Lunch' },
  ],
  categories: [
    { id: 'cat-food', name: 'Food' },
    { id: 'cat-other', name: 'Other' },
  ],
}

describe('appReducer', () => {
  it('adds items to every list', () => {
    const recurring = { id: 'recurring-2', name: 'Internet', amount: 2000, dayOfMonth: 10, note: '' }
    const oneOff = { id: 'one-off-2', name: 'Trip', amount: 5000, date: null, note: 'soon' }
    const debt = { id: 'debt-2', name: 'Credit', amount: 1000, dayOfMonth: null, endDate: null, note: '' }
    const spend = { id: 'spend-2', amount: 100, category: 'cat-other', date: '2026-10-09', note: '' }
    const category = { id: 'cat-bills', name: 'Bills' }

    const result = [
      { type: 'addRecurring', item: recurring },
      { type: 'addOneOff', item: oneOff },
      { type: 'addDebt', item: debt },
      { type: 'addDailySpend', item: spend },
      { type: 'addCategory', item: category },
    ].reduce((state, action) => appReducer(state, action as AppAction), initialState)

    expect(result.recurring).toContain(recurring)
    expect(result.oneOffs).toContain(oneOff)
    expect(result.debts).toContain(debt)
    expect(result.dailySpend).toContain(spend)
    expect(result.categories).toContain(category)
  })

  it('updates and deletes items in every list', () => {
    const updated = appReducer(initialState, {
      type: 'updateRecurring',
      item: { ...initialState.recurring[0], name: 'Updated rent' },
    })
    const removed = appReducer(updated, { type: 'deleteRecurring', id: 'recurring-1' })
    const oneOffUpdated = appReducer(removed, {
      type: 'updateOneOff',
      item: { ...initialState.oneOffs[0], name: 'Updated school' },
    })
    const oneOffRemoved = appReducer(oneOffUpdated, { type: 'deleteOneOff', id: 'one-off-1' })
    const debtUpdated = appReducer(oneOffRemoved, {
      type: 'updateDebt',
      item: { ...initialState.debts[0], amount: 25000 },
    })
    const debtRemoved = appReducer(debtUpdated, { type: 'deleteDebt', id: 'debt-1' })
    const spendUpdated = appReducer(debtRemoved, {
      type: 'updateDailySpend',
      item: { ...initialState.dailySpend[0], amount: 300 },
    })
    const spendRemoved = appReducer(spendUpdated, { type: 'deleteDailySpend', id: 'spend-1' })
    const categoryUpdated = appReducer(spendRemoved, {
      type: 'updateCategory',
      item: { ...initialState.categories[0], name: 'Meals' },
    })
    const categoryRemoved = appReducer(categoryUpdated, { type: 'deleteCategory', id: 'cat-food' })

    expect(categoryRemoved.recurring).toEqual([])
    expect(categoryRemoved.oneOffs).toEqual([])
    expect(categoryRemoved.debts).toEqual([])
    expect(categoryRemoved.dailySpend).toEqual([])
    expect(categoryRemoved.categories).toEqual([{ id: 'cat-other', name: 'Other' }])
  })

  it('sets income, replaces all state, and clears state', () => {
    const incomeChanged = appReducer(initialState, { type: 'setIncome', income: 120000 })
    const replacement = { ...initialState, income: 1 }
    const replaced = appReducer(incomeChanged, { type: 'replaceAll', state: replacement })
    const cleared = appReducer(replaced, { type: 'clear' })

    expect(incomeChanged.income).toBe(120000)
    expect(replaced).toBe(replacement)
    expect(cleared).toEqual({
      schemaVersion: 3,
      income: 0,
      recurring: [],
      oneOffs: [],
      debts: [],
      dailySpend: [],
      categories: [
        { id: 'cat-food', name: 'Food & Groceries' },
        { id: 'cat-transport', name: 'Transport' },
        { id: 'cat-bills', name: 'Bills & Utilities' },
        { id: 'cat-shopping', name: 'Shopping' },
        { id: 'cat-entertainment', name: 'Entertainment' },
        { id: 'cat-other', name: 'Other' },
      ],
    })
  })
})
