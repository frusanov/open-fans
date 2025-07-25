# Open Fans Platform

A **censorship-resistant, open-protocol content publishing engine** for web and federated/social protocols. Supports any media type, creator monetization, and federates via ActivityPub, AtProto, and RSS/Atom.

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** or **Bun 1.0+**
- No external database required (uses PGlite)

### Installation (30 seconds)
```bash
git clone <your-repo-url>
cd open-fans
npm install
npm run db:push
npm run dev
```

Visit **http://localhost:3000** - frontend and API ready!

## 🏗️ Architecture

**Unified Development Server** (Single Port 3000):
```
Hono Server → {
  Frontend: Remix SSR
  API: /api/* endpoints  
  Database: PGlite (embedded PostgreSQL)
  HMR: Real-time updates for both frontend and API
}
```

**Technology Stack:**
- Frontend: React + Remix + TailwindCSS v4
- Backend: Hono + Drizzle ORM + JWT auth
- Database: PGlite (dev) → PostgreSQL (prod)
- Build: Vite + esbuild

## 🛠️ Development

### Core Commands
```bash
npm run dev              # Start unified dev server
npm run db:push         # Apply database schema changes
npm run db:studio       # Open database browser (port 4983)
npm run build           # Production build
```

### What's Working
- ✅ User authentication (register, login, JWT)
- ✅ Hot module replacement (frontend + API)
- ✅ Database with migrations (PGlite + Drizzle)
- ✅ API endpoints with rate limiting
- ✅ TypeScript throughout

### Current API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user
- `GET /api/users/:id` - Get user by ID
- `GET /health` - Health check

## 📚 Documentation

- [**DEVELOPMENT.md**](./DEVELOPMENT.md) - Complete setup and dev guide
- [**API.md**](./API.md) - API endpoint documentation  
- [**ROADMAP.md**](./ROADMAP.md) - Implementation roadmap

## 🎯 Next Steps

1. **Posts Schema**: Content creation data model
2. **Frontend Auth**: Login/register UI components
3. **File Upload**: Media handling infrastructure  
4. **Content Creation**: Post editor interface

## 🚀 Vision

The **WordPress of content creation** - an open, self-hostable platform putting creators in control of their content, audience, and revenue through federation protocols.

**Key Principles:**
- 🔒 Censorship resistant
- 🌐 Protocol agnostic (ActivityPub, AtProto, RSS)
- 💰 Creator-owned monetization
- 🛠️ Self-hostable anywhere
- 🔧 Extensible architecture

## 🤝 Contributing

1. Fork and create feature branch
2. Follow TypeScript best practices
3. Test with `npm run lint && npm run typecheck`
4. Submit pull request

## 📄 License

Open source - see [LICENSE](./LICENSE) for details.