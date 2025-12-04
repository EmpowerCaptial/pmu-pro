import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword, adminEmail } = await request.json()
    
    // Support both header-based auth (for CRM) and body-based auth (for admin page)
    const adminEmailFromHeader = request.headers.get('x-user-email')
    const adminEmailToUse = adminEmailFromHeader || adminEmail
    
    if (!email || !newPassword) {
      return NextResponse.json({ 
        error: 'Email and new password are required' 
      }, { status: 400 })
    }
    
    if (!adminEmailToUse) {
      return NextResponse.json({ 
        error: 'Admin authentication required' 
      }, { status: 401 })
    }
    
    // Verify admin permissions
    const admin = await prisma.user.findUnique({
      where: { email: adminEmailToUse },
      select: { role: true }
    })
    
    if (!admin || admin.role.toLowerCase() !== 'owner') {
      return NextResponse.json({ 
        error: 'Unauthorized. Only owners can reset passwords.' 
      }, { status: 403 })
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
        password: hashedPassword
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

