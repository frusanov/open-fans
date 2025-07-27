# API Documentation

Current API status for Open Fans Platform - React Router 7 application with minimal Hono server backend.

> **⚠️ Early Development**: This API is currently minimal with only basic static file serving. Most endpoints described in the roadmap are not yet implemented.

## 🌐 Base Information

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com` (when deployed)

### Current Architecture
- **Frontend**: React Router 7 with SSR
- **Backend**: Hono server with middleware system
- **Database**: PGlite (development) / PostgreSQL (production planned)
- **Build**: Vite with React Router integration

## 🛠️ Current Implementation

### React Router 7 Application
The application is built with React Router 7 and currently includes:

#### Available Routes
```http
GET /                    # React Router application (Welcome page)
GET /favicon.ico         # Favicon file
GET /static/*           # Static assets (images, etc.)
```

#### Server Architecture
```typescript
// server/index.ts
export const server = new Hono();

server.use(contextMiddleware);     // Request context management
server.use(systemsMiddleware);     // Database integration
server.use("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));
server.use("/static/*", serveStatic({ root: "." }));

export default await createHonoServer({
  app: server,
});
```

## 📋 Available Endpoints

### Main Application
```http
GET /
```
**Description**: Main React Router application with SSR  
**Response**: HTML page with React application (currently shows welcome page)  
**Content-Type**: `text/html`

**Example Response**: HTML document with React Router 7 application

### Static Assets
```http
GET /favicon.ico
```
**Description**: Site favicon  
**Response**: Favicon image file  
**Content-Type**: `image/x-icon`

```http
GET /static/{filename}
```
**Description**: Static file serving for assets  
**Path Parameters**:
- `filename`: Name of the static file
**Response**: Static files (images, CSS, JS, etc.)  
**Available Files**:
- `/static/logo-light.png` - Light theme logo
- `/static/logo-dark.png` - Dark theme logo

## 🗄️ Database Integration

### Current Schema
The application includes a users table schema but no API endpoints to interact with it yet:

```sql
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" varchar(50) UNIQUE NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL, 
  "password_hash" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "last_login_at" timestamp,
  "email_verified_at" timestamp
);
```

### Database Access
The database is available in server middleware via:
```typescript
// Available in Hono context
c.systems.db // Drizzle database instance
```

## ❌ Not Yet Implemented

### Authentication Endpoints (Planned)
```http
POST /api/auth/register  # User registration (not implemented)
POST /api/auth/login     # User login (not implemented)
POST /api/auth/logout    # User logout (not implemented)
GET  /api/auth/me        # Current user info (not implemented)
```

### Content Management Endpoints (Planned)
```http
GET    /api/posts        # List posts (not implemented)
POST   /api/posts        # Create post (not implemented)
GET    /api/posts/:id    # Get post (not implemented)
PUT    /api/posts/:id    # Update post (not implemented)
DELETE /api/posts/:id    # Delete post (not implemented)
```

### User Management Endpoints (Planned)
```http
GET    /api/users/:id    # Get user profile (not implemented)
PUT    /api/users/:id    # Update user profile (not implemented)
```

### Media Upload Endpoints (Planned)
```http
POST   /api/upload       # Upload media (not implemented)
GET    /api/media/:id    # Get media (not implemented)
```

## 🧪 Testing the Current API

### Manual Testing
```bash
# Start development server
npm run dev

# Test main application
curl http://localhost:3000/
# Returns HTML with React Router application

# Test favicon
curl -I http://localhost:3000/favicon.ico
# Returns 200 OK with image/x-icon content-type

# Test static assets
curl -I http://localhost:3000/static/logo-light.png
# Returns 200 OK with image/png content-type

# Test non-existent routes (React Router handles these)
curl http://localhost:3000/non-existent
# Returns HTML with React Router application (client-side routing)
```

### Database Testing
```bash
# Reset and setup database
npm run db:reset

# Open database browser to view schema
npm run db:studio

# The users table exists but has no data or API to interact with it
```

## 🔧 Server Middleware

### Context Middleware
Provides request ID tracking and context management:
```typescript
// Adds unique request ID to headers
c.req.header('X-Request-Id') // Available in routes
```

### Systems Middleware  
Provides database access:
```typescript
// Makes database available in context
c.systems.db // Drizzle ORM instance
```

### Static File Middleware
Serves static assets from the `/static` directory and favicon.

## 🚀 Development Status

### Current Capabilities
- ✅ Serve React Router 7 application with SSR
- ✅ Serve static assets (images, favicon)
- ✅ Database schema definition (users table)
- ✅ Middleware system for future expansion
- ✅ Request context management
- ✅ Hot module replacement during development

### Missing Core Features
- ❌ Authentication system
- ❌ API endpoints for data operations
- ❌ User registration/login
- ❌ Content management
- ❌ File upload handling
- ❌ Error handling middleware
- ❌ Validation middleware
- ❌ Rate limiting
- ❌ CORS configuration

## 🎯 Next Development Steps

1. **Implement Authentication**:
   - Add JWT middleware
   - Create `/api/auth/*` endpoints
   - Implement password hashing with bcryptjs

2. **Add API Structure**:
   - Create `/api` route prefix
   - Add error handling middleware
   - Implement request validation

3. **User Management**:
   - User registration endpoint
   - User login endpoint
   - Profile management endpoints

4. **Content System**:
   - Posts schema and endpoints
   - Media upload system
   - Content CRUD operations

## 📖 Usage Examples

### Current Usage (React Router App)
```bash
# Visit the application
open http://localhost:3000

# View static assets
open http://localhost:3000/static/logo-light.png
```

### Future Usage (When API is implemented)
```javascript
// Registration (planned)
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'user123',
    email: 'user@example.com', 
    password: 'securepassword'
  })
});

// Login (planned)
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword'
  })
});
```

## 🔍 Error Responses

### Current Behavior
- **404 for API routes**: Returns React Router application (no API endpoints exist)
- **404 for static files**: Returns 404 Not Found
- **Server errors**: Basic Hono error handling

### Future Error Format (Planned)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/auth/register"
}
```

---

This API documentation reflects the current minimal state of the application. The foundation is solid with React Router 7, Hono server, and PGlite database, but API endpoints for user management, authentication, and content operations are not yet implemented. Check the [ROADMAP.md](./ROADMAP.md) for planned API development timeline.