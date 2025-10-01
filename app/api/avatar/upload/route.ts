import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/avatar/upload - Upload avatar to Vercel Blob and update user
export async function POST(request: NextRequest) {
  try {
    console.log('Avatar upload API called')
    
    const userEmail = request.headers.get('x-user-email')
    console.log('User email:', userEmail)
    
    if (!userEmail) {
      console.log('No user email provided')
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    console.log('Looking up user in database...')
    let user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    // If user not found in database, create a demo user entry
    if (!user) {
      console.log('User not found in database, creating demo user...')
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: 'Demo User',
          password: 'demo', // Placeholder password for demo users
          businessName: 'Demo Studio',
          phone: '',
          licenseNumber: '',
          licenseState: '',
          yearsExperience: '',
          selectedPlan: 'demo',
          hasActiveSubscription: false,
          isLicenseVerified: false,
          role: 'artist',
          subscriptionStatus: 'demo'
        }
      })
      console.log('Demo user created:', user.id)
    } else {
      console.log('User found:', user.id)
    }
    console.log('Parsing form data...')
    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      console.log('No file provided in form data')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', file.name, file.size, file.type)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type)
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size)
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    console.log('Uploading to Vercel Blob...')
    const fileName = `avatars/${user.id}-${Date.now()}.${file.name.split('.').pop()}`
    console.log('Blob filename:', fileName)
    
    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
    })

    console.log('Blob uploaded successfully:', blob.url)

    // Update user's avatar URL in database
    console.log('Updating user avatar in database...')
    await prisma.user.update({
      where: { email: userEmail },
      data: { avatar: blob.url }
    })

    console.log('Avatar upload completed successfully')
    return NextResponse.json({ 
      success: true, 
      avatarUrl: blob.url 
    })

  } catch (error) {
    console.error('Error uploading avatar:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to upload avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
