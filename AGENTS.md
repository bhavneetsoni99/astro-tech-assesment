# AGENTS.md — baseball-stats-dashboard

Two independent apps, no monorepo tooling. Each has its own `Dockerfile` and deps.

## Commands

Run each from its own directory:

| Directory | Command | Purpose |
|-----------|---------|---------|
| `backend/` | `python main.py` | Dev server on `:5001` |
| `backend/` | `RUNNING_BASEBALL_TESTS=TRUE python -m pytest` | Run backend tests against isolated DB |
| `frontend/` | `bun run dev` | Vite dev server on `:3000` |
| `frontend/` | `bun run test` | Vitest (globs `*.test.{ts,tsx}`) |
| `frontend/` | `bun run lint` | ESLint flat config |
| `frontend/` | `bun run build` | `tsc && vite build` |

No formatter, no pre-commit, no CI workflows.

## Test quirks

- **Backend tests** (`backend/tests/test_api.py`): Must set `RUNNING_BASEBALL_TESTS=TRUE` before import (line 5 of test file does this) — switches app to `test_baseball_isolated.db`. Test fixture drops/recreates all tables per function.
- **Frontend tests**: Vitest with jsdom, globals enabled, setup file `src/setupTests.ts`. Tests colocated with source files (same directory).

## Architecture

- **Backend**: Flask factory `backend/app/__init__.py:create_app()`, SQLAlchemy + Marshmallow, blueprint `api` at `/api/v1`. Routes: `health`, `players`, `players/<id>`, `teams`, `positions`, `players_list`, `pitches` (cursor-paginated via `next_cursor`), `pitch_names`.
- **Frontend**: Vite+React 18, React Router 7, CSS Modules. Entry `src/index.tsx`. Vite proxies `/api` → `http://localhost:5001`. `@` alias → `/src`.
- **Wrapper/Presenter pattern**: `*Wrapper` fetches data, `*Controls` is pure UI. Generic `TableComponent` handles sorting/loading/error/pagination.
- **TypeScript**: strict mode, `noUnusedLocals`/`noUnusedParameters`. tsconfig excludes test files.
- **Python**: pyright config expects venv at `backend/.venv`. Python 3.12.

## Conventions

- Tests live next to source files (frontend) or in `tests/` (backend)
- CSS Modules with `.module.css` extension
- React `memo` and `useMemo` used for perf
- Cursor pagination for pitches (not page-based)
- ApiError exception class for returning structured error JSON
- `bun.lock` checked in (intentional, Bun project)
- No `.env` files expected; defaults work with dev proxy
