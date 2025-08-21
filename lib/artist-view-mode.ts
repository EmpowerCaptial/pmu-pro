// Artist View Mode System for Staff
// Allows staff to view user accounts from the user's perspective

export interface ArtistViewMode {
  isActive: boolean
  userId: string
  userRole: string
  userEmail: string
  userName: string
  enteredAt: Date
  enteredBy: string
  staffRole: string
}

export interface EditPermission {
  canEdit: boolean
  requiresApproval: boolean
  approvalType: 'none' | 'manager' | 'director'
  reason?: string
}

// Check if staff member can edit in artist view mode
export function checkEditPermission(
  staffRole: string,
  action: string,
  resource: string
): EditPermission {
  switch (staffRole) {
    case 'director':
      return {
        canEdit: true,
        requiresApproval: false,
        approvalType: 'none'
      }
    
    case 'manager':
      return {
        canEdit: true,
        requiresApproval: false,
        approvalType: 'none'
      }
    
    case 'representative':
      // Representatives can view but need manager approval for changes
      return {
        canEdit: false,
        requiresApproval: true,
        approvalType: 'manager',
        reason: 'Representatives require manager approval for account changes'
      }
    
    default:
      return {
        canEdit: false,
        requiresApproval: true,
        approvalType: 'manager',
        reason: 'Unknown role - requires approval'
      }
  }
}

// Get permission message for staff
export function getPermissionMessage(permission: EditPermission): string {
  if (permission.canEdit) {
    return 'You have full editing access'
  }
  
  if (permission.requiresApproval) {
    return `Changes require ${permission.approvalType} approval: ${permission.reason}`
  }
  
  return 'View-only access'
}

// Validate manager approval
export function validateManagerApproval(
  managerUsername: string,
  managerPassword: string
): boolean {
  // In production, this would validate against the staff database
  // For demo, we'll use predefined manager credentials
  
  const validManagers = {
    'manager1': 'manager2024',
    'admin': 'pmupro2024',
    'director1': 'director2024'
  }
  
  return validManagers[managerUsername as keyof typeof validManagers] === managerPassword
}

// Get artist view mode status
export function getArtistViewMode(): ArtistViewMode | null {
  if (typeof window === 'undefined') return null
  
  const viewMode = localStorage.getItem('artistViewMode')
  if (!viewMode) return null
  
  try {
    return JSON.parse(viewMode)
  } catch {
    return null
  }
}

// Set artist view mode
export function setArtistViewMode(viewMode: ArtistViewMode): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('artistViewMode', JSON.stringify(viewMode))
}

// Clear artist view mode
export function clearArtistViewMode(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('artistViewMode')
}

// Check if currently in artist view mode
export function isInArtistViewMode(): boolean {
  const viewMode = getArtistViewMode()
  return viewMode?.isActive || false
}

// Get current user context in artist view mode
export function getCurrentUserContext(): ArtistViewMode | null {
  return getArtistViewMode()
}

// Exit artist view mode
export function exitArtistViewMode(): void {
  clearArtistViewMode()
  // Redirect back to staff dashboard
  if (typeof window !== 'undefined') {
    window.location.href = '/staff-admin/dashboard'
  }
}
