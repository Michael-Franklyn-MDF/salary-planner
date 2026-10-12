import { useReducer, type ReactNode } from 'react'
import { migrateState } from '@/domain/migrate'
import type { AppState } from '@/domain/types'
import { AppStateContext } from './AppStateContext'
import { appReducer } from './reducer'

interface AppStateProviderProps {
  children: ReactNode
  initialState?: AppState
}

export function AppStateProvider({ children, initialState }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState ?? migrateState(null))

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  )
}
