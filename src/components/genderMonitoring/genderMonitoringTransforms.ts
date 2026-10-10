import type { CityDistributionStats, GenderSnapshot, GenderTrendPoint } from '@/api/types'
import { GENDER_CHART_COLORS } from '@/components/genderMonitoring/genderChartColors'

export interface GenderChartDatum {
  key: 'male' | 'female' | 'unknown'
  label: string
  value: number
  color: string
}

const PROFILE_STATUS_ORDER = ['APPROVED', 'PENDING', 'REJECTED']

export function buildGenderPieData(snapshot: GenderSnapshot): GenderChartDatum[] {
  const points: GenderChartDatum[] = [
    { key: 'male', label: 'Male', value: snapshot.male, color: GENDER_CHART_COLORS.male },
    { key: 'female', label: 'Female', value: snapshot.female, color: GENDER_CHART_COLORS.female },
  ]
  if (snapshot.unknown > 0) {
    points.push({ key: 'unknown', label: 'Unknown', value: snapshot.unknown, color: GENDER_CHART_COLORS.unknown })
  }
  return points
}

export function buildProfileStatusRows(byProfileStatus: Record<string, GenderSnapshot>) {
  const ordered = PROFILE_STATUS_ORDER.filter((status) => byProfileStatus[status])
  const extras = Object.keys(byProfileStatus).filter((status) => !PROFILE_STATUS_ORDER.includes(status))
  return [...ordered, ...extras].map((status) => ({
    status,
    ...byProfileStatus[status],
  }))
}

export function hasTrendData(series: GenderTrendPoint[]): boolean {
  return series.length > 0
}

export function hasCityData(cityDistribution: CityDistributionStats): boolean {
  return cityDistribution.cities.length > 0
}

export function formatRangeLabel(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'Selected range'
  }
  return `${startDate.toLocaleDateString('en-IN')} - ${endDate.toLocaleDateString('en-IN')}`
}
