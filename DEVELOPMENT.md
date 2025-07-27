# Development Guide

Complete setup and development guide for Open Fans Platform - a censorship-resistant, open-protocol content publishing engine.

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** or **Bun 1.0+**
- No external database required (uses PGlite)

### Setup (30 seconds)
```bash
# Clone and install
git clone https://github.com/your-username/open-fans
cd open-fans
npm install

# Setup database
npm run db:push

# Start development
npm run dev
```

Visit **http://localhost:3000** - both frontend and API are ready!

## 🏗️ Development Architecture

### Unified Development Server
```
Single Port (3000) → Hono Server → {
  Frontend Routes: React Router 7 SSR
  API Routes: /api/* endpoints  
  Static Assets: /static/*
  HMR: Real-time updates
}
```

### Technology Stack
- **Frontend**: React + React Router 7 (SSR)
- **Backend**: Hono (runtime-agnostic)
- **Database**: PGlite (dev) → PostgreSQL (prod)
- **ORM**: Drizzle with TypeScript
- **Build**: Vite + esbuild
- **Styling**: TailwindCSS v4

## 📁 Project Structure

```
open-fans/
├── app/                    # React Router 7 frontend
│   ├── routes.ts          # Route configuration
│   ├── index.tsx          # Main route
│   ├── root.tsx           # Root component
│   ├── welcome/           # Components
│   └── app.css           # Styles
├── server/                # Hono API server
│   ├── middleware/       # Server middleware
│   └── index.ts          # Main server
├── lib/                   # Shared code
│   ├── schema/           # Database schemas
│   ├── context.ts        # Context utilities
│   └── db.ts             # Database connection
├── components/           # Shared UI components
└── static/              # Static assets
```

## 🗄️ Database Development

### PGlite Setup
- **Zero configuration** - no Docker, no external services
- **PostgreSQL compatible** - same SQL syntax as production
- **File location**: `./tmp/db` (auto-created)
- **Fast development** - microsecond queries, instant schema updates

### Database Commands
```bash
# Apply schema changes (most common)
npm run db:push

# Generate migration files  
npm run db:generate

# Open database browser
npm run db:studio

# Reset database (fresh start)
npm run db:reset
```

### Schema Development
1. **Edit schema**: Modify files in `lib/schema/`
2. **Apply changes**: `npm run db:push`
3. **Test immediately**: No restart needed

### Current Schema

#### Users Table (Defined but not used in auth yet)
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

> **Note**: This schema is defined but authentication is not yet implemented.

#### Adding New Tables
```typescript
// lib/schema/posts.ts
export const postsTable = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  userId: uuid("user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// lib/schema/index.ts  
export * from "./posts";
```

## 🔥 Hot Module Replacement (HMR)

### Frontend HMR (Instant)
- **React components**: Updates without losing state
- **Routes**: Route configuration updates immediately
- **Styles**: TailwindCSS updates in real-time

### API HMR (Auto-restart)
- **Server middleware**: Server restarts on changes
- **Database schema**: Live schema updates
- **Static file serving**: Updates applied immediately

### HMR Triggers
```bash
# Frontend (instant update)
app/**/*.tsx           # Components and routes
app/routes.ts          # Route configuration
app/**/*.css           # Styles

# Backend (server restart)  
server/**/*.ts         # Server middleware
lib/schema/*.ts        # Database schema

# Full restart
vite.config.ts         # Build configuration
react-router.config.ts # React Router configuration
.env                   # Environment variables
```

## 🛠️ Development Commands

### Core Development
```bash
npm run dev              # Unified dev server (frontend + API)
npm run build           # Production build
npm run start           # Production server
npm run lint            # Code linting
npm run typecheck       # TypeScript + React Router type generation
```

### Database Operations
```bash
npm run db:push         # Apply schema to database
npm run db:generate     # Generate migration files
npm run db:studio       # Visual database browser
npm run db:reset        # Fresh database
```

### API Only (Optional)
```bash
npm run dev:api-only    # Hono server only (no React Router)
npm run start:api-only  # Production Hono server
```

## 🔧 Development Workflow

### 1. Frontend Development
```bash
# Edit components in app/ directory
# Configure routes in app/routes.ts
# Changes reflect instantly with HMR
# State preservation in React components
```

### 2. Server Development  
```bash
# Edit server middleware in server/ directory
# Server restarts automatically
# Add new Hono middleware as needed
```

### 3. Database Development
```bash
# Edit schema in lib/schema/
npm run db:push        # Apply changes
npm run db:studio      # View data
```

### 4. Adding Features (Future)
```bash
# 1. Design database schema in lib/schema/
# 2. Create API endpoints (to be implemented)
# 3. Add server middleware if needed
# 4. Configure routes in app/routes.ts
# 5. Build frontend components
# 6. Test with HMR feedback
```

