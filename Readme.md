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
```

### Environment Variable Descriptions

- `NODE_ENV`: Application runtime environment (development/production)
- `PORT`: Proxy server port accessible from outside
- `DB_HOST`: Database host address
- `DB_PORT`: Database port (PostgreSQL default: 5432)
- `DB_USER`: PostgreSQL username
- `DB_PASS`: PostgreSQL password
- `DB_DATABASE`: Database name to use

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

1. Configure environment variables

   ```bash
   cp .env.example .env
   # Edit .env file with appropriate values
   ```

2. Start services

   ```bash
   docker-compose up -d
   ```

3. Run database migrations

   ```bash
   docker-compose exec api pnpm run typeorm:migration:run

   # or

   pnpm run typeorm:migration:run
   ```

4. Access in browser
   - Frontend: http://localhost:${PORT}
   - API Documentation: http://localhost:${PORT}/v1/docs (Swagger)

## 🛠️ Development Tools

- **API Server**: NestJS, TypeORM, PostgreSQL
- **Frontend**: React, Vite, TailwindCSS
- **Proxy**: Nginx
- **Database**: PostgreSQL with pgvector
- **Container**: Docker, Docker Compose

## 📝 Additional Information

- All requests are proxied through Nginx
- Hot reload is supported in development mode
