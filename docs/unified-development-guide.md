# Unified Development Environment Guide

This guide documents the Remix-Hono-Vite unified development environment that enables seamless development of both frontend and API on a single server with hot module replacement (HMR).

## 🎯 Overview

The Open Fans platform uses a modern unified development setup that combines:
- **Remix** for frontend SSR (Server-Side Rendering)
- **Hono** for API server and middleware
- **Vite** for fast builds and hot module replacement
- **Single Port Development** (3000) for both frontend and API

This setup provides the best developer experience with instant feedback for both frontend and backend changes.

## 🏗️ Architecture

### Development Server Flow
```
http://localhost:3000
         ↓
    Hono Server (main)
         ↓
    ┌─────────────┬─────────────┐
    │   Frontend  │     API     │
    │   (Remix)   │   (/api/*)  │
    │             │             │
    │   HMR ←─────┼────→ HMR    │
    │   Enabled   │   Enabled   │
    └─────────────┴─────────────┘
         ↓             ↓
    Static Assets   Database
    (/public/*)     (PGlite)
```

### Key Components

1. **Main Server Entry**: `server/index.ts`
   - Hono application with all middleware
   - Remix integration for SSR
   - API route handlers
   - Static file serving

2. **Development Server**: `server/dev/server.ts`
   - Vite dev server integration
   - Hot module replacement setup
   - Development build loading

3. **Vite Configuration**: `vite.config.ts`
   - Unified build configuration
   - HMR setup for both frontend and API
   - Production build with esbuild

## 🚀 Quick Start

### Start Development Server
```bash
npm run dev
```

This single command:
- ✅ Starts Hono server on port 3000
- ✅ Enables Remix SSR with HMR
- ✅ Activates API endpoints with auto-reload
- ✅ Serves static assets
- ✅ Connects to PGlite database

### Access Points
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api/*
- **Health Check**: http://localhost:3000/health
- **Database Studio**: http://localhost:4983 (run `npm run db:studio`)

## 🔧 Configuration Details

### Vite Configuration (`vite.config.ts`)

```typescript
export default defineConfig({
  server: {
    port: 3000,
    warmup: {
      clientFiles: ["./app/entry.client.tsx", "./app/root.tsx", "./app/routes/**/*"]
    }
  },
  resolve: {
    alias: { "~": "./app" }  // Tilde imports for clean paths
  },
  plugins: [
    devServer({
      entry: "server/index.ts",  // Hono server entry
      exclude: [/^\/(app)\/.+/, /^\/@.+$/, /^\/node_modules\/.*/, /^\/(api|components)\/.*/]
    }),
    tailwindcss(),
    tsconfigPaths(),
    remix({
      future: { /* modern Remix features */ },
      serverBuildFile: "remix.js",
      buildEnd: async () => {
        // Production build with esbuild
        await esbuild.build({
          outfile: "build/server/index.js",
          entryPoints: ["server/index.ts"],
          platform: "node",
          format: "esm",
          bundle: true
        });
      }
    })
  ]
});
```

### Server Structure (`server/index.ts`)

```typescript
import { Hono } from "hono";
import { remix } from "remix-hono/handler";

const app = new Hono();

// Middleware stack
app.use("*", logger());
app.use("*", secureHeaders());
app.use("*", cors());
app.use("*", prettyJSON());

