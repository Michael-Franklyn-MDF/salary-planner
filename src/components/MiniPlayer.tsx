import { ChevronRight } from 'lucide-react'
import { formatMoney } from '@/lib/format'

interface MiniPlayerProps {
  amount: number
  onOpenHome: () => void
  entering?: boolean
}

export function MiniPlayer({ amount, onOpenHome, entering = false }: MiniPlayerProps) {
  const amountLabel = formatMoney(amount)
  return (
    <div className="fixed inset-x-0 bottom-[calc(49px+env(safe-area-inset-bottom))] z-40">
      <button
        type="button"
        aria-label={`Left to spend, ${amountLabel}`}
        className={`mx-auto flex h-[52px] w-full max-w-[480px] items-center justify-between border-t border-separator bg-bar px-4 text-left backdrop-blur-xl ${entering ? 'animate-bar-enter' : ''}`}
        onClick={onOpenHome}
      >
        <span className="text-footnote text-muted">Left to spend</span>
        <span className={`flex items-center gap-1 text-headline font-semibold tabular-nums ${amount >= 0 ? 'text-accent' : 'text-bad'}`}>
          {amountLabel}
          <ChevronRight size={18} aria-hidden />
        </span>
      </button>
    </div>
  )
}
