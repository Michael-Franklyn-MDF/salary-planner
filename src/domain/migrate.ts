import { isValidDateString } from './dates'
import type {
  AppState,
  Category,
  DailySpend,
  DayOfMonth,
  Debt,
  OneOffCost,
  RecurringExpense,
} from './types'

const CURRENT_SCHEMA_VERSION = 3

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food & Groceries' },
  { id: 'cat-transport', name: 'Transport' },
  { id: 'cat-bills', name: 'Bills & Utilities' },
  { id: 'cat-shopping', name: 'Shopping' },
  { id: 'cat-entertainment', name: 'Entertainment' },
  { id: 'cat-other', name: 'Other' },
]

export class UnsupportedSchemaError extends Error {
  constructor(version: unknown) {
    super(`Unsupported schema version: ${String(version)}`)
    this.name = 'UnsupportedSchemaError'
  }
}

function safeAmount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function id(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`
}

function safeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function parseDay(value: unknown): DayOfMonth | null {
  if (value === 'last') return 'last'
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 31) {
    return value
  }
  if (typeof value !== 'string') return null

  const text = value.trim().toLowerCase()
  if (text === 'last day' || text === 'end of month') return 'last'
  const match = /^(\d{1,2})(?:st|nd|rd|th)?$/.exec(text)
  if (!match) return null

  const day = Number(match[1])
  return day >= 1 && day <= 31 ? day : null
}

function parseDue(value: unknown): { dayOfMonth: DayOfMonth | null; note: string } {
  const due = safeText(value).trim()
  if (!due) return { dayOfMonth: null, note: '' }
  return { dayOfMonth: parseDay(due), note: parseDay(due) === null ? due : '' }
}

function normalizeRecurring(raw: unknown, index: number): RecurringExpense {
  const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const parsedDue = 'dayOfMonth' in item
    ? { dayOfMonth: parseDay(item.dayOfMonth), note: safeText(item.note) }
    : parseDue(item.due)

  return {
    id: safeText(item.id) || id('recurring', index),
    name: safeText(item.name),
    amount: safeAmount(item.amount),
    dayOfMonth: parsedDue.dayOfMonth,
    note: parsedDue.note,
  }
}

function normalizeOneOff(raw: unknown, index: number): OneOffCost {
  const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const legacyDue = safeText(item.due)
  const dateValue = item.date ?? legacyDue
  const date = isValidDateString(dateValue) ? dateValue : null
  const note = safeText(item.note) || (date ? '' : legacyDue)

  return {
    id: safeText(item.id) || id('one-off', index),
    name: safeText(item.name),
    amount: safeAmount(item.amount),
    date,
    note,
  }
}

function normalizeDebt(raw: unknown, index: number): Debt {
  const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const parsedDue = 'dayOfMonth' in item
    ? { dayOfMonth: parseDay(item.dayOfMonth), note: safeText(item.note) }
    : parseDue(item.due)

  return {
    id: safeText(item.id) || id('debt', index),
    name: safeText(item.name),
    amount: safeAmount(item.amount),
    dayOfMonth: parsedDue.dayOfMonth,
    endDate: isValidDateString(item.endDate) ? item.endDate : null,
    note: parsedDue.note,
  }
}

function normalizeDailySpend(raw: unknown, index: number): DailySpend {
  const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  return {
    id: safeText(item.id) || id('spend', index),
    amount: safeAmount(item.amount),
    category: safeText(item.category) || 'cat-other',
    date: isValidDateString(item.date) ? item.date : '1970-01-01',
    note: safeText(item.note),
  }
}

function normalizeCategories(raw: unknown): Category[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_CATEGORIES.map((category) => ({ ...category }))
  const categories = raw.map((value, index) => {
    const item = value && typeof value === 'object' ? value as Record<string, unknown> : {}
    return {
      id: safeText(item.id) || id('category', index),
      name: safeText(item.name).trim() || 'Unnamed',
    }
  })
  return categories.some((category) => category.id === 'cat-other')
    ? categories
    : [...categories, { ...DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1] }]
}

function defaultState(): AppState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    income: 0,
    recurring: [],
    oneOffs: [],
    debts: [],
    dailySpend: [],
    categories: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
  }
}

export function migrateState(raw: unknown): AppState {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const source = raw as Record<string, unknown>
    if (typeof source.schemaVersion === 'number' && source.schemaVersion > CURRENT_SCHEMA_VERSION) {
      throw new UnsupportedSchemaError(source.schemaVersion)
    }

    const recurringSource = Array.isArray(source.recurring) ? source.recurring : source.exp
    const oneOffSource = Array.isArray(source.oneOffs) ? source.oneOffs : source.oneoff
    const debtSource = Array.isArray(source.debts) ? source.debts : source.debt

    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      income: safeAmount(source.income),
      recurring: Array.isArray(recurringSource) ? recurringSource.map(normalizeRecurring) : [],
      oneOffs: Array.isArray(oneOffSource) ? oneOffSource.map(normalizeOneOff) : [],
      debts: Array.isArray(debtSource) ? debtSource.map(normalizeDebt) : [],
      dailySpend: Array.isArray(source.dailySpend)
        ? source.dailySpend.map(normalizeDailySpend)
        : [],
      categories: normalizeCategories(source.categories),
    }
  }

  return defaultState()
}
