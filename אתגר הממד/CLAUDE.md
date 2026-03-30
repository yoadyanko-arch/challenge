# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-file browser game: **WW3 Checkers** — Trump (player, white) vs Khamenei (AI, black).
Everything lives in `checkers.html` (HTML + CSS + JS, no build step, no dependencies).

## Running the game

Open `checkers.html` directly in a browser. The two image files must be in the same directory:

- `Donald_Trump_official_portrait-removebg-preview.jpg` — white pieces
- `Meeting_of_the_families_of_the_martyrs_of_the_authority_with_the_Leader_of_the_Revolution_on_the_birthday_of_Amir_al-Mu'minin_(peace_be_upon_him)_58_(khamenei.ir,_2026)_(cropped_3)-removebg-preview.jpg` — black pieces

## Architecture (`checkers.html`)

All game logic is inside a single `<script>` block at the bottom of the file.

**Board representation:** 8×8 flat JS array. Piece constants: `EMPTY=0, W=1, B=2, WK=3, BK=4`.
Dark squares only: `(row+col) % 2 === 1`. White (Trump) starts rows 5–7, Black (Khamenei) rows 0–2.

**Key functions:**
- `getJumps(b, r, c, already)` — recursive, returns all complete multi-jump sequences from a square
- `getAllMoves(b, player)` — returns jumps only (mandatory capture) or normal moves if no jumps exist
- `applyMove(b, m)` — returns a new board with the move applied and king promotion handled
- `minimax(b, depth, alpha, beta, maxing)` — standard alpha-beta; positive score = good for AI
- `getBestMove()` — selects AI move; depth varies by `difficulty` and piece count; Easy adds 55% random-move chance
- `initGame()` — resets all state and calls `render()`
- `render()` — rebuilds the board DOM from scratch on every state change
- `doPlayerMove(move)` — applies player's move, checks win, then calls `getBestMove()` via `setTimeout(500ms)`

**Difficulty depths:**

| Level  | Depth (many pieces → few) |
|--------|--------------------------|
| Easy   | 1 (+ 55% random)         |
| Medium | 3 → 4 → 5               |
| Hard   | 5 → 6 → 7               |

## Git

- Remote: `https://github.com/yoadyanko-arch/Challenge`
- User: Yoad Yankowitz / Yoadyanko@gmail.com
- Branch: `main`
