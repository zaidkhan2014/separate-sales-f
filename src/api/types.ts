/** ISO-8601 instant from server JSON */
export type IsoInstant = string

export interface ErrorResponse {
  timestamp: IsoInstant
  status: number
  error: string
  message: string
}

export interface GeoCountry {
  iso2: string
  name: string
}

export interface GeoState {
  code: string
  name: string
  countryIso: string
}

export interface GeoCity {
  geonameId: string
  name: string
  stateCode: string
}
export interface AdminTokenResponse {
  accessToken: string
  expiresAt: IsoInstant
  scope: string
  roles: string[]
  sessionId: string
}

export interface AdminMetricPoint {
  bucket: string
  value: number
}

export interface AdminBreakdownItem {
  key: string
  value: number
}

export interface AdminMetricCard {
  key: string
  total: number
  series: AdminMetricPoint[]
  breakdown: AdminBreakdownItem[]
}

export interface AdminMetricsResponse {
  start: IsoInstant
  end: IsoInstant
  granularity: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  metrics: AdminMetricCard[]
}

export type ProfileStatus = 'APPROVED' | 'PENDING' | 'REJECTED'
export type BioModerationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
export type AccountStatus = 'ACTIVE' | 'DELETED' | 'BANNED'
export type ContactPrivacy = 'PREMIUM' | 'PREFERENCE'
export type MediaModerationState = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
export type GalleryVisibility = 'OPEN' | 'BLUR_ALL' | 'SHOW_TO_LIKED'

export interface BasicDetails {
  profileCreatedFor?: string | null
  fullName?: string | null
  gender?: string | null
  dateOfBirth?: string | null
  maritalStatus?: string | null
  height?: number | null
  city?: string | null
  state?: string | null
  country?: string | null
  ethnicity?: string | null
}

export interface Location {
  latitude: number
  longitude: number
  updatedAt?: IsoInstant | null
}

export interface CareerEducation {
  education?: string | null
  profession?: string | null
  industry?: string | null
  incomeBandId?: string | null
  incomeLabel?: string | null
  incomePerYearUsd?: number | null
  incomeCurrency?: string | null
  savingAssetsBandId?: string | null
  savingAssetsLabel?: string | null
  savingAssetsCurrency?: string | null
  savingAssetsUsd?: number | null
}

export interface FaithPractice {
  sect?: string | null
  caste?: string | null
  islamicDress?: string | null
  religiousPractice?: string | null
  bornMuslim?: string | null
  faithPoints?: string[] | null
}

export interface Personality {
  personalityPoints?: string[] | null
}

export interface Health {
  smoke?: string | null
  alcohol?: string | null
  emotionalWellBeing?: string | null
  therapyStatus?: string | null
  physicalHealth?: string | null
  marryingWithHealthChallenges?: string | null
  halalFood?: string | null
}

export interface Family {
  familyType?: string | null
  familyStatus?: string | null
  fatherOccupation?: string | null
  motherOccupation?: string | null
  brothers?: string | null
  sisters?: string | null
}

export interface Media {
  publicId?: string | null
  url?: string | null
  type?: string | null
  orderIndex?: number
  createdAt?: IsoInstant | null
  accessMode?: string | null
  format?: string | null
  moderationState?: MediaModerationState | null
  moderationReasons?: string[] | null
  moderationQueuedAt?: IsoInstant | null
  moderationAttemptCount?: number
  lastModerationError?: string | null
  decidedAt?: IsoInstant | null
}

export interface MediaGallery {
  items?: Media[] | null
  visibility?: GalleryVisibility | null
}

export interface Age {
  minAge?: number | null
  maxAge?: number | null
}

export interface Height {
  minHeight?: number | null
  maxHeight?: number | null
}

export interface FilterField<T> {
  values?: T | null
  isStrict?: boolean
}

export interface PartnerPreferences {
  age?: Age | null
  country?: string[] | null
  sect?: string[] | null
  height?: FilterField<Height> | null
  maritalStatus?: FilterField<string[]> | null
  state?: FilterField<string[]> | null
  city?: FilterField<string[]> | null
  caste?: FilterField<string[]> | null
  ethnicity?: FilterField<string[]> | null
  education?: FilterField<string[]> | null
  profession?: FilterField<string[]> | null
  savingAssets?: FilterField<string | null> | null
  income?: FilterField<string | null> | null
  religiousPractice?: FilterField<string[]> | null
  bornMuslim?: FilterField<string | null> | null
  smoke?: FilterField<string | null> | null
  alcohol?: FilterField<string | null> | null
  islamicDress?: FilterField<string[]> | null
}

