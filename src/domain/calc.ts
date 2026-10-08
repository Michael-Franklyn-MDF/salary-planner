import type { AppState } from './types'

export interface Summary {
  recurringTotal: number
  oneOffTotal: number
  debtTotal: number
  outflow: number
  income: number
  remaining: number
  spentThisMonth: number
  remainingToSpend: number
}

function amount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function sumAmounts(items: readonly { amount: unknown }[]): number {
  return roundMoney(items.reduce((total, item) => total + amount(item.amount), 0))
}

export function calculateSummary(state: AppState, today: string): Summary {
  const recurringTotal = sumAmounts(state.recurring)
  const oneOffTotal = sumAmounts(state.oneOffs)
  const debtTotal = sumAmounts(state.debts)
  const income = roundMoney(amount(state.income))
  const outflow = roundMoney(recurringTotal + oneOffTotal + debtTotal)
  const month = today.slice(0, 7)
  const spentThisMonth = roundMoney(
    state.dailySpend
      .filter((entry) => entry.date.startsWith(month))
      .reduce((total, entry) => total + amount(entry.amount), 0),
  )
  const remaining = roundMoney(income - outflow)

  return {
    recurringTotal,
    oneOffTotal,
    debtTotal,
    outflow,
    income,
    remaining,
    spentThisMonth,
    remainingToSpend: roundMoney(remaining - spentThisMonth),
  }
}
