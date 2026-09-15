# Deleted-Accounts Sales Dashboard API Contract

Guide for the **purged-accounts sales dashboard** (archives in `deleted_accounts` only). Live sales remain at [`FRONTEND_SALES_API_CONTRACT.md`](./FRONTEND_SALES_API_CONTRACT.md). Admin auth/base conventions: [`FRONTEND_ADMIN_API_CONTRACT.md`](./FRONTEND_ADMIN_API_CONTRACT.md).

---

## 1) Purpose vs live sales

| | Live `/api/admin/sales/**` | Deleted `/api/admin/sales/deleted/**` |
|--|--|--|
| Source | `user_profiles` | `deleted_accounts` (purged archives) |
| Soft-deleted still in profiles | Included when filtered (`accountStatus=DELETED`) | **Not** here |
| CRM | `admin_sales_leads` by `userId` | **Same** collection / `userId` |
| Date filter `start`/`end` | Profile `createdAt` | Deletion time (`softDeletedAt` → else `purgedAt`) |
| Default sort | Newest signup | Newest deletion |
| Subscription sync | Auto-convert if subscribed | **Skipped** (stale snapshot) |

---

## 2) Quick start

1. Same login as live sales: `POST /api/admin/auth/login`.
2. Base path: **`/api/admin/sales/deleted`**.
3. List: `GET /api/admin/sales/deleted/leads` (newest deleted first).
4. Presets (7d/30d/90d): compute `start`/`end` client-side; no backend preset enum.
5. CRM writes reuse the same `admin_sales_leads` row as live (history carries over by `userId`).

---

## 3) Auth & permissions

Same as live sales (`ROLE_ADMIN` / staff sales roles). Claim, release, assign, and write rules are unchanged — see live contract §8.

---

## 4) Endpoint catalog

Base: `/api/admin/sales/deleted`

| Method | Path | Notes |
|--------|------|--------|
| GET | `/leads` | List/search deleted archives + CRM |
| GET | `/follow-ups` | `bucket=due_today\|overdue\|upcoming` |
| GET | `/leads/{userId}` | Detail from archive + CRM |
| POST | `/leads/{userId}/claim` | |
| POST | `/leads/{userId}/release` | |
| PATCH | `/leads/{userId}/status` | Body: `UpdateSalesStatusRequest` |
| PATCH | `/leads/{userId}/note` | Body: `UpdateSalesNoteRequest` |
| PATCH | `/leads/{userId}/follow-up` | Body: `UpdateSalesFollowUpRequest` |
| PATCH | `/leads/{userId}/assign` | Body: `AssignSalesLeadRequest` |
| GET | `/leads/{userId}/activities` | |
| GET | `/leads/{userId}/communications` | |
| POST | `/leads/{userId}/communications` | Body: `CreateAdminSalesCommunicationRequest` |
| GET | `/conversions` | Subscribed archives only; scoped to deleted |
| GET | `/agents/performance` | Metrics only for deleted `userId`s |
| GET | `/summary` | Deleted-scoped cards |
| POST/GET/PATCH/DELETE | `/saved-views` | Scope fixed to `DELETED` |

Request bodies match live sales. Response list/detail types are **deleted-specific** (include deletion timestamps).

### `GET /leads` query params

Same as live **except**:

- **No `accountStatus`** (everyone is archived).
- `start` / `end` filter **`deletionAt`** = `$ifNull(softDeletedAt, purgedAt)`.
- Profile filters apply to **embedded** `profile.*` (`profileStatus`, `subscribed`, `verifiedProfile`, `basicDetails.*`, income on `careerEducation.incomePerYearUsd`).
- `query` matches `userId`, `profile.memberId`, `profile.phone`, `profile.basicDetails.fullName`.
- Default sort: `deletionAt` desc. `sort=leadScore` re-sorts the page by score client-side after fetch (same pattern as live).

