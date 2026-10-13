import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CalendarTab } from './CalendarTab'

describe('CalendarTab', () => {
  it('starts on Monday and selects days in the week', () => {
    render(<CalendarTab initialDate="2026-10-13" />)
    expect(screen.getByRole('button', { name: /Mo/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /13/ })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: /14/ }))
    expect(screen.getByRole('button', { name: /14/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('navigates by whole weeks', () => {
    render(<CalendarTab initialDate="2026-10-13" />)
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(screen.getByRole('button', { name: /20/ })).toHaveAttribute('aria-pressed', 'true')
  })
})
