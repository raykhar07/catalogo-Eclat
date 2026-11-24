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

# OpenSSL requerido por Prisma en Debian slim
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Runtime dependencies + Prisma client artifacts
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts/products-export.json ./scripts/products-export.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist
COPY docker/entrypoint.sh ./docker/entrypoint.sh

RUN chmod +x ./docker/entrypoint.sh && chown -R node:node /app

EXPOSE 3000

# Use a non-root user
USER node

ENTRYPOINT ["sh", "./docker/entrypoint.sh"]
