import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppStateProvider } from '@/state/AppStateProvider'
import type { AppState } from '@/domain/types'
import { HomeTab } from './HomeTab'

const state: AppState = {
  schemaVersion: 3,
  income: 100000,
  recurring: [{ id: 'r', name: 'Rent', amount: 30000, dayOfMonth: 1, note: '' }],
  oneOffs: [],
  debts: [],
  dailySpend: [{ id: 's', amount: 5000, category: 'cat-other', date: '2026-10-13', note: '' }],
  categories: [{ id: 'cat-other', name: 'Other' }],
}

describe('HomeTab', () => {
  it('shows left to spend in the positive colour state', () => {
    render(<AppStateProvider initialState={state}><HomeTab /></AppStateProvider>)
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByLabelText('Left to spend, KSh 65,000')).toBeInTheDocument()
    expect(screen.getByText('Left to spend')).toBeInTheDocument()
  })

  it('shows the overspent caption and bad colour state', () => {
    render(<AppStateProvider initialState={{ ...state, dailySpend: [{ ...state.dailySpend[0], amount: 80000 }] }}><HomeTab /></AppStateProvider>)
    expect(screen.getByText('Over by this month')).toBeInTheDocument()
    expect(screen.getByLabelText('Left to spend, KSh -10,000')).toHaveClass('text-[color:var(--bad)]')
  })

  it('shows after commitments and summary cards', () => {
    render(<AppStateProvider initialState={state}><HomeTab /></AppStateProvider>)
    expect(screen.getByText('After commitments')).toBeInTheDocument()
    expect(screen.getByText('KSh 70,000')).toBeInTheDocument()
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Recurring')).toBeInTheDocument()
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
    expect(screen.getByText('Debts')).toBeInTheDocument()
    expect(screen.getByText('Spent this month')).toBeInTheDocument()
  })
})
