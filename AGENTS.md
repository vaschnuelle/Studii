# Agents

## Cursor Cloud specific instructions

### Project overview

Studii is a social study-timer web app (React + Vite + Tailwind CSS v4) backed by Firebase (Auth, Firestore, Cloud Functions). It is an npm workspaces monorepo with three packages: `web`, `functions`, and `packages/shared`.

### Running services

| Service | Command | Port | Notes |
|---|---|---|---|
| Vite dev server (web) | `npm run dev` (from repo root) | 5173 | Primary UI |
| Firebase emulators | `firebase emulators:start --project studii-dev` | Auth 9099, Firestore 8080, Functions 5001, UI 4000 | Requires Java; use `--project studii-dev` or any demo project ID |

Start Firebase emulators **before** the Vite dev server so the web app can connect to them.

### Environment configuration

The web app reads Firebase config from `web/.env.local`. For local emulator development, create it with fake credentials and set `VITE_USE_FIREBASE_EMULATORS=true`. See `web/.env.example` for the template.

### Build order

1. `npm run build -w @studii/shared` (shared types)
2. `npm run build -w functions` (Cloud Functions — currently has a pre-existing build error: missing `functions/src/lib/sessionValidation.ts`)
3. `npm run build -w web` (web app — builds independently since it aliases shared source via Vite)

### Lint and test

- **Lint:** `npm run lint` (runs ESLint on the `web` workspace)
- **Build check:** `npm run build -w web` (TypeScript + Vite production build)
- There are no automated test suites configured yet.

### Known issues

- `functions` build fails because `functions/src/lib/sessionValidation.ts` is missing from the repository. The functions emulator loads pre-built JS from `functions/lib/` but won't pick up code changes until this file is created.
- `functions/package.json` uses `"node": ">=20"` as the engine constraint, which the Firebase emulator rejects (it requires an exact major version like `"20"` or `"22"`). Functions won't load in the emulator until this is fixed.
