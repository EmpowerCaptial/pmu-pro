import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Test simple query
    const userCount = await prisma.user.count()
    console.log('✅ User count:', userCount)
    
    // Test specific user query
    const userEmail = request.headers.get('x-user-email') || 'universalbeautystudioacademy@gmail.com'
    console.log('🔍 Looking for user:', userEmail)
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })
    
    if (!user) {
      console.log('❌ User not found:', userEmail)
      return NextResponse.json({ 
        error: 'User not found',
        userEmail,
        userCount,
        availableUsers: await prisma.user.findMany({ select: { email: true } })
      }, { status: 404 })
    }
    
    console.log('✅ User found:', user.email)
    
    // Test clients query
    const clients = await prisma.client.findMany({
      where: {
        userId: user.id,
        isActive: true
      }
    })
    
    console.log('✅ Clients found:', clients.length)
    
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      clientsCount: clients.length,
      clients: clients.map(c => ({ id: c.id, name: c.name, email: c.email }))
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