export interface UserProfile {
  id?: string | null
  userId?: string | null
  phone?: string | null
  memberId?: string | null
  onboardingComplete?: boolean
  onboardingCompletedAt?: IsoInstant | null
  profileComplete?: boolean
  profileCompletedAt?: IsoInstant | null
  firstProfileCompletedAt?: IsoInstant | null
  profileCreationPercentage?: number
  basicDetails?: BasicDetails | null
  careerEducation?: CareerEducation | null
  faithPractice?: FaithPractice | null
  personality?: Personality | null
  health?: Health | null
  family?: Family | null
  mediaGallery?: MediaGallery | null
  partnerPreferences?: PartnerPreferences | null
  bio?: string | null
  bioModerationStatus?: BioModerationStatus | null
  bioModerationReasons?: string[] | null
  bioModeratedAt?: IsoInstant | null
  subscribed?: boolean
  lastSeen?: IsoInstant | null
  verifiedProfile?: boolean
  createdAt?: IsoInstant | null
  location?: Location | null
  approvedPhotoCount?: number
  profileStatus?: ProfileStatus | null
  photoFirstApprovedAt?: IsoInstant | null
  contactPrivacy?: ContactPrivacy | null
  accountStatus?: AccountStatus | null
  deletedAt?: IsoInstant | null
  purgeAt?: IsoInstant | null
}
// --- Sales ---

export type AdminSalesStatus =
  | 'CALL_REMAINING'
  | 'IN_PROCESS'
  | 'ALREADY_CALLED'
  | 'CALL_NOT_PICKED'
  | 'CALL_BACK_LATER'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'CONVERTED'

export type AdminSalesOutcomeReason =
  | 'PRICE_ISSUE'
  | 'NOT_LOOKING_NOW'
  | 'WRONG_NUMBER'
  | 'NO_RESPONSE'
  | 'ALREADY_MARRIED'
  | 'COMPETITOR'
  | 'LANGUAGE_BARRIER'
  | 'OTHER'

export interface AdminSalesNoteEntry {
  text: string
  adminUserId: string | null
  createdAt: IsoInstant
}

export interface AdminSalesLeadSummary {
  userId: string
  memberId: string | null
  phone: string | null
  fullName: string | null
  gender: string | null
  city: string | null
  state: string | null
  country: string | null
  createdAt: IsoInstant | null
  profileStatus: string | null
  accountStatus: string | null
  subscribed: boolean
  salesStatus: string
  note: string | null
  followUpAt: IsoInstant | null
  lastCalledAt: IsoInstant | null
  assignedToAdminId: string | null
  claimedAt: IsoInstant | null
  outcomeReason: AdminSalesOutcomeReason | null
  convertedAt: IsoInstant | null
  leadScore: number
  incomeLabel?: string | null
  incomePerYearUsd?: number | null
  updatedAt: IsoInstant | null
}

export interface AdminSalesLeadSearchResponse {
  items: AdminSalesLeadSummary[]
  page: number
  size: number
  total: number
}

export interface AdminSalesLeadDetailResponse {
  profile: UserProfile
  otpVerified: boolean
  profileRegistered: boolean
  signupAt: IsoInstant | null
  otpVerifiedAt: IsoInstant | null
  lastLoginAt: IsoInstant | null
  lastActivityAt: IsoInstant | null
  reportsAgainstUser: number
  blocksByUser: number
  blocksAgainstUser: number
  activeMatches: number
  initiatedChats: number
  interactionsSent: number
  salesStatus: string
  note: string | null
  notes: AdminSalesNoteEntry[]
  followUpAt: IsoInstant | null
  lastCalledAt: IsoInstant | null
  assignedToAdminId: string | null
  claimedAt: IsoInstant | null
  outcomeReason: AdminSalesOutcomeReason | null
  convertedAt: IsoInstant | null
  leadScore: number
  salesCreatedAt: IsoInstant | null
  salesUpdatedAt: IsoInstant | null
}

export type AdminSalesViewScope = 'LIVE' | 'DELETED'

export interface AdminDeletedSalesLeadSummary {
  userId: string
  memberId: string | null
  phone: string | null
  fullName: string | null
  gender: string | null
  city: string | null
  state: string | null
  country: string | null
  createdAt: IsoInstant | null
  profileStatus: string | null
  accountStatus: string | null
  subscribed: boolean
  salesStatus: string
  note: string | null
  followUpAt: IsoInstant | null
  lastCalledAt: IsoInstant | null
  assignedToAdminId: string | null
  claimedAt: IsoInstant | null
  outcomeReason: AdminSalesOutcomeReason | null
  convertedAt: IsoInstant | null
  leadScore: number
  incomeLabel?: string | null
  incomePerYearUsd?: number | null
  updatedAt: IsoInstant | null
  softDeletedAt?: IsoInstant | null
  purgedAt?: IsoInstant | null
  deletionAt?: IsoInstant | null
}

export interface AdminDeletedSalesLeadSearchResponse {
  items: AdminDeletedSalesLeadSummary[]
  page: number
  size: number
  total: number
}

export interface AdminDeletedSalesLeadDetailResponse extends AdminSalesLeadDetailResponse {
  softDeletedAt?: IsoInstant | null
  purgedAt?: IsoInstant | null
  deletionAt?: IsoInstant | null
  authCreatedAt?: IsoInstant | null
}

