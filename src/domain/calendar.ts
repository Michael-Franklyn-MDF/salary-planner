import { daysInMonth, isValidDateString } from './dates'
import type { AppState, Debt, OneOffCost, RecurringExpense } from './types'

export type DueItemKind = 'recurring' | 'oneOff' | 'debt'

export type CalendarDueItem =
  | { kind: 'recurring'; item: RecurringExpense }
  | { kind: 'oneOff'; item: OneOffCost }
  | { kind: 'debt'; item: Debt }

function dayForMonth(dayOfMonth: RecurringExpense['dayOfMonth'], year: number, month: number): number | null {
  if (dayOfMonth === null) return null
  return dayOfMonth === 'last' ? daysInMonth(year, month) : Math.min(dayOfMonth, daysInMonth(year, month))
}

function matchesMonthlyDay(
  dayOfMonth: RecurringExpense['dayOfMonth'],
  date: string,
): boolean {
  if (!isValidDateString(date)) return false
  const year = Number(date.slice(0, 4))
  const month = Number(date.slice(5, 7))
  const day = Number(date.slice(8, 10))
  return dayForMonth(dayOfMonth, year, month) === day
}

function matchesDueDate(item: CalendarDueItem, date: string): boolean {
  if (item.kind === 'oneOff') return item.item.date === date
  if (item.kind === 'debt' && item.item.endDate !== null && date > item.item.endDate) return false
  return matchesMonthlyDay(item.item.dayOfMonth, date)
}

function allDueItems(state: AppState): CalendarDueItem[] {
  return [
    ...state.recurring.map((item) => ({ kind: 'recurring' as const, item })),
    ...state.debts.map((item) => ({ kind: 'debt' as const, item })),
    ...state.oneOffs.map((item) => ({ kind: 'oneOff' as const, item })),
  ]
}

export function dueItemsForDate(state: AppState, date: string): CalendarDueItem[] {
  if (!isValidDateString(date)) return []
  return allDueItems(state).filter((dueItem) => matchesDueDate(dueItem, date))
}

function nextDate(date: string): string {
  const year = Number(date.slice(0, 4))
  const month = Number(date.slice(5, 7))
  const day = Number(date.slice(8, 10))
  const next = new Date(year, month - 1, day + 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
}

export function dueItemsForRange(
  state: AppState,
  from: string,
  to: string,
): Array<CalendarDueItem & { date: string }> {
  if (!isValidDateString(from) || !isValidDateString(to) || from > to) return []

  const results: Array<CalendarDueItem & { date: string }> = []
  let date = from
  while (date <= to) {
    for (const item of dueItemsForDate(state, date)) {
      results.push({ ...item, date })
    }
    date = nextDate(date)
  }
  return results
}
