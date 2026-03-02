# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Calico Monitorias is a tutor marketplace platform built as a monolithic Next.js 15 (App Router) application. Students find and book tutors; tutors manage availability via Google Calendar. Stack: React 19, Tailwind CSS v4, shadcn/ui (new-york style, JSX not TSX), Firebase Firestore + Auth, Google Calendar/Drive APIs, Zod validation, Wompi payments.

## Commands

```bash
npm run dev          # Dev server on :3000
npm run build        # Production build
npm run lint         # ESLint (next/core-web-vitals)
npm test             # Jest single run
npm run test:watch   # Jest watch mode
```

## Architecture

### Data Flow (strict layered pattern)

```
React Component → Frontend Service (src/app/services/core/) → fetch('/api/...')
  → API Route Handler (src/app/api/.../route.js)
    → Business Logic Service (src/lib/services/)
      → Repository (src/lib/repositories/)
        → Firebase Firestore
```

### Server vs Client Boundary

- **Server-only** (`src/lib/`, `src/app/api/`): Firebase Admin SDK, repositories, business services, Google APIs, Node.js modules
- **Client-only** (`src/app/components/`, `src/app/services/`, `src/app/hooks/`, `src/app/context/`): Firebase Client SDK, browser APIs, `fetch('/api/...')` calls

Never import `firebase-admin` in client code. Never access server env vars (without `NEXT_PUBLIC_` prefix) from client code.

### Key Conventions

- **Path alias**: `@/` maps to `src/` (defined in `jsconfig.json`)
- **API routes**: Export named `GET`, `POST`, `PUT`, `DELETE` functions. Always `await params` before accessing properties (Next.js 15 requirement).
- **Repositories**: Named exports (not classes), always apply `.limit()` to Firestore queries (default 50). Project has hit Firebase free tier limits.
- **Frontend services**: Class-based singletons exported as instances (e.g., `export const UserService = new UserServiceClass()`)
- **Components**: Co-located with CSS files in folders (e.g., `Header/Header.jsx` + `Header/Header.css`)
- **shadcn/ui**: Installed to `src/components/ui/`, configured with `tsx: false`, lucide-react icons
- **i18n**: Custom `I18nProvider` with `useI18n()` hook providing `t()`, default locale is `es` (Spanish), translations in `src/lib/i18n/locales/`
- **Auth**: Firebase Client SDK auth → idToken in localStorage → `Authorization: Bearer <token>` header → Admin SDK verification server-side
- **Validation**: Zod at API boundaries

### Firestore Collections

`users` (role: tutor|student), `tutoring_sessions`, `availability`, `course`, `major`, `slot_bookings` — note mixed naming conventions (singular vs plural, underscores vs camelCase).

## Critical Rules

1. **Always add `.limit()` to Firestore queries** — never pull entire collections
2. **Filter on server, not client** — never fetch all docs then filter in JS
3. **Prefer IDs over emails** for references (`tutorId` not `tutorEmail`) — legacy code mixes both
4. **Await params in API routes**: `const resolvedParams = await params; const { id } = resolvedParams;`
5. **Follow existing layered architecture** — don't skip layers (e.g., don't call repositories from API routes directly)
6. **Minimize code** — smallest possible change, no unnecessary wrappers, delete unused code

## Related Documentation

- [AGENT.md](AGENT.md) — Comprehensive developer and AI assistant guide
- [API_ENDPOINTS.md](API_ENDPOINTS.md) — API reference
- [MONOLITH_ARCHITECTURE.md](MONOLITH_ARCHITECTURE.md) — Architecture details
