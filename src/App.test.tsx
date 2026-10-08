import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('v2 app shell', () => {
  it('renders the starter application shell', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Get started' })).toBeInTheDocument()
  })
})
