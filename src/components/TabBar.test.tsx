import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MiniPlayer } from './MiniPlayer'
import { TabBar } from './TabBar'

describe('TabBar', () => {
  it('renders all tabs and reports the selected tab', () => {
    const onTabChange = vi.fn()
    render(<TabBar activeTab="spend" onTabChange={onTabChange} />)

    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(screen.getByRole('tab', { name: 'Spend' })).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(screen.getByRole('tab', { name: 'Calendar' }))
    expect(onTabChange).toHaveBeenCalledWith('calendar')
  })
})

describe('MiniPlayer', () => {
  it('shows the amount and opens Home when tapped', () => {
    const onOpenHome = vi.fn()
    render(<MiniPlayer amount={35000} onOpenHome={onOpenHome} />)

    const player = screen.getByRole('button', { name: 'Left to spend, KSh 35,000' })
    expect(player).toBeInTheDocument()
    fireEvent.click(player)
    expect(onOpenHome).toHaveBeenCalledOnce()
  })

  it('supports negative amounts', () => {
    render(<MiniPlayer amount={-1250.5} onOpenHome={vi.fn()} />)

    expect(screen.getByText('KSh -1,250.5')).toBeInTheDocument()
  })
})
