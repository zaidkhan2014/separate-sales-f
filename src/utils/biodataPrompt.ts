import type { FilterField, PartnerPreferences, UserProfile } from '@/api/types'

const FALLBACK_ORDER = 999_999
export const QURB_LOGO_URL = 'https://www.getqurb.com/assets/qurb-logo-full-DJfb8tQl.jpg'
export const QURB_BIODATA_TAGLINE = 'Finding your spouse, seeking His pleasure.'

export type BiodataRow = { label: string; value: string }
export type BiodataSection = { title: string; rows: BiodataRow[] }

export interface BiodataContentOptions {
  includePhone?: boolean
}

export interface BiodataContent {
  displayName: string
  locationLine: string | null
  photoUrls: string[]
  /** Compact facts shown under the name (Gender, DOB, etc.) */
  keyFacts: BiodataRow[]
  sections: BiodataSection[]
}

function present(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

function asText(value: unknown): string | null {
  if (!present(value)) return null
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean).join(', ')
  if (typeof value === 'string') return value.trim()
  return String(value)
}

function row(label: string, value: unknown): BiodataRow | null {
  const text = asText(value)
  if (!text) return null
  return { label, value: text }
}

/** Make values safe for Helvetica-based jsPDF (₹ and similar break glyph metrics). */
export function sanitizePdfText(value: string): string {
  return value
    .replace(/\u20B9/g, 'Rs ')
    .replace(/₹/g, 'Rs ')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
}

function formatFilterValues(field: FilterField<unknown> | null | undefined): string | null {
  if (!field || field.values == null) return null
  const { values } = field
  if (Array.isArray(values)) {
    const items = values.map((v) => String(v).trim()).filter(Boolean)
    return items.length ? items.join(', ') : null
  }
  if (typeof values === 'object') {
    const entries = Object.entries(values as Record<string, unknown>)
      .filter(([, v]) => present(v))
      .map(([k, v]) => `${k}=${String(v)}`)
    return entries.length ? entries.join(', ') : null
  }
  const text = String(values).trim()
  return text || null
}

function partnerPreferenceRows(pp: PartnerPreferences | null | undefined): BiodataRow[] {
  if (!pp) return []
  const ageParts: string[] = []
  if (pp.age?.minAge != null) ageParts.push(`min ${pp.age.minAge}`)
  if (pp.age?.maxAge != null) ageParts.push(`max ${pp.age.maxAge}`)

  return [
    ageParts.length ? row('Age range', ageParts.join(', ')) : null,
    row('Countries', pp.country),
    row('Sects', pp.sect),
    row('Height', formatFilterValues(pp.height)),
    row('Marital status', formatFilterValues(pp.maritalStatus)),
    row('State', formatFilterValues(pp.state)),
    row('City', formatFilterValues(pp.city)),
    row('Caste', formatFilterValues(pp.caste)),
    row('Ethnicity', formatFilterValues(pp.ethnicity)),
    row('Education', formatFilterValues(pp.education)),
    row('Profession', formatFilterValues(pp.profession)),
    row('Saving assets', formatFilterValues(pp.savingAssets)),
    row('Income', formatFilterValues(pp.income)),
    row('Religious practice', formatFilterValues(pp.religiousPractice)),
    row('Born Muslim', formatFilterValues(pp.bornMuslim)),
    row('Smoke', formatFilterValues(pp.smoke)),
    row('Alcohol', formatFilterValues(pp.alcohol)),
    row('Islamic dress', formatFilterValues(pp.islamicDress)),
  ].filter((item): item is BiodataRow => Boolean(item))
}

function makeSection(title: string, rows: Array<BiodataRow | null>): BiodataSection | null {
  const body = rows.filter((item): item is BiodataRow => Boolean(item))
  if (!body.length) return null
  return { title, rows: body }
}

/** All gallery image URLs sorted by orderIndex (images with a usable url only). */
export function getGalleryImageUrls(profile: UserProfile | undefined | null): string[] {
  const items = profile?.mediaGallery?.items
  if (!items?.length) return []

  return items
    .filter((m) => m.type?.toLowerCase() === 'image' && m.url)
    .sort((a, b) => (a.orderIndex ?? FALLBACK_ORDER) - (b.orderIndex ?? FALLBACK_ORDER))
    .map((m) => m.url!.trim())
    .filter(Boolean)
}

/**
 * Privacy-safe biodata fields shared by the AI prompt and PDF export.
 * Omits member/user ids and band ids. Phone only when includePhone is true.
 */
