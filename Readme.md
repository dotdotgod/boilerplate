# Project Boilerplate

## 📋 Project Structure

This project consists of the following components:

- **API Server**: NestJS-based backend API
- **Frontend**: React + Vite-based web application
- **Proxy**: Reverse proxy using Nginx
- **Database**: PostgreSQL with pgvector extension

## 🔧 Environment Variables

Create a `.env` file in the root directory and configure the following environment variables to run the project:

### Required Environment Variables

```env
# Application Settings
NODE_ENV=development       # Development mode: development, Production: production
PORT=80                    # Proxy server port

# Database Settings
DB_HOST=localhost          # Database host (localhost for local development)
DB_PORT=5432               # Database port
DB_USER=postgres           # Database username
DB_PASS=your_password      # Database password
DB_DATABASE=your_db_name   # Database name

# Google OAuth Settings
GOOGLE_CLIENT_ID=your_google_client_id           # Google OAuth Client ID from Google Cloud Console
GOOGLE_CLIENT_SECRET=your_google_client_secret   # Google OAuth Client Secret from Google Cloud Console

# JWT Settings
JWT_ACCESS_SECRET=your_jwt_access_secret_key      # JWT Access Token Secret (required)
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key    # JWT Refresh Token Secret (required)
ACCESS_TOKEN_EXPIRES_IN=15m                       # Access Token expiration time (e.g., 15m, 1h, 1d)
REFRESH_TOKEN_EXPIRES_IN=7d                       # Refresh Token expiration time in days

# Frontend Settings
FRONTEND_URL=http://localhost:80                  # Frontend URL for OAuth redirects

# SMTP Email Settings
SMTP_HOST=smtp.gmail.com                          # SMTP server host
SMTP_PORT=587                                     # SMTP server port
SMTP_USER=your_email@gmail.com                   # SMTP username (email)
SMTP_PASS=your_app_password                      # SMTP password (app password for Gmail)
```

### Environment Variable Descriptions

#### Application Settings
- `NODE_ENV`: Application runtime environment (development/production)
- `PORT`: Proxy server port accessible from outside

#### Database Settings
- `DB_HOST`: Database host address
- `DB_PORT`: Database port (PostgreSQL default: 5432)
- `DB_USER`: PostgreSQL username
- `DB_PASS`: PostgreSQL password
- `DB_DATABASE`: Database name to use

#### Google OAuth Settings
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID from Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret from Google Cloud Console

#### JWT Settings
- `JWT_ACCESS_SECRET`: Secret key for JWT access token generation (required)
- `JWT_REFRESH_SECRET`: Secret key for JWT refresh token generation (required)
- `ACCESS_TOKEN_EXPIRES_IN`: Access token expiration time (e.g., 15m, 1h, 1d)
- `REFRESH_TOKEN_EXPIRES_IN`: Refresh token expiration time in days (e.g., 7d)

#### Frontend Settings
- `FRONTEND_URL`: Frontend application URL for OAuth redirects

#### SMTP Email Settings
- `SMTP_HOST`: SMTP server hostname (e.g., smtp.gmail.com)
- `SMTP_PORT`: SMTP server port (587 for TLS, 465 for SSL)
- `SMTP_USER`: SMTP username (usually your email address)
- `SMTP_PASS`: SMTP password (use app password for Gmail)

## 🐳 Docker Compose Commands

### Basic Execution

```bash
# Start services (background)
docker-compose up -d

# Start services (with logs)
docker-compose up

# Start specific services only
docker-compose up -d db
docker-compose up -d api
docker-compose up -d front
docker-compose up -d proxy
```

### Service Management

```bash
# Stop services
docker-compose down

# Stop services (including volumes)
docker-compose down -v

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart api
docker-compose restart front
```

### Log Monitoring

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs api
docker-compose logs front
docker-compose logs db
docker-compose logs proxy

# View real-time logs
docker-compose logs -f api
```

### Build and Rebuild

```bash
# Build images
docker-compose build

# Build specific service
docker-compose build api

# Build without cache
docker-compose build --no-cache
```

## 🗄️ Database Management

### Migration Commands

```bash
# Generate migration
pnpm run typeorm:migration:generate

# Run migration
pnpm run typeorm:migration:run

# Revert migration
pnpm run typeorm:migration:revert
```

### Database Access

```bash
# Access PostgreSQL container
docker-compose exec db psql -U ${DB_USER} -d ${DB_DATABASE}
```

## 🌐 Service Access

- **Frontend**: http://localhost:${PORT}
- **API Server**: http://localhost:${PORT}/v1
- **Database**: localhost:${DB_PORT}

## 📁 Project Structure

```
boilerplate/
├── api/                    # NestJS Backend API
│   ├── src/
│   │   ├── user/          # User-related modules
│   │   └── common/        # Common services
│   └── migrator/          # Database migrations
├── front/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/    # UI Components
│   │   └── lib/          # Utility functions
├── proxy/                 # Nginx proxy configuration
└── docker-compose.yml     # Docker Compose configuration
```

## 🚀 Getting Started

1. Install required packages

   ```bash
   cd api
   pnpm add passport-google-oauth20 @types/passport-google-oauth20 @nestjs/jwt
   ```

2. Configure environment variables

   ```bash
   cp .env.example .env
   # Edit .env file with appropriate values
   ```

3. Set up Google OAuth

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 Client ID credentials
   - Add your callback URL: `http://localhost:80/auth/google/callback`
   - Copy Client ID and Client Secret to your `.env` file

4. Start services

   ```bash
   docker-compose up -d
   ```

5. Run database migrations

   ```bash
   docker-compose exec api pnpm run typeorm:migration:run

   # or

   pnpm run typeorm:migration:run
   ```

6. Access in browser
   - Frontend: http://localhost:${PORT}
   - API Documentation: http://localhost:${PORT}/v1/docs (Swagger)

## 🛠️ Development Tools

- **API Server**: NestJS, TypeORM, PostgreSQL
- **Frontend**: React, Vite, TailwindCSS
- **Proxy**: Nginx
- **Database**: PostgreSQL with pgvector
- **Container**: Docker, Docker Compose
- **Authentication**: Google OAuth 2.0, Passport.js

## 📝 Additional Information

- All requests are proxied through Nginx
- Hot reload is supported in development mode
