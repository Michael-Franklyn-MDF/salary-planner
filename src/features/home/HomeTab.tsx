import { calculateSummary } from '@/domain/calc'
import { today } from '@/domain/dates'
import { dueItemsForRange, type CalendarDueItem } from '@/domain/calendar'
import { formatMoney, formatShortDate } from '@/lib/format'
import { useAppState } from '@/state/useAppState'
import { Ring } from '@/components/Ring'
import { useColdLaunch, useReducedMotion } from '@/hooks/useColdLaunch'
import { useEffect, useState } from 'react'

export function HomeTab({ onOpenCalendar, coldLaunch }: HomeTabProps = {}) {
  const detectedColdLaunch = useColdLaunch()
  return <HomeTabContent coldLaunch={coldLaunch ?? detectedColdLaunch} onOpenCalendar={onOpenCalendar} />
}

interface HomeTabContentProps extends HomeTabProps {
  coldLaunch: boolean
}

function HomeTabContent({ onOpenCalendar, coldLaunch }: HomeTabContentProps) {
  const { state } = useAppState()
  const [year, month, day] = today().split('-').map(Number)
  const rangeEnd = new Date(year, month - 1, day + 14)
  const rangeEndString = `${rangeEnd.getFullYear()}-${String(rangeEnd.getMonth() + 1).padStart(2, '0')}-${String(rangeEnd.getDate()).padStart(2, '0')}`
  const upcoming = dueItemsForRange(state, today(), rangeEndString).slice(0, 3)
  return <HomeContent upcoming={upcoming} coldLaunch={coldLaunch} onOpenCalendar={onOpenCalendar} />
}

interface HomeTabProps {
  onOpenCalendar?: (date: string) => void
  coldLaunch?: boolean
}

function HomeContent({ onOpenCalendar, upcoming, coldLaunch }: HomeTabProps & { upcoming: Array<CalendarDueItem & { date: string }>; coldLaunch: boolean }) {
  const { state } = useAppState()
  const reducedMotion = useReducedMotion()
  const summary = calculateSummary(state, today())
  const overspent = summary.remainingToSpend < 0
  const shouldAnimate = coldLaunch && !reducedMotion
  const [animatedAmount, setAnimatedAmount] = useState(0)
  const displayedAmount = shouldAnimate ? animatedAmount : summary.remainingToSpend
  const progress = summary.remaining > 0 ? summary.remainingToSpend / summary.remaining : 0

  useEffect(() => {
    if (!shouldAnimate) return

    const start = performance.now()
    const duration = 800
    let frame = 0
    const animate = (now: number) => {
      const fraction = Math.min(1, (now - start) / duration)
      setAnimatedAmount(summary.remainingToSpend * fraction)
      if (fraction < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [shouldAnimate, summary.remainingToSpend])
  const summaryCards: Array<[string, number]> = [
    ['Income', summary.income],
    ['Recurring', summary.recurringTotal],
    ['Upcoming', summary.oneOffTotal],
    ['Debts', summary.debtTotal],
    ['Spent this month', summary.spentThisMonth],
  ]

  return (
    <main id="home-panel" role="tabpanel" aria-labelledby="home-tab" className="mx-auto max-w-[480px] space-y-6 px-4 pb-32 pt-8">
      <h1 className="text-large-title font-bold tracking-tight">Home</h1>
      <section className="rounded-2xl bg-surface p-6 text-center" aria-labelledby="left-to-spend-heading">
        <p id="left-to-spend-heading" className="text-subhead text-muted">{overspent ? 'Over by this month' : 'Left to spend'}</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <p
            aria-label={`Left to spend, ${formatMoney(summary.remainingToSpend)}`}
            className={`overflow-hidden text-hero font-semibold tabular-nums ${overspent ? 'text-bad' : 'text-good'}`}
          >
            {formatMoney(displayedAmount)}
          </p>
          <Ring progress={progress} animate={shouldAnimate} />
        </div>
        <p className="mt-2 text-footnote text-muted">after commitments and this month's spending</p>
      </section>
      <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-4">
        <span className="text-body">After commitments</span>
        <span className="text-headline font-semibold tabular-nums">{formatMoney(summary.remaining)}</span>
      </div>
      <section aria-labelledby="summary-heading" className="space-y-2">
        <h2 id="summary-heading" className="px-1 text-footnote font-medium uppercase tracking-wide text-muted">Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          {summaryCards.map(([label, amount], index) => (
            <div key={label} className={`rounded-xl bg-surface p-4 ${index === summaryCards.length - 1 ? 'col-span-2' : ''}`}>
              <p className="text-footnote text-muted">{label}</p>
              <p className="mt-1 text-headline font-semibold tabular-nums">{formatMoney(amount)}</p>
            </div>
          ))}
        </div>
      </section>
      <section aria-labelledby="coming-up-heading" className="space-y-2">
        <h2 id="coming-up-heading" className="px-1 text-footnote font-medium uppercase tracking-wide text-muted">Coming up</h2>
        <div className="overflow-hidden rounded-xl bg-surface">
          {upcoming.length === 0 ? (
            <p className="px-4 py-5 text-subhead text-muted">Nothing due in the next 14 days.</p>
          ) : upcoming.map((entry) => {
            const name = entry.item.name || 'Unnamed'
            return (
              <button key={`${entry.kind}-${entry.item.id}-${entry.date}`} type="button" className="flex min-h-16 w-full items-center justify-between border-b border-separator px-4 text-left last:border-b-0" onClick={() => onOpenCalendar?.(entry.date)}>
                <span>
                  <span className="block text-body">{name}</span>
                  <span className="block text-footnote text-muted">{formatShortDate(entry.date)}</span>
                </span>
                <span className="ml-4 shrink-0 tabular-nums">{formatMoney(entry.item.amount)}</span>
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )
}