Other params unchanged: `status`, `followUpStart`/`followUpEnd`, `assignedToAdminId`, `assignedToMe`, `pool`, `page`, `size`, gender/city/state/birthYear/`minIncomeBandId`, etc.

### Deletion date presets (client)

```ts
function deletionRange(days: 7 | 30 | 90): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  return { start: start.toISOString(), end: end.toISOString() };
}
```

---

## 5) Response examples

### List item (`AdminDeletedSalesLeadSummary`)

```json
{
  "userId": "user-123",
  "memberId": "QALBI001",
  "phone": "+9198xxxxxxx",
  "fullName": "Aisha Khan",
  "gender": "FEMALE",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "createdAt": "2025-11-01T08:00:00.000Z",
  "profileStatus": "APPROVED",
  "accountStatus": "DELETED",
  "subscribed": false,
  "salesStatus": "CALL_REMAINING",
  "note": null,
  "followUpAt": null,
  "lastCalledAt": null,
  "assignedToAdminId": null,
  "claimedAt": null,
  "outcomeReason": null,
  "convertedAt": null,
  "leadScore": 42,
  "incomeLabel": "₹10–15 LPA",
  "incomePerYearUsd": 14000,
  "updatedAt": null,
  "softDeletedAt": "2026-08-01T12:00:00.000Z",
  "purgedAt": "2026-09-01T12:00:00.000Z",
  "deletionAt": "2026-08-01T12:00:00.000Z"
}
```

`deletionAt` is the resolved value used for filtering/sorting (`softDeletedAt` if present, else `purgedAt`).

### Detail (`AdminDeletedSalesLeadDetailResponse`)

Includes full embedded `profile` (from archive), CRM fields (same as live detail), plus:

- `softDeletedAt`, `purgedAt`, `deletionAt`
- `authCreatedAt` (from archive; auth row may be gone)
- `otpVerified` / login timestamps may be false/null when auth was purged
- `signupAt` mirrors `authCreatedAt` when available

---

## 6) Saved views

Deleted dashboard CRUD uses **`scope=DELETED`** automatically (not sent by client). Live dashboard views stay `LIVE` (legacy rows without `scope` count as live). Views never cross-list between dashboards.

Response row includes `scope`: `"LIVE" | "DELETED"`.

---

## 7) TypeScript types

```ts
export type AdminSalesViewScope = "LIVE" | "DELETED";

export interface AdminDeletedSalesLeadSummary {
  userId: string;
  memberId?: string | null;
  phone?: string | null;
  fullName?: string | null;
  gender?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  createdAt?: string | null;
  profileStatus?: string | null;
  accountStatus?: string | null;
  subscribed: boolean;
  salesStatus: string;
  note?: string | null;
  followUpAt?: string | null;
  lastCalledAt?: string | null;
  assignedToAdminId?: string | null;
  claimedAt?: string | null;
  outcomeReason?: string | null;
  convertedAt?: string | null;
  leadScore: number;
  incomeLabel?: string | null;
  incomePerYearUsd?: number | null;
  updatedAt?: string | null;
  softDeletedAt?: string | null;
  purgedAt?: string | null;
  deletionAt?: string | null;
}

export interface AdminDeletedSalesLeadSearchResponse {
  items: AdminDeletedSalesLeadSummary[];
  page: number;
  size: number;
  total: number;
}

export interface AdminSalesSavedViewSummary {
  id: string;
  ownerEmployeeId: string;
  name: string;
  filtersJson: string;
  scope: AdminSalesViewScope;
  createdAt: string;
  updatedAt: string;
}
```

---

## 8) FAQ

**Q: Soft-deleted users still in `user_profiles`?**  
A: Stay on **live** sales (`accountStatus=DELETED`). This API is **purged archives only**.

**Q: Does CRM reset when purged?**  
A: No. Same `admin_sales_leads` document keyed by `userId`.

**Q: Can we restore a purged account from this API?**  
A: No — out of scope.

**Q: Why skip subscription auto-convert?**  
A: Archive profile is a snapshot; live subscription may no longer exist.
