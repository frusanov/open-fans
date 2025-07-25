# Open Fans API Server

This directory contains the Hono-based HTTP API server for the Open Fans platform. The server provides RESTful APIs for authentication, user management, content management, and media handling.

## 🏗️ Architecture

The server is built with [Hono](https://hono.dev/) - a lightweight, runtime-agnostic web framework that works on Node.js, Bun, Deno, and Cloudflare Workers.

```
server/
├── index.ts              # Main server entry point
├── api/                  # API route handlers
│   ├── auth.ts          # Authentication endpoints
│   ├── users.ts         # User management endpoints
│   ├── posts.ts         # Content management (placeholder)
│   └── media.ts         # Media handling (placeholder)
├── middleware/          # Custom middleware
│   ├── error-handler.ts # Global error handling
│   └── rate-limiter.ts  # Rate limiting middleware
├── utils/               # Utilities
│   └── db.ts           # Database connection and helpers
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ or Bun 1.0+
- The project uses PGlite for development (no external database needed)

### Environment Variables

Create a `.env` file in the project root with:

```bash
# API Server Configuration
API_PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Database (PGlite for development)
DATABASE_PATH=./tmp/db
```

### Running the Server

#### Development Mode (with auto-reload)
```bash
npm run dev:api
# or
bun --watch server/index.ts
```

#### Production Mode
```bash
npm run start:api
# or
bun server/index.ts
```

#### Full Development (Remix + API)
```bash
npm run dev
```

## 📋 API Endpoints

### Base URL
- Development: `http://localhost:3001`
- Production: (Configure with your domain)

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout (client-side token removal)

### Users (`/api/users`)
- `GET /api/users/:id` - Get user by ID (public)
- `GET /api/users/username/:username` - Get user by username (public)
- `GET /api/users/search?q=...` - Search users (public)
- `PATCH /api/users/profile` - Update own profile (protected)
- `PATCH /api/users/password` - Change password (protected)
- `DELETE /api/users/account` - Delete account (protected)
- `GET /api/users/stats` - Get user statistics (protected)

### Posts (`/api/posts`) - *Placeholder Implementation*
- `GET /api/posts` - List posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create post (protected)
- `PATCH /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)
- `POST /api/posts/:id/like` - Like/unlike post (protected)
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/posts/:id/comments` - Add comment (protected)

### Media (`/api/media`) - *Placeholder Implementation*
- `POST /api/media/upload` - Upload media file (protected)
- `GET /api/media/:id` - Get media metadata
- `GET /api/media/:id/file` - Serve media file
- `GET /api/media/:id/thumbnail` - Serve thumbnail
- `GET /api/media/search` - Search media files
- `PATCH /api/media/:id` - Update media metadata (protected)
- `DELETE /api/media/:id` - Delete media file (protected)

### System
- `GET /health` - Health check endpoint
- `GET /api` - API information and endpoints

## 🛡️ Security Features

### Rate Limiting
- **Default**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes (strict)
- **Upload endpoints**: 10 uploads per hour
- **Read operations**: 1000 requests per hour

### Authentication
- JWT-based authentication
- Bcrypt password hashing (12 rounds)
- Secure headers middleware
- CORS protection

### Input Validation
- Zod schema validation for all inputs
- File type and size validation
- SQL injection prevention via Drizzle ORM

## 🎯 Development Status

### ✅ Implemented
- **Authentication System**: Complete with JWT tokens
- **User Management**: CRUD operations, search, profile updates
- **Error Handling**: Comprehensive error responses
- **Rate Limiting**: Multi-tier rate limiting system
- **Database Integration**: PGlite with Drizzle ORM
- **Security Middleware**: CORS, secure headers, input validation

### 🚧 In Progress
- **Posts System**: Placeholder implementation ready for schema
- **Media System**: Placeholder implementation ready for storage layer
- **Federation**: ActivityPub, AtProto, RSS (planned)

### 📋 TODO
- Implement posts database schema and logic
- Implement media storage abstraction layer
- Add comprehensive API documentation (OpenAPI/Swagger)
- Implement federation protocols
- Add monitoring and logging
- Add API versioning
- Implement webhook system

## 🧪 Testing

### Manual Testing with curl

#### Register a user:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

#### Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Get current user (replace TOKEN):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/auth/me
```

### Health Check
```bash
curl http://localhost:3001/health
```

## 🔧 Configuration

### Middleware Stack
1. **Logger**: Request/response logging
2. **Security Headers**: XSS protection, HSTS, etc.
3. **CORS**: Cross-origin request handling
4. **Pretty JSON**: Formatted JSON responses
5. **Rate Limiting**: Request throttling
6. **Authentication**: JWT token verification (where required)
7. **Error Handling**: Global error processing

### Database
- **Development**: PGlite (embedded PostgreSQL)
- **Production**: PostgreSQL (migration path ready)
- **ORM**: Drizzle with type-safe queries
- **Migrations**: Managed via drizzle-kit

## 🚀 Deployment

### Docker (Planned)
```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY . .
RUN bun install
EXPOSE 3001
CMD ["bun", "server/index.ts"]
```

### Environment Requirements
- Node.js 20+ or Bun 1.0+
- PostgreSQL (production)
- Redis (future caching layer)

## 🤝 Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Add input validation with Zod
5. Write tests for new features
6. Update documentation

## 📚 Related Documentation

- [Project Overview](../todo.md)
- [Database Schema](../lib/schema/)
- [Frontend Integration](../app/)
- [Drizzle Documentation](https://orm.drizzle.team/)
- [Hono Documentation](https://hono.dev/)