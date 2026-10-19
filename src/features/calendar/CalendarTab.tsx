import { useMemo, useState } from 'react'
import { today } from '@/domain/dates'
import { dueItemsForDate } from '@/domain/calendar'
import { formatLongDate, formatMoney, formatShortDate, formatShortWeekday } from '@/lib/format'
import { useAppState } from '@/state/useAppState'

function dateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfWeek(value: string): Date {
  const date = parseDate(value)
  const day = date.getDay()
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
  return date
}

function shiftDays(value: string, amount: number): string {
  const date = parseDate(value)
  date.setDate(date.getDate() + amount)
  return dateString(date)
}

interface CalendarTabProps {
  initialDate?: string
  onOpenPlan?: () => void
}

export function CalendarTab({ initialDate = today(), onOpenPlan }: CalendarTabProps) {
  const { state } = useAppState()
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [monthView, setMonthView] = useState(false)
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate])
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + index)
    return dateString(date)
  })
  const selected = parseDate(selectedDate)
  const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1)
  const monthGridStart = startOfWeek(dateString(monthStart))
  const monthDays = Array.from({ length: 42 }, (_, index) => shiftDays(dateString(monthGridStart), index))
  const dueItems = dueItemsForDate(state, selectedDate)
  const spentItems = state.dailySpend.filter((item) => item.date === selectedDate)
  const hasDatedItems = state.recurring.some((item) => item.dayOfMonth !== null)
    || state.debts.some((item) => item.dayOfMonth !== null)
    || state.oneOffs.some((item) => item.date !== null)
  const currentDate = today()

  return (
    <main id="calendar-panel" role="tabpanel" aria-labelledby="calendar-tab" className="mx-auto max-w-[480px] space-y-6 px-4 pb-32 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-large-title font-bold tracking-tight">Calendar</h1>
        <div className="flex items-center gap-1">
          <button type="button" aria-pressed={monthView} className="min-h-11 rounded-lg px-3 text-footnote text-accent" onClick={() => setMonthView((current) => !current)}>{monthView ? 'Week' : 'Month'}</button>
          <button type="button" aria-label="Previous week" className="min-h-11 rounded-lg px-3 text-accent" onClick={() => setSelectedDate(shiftDays(selectedDate, -7))}>‹</button>
          <button type="button" aria-label="Next week" className="min-h-11 rounded-lg px-3 text-accent" onClick={() => setSelectedDate(shiftDays(selectedDate, 7))}>›</button>
        </div>
      </div>
      {monthView ? (
        <section aria-label="Month grid" className="grid grid-cols-7 gap-1 rounded-2xl bg-surface p-2">
          {monthDays.map((date) => {
            const parsed = parseDate(date)
            const hasDue = dueItemsForDate(state, date).length > 0
            const hasSpent = state.dailySpend.some((item) => item.date === date)
            const selected = date === selectedDate
            return (
              <button key={date} type="button" aria-pressed={selected} aria-label={`${parsed.getDate()}${date === currentDate ? ', today' : ''}`} className={`relative flex min-h-12 flex-col items-center justify-center rounded-xl text-footnote ${date === currentDate && !selected ? 'ring-2 ring-accent ring-inset' : ''} ${selected ? 'bg-accent text-white' : ''}`} onClick={() => setSelectedDate(date)}>
                <span>{parsed.getDate()}</span>
                <span className="mt-1 flex h-1 gap-1">
                  {hasDue && <span className={`h-1 w-1 rounded-full ${selected ? 'bg-white' : 'bg-accent'}`} />}
                  {hasSpent && <span className={`h-1 w-1 rounded-full ${selected ? 'bg-white/70' : 'bg-muted'}`} />}
                </span>
              </button>
            )
          })}
        </section>
      ) : (
        <section aria-label="Week strip" className="grid grid-cols-7 gap-1 rounded-2xl bg-surface p-2">
          {days.map((date) => {
          const parsed = parseDate(date)
          const selected = date === selectedDate
          const hasDue = dueItemsForDate(state, date).length > 0
          const hasSpent = state.dailySpend.some((item) => item.date === date)
          const shortDate = formatShortDate(date)
          const weekday = formatShortWeekday(date)
          return (
            <button key={date} type="button" aria-pressed={selected} aria-label={`${shortDate}${date === currentDate ? ', today' : ''}`} className={`flex min-h-16 flex-col items-center justify-center rounded-xl text-footnote ${date === currentDate && !selected ? 'ring-2 ring-accent ring-inset' : ''} ${selected ? 'bg-accent text-white' : ''}`} onClick={() => setSelectedDate(date)}>
              <span>{weekday.slice(0, 2)}</span>
              <span className="mt-1 text-headline font-semibold">{parsed.getDate()}</span>
              <span className="mt-1 flex h-1 gap-1" aria-hidden="true">
                {hasDue && <span className={`h-1 w-1 rounded-full ${selected ? 'bg-white' : 'bg-accent'}`} />}
                {hasSpent && <span className={`h-1 w-1 rounded-full ${selected ? 'bg-white/70' : 'bg-muted'}`} />}
              </span>
            </button>
          )
          })}
        </section>
      )}
      <h2 className="text-section font-semibold">{formatLongDate(selectedDate)}</h2>
      <section aria-labelledby="due-heading" className="space-y-2">
        <h2 id="due-heading" className="px-1 text-footnote font-medium uppercase tracking-wide text-muted">Due</h2>
        <div className="overflow-hidden rounded-xl bg-surface">
          {dueItems.length === 0 ? (
            <p className="px-4 py-5 text-subhead text-muted">Nothing due</p>
          ) : dueItems.map((entry) => (
            <div key={`${entry.kind}-${entry.item.id}`} className="flex min-h-14 items-center justify-between border-b border-separator px-4 last:border-b-0">
              <span>{entry.item.name || 'Unnamed'}</span>
              <span className="tabular-nums">{formatMoney(entry.item.amount)}</span>
            </div>
          ))}
        </div>
      </section>
      {!hasDatedItems && (
        <section className="rounded-xl bg-surface p-4">
          <p className="text-headline font-semibold">No dated items yet</p>
          <p className="mt-1 text-subhead text-muted">Add dates to bills and costs in Plan to see them here.</p>
          <button type="button" className="mt-3 min-h-11 text-accent" onClick={onOpenPlan}>Open Plan</button>
        </section>
      )}
      <section aria-labelledby="spent-heading" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 id="spent-heading" className="text-footnote font-medium uppercase tracking-wide text-muted">Spent</h2>
          <span className="text-footnote text-muted">{formatMoney(spentItems.reduce((sum, item) => sum + item.amount, 0))}</span>
        </div>
        <div className="overflow-hidden rounded-xl bg-surface">
          {spentItems.length === 0 ? (
            <p className="px-4 py-5 text-subhead text-muted">No spending this day</p>
          ) : spentItems.map((item) => (
            <div key={item.id} className="flex min-h-14 items-center justify-between border-b border-separator px-4 last:border-b-0">
              <span>{state.categories.find((category) => category.id === item.category)?.name ?? 'Other'}</span>
              <span className="tabular-nums">{formatMoney(item.amount)}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
