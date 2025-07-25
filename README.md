# Open Fans Platform

A **censorship-resistant, open-protocol content publishing engine** for web and federated/social protocols. The platform supports any media type, is portable and cloud-agnostic, includes creator monetization, and federates via ActivityPub, AtProto, and RSS/Atom.

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** or **Bun 1.0+**
- No external database required (uses PGlite for development)

### Installation & Development

```bash
# Clone the repository
git clone <your-repo-url>
cd open-fans

# Install dependencies
npm install
# or
bun install

# Set up the database (first time only)
npm run db:push

# Start the unified development server
npm run dev
```

The development server will start on **http://localhost:3000** with:
- ✅ **Frontend** (Remix with React SSR)
- ✅ **API Server** (Hono with authentication)
- ✅ **Hot Module Replacement** for both frontend and API
- ✅ **Database** (PGlite - embedded PostgreSQL)

## 🏗️ Architecture

### Unified Development Environment
```
Single Port (3000) → Hono Server → {
  Frontend Routes: Remix SSR
  API Routes: /api/* endpoints
  Static Assets: /public/*
  HMR: Real-time updates
}
```

### Technology Stack
- **Frontend**: React + Remix (SSR)
- **Backend**: Hono (runtime-agnostic)
- **Database**: PGlite (dev) → PostgreSQL (prod)
- **ORM**: Drizzle with TypeScript
- **Styling**: TailwindCSS v4 + Radix UI
- **Build**: Vite + esbuild
- **Auth**: JWT + bcrypt

## 📁 Project Structure

```
open-fans/
├── app/                    # Remix frontend application
│   ├── routes/            # Frontend routes (UI pages)
│   ├── components/        # React components
│   └── lib/              # Frontend utilities
├── server/                # Hono API server
│   ├── api/              # API route handlers
│   ├── middleware/       # Server middleware
│   ├── dev/              # Development server setup
│   └── index.ts          # Main server entry
├── lib/                   # Shared code
│   └── schema/           # Database schemas (Drizzle)
├── components/           # Shared UI components
├── docs/                 # Documentation
└── public/              # Static assets
```

## 🔧 Development Commands

### Core Development
```bash
npm run dev              # Start unified dev server (frontend + API)
npm run build           # Build for production
npm run start           # Start production server
```

### Database Management
```bash
npm run db:push         # Apply schema changes to database
npm run db:generate     # Generate migration files
npm run db:studio       # Open Drizzle Studio (database GUI)
npm run db:reset        # Reset database (fresh start)
```

### API Only (Optional)
```bash
npm run dev:api-only    # Start only the API server
npm run start:api-only  # Start API in production mode
```

### Code Quality
```bash
npm run lint            # Lint the codebase
npm run typecheck       # TypeScript type checking
```

## 🌐 API Endpoints

The API server provides RESTful endpoints at `http://localhost:3000/api/`:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/username/:username` - Get user by username
- `PATCH /api/users/profile` - Update profile (authenticated)

### System
- `GET /health` - Health check
- `GET /api` - API information

See [server/README.md](./server/README.md) for complete API documentation.

## 🎯 Development Features

### Hot Module Replacement (HMR)
- ✅ **Frontend changes**: Instant UI updates
- ✅ **API changes**: Automatic server restart
- ✅ **Database schema**: Live schema updates
- ✅ **Styling**: Real-time CSS updates

### Zero-Setup Database
- ✅ **PGlite**: Embedded PostgreSQL (no Docker needed)
- ✅ **Migrations**: Automatic schema management
- ✅ **Type Safety**: Full TypeScript integration
- ✅ **Studio**: Visual database browser

### Modern Developer Experience
- ✅ **TypeScript**: Full type safety across the stack
- ✅ **Path Aliases**: Clean imports with `~/` prefix
- ✅ **ESLint**: Code quality enforcement
- ✅ **Fast Builds**: Vite for development, esbuild for production

## 🚦 Quick Testing

### Test the API
```bash
# Health check
curl http://localhost:3000/health

# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test the Frontend
- Visit http://localhost:3000 for the main application
- Any changes to files in `app/` will hot-reload instantly
- Database operations can be viewed at http://localhost:4983 (Drizzle Studio)

## 🔐 Environment Configuration

Create a `.env` file in the project root:

```bash
# Development settings
NODE_ENV=development
SESSION_SECRET=your-session-secret-change-this

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Database (PGlite for development)
DATABASE_PATH=./tmp/db
```

## 📚 Documentation

- [**Project Roadmap**](./todo.md) - Complete development plan
- [**API Documentation**](./server/README.md) - API endpoints and usage
- [**Database Guide**](./docs/database.md) - Schema and migrations
- [**Development Setup**](./docs/pglite-development-guide.md) - Detailed setup guide

## 🏃‍♂️ What's Working Now

### ✅ Completed Features
- **Unified Development Server**: Frontend + API on single port with HMR
- **User Authentication**: Registration, login, JWT tokens, protected routes
- **Database Foundation**: PGlite with Drizzle ORM and migrations
- **API Server**: Complete Hono server with middleware and security
- **Modern UI**: TailwindCSS v4 with Radix UI components
- **Type Safety**: Full TypeScript coverage across frontend and backend

### 🚧 In Development
- **Content Management**: Post creation, editing, and viewing
- **Media Handling**: File upload and storage abstraction
- **Federation**: ActivityPub, AtProto, and RSS/Atom support
- **Testing**: Vitest and Playwright test suites

### 🎯 Next Steps
1. Implement posts schema and content creation UI
2. Add file upload and media storage system
3. Build frontend authentication components
4. Add comprehensive testing framework

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper TypeScript types
4. Test your changes: `npm run lint && npm run typecheck`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is open source. See [LICENSE](./LICENSE) for details.

---

## 🚀 Vision

Open Fans aims to be the **WordPress of content creation** - an open, self-hostable platform that puts creators in control of their content, audience, and revenue. By supporting multiple federation protocols, creators can reach audiences across the decentralized web while maintaining ownership of their brand and data.

**Key Principles:**
- 🔒 **Censorship Resistant**: No single point of failure
- 🌐 **Protocol Agnostic**: Federate everywhere
- 💰 **Creator Owned**: Direct monetization without platform fees
- 🛠️ **Self Hostable**: Deploy anywhere
- 🔧 **Extensible**: Plugin architecture for customization