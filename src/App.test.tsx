import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('v2 app shell', () => {
  it('renders the Plan tab', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Plan' })).toBeInTheDocument()
    expect(screen.getByText('Monthly take-home')).toBeInTheDocument()
  })
})
