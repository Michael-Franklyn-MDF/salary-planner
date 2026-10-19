import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AppState } from '@/domain/types'
import { AppStateProvider } from '@/state/AppStateProvider'
import { CalendarTab } from './CalendarTab'

const state: AppState = {
  schemaVersion: 3,
  income: 0,
  recurring: [{ id: 'r', name: 'Rent', amount: 30000, dayOfMonth: 13, note: '' }],
  oneOffs: [],
  debts: [],
  dailySpend: [{ id: 's', amount: 500, category: 'cat-other', date: '2026-10-13', note: '' }],
  categories: [{ id: 'cat-other', name: 'Other' }],
}

describe('CalendarTab', () => {
  it('starts on Monday and selects days in the week', () => {
    render(<AppStateProvider initialState={state}><CalendarTab initialDate="2026-10-13" /></AppStateProvider>)
    expect(screen.getByRole('button', { name: 'Mon 12 Oct' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /13/ })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: /14/ }))
    expect(screen.getByRole('button', { name: /14/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('navigates by whole weeks', () => {
    render(<AppStateProvider initialState={state}><CalendarTab initialDate="2026-10-13" /></AppStateProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(screen.getByRole('button', { name: /20/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows due and spent groups for the selected day', () => {
    render(<AppStateProvider initialState={state}><CalendarTab initialDate="2026-10-13" /></AppStateProvider>)
    expect(screen.getByRole('heading', { name: 'Tuesday 13 October' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Due' })).toBeInTheDocument()
    expect(screen.getByText('Rent')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Spent' })).toBeInTheDocument()
    expect(screen.getAllByText('KSh 500')).toHaveLength(2)
  })

  it('toggles to a month grid with markers', () => {
    render(<AppStateProvider initialState={state}><CalendarTab initialDate="2026-10-13" /></AppStateProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Month' }))
    expect(screen.getByRole('region', { name: 'Month grid' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /13/ })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: /14/ }))
    expect(screen.getByRole('button', { name: /14/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows empty states and links to Plan when there are no dated items', () => {
    const onOpenPlan = vi.fn()
    render(
      <AppStateProvider initialState={{ ...state, recurring: [], dailySpend: [] }}>
        <CalendarTab initialDate="2026-10-13" onOpenPlan={onOpenPlan} />
      </AppStateProvider>,
    )
    expect(screen.getByText('Nothing due')).toBeInTheDocument()
    expect(screen.getByText('No spending this day')).toBeInTheDocument()
    expect(screen.getByText('No dated items yet')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open Plan' }))
    expect(onOpenPlan).toHaveBeenCalledOnce()
  })
})
