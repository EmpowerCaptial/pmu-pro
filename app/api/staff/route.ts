import { NextRequest, NextResponse } from 'next/server'
import { 
  getStaffMembers, 
  createStaffMember, 
  updateStaffMember, 
 
deleteStaffMember,
  type StaffMember 
} from '@/lib/staff-auth'

// GET /api/staff - Get all staff members
export async function GET(request: NextRequest) {
  try {
    const staffMembers = getStaffMembers()
    
    return NextResponse.json({
      success: true,
      data: staffMembers,
      count: staffMembers.length
    })
  } catch (error) {
    console.error('Error fetching staff members:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff members' },
      { status: 500 }
    )
  }
}

// POST /api/staff - Create new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, firstName, lastName, role } = body

    // Validation
    if (!username || !email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingStaff = getStaffMembers().find(staff => staff.username === username)
    if (existingStaff) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Check if email already exists
    const existingEmail = getStaffMembers().find(staff => staff.email === email)
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      )
    }

    const newStaff = createStaffMember({
      username,
      email,
      firstName,
      lastName,
      role,
      isActive: true,
      permissions: []
    })

    return NextResponse.json({
      success: true,
      data: newStaff,
      message: 'Staff member created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating staff member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create staff member' },
      { status: 500 }
    )
  }
}

// PUT /api/staff - Update staff member
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Staff member ID is required' },
        { status: 400 }
      )
    }

    const updatedStaff = updateStaffMember(id, updates)
    
    if (!updatedStaff) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedStaff,
      message: 'Staff member updated successfully'
    })
  } catch (error) {
    console.error('Error updating staff member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update staff member' },
      { status: 500 }
    )
  }
}

// DELETE /api/staff - Delete staff member
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Staff member ID is required' },
        { status: 400 }
      )
    }

    const success = deleteStaffMember(id)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting staff member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete staff member' },
      { status: 500 }
    )
  }
}
