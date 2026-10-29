/** Exact faithPractice.sect labels sent to sales / active / deleted / VIP leads APIs. */
export const SALES_SECT_LABELS = [
  'Sunni',
  'Sunni (Hanafi)',
  'Sunni (Maliki)',
  'Sunni (Shafi)',
  'Sunni (Hanbali)',
  'Shia',
  'Shia (Twelver)',
  'Shia (Ismaili)',
  'Shia (Zaydi)',
  'Sufi',
  'Sunni (Salafi)',
  'Other',
] as const

export type SalesSectLabel = (typeof SALES_SECT_LABELS)[number]

const SECT_SET = new Set<string>(SALES_SECT_LABELS)

/**
 * Exact faithPractice.caste labels sent to sales / active / deleted / VIP leads APIs.
 * Labels only (not slug ids) — API expects display labels.
 */
export const SALES_CASTE_LABELS = [
  'Arab',
  'Aarzal',
  'Aayanavar',
  'Ansari',
  'Bagban or Baghban',
  'Barbhuiya',
  'Beigh',
  'Bhat',
  'Chhipa',
  'Dar',
  'Deccanis or Deccani',
  'Dudekula',
  'Gada/Gour',
  'Gaddi',
  'Ganai',
  'Idrisi',
  'Kalal (Iraqi)',
  'Khan or Pathan',
  'Konkani',
  'Labbai',
  'Ladaf or Nadaf',
  'Lohar',
  'Lone',
  'Malik',
  'Manihars',
  'Mansoori',
  'Mappila',
  'Memon',
  'Mewati',
  'Mir',
  'Modh Ghanchi',
  'Mughal',
  'Mujawar',
  'Muslim Choudhary',
  'Najars',
  'Parray',
  'Patel',
  'Pinjara',
  'Qazi',
  'Quraishi',
  'Rajput / Chauhan / Thakur',
  'Rangrez',
  'Rather',
  'Rayeen',
  'Reshi',
  'Rowther',
  'Saifi',
  'Salmani',
  'Shah',
  'Shams or Shamsi',
  'Sheikh or Shaikh',
  'Siddique',
  'Sofis',
  'Syed',
  'Tamboli',
  'Tantray',
  'Tura or Turk',
  'Tyagi',
  'Vohra',
  'Wani',
  'No Caste',
] as const

export type SalesCasteLabel = (typeof SALES_CASTE_LABELS)[number]

const CASTE_SET = new Set<string>(SALES_CASTE_LABELS)

/** Returns the label if allowed; otherwise empty string (Any). */
export function parseSalesSectLabel(raw: string | null | undefined): string {
  const value = raw?.trim() ?? ''
  return SECT_SET.has(value) ? value : ''
}

/** Returns the label if allowed; otherwise empty string (Any). */
export function parseSalesCasteLabel(raw: string | null | undefined): string {
  const value = raw?.trim() ?? ''
  return CASTE_SET.has(value) ? value : ''
}
