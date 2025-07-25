# Database Setup Guide

## Overview

The Open Fans Platform uses PGlite as its development database with Drizzle ORM for schema management and migrations. PGlite is a lightweight, SQLite-compatible database that runs entirely in your local environment without requiring Docker or external database servers.

## Quick Start

### 1. Start Development (No Setup Required!)

```bash
# PGlite database is created automatically on first run
# Just push the schema and start developing
bun run db:push

# Start the development server
bun run dev
```

### 2. View Your Database

```bash
# Open Drizzle Studio to browse your data
bun run db:studio
```

## Database Scripts

### Core Development Commands

```bash
# Generate new migration from schema changes
bun run db:generate

# Push schema directly to database (recommended for development)
bun run db:push

# Open Drizzle Studio (database browser)
bun run db:studio

# Reset database (delete all data and recreate)
bun run db:reset
```

## Configuration

### PGlite Setup

No configuration required! PGlite works out of the box:

- **Database file**: Stored in `./tmp/db` (auto-created)
- **No servers**: Runs entirely in your Node.js process
- **No Docker**: No external dependencies needed
- **Git-friendly**: Database file is gitignored, fresh clone just works

### Drizzle Configuration

The `drizzle.config.ts` file configures:

- **Schema location**: `./lib/schema/*`
- **Migration output**: `./drizzle/`
- **Database dialect**: PostgreSQL (PGlite uses PostgreSQL syntax)
- **Database file**: `./tmp/db`

## Schema Structure

### Current Tables

#### Users Table

The users table provides a clean, minimal foundation for user authentication:

- **Identity**: id, username, email, password_hash
- **Timestamps**: created_at, updated_at, last_login_at, email_verified_at

This simplified schema focuses on core authentication needs. Additional features like profiles, settings, and federation fields can be added in future iterations as needed.

### Schema Organization

```
lib/schema/
├── index.ts          # Exports all schemas
├── users.sql.ts      # User accounts and authentication
├── posts.ts          # Content posts (coming next)
├── media.ts          # File uploads and media
├── comments.ts       # Comment system
├── tags.ts           # Content tagging
└── relations.ts      # User relationships
```

## Development Workflow

### Adding New Tables

1. Create a new schema file in `lib/schema/`
2. Define the table using Drizzle schema syntax
3. Export the table and types from the schema file
4. Update `lib/schema/index.ts` to include exports
5. Generate and apply migration:

```bash
bun run db:generate
bun run db:push  # or db:migrate for production
```

### Schema Best Practices

1. **Use UUIDs** for primary keys (better for federation and scaling)
2. **Timestamps** for all tables (created_at, updated_at)
3. **Start simple** then add complexity as needed
4. **Unique constraints** for usernames and emails
5. **Extensible design** that allows for future feature additions

## Production Deployment

### Migration from PGlite

When ready for production, you can migrate to PostgreSQL:

1. **Export data**: Use Drizzle to export your data
2. **Set up PostgreSQL**: Configure production database
3. **Update environment**: Set `DATABASE_URL` to PostgreSQL connection
4. **Run migrations**: Apply the same schema to production
5. **Import data**: Migrate your development data

### Production Database Options

1. **Self-hosted PostgreSQL**: Traditional setup
2. **Cloud providers**: AWS RDS, Google Cloud SQL, etc.
3. **Serverless**: PlanetScale, Neon, Supabase
4. **Edge databases**: Turso, Cloudflare D1

## Troubleshooting

### Common Issues

**Schema changes not appearing**
```bash
# Regenerate and push schema
bun run db:generate
bun run db:push
```

**Database corrupted or strange errors**
```bash
# Reset database completely
bun run db:reset
```

**Permission errors on ./tmp/db**
```bash
# Make sure tmp directory is writable
mkdir -p ./tmp
chmod 755 ./tmp
```

### Debugging Queries

Use Drizzle Studio to inspect database state:

```bash
bun run db:studio
# Opens http://localhost:4983
```

Or inspect the PGlite database file directly with any SQLite browser.

## Benefits of PGlite for Development

### Advantages
- **Zero setup**: No Docker, no servers, just code
- **Fast**: No network overhead, runs in-process
- **Portable**: Database file travels with your code
- **PostgreSQL compatible**: Same SQL syntax as production
- **Team friendly**: Fresh clones work immediately

### When to Migrate to PostgreSQL
- **Production deployment**: Real applications need real databases
- **Team development**: When multiple developers need shared data
- **Performance testing**: When you need production-like performance
- **Advanced features**: When you need PostgreSQL-specific features