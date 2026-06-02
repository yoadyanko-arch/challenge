# Mastermind — Product Spec

**Date:** 2026-05-07
**Status:** Approved

---

## Vision

A practical intelligence platform where users scroll through smart content instead of social media. The experience mirrors Duolingo — fun, gamified, progress-driven — but focused on real-life wisdom: decision making, business, psychology, and self-mastery.

**Name:** Mastermind

**Tagline:** "גלול ותהיה חכם יותר" — scroll and become smarter.

**Core loop:** Open app → scroll smart cards → answer / reflect → earn XP → maintain streak → level up.

---

## The 4 Pillars

| Pillar | Hebrew | Sub-Topics |
|--------|--------|------------|
| Think | חשיבה | הטיות קוגניטיביות, לוגיקה, סטטיסטיקה, חשיבה מערכתית, היסטוריה |
| People | אנשים | פסיכולוגיה, משא ומתן, תקשורת, מנהיגות, שכנוע |
| עסקים | עסקים | נדל"ן, שוק ההון, יזמות, מכירות, שיווק, מיסוי, קריפטו, אסטרטגיה |
| Self | עצמי | פרודוקטיביות, הרגלים, פילוסופיה, פיננסים אישיים |

### Topic System

Cards carry an optional `topic` tag within their pillar. Users filter by pillar first, then optionally by topic (e.g., "only real estate cards"). This adds depth without breaking the clean 4-pillar navigation.

**Think:** `biases` · `logic` · `statistics` · `systems` · `history`

**People:** `psychology` · `negotiation` · `communication` · `leadership` · `persuasion`

**עסקים:** `real_estate` · `stocks` · `entrepreneurship` · `sales` · `marketing` · `tax` · `crypto` · `strategy`

**Self:** `productivity` · `habits` · `philosophy` · `personal_finance`

---

## Card Types

| Type | Description |
|------|-------------|
| **Concept** | One concept + short explanation + reflection question |
| **Scenario** | Real-life situation + 3–4 options + explanation of best answer |
| **Challenge** | Direct question (logic, economics, psychology) + explained answer |
| **Bias Spotlight** | Bias name + real-life example + how to avoid it |

Each type maps naturally to pillars: Scenario → People, Challenge → Think, Concept → Self, Bias Spotlight → Think.

---

## Screens

### User-Facing
- **Feed** — vertical scroll of cards, filterable by pillar or mixed
- **Card** — content → interaction → XP animation → next card
- **Profile** — streak, total XP, per-pillar progress, badges
- **Leaderboard** — weekly + all-time; friends vs. everyone
- **Friends** — search, add, view others' progress

### Admin (protected route `/admin`)
- **Queue** — AI-generated cards awaiting review
- **Generate** — select pillar + type + difficulty → Claude generates → pending
- **Review** — edit / approve / reject each card

---

## Data Model

```sql
users           id, email, username, avatar_url, streak, xp_total, last_active, created_at
progress        user_id, pillar, xp, cards_completed, level        -- one row per pillar
cards           id, pillar, type, topic (optional), title, content, explanation,
                options jsonb, correct_answer, xp_reward,
                difficulty (easy/medium/hard), status (pending/approved/rejected), created_at
card_history    user_id, card_id, completed_at, was_correct, xp_earned
friends         user_id, friend_id, status (pending/accepted), created_at
badges          id, name, description, icon, condition
user_badges     user_id, badge_id, earned_at
notifications   user_id, type, message, read, created_at
```

---

## Gamification

**XP:** Easy = 10, Medium = 20, Hard = 30. Correct first try = +5 bonus.

**Streak:** Active day = ≥3 cards. Breaks at midnight. Streak Freeze usable once/week.

**Levels:** 1–10 per pillar, plus total XP across all pillars.

**Sample Badges:**
- "ראשון צעד" — first card completed
- "שבוע של חוכמה" — 7-day streak
- "אלוף ביאסים" — 50 Think cards
- "מנהל" — 100 XP in עסקים

**Leaderboard:** Resets every Monday. Separate views: friends / everyone.

**Notifications:**
- Daily reminder (if no activity)
- "A friend passed you"
- New badge earned

---

## Content Pipeline

1. Admin selects pillar + card type + difficulty
2. Request sent to Claude API (claude-sonnet-4-6) with structured prompt template
3. Card created with `status: pending`
4. Admin reviews in queue — edit, approve, or reject
5. Approved cards enter the feed immediately
6. Batch mode: generate 10–20 cards at once

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database + Auth | Supabase (PostgreSQL + Auth + Realtime) |
| AI | Claude API via `@anthropic-ai/sdk` |
| PWA | `next-pwa` |
| Deployment | Vercel |
| Testing | Vitest + React Testing Library |

---

## Folder Structure

```
/app
  /(auth)/login
  /(auth)/register
  /(app)/feed
  /(app)/profile
  /(app)/leaderboard
  /(app)/friends
  /admin/queue
  /admin/generate
/components
  /cards          CardConcept, CardScenario, CardChallenge, CardBias
  /gamification   XPBar, StreakBadge, LevelBadge, BadgeGrid
  /feed           FeedScroller, PillarFilter
  /ui             shadcn components
/lib
  /supabase       client.ts, queries.ts, types.ts
  /claude         generate.ts, prompts.ts
/types            index.ts
```

---

## Implementation Phases

| Phase | Scope |
|-------|-------|
| 1 | Foundations: Next.js setup, Supabase, DB schema, auth |
| 2 | Core Feed: card components, feed scroller, XP interaction |
| 3 | Gamification: streak, levels, badges, profile |
| 4 | Social: friends, leaderboard, notifications |
| 5 | Admin + AI: admin panel, Claude integration, content queue |
| 6 | Polish: PWA, animations, responsive design |

---

## Acceptance Criteria

- [ ] Auth: register, login, logout all work
- [ ] Feed: cards display, pillar filter works, scroll is smooth
- [ ] Card interaction: answer selected → XP animates → next card loads
- [ ] XP + streak update correctly after each session
- [ ] Admin can generate a card, approve it, and it appears in the feed
- [ ] Leaderboard ranks users correctly
- [ ] PWA can be installed from mobile browser
