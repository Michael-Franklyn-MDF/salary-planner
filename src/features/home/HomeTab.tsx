import { calculateSummary } from '@/domain/calc'
import { today } from '@/domain/dates'
import { dueItemsForRange, type CalendarDueItem } from '@/domain/calendar'
import { useAppState } from '@/state/useAppState'

function formatAmount(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`
}

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
      <h1 className="text-[34px] font-bold leading-[41px] tracking-tight">Home</h1>
      <section className="rounded-2xl bg-[color:var(--surface)] p-6 text-center" aria-labelledby="left-to-spend-heading">
        <p id="left-to-spend-heading" className="text-[15px] text-[color:var(--text-muted)]">{overspent ? 'Over by this month' : 'Left to spend'}</p>
        <p
          aria-label={`Left to spend, ${formatAmount(summary.remainingToSpend)}`}
          className={`mt-2 overflow-hidden text-[52px] font-semibold leading-[56px] tabular-nums ${overspent ? 'text-[color:var(--bad)]' : 'text-[color:var(--good)]'}`}
        >
          {formatAmount(summary.remainingToSpend)}
        </p>
        <p className="mt-2 text-[13px] text-[color:var(--text-muted)]">after commitments and this month's spending</p>
      </section>
      <div className="flex items-center justify-between rounded-xl bg-[color:var(--surface)] px-4 py-4">
        <span className="text-[17px]">After commitments</span>
        <span className="text-[17px] font-semibold tabular-nums">{formatAmount(summary.remaining)}</span>
      </div>
      <section aria-labelledby="summary-heading" className="space-y-2">
        <h2 id="summary-heading" className="px-1 text-[13px] font-medium uppercase tracking-wide text-[color:var(--text-muted)]">Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          {summaryCards.map(([label, amount], index) => (
            <div key={label} className={`rounded-xl bg-[color:var(--surface)] p-4 ${index === summaryCards.length - 1 ? 'col-span-2' : ''}`}>
              <p className="text-[13px] text-[color:var(--text-muted)]">{label}</p>
              <p className="mt-1 text-[17px] font-semibold tabular-nums">{formatAmount(amount)}</p>
            </div>
          ))}
        </div>
      </section>
      <section aria-labelledby="coming-up-heading" className="space-y-2">
        <h2 id="coming-up-heading" className="px-1 text-[13px] font-medium uppercase tracking-wide text-[color:var(--text-muted)]">Coming up</h2>
        <div className="overflow-hidden rounded-xl bg-[color:var(--surface)]">
          {upcoming.length === 0 ? (
            <p className="px-4 py-5 text-[15px] text-[color:var(--text-muted)]">Nothing due in the next 14 days.</p>
          ) : upcoming.map((entry) => {
            const name = entry.item.name || 'Unnamed'
            return (
              <button key={`${entry.kind}-${entry.item.id}-${entry.date}`} type="button" className="flex min-h-16 w-full items-center justify-between border-b border-[color:var(--separator)] px-4 text-left last:border-b-0" onClick={() => onOpenCalendar?.(entry.date)}>
                <span>
                  <span className="block text-[17px]">{name}</span>
                  <span className="block text-[13px] text-[color:var(--text-muted)]">{entry.date}</span>
                </span>
                <span className="ml-4 shrink-0 tabular-nums">{formatAmount(entry.item.amount)}</span>
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )
}
