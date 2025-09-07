import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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
    
    // TODO: Store in database using Prisma
    // For now, just log the lead
    console.log('Marketing lead received:', validatedData)
    
    // TODO: Send email notification to ops@thepmuguide.com
    // TODO: Add to CRM system
    
    return NextResponse.json({ 
      success: true, 
      message: 'Lead captured successfully',
      leadId: `lead_${Date.now()}` // Temporary ID
    })
    
  } catch (error) {
    console.error('Lead capture error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error',
          errors: error.errors 
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
