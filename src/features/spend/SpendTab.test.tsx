import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { today } from '@/domain/dates'
import { AppStateProvider } from '@/state/AppStateProvider'
import { useAppState } from '@/state/useAppState'
import type { AppState } from '@/domain/types'
import { SpendTab } from './SpendTab'

function StateProbe() {
  const { state } = useAppState()
  return <div data-testid="state">{JSON.stringify(state.dailySpend)}</div>
}

describe('SpendTab', () => {
  it('blocks a second decimal point and a third decimal place', () => {
    render(
      <AppStateProvider>
        <SpendTab />
      </AppStateProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: 'decimal point' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: 'decimal point' }))

    expect(screen.getByRole('status')).toHaveTextContent('KSh 1.23')
  })

  it('supports backspace and disables Add at zero', () => {
    render(
      <AppStateProvider>
        <SpendTab />
      </AppStateProvider>,
    )

    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: 'Backspace' }))

    expect(screen.getByRole('status')).toHaveTextContent('KSh 4')
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
  })

  it('adds an entry with its category, date, and optional note', () => {
    const initialState: AppState = {
      schemaVersion: 3,
      income: 0,
      recurring: [],
      oneOffs: [],
      debts: [],
      dailySpend: [],
      categories: [{ id: 'cat-food', name: 'Food' }, { id: 'cat-other', name: 'Other' }],
    }

    render(
      <AppStateProvider initialState={initialState}>
        <SpendTab />
        <StateProbe />
      </AppStateProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: '7' }))
    fireEvent.click(screen.getByRole('button', { name: 'Other' }))
    fireEvent.change(screen.getByLabelText('Spend date'), { target: { value: '2026-10-12' } })
    fireEvent.change(screen.getByLabelText('Note (optional)'), { target: { value: 'Coffee' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByTestId('state')).toHaveTextContent('"amount":7')
    expect(screen.getByTestId('state')).toHaveTextContent('"category":"cat-other"')
    expect(screen.getByTestId('state')).toHaveTextContent('"date":"2026-10-12"')
    expect(screen.getByTestId('state')).toHaveTextContent('"note":"Coffee"')
    expect(screen.getByRole('status')).toHaveTextContent('KSh 0')
  })

  it('defaults the date to today', () => {
    render(
      <AppStateProvider>
        <SpendTab />
      </AppStateProvider>,
    )

    expect(screen.getByLabelText('Spend date')).toHaveValue(today())
  })
})
