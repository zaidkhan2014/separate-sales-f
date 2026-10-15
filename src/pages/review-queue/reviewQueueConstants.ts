import type { ProfileReviewCode } from '@/api/types'

export const PROFILE_REVIEW_CODES: ProfileReviewCode[] = [
  'SELFIE_REQUIRED',
  'SELFIE_FACE_MISMATCH',
  'GENDER_MISMATCH',
  'NSFW_BANNED',
  'GENDER_CHANGED_PENDING_REVIEW',
]

export const REVIEW_CODE_LABELS: Record<ProfileReviewCode, string> = {
  SELFIE_REQUIRED: 'Selfie required',
  SELFIE_FACE_MISMATCH: 'Face mismatch',
  GENDER_MISMATCH: 'Gender mismatch',
  NSFW_BANNED: 'NSFW ban',
  GENDER_CHANGED_PENDING_REVIEW: 'Gender change pending',
}

export function reviewCodeLabel(code: string | null | undefined): string {
  if (!code) return 'No code'
  if (code in REVIEW_CODE_LABELS) {
    return REVIEW_CODE_LABELS[code as ProfileReviewCode]
  }
  return code
}

export function approveDisabledReason(item: {
  canForceApprove: boolean
  reviewCode: string | null
}): string | null {
  if (item.canForceApprove) return null
  if (item.reviewCode === 'NSFW_BANNED') return 'Cannot approve NSFW ban'
  return 'Not eligible for force-approve'
}
