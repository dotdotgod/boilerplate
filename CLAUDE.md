# Full-Stack Authentication System - Project Overview

## 📋 Project Architecture

This is a full-stack authentication system built with modern technologies and containerized deployment.

```
boilerplate/
├── api/                       # NestJS Backend API Server
│   ├── src/                   # Source code
│   ├── migrator/              # Database migrations
│   ├── CLAUDE.md              # Backend-specific guidelines
│   └── .cursorrules           # Backend Cursor AI rules
├── front/                     # React Frontend Application
│   ├── src/                   # Source code
│   ├── feature/               # Feature documentation
│   ├── CLAUDE.md              # Frontend-specific guidelines
│   └── .cursorrules           # Frontend Cursor AI rules
├── proxy/                     # Nginx Reverse Proxy
│   └── nginx.conf             # Proxy configuration
├── docker-compose.yml         # Container orchestration
├── .cursorrules               # Project-wide Cursor AI rules
└── CLAUDE.md                  # This overview document
```

## 🔧 Technology Stack

### Backend (`/api`)

- **Framework**: NestJS 11 + TypeScript
- **Database**: PostgreSQL + TypeORM 0.3.25
- **Authentication**: JWT (access/refresh tokens), Passport.js
- **OAuth**: Google OAuth 2.0 integration
- **Email**: NodeMailer with SMTP
- **Security**: Argon2 password hashing, Helmet security headers, CORS
- **Validation**: class-validator, class-transformer, Joi
- **Package Manager**: pnpm

### Frontend (`/front`)

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand with immer + subscribeWithSelector middleware
- **UI Components**: Radix UI + Tailwind CSS
- **HTTP Client**: Axios with automatic token management
- **Routing**: React Router v7 with protected routes
- **Package Manager**: pnpm

### Infrastructure

- **Reverse Proxy**: Nginx (routes `/v1/*` to API, `/*` to frontend)
- **Database**: PostgreSQL with pgvector extension
- **Containerization**: Docker + Docker Compose
- **Development**: Hot reload supported for both backend and frontend

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- pnpm

### Environment Setup

1. Copy environment template:

   ```bash
   cp .env.example .env
   ```

2. Configure required variables in `.env`:

   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=your_password
   DB_DATABASE=your_db_name

   # JWT Secrets
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Email SMTP
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password

   # URLs
   BASE_URL=http://localhost:80
   ```

### Development Startup

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec api pnpm run typeorm:migration:run

# View logs
docker-compose logs -f api    # Backend logs
docker-compose logs -f front  # Frontend logs
```

### Access Points

- **Frontend**: http://localhost:80
- **API**: http://localhost:80/v1
- **API Documentation**: http://localhost:80/v1/docs (Swagger)

## 🔑 Authentication System

### Flow Overview

1. **Registration**: Email → Verification link → Complete registration
2. **Login**: Email/password or Google OAuth → JWT tokens
3. **Token Management**: Automatic refresh, secure storage
4. **Route Protection**: Frontend guards + backend validation

### Token Strategy

- **Access Token**: 15 minutes expiry, stored in memory
- **Refresh Token**: 7 days expiry, HTTP-only cookie
- **Auto-refresh**: Handled by axios interceptors

### Security Features

- Argon2 password hashing
- CORS and security headers
- JWT token rotation
- Email verification required
- Rate limiting on auth endpoints

## 📡 API Endpoints

### Authentication

- `POST /v1/user/sign-in` - Email/password login
- `POST /v1/user/google` - Google OAuth login
- `POST /v1/user/refresh` - Token refresh
- `POST /v1/user/logout` - Logout

### Registration

- `POST /v1/user/register-email` - Start registration
- `POST /v1/user/get-registration-info` - Verify token
- `POST /v1/user/complete-registration` - Complete registration
- `POST /v1/user/verify-email` - Email verification
- `POST /v1/user/resend-verification` - Resend verification

### Password Reset

- `POST /v1/user/reset-password` - Request reset
- `POST /v1/user/verify-reset-token` - Verify reset token
- `POST /v1/user/confirm-reset-password` - Confirm new password

## 🗄️ Database Schema

### Core Tables

- **users**: User profiles (id, email, name, password, verification status)
- **refresh_tokens**: JWT refresh token management
- **email_verifications**: Email verification tokens
- **oauth_providers**: Social login provider data

### Relationships

- User → RefreshTokens (1:N)
- User → EmailVerifications (1:N)
- User → OAuthProviders (1:N)

## 🎨 Frontend Pages

### Public Pages

- `/sign-in` - Login page (email/password + Google)
- `/sign-up` - Registration step 1 (email input)
- `/sign-up/complete` - Email verification waiting
- `/complete-registration` - Registration step 2 (name + password)
- `/reset-password` - Password reset request
- `/reset-password/confirm` - Password reset confirmation

### Protected Pages

- `/workspace` - Main workspace area
- `/workspace/profile` - User profile management
- `/workspace/sessions` - Session management

## 🛠️ Development Guidelines

### Code Style

- **Backend**: Follow NestJS conventions, use TypeORM patterns
- **Frontend**: No form tags, avoid meaningless abstractions
- **Both**: TypeScript strict mode, proper error handling

### State Management

- **Backend**: Services handle business logic, controllers handle HTTP
- **Frontend**: Zustand for business state, useState for UI state

### API Integration

- Centralized API client: `api.domain.method()`
- Consistent error handling patterns
- Automatic token management

### Testing

- Backend: Unit tests with Jest, E2E tests
- Frontend: Component testing, integration testing
- Both: TypeScript compilation as first validation

## 📝 Documentation

### Project-Specific Docs

- `/api/CLAUDE.md` - Backend development guidelines
- `/front/CLAUDE.md` - Frontend development guidelines
- `/front/feature/authentication/PRD.md` - Product requirements

### AI Assistant Configuration

- `.cursorrules` files for Cursor AI
- `CLAUDE.md` files for Claude Code
- Context-aware development assistance

## 🔍 Troubleshooting

### Common Issues

1. **Database connection errors**: Check PostgreSQL container status
2. **Token refresh failures**: Verify JWT secrets in environment
3. **Email sending issues**: Confirm SMTP configuration
4. **CORS errors**: Check BASE_URL environment variable

### Debug Commands

```bash
# Check service status
docker-compose ps

# View specific service logs
docker-compose logs api
docker-compose logs front
docker-compose logs db

# Execute commands in containers
docker-compose exec api pnpm run typeorm:migration:run
docker-compose exec db psql -U postgres
```

## 🚦 Production Deployment

### Environment Considerations

- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper database credentials
- Set up SSL certificates
- Enable security headers
- Configure rate limiting

### Scaling Considerations

- Database connection pooling
- Redis for session storage
- Load balancer configuration
- CDN for static assets
- Monitoring and logging setup

---

**Development Team**: Full-stack authentication system
**Last Updated**: 2025-01-29
**Version**: 1.0

For detailed development guidelines, refer to the specific `CLAUDE.md` files in each directory.
