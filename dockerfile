# --- 1) build stage ---
FROM node:22-slim AS builder
WORKDIR /usr/src/app

RUN npm i -g pnpm

# ① 의존성
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ② Prisma Client
COPY prisma/schema.prisma /usr/src/app/prisma/schema.prisma
RUN npx prisma generate --schema=prisma/schema.prisma

# ③ 애플리케이션 소스
COPY . .
RUN pnpm build

# --- 2) runtime ---
FROM node:22-slim AS runner
WORKDIR /usr/src/app

RUN npm i -g pnpm && \
    groupadd -r appgroup && useradd -r -g appgroup appuser

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/prisma ./prisma

RUN pnpm install --prod --frozen-lockfile && \
    npx prisma generate --schema=prisma/schema.prisma

ENV NODE_ENV=production

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.SERVER_PORT || 3000), (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

CMD ["node", "dist/main.js"]
