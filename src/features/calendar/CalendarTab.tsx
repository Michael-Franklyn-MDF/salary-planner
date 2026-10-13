import { useMemo, useState } from 'react'
import { today } from '@/domain/dates'

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
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate])
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + index)
    return dateString(date)
  })

  return (
    <main id="calendar-panel" role="tabpanel" aria-labelledby="calendar-tab" className="mx-auto max-w-[480px] space-y-6 px-4 pb-32 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-bold leading-[41px] tracking-tight">Calendar</h1>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous week" className="min-h-11 rounded-lg px-3 text-[color:var(--accent)]" onClick={() => setSelectedDate(shiftDays(selectedDate, -7))}>‹</button>
          <button type="button" aria-label="Next week" className="min-h-11 rounded-lg px-3 text-[color:var(--accent)]" onClick={() => setSelectedDate(shiftDays(selectedDate, 7))}>›</button>
        </div>
      </div>
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
      <h2 className="text-[20px] font-semibold">{parseDate(selectedDate).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
    </main>
  )
}
