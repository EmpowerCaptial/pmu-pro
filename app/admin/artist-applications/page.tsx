"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, AlertTriangle, User, Mail, Phone, MapPin, Award, Calendar } from "lucide-react"
import { ArtistApplicationService, type ArtistApplication } from "@/lib/artist-application-service"

export default function ArtistApplicationReview() {
  const [applications, setApplications] = useState<ArtistApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<ArtistApplication | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [reviewerName, setReviewerName] = useState("")

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = () => {
    const apps = ArtistApplicationService.getAllApplications()
    setApplications(apps)
  }

  const handleStatusUpdate = (applicationId: string, status: ArtistApplication['status']) => {
    if (!reviewerName.trim()) {
      alert("Please enter your name as reviewer")
      return
    }

    const updated = ArtistApplicationService.updateApplicationStatus(
      applicationId,
      status,
      reviewerName,
      reviewNotes || undefined
    )

    if (updated) {
      loadApplications()
      setSelectedApplication(updated)
      setReviewNotes("")
      alert(`Application ${status} successfully`)
    }
  }

  const getStatusColor = (status: ArtistApplication['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'needs_info': return 'bg-orange-100 text-orange-800'
      case 'pending': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: ArtistApplication['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'needs_info': return <AlertTriangle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const pendingApplications = applications.filter(app => app.status === 'pending')
  const needsInfoApplications = applications.filter(app => app.status === 'needs_info')
  const approvedApplications = applications.filter(app => app.status === 'approved')
  const rejectedApplications = applications.filter(app => app.status === 'rejected')

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-beige/20 to-ivory">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Artist Application Review</h1>
          <p className="text-gray-600">Review and manage artist applications for PMU Pro trial access</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending">
                  Pending ({pendingApplications.length})
                </TabsTrigger>
                <TabsTrigger value="needs_info">
                  Needs Info ({needsInfoApplications.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedApplications.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedApplications.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-3">
                {pendingApplications.map((app) => (
                  <Card 
                    key={app.id} 
                    className={`cursor-pointer transition-all ${
                      selectedApplication?.id === app.id ? 'ring-2 ring-lavender' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedApplication(app)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{app.name}</h3>
                        <Badge className={getStatusColor(app.status)}>
                          {getStatusIcon(app.status)}
                          <span className="ml-1 capitalize">{app.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{app.businessName}</p>
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="needs_info" className="space-y-3">
                {needsInfoApplications.map((app) => (
                  <Card 
                    key={app.id} 
                    className={`cursor-pointer transition-all ${
                      selectedApplication?.id === app.id ? 'ring-2 ring-lavender' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedApplication(app)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{app.name}</h3>
                        <Badge className={getStatusColor(app.status)}>
                          {getStatusIcon(app.status)}
                          <span className="ml-1 capitalize">{app.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{app.businessName}</p>
                      <p className="text-xs text-gray-500">
                        Reviewed: {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : 'Not reviewed'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="approved" className="space-y-3">
                {approvedApplications.map((app) => (
                  <Card 
                    key={app.id} 
                    className={`cursor-pointer transition-all ${
                      selectedApplication?.id === app.id ? 'ring-2 ring-lavender' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedApplication(app)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{app.name}</h3>
                        <Badge className={getStatusColor(app.status)}>
                          {getStatusIcon(app.status)}
                          <span className="ml-1 capitalize">{app.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{app.businessName}</p>
                      <p className="text-xs text-gray-500">
                        Approved: {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : 'Not reviewed'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-3">
                {rejectedApplications.map((app) => (
                  <Card 
                    key={app.id} 
                    className={`cursor-pointer transition-all ${
                      selectedApplication?.id === app.id ? 'ring-2 ring-lavender' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedApplication(app)}
                  >
                    <CardContent className="p4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{app.name}</h3>
                        <Badge className={getStatusColor(app.status)}>
                          {getStatusIcon(app.status)}
                          <span className="ml-1 capitalize">{app.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{app.businessName}</p>
                      <p className="text-xs text-gray-500">
                        Rejected: {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : 'Not reviewed'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2">
            {selectedApplication ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedApplication.name}</CardTitle>
                      <CardDescription>{selectedApplication.businessName}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(selectedApplication.status)}>
                      {getStatusIcon(selectedApplication.status)}
                      <span className="ml-1 capitalize">{selectedApplication.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedApplication.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedApplication.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 md:col-span-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedApplication.businessAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* License Information */}
                  {selectedApplication.licenseNumber && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">License Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">License: {selectedApplication.licenseNumber}</span>
                        </div>
                        {selectedApplication.licenseState && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">State: {selectedApplication.licenseState}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Experience</h3>
                    <p className="text-sm text-gray-700">{selectedApplication.experience}</p>
                  </div>

                  {/* Specialties */}
                  {selectedApplication.specialties.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">{specialty}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio */}
                  {selectedApplication.portfolioUrl && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Portfolio</h3>
                      <a 
                        href={selectedApplication.portfolioUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lavender hover:text-lavender-600 underline"
                      >
                        {selectedApplication.portfolioUrl}
                      </a>
                    </div>
                  )}

                  {/* Trial Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Trial Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          Started: {selectedApplication.trialStartDate ? new Date(selectedApplication.trialStartDate).toLocaleDateString() : 'Not started'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          Ends: {selectedApplication.trialEndDate ? new Date(selectedApplication.trialEndDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Section */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Review Application</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reviewer">Your Name</Label>
                        <Input
                          id="reviewer"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Review Notes</Label>
                        <Textarea
                          id="notes"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Add any notes about this application..."
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(selectedApplication.id, 'needs_info')}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Needs More Info
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Application</h3>
                  <p className="text-gray-600">Choose an application from the list to review details and make a decision.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

