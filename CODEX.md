# Codex Meta Document

This document consolidates key metadata and conventions from the project's `CLAUDE.md` and `GEMINI.md` files (root, `/api`, and `/front`) to support AI assistant (Codex) understanding.

---

## 1. Project Overview
- **Full-stack boilerplate**: NestJS backend with REST API, React+Vite frontend, Nginx proxy, PostgreSQL database.
- **Dockerized**: Development and production environments orchestrated via `docker-compose`.
- **Authentication**: JWT (access/refresh) and Google OAuth2 flow built-in.

## 2. Directory Structure
```
/
├─ api/      # NestJS backend API server
├─ front/    # React + Vite frontend application
├─ proxy/    # Nginx reverse proxy configuration
├─ docker-compose.yml
└─ CODEX.md  # (this file)
```

## 3. Common Technologies
- **Languages**: TypeScript (strict mode)
- **Package Manager**: pnpm
- **Container/Proxy**: Docker, Docker Compose, Nginx
- **Database**: PostgreSQL (+ pgvector)
- **Lint/Format**: ESLint, Prettier

## 4. Root Metadata (GEMINI + CLAUDE)
- **Separation of Concerns**: `/api` and `/front` are independent services communicating via well-defined REST endpoints.
- **Strict Typing & Zero-Tolerance**: TypeScript strict mode; no `any`; build fails on type errors.
- **Env Vars**: All secrets and settings injected via `.env`; no hardcoded credentials.
- **Code Quality**: Pre-commit linting; CI pipelines enforce lint and tests.

## 5. Backend Metadata (`/api`)
### Tech Stack & Tools
- **Framework**: NestJS
- **ORM**: TypeORM
- **Auth**: JWT (Access/Refresh), Passport.js, Google OAuth2
- **Validation**: class-validator, class-transformer
- **Security**: Helmet, compression, Argon2 (password hashing)

### Key Patterns
- **DTO-driven**: All request/response shapes via DTO classes; `PickType`, `PartialType`, `OmitType` utilities; no cross-DTO inheritance.
- **Global Serialization**: `ClassSerializerInterceptor` + `@SerializeOptions` for response DTOs.
- **Guards & Strategies**: `AccessJwtAuthGuard`, `RefreshJwtAuthGuard`, JWT strategies.
- **Global Pipes**: `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`.

### Scripts & Commands
```bash
pnpm install
pnpm run start:dev    # dev server
pnpm run build        # production build
pnpm run test:e2e     # E2E tests
pnpm run typeorm:migration:run
``` 

## 6. Frontend Metadata (`/front`)
### Tech Stack & Tools
- **Framework**: React 18 + TypeScript
- **Builder**: Vite
- **Styling**: Tailwind CSS, CSS Variables
- **UI Components**: shadcn/ui (Radix UI)
- **State Mgmt**: Zustand (+ immer, subscribeWithSelector)
- **HTTP Client**: Axios
- **Routing**: React Router v7

### Key Patterns
- **API Module**: `src/api/index.ts` exports a unified `api` object; API functions return `response.data` only.
- **Zustand Stores**: Pure state + actions; async/API logic in hooks; centralized token management.
- **Custom Hooks**: UI state via `useState`; business logic in hooks with `{ success, error }` return shape.
- **Axios Interceptors**: Request interceptor injects Access Token; response interceptor refreshes token on 401.

### Scripts & Commands
```bash
pnpm install
pnpm run dev        # dev server
pnpm run build      # production build
pnpm run lint       # lint checks
``` 

## 7. Key Conventions & Principles
- **File Naming**: pages in `kebab-case/index.tsx`, components in `PascalCase.tsx`, hooks in `camelCase.ts`.
- **Import Rules**: central API import `import { api } from '~/api'`; type imports separate.
- **Error Handling**: Standardized API error responses; front-end and back-end each handle errors consistently.
- **Security**: Env var validation; HTTP-only secure cookies for refresh tokens; CORS origin restricted.

---
*Sources:*
- CLAUDE.md (root, `/api/CLAUDE.md`, `/front/CLAUDE.md`)
- GEMINI.md (root, `/api/GEMINI.md`, `/front/GEMINI.md`)
