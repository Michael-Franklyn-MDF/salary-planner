import type { ReactNode } from 'react'

interface ListGroupProps {
  children: ReactNode
  className?: string
}

export function ListGroup({ children, className = '' }: ListGroupProps) {
  return <div className={`overflow-hidden rounded-xl bg-surface ${className}`}>{children}</div>
}
