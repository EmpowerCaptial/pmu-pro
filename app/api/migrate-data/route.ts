import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/migrate-data - Migrate localStorage data to database
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { portfolioData, profileData, avatarData, clientData } = body

    let migratedCount = 0
    let errors: string[] = []

    // Migrate portfolio data
    if (portfolioData && Array.isArray(portfolioData)) {
      for (const item of portfolioData) {
        try {
          await prisma.portfolio.create({
            data: {
              userId: user.id,
              type: item.type || 'other',
              title: item.title || 'Untitled',
              description: item.description || null,
              beforeImage: item.beforeImage || null,
              afterImage: item.afterImage || null,
              isPublic: item.isPublic !== undefined ? item.isPublic : true,
              date: item.date ? new Date(item.date) : new Date()
            }
          })
          migratedCount++
        } catch (error) {
          errors.push(`Portfolio item "${item.title}": ${error}`)
        }
      }
    }

    // Migrate profile data
    if (profileData) {
      try {
        const updateData: any = {}
        
        if (profileData.bio) updateData.bio = profileData.bio
        if (profileData.studioName) updateData.studioName = profileData.studioName
        if (profileData.website) updateData.website = profileData.website
        if (profileData.instagram) updateData.instagram = profileData.instagram
        if (profileData.experience) updateData.experience = profileData.experience
        if (avatarData) updateData.avatar = avatarData
        
        if (profileData.address) {
          updateData.address = typeof profileData.address === 'string' 
            ? profileData.address 
            : JSON.stringify(profileData.address)
        }
        if (profileData.businessHours) {
          updateData.businessHours = typeof profileData.businessHours === 'string'
            ? profileData.businessHours
            : JSON.stringify(profileData.businessHours)
        }
        if (profileData.specialties) {
          updateData.specialties = typeof profileData.specialties === 'string'
            ? profileData.specialties
            : JSON.stringify(profileData.specialties)
        }
        if (profileData.certifications) {
          updateData.certifications = typeof profileData.certifications === 'string'
            ? profileData.certifications
            : JSON.stringify(profileData.certifications)
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { email: userEmail },
            data: updateData
          })
          migratedCount++
        }
      } catch (error) {
        errors.push(`Profile data: ${error}`)
      }
    }

    // Migrate client data
    if (clientData && Array.isArray(clientData)) {
      for (const client of clientData) {
        try {
          await prisma.client.create({
            data: {
              userId: user.id,
              name: client.name || 'Unknown Client',
              email: client.email || null,
              phone: client.phone || null,
              notes: client.notes || null,
              dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth) : null,
              emergencyContact: client.emergencyContact || null,
              medicalHistory: client.medicalHistory || client.medicalConditions ? JSON.stringify(client.medicalConditions) : null,
              allergies: client.allergies ? (Array.isArray(client.allergies) ? JSON.stringify(client.allergies) : client.allergies) : null,
              skinType: client.skinType || client.skinConditions ? JSON.stringify(client.skinConditions) : null,
              isActive: true
            }
          })
          migratedCount++
        } catch (error) {
          errors.push(`Client "${client.name}": ${error}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      migratedCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error migrating data:', error)
    return NextResponse.json(
      { error: 'Failed to migrate data' },
      { status: 500 }
    )
  }
}
