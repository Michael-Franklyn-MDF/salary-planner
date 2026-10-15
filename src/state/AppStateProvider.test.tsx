import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppStateProvider } from './AppStateProvider'
import { useAppState } from './useAppState'

function StateProbe() {
  const { state, dispatch } = useAppState()

  return (
    <>
      <output data-testid="income">{state.income}</output>
      <button type="button" onClick={() => dispatch({ type: 'setIncome', income: 75000 })}>
        Set income
      </button>
    </>
  )
}

describe('AppStateProvider', () => {
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
})
