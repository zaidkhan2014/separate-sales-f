import { formatISO } from 'date-fns'

const DEFAULT_RANGE_DAYS = 7

export function toUtcIso(value: string) {
  if (!value) {
    return undefined
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }
  return date.toISOString()
}

export function defaultDateRange() {
  const end = new Date()
  const start = new Date(end.getTime() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000)
  return {
    start: formatISO(start),
    end: formatISO(end),
  }
}

export function toDatetimeLocalInput(iso?: string) {
  if (!iso) {
    return ''
  }
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
