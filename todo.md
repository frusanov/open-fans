# Open Fans Platform Implementation Plan

## 🎯 Project Overview

Building a **censorship-resistant, open-protocol content publishing engine** for web and federated/social protocols. The platform supports any media type, is portable and cloud-agnostic, includes creator monetization, and federates via ActivityPub, AtProto, and RSS/Atom.

## 📊 Current State Analysis

### ✅ What We Have
- Remix framework setup with React SSR
- PGlite database with Drizzle ORM
- TailwindCSS + Radix UI components (with custom Button component)
- TypeScript configuration with path aliases
- Basic project structure with components/ui folder
- Vite build system with modern Remix features enabled
- Inter font integration
- Class variance authority for component variants

### ⚠️ Architecture Gap
- **Current**: Remix-based monolith with minimal database setup
- **Target**: Hono HTTP server with pluggable architecture
- **Strategy**: Hybrid approach - introduce Hono alongside Remix, then migrate
- **Database**: Currently using PGlite (good for dev), need migration path to production PostgreSQL

---

## 🚀 Implementation Phases

### Phase 1: Foundation & Core Platform (Weeks 1-6)

#### 1.1 Database Schema & Models
- [ ] Design core data models
  - [ ] Users (id, username, email, profile, settings)
  - [ ] Posts (id, content, metadata, visibility, monetization)
  - [ ] Media (id, file_path, mime_type, metadata, fallbacks)
  - [ ] Comments (id, post_id, user_id, content, thread_structure)
  - [ ] Tags (id, name, description, nsfw_flag)
  - [ ] Relations (followers, post_tags, user_roles)
- [ ] Create Drizzle schema files
- [ ] Set up migrations system
- [ ] Implement database seeding

#### 1.2 Storage Abstraction Layer
- [ ] Design storage interface
  ```typescript
  interface StorageAdapter {
    upload(file: File, path: string): Promise<string>
    download(path: string): Promise<ReadableStream>
    delete(path: string): Promise<void>
    exists(path: string): Promise<boolean>
  }
  ```
- [ ] Implement local filesystem adapter
- [ ] Implement S3-compatible adapter
- [ ] Create storage configuration system
- [ ] Add file validation and security checks

#### 1.3 Authentication System
- [ ] Design user model and auth flow
- [ ] Implement local authentication (bcrypt)
- [ ] Add OAuth providers
  - [ ] Twitter/X integration
  - [ ] Basic OAuth2 framework
- [ ] Create session management
- [ ] Implement JWT token system
- [ ] Add password reset functionality

#### 1.4 File Upload & Media Handling
- [ ] Create media upload endpoints
- [ ] Implement file type validation
- [ ] Add image/video processing pipeline
- [ ] Create thumbnail generation
- [ ] Implement fallback content system
- [ ] Add MIME type detection
- [ ] Create media serving endpoints

#### 1.5 Basic UI Development
- [ ] Design system components
  - [ ] Layout components
  - [ ] Form components
  - [ ] Media display components
  - [ ] Navigation components
- [ ] User authentication UI
- [ ] Content creation interface
- [ ] Content viewing interface
- [ ] User profile pages
- [ ] Responsive design implementation

### Phase 2: Content Management & Monetization (Weeks 7-12)

#### 2.1 Content Organization
- [ ] Implement tagging system
- [ ] Create content categorization
- [ ] Add NSFW content flagging
- [ ] Build content search (basic)
- [ ] Implement content filtering
- [ ] Create content moderation tools

#### 2.2 Access Control & Visibility
- [ ] Implement visibility matrix
  - [ ] Public posts
  - [ ] Private posts
  - [ ] Followers-only
  - [ ] Paid content
- [ ] Create role-based permissions
- [ ] Add content access middleware
- [ ] Implement follower system

#### 2.3 Monetization Features
- [ ] Stripe integration setup
- [ ] Payment processing system
- [ ] Subscription management
- [ ] Per-post paywalling
- [ ] Creator earnings tracking
- [ ] Payment webhooks handling
- [ ] Refund/dispute management

#### 2.4 Interaction Features
- [ ] Comment system implementation
- [ ] Like/reaction system
- [ ] Content sharing features
- [ ] User mentions
- [ ] Notification system
- [ ] Abuse reporting system

### Phase 3: Federation & APIs (Weeks 13-20)

#### 3.1 Hono Server Implementation
- [ ] Set up Hono alongside Remix
- [ ] Create API route structure
- [ ] Implement authentication middleware
- [ ] Add request validation
- [ ] Create error handling
- [ ] Set up CORS and security headers

#### 3.2 REST API Development
- [ ] User management endpoints
- [ ] Content CRUD endpoints
- [ ] Media serving endpoints
- [ ] Authentication endpoints
- [ ] Search endpoints
- [ ] Admin endpoints
- [ ] API documentation (OpenAPI)

