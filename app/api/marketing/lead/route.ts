import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/email-service'

// Validation schema
const leadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  plan: z.enum(['self_serve', 'optimized']),
  notes: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate the request body
    const validatedData = leadSchema.parse(body)
    
    // Store in database using Prisma
    const lead = await prisma.marketingLead.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company,
        plan: validatedData.plan,
        notes: validatedData.notes,
        source: 'website',
        status: 'new'
      }
    })
    
    // Send email notification to ops team
    try {
      await EmailService.sendEmail({
        to: 'ops@thepmuguide.com',
        subject: `New Marketing Lead: ${validatedData.name}`,
        html: `
          <h2>New Marketing Lead</h2>
          <p><strong>Name:</strong> ${validatedData.name}</p>
          <p><strong>Email:</strong> ${validatedData.email}</p>
          <p><strong>Phone:</strong> ${validatedData.phone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${validatedData.company || 'Not provided'}</p>
          <p><strong>Plan:</strong> ${validatedData.plan}</p>
          <p><strong>Notes:</strong> ${validatedData.notes || 'None'}</p>
          <p><strong>Lead ID:</strong> ${lead.id}</p>
        `
      })
    } catch (emailError) {
      // Email failure shouldn't break the lead capture
      if (process.env.NODE_ENV === 'development') {
        console.error('Email notification failed:', emailError)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Lead captured successfully',
      leadId: lead.id
    })
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Lead capture error:', error)
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error',
          errors: error.issues 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
