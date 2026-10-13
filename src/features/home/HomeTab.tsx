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
    </main>
  )
}
