import { useMemo, useState } from 'react'
import { today } from '@/domain/dates'
import { dueItemsForDate } from '@/domain/calendar'
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
}

export function CalendarTab({ initialDate = today() }: CalendarTabProps) {
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
  const formatAmount = (amount: number) => `KSh ${amount.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`

  return (
    <main id="calendar-panel" role="tabpanel" aria-labelledby="calendar-tab" className="mx-auto max-w-[480px] space-y-6 px-4 pb-32 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-bold leading-[41px] tracking-tight">Calendar</h1>
        <div className="flex items-center gap-1">
          <button type="button" aria-pressed={monthView} className="min-h-11 rounded-lg px-3 text-[13px] text-[color:var(--accent)]" onClick={() => setMonthView((current) => !current)}>{monthView ? 'Week' : 'Month'}</button>
          <button type="button" aria-label="Previous week" className="min-h-11 rounded-lg px-3 text-[color:var(--accent)]" onClick={() => setSelectedDate(shiftDays(selectedDate, -7))}>‹</button>
          <button type="button" aria-label="Next week" className="min-h-11 rounded-lg px-3 text-[color:var(--accent)]" onClick={() => setSelectedDate(shiftDays(selectedDate, 7))}>›</button>
        </div>
      </div>
      {monthView ? (
        <section aria-label="Month grid" className="grid grid-cols-7 gap-1 rounded-2xl bg-[color:var(--surface)] p-2">
          {monthDays.map((date) => {
            const parsed = parseDate(date)
            const hasDue = dueItemsForDate(state, date).length > 0
            const hasSpent = state.dailySpend.some((item) => item.date === date)
            const selected = date === selectedDate
            return (
              <button key={date} type="button" aria-pressed={selected} className={`relative flex min-h-12 flex-col items-center justify-center rounded-xl text-[13px] ${selected ? 'bg-[color:var(--accent)] text-white' : ''}`} onClick={() => setSelectedDate(date)}>
                <span>{parsed.getDate()}</span>
                <span className="mt-1 flex h-1 gap-1">
                  {hasDue && <span className={`h-1 w-1 rounded-full ${selected ? 'bg-white' : 'bg-[color:var(--accent)]'}`} />}
                  {hasSpent && <span className={`h-1 w-1 rounded-full ${selected ? 'bg-white/70' : 'bg-[color:var(--text-muted)]'}`} />}
                </span>
              </button>
            )
          })}
        </section>
      ) : (
        <section aria-label="Week strip" className="grid grid-cols-7 gap-1 rounded-2xl bg-[color:var(--surface)] p-2">
          {days.map((date) => {
          const parsed = parseDate(date)
          const selected = date === selectedDate
          return (
            <button key={date} type="button" aria-pressed={selected} className={`flex min-h-16 flex-col items-center justify-center rounded-xl text-[13px] ${selected ? 'bg-[color:var(--accent)] text-white' : ''}`} onClick={() => setSelectedDate(date)}>
              <span>{parsed.toLocaleDateString('en-KE', { weekday: 'short' }).slice(0, 2)}</span>
              <span className="mt-1 text-[17px] font-semibold">{parsed.getDate()}</span>
            </button>
          )
          })}
        </section>
      )}
      <h2 className="text-[20px] font-semibold">{parseDate(selectedDate).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
      <section aria-labelledby="due-heading" className="space-y-2">
        <h2 id="due-heading" className="px-1 text-[13px] font-medium uppercase tracking-wide text-[color:var(--text-muted)]">Due</h2>
        <div className="overflow-hidden rounded-xl bg-[color:var(--surface)]">
          {dueItems.map((entry) => (
            <div key={`${entry.kind}-${entry.item.id}`} className="flex min-h-14 items-center justify-between border-b border-[color:var(--separator)] px-4 last:border-b-0">
              <span>{entry.item.name || 'Unnamed'}</span>
              <span className="tabular-nums">{formatAmount(entry.item.amount)}</span>
            </div>
          ))}
        </div>
      </section>
      <section aria-labelledby="spent-heading" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 id="spent-heading" className="text-[13px] font-medium uppercase tracking-wide text-[color:var(--text-muted)]">Spent</h2>
          <span className="text-[13px] text-[color:var(--text-muted)]">{formatAmount(spentItems.reduce((sum, item) => sum + item.amount, 0))}</span>
        </div>
        <div className="overflow-hidden rounded-xl bg-[color:var(--surface)]">
          {spentItems.map((item) => (
            <div key={item.id} className="flex min-h-14 items-center justify-between border-b border-[color:var(--separator)] px-4 last:border-b-0">
              <span>{state.categories.find((category) => category.id === item.category)?.name ?? 'Other'}</span>
              <span className="tabular-nums">{formatAmount(item.amount)}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
