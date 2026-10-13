import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SpendTab } from './SpendTab'

describe('SpendTab', () => {
  it('blocks a second decimal point and a third decimal place', () => {
    render(<SpendTab />)

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: 'decimal point' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: 'decimal point' }))

    expect(screen.getByRole('status')).toHaveTextContent('KSh 1.23')
  })

  it('supports backspace and disables Add at zero', () => {
    render(<SpendTab />)

    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: 'Backspace' }))

    expect(screen.getByRole('status')).toHaveTextContent('KSh 4')
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
  })
})
