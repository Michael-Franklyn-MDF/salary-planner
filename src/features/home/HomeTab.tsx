import { calculateSummary } from '@/domain/calc'
import { today } from '@/domain/dates'
import { dueItemsForRange, type CalendarDueItem } from '@/domain/calendar'
import { formatMoney, formatShortDate } from '@/lib/format'
import { useAppState } from '@/state/useAppState'

export function HomeTab({ onOpenCalendar }: HomeTabProps = {}) {
  const { state } = useAppState()
  const [year, month, day] = today().split('-').map(Number)
  const rangeEnd = new Date(year, month - 1, day + 14)
  const rangeEndString = `${rangeEnd.getFullYear()}-${String(rangeEnd.getMonth() + 1).padStart(2, '0')}-${String(rangeEnd.getDate()).padStart(2, '0')}`
  const upcoming = dueItemsForRange(state, today(), rangeEndString).slice(0, 3)
  return <HomeContent upcoming={upcoming} onOpenCalendar={onOpenCalendar} />
}

interface HomeTabProps {
  onOpenCalendar?: (date: string) => void
}

function HomeContent({ onOpenCalendar, upcoming }: HomeTabProps & { upcoming: Array<CalendarDueItem & { date: string }> }) {
  const { state } = useAppState()
  const summary = calculateSummary(state, today())
  const overspent = summary.remainingToSpend < 0
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
        <p
          aria-label={`Left to spend, ${formatMoney(summary.remainingToSpend)}`}
          className={`mt-2 overflow-hidden text-hero font-semibold tabular-nums ${overspent ? 'text-bad' : 'text-good'}`}
        >
          {formatMoney(summary.remainingToSpend)}
        </p>
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
