# Vehicle Telemetry — Frontend (Phase 2)

React + Vite SPA. Auth via httpOnly JWT cookies, role-based routing, dark mode, dynamic time-range filters.

## Run

```bash
npm install
npm run dev
```

Opens at http://localhost:5173. Vite proxies `/api/*` → `http://localhost:8082` (the Spring Boot backend).

## Seeded credentials (after backend reseed)

- **admin@telemetry.io / admin123** — sees global fleet + admin analytics
- **client1@telemetry.io / client123** — owns 4 vehicles
- **client2@telemetry.io / client123** — owns 3 vehicles
- **client3@telemetry.io / client123** — owns 3 vehicles

## Routes

| Path | Access | Description |
|---|---|---|
| `/login`, `/signup` | public | Auth |
| `/` | any auth | Fleet overview (CLIENT: cards / ADMIN: global table) |
| `/vehicles/:id` | any auth | Single-vehicle drill-down |
| `/compare` | any auth | Multi-vehicle comparison |
| `/engine-health` | any auth | Temperature monitoring |
| `/admin/analytics` | ADMIN only | System stats + global fleet |

## Auth flow

1. Browser POSTs to `/api/auth/login` with `withCredentials: true`
2. Backend sets `Set-Cookie: auth_token=<jwt>; HttpOnly; SameSite=Lax`
3. All subsequent axios calls auto-send the cookie; backend's `JwtAuthFilter` reads it
4. On page reload, `AuthContext` calls `/api/auth/me` to restore session

## Theme

`ThemeContext` toggles a `dark` class on `<html>`. Tailwind's `dark:` variants pick it up. Persisted in `localStorage` under `vt-theme`.