export function getBiodataContent(
  profile: UserProfile,
  options: BiodataContentOptions = {},
): BiodataContent {
  const bd = profile.basicDetails
  const ce = profile.careerEducation
  const fp = profile.faithPractice
  const pers = profile.personality
  const h = profile.health
  const fam = profile.family
  const displayName = bd?.fullName?.trim() || 'Member'
  const locationLine =
    [bd?.city, bd?.state, bd?.country].map((p) => p?.trim()).filter(Boolean).join(', ') || null

  const keyFacts = [
    row('Gender', bd?.gender),
    row('Date of birth', bd?.dateOfBirth),
    row('Marital status', bd?.maritalStatus),
    row('Height', bd?.height != null ? `${bd.height} cm` : null),
    row('Ethnicity', bd?.ethnicity),
    row('Profile created for', bd?.profileCreatedFor),
    options.includePhone ? row('Phone', profile.phone) : null,
  ].filter((item): item is BiodataRow => Boolean(item))

  const basicRows = [
    row('Full name', bd?.fullName),
    row('Gender', bd?.gender),
    row('Date of birth', bd?.dateOfBirth),
    row('Marital status', bd?.maritalStatus),
    row('Height', bd?.height != null ? `${bd.height} cm` : null),
    row('City', bd?.city),
    row('State', bd?.state),
    row('Country', bd?.country),
    row('Ethnicity', bd?.ethnicity),
    row('Profile created for', bd?.profileCreatedFor),
    options.includePhone ? row('Phone', profile.phone) : null,
  ]

  const sections = [
    makeSection('Basic details', basicRows),
    makeSection('Career & education', [
      row('Education', ce?.education),
      row('Profession', ce?.profession),
      row('Industry', ce?.industry),
      row('Income', ce?.incomeLabel),
      row('Saving assets', ce?.savingAssetsLabel),
    ]),
    makeSection('Faith', [
      row('Sect', fp?.sect),
      row('Caste', fp?.caste),
      row('Islamic dress', fp?.islamicDress),
      row('Religious practice', fp?.religiousPractice),
      row('Born Muslim', fp?.bornMuslim),
      row('Faith points', fp?.faithPoints),
    ]),
    makeSection('Personality', [row('Personality points', pers?.personalityPoints)]),
    makeSection('Health & wellbeing', [
      row('Smoke', h?.smoke),
      row('Alcohol', h?.alcohol),
      row('Emotional wellbeing', h?.emotionalWellBeing),
      row('Therapy status', h?.therapyStatus),
      row('Physical health', h?.physicalHealth),
      row('Marrying with health challenges', h?.marryingWithHealthChallenges),
      row('Halal food', h?.halalFood),
    ]),
    makeSection('Family', [
      row('Family type', fam?.familyType),
      row('Family status', fam?.familyStatus),
      row('Father occupation', fam?.fatherOccupation),
      row('Mother occupation', fam?.motherOccupation),
      row('Brothers', fam?.brothers),
      row('Sisters', fam?.sisters),
    ]),
    makeSection('Bio', [row('Bio', profile.bio)]),
    makeSection('Partner preferences', partnerPreferenceRows(profile.partnerPreferences)),
  ].filter((item): item is BiodataSection => Boolean(item))

  return {
    displayName,
    locationLine,
    photoUrls: getGalleryImageUrls(profile),
    keyFacts,
    sections,
  }
}

/**
 * Builds a clipboard-ready AI prompt for a minimal Qurb-branded biodata image.
 * Omits member/user ids. Phone only when includePhone is true.
 */
export function buildBiodataPrompt(
  profile: UserProfile,
  options: BiodataContentOptions = {},
): string {
  const { photoUrls, sections } = getBiodataContent(profile, options)
  const phoneRule = options.includePhone
    ? '- Include the phone number exactly as listed in Basic details when present'
    : '- Do NOT include phone numbers, member IDs, user IDs, or any other internal/admin identifiers'

  const parts: string[] = [
    'Create a premium minimal-theme creative biodata card image for the Qurb Muslim marriage app.',
    '',
    'Brand:',
    '- App name: Qurb Muslim marriage app',
    `- Logo (include clearly at the top): ${QURB_LOGO_URL}`,
    '',
    'Photo fidelity (critical):',
    '- STRICTLY use only the provided profile photo URL(s) as this person’s face and identity',
    '- Do NOT generate, invent, substitute, or use stock/AI faces — no fake people',
    '- Keep the face clearly recognizable; high clarity, natural color; only a light flattering crop if needed',
    '',
    'Data fidelity (critical):',
    '- Render every listed detail exactly as given (spelling, numbers, labels, punctuation)',
    '- Do NOT invent, omit, rename, rephrase, or “improve” any field',
    '- Skip sections with no data; never invent filler content',
    phoneRule,
    '- Do NOT include member IDs, user IDs, or any other internal/admin identifiers',
    '',
    'Visual design (premium biodata card):',
    '- Single tall shareable card (phone portrait ~9:16) with generous whitespace — not a dense form dump',
    '- Soft off-white/cream background; deep plum/aubergine + muted magenta accents matching the Qurb logo (avoid generic purple-on-white AI cliché)',
    '- Qurb logo clearly at top; elegant circular portrait with a subtle gold/bronze ring',
    '- Name as hero under the photo; key facts in a clean icon + label row (gender, age/DOB, marital status, height, location)',
    '- Clear section hierarchy (Career & Education, Faith, Faith points, Personality, Health, Family, Bio as available)',
    '- Faith points and personality as refined pill tags — not cluttered chip walls',
    '- Avoid spreadsheet/list look, tiny overcrowded icons, and low-contrast gray walls of text',
    `- Optional refined footer tagline: “${QURB_BIODATA_TAGLINE}”`,
    '',
  ]

  for (const section of sections) {
    parts.push(`${section.title}:`)
    for (const item of section.rows) {
      parts.push(`- ${item.label}: ${item.value}`)
    }
    parts.push('')
  }

  if (photoUrls.length) {
    parts.push(
      'Profile photos (STRICTLY use these exact URLs for the person — do not replace with any other face):',
    )
    photoUrls.forEach((url, index) => {
      parts.push(`${index + 1}. ${url}`)
    })
    parts.push('')
  } else {
    parts.push(
      'Profile photos: none provided — do not invent a face; use elegant initials or a tasteful placeholder only.',
      '',
    )
  }

  parts.push(
    'Output a single polished biodata image suitable for sharing, with correct details and the real provided photo.',
  )

  return parts.join('\n').trim() + '\n'
}
