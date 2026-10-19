import type { CSSProperties } from 'react'

interface RingProps {
  progress: number
  animate?: boolean
}

export function Ring({ progress, animate = false }: RingProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const targetOffset = circumference * (1 - clampedProgress)
  const style = {
    '--ring-target': `${targetOffset}`,
    '--ring-circumference': `${circumference}`,
  } as CSSProperties & { '--ring-target': string; '--ring-circumference': string }

  return (
    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 112 112" role="img" aria-label={`${Math.round(clampedProgress * 100)}% left to spend`}>
      <circle cx="56" cy="56" r={radius} fill="none" stroke="var(--separator)" strokeWidth="12" />
      <circle
        cx="56"
        cy="56"
        r={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={animate ? circumference : targetOffset}
        style={style}
        className={animate ? 'animate-ring-draw' : undefined}
      />
    </svg>
  )
}
