export type Id = string

export type DayOfMonth = number | 'last'

export interface RecurringExpense {
  id: Id
  name: string
  amount: number
  dayOfMonth: DayOfMonth | null
  note: string
}

export interface OneOffCost {
  id: Id
  name: string
  amount: number
  date: string | null
  note: string
}

export interface Debt {
  id: Id
  name: string
  amount: number
  dayOfMonth: DayOfMonth | null
  endDate: string | null
  note: string
}

export interface Category {
  id: Id
  name: string
}

export interface DailySpend {
  id: Id
  amount: number
  category: Id
  date: string
  note: string
}

export type PaidOccurrenceKind = 'recurring' | 'oneOff' | 'debt'

export interface PaidOccurrence {
  kind: PaidOccurrenceKind
  itemId: Id
  date: string
}

export interface AppState {
  schemaVersion: number
  income: number
  recurring: RecurringExpense[]
  oneOffs: OneOffCost[]
  debts: Debt[]
  dailySpend: DailySpend[]
  categories: Category[]
  paidOccurrences?: PaidOccurrence[]
}
