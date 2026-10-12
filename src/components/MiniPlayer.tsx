import { ChevronRight } from 'lucide-react'

interface MiniPlayerProps {
  amount: number
  onOpenHome: () => void
}

function formatAmount(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`
}

export function MiniPlayer({ amount, onOpenHome }: MiniPlayerProps) {
  const amountLabel = formatAmount(amount)
  const amountColour = amount >= 0 ? 'var(--good)' : 'var(--bad)'

  return (
    <button
      type="button"
      aria-label={`Left to spend, ${amountLabel}`}
      className="fixed inset-x-0 bottom-[49px] z-40 flex h-[52px] items-center justify-between border-t border-[color:var(--separator)] bg-[color:var(--bar-bg)] px-4 text-left backdrop-blur-xl"
      onClick={onOpenHome}
    >
      <span className="text-[13px] leading-[18px] text-[color:var(--text-muted)]">Left to spend</span>
      <span className="flex items-center gap-1 text-[17px] font-semibold leading-[22px] tabular-nums" style={{ color: amountColour }}>
        {amountLabel}
        <ChevronRight size={18} aria-hidden />
      </span>
    </button>
  )
}
