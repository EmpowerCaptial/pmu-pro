import { NextRequest, NextResponse } from 'next/server'
import { checkStudioSupervisionAccess, getSupervisionUser } from '@/lib/studio-supervision-gate'

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    // Get user from database
    const user = await getSupervisionUser(userEmail)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check supervision access
    const accessResult = checkStudioSupervisionAccess(user)

    return NextResponse.json(accessResult)
  } catch (error) {
    console.error('Error checking supervision access:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
