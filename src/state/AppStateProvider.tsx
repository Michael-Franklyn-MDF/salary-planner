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
    schemaVersion: 4,
    income: 0,
    recurring: [],
    oneOffs: [],
    debts: [],
    dailySpend: [],
    categories: [{ id: 'cat-other', name: 'Other' }],
    paidOccurrences: [],
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
    <AppStateContext.Provider value={{ state, dispatch, saveFailed, retrySave: () => setSaveFailed(!saveState(state).ok) }}>
      {children}
      {saveFailed && <div className="ob-notice" role="alert"><div><strong>Could not save your changes.</strong><p>Your draft is still in this session. Free device storage and retry before closing Obol.</p></div><button onClick={() => setSaveFailed(!saveState(state).ok)}>Retry save</button></div>}
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
    <main className="ob-app ob-page" role="alert">
      <p className="ob-eyebrow">DATA RECOVERY</p><h1>We can’t open your data</h1><h2>Could not load your data</h2>
      <p>Your saved data is unchanged. Download a copy before trying anything else. Do not treat an unavailable balance as KES 0.</p>
      <button className="ob-action secondary" type="button" onClick={downloadRawData}>Download raw data</button>
    <button className="ob-action" onClick={() => window.location.reload()}>Retry opening data</button><p>Avoid clearing app storage while you troubleshoot. Keep a copy of the raw data.</p></main>
  )
}
