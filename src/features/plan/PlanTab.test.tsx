import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AppState } from '@/domain/types'
import { AppStateProvider } from '@/state/AppStateProvider'
import { PlanTab } from './PlanTab'

const state: AppState = {
  schemaVersion: 3,
  income: 100000,
  recurring: [
    { id: 'recurring-1', name: 'Rent', amount: 30000, dayOfMonth: null, note: '' },
  ],
  oneOffs: [],
  debts: [],
  dailySpend: [],
  categories: [{ id: 'cat-other', name: 'Other' }],
}

function renderPlan(initialState = state) {
  return render(
    <AppStateProvider initialState={initialState}>
      <PlanTab />
    </AppStateProvider>,
  )
}

describe('PlanTab', () => {
  it('shows grouped lists and a No date tag', () => {
    renderPlan()

    expect(screen.getByRole('heading', { name: 'Plan' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recurring expenses' })).toBeInTheDocument()
    expect(screen.getByText('No date')).toBeInTheDocument()
  })

  it('shows one-off dates in the shared short date format', () => {
    renderPlan({ ...state, oneOffs: [{ id: 'one-off-1', name: 'Insurance', amount: 1200, date: '2026-11-03', note: '' }] })

    expect(screen.getByRole('button', { name: /Insurance/ })).toHaveTextContent('Tue 3 Nov')
  })

  it('adds a recurring expense from the bottom sheet', () => {
    renderPlan({ ...state, recurring: [] })

    fireEvent.click(screen.getByRole('button', { name: 'Add recurring expense' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Internet' } })
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '2500' } })
    fireEvent.change(screen.getByLabelText('Day of month'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /^Add$/ }))

    expect(screen.getByText('Internet')).toBeInTheDocument()
    expect(screen.getByText('KSh 2,500')).toBeInTheDocument()
    expect(screen.getByText('Day 10')).toBeInTheDocument()
  })

  it('requires in-app confirmation before deleting an item', () => {
    renderPlan()

    fireEvent.click(screen.getByRole('button', { name: /Rent/ }))
    fireEvent.click(screen.getByRole('button', { name: /^Delete$/ }))
    expect(screen.getByRole('alertdialog', { name: 'Confirm deletion' })).toBeInTheDocument()

    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /^Delete$/ }))
    expect(screen.queryByText('Rent')).not.toBeInTheDocument()
  })

  it('requires in-app confirmation before clearing all data', () => {
    renderPlan()

    fireEvent.click(screen.getByRole('button', { name: 'Clear all data' }))
    expect(screen.getByRole('alertdialog', { name: 'Clear all data?' })).toBeInTheDocument()

    fireEvent.click(within(screen.getByRole('alertdialog', { name: 'Clear all data?' })).getByRole('button', { name: 'Clear all data' }))
    expect(screen.getByText('KSh 0')).toBeInTheDocument()
  })

  it('imports a backup and replaces the current state', async () => {
    renderPlan()
    const file = new File([JSON.stringify({ income: 2000 })], 'backup.json', { type: 'application/json' })

    fireEvent.change(screen.getByLabelText('Import backup'), { target: { files: [file] } })

    await waitFor(() => expect(screen.getByText('KSh 2,000')).toBeInTheDocument())
  })
})
