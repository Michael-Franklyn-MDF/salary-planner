const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function today(now: Date = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function lastDayOfMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${daysInMonth(year, month)
    .toString()
    .padStart(2, '0')}`
}

export function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = DATE_PATTERN.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12) return false

  return day >= 1 && day <= daysInMonth(year, month)
}
