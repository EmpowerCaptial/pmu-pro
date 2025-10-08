import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const settingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  appointmentReminders: z.boolean().optional(),
  clientUpdates: z.boolean().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  theme: z.string().optional(),
  twoFactorAuth: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  showEmail: z.boolean().optional(),
})

// GET /api/settings - Get user's settings
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        // Note: emailNotifications field doesn't exist in database yet
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return default settings for now (since we don't have all fields in DB yet)
    const settings = {
      emailNotifications: true, // Default value since field doesn't exist in DB
      smsNotifications: false,
      marketingEmails: true,
      appointmentReminders: true,
      clientUpdates: true,
      timezone: "America/Los_Angeles",
      language: "en",
      theme: "light",
      twoFactorAuth: false,
      publicProfile: true,
      showPhone: false,
      showEmail: true,
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Update user's settings
export async function PUT(request: NextRequest) {
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
    const validatedData = settingsSchema.parse(body)

    // For now, we'll just return the settings without updating the database
    // since the settings fields don't exist in the database schema yet
    const updateData: any = {}
    // Note: No database update since settings fields don't exist in schema yet

    const updatedUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
      }
    })

    // Return the updated settings (using validated data since DB fields don't exist yet)
    const settings = {
      emailNotifications: validatedData.emailNotifications ?? true,
      smsNotifications: validatedData.smsNotifications ?? false,
      marketingEmails: validatedData.marketingEmails ?? true,
      appointmentReminders: validatedData.appointmentReminders ?? true,
      clientUpdates: validatedData.clientUpdates ?? true,
      timezone: validatedData.timezone ?? "America/Los_Angeles",
      language: validatedData.language ?? "en",
      theme: validatedData.theme ?? "light",
      twoFactorAuth: validatedData.twoFactorAuth ?? false,
      publicProfile: validatedData.publicProfile ?? true,
      showPhone: validatedData.showPhone ?? false,
      showEmail: validatedData.showEmail ?? true,
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
