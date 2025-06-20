# --- 1) build stage ---
FROM node:22 AS builder
WORKDIR /usr/src/app

RUN npm i -g pnpm

# ① 의존성
COPY package.json ./
RUN pnpm install

# ② Prisma Client
COPY prisma ./prisma
RUN pnpx prisma generate

# ③ 애플리케이션 소스
COPY . .
RUN pnpm build

# --- 2) runtime ---
FROM node:22 AS runner
WORKDIR /usr/src/app
RUN npm i -g pnpm

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/prisma ./prisma

RUN pnpm install --prod
RUN pnpx prisma generate

CMD ["node", "dist/main.js"] 