#### 3.3 RSS/Atom Feed Generation
- [ ] Global feed generation
- [ ] Per-user feeds
- [ ] Per-tag feeds
- [ ] Media enclosure support
- [ ] Feed discovery headers
- [ ] Custom feed formats

#### 3.4 ActivityPub Implementation
- [ ] Actor model implementation
- [ ] Inbox/Outbox endpoints
- [ ] Activity serialization
- [ ] Federation discovery (WebFinger)
- [ ] Activity validation
- [ ] Remote content fetching
- [ ] Content adaptation for AP limits

#### 3.5 Import/Export System
- [ ] Data export formats (JSON, Markdown)
- [ ] Bulk export functionality
- [ ] Import from other platforms
  - [ ] WordPress importer
  - [ ] Mastodon importer
  - [ ] Generic JSON importer
- [ ] Migration tools
- [ ] Backup/restore functionality

### Phase 4: Advanced Features & Security (Weeks 21-28)

#### 4.1 Content Sandboxing
- [ ] Iframe sandboxing for HTML content
- [ ] CSP policy implementation
- [ ] Code execution limitations
- [ ] Virus scanning integration
- [ ] Content validation pipeline

#### 4.2 Advanced Search
- [ ] Full-text search implementation
- [ ] Search indexing system
- [ ] Advanced search filters
- [ ] Search result ranking
- [ ] Search analytics

#### 4.3 AtProto/Bluesky Integration
- [ ] AT Protocol client
- [ ] Content bridging
- [ ] Identity resolution
- [ ] Cross-posting functionality

#### 4.4 Moderation Tools
- [ ] Content review queue
- [ ] Automated content filtering
- [ ] User reporting system
- [ ] Moderation dashboard
- [ ] Appeal process

#### 4.5 Performance & Caching
- [ ] Content delivery network setup
- [ ] Redis caching layer
- [ ] Database query optimization
- [ ] Image optimization
- [ ] Lazy loading implementation

### Phase 5: Platform & Extensibility (Weeks 29-36)

#### 5.1 Plugin System
- [ ] Plugin architecture design
- [ ] Hook system implementation
- [ ] Plugin API development
- [ ] Plugin marketplace
- [ ] Security sandboxing for plugins

#### 5.2 Multi-Runtime Support
- [ ] Node.js optimization
- [ ] Bun compatibility
- [ ] Deno support
- [ ] Cloudflare Workers adaptation
- [ ] Docker containerization

#### 5.3 Advanced Federation
- [ ] Multi-protocol bridging
- [ ] Federation analytics
- [ ] Network discovery
- [ ] Protocol negotiation

#### 5.4 Analytics & Monitoring
- [ ] User analytics
- [ ] Content performance metrics
- [ ] System monitoring
- [ ] Error tracking
- [ ] Performance monitoring

---

## 🏗️ Technical Architecture Evolution

### Current Architecture
```
Frontend (React/Remix) → Database (PGlite/Drizzle)
```

### Target Architecture
```
Frontend (React) ↘
                  → Hono Server ↘
API Clients     ↗              → Storage Layer → Database
Federation      ↗              ↗                ↗
                                Storage Adapters (Local/S3/IPFS)
```

### Migration Strategy
1. **Weeks 1-6**: Keep Remix, add storage layer
2. **Weeks 7-12**: Introduce Hono for APIs
3. **Weeks 13-20**: Move federation to Hono
4. **Weeks 21-28**: Optimize and secure
5. **Weeks 29-36**: Full platform features

---

## 🔧 Technology Stack

### Core Technologies
- **Backend**: Hono (runtime-agnostic)
- **Frontend**: React with SSR
- **Database**: PostgreSQL (via PGlite initially)
- **ORM**: Drizzle
- **Storage**: Pluggable (Local/S3/IPFS)
- **Auth**: OAuth2 + JWT
- **Payments**: Stripe
- **Search**: ElasticSearch or built-in FTS

### Development Tools
- **Language**: TypeScript
- **Bundler**: Vite
- **Testing**: Vitest + Playwright
- **Deployment**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

### Federation Protocols
- **ActivityPub**: W3C standard for social networks
- **AtProto**: Bluesky's distributed protocol
- **RSS/Atom**: Classic feed syndication
- **WebFinger**: Identity discovery

---

## 📝 Development Guidelines

### Code Organization
```
app/
├── routes/           # Remix routes (UI)
├── api/             # Hono API routes
├── components/      # React components
├── lib/            # Shared utilities
├── models/         # Database models
├── services/       # Business logic
├── federation/     # Protocol implementations
├── storage/        # Storage adapters
└── plugins/        # Plugin system
```

