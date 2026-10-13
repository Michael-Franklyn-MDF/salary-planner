import { calculateSummary } from '@/domain/calc'
import { today } from '@/domain/dates'
import { useAppState } from '@/state/useAppState'

function formatAmount(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`
}

export function HomeTab() {
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
          {summaryCards.map(([label, amount]) => (
            <div key={label} className="rounded-xl bg-[color:var(--surface)] p-4">
              <p className="text-[13px] text-[color:var(--text-muted)]">{label}</p>
              <p className="mt-1 text-[17px] font-semibold tabular-nums">{formatAmount(amount)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
