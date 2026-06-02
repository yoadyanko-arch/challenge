# Design: Card Generation Fix, Difficulty Spread, Learning Diary

Date: 2026-05-31

## 1. Card Generation Bug Fix

### Problem
`lib/claude/generate.ts` calls `JSON.parse(text)` directly on Claude's response. Claude occasionally wraps JSON in markdown code blocks (` ```json ... ``` `), causing a parse failure that breaks the entire batch.

### Solution

**`extractJSON(text: string): string`** — a small helper added to `generate.ts` that:
1. If the text contains a markdown code block (` ```json ` or ` ``` `), extract only the content between the fences.
2. Otherwise return the text as-is.

`generateCard` passes its response through `extractJSON` before `JSON.parse`.

**`generateBatch`** switches from `Promise.all` to `Promise.allSettled`, filters out rejected entries, and returns only successful cards. The batch route (`/api/cards/generate`) reports `created` from the successful subset rather than failing entirely.

---

## 2. Difficulty Level Spread

### Problem A — Admin generate page
`/admin/generate` sends a single `difficulty_level` for the whole batch, so all N cards share the same level.

### Fix A
A batch always generates exactly **10 cards — one per difficulty level (1, 2, 3, … 10)**. The count selector is removed from the admin generate UI. `generateBatch` receives the fixed levels array `[1,2,3,4,5,6,7,8,9,10]` and calls `generateCard` once per level concurrently (rate-limited to 3 at a time). Each card gets its own `difficulty_level` and corresponding `xp_reward = level * 10`.

### Problem B — Game route
`/api/cards/game` uses `ORDER BY difficulty_level ASC`, so players always see the easiest available cards.

### Fix B
Replace the ascending difficulty order with `ORDER BY random()` (Postgres `RANDOM()` via `.order('random()')` or a raw query) so sessions have natural difficulty variation.

---

## 3. Learning Diary

### Overview
After a game session, players can open a personal learning diary for that session. The diary shows a structured list of everything they studied plus a short AI-generated narrative summary in Hebrew. The diary is accessible from both the post-game screen and the profile history.

### Database Change
Add column to `learned_sessions`:
```sql
ALTER TABLE learned_sessions ADD COLUMN ai_summary TEXT;
```
Nullable. Populated on first diary load.

### New API: `POST /api/sessions/[id]/summary`
- Auth: requires logged-in user, validates the session belongs to them.
- Checks if `ai_summary` already exists → if so, returns it immediately (idempotent).
- Otherwise: sends `cards_data` to Claude (model: `claude-sonnet-4-6`) with a prompt asking for a 2–3 sentence Hebrew narrative summary of what the user learned.
- Saves the result to `learned_sessions.ai_summary` via service client.
- Returns `{ summary: string }`.

**Claude prompt structure:**
```
You are writing a brief Hebrew learning diary entry.
The user just completed a Mastermind session on: {pillar} / {topic}.
They studied these cards: {card titles + explanations}.
Write 2–3 sentences in Hebrew summarising what they learned today, as if writing in their personal diary. Be warm and specific.
```

### New Page: `app/(app)/diary/[id]/page.tsx`
Client component. On mount:
1. Fetches session data from Supabase directly (user must own the session).
2. If `ai_summary` is present → render immediately.
3. If not → POST to `/api/sessions/[id]/summary`, show loading skeleton, then render when resolved.

**Page layout (Hebrew, RTL):**
```
─────────────────────────
  [pillar label] › [topic]   [date]
─────────────────────────
  [AI summary paragraph — 2-3 sentences]
─────────────────────────
  For each card:
    ✓/✗/📖  [Card title]        +XP
             [Full explanation]
             [Correct answer if wrong]
─────────────────────────
  [חזור לפרופיל]
```

### SessionSummary changes
After the user clicks "שמור בפרופיל" and the save succeeds:
- The existing "שמור בפרופיל" button turns into a success state (already does).
- A new button appears: **"פתח יומן למידה →"** that `router.push`es to `/diary/[session-id]`.

### LearnedSessionCard changes
Each session card in the profile page gains a small **"יומן"** link button that routes to `/diary/[session-id]`.

### Data flow
```
[GameSession] → onComplete(results, score)
    ↓
[SessionSummary] → POST /api/sessions → { id }
    ↓ (on save success)
"פתח יומן" button → navigate to /diary/[id]
    ↓
[Diary page] → if no ai_summary → POST /api/sessions/[id]/summary → Claude → save → render
```

---

## Files Changed / Created

| File | Change |
|------|--------|
| `lib/claude/generate.ts` | Add `extractJSON`, fix `generateBatch` with `allSettled`, distribute difficulty levels |
| `app/api/cards/generate/route.ts` | Pass level array to `generateBatch` |
| `app/api/cards/game/route.ts` | Order by random instead of difficulty_level ASC |
| `components/game/SessionSummary.tsx` | Add "פתח יומן" button post-save, accept and store session ID |
| `components/game/LearnedSessionCard.tsx` | Add "יומן" link button |
| `app/(app)/diary/[id]/page.tsx` | **New** — diary client page |
| `app/api/sessions/[id]/summary/route.ts` | **New** — AI summary generation endpoint |
| Supabase migration | `ALTER TABLE learned_sessions ADD COLUMN ai_summary TEXT` |
