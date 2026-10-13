import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
    expect(screen.getByRole('button', { name: /Mo12/ })).toBeInTheDocument()
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
})
