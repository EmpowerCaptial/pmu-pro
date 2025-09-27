"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  CheckCircle, 
  XCircle, 
  Settings, 
  Shield, 
  User, 
  FileText, 
  Users, 
  BarChart3,
  CreditCard,
  Cog,
  AlertCircle,
  Info
} from 'lucide-react'
import { StaffMember, StaffPermission, getAllStaffPermissions, hasPermission } from '@/lib/staff-auth'

interface PermissionManagerProps {
  staffMember: StaffMember
  currentAdmin: StaffMember
  onPermissionChange: (staffId: string, permission: StaffPermission) => void
}

// Define all possible permissions with descriptions
const ALL_PERMISSIONS = [
  {
    resource: 'users',
    actions: [
      { action: 'read', description: 'View user accounts', icon: User },
      { action: 'create', description: 'Create new user accounts', icon: User },
      { action: 'update', description: 'Update user information', icon: User },
      { action: 'delete', description: 'Delete user accounts', icon: User },
      { action: 'suspend', description: 'Suspend user accounts', icon: User },
      { action: 'restore', description: 'Restore suspended accounts', icon: User },
      { action: 'validate', description: 'Validate user credentials', icon: Shield }
    ]
  },
  {
    resource: 'tickets',
    actions: [
      { action: 'read', description: 'View support tickets', icon: FileText },
      { action: 'create', description: 'Create new tickets', icon: FileText },
      { action: 'update', description: 'Update ticket status', icon: FileText },
      { action: 'delete', description: 'Delete tickets', icon: FileText },
      { action: 'close', description: 'Close tickets', icon: FileText },
      { action: 'assign', description: 'Assign tickets to staff', icon: FileText },
      { action: 'escalate', description: 'Escalate tickets', icon: FileText }
    ]
  },
  {
    resource: 'complaints',
    actions: [
      { action: 'read', description: 'View complaints', icon: AlertCircle },
      { action: 'create', description: 'Create complaint records', icon: AlertCircle },
      { action: 'update', description: 'Update complaint status', icon: AlertCircle },
      { action: 'delete', description: 'Delete complaints', icon: AlertCircle },
      { action: 'escalate', description: 'Escalate complaints', icon: AlertCircle },
      { action: 'resolve', description: 'Resolve complaints', icon: AlertCircle }
    ]
  },
  {
    resource: 'credentials',
    actions: [
      { action: 'read', description: 'View credential requests', icon: Shield },
      { action: 'create', description: 'Create credential records', icon: Shield },
      { action: 'update', description: 'Update credential status', icon: Shield },
      { action: 'delete', description: 'Delete credentials', icon: Shield },
      { action: 'approve', description: 'Approve credentials', icon: Shield },
      { action: 'reject', description: 'Reject credentials', icon: Shield },
      { action: 'validate', description: 'Validate credentials', icon: Shield }
    ]
  },
  {
    resource: 'activity_logs',
    actions: [
      { action: 'read', description: 'View activity logs', icon: BarChart3 },
      { action: 'create', description: 'Create log entries', icon: BarChart3 },
      { action: 'update', description: 'Update log entries', icon: BarChart3 },
      { action: 'delete', description: 'Delete log entries', icon: BarChart3 },
      { action: 'export', description: 'Export activity logs', icon: BarChart3 }
    ]
  },
  {
    resource: 'staff',
    actions: [
      { action: 'read', description: 'View staff members', icon: Users },
      { action: 'create', description: 'Create staff accounts', icon: Users },
      { action: 'update', description: 'Update staff information', icon: Users },
      { action: 'delete', description: 'Delete staff accounts', icon: Users },
      { action: 'suspend', description: 'Suspend staff accounts', icon: Users },
      { action: 'restore', description: 'Restore suspended staff', icon: Users }
    ]
  },
  {
    resource: 'reports',
    actions: [
      { action: 'read', description: 'View reports', icon: BarChart3 },
      { action: 'create', description: 'Create reports', icon: BarChart3 },
      { action: 'update', description: 'Update reports', icon: BarChart3 },
      { action: 'delete', description: 'Delete reports', icon: BarChart3 },
      { action: 'generate', description: 'Generate reports', icon: BarChart3 },
      { action: 'schedule', description: 'Schedule reports', icon: BarChart3 }
    ]
  },
  {
    resource: 'system',
    actions: [
      { action: 'read', description: 'View system settings', icon: Cog },
      { action: 'update', description: 'Update system settings', icon: Cog },
      { action: 'configure', description: 'Configure system', icon: Cog },
      { action: 'maintenance', description: 'Perform maintenance', icon: Cog }
    ]
  },
  {
    resource: 'billing',
    actions: [
      { action: 'read', description: 'View billing information', icon: CreditCard },
      { action: 'update', description: 'Update billing settings', icon: CreditCard },
      { action: 'refund', description: 'Process refunds', icon: CreditCard },
      { action: 'adjust', description: 'Adjust billing', icon: CreditCard }
    ]
  }
]

