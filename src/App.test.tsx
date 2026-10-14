import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('v2 app shell', () => {
  it('opens on Home with the plan available from navigation', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Plan' })).toBeInTheDocument()
  })
})
