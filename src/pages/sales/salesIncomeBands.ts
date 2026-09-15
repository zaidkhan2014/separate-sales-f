/** Hardcoded from src/doc/incomedoc.md — do not fetch GET /api/bands/income-bands */

export const INDIA_MIN_INCOME_BANDS = [
  { id: 'INC_IN_0_5', label: '₹0–₹5 lakh' },
  { id: 'INC_IN_5_10', label: '₹5–₹10 lakh' },
  { id: 'INC_IN_10_20', label: '₹10–₹20 lakh' },
  { id: 'INC_IN_20_30', label: '₹20–₹30 lakh' },
  { id: 'INC_IN_30_40', label: '₹30–₹40 lakh' },
  { id: 'INC_IN_40_50', label: '₹40–₹50 lakh' },
  { id: 'INC_IN_50_60', label: '₹50–₹60 lakh' },
  { id: 'INC_IN_60_70', label: '₹60–₹70 lakh' },
  { id: 'INC_IN_70_80', label: '₹70–₹80 lakh' },
  { id: 'INC_IN_80_90', label: '₹80–₹90 lakh' },
  { id: 'INC_IN_90_100', label: '₹90–₹100 lakh' },
  { id: 'INC_IN_1P', label: '₹1 cr+' },
] as const

export const INTL_MIN_INCOME_BANDS = [
  { id: 'INC_INTL_0_20000', label: '$0–$20k' },
  { id: 'INC_INTL_20000_40000', label: '$20k–$40k' },
  { id: 'INC_INTL_40000_60000', label: '$40k–$60k' },
  { id: 'INC_INTL_60000_80000', label: '$60k–$80k' },
  { id: 'INC_INTL_80000_100000', label: '$80k–$100k' },
  { id: 'INC_INTL_100000_150000', label: '$100k–$150k' },
  { id: 'INC_INTL_150000_200000', label: '$150k–$200k' },
  { id: 'INC_INTL_200000P', label: '$200k+' },
] as const

const BAND_LABEL_BY_ID = new Map<string, string>(
  [...INDIA_MIN_INCOME_BANDS, ...INTL_MIN_INCOME_BANDS].map((band) => [band.id, band.label]),
)

export const ALL_MIN_INCOME_BAND_IDS = new Set(BAND_LABEL_BY_ID.keys())

export function isValidMinIncomeBandId(id: string): boolean {
  return ALL_MIN_INCOME_BAND_IDS.has(id)
}

export function minIncomeBandLabel(id: string): string | undefined {
  return BAND_LABEL_BY_ID.get(id)
}
