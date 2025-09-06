"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Clock, AlertTriangle, XCircle, Info, RefreshCw } from "lucide-react"
import { ArtistApplicationService } from "@/lib/artist-application-service"

interface ApplicationStatusCardProps {
  userEmail: string
  onUpdateApplication?: () => void
}

export function ApplicationStatusCard({ userEmail, onUpdateApplication }: ApplicationStatusCardProps) {
  const [trialStatus, setTrialStatus] = useState<{
    hasAccess: boolean
    daysRemaining: number
    status: string
    issues?: string[]
    needsAction: boolean
  } | null>(null)
  const [application, setApplication] = useState<any>(null)

  useEffect(() => {
    const loadStatus = () => {
      const status = ArtistApplicationService.getTrialStatus(userEmail)
      const app = ArtistApplicationService.getApplication(userEmail)
      setTrialStatus(status)
      setApplication(app)
    }

    loadStatus()
    
    // Update every minute
    const interval = setInterval(loadStatus, 60000)
    return () => clearInterval(interval)
  }, [userEmail])

  if (!trialStatus || !application) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />
      case 'needs_info': return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'pending': return <Clock className="h-5 w-5 text-blue-600" />
      default: return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'needs_info': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          title: 'Application Approved!',
          message: 'Your application has been approved. Enjoy full access to PMU Pro!',
          type: 'success' as const
        }
      case 'rejected':
        return {
          title: 'Application Not Approved',
          message: 'Unfortunately, your application was not approved. Please contact support for more information.',
          type: 'error' as const
        }
      case 'needs_info':
        return {
          title: 'Additional Information Required',
          message: 'We need some additional information to complete your application review.',
          type: 'warning' as const
        }
      case 'pending':
        return {
          title: 'Application Under Review',
          message: 'Your application is being reviewed. You have full access during this process.',
          type: 'info' as const
        }
      default:
        return {
          title: 'Application Status Unknown',
          message: 'Unable to determine your application status.',
          type: 'info' as const
        }
    }
  }

  const statusInfo = getStatusMessage(trialStatus.status)

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(trialStatus.status)}
            <div>
              <CardTitle className="text-lg">{statusInfo.title}</CardTitle>
              <CardDescription>{statusInfo.message}</CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(trialStatus.status)}>
            {trialStatus.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Trial Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Trial Information</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Days Remaining:</span>
              <span className="ml-2 font-semibold text-gray-900">{trialStatus.daysRemaining}</span>
            </div>
            <div>
              <span className="text-gray-600">Access Status:</span>
              <span className={`ml-2 font-semibold ${trialStatus.hasAccess ? 'text-green-600' : 'text-red-600'}`}>
                {trialStatus.hasAccess ? 'Active' : 'Suspended'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Submitted:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Reviewed:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {application.reviewedAt ? new Date(application.reviewedAt).toLocaleDateString() : 'Not reviewed'}
              </span>
            </div>
          </div>
        </div>

        {/* Issues Section */}
        {trialStatus.issues && trialStatus.issues.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-800">Issues to Address:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  {trialStatus.issues.map((issue, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span>•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {trialStatus.needsAction && (
            <Button
              onClick={onUpdateApplication}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Application
            </Button>
          )}
          
          {trialStatus.status === 'rejected' && (
            <Button
              onClick={() => window.location.href = '/contact'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Contact Support
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/pricing'}
            className="border-lavender text-lavender hover:bg-lavender/5"
          >
            View Pricing Plans
          </Button>
        </div>

        {/* Review Notes */}
        {application.notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Review Notes</h4>
            <p className="text-sm text-blue-700">{application.notes}</p>
            {application.reviewedBy && (
              <p className="text-xs text-blue-600 mt-2">
                Reviewed by: {application.reviewedBy}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


