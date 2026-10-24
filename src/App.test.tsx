import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('v2 app shell', () => {
  it('opens on Home with the plan available from navigation', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Plan' })).toBeInTheDocument()
  })

  it('keeps an unfinished Spend amount when switching tabs', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('tab', { name: 'Spend' }))
    fireEvent.click(screen.getByRole('button', { name: '7' }))
    expect(screen.getByRole('status')).toHaveTextContent('KSh 7')

    fireEvent.click(screen.getByRole('tab', { name: 'Home' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Spend' }))
    expect(screen.getByRole('status')).toHaveTextContent('KSh 7')
  })

  it('opens Plan from the Home first-run action', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Open Plan' }))
    expect(screen.getByRole('heading', { name: 'Plan' })).toBeInTheDocument()
  })

  it('opens settings and changes the appearance preference', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('salary-planner-prefs')).toBe('{"theme":"dark"}')
  })
})
