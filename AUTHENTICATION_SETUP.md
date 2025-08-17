# 🔐 Professional Authentication Setup Guide

This guide will help you set up professional authentication for PMU Pro with license verification and Stripe integration.

## 🚀 Quick Setup

### Step 1: Update Your Database Schema

**Option A: Fresh Database (Recommended)**
\`\`\`bash
# If you're starting fresh, the new schema is already in:
# scripts/001-create-tables.sql

# Apply it to your database:
psql $DATABASE_URL -f scripts/001-create-tables.sql
\`\`\`

**Option B: Existing Database**
\`\`\`bash
# If you have existing data, use the migration script:
psql $DATABASE_URL -f scripts/003-migrate-users-table.sql

# Or run the automated migration:
./scripts/migrate-database.sh
\`\`\`

### Step 2: Push Schema to Prisma
\`\`\`bash
# Update your database with Prisma
npx prisma db push

# Generate the updated Prisma client
npx prisma generate
\`\`\`

### Step 3: Add Environment Variables
Add these to your `.env.local`:
\`\`\`bash
# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Optional: File upload settings
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5000000  # 5MB
\`\`\`

## 🔑 Authentication Features

### ✅ What's Included

- **Professional Registration**: License verification required
- **Secure Login**: JWT-based authentication
- **License Verification**: Manual admin approval process
- **Password Management**: Secure hashing with bcrypt
- **Stripe Integration**: Subscription management
- **Role-based Access**: Artist roles with verification status

### 📋 User Registration Fields

\`\`\`typescript
interface UserRegistration {
  name: string              // Full name
  email: string            // Email (unique)
  password: string         // Secure password
  businessName: string     // Business/practice name
  phone?: string           // Contact phone
  licenseNumber: string    // PMU license number
  licenseState: string     // State where licensed
  yearsExperience?: string // Years in practice
  selectedPlan: string     // Subscription plan
  licenseFile?: File       // License document upload
  insuranceFile?: File     // Insurance document upload
}
\`\`\`

## 🛠️ Implementation Examples

### Registration API Route
\`\`\`typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    const { user, token } = await AuthService.register(userData)
    
    return NextResponse.json({ user, token })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
\`\`\`

### Login API Route
\`\`\`typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const credentials = await request.json()
    const { user, token } = await AuthService.login(credentials)
    
    return NextResponse.json({ user, token })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    )
  }
}
\`\`\`

### Protected Route Middleware
\`\`\`typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  const user = await AuthService.verifyToken(token)
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
  
  // Add user to request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', user.id)
  requestHeaders.set('x-user-verified', user.isLicenseVerified.toString())
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/api/protected/:path*', '/dashboard/:path*']
}
\`\`\`

## 🔐 Security Features

### Password Security
- **bcrypt hashing**: Industry-standard password hashing
- **Salt rounds**: 12 rounds for optimal security
- **Password validation**: Enforce strong passwords

### JWT Tokens
- **7-day expiration**: Automatic token expiry
- **User context**: Includes role and verification status
- **Secure secrets**: Use strong JWT secrets

### License Verification
- **Manual approval**: Admin must verify each license
- **Document upload**: License and insurance files
- **State validation**: Track licensing state/province

## 🎯 Workflow

### New User Registration
1. User fills registration form
2. License documents uploaded
3. Account created (unverified)
4. Admin reviews license documents
5. Admin approves/rejects verification
6. User gains full access after verification

### Subscription Integration
1. User selects plan during registration
2. Stripe checkout for payment
3. Webhook updates subscription status
4. Access granted based on subscription

## 📚 Next Steps

1. **Create registration form**: Build user-friendly signup
2. **Add file upload**: Handle license document uploads
3. **Admin dashboard**: License verification interface
4. **Email notifications**: Welcome and verification emails
5. **Testing**: Comprehensive authentication testing

## 🆘 Troubleshooting

### Common Issues
- **Prisma errors**: Run `npx prisma generate` after schema changes
- **JWT errors**: Ensure JWT_SECRET is set in environment
- **Database errors**: Check connection and schema migrations

### Support
- Check the database schema in `scripts/001-create-tables.sql`
- Review auth service in `lib/auth.ts`
- Test with the migration script in `scripts/migrate-database.sh`

Your PMU Pro app now has enterprise-grade authentication! 🎉