## 🧪 Testing

### Database Testing
```typescript
beforeEach(async () => {
  await db.delete(usersTable); // Clean slate
});

test("user creation", async () => {
  const user = await db.insert(usersTable).values({
    username: "test", email: "test@example.com", passwordHash: "hash"
  }).returning();
  expect(user.username).toBe("test");
});
```

### Current API Testing
```bash
# Test main React Router route
curl http://localhost:3000/

# Test static assets
curl http://localhost:3000/static/favicon.ico
curl http://localhost:3000/favicon.ico

# No other API endpoints are implemented yet
```

## 🔐 Environment Configuration

Currently no `.env` file is required as authentication is not implemented. The database path is configured in `drizzle.config.ts`.

Future environment variables (when authentication is implemented):
```bash
NODE_ENV=development
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret-change-this
JWT_EXPIRES_IN=7d
DATABASE_PATH=./tmp/db
```

## 🚦 Troubleshooting

### Common Issues

**HMR not working**
```bash
# Restart dev server
npm run dev
```

**Schema changes not applying**
```bash
npm run db:generate
npm run db:push  
```

**Database issues**
```bash
npm run db:reset  # Fresh start
```

**Port conflicts**
```bash
# Check port 3000
lsof -i :3000
```

### Performance Tips
- Use `~/` imports for clean paths
- Exclude large directories from file watching
- Enable bundle analysis: Check Vite configuration for bundle analysis options

## 🚀 Production Migration

### From PGlite to PostgreSQL
1. **Export data**: Use Drizzle to export
2. **Setup PostgreSQL**: Configure production database  
3. **Update environment**: Set `DATABASE_URL`
4. **Run migrations**: Apply same schema
5. **Import data**: Migrate development data

### Production Build
```bash
npm run build
NODE_ENV=production npm start
```

Creates optimized bundles:
- **Client**: `build/client/` 
- **Server**: `build/server/index.js`
- **Features**: Tree shaking, minification, source maps

## 📊 Development Metrics

- **Cold start**: ~2-3 seconds
- **Hot reload**: ~100-500ms  
- **API restart**: ~1-2 seconds
- **Database ops**: Microseconds (in-process)
- **Production build**: ~30-60 seconds

## 🎯 Best Practices

### Code Organization
1. Use `~/` imports for clean paths
2. Group related API endpoints  
3. Place shared utilities in `lib/`
4. Define interfaces in appropriate modules

### Development Flow
1. Start with database schema
2. Configure routes in app/routes.ts
3. Build server middleware
4. Create reusable UI components
5. Maintain type safety throughout

### Performance
1. Use dynamic imports for heavy components
2. Organize routes for optimal bundling
3. Index frequently queried database columns
4. Implement proper caching strategies

## 🔄 Schema Evolution

### Development Approach
- **Use `db:push`** for instant schema updates
- **Experiment freely** with schema changes
- **Reset when needed** with `db:reset`

### Production Approach  
- **Use `db:generate`** for versioned migrations
- **Test migrations** thoroughly
- **Backup before applying** schema changes

### Migration Path
```bash
# Development
npm run db:push              # Direct schema application

# Production  
npm run db:generate          # Generate migration files
drizzle-kit migrate          # Apply versioned migrations (manual command)
```

## 🌟 Benefits Summary

### Zero-Setup Development
- Clone, install, run - instant productivity
- No Docker, no external services
- Works offline, anywhere

### Modern Developer Experience  
- Full TypeScript coverage
- Instant feedback with HMR
- Visual database browser
- Fast builds with Vite

### Production Ready
- PostgreSQL migration path
- Optimized production builds
- Runtime-agnostic deployment
- Scalable architecture

---

This development environment provides the fastest possible development experience while maintaining a clear path to production deployment. The PGlite + HMR combination enables rapid iteration with professional-grade tooling.

## 🚧 Current Implementation Status

### What's Working
- ✅ React Router 7 with SSR and file-based routing
- ✅ Hono server with middleware system
- ✅ PGlite database with Drizzle ORM
- ✅ Users table schema defined
- ✅ Static file serving (/static/*, /favicon.ico)
- ✅ TypeScript throughout with type generation
- ✅ Hot module replacement for both frontend and server
- ✅ Database browser (npm run db:studio)

### What's Not Yet Implemented
- ❌ Authentication system (JWT, login, register)
- ❌ API endpoints (/api/* routes)
- ❌ User registration/login UI
- ❌ Content management (posts, media)
- ❌ Payment/monetization features
- ❌ Federation protocols
- ❌ Advanced security features

This is a solid foundation ready for feature development. The next major milestone is implementing the authentication system.