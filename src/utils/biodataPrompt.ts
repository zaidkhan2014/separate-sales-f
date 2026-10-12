import type { FilterField, PartnerPreferences, UserProfile } from '@/api/types'

const FALLBACK_ORDER = 999_999
const QURB_LOGO_URL = 'https://www.getqurb.com/assets/qurb-logo-full-DJfb8tQl.jpg'

function present(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

function line(label: string, value: unknown): string | null {
  if (!present(value)) return null
  if (Array.isArray(value)) return `${label}: ${value.join(', ')}`
  if (typeof value === 'string') return `${label}: ${value.trim()}`
  return `${label}: ${String(value)}`
}

function section(title: string, lines: Array<string | null>): string[] {
  const body = lines.filter((item): item is string => Boolean(item))
  if (!body.length) return []
  return [`${title}:`, ...body.map((item) => `- ${item}`), '']
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

function partnerPreferenceLines(pp: PartnerPreferences | null | undefined): Array<string | null> {
  if (!pp) return []
  const ageParts: string[] = []
  if (pp.age?.minAge != null) ageParts.push(`min ${pp.age.minAge}`)
  if (pp.age?.maxAge != null) ageParts.push(`max ${pp.age.maxAge}`)

  return [
    ageParts.length ? line('Age range', ageParts.join(', ')) : null,
    line('Countries', pp.country),
    line('Sects', pp.sect),
    line('Height', formatFilterValues(pp.height)),
    line('Marital status', formatFilterValues(pp.maritalStatus)),
    line('State', formatFilterValues(pp.state)),
    line('City', formatFilterValues(pp.city)),
    line('Caste', formatFilterValues(pp.caste)),
    line('Ethnicity', formatFilterValues(pp.ethnicity)),
    line('Education', formatFilterValues(pp.education)),
    line('Profession', formatFilterValues(pp.profession)),
    line('Saving assets', formatFilterValues(pp.savingAssets)),
    line('Income', formatFilterValues(pp.income)),
    line('Religious practice', formatFilterValues(pp.religiousPractice)),
    line('Born Muslim', formatFilterValues(pp.bornMuslim)),
    line('Smoke', formatFilterValues(pp.smoke)),
    line('Alcohol', formatFilterValues(pp.alcohol)),
    line('Islamic dress', formatFilterValues(pp.islamicDress)),
  ]
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
 * Builds a clipboard-ready AI prompt for a minimal Qurb-branded biodata image.
 * Omits phone, member/user ids, and other internal identifiers.
 */
export function buildBiodataPrompt(profile: UserProfile): string {
  const bd = profile.basicDetails
  const ce = profile.careerEducation
  const fp = profile.faithPractice
  const pers = profile.personality
  const h = profile.health
  const fam = profile.family
  const photos = getGalleryImageUrls(profile)

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
    '- Do NOT include phone numbers, member IDs, user IDs, or any other internal/admin identifiers',
    '',
    'Visual design (premium biodata card):',
    '- Single tall shareable card (phone portrait ~9:16) with generous whitespace — not a dense form dump',
    '- Soft off-white/cream background; deep plum/aubergine + muted magenta accents matching the Qurb logo (avoid generic purple-on-white AI cliché)',
    '- Qurb logo clearly at top; elegant circular portrait with a subtle gold/bronze ring',
    '- Name as hero under the photo; key facts in a clean icon + label row (gender, age/DOB, marital status, height, location)',
    '- Clear section hierarchy (Career & Education, Faith, Faith points, Personality, Health, Family, Bio as available)',
    '- Faith points and personality as refined pill tags — not cluttered chip walls',
    '- Avoid spreadsheet/list look, tiny overcrowded icons, and low-contrast gray walls of text',
    '- Optional refined footer tagline: “Finding your spouse, seeking His pleasure.”',
    '',
  ]

  parts.push(
    ...section('Basic details', [
      line('Full name', bd?.fullName),
      line('Gender', bd?.gender),
      line('Date of birth', bd?.dateOfBirth),
      line('Marital status', bd?.maritalStatus),
      line('Height', bd?.height != null ? `${bd.height} cm` : null),
      line('City', bd?.city),
      line('State', bd?.state),
      line('Country', bd?.country),
      line('Ethnicity', bd?.ethnicity),
      line('Profile created for', bd?.profileCreatedFor),
    ]),
    ...section('Career & education', [
      line('Education', ce?.education),
      line('Profession', ce?.profession),
      line('Industry', ce?.industry),
      line('Income', ce?.incomeLabel),
      line('Saving assets', ce?.savingAssetsLabel),
    ]),
    ...section('Faith', [
      line('Sect', fp?.sect),
      line('Caste', fp?.caste),
      line('Islamic dress', fp?.islamicDress),
      line('Religious practice', fp?.religiousPractice),
      line('Born Muslim', fp?.bornMuslim),
      line('Faith points', fp?.faithPoints),
    ]),
    ...section('Personality', [line('Personality points', pers?.personalityPoints)]),
    ...section('Health & wellbeing', [
      line('Smoke', h?.smoke),
      line('Alcohol', h?.alcohol),
      line('Emotional wellbeing', h?.emotionalWellBeing),
      line('Therapy status', h?.therapyStatus),
      line('Physical health', h?.physicalHealth),
      line('Marrying with health challenges', h?.marryingWithHealthChallenges),
      line('Halal food', h?.halalFood),
    ]),
    ...section('Family', [
      line('Family type', fam?.familyType),
      line('Family status', fam?.familyStatus),
      line('Father occupation', fam?.fatherOccupation),
      line('Mother occupation', fam?.motherOccupation),
      line('Brothers', fam?.brothers),
      line('Sisters', fam?.sisters),
    ]),
    ...section('Bio', [present(profile.bio) ? String(profile.bio).trim() : null]),
    ...section('Partner preferences', partnerPreferenceLines(profile.partnerPreferences)),
  )

  if (photos.length) {
    parts.push(
      'Profile photos (STRICTLY use these exact URLs for the person — do not replace with any other face):',
    )
    photos.forEach((url, index) => {
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