// API routes
app.route("/api", apiRoutes);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Frontend (Remix) - must be last
app.use("*", remix({
  build: await importDevBuild(),  // Development
  mode: "development"
}));
```

## 🔥 Hot Module Replacement (HMR)

### Frontend HMR
- **React Components**: Instant updates without losing state
- **Routes**: New routes available immediately
- **Styles**: TailwindCSS updates in real-time
- **Assets**: Static files served with cache busting

### API HMR
- **Route Handlers**: Server restarts automatically on changes
- **Middleware**: Updates applied immediately
- **Database Schema**: Live schema updates with Drizzle
- **Configuration**: Environment changes trigger restart

### HMR Triggers
```bash
# Frontend changes (instant HMR)
app/routes/*.tsx         # Route components
app/components/*.tsx     # React components
app/lib/*.ts            # Frontend utilities
app/root.tsx            # Root layout
app/entry.client.tsx    # Client entry

# API changes (server restart)
server/**/*.ts          # API routes and middleware
lib/schema/*.ts         # Database schema
server/index.ts         # Main server file

# Configuration changes (full restart)
vite.config.ts          # Vite configuration
package.json            # Dependencies
.env                    # Environment variables
```

## 📁 File Organization

### Development Files
```
server/
├── index.ts              # Main server entry (Hono app)
├── dev/
│   └── server.ts         # Development server utilities
├── api/
│   ├── auth.ts          # Authentication endpoints
│   ├── users.ts         # User management
│   ├── posts.ts         # Content management (placeholder)
│   └── media.ts         # Media handling (placeholder)
├── middleware/
│   ├── error-handler.ts # Global error handling
│   └── rate-limiter.ts  # Rate limiting
└── utils/
    └── db.ts            # Database utilities
```

### Frontend Files
```
app/
├── entry.client.tsx      # Client-side entry point
├── entry.server.tsx      # Server-side entry point
├── root.tsx             # Root layout component
├── routes/              # Remix routes (file-based routing)
├── components/          # React components
└── lib/                 # Frontend utilities
```

## 🛠️ Development Workflow

### 1. Starting Development
```bash
# First time setup
npm install
npm run db:push
npm run dev
```

### 2. Frontend Development
```bash
# Edit any file in app/ directory
# Changes reflect immediately with HMR
# State preservation in React components
# No manual refresh needed
```

### 3. API Development
```bash
# Edit files in server/ directory
# Server restarts automatically
# New endpoints available immediately
# Database changes applied automatically
```

### 4. Database Development
```bash
# Edit schema files in lib/schema/
# Push changes: npm run db:push
# View in studio: npm run db:studio
# Reset if needed: npm run db:reset
```

## 🔧 Available Scripts

### Core Development
```bash
npm run dev              # Start unified development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Lint codebase
npm run typecheck       # TypeScript validation
```

### Database Operations
```bash
npm run db:push         # Apply schema changes
npm run db:generate     # Generate migrations
npm run db:studio       # Open database GUI
npm run db:reset        # Fresh database
```

### API Only (Optional)
```bash
npm run dev:api-only    # Start only API server
npm run start:api-only  # Production API server
```

## 🐛 Troubleshooting

### Common Issues

#### HMR Not Working
```bash
# Check Vite dev server is running
# Verify port 3000 is not in use by other processes
# Clear browser cache and restart dev server
npm run dev
```

#### API Changes Not Reflecting
```bash
# Ensure server restart is happening
# Check console for error messages
# Verify file is in server/ directory
# Check TypeScript compilation errors
```

#### Database Connection Issues
```bash
# Reset database and try again
npm run db:reset
npm run dev
```

#### Port Conflicts
```bash
# Check what's using port 3000
lsof -i :3000
# Kill the process or change port in vite.config.ts
```

### Performance Optimization

#### Slow HMR
- Check file watch limits: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf`
- Exclude large directories from watching in `vite.config.ts`
- Use `warmup` configuration for frequently accessed files

#### Large Bundle Size
- Enable bundle analysis: `npm run build -- --analyze`
- Check for large dependencies
- Use dynamic imports for heavy components

## 🚀 Production Build

### Build Process
```bash
npm run build
```

This creates:
1. **Client Bundle**: `build/client/` - Frontend assets
2. **Server Bundle**: `build/server/index.js` - Optimized server
3. **Remix Build**: `build/server/remix.js` - SSR bundle

### Build Features
- **esbuild**: Fast, optimized bundling
- **Tree Shaking**: Remove unused code
- **Minification**: Compressed output
- **Source Maps**: Debug production issues

### Deployment
```bash
# Production start
NODE_ENV=production npm start

# Environment variables required
SESSION_SECRET=production-secret
JWT_SECRET=production-jwt-secret
DATABASE_URL=postgresql://...  # Production PostgreSQL
```

## 📊 Development Metrics

### Startup Time
- **Cold Start**: ~2-3 seconds
- **Hot Reload**: ~100-500ms
- **API Restart**: ~1-2 seconds

### Build Performance
- **Development**: Instant HMR
- **Production Build**: ~30-60 seconds
- **Bundle Size**: ~500KB (client), ~2MB (server)

## 🎯 Best Practices

### Code Organization
1. **Frontend**: Use `~/` imports for clean paths
2. **API**: Group related endpoints in single files
3. **Shared**: Place common utilities in `lib/`
4. **Types**: Define interfaces in appropriate modules

### Development Workflow
1. **Start with Schema**: Define database tables first
2. **API First**: Build endpoints before UI
3. **Component Driven**: Build reusable UI components
4. **Type Safety**: Use TypeScript throughout

### Performance
1. **Lazy Load**: Use dynamic imports for heavy components
2. **Code Split**: Organize routes for optimal bundling
3. **Cache Assets**: Use proper cache headers
4. **Database**: Index frequently queried columns

## 📚 Related Documentation

- [Project Roadmap](../todo.md) - Complete development plan
- [API Documentation](../server/README.md) - Endpoint details
- [Database Guide](./database.md) - Schema and migrations
- [PGlite Setup](./pglite-development-guide.md) - Database configuration

---

This unified development environment provides the foundation for rapid development of the Open Fans platform while maintaining production-ready code quality and architecture.