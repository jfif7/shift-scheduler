# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Shift Scheduler (醫院人力排班系統) — a hospital staff shift-scheduling app. A Next.js
frontend lets users define employees, scheduling constraints, and per-shift staffing
requirements, then generates a monthly schedule with one click and exports it. UI is
bilingual (zh-TW default, en) via `next-intl`.

The repo has two independently deployed halves:

- **Frontend** (`src/`) — Next.js static export, deployed to GitHub Pages.
- **Server** (`server/`) — FastAPI + Google OR-Tools CP-SAT solver, deployed to Cloud Run / Docker.

## Commands

### Frontend

```bash
npm run dev      # Next dev server (turbopack)
npm run build    # Static export to dist/ (also touches dist/.nojekyll)
npm run lint     # next lint (ESLint 9)
npm run deploy   # Publish dist/ to GitHub Pages via gh-pages
```

There is no frontend test runner configured.

### Server (Python)

```bash
conda activate scheduler            # Required before any Python work in this repo
cd server
python main.py                      # Run API locally (port 8211, or $PORT)
pytest                              # Run all server tests
pytest tests/test_solver.py         # Single test file
pytest tests/test_solver.py::test_name   # Single test
```

Docker / full local stack (API + Prometheus + Cloudflare tunnel):

```bash
cd server/deployment && docker compose up
```

## Architecture

### Three scheduling algorithms, one interface

Schedule generation is the core feature, with three interchangeable backends selected in
`src/hooks/useScheduleGeneration.ts`:

1. **CP-SAT** (`src/services/scheduleAPI.ts` → FastAPI server `server/services/cp_sat_solver.py`) — the preferred, highest-quality solver. Requires the server to be reachable.
2. **Simulated annealing** (`src/utils/algo/simulatedAnnealing.ts`) — local, browser-only.
3. **Genetic** (`src/utils/algo/genetic.ts`) — local, browser-only.

`preferredAlgorithm: "auto"` (the default) probes the CP-SAT server via `testConnection()`;
if reachable it uses CP-SAT, otherwise it falls back locally — simulated annealing when
`shiftsPerDay === 1`, genetic otherwise. CP-SAT runtime errors/timeouts also fall back to a
local algorithm. The server URL comes from `NEXT_PUBLIC_SCHEDULER_API_URL` (see `.env.example`).

Each algorithm operates on its own optimized internal representation (`OptimizedScheduleSA`
is a flat `number[]` of employee indices; `OptimizedScheduleGenetic` is a `boolean[][]`),
then converts back to the canonical `Schedule` type. Slot math for variable per-shift
staffing lives in `getShiftSlotRange` / `getTotalSlotsNeeded` in `src/types/schedule.ts` —
reuse these helpers rather than recomputing offsets.

`src/types/schedule.ts` is the source of truth for domain types (`Employee`, `Constraint`,
`Schedule`, `ScheduleSettings`, `ScheduleItem`). The server mirrors these in
`server/models/schedule_models.py` using **snake_case** field names; `scheduleAPI.ts`
contains the camelCase↔snake_case adapter layer. When changing a domain field, update all
three: TS types, the API adapter, and the Python models.

### State & persistence (hybrid storage)

- **Anonymous users**: all data in `localStorage`.
- **Authenticated users** (Google OAuth via Firebase): data in Firestore (`src/services/firestoreAPI.ts`, `src/contexts/AuthContext.tsx`).
- On first login, `localStorage` data is migrated to Firestore then cleared (`src/utils/dataMigration.ts`).

App state is composed from hooks in `src/hooks/` rather than a global store —
`useScheduleData` (schedule history + active schedule + settings), `useEmployeeManagement`,
`useConstraintManagement`, `useScheduleGeneration`, `useServerConnection`,
`useCollapsibleLayout`. `src/app/page.tsx` wires them together. See `docs/datastore.md` for
the full Firestore data model and `docs/googleAuth.md` for auth setup.

### View system

The generated schedule renders through a pluggable view layer in
`src/components/schedule/`: `ViewRenderer` dispatches to views (`views/CalendarView`,
`views/SpreadsheetView`) based on `ScheduleViewType`. View metadata (including
`supportsConstraints`) is declared in `src/types/viewTypes.ts`; `AVAILABLE_VIEWS` controls
which views are exposed. `src/utils/viewAdapters.ts` reshapes the canonical `Schedule` into
per-view data.

### UI stack

Next.js 15 App Router (`output: "export"`, `distDir: "dist"`, `trailingSlash: true` — note
everything is statically prerendered, no server runtime on the frontend), React 19, Tailwind
v4, shadcn/ui components in `src/components/ui/` (Radix primitives), `lucide-react` icons,
`sonner` toasts. Translations live in `messages/{en,zh-TW}.json`; use `useTranslations()` and
translation keys, never hardcoded user-facing strings.

### Server internals

`server/main.py` is the FastAPI app (CORS, Prometheus metrics, request logging). The solver
endpoint is `POST /api/v1/schedule/generate`; health/status are `/health` and
`/api/v1/solver/status`. `server/services/cp_sat_solver.py` builds the OR-Tools CP-SAT model:
`_create_variables`, `_add_constraints` (consecutive-shift, rest-day, weekly limits,
preferences), and `_create_objective` (fairness / weekend-imbalance). On Cloud Run the
container reads `$PORT`; locally it defaults to 8211.

## Conventions

- Prefer functional style in JavaScript/TypeScript.
- Always `conda activate scheduler` before running Python.
- Markdown must be lint-clean: blank lines around headings/lists/code blocks, and a language
  tag on every fenced code block (use `text` for non-code).
