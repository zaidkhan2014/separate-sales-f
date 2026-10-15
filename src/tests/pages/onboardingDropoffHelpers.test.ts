import { describe, expect, it } from 'vitest'
import {
  buildOnboardingDropoffApplied,
  isValidUtcDay,
} from '@/pages/onboarding-dropoff/onboardingDropoffHelpers'

describe('onboardingDropoffHelpers', () => {
  it('validates yyyy-MM-dd UTC days', () => {
    expect(isValidUtcDay('2026-09-18')).toBe(true)
    expect(isValidUtcDay('')).toBe(false)
    expect(isValidUtcDay('2026/09/18')).toBe(false)
  })

  it('builds applied filters on Check with ALL gender and page 0', () => {
    expect(buildOnboardingDropoffApplied('2026-09-18')).toEqual({
      day: '2026-09-18',
      gender: 'ALL',
      page: 0,
      size: 20,
    })
    expect(buildOnboardingDropoffApplied('')).toBeNull()
  })
})
