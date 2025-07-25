# API Documentation

Complete API reference for Open Fans Platform - RESTful endpoints for authentication, user management, content, and media.

## 🌐 Base Information

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

### Authentication
- **Type**: JWT Bearer tokens
- **Header**: `Authorization: Bearer <token>`
- **Expiry**: 7 days (configurable)

### Response Format
All endpoints return JSON with consistent structure:
```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string (3-50 chars, alphanumeric + underscore)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "created_at": "timestamp"
    },
    "token": "jwt_token"
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string", 
      "email": "string",
      "last_login_at": "timestamp"
    },
    "token": "jwt_token"
  }
}
```

### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user_id": "uuid",
    "expires_at": "timestamp"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "created_at": "timestamp",
    "last_login_at": "timestamp",
    "email_verified_at": "timestamp"
  }
}
```

## 👥 User Management Endpoints

### Get User by ID
```http
GET /api/users/:id
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "created_at": "timestamp"
  }
}
```

### Get User by Username
```http
GET /api/users/username/:username
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "created_at": "timestamp"
  }
}
```

### Update Profile
```http
PATCH /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "string (optional)",
  "email": "string (optional)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "updated_at": "timestamp"
  }
}
```

## 📝 Posts Endpoints (Planned)

### List Posts
```http
GET /api/posts?page=1&limit=20&tag=example
```

### Get Post
```http
GET /api/posts/:id
```

### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  "tags": ["string"],
  "visibility": "public|private|paid",
  "nsfw": false
}
```

### Update Post
```http
PATCH /api/posts/:id
Authorization: Bearer <token>
```

### Delete Post
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

## 🎭 Media Endpoints (Planned)

### Upload Media
```http
POST /api/media/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: File
```

### Get Media
```http
GET /api/media/:id
```

### Serve Media File
```http
GET /api/media/:id/file
```

### Generate Thumbnail
```http
GET /api/media/:id/thumbnail?size=200x200
```

## 🔧 System Endpoints

### Health Check
```http
GET /health
```

**Response (200)**:
```json
{
  "status": "ok",
  "timestamp": "timestamp",
  "uptime": "seconds"
}
```

### API Information
```http
GET /api
```

**Response (200)**:
```json
{
  "name": "Open Fans API",
  "version": "1.0.0",
  "endpoints": ["list of available endpoints"]
}
```

## 🛡️ Security & Rate Limiting

### Rate Limits
- **Default**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **Upload endpoints**: 10 uploads per hour
- **Read operations**: 1000 requests per hour

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

### CORS Policy
- **Development**: All origins allowed
- **Production**: Configured origins only

## 📊 Error Codes

### Authentication Errors
- `AUTH_REQUIRED` - Authentication required
- `INVALID_TOKEN` - JWT token invalid or expired
- `INVALID_CREDENTIALS` - Login credentials incorrect
- `USER_EXISTS` - User already exists (registration)

### Validation Errors
- `VALIDATION_ERROR` - Request validation failed
- `MISSING_FIELD` - Required field missing
- `INVALID_FORMAT` - Field format invalid

### Authorization Errors
- `FORBIDDEN` - Access denied
- `NOT_OWNER` - Resource not owned by user

### Resource Errors
- `NOT_FOUND` - Resource not found
- `ALREADY_EXISTS` - Resource already exists

### System Errors
- `INTERNAL_ERROR` - Server error
- `RATE_LIMITED` - Rate limit exceeded

## 📝 Request/Response Examples

### Successful User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "testuser",
      "email": "test@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Response Example
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "a", "email": "invalid", "password": "123"}'
```

**Response (400)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Username must be 3-50 characters, email must be valid, password must be at least 8 characters"
  }
}
```

## 🧪 Testing with curl

### Complete Authentication Flow
```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 2. Login (save token from response)
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')

# 3. Access protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/me

# 4. Update profile
curl -X PATCH http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"newusername"}'
```

## 🔄 API Versioning

### Current Version
- **Version**: 1.0.0
- **Prefix**: `/api` (no version in URL)

### Future Versioning
- **Strategy**: URL versioning (`/api/v2/`)
- **Backwards Compatibility**: Previous versions maintained
- **Deprecation**: 6-month notice before removal

## 📈 Monitoring & Logging

### Request Logging
All requests logged with:
- Timestamp
- Method and path
- User ID (if authenticated)
- Response status
- Response time

### Error Tracking
- All errors logged with stack traces
- Rate limit violations tracked
- Failed authentication attempts monitored

## 🚀 Development

### Starting API Server
```bash
# Full development (frontend + API)
npm run dev

# API only
npm run dev:api-only
```

### API Server Configuration
- **Port**: 3001 (API only) or 3000 (unified)
- **Environment**: Development/Production modes
- **Database**: PGlite (dev) / PostgreSQL (prod)

### Adding New Endpoints
1. Create handler in `server/api/`
2. Add to route exports
3. Include in main server
4. Test with curl/Postman
5. Update this documentation

---

This API provides a solid foundation for content publishing with authentication, user management, and extensibility for future features like posts, media, and federation protocols.