# --- Step 1: Build Stage ---
FROM node:22-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and lock file
COPY package.json pnpm-lock.yaml prisma ./

# Install all dependencies (including devDependencies)
RUN pnpm install
RUN npx prisma generate

# Copy the app source code
COPY . .

# Build the app
RUN pnpm build

# --- Step 2: Runtime Stage ---
FROM node:22-alpine AS runner

RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/prisma ./prisma

RUN npx prisma generate
RUN pnpm install --prod
# RUN npx prisma generate


CMD ["node", "dist/main.js"]
