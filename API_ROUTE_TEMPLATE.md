# 🚀 API Route Template for PMU Pro

**USE THIS TEMPLATE FOR ALL NEW API ROUTES**

This template prevents the "Server has closed the connection" errors and ensures proper serverless operation.

## ✅ Standard GET Route

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'  // ✅ Always use singleton

export const dynamic = "force-dynamic"  // ✅ Required for all database routes

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication - Get user email from header
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify user exists
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        role: true,
        studioName: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Your logic here - fetch data
    const data = await prisma.yourModel.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    // 4. Return success response
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Error in GET /api/your-route:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
  // ✅ NO finally block, NO $disconnect()
}
```

## ✅ Standard POST Route (Create)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = "force-dynamic"

// Validation schema
const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  // Add your fields here
})

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Parse and validate request body
    const body = await request.json()
    const validatedData = createSchema.parse(body)

    // 4. Create in database
    const item = await prisma.yourModel.create({
      data: {
        userId: user.id,
        ...validatedData
      }
    })

    // 5. Return created item
    return NextResponse.json({ success: true, item }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/your-route:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
```

## ✅ Standard DELETE Route

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authentication
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify user and check permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true, studioName: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has permission to delete (e.g., owner, manager)
    if (!['owner', 'manager', 'director'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only owners and managers can delete.' },
        { status: 403 }
      )
    }

    // 3. Get the ID to delete
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    // 4. Verify the item belongs to the user (security check)
    const item = await prisma.yourModel.findUnique({
      where: { id },
      select: { id: true, userId: true }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (item.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this item' }, { status: 403 })
    }

    // 5. Delete the item
    await prisma.yourModel.delete({
      where: { id }
    })

    // 6. Return success
    return NextResponse.json({ success: true, message: 'Deleted successfully' })

  } catch (error) {
    console.error('Error in DELETE /api/your-route:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
```

## ✅ Standard PATCH Route (Update)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = "force-dynamic"

const updateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  // Add your fields here
})

export async function PATCH(request: NextRequest) {
  try {
    // 1. Authentication
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Parse and validate
    const body = await request.json()
    const validatedData = updateSchema.parse(body)
    const { id, ...updateFields } = validatedData

    // 4. Verify ownership
    const item = await prisma.yourModel.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!item || item.userId !== user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    // 5. Update
    const updated = await prisma.yourModel.update({
      where: { id },
      data: updateFields
    })

    return NextResponse.json({ success: true, item: updated })

  } catch (error) {
    console.error('Error in PATCH /api/your-route:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
```

---

## ❌ **NEVER DO THIS:**

```typescript
// ❌ DON'T create new PrismaClient instances
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ❌ DON'T disconnect in routes
finally {
  await prisma.$disconnect()
}

// ❌ DON'T forget the dynamic export
// (missing export const dynamic = "force-dynamic")

// ❌ DON'T skip authentication
// (missing x-user-email header check)
```

---

## 🔍 **Checklist for New Routes:**

Before committing any new API route, verify:

- [ ] Uses `import { prisma } from '@/lib/prisma'`
- [ ] Has `export const dynamic = "force-dynamic"`
- [ ] Gets `x-user-email` header for auth
- [ ] Returns proper error codes (401, 403, 404, 500)
- [ ] NO `new PrismaClient()`
- [ ] NO `prisma.$disconnect()`
- [ ] NO `finally` blocks
- [ ] Includes error logging with `console.error()`

---

## 📝 **Your Specific Question:**

**Did the team deletion feature cause issues?**

**Answer:** Your feature had the same anti-patterns as the existing codebase, but it **didn't trigger the failure**. The "bullet-proofing" system the next day is what triggered the cascade of errors because it:
1. Changed how API calls were made (via `lib/http.ts`)
2. Forgot to include authentication headers
3. Combined with the connection pooling issue, everything failed at once

**Your team deletion feature is fine now** - I already fixed it (along with the other 68 routes) to use the singleton Prisma client and removed the `$disconnect()` call.

---

**Want me to use this template when you ask for the user deletion feature?**

