import type { UserProfile } from '@/api/types'

const FALLBACK_ORDER = 999_999

/**
 * First gallery image by `orderIndex` (images only, with a usable `url`).
 */
export function getPrimaryGalleryImageUrl(profile: UserProfile | undefined | null): string | null {
  const items = profile?.mediaGallery?.items
  if (!items?.length) return null

  const images = items
    .filter((m) => m.type?.toLowerCase() === 'image' && m.url)
    .sort((a, b) => (a.orderIndex ?? FALLBACK_ORDER) - (b.orderIndex ?? FALLBACK_ORDER))

  return images[0]?.url ?? null
}

export function getInitialsFromFullName(fullName: string | null | undefined): string | null {
  const trimmed = fullName?.trim()
  if (!trimmed) return null
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    const w = parts[0]
    return w.length <= 2 ? w.toUpperCase() : (w[0] + w[1]).toUpperCase()
  }
  const first = parts[0][0]
  const last = parts[parts.length - 1][0]
  return `${first}${last}`.toUpperCase()
}