export function PermissionManager({ staffMember, currentAdmin, onPermissionChange }: PermissionManagerProps) {
  const [showReasonDialog, setShowReasonDialog] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<{ resource: string; action: string } | null>(null)
  const [reason, setReason] = useState('')
  const [grantPermission, setGrantPermission] = useState(false)

  const allPermissions = getAllStaffPermissions(staffMember)

  const handlePermissionToggle = (resource: string, action: string, currentGranted: boolean) => {
    setSelectedPermission({ resource, action })
    setGrantPermission(!currentGranted)
    setReason('')
    setShowReasonDialog(true)
  }

  const confirmPermissionChange = () => {
    if (!selectedPermission) return

    const permission: StaffPermission = {
      resource: selectedPermission.resource,
      action: selectedPermission.action,
      granted: grantPermission,
      grantedBy: currentAdmin.username,
      grantedAt: new Date().toISOString(),
      reason: reason || undefined
    }

    onPermissionChange(staffMember.id, permission)
    setShowReasonDialog(false)
    setSelectedPermission(null)
    setReason('')
  }

  const getPermissionStatus = (resource: string, action: string) => {
    return hasPermission(staffMember, resource, action)
  }

  const getPermissionSource = (resource: string, action: string) => {
    const customPermission = staffMember.customPermissions?.find(
      p => p.resource === resource && p.action === action
    )
    
    if (customPermission) {
      return {
        source: 'custom',
        grantedBy: customPermission.grantedBy,
        grantedAt: customPermission.grantedAt,
        reason: customPermission.reason
      }
    }
    
    return {
      source: 'role',
      grantedBy: 'system',
      grantedAt: staffMember.createdAt.toISOString(),
      reason: `Default ${staffMember.role} role permission`
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Individual Permissions for {staffMember.firstName} {staffMember.lastName}
          </CardTitle>
          <CardDescription>
            Override role-based permissions with individual access controls. Custom permissions take precedence over role defaults.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {ALL_PERMISSIONS.map((resourceGroup) => (
              <div key={resourceGroup.resource} className="space-y-3">
                <h3 className="font-semibold text-lg capitalize">
                  {resourceGroup.resource.replace('_', ' ')} Permissions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resourceGroup.actions.map(({ action, description, icon: Icon }) => {
                    const isGranted = getPermissionStatus(resourceGroup.resource, action)
                    const permissionSource = getPermissionSource(resourceGroup.resource, action)
                    
                    return (
                      <div key={action} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium capitalize">{action}</div>
                            <div className="text-sm text-muted-foreground">{description}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={permissionSource.source === 'custom' ? 'default' : 'secondary'} className="text-xs">
                                {permissionSource.source === 'custom' ? 'Custom' : 'Role'}
                              </Badge>
                              {permissionSource.source === 'custom' && (
                                <span className="text-xs text-muted-foreground">
                                  by {permissionSource.grantedBy}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isGranted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <Switch
                            checked={isGranted}
                            onCheckedChange={() => handlePermissionToggle(resourceGroup.resource, action, isGranted)}
                            disabled={currentAdmin.role !== 'director'}
                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent className="bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="bg-gray-50 p-4 rounded-t-lg -m-6 mb-4">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {grantPermission ? 'Grant' : 'Revoke'} Permission
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedPermission && (
                <>
                  {grantPermission ? 'Granting' : 'Revoking'} access to{' '}
                  <strong className="text-blue-600">{selectedPermission.action}</strong> on{' '}
                  <strong className="text-blue-600">{selectedPermission.resource}</strong> for {staffMember.firstName} {staffMember.lastName}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 bg-white">
            <div>
              <Label htmlFor="reason" className="text-sm font-medium text-gray-700">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this permission change..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => setShowReasonDialog(false)}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmPermissionChange}
                className={`${grantPermission ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
              >
                {grantPermission ? 'Grant' : 'Revoke'} Permission
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
