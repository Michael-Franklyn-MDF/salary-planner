import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppStateProvider } from '@/state/AppStateProvider'
import type { AppState } from '@/domain/types'
import { formatShortDate } from '@/lib/format'
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
  it('swaps the greeting once on a cold launch', async () => {
    vi.useFakeTimers()
    try {
      render(<AppStateProvider initialState={state}><HomeTab coldLaunch /></AppStateProvider>)

      expect(screen.getByText('Hello, Michael')).toBeInTheDocument()
      act(() => vi.advanceTimersByTime(250))
      expect(screen.getByText('Hola, Michael')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not swap the greeting on a warm return', () => {
    vi.useFakeTimers()
    try {
      render(<AppStateProvider initialState={state}><HomeTab coldLaunch={false} /></AppStateProvider>)

      act(() => vi.advanceTimersByTime(250))
      expect(screen.getByText('Hello, Michael')).toBeInTheDocument()
      expect(screen.queryByText('Hola, Michael')).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows left to spend in the positive colour state', () => {
    render(<AppStateProvider initialState={state}><HomeTab /></AppStateProvider>)
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByLabelText('Left to spend, KSh 65,000')).toBeInTheDocument()
    expect(screen.getByText('Left to spend')).toBeInTheDocument()
  })

  it('shows the overspent caption and bad colour state', () => {
    render(<AppStateProvider initialState={{ ...state, dailySpend: [{ ...state.dailySpend[0], amount: 80000 }] }}><HomeTab /></AppStateProvider>)
    expect(screen.getByText('Over by this month')).toBeInTheDocument()
    expect(screen.getByLabelText('Left to spend, KSh -10,000')).toHaveClass('text-bad')
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

  it('shows the next due item and opens its calendar date', () => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    const dueDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const onOpenCalendar = vi.fn()
    render(
      <AppStateProvider initialState={{ ...state, oneOffs: [{ id: 'o', name: 'Insurance', amount: 1200, date: dueDate, note: '' }] }}>
        <HomeTab onOpenCalendar={onOpenCalendar} />
      </AppStateProvider>,
    )
    expect(screen.getByRole('button', { name: /Insurance/ })).toHaveTextContent(formatShortDate(dueDate))
    fireEvent.click(screen.getByRole('button', { name: /Insurance/ }))
    expect(onOpenCalendar).toHaveBeenCalledWith(dueDate)
  })
})
