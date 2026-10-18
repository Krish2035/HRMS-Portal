# ==============================================================================
# Multi-Stage Production Dockerfile for HRMS Backend (Node.js 24 Alpine)
# ==============================================================================

# Stage 1: Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Install build dependencies for native compilation (argon2)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json drizzle.config.ts ./
COPY src/ ./src/

RUN npm run build
RUN npm prune --production

# Stage 2: Production runtime stage
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Security: Non-root user
USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/src/db/migrations ./src/db/migrations

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health/liveness || exit 1

CMD ["node", "dist/server.js"]
