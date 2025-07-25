# PGlite Development Guide

## 🎯 Why PGlite for Development?

PGlite is the perfect development database for the Open Fans Platform because it provides:

- **Zero Setup**: No Docker, no external services, no configuration
- **PostgreSQL Compatible**: Same SQL syntax and features as production
- **Fast**: Runs in-process, no network overhead
- **Portable**: Database travels with your code
- **Team Friendly**: Fresh clones work immediately

## 🚀 Quick Start

### 1. Clone and Run (30 seconds)

```bash
# Clone the repository
git clone <repo-url>
cd open-fans

# Install dependencies
bun install

# Create the database schema
bun run db:push

# Start development
bun run dev
```

That's it! No Docker, no database servers, no configuration files.

### 2. View Your Data

```bash
# Open Drizzle Studio to browse your database
bun run db:studio
# Opens http://localhost:4983
```

## 📁 How It Works

### Database Location
- **File**: `./tmp/db` (auto-created on first run)
- **Type**: PGlite (SQLite-compatible with PostgreSQL syntax)
- **Size**: Starts small, grows as needed
- **Backup**: Just copy the file

### Schema Management
- **Source**: `lib/schema/*.ts` files
- **Migrations**: Generated in `drizzle/` folder
- **Updates**: `bun run db:push` applies changes instantly

### Development Workflow
```
Code Change → Schema Update → Push to PGlite → Test
     ↓              ↓              ↓           ↓
  Edit .ts     bun db:generate  bun db:push  bun dev
```

## 🛠️ Available Commands

### Core Development
```bash
# Apply schema changes (most common)
bun run db:push

# Generate migration files
bun run db:generate

# Open database browser
bun run db:studio

# Reset database (start fresh)
bun run db:reset
```

### Development Server
```bash
# Start the app
bun run dev

# Type checking
bun run typecheck

# Linting
bun run lint
```

## 📊 Current Schema

### Users Table
```sql
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "username" varchar(50) NOT NULL UNIQUE,
  "email" varchar(255) NOT NULL UNIQUE,
  "password_hash" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "last_login_at" timestamp,
  "email_verified_at" timestamp
);
```

### TypeScript Integration
```typescript
import { usersTable, type UserSelect, type UserInsert } from "@/lib/schema";

// Type-safe database operations
const user: UserSelect = await db.select().from(usersTable).where(...);
const newUser: UserInsert = { username: "...", email: "...", passwordHash: "..." };
```

## 🔄 Schema Development Workflow

### Adding New Tables

1. **Create schema file**:
```typescript
// lib/schema/posts.ts
export const postsTable = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  userId: uuid("user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

2. **Export from index**:
```typescript
// lib/schema/index.ts
export * from "./users.sql";
export * from "./posts";
```

3. **Apply changes**:
```bash
bun run db:push
```

### Schema Evolution
- **Development**: Use `db:push` for instant updates
- **Production**: Use `db:generate` + `db:migrate` for versioned changes
- **Reset**: Use `db:reset` when experimenting

## 🧪 Testing with PGlite

### Unit Tests
```typescript
import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";

beforeEach(async () => {
  // Clean slate for each test
  await db.delete(usersTable);
});

test("user creation", async () => {
  const user = await db.insert(usersTable).values({
    username: "testuser",
    email: "test@example.com",
    passwordHash: "hashed",
  }).returning();
  
  expect(user.username).toBe("testuser");
});
```

### Test Database
- **Same file**: Tests use the same PGlite instance
- **Clean state**: Reset between tests as needed
- **Fast**: No network calls, pure in-memory operations

## 🚦 Development Stages

### Stage 1: Schema Design (Current)
- ✅ Users table implemented
- ✅ Migration system working
- ✅ TypeScript integration complete

### Stage 2: Authentication
- [ ] User registration
- [ ] Password hashing
- [ ] Session management
- [ ] Login/logout flows

### Stage 3: Content System
- [ ] Posts table
- [ ] Media handling
- [ ] Comment system
- [ ] Tagging

### Stage 4: Production Ready
- [ ] PostgreSQL migration
- [ ] Production deployment
- [ ] Performance optimization

## 🔍 Debugging and Troubleshooting

### Common Issues

**Schema not updating**
```bash
# Force regenerate and push
bun run db:generate
bun run db:push
```

**Database corrupted**
```bash
# Start fresh
bun run db:reset
```

**TypeScript errors**
```bash
# Check types
bun run typecheck
```

### Database Inspection

**Using Drizzle Studio**
```bash
bun run db:studio
# Browse tables, run queries, inspect data
```

**Direct File Access**
```bash
# PGlite file is at ./tmp/db
# Can be opened with any SQLite browser if needed
```

## 📈 Performance Characteristics

### Development Performance
- **Startup**: Instant (no server to start)
- **Queries**: Microsecond response times
- **Schema changes**: Immediate application
- **Testing**: No database setup overhead

### Limitations
- **Single process**: Can't share between multiple app instances
- **File size**: Large datasets may slow down (unlikely in development)
- **Features**: Some advanced PostgreSQL features not available

### When to Consider PostgreSQL
- **Production deployment**: Always use real PostgreSQL
- **Team development**: When sharing data between developers
- **Performance testing**: When testing with production-scale data
- **Advanced features**: When needing PostgreSQL-specific functionality

## 🎉 Benefits Summary

### For Individual Development
- **Instant setup**: Clone and go
- **Fast iteration**: No network overhead
- **Reliable**: No external dependencies to break
- **Portable**: Works offline, anywhere

### For Team Development
- **Consistent**: Everyone gets the same setup
- **Version controlled**: Schema changes track with code
- **Simple onboarding**: New developers productive immediately
- **Flexible**: Easy to experiment without affecting others

### For Production Migration
- **Compatible**: Same SQL syntax as PostgreSQL
- **Smooth transition**: Schema transfers directly
- **Tested**: Development behavior matches production
- **Scalable**: Easy to upgrade when needed

## 🚀 Next Steps

1. **Start developing**: The database foundation is ready
2. **Add features**: Build authentication, content system, etc.
3. **Test thoroughly**: Use the fast development cycle
4. **Deploy confidently**: Migrate to PostgreSQL when ready

PGlite gives you the best of both worlds: the simplicity of SQLite for development and the power of PostgreSQL for production. Happy coding! 🎯