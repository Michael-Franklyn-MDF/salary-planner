import { calculateSummary } from '@/domain/calc'
import { today } from '@/domain/dates'
import { dueItemsForRange, type CalendarDueItem } from '@/domain/calendar'
import { formatMoney, formatShortDate } from '@/lib/format'
import { useAppState } from '@/state/useAppState'
import { Ring } from '@/components/Ring'
import { useColdLaunch, useReducedMotion } from '@/hooks/useColdLaunch'
import { greetings } from '@/lib/greetings'
import { useEffect, useState } from 'react'

export function HomeTab({ onOpenSpend, onOpenCalendar, onOpenPlan, coldLaunch }: HomeTabProps = {}) {
  const detectedColdLaunch = useColdLaunch()
  return <HomeTabContent coldLaunch={coldLaunch ?? detectedColdLaunch} onOpenSpend={onOpenSpend} onOpenCalendar={onOpenCalendar} onOpenPlan={onOpenPlan} />
}

interface HomeTabContentProps extends HomeTabProps {
  coldLaunch: boolean
}

function HomeTabContent({ onOpenSpend, onOpenCalendar, onOpenPlan, coldLaunch }: HomeTabContentProps) {
  const { state } = useAppState()
  const [year, month, day] = today().split('-').map(Number)
  const rangeEnd = new Date(year, month - 1, day + 14)
  const rangeEndString = `${rangeEnd.getFullYear()}-${String(rangeEnd.getMonth() + 1).padStart(2, '0')}-${String(rangeEnd.getDate()).padStart(2, '0')}`
  const upcoming = dueItemsForRange(state, today(), rangeEndString).slice(0, 3)
  return <HomeContent upcoming={upcoming} coldLaunch={coldLaunch} onOpenSpend={onOpenSpend} onOpenCalendar={onOpenCalendar} onOpenPlan={onOpenPlan} />
}

interface HomeTabProps {
  onOpenSpend?: () => void
  onOpenCalendar?: (date: string) => void
  onOpenPlan?: () => void
  coldLaunch?: boolean
}

function HomeContent({ onOpenSpend, onOpenCalendar, onOpenPlan, upcoming, coldLaunch }: HomeTabProps & { upcoming: Array<CalendarDueItem & { date: string }>; coldLaunch: boolean }) {
  const { state } = useAppState()
  const reducedMotion = useReducedMotion()
  const summary = calculateSummary(state, today())
  const overspent = summary.remainingToSpend < 0
  const firstRun = summary.income === 0
    && state.recurring.length === 0
    && state.oneOffs.length === 0
    && state.debts.length === 0
    && state.dailySpend.length === 0
  const shouldAnimate = coldLaunch && !reducedMotion
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [animatedAmount, setAnimatedAmount] = useState(0)
  const displayedAmount = shouldAnimate ? animatedAmount : summary.remainingToSpend
  const progress = firstRun ? 0 : summary.remaining > 0 ? summary.remainingToSpend / summary.remaining : 0

  useEffect(() => {
    if (!coldLaunch) return
    const timeout = window.setTimeout(() => setGreetingIndex(1), reducedMotion ? 0 : 250)
    return () => window.clearTimeout(timeout)
  }, [coldLaunch, reducedMotion])

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
  return (
    <main id="home-panel" role="tabpanel" aria-labelledby="home-tab" className="mx-auto max-w-[480px] space-y-6 px-4 pb-32 pt-8">
      <h1 className="text-large-title font-bold tracking-tight">Home</h1>
      <p className="text-headline text-muted transition-opacity duration-250 motion-reduce:transition-none" key={greetings[greetingIndex].text}>
        {greetings[greetingIndex].text}
      </p>
      <section className="rounded-2xl bg-surface p-6 text-center" aria-labelledby="left-to-spend-heading">
        <p id="left-to-spend-heading" className="text-subhead text-muted">{overspent ? 'Over by this month' : 'Left to spend'}</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <p
            aria-label={`Left to spend, ${formatMoney(summary.remainingToSpend)}`}
            className={`overflow-hidden text-hero font-semibold tabular-nums ${firstRun ? 'text-foreground' : overspent ? 'text-bad' : 'text-good'}`}
          >
            {formatMoney(displayedAmount)}
          </p>
          <Ring progress={progress} animate={shouldAnimate} />
        </div>
        <p className="mt-2 text-footnote text-muted">after commitments and this month's spending</p>
      </section>
      <button type="button" className="min-h-12 w-full rounded-xl bg-accent font-semibold text-accent-foreground" onClick={onOpenSpend}>
        Add spend
      </button>
      {firstRun ? (
        <section className="rounded-2xl bg-surface p-6 text-center" aria-labelledby="first-run-heading">
          <h2 id="first-run-heading" className="text-title font-semibold">Start with your income</h2>
          <p className="mx-auto mt-2 max-w-xs text-subhead text-muted">Add your monthly take-home pay in Plan to get started.</p>
          <button type="button" className="mt-5 min-h-12 w-full rounded-xl bg-accent font-semibold text-accent-foreground" onClick={onOpenPlan}>
            Open Plan
          </button>
        </section>
      ) : (
        <>
      <section aria-labelledby="where-it-goes-heading" className="space-y-2">
        <h2 id="where-it-goes-heading" className="px-1 text-footnote font-medium text-muted">Where it goes</h2>
        <div className="overflow-hidden rounded-xl bg-surface">
          {([
            ['Income', summary.income],
            ['Recurring', -summary.recurringTotal],
            ['Upcoming', -summary.oneOffTotal],
            ['Debts', -summary.debtTotal],
            ['After commitments', summary.remaining],
            ['Spent this month', -summary.spentThisMonth],
            ['Left to spend', summary.remainingToSpend],
          ] as Array<[string, number]>).map(([label, amount]) => (
            <div key={label} className={`flex min-h-12 items-center justify-between border-b border-separator px-4 last:border-b-0 ${label === 'After commitments' || label === 'Left to spend' ? 'font-semibold' : ''}`}>
              <span>{label}</span>
              <span className="tabular-nums">{formatMoney(amount)}</span>
            </div>
          ))}
        </div>
      </section>
      <section aria-labelledby="coming-up-heading" className="space-y-2">
        <h2 id="coming-up-heading" className="px-1 text-footnote font-medium text-muted">Coming up</h2>
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
        </>
      )}
    </main>
  )
}
