import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json()

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has a real password (not temp-password)
    const isTempPassword = await bcrypt.compare('temp-password', user.password)
    if (!isTempPassword) {
      return NextResponse.json({ error: 'Password has already been set for this account' }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    if (process.env.NODE_ENV === 'development') {
      console.log(`Password set for user: ${user.email}`)
    }

    return NextResponse.json({ 
      message: 'Password has been set successfully.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Setup password API error:', error)
    }
    return NextResponse.json(
      { error: 'Failed to set password.' },
      { status: 500 }
    )
  }
}
