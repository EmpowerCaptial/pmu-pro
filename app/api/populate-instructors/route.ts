import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studioName } = body
    
    // Mock instructor data for testing
    const mockInstructors = [
      {
        id: 'tierra-jackson-instructor-456',
        name: 'Tierra Jackson',
        email: 'tierra.jackson@universalbeautystudio.com',
        role: 'instructor',
        specialty: 'PMU Instructor',
        experience: '5+ years',
        rating: 4.8,
        location: studioName || 'Universal Beauty Studio',
        phone: '(555) 123-4567',
        avatar: null,
        licenseNumber: 'LIC-001',
        availability: {
          monday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          tuesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          wednesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          thursday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          friday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          saturday: [],
          sunday: []
        }
      }
    ]
    
    return NextResponse.json({
      success: true,
      instructors: mockInstructors,
      message: 'Instructors data ready for localStorage',
      localStorageKey: 'studio-instructors',
      localStorageValue: JSON.stringify(mockInstructors)
    })
    
  } catch (error) {
    console.error('Error populating instructors:', error)
    return NextResponse.json(
      { error: 'Failed to populate instructors' },
      { status: 500 }
    )
  }
}
