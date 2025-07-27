# Open Fans Platform

A **censorship-resistant, open-protocol content publishing engine** for web and federated/social protocols. Supports any media type, creator monetization, and federates via ActivityPub, AtProto, and RSS/Atom.

> **⚠️ Early Development**: This is currently a foundational setup with basic infrastructure. Most features described in the vision are planned but not yet implemented.

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** or **Bun 1.0+**
- No external database required (uses PGlite)

### Installation (30 seconds)
```bash
git clone https://github.com/your-username/open-fans
cd open-fans
npm install
npm run db:push
npm run dev
```

Visit **http://localhost:3000** - basic React Router app is ready!

## 🏗️ Architecture

**Unified Development Server** (Single Port 3000):
```
Hono Server → {
  Frontend: React Router 7 SSR
  Static Assets: /static/* endpoints  
  Database: PGlite (embedded PostgreSQL)
  HMR: Real-time updates for both frontend and API
}
```

**Technology Stack:**
- Frontend: React + React Router 7 + TailwindCSS v4
- Backend: Hono + Drizzle ORM
- Database: PGlite (dev) → PostgreSQL (prod)
- Build: Vite + esbuild

## 🛠️ Development

### Core Commands
```bash
npm run dev              # Start unified dev server
npm run db:push         # Apply database schema changes
npm run db:studio       # Open database browser (port 4983)
npm run build           # Production build
npm run typecheck       # TypeScript + React Router type generation
```

### What's Actually Working
- ✅ React Router 7 with SSR and HMR
- ✅ Hono server with middleware system
- ✅ PGlite database with Drizzle ORM
- ✅ Users table schema (no auth yet)
- ✅ Static file serving
- ✅ TypeScript throughout
- ✅ Development hot reload

### Current Implementation Status
- **Database**: Users table schema exists
- **Server**: Basic Hono server with static file serving
- **Frontend**: Default React Router welcome page
- **API**: No endpoints implemented yet
- **Authentication**: Dependencies installed but not implemented
- **Content Management**: Not implemented
- **Federation**: Not implemented

## 📚 Documentation

- [**DEVELOPMENT.md**](./DEVELOPMENT.md) - Complete setup and dev guide
- [**API.md**](./API.md) - Current minimal API documentation  
- [**ROADMAP.md**](./ROADMAP.md) - Implementation roadmap

## 🎯 Immediate Next Steps

1. **Authentication System**: Implement JWT-based user auth (register/login)
2. **Posts Schema**: Design and implement content data model
3. **API Endpoints**: Build REST API for user and content management
4. **Frontend Auth**: Login/register UI components
5. **Content Creation**: Basic post creation interface

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

### Development Status
This project is in **early development**. The foundation is solid with React Router 7, Hono, and PGlite, but most user-facing features are not yet implemented. Check the [ROADMAP.md](./ROADMAP.md) for planned features and implementation timeline.

## 📄 License

Open source - see [LICENSE](./LICENSE) for details.