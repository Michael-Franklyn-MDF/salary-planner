import type {
  AppState,
  Category,
  DailySpend,
  Debt,
  OneOffCost,
  RecurringExpense,
} from '@/domain/types'
import { migrateState } from '@/domain/migrate'

export type AppAction =
  | { type: 'addRecurring'; item: RecurringExpense }
  | { type: 'updateRecurring'; item: RecurringExpense }
  | { type: 'deleteRecurring'; id: string }
  | { type: 'addOneOff'; item: OneOffCost }
  | { type: 'updateOneOff'; item: OneOffCost }
  | { type: 'deleteOneOff'; id: string }
  | { type: 'addDebt'; item: Debt }
  | { type: 'updateDebt'; item: Debt }
  | { type: 'deleteDebt'; id: string }
  | { type: 'addDailySpend'; item: DailySpend }
  | { type: 'updateDailySpend'; item: DailySpend }
  | { type: 'deleteDailySpend'; id: string }
  | { type: 'addCategory'; item: Category }
  | { type: 'updateCategory'; item: Category }
  | { type: 'deleteCategory'; id: string }
  | { type: 'setIncome'; income: number }
  | { type: 'replaceAll'; state: AppState }
  | { type: 'clear' }

function replaceItem<T extends { id: string }>(items: T[], item: T): T[] {
  return items.map((current) => (current.id === item.id ? item : current))
}

function removeItem<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id)
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'addRecurring':
      return { ...state, recurring: [...state.recurring, action.item] }
    case 'updateRecurring':
      return { ...state, recurring: replaceItem(state.recurring, action.item) }
    case 'deleteRecurring':
      return { ...state, recurring: removeItem(state.recurring, action.id) }
    case 'addOneOff':
      return { ...state, oneOffs: [...state.oneOffs, action.item] }
    case 'updateOneOff':
      return { ...state, oneOffs: replaceItem(state.oneOffs, action.item) }
    case 'deleteOneOff':
      return { ...state, oneOffs: removeItem(state.oneOffs, action.id) }
    case 'addDebt':
      return { ...state, debts: [...state.debts, action.item] }
    case 'updateDebt':
      return { ...state, debts: replaceItem(state.debts, action.item) }
    case 'deleteDebt':
      return { ...state, debts: removeItem(state.debts, action.id) }
    case 'addDailySpend':
      return { ...state, dailySpend: [...state.dailySpend, action.item] }
    case 'updateDailySpend':
      return { ...state, dailySpend: replaceItem(state.dailySpend, action.item) }
    case 'deleteDailySpend':
      return { ...state, dailySpend: removeItem(state.dailySpend, action.id) }
    case 'addCategory':
      return { ...state, categories: [...state.categories, action.item] }
    case 'updateCategory':
      return { ...state, categories: replaceItem(state.categories, action.item) }
    case 'deleteCategory':
      return { ...state, categories: removeItem(state.categories, action.id) }
    case 'setIncome':
      return { ...state, income: action.income }
    case 'replaceAll':
      return action.state
    case 'clear':
      return migrateState(null)
  }
}
