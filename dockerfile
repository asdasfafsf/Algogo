# --- 1) build stage ---
FROM node:22 AS builder
WORKDIR /usr/src/app

RUN npm i -g pnpm

# ① 의존성
COPY package.json ./
RUN pnpm install

# ② Prisma Client
COPY prisma/schema.prisma /usr/src/app/prisma/schema.prisma
RUN npx prisma generate --schema=prisma/schema.prisma

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
RUN npx prisma generate --schema=prisma/schema.prisma

CMD ["node", "dist/main.js"] 