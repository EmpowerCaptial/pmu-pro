import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { wrongUserId } = await request.json()

    if (!wrongUserId) {
      return NextResponse.json(
        { error: 'Wrong user ID is required' },
        { status: 400 }
      )
    }

    // Delete the wrong user account and all associated data
    console.log(`Deleting wrong user account: ${wrongUserId}`)

    // First, delete all services associated with this user
    await prisma.service.deleteMany({
      where: { userId: wrongUserId }
    })

    // Then delete the user
    await prisma.user.delete({
      where: { id: wrongUserId }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted wrong user account: ${wrongUserId}`
    })

  } catch (error) {
    console.error('Error deleting wrong user account:', error)
    return NextResponse.json(
      { error: 'Failed to delete user account', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }}
