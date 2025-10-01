import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/portfolio/upload - Upload portfolio images to Vercel Blob
export async function POST(request: NextRequest) {
  try {
    console.log('Portfolio image upload API called')
    
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
    const beforeImage = formData.get('beforeImage') as File
    const afterImage = formData.get('afterImage') as File

    if (!beforeImage && !afterImage) {
      console.log('No images provided in form data')
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    const uploadResults: { beforeImageUrl?: string; afterImageUrl?: string } = {}

    // Upload before image if provided
    if (beforeImage) {
      console.log('Before image received:', beforeImage.name, beforeImage.size, beforeImage.type)

      // Validate file type
      if (!beforeImage.type.startsWith('image/')) {
        console.log('Invalid before image file type:', beforeImage.type)
        return NextResponse.json({ error: 'Before image must be an image file' }, { status: 400 })
      }

      // Validate file size (10MB limit)
      if (beforeImage.size > 10 * 1024 * 1024) {
        console.log('Before image too large:', beforeImage.size)
        return NextResponse.json({ error: 'Before image size must be less than 10MB' }, { status: 400 })
      }

      console.log('Uploading before image to Vercel Blob...')
      const beforeFileName = `portfolio/${user.id}/before-${Date.now()}.${beforeImage.name.split('.').pop()}`
      console.log('Before image blob filename:', beforeFileName)
      
      const beforeBlob = await put(beforeFileName, beforeImage, {
        access: 'public',
      })

      console.log('Before image uploaded successfully:', beforeBlob.url)
      uploadResults.beforeImageUrl = beforeBlob.url
    }

    // Upload after image if provided
    if (afterImage) {
      console.log('After image received:', afterImage.name, afterImage.size, afterImage.type)

      // Validate file type
      if (!afterImage.type.startsWith('image/')) {
        console.log('Invalid after image file type:', afterImage.type)
        return NextResponse.json({ error: 'After image must be an image file' }, { status: 400 })
      }

      // Validate file size (10MB limit)
      if (afterImage.size > 10 * 1024 * 1024) {
        console.log('After image too large:', afterImage.size)
        return NextResponse.json({ error: 'After image size must be less than 10MB' }, { status: 400 })
      }

      console.log('Uploading after image to Vercel Blob...')
      const afterFileName = `portfolio/${user.id}/after-${Date.now()}.${afterImage.name.split('.').pop()}`
      console.log('After image blob filename:', afterFileName)
      
      const afterBlob = await put(afterFileName, afterImage, {
        access: 'public',
      })

      console.log('After image uploaded successfully:', afterBlob.url)
      uploadResults.afterImageUrl = afterBlob.url
    }

    console.log('Portfolio image upload completed successfully')
    return NextResponse.json({ 
      success: true, 
      ...uploadResults
    })

  } catch (error) {
    console.error('Error uploading portfolio images:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to upload portfolio images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
