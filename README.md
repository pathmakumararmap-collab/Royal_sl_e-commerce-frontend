# Royal SL Frontend

Production-ready storefront and admin panel for the Royal SL Ecommerce System, built against the Royal SL Laravel REST API.

## Stack

- **Next.js 15** (App Router, TypeScript, React Server Components)
- **Tailwind CSS v4** with a hand-built shadcn/ui component library (OKLCH design tokens, light/dark mode via `next-themes`)
- **Zustand** for client state (auth session, wishlist, admin campaign planner)
- **TanStack Query v5** for all server state, with a centralized query-key factory
- **React Hook Form + Zod** for every form
- **TanStack Table v8** for admin data tables
- **Recharts** for admin reports/analytics charts
- **Framer Motion** for landing-page animation
- **Axios** API client with Bearer-token and guest-cart-token interceptors

## Project structure

```
src/
  app/
    (storefront)/       Public storefront — landing, categories, products, search, wishlist, cart, checkout
    (auth)/              Login / register
    dashboard/           Customer account area (orders, invoices, notifications, wallet, coupons, addresses, profile, settings)
    admin/               Staff admin panel (dashboard, POS, catalog, orders, inventory, reports, marketing, access control, settings)
  components/
    ui/                  Hand-built shadcn/ui primitives
    shared/              Cross-cutting components (DataTable, PageHeader, StatCard, EmptyState, ErrorState, ConfirmDialog, ...)
    storefront/ customer/ admin/ auth/   Feature-scoped components
  hooks/                 TanStack Query hooks, one file per domain
  lib/
    api/                 Axios client, per-domain API services, form-data/multipart helper
    validators/          Zod schemas
    constants/           Site config, API endpoint map, admin nav
    format.ts            Currency/date/number formatting helpers
  store/                 Zustand stores (auth, wishlist, ui, campaigns)
  types/                 TypeScript types mirroring the Laravel API resources
```

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   Point `NEXT_PUBLIC_API_URL` at a running instance of the Royal SL Laravel backend.

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Production build**
   ```bash
   npm run build
   npm run start
   ```

## Verification

```bash
npx tsc --noEmit   # type-check
npx eslint .       # lint
npx next build     # production build
```

All three must pass with zero errors before shipping a change.

## Seeded accounts (against the reference backend)

| Role | Email | Password |
|---|---|---|
| Admin | admin@royalsl.test | password |
| Manager | manager@royalsl.test | password |
| Warehouse manager | warehouse@royalsl.test | password |
| POS cashier | cashier@royalsl.test | password |
| Customer | customer@royalsl.test | password |

## Notable scope decisions

A few features in the original spec have no corresponding backend concept. Rather than fabricate fake data or leave placeholders, these were implemented as honest, fully-functional adaptations:

- **Wishlist** — client-only, persisted to `localStorage` (no backend wishlist endpoint).
- **Wallet** (customer dashboard) — derived from real order `paid_amount`/`total_amount` fields rather than a stored balance (no wallet endpoint).
- **Coupons** (customer dashboard) — informational page, since coupon codes are validated server-side at checkout rather than listed to customers.
- **Flash Sale** (admin) — built on top of the existing Coupon system (a product-scoped, short-lived coupon *is* a flash sale); no separate backend entity was introduced.
- **Campaigns** (admin) — a genuine, fully-functional client-only planner (Zustand + `localStorage`), since the backend has no campaign concept at all.
- **Invoices / Customers** (admin) — derived views over the existing Orders/Users endpoints rather than dedicated endpoints that don't exist.

## Design system

Full design tokens live in `src/app/globals.css` (OKLCH color scale, brand primary/accent, semantic success/warning/info tokens, chart palette, sidebar tokens). Every shadcn/ui component under `src/components/ui/` was hand-written from Radix primitives to match.
