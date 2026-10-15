import { describe, expect, it } from 'vitest'
import {
  approveDisabledReason,
  reviewCodeLabel,
} from '@/pages/review-queue/reviewQueueConstants'

describe('reviewQueueConstants', () => {
  it('maps known review codes to labels', () => {
    expect(reviewCodeLabel('SELFIE_FACE_MISMATCH')).toBe('Face mismatch')
    expect(reviewCodeLabel('GENDER_MISMATCH')).toBe('Gender mismatch')
    expect(reviewCodeLabel(null)).toBe('No code')
  })

  it('returns NSFW reason when force-approve is blocked', () => {
    expect(
      approveDisabledReason({ canForceApprove: false, reviewCode: 'NSFW_BANNED' }),
    ).toBe('Cannot approve NSFW ban')
    expect(approveDisabledReason({ canForceApprove: true, reviewCode: 'GENDER_MISMATCH' })).toBeNull()
  })
})
