import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Keypad } from './Keypad'

describe('Keypad', () => {
  it('reports digits, one decimal point, and backspace', () => {
    const onKeyPress = vi.fn()
    render(<Keypad onKeyPress={onKeyPress} />)

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: 'decimal point' }))
    fireEvent.click(screen.getByRole('button', { name: 'Backspace' }))

    expect(onKeyPress.mock.calls).toEqual([['1'], ['.'], ['backspace']])
  })
})