### Key Principles
1. **Runtime Agnostic**: All server code must work across Node.js, Bun, Deno, Workers
2. **Storage Agnostic**: Abstract all file operations behind interfaces
3. **Security First**: Sandbox all user content, validate all inputs
4. **Federation Ready**: Design APIs with federation in mind
5. **Performance**: Optimize for large files and high concurrency
6. **Extensible**: Plugin architecture for customization

### Testing Strategy
- Unit tests for all business logic
- Integration tests for APIs
- E2E tests for critical user flows
- Federation compatibility tests
- Performance benchmarks

---

## 🚦 Success Metrics

### Phase 1 Success
- [ ] Users can register and authenticate
- [ ] Users can upload and view content
- [ ] Basic content organization works
- [ ] Media files are properly stored

### Phase 2 Success
- [ ] Content monetization is functional
- [ ] Access controls work correctly
- [ ] User interactions are smooth
- [ ] Payment processing is reliable

### Phase 3 Success
- [ ] ActivityPub federation works
- [ ] RSS feeds are generated
- [ ] APIs are fully functional
- [ ] Import/export is operational

### Phase 4 Success
- [ ] Content is properly sandboxed
- [ ] Search is fast and accurate
- [ ] Moderation tools are effective
- [ ] Performance is optimized

### Phase 5 Success
- [ ] Platform runs on multiple runtimes
- [ ] Plugin system is functional
- [ ] Advanced federation works
- [ ] System is production-ready

---

## ⚡ Immediate Next Steps (Week 1)

### 🔧 Development Environment Setup
1. **Database & Migrations**
   - [ ] Install drizzle-kit for migrations: `bun add -D drizzle-kit`
   - [ ] Create `drizzle.config.ts` configuration
   - [ ] Set up migration scripts in package.json
   - [ ] Create initial schema files in `lib/schema/`

2. **Testing Framework**
   - [ ] Install Vitest: `bun add -D vitest @vitest/ui`
   - [ ] Install Playwright: `bun add -D @playwright/test`
   - [ ] Create test configuration files
   - [ ] Set up test scripts in package.json

3. **Development Tools**
   - [ ] Create `docker-compose.yml` for PostgreSQL
   - [ ] Add environment variable management (.env files)
   - [ ] Set up hot reload for development
   - [ ] Configure ESLint rules for the project

### 📊 Database Schema Design
4. **Core Schema Planning**
   - [ ] Create ERD diagram (use draw.io or similar)
   - [ ] Define user authentication table structure
   - [ ] Plan content/post table with JSON metadata
   - [ ] Design media files table with fallback support
   - [ ] Plan federation-ready user profiles

5. **Implementation Priority**
   - [ ] Start with User model (extends current auth)
   - [ ] Add Post model with rich metadata
   - [ ] Create Media model with file references
   - [ ] Add basic relationship tables

### 🗂️ Project Structure Updates
6. **Organize Code Structure**
   - [ ] Create `app/lib/schema/` for database schemas
   - [ ] Create `app/lib/types/` for TypeScript interfaces
   - [ ] Create `app/services/` for business logic
   - [ ] Create `app/lib/storage/` for storage adapters
   - [ ] Update import paths in existing files

### 🔐 Basic Authentication
7. **User System Foundation**
   - [ ] Install auth dependencies: `bun add bcryptjs jsonwebtoken`
   - [ ] Create user registration route
   - [ ] Add login/logout functionality
   - [ ] Implement session management
   - [ ] Create protected route middleware

### 📁 File Upload Basics
8. **Media Handling**
   - [ ] Install file upload deps: `bun add multer @types/multer`
   - [ ] Create upload endpoint in Remix action
   - [ ] Add file validation (size, type, security)
   - [ ] Implement local storage first
   - [ ] Create media serving route

## 📋 Current Project Analysis

### Existing Code Review
- **Root Layout**: Uses Inter font, includes basic Button component
- **Database**: PGlite setup in `lib/db.ts` needs migration strategy
- **UI Components**: Custom Button with CVA variants, ready for extension
- **Build System**: Modern Vite + Remix with v3 features enabled
- **Styling**: TailwindCSS v4 with utilities class merging

### Immediate Technical Debt
- [ ] Fix Button component in root layout (currently renders empty)
- [ ] Set up proper environment configuration
- [ ] Add TypeScript strict mode configurations
- [ ] Plan PGlite → PostgreSQL migration path
- [ ] Create proper development/production configs

### Recommended Dependencies to Add
```bash
# Database & Auth
bun add bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
bun add drizzle-kit -D

# File Upload & Storage
bun add multer @types/multer mime-types @types/mime-types

# Testing
bun add vitest @vitest/ui @playwright/test -D

# Utilities
bun add zod uuid @types/uuid
```

This roadmap provides a structured approach to building the comprehensive open-fans platform while maintaining flexibility for adjustments based on learnings and feedback.