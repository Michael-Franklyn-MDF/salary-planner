import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppStateProvider } from './AppStateProvider'
import { useAppState } from './useAppState'
import { PRE_MIGRATION_BACKUP_KEY, STORAGE_KEY } from '@/storage/storage'

function StateProbe() {
  const { state, dispatch } = useAppState()

  return (
    <>
      <output data-testid="income">{state.income}</output>
      <output data-testid="daily-spend-count">{state.dailySpend.length}</output>
      <button type="button" onClick={() => dispatch({ type: 'setIncome', income: 75000 })}>
        Set income
      </button>
      <button
        type="button"
        onClick={() => dispatch({
          type: 'addDailySpend',
          item: { id: 'spend-1', amount: 1250, category: 'cat-other', date: '2026-10-20', note: '' },
        })}
      >
        Add spend
      </button>
    </>
  )
}

describe('AppStateProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides state and dispatch to descendants', () => {
    render(
      <AppStateProvider>
        <StateProbe />
      </AppStateProvider>,
    )

    expect(screen.getByTestId('income')).toHaveTextContent('0')
    fireEvent.click(screen.getByRole('button', { name: 'Set income' }))
    expect(screen.getByTestId('income')).toHaveTextContent('75000')
  })

  it('loads stored v3 data before saving changes', () => {
    const stored = {
      schemaVersion: 3,
      income: 42000,
      recurring: [],
      oneOffs: [],
      debts: [],
      dailySpend: [],
      categories: [{ id: 'cat-other', name: 'Other' }],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))

    render(<AppStateProvider><StateProbe /></AppStateProvider>)

    expect(screen.getByTestId('income')).toHaveTextContent('42000')
    expect(localStorage.getItem(PRE_MIGRATION_BACKUP_KEY)).toBe(JSON.stringify(stored))
    fireEvent.click(screen.getByRole('button', { name: 'Set income' }))
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').income).toBe(75000)
  })

  it('loads and backs up v1 data before migration', () => {
    const raw = JSON.stringify({ income: 31000, exp: [], oneoff: [], debt: [] })
    localStorage.setItem(STORAGE_KEY, raw)

    render(<AppStateProvider><StateProbe /></AppStateProvider>)

    expect(screen.getByTestId('income')).toHaveTextContent('31000')
    expect(localStorage.getItem(PRE_MIGRATION_BACKUP_KEY)).toBe(raw)
  })

  it('shows a raw-data download and does not overwrite corrupt storage', () => {
    const raw = '{broken json'
    localStorage.setItem(STORAGE_KEY, raw)
    const createObjectURL = vi.fn(() => 'blob:raw-data')
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    render(<AppStateProvider><StateProbe /></AppStateProvider>)

    expect(screen.getByRole('heading', { name: /could not load your data/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /download raw data/i }))
    expect(createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw)
    click.mockRestore()
    vi.unstubAllGlobals()
  })

  it('saves an added item and restores it after remounting', async () => {
    const first = render(<AppStateProvider><StateProbe /></AppStateProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Add spend' }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').dailySpend).toHaveLength(1))
    first.unmount()

    render(<AppStateProvider><StateProbe /></AppStateProvider>)
    expect(screen.getByTestId('daily-spend-count')).toHaveTextContent('1')
  })

  it('shows a visible message when saving fails', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    render(<AppStateProvider><StateProbe /></AppStateProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Set income' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not save/i)
    setItem.mockRestore()
  })
})
