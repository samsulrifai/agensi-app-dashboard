<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Worker & Admin Dashboard — Project Rules

## Tech Stack
- Next.js 16 (App Router)
- Prisma 7 (with `prisma.config.ts` for datasource config — NOT in `schema.prisma`)
- NextAuth.js v5 (beta) — import from `next-auth`, config in `src/lib/auth.ts`
- Neon Serverless PostgreSQL (pooled URL in DATABASE_URL, direct in DATABASE_URL_UNPOOLED)
- `@prisma/adapter-neon` required for PrismaClient

## Critical Rules

### Next.js 16 Route Handlers
Dynamic params MUST be awaited:
```typescript
// CORRECT
async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
// WRONG — will cause TypeScript errors
async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  params.id // ERROR
}
```

### Prisma v7
- Do NOT put `url` in `datasource` block in `schema.prisma`
- Database URL goes in `prisma.config.ts` (use `DATABASE_URL_UNPOOLED` for migrations)
- Always use `PrismaNeon` adapter from `@prisma/adapter-neon`

### Authentication
- `auth()` from `@/lib/auth` returns `null` if unauthenticated
- Use `getAuthSession()` / `requireRole()` from `@/lib/api-helpers` in API routes
- Session user has: `id`, `email`, `name`, `role` (`worker` | `admin`), `avatarUrl`

### Response Format
All API responses use:
```typescript
ok(data)     // { success: true, data }
err(message) // { success: false, error: message }
```

## Demo Credentials
- Admin: `admin@demo.com` / `demo1234`
- Admin: `rina@demo.com` / `demo1234`
- Worker: `andi@demo.com` / `demo1234`
- Worker: `budi@demo.com` / `demo1234`

