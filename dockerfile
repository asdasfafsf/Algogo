# --- 1) build stage ---
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

RUN apk add --no-cache openssl vips-dev build-base python3 make g++  # sharp 의존성 추가
RUN npm i -g pnpm

# ① 의존성
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile       # devDeps 포함
RUN pnpm rebuild sharp                    # sharp Alpine용 재빌드 추가

# ② Prisma Client
COPY prisma ./prisma
RUN pnpx prisma generate                 # @prisma/client + .prisma 생성

# ③ 애플리케이션 소스
COPY . .
RUN pnpm build                           # dist 생성

# --- 2) runtime ---
FROM node:22-alpine AS runner
WORKDIR /usr/src/app
RUN apk add --no-cache vips              # vips 런타임 라이브러리 추가
RUN npm i -g pnpm

# 필요한 파일만 복사
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/prisma ./prisma

# 프로덕션 의존성만 설치
RUN pnpm install --prod --frozen-lockfile --no-optional
RUN pnpx prisma generate

CMD ["node", "dist/main.js"] 