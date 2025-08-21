// Staff Authentication and Role Management System

export interface StaffMember {
  id: string
  username: string
  email: string
  role: StaffRole
  firstName: string
  lastName: string
  isActive: boolean
  lastLogin?: Date
  permissions: Permission[]
  createdAt: Date
  updatedAt: Date
}

export type StaffRole = 'representative' | 'manager' | 'director'

export interface Permission {
  resource: string
  actions: string[]
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  representative: [
    {
      resource: 'users',
      actions: ['read', 'validate']
    },
    {
      resource: 'tickets',
      actions: ['read', 'update', 'close']
    },
    {
      resource: 'complaints',
      actions: ['read', 'update']
    },
    {
      resource: 'credentials',
      actions: ['read', 'validate']
    },
    {
      resource: 'activity_logs',
      actions: ['read']
    }
  ],
  manager: [
    {
      resource: 'users',
      actions: ['read', 'validate', 'update', 'suspend']
    },
    {
      resource: 'tickets',
      actions: ['read', 'create', 'update', 'close', 'assign']
    },
    {
      resource: 'complaints',
      actions: ['read', 'create', 'update', 'escalate']
    },
    {
      resource: 'credentials',
      actions: ['read', 'validate', 'approve', 'reject']
    },
    {
      resource: 'activity_logs',
      actions: ['read', 'export']
    },
    {
      resource: 'staff',
      actions: ['read', 'create', 'update']
    },
    {
      resource: 'reports',
      actions: ['read', 'generate']
    }
  ],
  director: [
    {
      resource: 'users',
      actions: ['read', 'create', 'update', 'delete', 'suspend', 'restore']
    },
    {
      resource: 'tickets',
      actions: ['read', 'create', 'update', 'delete', 'close', 'assign', 'escalate']
    },
    {
      resource: 'complaints',
      actions: ['read', 'create', 'update', 'delete', 'escalate', 'resolve']
    },
    {
      resource: 'credentials',
      actions: ['read', 'create', 'update', 'delete', 'approve', 'reject']
    },
    {
      resource: 'activity_logs',
      actions: ['read', 'create', 'update', 'delete', 'export']
    },
    {
      resource: 'staff',
      actions: ['read', 'create', 'update', 'delete', 'suspend', 'restore']
    },
    {
      resource: 'reports',
      actions: ['read', 'create', 'update', 'delete', 'generate', 'schedule']
    },
    {
      resource: 'system',
      actions: ['read', 'update', 'configure', 'maintenance']
    },
    {
      resource: 'billing',
      actions: ['read', 'update', 'refund', 'adjust']
    }
  ]
}

// Check if staff member has permission for specific action
export function hasPermission(
  staffMember: StaffMember,
  resource: string,
  action: string
): boolean {
  const permissions = staffMember.permissions
  const permission = permissions.find(p => p.resource === resource)
  
  if (!permission) return false
  
  return permission.actions.includes(action) || permission.actions.includes('*')
}

// Get all permissions for a role
export function getPermissionsForRole(role: StaffRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

// Validate staff login
export function validateStaffLogin(username: string, password: string): StaffMember | null {
  // In production, this would check against a database
  // For now, we'll use a simple in-memory system
  
  const staffMembers = getStaffMembers()
  const staffMember = staffMembers.find(
    staff => staff.username === username && staff.isActive
  )
  
  if (!staffMember) return null
  
  // In production, use proper password hashing
  // For demo, we'll use simple password matching
  const demoPasswords = {
    'admin': 'pmupro2024',
    'director1': 'director2024',
    'manager1': 'manager2024',
    'rep1': 'representative2024',
    'tyrone': '090223'
  }
  
  if (demoPasswords[username as keyof typeof demoPasswords] === password) {
    return staffMember
  }
  
  return null
}

// Get all staff members (demo data)
export function getStaffMembers(): StaffMember[] {
  return [
    {
      id: '1',
      username: 'admin',
      email: 'admin@thepmuguide.com',
      role: 'director',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      permissions: getPermissionsForRole('director'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: '2',
      username: 'director1',
      email: 'director@thepmuguide.com',
      role: 'director',
      firstName: 'Sarah',
      lastName: 'Johnson',
      isActive: true,
      permissions: getPermissionsForRole('director'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: '3',
      username: 'manager1',
      email: 'manager@thepmuguide.com',
      role: 'manager',
      firstName: 'Michael',
      lastName: 'Chen',
      isActive: true,
      permissions: getPermissionsForRole('manager'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: '4',
      username: 'rep1',
      email: 'representative@thepmuguide.com',
      role: 'representative',
      firstName: 'Emily',
      lastName: 'Davis',
      isActive: true,
      permissions: getPermissionsForRole('representative'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: '5',
      username: 'tyrone',
      email: 'admin@thepmuguide.com',
      role: 'director',
      firstName: 'Tyrone',
      lastName: 'Jackson',
      isActive: true,
      permissions: getPermissionsForRole('director'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }
  ]
}

// Create new staff member
export function createStaffMember(staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>): StaffMember {
  const newStaff: StaffMember = {
    ...staffData,
    id: `staff_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: getPermissionsForRole(staffData.role)
  }
  
  // In production, save to database
  console.log('Created new staff member:', newStaff)
  
  return newStaff
}

// Update staff member
export function updateStaffMember(id: string, updates: Partial<StaffMember>): StaffMember | null {
  const staffMembers = getStaffMembers()
  const staffIndex = staffMembers.findIndex(staff => staff.id === id)
  
  if (staffIndex === -1) return null
  
  const updatedStaff = {
    ...staffMembers[staffIndex],
    ...updates,
    updatedAt: new Date()
  }
  
  // In production, update database
  console.log('Updated staff member:', updatedStaff)
  
  return updatedStaff
}

// Delete staff member (soft delete)
export function deleteStaffMember(id: string): boolean {
  const staffMembers = getStaffMembers()
  const staff = staffMembers.find(s => s.id === id)
  
  if (!staff) return false
  
  // Soft delete by setting isActive to false
  staff.isActive = false
  staff.updatedAt = new Date()
  
  // In production, update database
  console.log('Deleted staff member:', staff.username)
  
  return true
}
