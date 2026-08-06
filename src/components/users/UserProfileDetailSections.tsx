import type { ReactNode } from 'react'
import type { FilterField, PartnerPreferences, UserProfile } from '@/api/types'
import { formatDateTime, formatNumber } from '@/utils/format'

function str(v: unknown): string {
  if (v == null || v === '') return '--'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'number') return formatNumber(v)
  if (Array.isArray(v)) return v.length ? v.join(', ') : '--'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function formatFilterField<T>(_label: string, field: FilterField<T> | null | undefined): string {
  if (!field) return '--'
  const strict = field.isStrict != null ? ` strict=${field.isStrict}` : ''
  const vals = field.values
  if (vals == null) return `--${strict}`
  return `${typeof vals === 'object' ? JSON.stringify(vals) : String(vals)}${strict}`
}

export function UserProfileDetailSections({ profile }: { profile: UserProfile | null | undefined }) {
  if (!profile) {
    return <p className="text-sm text-slate-500">No profile data.</p>
  }

  const bd = profile.basicDetails
  const ce = profile.careerEducation
  const fp = profile.faithPractice
  const pers = profile.personality
  const h = profile.health
  const fam = profile.family
  const loc = profile.location
  const pp = profile.partnerPreferences

  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2">
      <ProfileFieldsBlock
        title="Profile record"
        rows={[
          ['Profile id', str(profile.id)],
          ['User id', str(profile.userId)],
          ['Member id', str(profile.memberId)],
          ['Phone', str(profile.phone)],
          ['Profile status', str(profile.profileStatus)],
          ['Account status', str(profile.accountStatus)],
          ['Contact privacy', str(profile.contactPrivacy)],
          ['Subscribed', str(profile.subscribed)],
          ['Verified profile', str(profile.verifiedProfile)],
          ['Onboarding complete', str(profile.onboardingComplete)],
          ['Onboarding completed at', formatDateTime(profile.onboardingCompletedAt)],
          ['Profile complete', str(profile.profileComplete)],
          ['Profile completed at', formatDateTime(profile.profileCompletedAt)],
          ['First profile completed at', formatDateTime(profile.firstProfileCompletedAt)],
          ['Profile creation %', profile.profileCreationPercentage?.toString() ?? '--'],
          ['Profile created at', formatDateTime(profile.createdAt)],
          ['Last seen', formatDateTime(profile.lastSeen)],
          ['Photo first approved at', formatDateTime(profile.photoFirstApprovedAt)],
          ['Approved photo count', profile.approvedPhotoCount?.toString() ?? '--'],
          ['Deleted at', formatDateTime(profile.deletedAt)],
          ['Purge at', formatDateTime(profile.purgeAt)],
        ]}
      />
      <ProfileFieldsBlock
        title="Basic details"
        rows={[
          ['Profile created for', str(bd?.profileCreatedFor)],
          ['Full name', str(bd?.fullName)],
          ['Gender', str(bd?.gender)],
          ['Date of birth', str(bd?.dateOfBirth)],
          ['Marital status', str(bd?.maritalStatus)],
          ['Height', bd?.height != null ? formatNumber(bd.height) : '--'],
          ['City', str(bd?.city)],
          ['State', str(bd?.state)],
          ['Country', str(bd?.country)],
          ['Ethnicity', str(bd?.ethnicity)],
        ]}
      />
      <ProfileFieldsBlock
        title="Career & education"
        rows={[
          ['Education', str(ce?.education)],
          ['Profession', str(ce?.profession)],
          ['Industry', str(ce?.industry)],
          ['Income band id', str(ce?.incomeBandId)],
          ['Income label', str(ce?.incomeLabel)],
          ['Income / year (USD)', ce?.incomePerYearUsd != null ? formatNumber(ce.incomePerYearUsd) : '--'],
          ['Income currency', str(ce?.incomeCurrency)],
          ['Saving assets band id', str(ce?.savingAssetsBandId)],
          ['Saving assets label', str(ce?.savingAssetsLabel)],
          ['Saving assets currency', str(ce?.savingAssetsCurrency)],
          ['Saving assets USD', ce?.savingAssetsUsd != null ? formatNumber(ce.savingAssetsUsd) : '--'],
        ]}
      />
      <ProfileFieldsBlock
        title="Faith"
        rows={[
          ['Sect', str(fp?.sect)],
          ['Caste', str(fp?.caste)],
          ['Islamic dress', str(fp?.islamicDress)],
          ['Religious practice', str(fp?.religiousPractice)],
          ['Born Muslim', str(fp?.bornMuslim)],
          ['Faith points', (fp?.faithPoints ?? []).join(', ') || '--'],
        ]}
      />
      <ProfileFieldsBlock
        title="Personality"
        rows={[['Personality points', (pers?.personalityPoints ?? []).join(', ') || '--']]}
      />
      <ProfileFieldsBlock
        title="Health & wellbeing"
        rows={[
          ['Smoke', str(h?.smoke)],
          ['Alcohol', str(h?.alcohol)],
          ['Emotional wellbeing', str(h?.emotionalWellBeing)],
          ['Therapy status', str(h?.therapyStatus)],
          ['Physical health', str(h?.physicalHealth)],
          ['Marrying with health challenges', str(h?.marryingWithHealthChallenges)],
          ['Halal food', str(h?.halalFood)],
        ]}
      />
      <ProfileFieldsBlock
        title="Family"
        rows={[
          ['Family type', str(fam?.familyType)],
          ['Family status', str(fam?.familyStatus)],
          ['Father occupation', str(fam?.fatherOccupation)],
          ['Mother occupation', str(fam?.motherOccupation)],
          ['Brothers', str(fam?.brothers)],
          ['Sisters', str(fam?.sisters)],
        ]}
      />
      <ProfileFieldsBlock
        title="Location (coordinates)"
        rows={[
          ['Latitude', loc?.latitude != null ? String(loc.latitude) : '--'],
          ['Longitude', loc?.longitude != null ? String(loc.longitude) : '--'],
          ['Location updated at', formatDateTime(loc?.updatedAt)],
        ]}
      />
      <ProfileFieldsBlock
        title="Media gallery (summary)"
        rows={[
          ['Visibility', str(profile.mediaGallery?.visibility)],
          ['Item count', `${profile.mediaGallery?.items?.length ?? 0}`],
        ]}
      />
      <ProfileFieldsBlock
        title="Partner preferences"
        rows={partnerPreferenceRows(pp)}
      />
      <ProfileFieldsBlock
        title="Bio & moderation"
        rows={[
          ['Bio', profile.bio ?? '--'],
          ['Bio moderation status', str(profile.bioModerationStatus)],
          ['Bio moderation reasons', (profile.bioModerationReasons ?? []).join(', ') || '--'],
          ['Bio moderated at', formatDateTime(profile.bioModeratedAt)],
        ]}
      />
    </div>
  )
}

