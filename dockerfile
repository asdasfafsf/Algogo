# Base image
FROM node:22

# Install PM2 and pnpm globally
RUN npm install -g pm2
RUN npm install -g pnpm
RUN npm install -g @nestjs/cli

# Create app directory
WORKDIR /usr/src/app

# Copy the app source code and the .env file
COPY . .
COPY apps/algogo/src/config/env/.production.env /usr/src/app/.env
COPY libs/prisma/schema.prisma /usr/src/app/libs/prisma/schema.prisma

# Install dependencies using pnpm
RUN pnpm install

# Generate Prisma Client
RUN npx prisma generate --schema=libs/prisma/schema.prisma

# Build the app (NestJS production build)
RUN pnpm build algogo

# Expose the app port
EXPOSE 3000

# Use PM2 to run the NestJS application via pnpm start
CMD ["pnpm", "start", "algogo"]