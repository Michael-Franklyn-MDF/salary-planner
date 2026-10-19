import { useCallback, useEffect, useReducer, useState, type ReactNode } from 'react'
import type { AppState } from '@/domain/types'
import { loadState, saveState, type LoadResult, type StorageLike } from '@/storage/storage'
import { AppStateContext } from './AppStateContext'
import { appReducer } from './reducer'

interface AppStateProviderProps {
  children: ReactNode
  initialState?: AppState
  storage?: StorageLike
}

export function AppStateProvider({ children, initialState, storage }: AppStateProviderProps) {
  const [loadResult] = useState<LoadResult>(() =>
    initialState ? { ok: true, state: initialState } : loadState(storage),
  )

  if (!loadResult.ok) {
    return (
      <main className="mx-auto max-w-[480px] space-y-3 px-4 py-8" role="alert">
        <h1 className="text-[24px] font-semibold">Saved data could not be loaded</h1>
        <p>
          Salary Planner paused before changing your saved data. Check that storage is available,
          then reload the app. Your existing saved value has been left untouched.
        </p>
      </main>
    )
  }

  return (
    <LoadedAppStateProvider initialState={loadResult.state} storage={storage}>
      {children}
    </LoadedAppStateProvider>
  )
}

function LoadedAppStateProvider({
  children,
  initialState,
  storage,
}: {
  children: ReactNode
  initialState: AppState
  storage?: StorageLike
}) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const [saveError, setSaveError] = useState<string | null>(null)

  const saveCurrentState = useCallback(() => {
    const result = saveState(state, storage)
    setSaveError(result.ok ? null : result.error.message)
  }, [state, storage])

  useEffect(() => {
    saveCurrentState()
  }, [saveCurrentState])

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {saveError !== null && (
        <div
          className="mx-auto my-3 flex max-w-[480px] items-center justify-between gap-3 rounded-xl border border-[color:var(--bad)] bg-[color:var(--surface)] p-4 text-[15px]"
          role="alert"
        >
          <p>Your latest changes could not be saved on this device. They are still visible here.</p>
          <button className="shrink-0 rounded-lg px-3 text-[color:var(--accent)]" onClick={saveCurrentState} type="button">
            Retry
          </button>
        </div>
      )}
      {children}
    </AppStateContext.Provider>
  )
}
