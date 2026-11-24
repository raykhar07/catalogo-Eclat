# estante. — Catálogo de productos

Catálogo de productos con buscador, filtros por categoría y precio, detalle de
producto y un panel de administración. Backend en **Express + Prisma** (PostgreSQL)
y frontend en **React + Vite + Tailwind CSS**.

## Requisitos

- Node.js 20 o superior
- npm

## Instalación

```bash
npm install
npm install --prefix client
```

## Base de datos

El archivo `.env` define la conexión a PostgreSQL:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/estante?schema=public"
PORT=3000
```

Necesitas una instancia de PostgreSQL local o remota. Con Docker, puedes levantar solo la DB:

```bash
docker compose up -d db
```

Crear el esquema y cargar los datos de ejemplo (5 categorías y 170 productos):

```bash
npm run migrate
npm run seed
```

Para explorar la base de datos con la interfaz de Prisma:

```bash
npm run studio
```

## Desarrollo

```bash
npm run dev
```

Arranca en paralelo:

- Backend en `http://localhost:3000` (reinicia al guardar archivos de `server/`)
- Frontend en `http://localhost:5173` (Vite, con proxy de `/api` al backend)

Abre `http://localhost:5173`.

## Tests

```bash
npm run build   # obligatorio: el test arranca el servidor compilado
npm test
```

`npm test` ejecuta `scripts/smoke-test.js`: un smoke test de la API sin
framework (usa `fetch` nativo de Node 18+) con 29 comprobaciones sobre
categorías y productos — CRUD, serialización de `Decimal`, validación Zod,
duplicados, IDs inválidos, paginación, búsqueda, orden y la regla que impide
borrar una categoría con productos.

El test levanta su propio servidor en el puerto `3111` (`TEST_PORT` para
cambiarlo), así que no interfiere con `npm run dev`. Crea sus registros con un
slug único y los borra al terminar, por lo que es seguro correrlo contra la BD
con el seed. Sale con código 1 si alguna comprobación falla.

## Producción

```bash
npm run build
npm start
```

`npm start` sirve la API y el frontend compilado (`client/dist`) desde
`http://localhost:3000`.

## Docker

El proyecto incluye `docker-compose.yml` con dos servicios: **PostgreSQL** (`db`) y la **app** (API + frontend compilado).

```bash
# 1. Crea tu .env a partir de .env.example y completa los valores
#    En Docker local, usa CLIENT_URL=http://localhost:3000
#    docker-compose sobreescribe DATABASE_URL para apuntar al servicio db

# 2. Construir y levantar
docker compose up --build -d

# 3. Ver logs
docker compose logs -f app
```

- La app queda en `http://localhost:3000`.
- El entrypoint ejecuta `prisma migrate deploy` antes de iniciar el servidor.
- Los datos de PostgreSQL se persisten en el volumen `pg_data`.
- Para cargar el catálogo de ejemplo: `docker compose exec app npm run seed` (el seed es destructivo).
- Para producción (Render/Neon/Supabase), usa una `DATABASE_URL` de PostgreSQL administrado y configura `JWT_SECRET`, `CLIENT_URL` y callbacks OAuth con tu dominio HTTPS real.

## Estructura

```
├── scripts/
│   └── smoke-test.js      Smoke test de la API (npm test)
├── prisma/
│   ├── schema.prisma      Modelos (Category, Product, User, Account, Order)
│   ├── seed.ts            Datos de ejemplo (170 productos)
│   └── migrations/        Migraciones de Prisma (PostgreSQL)
├── server/
│   └── src/
│       ├── index.ts       Arranque de Express
│       ├── routes/        Rutas de /api/products y /api/categories
│       ├── controllers/   Lógica de cada endpoint
│       ├── middlewares/   Validación Zod y manejo de errores
│       ├── schemas/       Esquemas de validación con Zod
│       └── utils/         Helpers (IDs, handlers async)
└── client/
    └── src/
        ├── pages/         Home, ProductDetail y Admin
        ├── components/    Tarjetas, filtros, paginación, formularios
        ├── services/api.ts  Llamadas a la API
        └── utils/format.ts  Precios, colores de categoría, imágenes
```

## API

### Productos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Lista paginada. Query: `search`, `category` (id o slug), `minPrice`, `maxPrice`, `sort` (`newest`, `price_asc`, `price_desc`, `name_asc`), `page`, `limit` |
| GET | `/api/products/:id` | Detalle de un producto |
| POST | `/api/products` | Crea un producto |
| PUT | `/api/products/:id` | Actualiza un producto |
| DELETE | `/api/products/:id` | Elimina un producto |

### Categorías

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/categories` | Lista categorías con su conteo de productos |
| POST | `/api/categories` | Crea una categoría (`name`, `slug`) |
| PUT | `/api/categories/:id` | Actualiza una categoría |
| DELETE | `/api/categories/:id` | Elimina (bloqueada si tiene productos) |

Errores: siempre `{ "error": "mensaje" }` y, si falla la validación,
`{ "details": [{ "campo", "mensaje" }] }`.

## Stack

- Backend: Express, Prisma, PostgreSQL, Zod
- Frontend: React 19, Vite, React Router, Tailwind CSS 4
- Tipado compartido: `client/src/types.ts` refleja los modelos de Prisma
