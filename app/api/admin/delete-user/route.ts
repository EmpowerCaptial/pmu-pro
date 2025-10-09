import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { email, adminEmail } = await request.json()
    
    if (!email || !adminEmail) {
      return NextResponse.json({ error: 'Email and admin email required' }, { status: 400 })
    }
    
    // Verify admin permissions
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { role: true }
    })
    
    if (!admin || !['owner', 'admin', 'manager'].includes(admin.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Delete user
    const deleted = await prisma.user.delete({
      where: { email }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${deleted.email} deleted successfully`,
      deletedUser: {
        email: deleted.email,
        name: deleted.name
      }
    })
    
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.error('Error deleting user:', error)
    return NextResponse.json({ 
      error: 'Failed to delete user',
      details: error.message 
    }, { status: 500 })
  }
}
