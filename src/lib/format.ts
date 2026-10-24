import { isValidDateString } from '@/domain/dates'

const shortDateFormatter = new Intl.DateTimeFormat('en-KE', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

const longDateFormatter = new Intl.DateTimeFormat('en-KE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

const monthYearFormatter = new Intl.DateTimeFormat('en-KE', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatMoney(amount: number): string {
  const normalizedAmount = amount === 0 ? 0 : amount
  return `KSh ${normalizedAmount.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`
}

function formatDateParts(value: string, formatter: Intl.DateTimeFormat) {
  if (!isValidDateString(value)) {
    throw new RangeError(`Invalid calendar date: ${value}`)
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(12, 0, 0, 0)

  const parts = formatter.formatToParts(date)
  const weekday = parts.find((part) => part.type === 'weekday')?.value
  const dayOfMonth = parts.find((part) => part.type === 'day')?.value
  const monthName = parts.find((part) => part.type === 'month')?.value
  if (!weekday || !dayOfMonth || !monthName) {
    throw new Error('Could not format calendar date')
  }

  return { weekday, dayOfMonth, monthName }
}

function formatDate(value: string, formatter: Intl.DateTimeFormat): string {
  const { weekday, dayOfMonth, monthName } = formatDateParts(value, formatter)
  return `${weekday} ${dayOfMonth} ${monthName}`
}

export function formatShortDate(value: string): string {
  return formatDate(value, shortDateFormatter)
}

export function formatLongDate(value: string): string {
  return formatDate(value, longDateFormatter)
}

export function formatShortWeekday(value: string): string {
  return formatDateParts(value, shortDateFormatter).weekday
}

export function formatMonthYear(value: string): string {
  if (!isValidDateString(value)) throw new RangeError(`Invalid calendar date: ${value}`)
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(12, 0, 0, 0)
  return monthYearFormatter.format(date)
}
