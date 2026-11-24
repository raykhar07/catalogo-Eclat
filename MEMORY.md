# MEMORY.md — estante. / catalogo-Éclat

## Resumen del proyecto
- Catálogo tipo e-commerce/portafolio: **Express + Prisma (PostgreSQL)** en backend, **React 19 + Vite + Tailwind 4** en frontend.
- Dos `package.json`: raíz (backend/tooling) y `client/` (frontend).
- En producción, Express sirve API y `client/dist` desde el mismo puerto.

## Comandos clave (desde raíz)
- `npm run dev` — backend `:3000` + Vite `:5173` (proxy `/api`).
- `npm run build` — build client + server.
- `npm start` — sirve `dist/server/src/index.js` (prod).
- `npm test` — smoke test API (`scripts/smoke-test.js`, requiere `npm run build`, usa puerto 3111).
- `npm run test:auth` — Jest auth tests.
- `npm run migrate` — Prisma migrate dev.
- `npm run seed` — **destructivo**: borra datos y recarga seed.
- `npm run studio` — Prisma Studio.

## Base de datos / Prisma
- PostgreSQL vía Prisma. `DATABASE_URL` debe ser una conexión Postgres (local Docker, Neon, Supabase, etc.).
- Modelos: `Category`, `Product`, `User`, `Account`, `Order`.
- `User.passwordHash` es opcional (usuarios OAuth). `Account` vincula proveedores (`google`, `github`) con `@@unique([provider, providerAccountId])`.
- Tras cambios en schema: `npm run migrate`; en Docker/prod usar `prisma migrate deploy`.
- Seed: `prisma/seed.ts` lee `scripts/products-export.json` (170 productos). Es destructivo.
- `client/src/types.ts` duplica manualmente tipos; actualizar si cambia el esquema/API.

## Autenticación
- JWT en `localStorage` (`estante-auth-token`), Bearer en API.
- Registro/login email+contraseña: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
- OAuth real (Authorization Code): `/api/auth/google`, `/api/auth/github`, callbacks en `/api/auth/:provider/callback`, confirmación de vínculo en `/api/auth/link/confirm`.
- Si el email OAuth ya existe en un usuario local, se pide **confirmación con contraseña** antes de vincular (decisión de producto).
- Botones OAuth en `client/src/pages/Auth.tsx`; callback UI en `client/src/pages/AuthCallback.tsx`.

## Variables de entorno
Ver `.env.example`. Claves importantes:
- `DATABASE_URL`, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`

**No commitear `.env`**. Rotar secrets si se exponen.

## Docker
- Archivos: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `docker/entrypoint.sh`.
- Imagen multi-stage `node:20-bookworm-slim`; runtime ejecuta `prisma migrate deploy` y arranca `node dist/server/src/index.js`.
- `docker-compose.yml` levanta `db` (Postgres 16) + `app`. Datos de Postgres en volumen `pg_data`.
- Para Docker local, usar `CLIENT_URL=http://localhost:3000`; en prod, usar DB Postgres administrada (Neon/Supabase) y dominio HTTPS real para OAuth callbacks.

## Gotchas
- `ts-node-dev` requiere `--project server/tsconfig.json`.
- `req.query` en Express 4: no reasignar directamente; middleware `validate` usa `Object.defineProperty`.
- Handlers async necesitan `asyncHandler`.
- Respuestas de error: `{ error }` y opcional `{ details: [{campo,mensaje}] }`.
- `Decimal` de Prisma se serializa a `number` en controllers.
- `verbatimModuleSyntax` en client: usar `import type`.
- Seed borra toda la DB.
- En producción, usa PostgreSQL administrado (Neon/Supabase).
