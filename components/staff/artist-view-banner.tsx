"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Eye, 
  Shield, 
  User, 
  LogOut, 
  Lock, 
  Unlock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { 
  ArtistViewMode, 
  EditPermission, 
  checkEditPermission,
  getPermissionMessage,
  validateManagerApproval,
  exitArtistViewMode 
} from '@/lib/artist-view-mode'

interface ArtistViewBannerProps {
  viewMode: ArtistViewMode
  onExit: () => void
}

export default function ArtistViewBanner({ viewMode, onExit }: ArtistViewBannerProps) {
  const [showManagerApproval, setShowManagerApproval] = useState(false)
  const [managerUsername, setManagerUsername] = useState('')
  const [managerPassword, setManagerPassword] = useState('')
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'success' | 'failed'>('pending')

  const editPermission = checkEditPermission(viewMode.staffRole, 'edit', 'user_account')
  const permissionMessage = getPermissionMessage(editPermission)

  const handleManagerApproval = () => {
    if (validateManagerApproval(managerUsername, managerPassword)) {
      setApprovalStatus('success')
      setTimeout(() => {
        setShowManagerApproval(false)
        setApprovalStatus('pending')
        setManagerUsername('')
        setManagerPassword('')
      }, 2000)
    } else {
      setApprovalStatus('failed')
      setTimeout(() => setApprovalStatus('pending'), 3000)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'director':
        return <Shield className="w-4 h-4 text-yellow-600" />
      case 'manager':
        return <Shield className="w-4 h-4 text-blue-600" />
      case 'representative':
        return <Shield className="w-4 h-4 text-green-600" />
      default:
        return <Shield className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'director':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'representative':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Artist View Mode indicator */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span className="font-semibold text-lg">ARTIST VIEW MODE</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm">
                  Viewing: <strong>{viewMode.userName}</strong> ({viewMode.userEmail})
                </span>
              </div>
              
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                {viewMode.userRole}
              </Badge>
            </div>
          </div>

          {/* Right side - Staff info and controls */}
          <div className="flex items-center space-x-4">
            {/* Staff role indicator */}
            <div className="flex items-center space-x-2">
              <span className="text-sm">Staff:</span>
              <Badge className={`${getRoleColor(viewMode.staffRole)}`}>
                {getRoleIcon(viewMode.staffRole)}
                <span className="ml-1">{viewMode.staffRole.charAt(0).toUpperCase() + viewMode.staffRole.slice(1)}</span>
              </Badge>
            </div>

            {/* Edit permission status */}
            <div className="flex items-center space-x-2">
              {editPermission.canEdit ? (
                <div className="flex items-center space-x-1 text-green-200">
                  <Unlock className="w-4 h-4" />
                  <span className="text-sm">Full Access</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-yellow-200">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">View Only</span>
                </div>
              )}
            </div>

            {/* Manager approval button for representatives */}
            {viewMode.staffRole === 'representative' && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                onClick={() => setShowManagerApproval(true)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Request Approval
              </Button>
            )}

            {/* Exit button */}
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              onClick={onExit}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit View Mode
            </Button>
          </div>
        </div>

        {/* Permission message */}
        <div className="mt-2 text-center">
          <p className="text-sm text-white/90">
            {permissionMessage}
          </p>
        </div>
      </div>

      {/* Manager Approval Modal */}
      {showManagerApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">Manager Approval Required</h3>
                </div>
                
                <p className="text-sm text-gray-600">
                  To make changes to this account, you need manager approval.
                </p>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Manager Username"
                    value={managerUsername}
                    onChange={(e) => setManagerUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <input
                    type="password"
                    placeholder="Manager Password"
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Approval status */}
                {approvalStatus === 'success' && (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>Approval granted!</span>
                  </div>
                )}
                
                {approvalStatus === 'failed' && (
                  <div className="flex items-center justify-center space-x-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Invalid credentials</span>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowManagerApproval(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={handleManagerApproval}
                    className="flex-1"
                    disabled={!managerUsername || !managerPassword}
                  >
                    Request Approval
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
