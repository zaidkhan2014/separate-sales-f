import type { DropoffGenderFilter, OnboardingDropoffFilters } from '@/api/types'

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

export const ONBOARDING_DROPOFF_PAGE_SIZE = 20

export const DROPOFF_GENDER_TABS: Array<{ value: DropoffGenderFilter; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' },
  { value: 'Unknown', label: 'Unknown' },
]

export function isValidUtcDay(day: string): boolean {
  return DAY_RE.test(day.trim())
}

/** Build applied filters after Check; returns null if day is missing/invalid. */
export function buildOnboardingDropoffApplied(day: string): OnboardingDropoffFilters | null {
  const trimmed = day.trim()
  if (!isValidUtcDay(trimmed)) return null
  return {
    day: trimmed,
    gender: 'ALL',
    page: 0,
    size: ONBOARDING_DROPOFF_PAGE_SIZE,
  }
}
