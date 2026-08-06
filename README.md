# Qalbi Sales SPA

Standalone sales-only web app for Qalbi staff (`SALES_AGENT`, `SALES_MANAGER`, `SUPER_ADMIN`). Pixel-parity with the Sales section of the admin panel.

## Setup

```bash
npm install
cp .env.example .env
```

Set `VITE_ADMIN_API_BASE_URL` to your API origin (leave empty for same-origin proxy/rewrite).

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm test         # Vitest
```

## Routes

| Route | Page |
|-------|------|
| `/login` | Staff sign-in |
| `/leads` | Leads list |
| `/leads/:userId` | Lead detail |
| `/follow-ups` | Follow-up queue |
| `/conversions` | Conversions |
| `/performance` | Agent performance (hidden for sales agents) |

## Roles

- **Sales agents** should use Pool / My leads presets; Performance nav is hidden.
- **Sales managers+** can assign leads and view all filters including Performance.

## API

See [doc.md](./doc.md) for the full `/api/admin/sales/**` contract.

## Deploy

Vercel SPA rewrite is configured in `vercel.json`. Set `VITE_ADMIN_API_BASE_URL` in project environment variables.
