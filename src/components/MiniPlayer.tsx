import { ChevronRight } from 'lucide-react'
import { formatMoney } from '@/lib/format'

interface MiniPlayerProps {
  amount: number
  onOpenHome: () => void
}

export function MiniPlayer({ amount, onOpenHome }: MiniPlayerProps) {
  const amountLabel = formatMoney(amount)
  const amountColour = amount >= 0 ? 'var(--good)' : 'var(--bad)'

  return (
    <button
      type="button"
      aria-label={`Left to spend, ${amountLabel}`}
      className="fixed inset-x-0 bottom-[calc(49px+env(safe-area-inset-bottom))] z-40 flex h-[52px] items-center justify-between border-t border-[color:var(--separator)] bg-[color:var(--bar-bg)] px-4 text-left backdrop-blur-xl"
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
