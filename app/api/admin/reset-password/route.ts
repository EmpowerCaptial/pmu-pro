import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword, adminEmail } = await request.json()
    
    if (!email || !newPassword || !adminEmail) {
      return NextResponse.json({ 
        error: 'Email, new password, and admin email required' 
      }, { status: 400 })
    }
    
    // Verify admin permissions
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { role: true }
    })
    
    if (!admin || !['owner', 'admin', 'manager'].includes(admin.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        studioName: 'Universal Beauty Studio Academy',
        businessName: 'Universal Beauty Studio - Tyrone Jackson'
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: `Password reset for ${user.name}`,
      user: {
        email: user.email,
        name: user.name,
        id: user.id
      }
    })
    
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ 
      error: 'Failed to reset password',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

