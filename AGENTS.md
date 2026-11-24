# AGENTS.md

Proyecto `estante.`: catálogo de productos. Backend Express + Prisma (PostgreSQL) y frontend React + Vite + Tailwind 4. Dos `package.json` distintos (raíz = backend, `client/` = frontend).

## Propósito

Proyecto de aprendizaje y portafolio: demostrar uso de Prisma como ORM dentro de una aplicación web completa. Evolucionó de una prueba mínima de Prisma (un solo script que creaba un producto) a un catálogo tipo e-commerce con dos caras:

- **Público** (`/`): lista productos con búsqueda, filtro por categoría y precio, orden, paginación y vista de detalle.
- **Admin** (`/admin`): CRUD de productos y categorías. Sin autenticación a propósito: es un CRUD simple, no una tienda real.

Lo que NO tiene (y no debe "inventarse" sin que se pida): carrito, pagos, usuarios/login, envíos ni subida de archivos (las imágenes son URLs externas).

## Comandos (ejecutar desde la raíz, con npm de la raíz)

- `npm run dev` — backend en :3000 y Vite en :5173 (proxy de `/api` → :3000). No existe `npm run dev` dentro de `client/` salvo `npm run dev --prefix client`.
- `npm test` — smoke test de la API (`scripts/smoke-test.js`, 29 comprobaciones, sin framework). **Exige `npm run build` antes** porque arranca `dist/server/src/index.js`. Levanta su propio servidor en :3111, así que no interfiere con `npm run dev`. Crea y borra sus propios registros; sale con código 1 si algo falla. Detalle en la skill `tests`.
- `npm run build && npm start` — build de client y server; `start` sirve API + SPA compilada desde :3000 (`dist/server/src/index.js`).
- `npm run migrate` / `npm run seed` / `npm run studio` — comandos de Prisma.
- El seed (`prisma/seed.ts`) **borra toda la base de datos** (`deleteMany`) antes de insertar. Es destructivo.
- `ts-node-dev` requiere `--project server/tsconfig.json`: el `tsconfig.json` raíz es un solution config (`"files": []`) y no compila nada por sí solo. `tsc -p server/tsconfig.json` compila el backend a `dist/server/`.

## Esquema de datos

- PostgreSQL vía Prisma (`DATABASE_URL` en `.env`). En local puedes usar Docker (`docker compose up -d db`) o una instancia remota (Neon/Supabase).
- Tras cambiar `schema.prisma`: `npm run migrate` (genera el cliente y aplica la migración). Para despliegue/prod usar `npx prisma migrate deploy`.
- El seed (`prisma/seed.ts`) lee `scripts/products-export.json` e inserta 5 categorías y 170 productos. **Borra datos existentes** antes de insertar.
- `client/src/types.ts` **duplica manualmente** los modelos de Prisma (no hay codegen). Actualizarlo tras cada cambio de esquema.
- Los controllers convierten `Prisma.Decimal` a `number` en `serialize()` antes de responder JSON; cualquier endpoint nuevo que devuelva productos debe hacer lo mismo.

## Backend (`server/src`)

- Express **4** (no 5): los handlers async NO propagan errores automáticamente → envolverlos con `asyncHandler` en las rutas.
- `req.query` de Express 4 es un getter sin setter → el middleware `validate` redefine la propiedad con `Object.defineProperty`. No "simplificarlo" a `req.query = parsed`.
- Errores: `ApiError` (lanzada en controllers), errores Zod y códigos de Prisma (`P2002`, `P2025`, `P2003`) se traducen en `middlewares/errorHandler.ts`. Responder siempre `{ error }` y, si falla la validación, `{ details: [{campo, mensaje}] }`.
- El servidor hace `dotenv/config` desde el cwd: ejecutar siempre desde la raíz.

## Frontend (`client/`)

- Tailwind **v4** (config por CSS: `@theme` en `src/index.css`, sin `tailwind.config.js`). Colores: `canvas`, `ink`, `cobalt`, `line`, etc. Los colores por categoría son datos en `utils/format.ts` (`categoryColor(slug)`).
- El tsconfig del cliente usa `verbatimModuleSyntax`: los tipos se importan con `import type` o `import { type X }` (rompe el build si no).
- `services/api.ts` usa proxy relativo `/api`; no hardcodear `localhost:3000`.
- Tipografías: Bricolage Grotesque (display) + Instrument Sans (cuerpo), cargadas desde Google Fonts en `index.css`.

## Entorno (esta máquina)

- El bash disponible es mínimo: no hay `ls`, `grep`, `head`, `tail`, `which`. Usar `npm.cmd`, `node -e "..."` o las herramientas glob/grep/read del agente.
- La ruta del proyecto contiene espacios y "y" (`Backend\DB y ORM\...`): siempre entrecomillar.
- Hay Chrome disponible headless para smoke tests del DOM renderizado: `chrome.exe --headless=new --virtual-time-budget=8000 --dump-dom http://localhost:5173/` (útil porque el agente no puede ver capturas de pantalla).
