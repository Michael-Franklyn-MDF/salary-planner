import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react'
import { loadState, saveState, type LoadResult } from '@/storage/storage'
import type { AppState } from '@/domain/types'
import { AppStateContext } from './AppStateContext'
import { appReducer } from './reducer'

interface AppStateProviderProps {
  children: ReactNode
  initialState?: AppState
}

export function AppStateProvider({ children, initialState }: AppStateProviderProps) {
  const [loaded] = useState<LoadResult>(() => initialState
    ? { ok: true, state: initialState }
    : loadState())
  const [state, dispatch] = useReducer(appReducer, loaded.ok ? loaded.state : {
    schemaVersion: 3,
    income: 0,
    recurring: [],
    oneOffs: [],
    debts: [],
    dailySpend: [],
    categories: [{ id: 'cat-other', name: 'Other' }],
  })
  const [saveFailed, setSaveFailed] = useState(false)
  const initialLoadedState = useRef(loaded.ok ? loaded.state : null)

  useEffect(() => {
    if (!loaded.ok || state === initialLoadedState.current) return

    const result = saveState(state)
    setSaveFailed(!result.ok)
  }, [loaded.ok, state])

  if (!loaded.ok) {
    return <StorageErrorScreen raw={loaded.raw} />
  }

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
      {saveFailed && <p role="alert">Could not save your changes. Your device storage may be full.</p>}
    </AppStateContext.Provider>
  )
}

function StorageErrorScreen({ raw }: { raw: string | null }) {
  function downloadRawData() {
    const blob = new Blob([raw ?? ''], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'salary-planner-raw-data.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main role="alert">
      <h1>Could not load your data</h1>
      <p>Your saved data is unchanged. Download a copy before trying anything else.</p>
      <button type="button" onClick={downloadRawData}>Download raw data</button>
    </main>
  )
}