function partnerPreferenceRows(pp: PartnerPreferences | null | undefined): Array<[string, string]> {
  if (!pp) {
    return [['(entire block)', '--']]
  }
  const rows: Array<[string, string]> = [
    ['Age min', pp.age?.minAge != null ? String(pp.age.minAge) : '--'],
    ['Age max', pp.age?.maxAge != null ? String(pp.age.maxAge) : '--'],
    ['Countries', (pp.country ?? []).join(', ') || '--'],
    ['Sects', (pp.sect ?? []).join(', ') || '--'],
    ['Height filter', formatFilterField('height', pp.height)],
    ['Marital status filter', formatFilterField('maritalStatus', pp.maritalStatus)],
    ['State filter', formatFilterField('state', pp.state)],
    ['City filter', formatFilterField('city', pp.city)],
    ['Caste filter', formatFilterField('caste', pp.caste)],
    ['Ethnicity filter', formatFilterField('ethnicity', pp.ethnicity)],
    ['Education filter', formatFilterField('education', pp.education)],
    ['Profession filter', formatFilterField('profession', pp.profession)],
    ['Saving assets filter', formatFilterField('savingAssets', pp.savingAssets)],
    ['Income filter', formatFilterField('income', pp.income)],
    ['Religious practice filter', formatFilterField('religiousPractice', pp.religiousPractice)],
    ['Born Muslim filter', formatFilterField('bornMuslim', pp.bornMuslim)],
    ['Smoke filter', formatFilterField('smoke', pp.smoke)],
    ['Alcohol filter', formatFilterField('alcohol', pp.alcohol)],
    ['Islamic dress filter', formatFilterField('islamicDress', pp.islamicDress)],
  ]
  return rows
}

function ProfileFieldsBlock({ title, rows }: { title: string; rows: Array<[string, string | ReactNode]> }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 p-3">
      <p className="mb-2 text-sm font-semibold text-slate-900">{title}</p>
      <div className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div
            key={`${title}-${label}`}
            className="flex min-w-0 flex-col gap-1 border-b border-slate-100 pb-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
          >
            <span className="min-w-0 shrink-0 text-slate-500">{label}</span>
            <span className="min-w-0 break-words text-left font-medium text-slate-900 sm:max-w-[65%] sm:text-right">
              {value || '--'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
