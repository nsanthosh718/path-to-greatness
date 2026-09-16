# FamilyBoard

A Skylight-style family calendar for the kitchen wall: a daily schedule per kid,
chore charts with points, a weekly calendar, and a rewards store — all synced
live across every device (a wall-mounted tablet, your phone, a laptop) via
Supabase.

## What's included

- **Today view** (`/kid/[slug]`) — each kid's time-blocked schedule for today,
  with the current activity highlighted, plus their chore checklist and point
  balance. Layout scales up for younger kids (bigger icons, less text).
- **Weekly calendar** (`/week`) — the whole family's week at a glance,
  color-coded per person.
- **Rewards store** (`/rewards`) — kids spend earned points on rewards you
  define; redemption is disabled until they can afford it.
- **Parent Admin** (`/admin`) — edit names, the daily schedule, chores, and
  rewards. No separate login — it's meant for a trusted home network.

## Made for kids to love

- **Sunny** — a hand-animated mascot (plain SVG + Framer Motion, no external
  Lottie/CDN asset) that waves hello, bobs idly, and jumps for joy when a kid
  finishes their chores or redeems a reward. Fully offline-safe, since a wall
  tablet shouldn't depend on a CDN staying up.
- **Confetti** (`canvas-confetti`) — a small burst right where a kid tapped
  when they check off a chore, and a big two-corner celebration when they
  finish *everything* for the day or redeem a reward.
- **Springy motion everywhere** (`framer-motion`) — bouncy checkboxes, a
  staggered card entrance on every page, a pulsing glow around the "Now"
  activity, a shake if you tap a reward you can't afford yet, and a soft
  fade between pages.
- **Fredoka** — a playful, rounded Google Font (self-hosted via
  `next/font`, no runtime CDN dependency) used for headings and buttons.

Everything updates live: when a kid checks off a chore on the wall tablet, the
point balance and rewards store update instantly on your phone too, via
Supabase Realtime.

## The schedule is a draft — edit it

`supabase/seed.sql` seeds a template daily schedule for a 5-year-old and a
10-year-old (wake/school/chores/homework/play/bedtime, weekday and weekend
variants), starter chores, and a rewards catalog. **These are placeholders** —
edit real school hours, activities, and house rules from the Admin screen (or
directly in the Supabase table editor) before relying on it day to day.

## Setup

1. **Create a free Supabase project** at [supabase.com](https://supabase.com).
2. In the project's SQL editor, run `supabase/schema.sql`, then
   `supabase/seed.sql`.
3. In Supabase, go to Project Settings → API and copy the **Project URL** and
   **anon public key**.
4. Copy `.env.local.example` to `.env.local` and fill in those two values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Install dependencies and run the dev server:
   ```
   npm install
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000).

## Deploying for real (the wall tablet)

Deploy to [Vercel](https://vercel.com) (free tier is plenty for this):

1. Push this repo to GitHub and import it in Vercel, or run `npx vercel`.
2. Add the same two `NEXT_PUBLIC_SUPABASE_*` environment variables in the
   Vercel project settings.
3. Open the deployed URL in the tablet/browser you'll leave mounted on the
   wall, and consider pinning it as a full-screen "app" (most tablet browsers
   support "Add to Home Screen").

## Security note

This app intentionally has **no login screen** — it's designed to run on a
shared device on your home network, like Skylight. The database's Row Level
Security policies (in `schema.sql`) are permissive for the anon key so the
app works out of the box. If you deploy it somewhere reachable from outside
your home (rather than just loading it on devices at home), tighten those
policies — e.g. require a Supabase Auth session, or put the deployment behind
a private network or basic auth — before relying on it.

## What's verified vs. not

Verified in this environment: production build (`npm run build`), typecheck,
lint, and manual rendering/interaction checks (schedule, "now" highlighting,
chore toggling, points, rewards affordability, weekly grid, admin CRUD forms)
against mocked Supabase responses in a real browser. **Not verified**: the
actual live Supabase project (schema, RLS policies, realtime sync across two
real devices) — that requires your own project, which this session doesn't
have credentials for. Follow Setup above and sanity-check the first few
interactions once it's connected.

## Project structure

```
app/
  page.tsx            Home / kid picker
  kid/[slug]/page.tsx Per-kid Today view
  week/page.tsx        Weekly calendar
  rewards/page.tsx     Rewards store
  admin/page.tsx        Parent admin (schedule/chores/rewards editor)
components/            Shared UI (schedule timeline, chore checklist, etc.)
lib/                    Supabase client, types, date helpers, data hooks
supabase/
  schema.sql            Tables, view, RLS policies, realtime publication
  seed.sql               Draft schedule/chores/rewards template
```
