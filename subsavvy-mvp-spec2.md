# Subsavvy — MVP Technical Spec

## Mission
Make every streaming dollar earned. Show people every service side-by-side, identify where they're overpaying or overlapping, and tell them exactly what to cancel and why. Long-term: automate the optimization entirely.

## Differentiation (why this isn't just another tracker)
Subscription trackers (Rocket Money) and streaming price/availability comparison tools (JustWatch, Reelgood) already exist — the catalog and the tracker UI are commodity features. The actual moat is recommendation quality: how well the overlap engine and value scoring predict what someone should realistically cancel. Engineering time should be weighted toward Phase 1's overlap/recommendation logic, not toward polishing UI that competitors already have solved.

## Core Constraint (read this first)
No streaming platform (Netflix, Hulu, Disney+, Max, Paramount+, Peacock, etc.) exposes a public API for account login, watch history, or subscription management. Design around self-reported data and licensed third-party content data — not live account scraping. This is a permanent constraint of the space, not a temporary gap to fix later.

## Tech Stack
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS
- Backend/DB: Supabase (Postgres + Auth + Row Level Security)
- Hosting: Vercel
- External data: TMDB API (titles + watch-provider availability by region)
- Payments (Phase 2+): Stripe

## Data Model

**services** — master catalog
id, name, logo_url, plan_name, monthly_price, value_score (manually maintained, update a few times/year)

**user_subscriptions** — a user's own tracked subs
id, user_id, service_id, monthly_cost, renewal_date

**titles** — synced from TMDB
id, tmdb_id, name, type (movie/show), genre_ids

**title_availability** — synced from TMDB watch-providers endpoint
id, title_id, service_id, region

**watch_log** — self-reported or CSV-imported
id, user_id, title_id, service_id, watched_at, source (manual / csv_import / trakt_sync)

Auth/user table is handled by Supabase Auth directly.

## Phased Roadmap

### Phase 1 — MVP (build this first)
- Auth (signup/login)
- My Subs: add/edit/delete a subscription, auto-computed monthly spend
- Watched Content log: manual entry + CSV import (Netflix and others let users export viewing history — use this as a low-friction onboarding path instead of typing every show)
- TMDB seed script: pull popular titles + US watch-providers into title_availability
- Compare page: services catalog + value scores
- Overlap engine: compute % of a user's watched titles on Service A that are also available on Service B (plain SQL/set logic, no AI needed)
- Recommendation card: "Cancel X — Y% of what you watch there is also on Z"
- Billing calendar: renewal-date tracking + reminders

### Phase 2 — Refinement
- "Similar to what you watched" suggestions via TMDB genre/similar-title data
- Smarter value scoring
- Optional: Claude API call to generate the recommendation copy dynamically
- Trakt.tv API integration as a second low-friction watch-log import path (many users already track viewing history there) — complements CSV import, reduces manual typing further
- Stripe integration for a premium tier
- Affiliate/referral revenue: commission on service sign-ups or switches surfaced by recommendations — a second monetization path alongside the premium tier

### Phase 3 — The bigger vision (business dev, not just code)
- Auto-cancel/auto-activate requires official partnerships with the platforms — none expose this programmatically today
- Avoid credential-storage/browser-automation routes: security liability, likely ToS violation, fragile to UI changes
- Pursue only after Phase 1/2 traction gives leverage to approach platforms

## Build Order (feed to Claude Code one step at a time)
1. Scaffold Next.js + Tailwind project, connect Supabase
2. Migrate schema above
3. Build auth
4. Build My Subs CRUD page
5. Write TMDB seed script
6. Build Watched Content log (manual entry first, CSV import as fast-follow)
7. Build overlap/recommendation query engine
8. Build Compare page
9. Build billing calendar + reminders
10. Theme + deploy to Vercel
