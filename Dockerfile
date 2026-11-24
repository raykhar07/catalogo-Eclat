# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app

# Root dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Client dependencies
COPY client/package.json client/package-lock.json ./client/
RUN npm ci --prefix client

# Source
COPY prisma ./prisma
COPY tsconfig.json ./
COPY server ./server
COPY client ./client
COPY scripts ./scripts

# Generate Prisma client and build app
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:/app/data/products.db"

# Runtime dependencies + Prisma client artifacts
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist
COPY docker/entrypoint.sh ./docker/entrypoint.sh

# Prepare writable data directory for SQLite volume
RUN mkdir -p /app/data && chown -R node:node /app/data && chmod +x ./docker/entrypoint.sh

EXPOSE 3000

# Use a non-root user
USER node

ENTRYPOINT ["sh", "./docker/entrypoint.sh"]
