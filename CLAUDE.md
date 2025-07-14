# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Development
- `pnpm dev` - Start development server with watch mode
- `pnpm build` - Build the entire project
- `pnpm start` - Start production server
- `pnpm start:prod` - Start production server from built files

### Multi-App Development
This is a NestJS monorepo with multiple applications:
- `pnpm dev:algogo` - Start main algogo app in development
- `pnpm dev:crawler` - Start crawler app in development  
- `pnpm dev:compiler` - Start compiler app in development
- `pnpm build:algogo` - Build only the algogo app

### Database & Prisma
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:studio` - Open Prisma Studio GUI
- `pnpm prisma:migrate` - Run database migrations

### Testing & Code Quality
- `pnpm test` - Run unit tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:cov` - Run tests with coverage
- `pnpm test:e2e` - Run end-to-end tests for algogo
- `pnpm test:crawler:e2e` - Run end-to-end tests for crawler
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier

## Architecture Overview

### Core Structure
This is a **NestJS-based algorithmic problem platform** with microservice architecture:

- **Main App (algogo)**: Core API server handling user authentication, problem management, and code execution
- **Crawler**: Service for collecting problems from external coding platforms
- **Compiler**: Service for code compilation and execution

### Key Modules & Responsibilities

#### Authentication & Authorization
- `auth-v2/` - JWT-based authentication system
- `oauth-v2/` - OAuth integration (Google, Kakao, GitHub)
- `auth-guard/` - Authentication guards and middleware
- `authorization/` - Role-based access control

#### Problem Management
- `problems/` & `problems-v2/` - Problem CRUD operations and search
- `problems-collect/` - Problem collection from external sources
- `problems-report/` - Problem reporting system
- `problem-site/` - External problem site management

#### Code Execution
- `execute/` - Real-time code compilation and execution via WebSocket
- `code/` - Code template and settings management
- `rate-limit/` - Execution rate limiting to prevent abuse

#### Infrastructure
- `prisma/` - Database ORM and connection management
- `redis/` - Redis integration for caching and WebSocket adapter
- `s3/` - AWS S3 integration for file storage
- `image/` - Image processing and upload handling
- `crypto/` - Encryption services
- `jwt/` - JWT token management

### Data Flow Architecture
1. **User Authentication**: OAuth providers → JWT tokens → Redis cache
2. **Problem Collection**: External sites → Crawler → Database
3. **Code Execution**: User code → Queue (BullMQ) → Compiler → Results via WebSocket
4. **File Management**: Uploads → S3 → Database references

### Database Schema
Uses **Prisma ORM** with PostgreSQL. Schema located at `prisma/schema.prisma`. Key entities:
- Users with OAuth integration
- Problems with metadata and test cases
- Code templates and user solutions
- Execution history and rate limiting

### WebSocket Integration
Real-time features use Socket.IO with Redis adapter:
- Code execution results
- Live problem-solving sessions
- Authentication via WebSocket guards

### Configuration Management
Environment-based configuration in `config/` directory:
- Database, Redis, S3 connections
- OAuth provider settings
- Rate limiting and security policies
- Logging configuration

## Development Notes

### Environment Setup
- Uses environment-specific `.env` files (`.development.env`, `.production.env`)
- Default environment is production if NODE_ENV not set
- All configurations use validation schemas for type safety

### Code Organization
- **Modular architecture**: Each feature has its own module with controller, service, repository
- **DTOs**: Request/Response DTOs in each module's `dto/` folder
- **Error handling**: Custom exceptions in `errors/` folders with global exception filter
- **Common utilities**: Shared types, constants, and decorators in `common/`

### Testing Strategy
- Unit tests: `*.spec.ts` files alongside source code
- E2E tests: Separate test configurations per application
- Test database isolation using Prisma transactions