export interface UpdateSalesStatusRequest {
  status: AdminSalesStatus
  lastCalledAt?: IsoInstant | null
  outcomeReason?: AdminSalesOutcomeReason | null
}

export interface UpdateSalesNoteRequest {
  note: string
  adminUserId: string | null
}

export interface UpdateSalesFollowUpRequest {
  followUpAt?: IsoInstant | null
}

export interface AssignSalesLeadRequest {
  assignedToAdminId?: string | null
}

export type AdminSalesActivityType =
  | 'CLAIMED'
  | 'RELEASED'
  | 'STATUS_CHANGED'
  | 'NOTE_ADDED'
  | 'FOLLOW_UP_SET'
  | 'WHATSAPP_SENT'
  | 'CONVERTED'
  | 'ASSIGNED'

export interface AdminSalesActivityEntry {
  id: string
  userId: string
  type: AdminSalesActivityType
  message: string
  metadata: Record<string, unknown>
  actorEmployeeId: string | null
  createdAt: IsoInstant
}

export interface AdminSalesActivitySearchResponse {
  items: AdminSalesActivityEntry[]
  page: number
  size: number
  total: number
}

export interface CreateAdminSalesCommunicationRequest {
  channel: string
  templateName?: string | null
  note?: string | null
}

export interface AdminSalesAgentPerformance {
  employeeId: string
  name: string
  claimedCount: number
  callsCount: number
  interestedCount: number
  convertedCount: number
  overdueFollowUps: number
  avgMinutesToFirstCall: number | null
}

export interface AdminSalesAgentPerformanceResponse {
  items: AdminSalesAgentPerformance[]
}

export interface AdminSalesSavedViewSummary {
  id: string
  ownerEmployeeId: string
  name: string
  filtersJson: string
  scope?: AdminSalesViewScope
  createdAt: IsoInstant
  updatedAt: IsoInstant
}

export interface AdminSalesSavedViewSearchResponse {
  items: AdminSalesSavedViewSummary[]
  page: number
  size: number
  total: number
}

export interface CreateAdminSalesSavedViewRequest {
  name: string
  filtersJson: string
}

export interface UpdateAdminSalesSavedViewRequest {
  name?: string
  filtersJson?: string
}

export type AdminStaffRole = 'SUPER_ADMIN' | 'SALES_MANAGER' | 'SALES_AGENT' | 'SUPPORT'

export type AdminStaffStatus = 'ACTIVE' | 'DISABLED'

export interface AdminStaffSummary {
  id: string
  employeeId: string
  name: string
  email: string
  phone: string | null
  role: AdminStaffRole
  status: AdminStaffStatus
  createdAt: IsoInstant | null
  updatedAt: IsoInstant | null
  lastLoginAt: IsoInstant | null
}

export interface AdminStaffLoginResponse {
  accessToken: string
  expiresAt: IsoInstant
  scope: string
  roles: string[]
  sessionId: string
  staff: AdminStaffSummary
}

export interface AdminStaffLoginRequest {
  email: string
  password: string
}

// --- Filters ---

export interface SalesLeadsFilters {
  start?: IsoInstant
  end?: IsoInstant
  status?: AdminSalesStatus | 'ALL'
  followUpStart?: IsoInstant
  followUpEnd?: IsoInstant
  query?: string
  /** Same semantics as GET /users/search on user_profiles */
  profileStatus?: ProfileStatus
  accountStatus?: AccountStatus
  /** Exact match on basicDetails.gender (trimmed) */
  gender?: string
  /** Calendar year 1900–2100; matches dateOfBirth ISO yyyy-MM-dd by year prefix */
  birthYear?: number
  /** Exact match on basicDetails.maritalStatus (trimmed, case-sensitive) */
  maritalStatus?: string
  country?: string
  state?: string
  city?: string
  /** Hardcoded band id e.g. INC_IN_30_40 — see salesIncomeBands.ts */
  minIncomeBandId?: string
  pool?: boolean
  /** Staff employeeId, or literal UNASSIGNED */
  assignedToAdminId?: string
  assignedToMe?: boolean
  sort?: 'leadScore'
  subscribed?: boolean
  verifiedProfile?: boolean
  page?: number
  size?: number
}

/** Same as SalesLeadsFilters but no accountStatus (archives only). start/end = deletionAt. */
export type DeletedSalesLeadsFilters = Omit<SalesLeadsFilters, 'accountStatus'>

export interface SalesFollowUpsFilters {
  bucket?: 'due_today' | 'overdue' | 'upcoming'
  assignedToMe?: boolean
  page?: number
  size?: number
}

export interface SalesAgentPerformanceFilters {
  start?: IsoInstant
  end?: IsoInstant
  employeeId?: string
}

export interface SalesActivitiesFilters {
  type?: AdminSalesActivityType
  page?: number
  size?: number
}
