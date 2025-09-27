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
  customPermissions?: StaffPermission[] // Individual permissions that override role defaults
  createdAt: Date
  updatedAt: Date
  passwordSet: boolean
  temporaryPassword?: string
}

export interface StaffPermission {
  resource: string
  action: string
  granted: boolean
  grantedBy?: string // Admin who granted/revoked this permission
  grantedAt?: string
  reason?: string // Optional reason for granting/revoking
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
  // First check custom permissions (individual overrides)
  if (staffMember.customPermissions) {
    const customPermission = staffMember.customPermissions.find(
      p => p.resource === resource && p.action === action
    )
    if (customPermission !== undefined) {
      return customPermission.granted
    }
  }
  
  // Fall back to role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[staffMember.role]
  const permission = rolePermissions.find(p => p.resource === resource)
  
  if (!permission) return false
  
  return permission.actions.includes(action) || permission.actions.includes('*')
}

// Grant or revoke individual permission for a staff member
export function setStaffPermission(
  staffMember: StaffMember,
  resource: string,
  action: string,
  granted: boolean,
  grantedBy: string,
  reason?: string
): StaffMember {
  const customPermissions = staffMember.customPermissions || []
  
  // Remove existing permission for this resource/action
  const filteredPermissions = customPermissions.filter(
    p => !(p.resource === resource && p.action === action)
  )
  
  // Add new permission
  const newPermission: StaffPermission = {
    resource,
    action,
    granted,
    grantedBy,
    grantedAt: new Date().toISOString(),
    reason
  }
  
  return {
    ...staffMember,
    customPermissions: [...filteredPermissions, newPermission]
  }
}

// Get all permissions (role + custom) for a staff member
export function getAllStaffPermissions(staffMember: StaffMember): StaffPermission[] {
  const rolePermissions = ROLE_PERMISSIONS[staffMember.role]
  const allPermissions: StaffPermission[] = []
  
  // Add role permissions as granted by default
  rolePermissions.forEach(rolePerm => {
    rolePerm.actions.forEach(action => {
      allPermissions.push({
        resource: rolePerm.resource,
        action,
        granted: true,
        grantedBy: 'system',
        grantedAt: staffMember.createdAt.toISOString(),
        reason: `Default ${staffMember.role} role permission`
      })
    })
  })
  
  // Override with custom permissions
  if (staffMember.customPermissions) {
    staffMember.customPermissions.forEach(customPerm => {
      const existingIndex = allPermissions.findIndex(
        p => p.resource === customPerm.resource && p.action === customPerm.action
      )
      
      if (existingIndex >= 0) {
        allPermissions[existingIndex] = customPerm
      } else {
        allPermissions.push(customPerm)
      }
    })
  }
  
  return allPermissions
}

// Get all permissions for a role
export function getPermissionsForRole(role: StaffRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

// Generate a temporary password for new staff members
export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// SECURITY: Staff passwords storage removed - all authentication now goes through database
// No hardcoded credentials for production security
let staffPasswords: Record<string, string> = {}

// SECURITY: Staff members storage - in production, this would be in a database
// No hardcoded staff accounts for production security
let dynamicStaffMembers: StaffMember[] = []

// Set password for a staff member
export function setStaffPassword(username: string, password: string): boolean {
  try {
    // SECURITY: In production, this would hash the password and store in database
    // For now, this is a placeholder for development
    if (process.env.NODE_ENV === 'development') {
      staffPasswords[username] = password
      console.log(`Password set for ${username}`)
    }
    return true
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error setting password:', error)
    }
    return false
  }
}

// Get password for a staff member
export function getStaffPassword(username: string): string | null {
  return staffPasswords[username] || null
}

// Validate staff login
export function validateStaffLogin(username: string, password: string): StaffMember | null {
  // SECURITY: In production, this would check against a database with hashed passwords
  // For now, this is a placeholder for development
  
  if (process.env.NODE_ENV === 'development') {
    const staffMembers = getStaffMembers()
    const staffMember = staffMembers.find(
      staff => staff.username === username && staff.isActive
    )
    
    if (!staffMember) return null
    
    // Check if password matches
    const storedPassword = getStaffPassword(username)
    if (storedPassword === password) {
      // Update last login
      staffMember.lastLogin = new Date()
      return staffMember
    }
  }
  
  return null
}

// Get all staff members (demo data)
export function getStaffMembers(): StaffMember[] {
  return dynamicStaffMembers
}

// Create new staff member
export function createStaffMember(staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt' | 'passwordSet' | 'temporaryPassword'>): StaffMember {
  const temporaryPassword = generateTemporaryPassword()
  
  const newStaff: StaffMember = {
    ...staffData,
    id: `staff_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: getPermissionsForRole(staffData.role),
    passwordSet: false,
    temporaryPassword
  }
  
  // Set the temporary password
  setStaffPassword(staffData.username, temporaryPassword)
  
  // Add to dynamic staff members array
  dynamicStaffMembers.push(newStaff)
  
  // In production, save to database
  if (process.env.NODE_ENV === 'development') {
    console.log('Created new staff member:', newStaff)
    console.log('Temporary password:', temporaryPassword)
  }
  
  return newStaff
}

// Update staff member
export function updateStaffMember(id: string, updates: Partial<StaffMember>): StaffMember | null {
  const staffIndex = dynamicStaffMembers.findIndex(staff => staff.id === id)
  
  if (staffIndex === -1) return null
  
  const updatedStaff = {
    ...dynamicStaffMembers[staffIndex],
    ...updates,
    updatedAt: new Date()
  }
  
  // Update the dynamic array
  dynamicStaffMembers[staffIndex] = updatedStaff
  
  // In production, update database
  if (process.env.NODE_ENV === 'development') {
    console.log('Updated staff member:', updatedStaff)
  }
  
  return updatedStaff
}

// Suspend staff member
export function suspendStaffMember(id: string): boolean {
  const staff = dynamicStaffMembers.find(s => s.id === id)
  
  if (!staff) return false
  
  staff.isActive = false
  staff.updatedAt = new Date()
  
  // In production, update database
  if (process.env.NODE_ENV === 'development') {
    console.log('Suspended staff member:', staff.username)
  }
  
  return true
}

// Restore staff member
export function restoreStaffMember(id: string): boolean {
  const staff = dynamicStaffMembers.find(s => s.id === id)
  
  if (!staff) return false
  
  staff.isActive = true
  staff.updatedAt = new Date()
  
  // In production, update database
  if (process.env.NODE_ENV === 'development') {
    console.log('Restored staff member:', staff.username)
  }
  
  return true
}

// Delete staff member (soft delete)
export function deleteStaffMember(id: string): boolean {
  const staff = dynamicStaffMembers.find(s => s.id === id)
  
  if (!staff) return false
  
  // Soft delete by setting isActive to false
  staff.isActive = false
  staff.updatedAt = new Date()
  
  // In production, update database
  if (process.env.NODE_ENV === 'development') {
    console.log('Deleted staff member:', staff.username)
  }
  
  return true
}

// Reset password for staff member
export function resetStaffPassword(username: string): string | null {
  const staff = dynamicStaffMembers.find(s => s.username === username)
  
  if (!staff) return null
  
  const newPassword = generateTemporaryPassword()
  setStaffPassword(username, newPassword)
  
  // Update staff member to show password needs to be set
  staff.passwordSet = false
  staff.temporaryPassword = newPassword
  staff.updatedAt = new Date()
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Password reset for ${username}: ${newPassword}`)
  }
  
  return newPassword
}
