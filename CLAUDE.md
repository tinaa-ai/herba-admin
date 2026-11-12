# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Next.js 16 (App Router, Turbopack, `cacheComponents` on), React 19, Tailwind v4, TypeScript. Internal admin tool for 레우비스 (HERBA). UI text is Korean; reply to the user in Korean.

## Commands

```bash
npm run dev          # dev server on :3000 (needs .env.local with ADMIN_PASSWORD)
npm run build        # production build; also catches prerender errors dev only warns about
npm run lint         # eslint
npx tsc --noEmit     # type check
```

There is no test suite. Verify changes with `tsc`, `lint`, `build`, and by loading the page in a browser (log in with the password from `.env.local`).

If `tsc` complains about missing modules under `.next/types` after deleting or moving a route, run `npx next typegen`.

The dev server does not pick up edits to `src/app/globals.css` (color tokens stay stale); restart it after changing that file.

## Architecture

- **Auth gate**: `src/proxy.ts` (Next 16's name for middleware) runs on every request and redirects to `/login` unless the `herba_session` cookie matches an HMAC derived from `ADMIN_PASSWORD` (`src/lib/auth.ts`). Login/logout are server actions in `src/app/login/actions.ts`. Changing the password logs everyone out. Anything that must load before login (icons, `/products/*` images) has to be excluded in the proxy `matcher`.
- **Pages** set only a short `metadata.title`; the root layout's template turns it into `HERBA | <title>`. Add new top-level pages to the `tabs` array in `src/components/TabNav.tsx`; an entry with `items` is a group tab that opens a dropdown (the "가격 분석" group holds `/unit-price` then `/competitors`). `/` redirects to `/unit-price` via `next.config.ts` (a `redirect()` inside a page errors under cache components).
- **Under `cacheComponents`**, reading `searchParams`/`cookies` in a server page outside `<Suspense>` errors at prerender. The login page reads `next` client-side with `useSearchParams` inside `<Suspense>` for this reason.
- **Styling**: colors are CSS variables in `globals.css` (light + `prefers-color-scheme: dark`) exposed as Tailwind colors via `@theme inline` (`bg-surface`, `text-muted`, `bg-hero`, `text-sale`, …). Add new colors there in both modes rather than hard-coding hex values.

## Competitor price data

`/competitors` renders entirely from `src/data/competitor-prices.ts`; updating prices means editing that file only. `src/lib/competitors.ts` derives the numbers on the server, and the client component `src/app/competitors/CompetitorTable.tsx` shows one summary row per product that expands into its channel-by-channel price list:

- Rows are sorted by unit price (price ÷ `units` for bundles), high to low; USD rows go last.
- Discount amount/% are always against that product's `listPrice`. Prices above list are shown as "정가보다 X% 비쌈".
- 10mL당 is computed from `volumeMl`; leave `volumeMl` out when unknown and the column shows "—".
- "최저 확인가" ignores KRW rows tagged with anything in `EXCLUDED_FROM_LOWEST` (면세, 과거 가격, 비교 제외, 품절).
- When the source doesn't state a list price, the official/store selling price is used as `listPrice` and `listPriceNote` says so.
- Product photos live in `public/products/<id>.jpg` (320×320, cropped from the user's screenshots).

Naver shopping/brand-store domains are blocked for automated browsing; the user sends screenshots of prices instead.

## Deploy

GitHub `tinaa-ai/herba-admin` → Vercel project `herba-admin` (https://herba-admin.vercel.app). Pushing `main` deploys production; other branches get preview URLs. Work has been done on `feat/competitor-comparison` and fast-forwarded into `main`. `ADMIN_PASSWORD` is set in Vercel for Production and Preview; changing it requires a redeploy.

