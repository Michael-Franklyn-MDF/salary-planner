import { createContext, type Dispatch } from 'react'
import type { AppState } from '@/domain/types'
import type { AppAction } from './reducer'

export interface AppStateContextValue {
  state: AppState
  dispatch: Dispatch<AppAction>
}

export const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)
