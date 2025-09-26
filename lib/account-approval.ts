// Account Approval Management System for PMU Pro
// Handles artist applications, document review, and approval workflow

export interface ArtistApplication {
  id: string
  artistName: string
  email: string
  phone: string
  businessName?: string
  businessAddress?: string
  licenseNumber?: string
  experience: string
  specialties: string[]
  submittedAt: Date
  status: 'pending' | 'approved' | 'denied' | 'needs_info'
  reviewedBy?: string
  reviewedAt?: Date
  notes?: string
  documents: ApplicationDocument[]
  responses: ApplicationResponse[]
  lastUpdated: Date
}

export interface ApplicationDocument {
  id: string
  type: 'license' | 'certification' | 'portfolio' | 'identification' | 'business_license' | 'insurance' | 'other'
  filename: string
  originalName: string
  size: number
  uploadedAt: Date
  url: string
  mimeType: string
  description?: string
}

export interface ApplicationResponse {
  id: string
  type: 'request_info' | 'approval' | 'denial' | 'general'
  message: string
  sentBy: string
  sentAt: Date
  requiresResponse: boolean
  respondedAt?: Date
  responseMessage?: string
}

export interface ApprovalStats {
  total: number
  pending: number
  approved: number
  denied: number
  needsInfo: number
  thisWeek: number
  thisMonth: number
}

// Mock data for demonstration
const mockApplications: ArtistApplication[] = [
  {
    id: 'app_001',
    artistName: 'Sarah Johnson',
    email: 'sarah.johnson@pmu.com',
    phone: '+1-555-0123',
    businessName: 'Beauty by Sarah',
    businessAddress: '123 Main St, Beauty City, BC 12345',
    licenseNumber: 'PMU-2024-001',
    experience: '5 years in PMU, specializing in microblading and lip blush',
    specialties: ['Microblading', 'Lip Blush', 'Eyebrow Enhancement'],
    submittedAt: new Date('2024-01-15'),
    status: 'pending',
    documents: [
      {
        id: 'doc_001',
        type: 'license',
        filename: 'pmu_license_2024.pdf',
        originalName: 'PMU License 2024.pdf',
        size: 245760,
        uploadedAt: new Date('2024-01-15'),
        url: '/uploads/pmu_license_2024.pdf',
        mimeType: 'application/pdf',
        description: 'Current PMU license valid until 2025'
      },
      {
        id: 'doc_002',
        type: 'portfolio',
        filename: 'portfolio_samples.jpg',
        originalName: 'Portfolio Samples.jpg',
        size: 3145728,
        uploadedAt: new Date('2024-01-15'),
        url: '/uploads/portfolio_samples.jpg',
        mimeType: 'image/jpeg',
        description: 'Before and after photos of recent work'
      }
    ],
    responses: [],
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: 'app_002',
    artistName: 'Maria Garcia',
    email: 'maria.garcia@pmu.com',
    phone: '+1-555-0124',
    businessName: 'Garcia PMU Studio',
    businessAddress: '456 Oak Ave, Style Town, ST 67890',
    licenseNumber: 'PMU-2024-002',
    experience: '3 years in PMU, specializing in powder brows and eyeliner',
    specialties: ['Powder Brows', 'Eyeliner', 'Beauty Marks'],
    submittedAt: new Date('2024-01-10'),
    status: 'needs_info',
    reviewedBy: 'manager1',
    reviewedAt: new Date('2024-01-12'),
    notes: 'Insurance certificate missing, business license needs renewal',
    documents: [
      {
        id: 'doc_003',
        type: 'license',
        filename: 'pmu_license_2024.pdf',
        originalName: 'PMU License 2024.pdf',
        size: 245760,
        uploadedAt: new Date('2024-01-10'),
        url: '/uploads/pmu_license_2024.pdf',
        mimeType: 'application/pdf',
        description: 'Current PMU license'
      }
    ],
    responses: [
      {
        id: 'resp_001',
        type: 'request_info',
        message: 'Please provide your current insurance certificate and renewed business license. Your application is on hold until these documents are submitted.',
        sentBy: 'manager1',
        sentAt: new Date('2024-01-12'),
        requiresResponse: true
      }
    ],
    lastUpdated: new Date('2024-01-12')
  },
  {
    id: 'app_003',
    artistName: 'Emma Wilson',
    email: 'emma.wilson@pmu.com',
    phone: '+1-555-0125',
    businessName: 'Wilson Beauty Arts',
    businessAddress: '789 Pine St, Art City, AC 11111',
    licenseNumber: 'PMU-2024-003',
    experience: '7 years in PMU, specializing in advanced techniques and corrections',
    specialties: ['Advanced Techniques', 'Color Correction', 'Scar Camouflage'],
    submittedAt: new Date('2024-01-08'),
    status: 'approved',
    reviewedBy: 'director1',
    reviewedAt: new Date('2024-01-10'),
    notes: 'Excellent qualifications and portfolio. Approved for full access.',
    documents: [
      {
        id: 'doc_004',
        type: 'license',
        filename: 'pmu_license_2024.pdf',
        originalName: 'PMU License 2024.pdf',
        size: 245760,
        uploadedAt: new Date('2024-01-08'),
        url: '/uploads/pmu_license_2024.pdf',
        mimeType: 'application/pdf',
        description: 'Current PMU license'
      },
      {
        id: 'doc_005',
        type: 'certification',
        filename: 'advanced_cert.pdf',
        originalName: 'Advanced PMU Certification.pdf',
        size: 512000,
        uploadedAt: new Date('2024-01-08'),
        url: '/uploads/advanced_cert.pdf',
        mimeType: 'application/pdf',
        description: 'Advanced PMU techniques certification'
      },
      {
        id: 'doc_006',
        type: 'portfolio',
        filename: 'portfolio_emma.jpg',
        originalName: 'Portfolio Emma.jpg',
        size: 4194304,
        uploadedAt: new Date('2024-01-08'),
        url: '/uploads/portfolio_emma.jpg',
        mimeType: 'image/jpeg',
        description: 'Comprehensive portfolio showcasing advanced work'
      }
    ],
    responses: [
      {
        id: 'resp_002',
        type: 'approval',
        message: 'Congratulations! Your application has been approved. You now have full access to PMU Pro. Welcome to our community of professional artists!',
        sentBy: 'director1',
        sentAt: new Date('2024-01-10'),
        requiresResponse: false
      }
    ],
    lastUpdated: new Date('2024-01-10')
  },
  {
    id: 'app_004',
    artistName: 'Jessica Chen',
    email: 'jessica.chen@pmu.com',
    phone: '+1-555-0126',
    businessName: 'Chen PMU Studio',
    businessAddress: '321 Elm St, Beauty City, BC 12345',
    licenseNumber: 'PMU-2024-004',
    experience: '2 years in PMU, specializing in natural brows',
    specialties: ['Natural Brows', 'Microblading'],
    submittedAt: new Date('2024-01-05'),
    status: 'denied',
    reviewedBy: 'manager1',
    reviewedAt: new Date('2024-01-07'),
    notes: 'Insufficient experience and incomplete portfolio. Recommend reapplication after gaining more experience.',
    documents: [
      {
        id: 'doc_007',
        type: 'license',
        filename: 'pmu_license_2024.pdf',
        originalName: 'PMU License 2024.pdf',
        size: 245760,
        uploadedAt: new Date('2024-01-05'),
        url: '/uploads/pmu_license_2024.pdf',
        mimeType: 'application/pdf',
        description: 'Current PMU license'
      }
    ],
    responses: [
      {
        id: 'resp_003',
        type: 'denial',
        message: 'Thank you for your interest in PMU Pro. After careful review, we regret to inform you that your application has been denied at this time. We recommend gaining additional experience and building a more comprehensive portfolio before reapplying. You may reapply in 6 months.',
        sentBy: 'manager1',
        sentAt: new Date('2024-01-07'),
        requiresResponse: false
      }
    ],
    lastUpdated: new Date('2024-01-07')
  }
]

// Get all applications
export function getAllApplications(): ArtistApplication[] {
  if (typeof window === 'undefined') return mockApplications
  
  try {
    const applications = localStorage.getItem('pmu_applications')
    if (applications) {
      const parsed = JSON.parse(applications)
      // Convert date strings back to Date objects
      return parsed.map((app: any) => ({
        ...app,
        submittedAt: new Date(app.submittedAt),
        reviewedAt: app.reviewedAt ? new Date(app.reviewedAt) : undefined,
        lastUpdated: new Date(app.lastUpdated),
        documents: app.documents.map((doc: any) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt)
        })),
        responses: app.responses.map((resp: any) => ({
          ...resp,
          sentAt: new Date(resp.sentAt),
          respondedAt: resp.respondedAt ? new Date(resp.respondedAt) : undefined
        }))
      }))
    }
  } catch (error) {
    console.error('Error loading applications:', error)
  }
  
  return mockApplications
}

// Save applications to localStorage
export function saveApplications(applications: ArtistApplication[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('pmu_applications', JSON.stringify(applications))
  } catch (error) {
    console.error('Error saving applications:', error)
  }
}

// Get application by ID
export function getApplicationById(id: string): ArtistApplication | null {
  const applications = getAllApplications()
  return applications.find(app => app.id === id) || null
}

// Update application status
export function updateApplicationStatus(
  id: string, 
  status: ArtistApplication['status'], 
  reviewedBy: string,
  notes?: string
): ArtistApplication | null {
  const applications = getAllApplications()
  const appIndex = applications.findIndex(app => app.id === id)
  
  if (appIndex === -1) return null
  
  const updatedApp: ArtistApplication = {
    ...applications[appIndex],
    status,
    reviewedBy,
    reviewedAt: new Date(),
    notes,
    lastUpdated: new Date()
  }
  
  applications[appIndex] = updatedApp
  saveApplications(applications)
  
  return updatedApp
}

// Add response to application
export function addApplicationResponse(
  applicationId: string,
  response: Omit<ApplicationResponse, 'id' | 'sentAt'>
): ApplicationResponse | null {
  const applications = getAllApplications()
  const appIndex = applications.findIndex(app => app.id === applicationId)
  
  if (appIndex === -1) return null
  
  const newResponse: ApplicationResponse = {
    ...response,
    id: `resp_${Date.now()}`,
    sentAt: new Date()
  }
  
  applications[appIndex].responses.push(newResponse)
  applications[appIndex].lastUpdated = new Date()
  
  saveApplications(applications)
  
  return newResponse
}

// Get approval statistics
export function getApprovalStats(): ApprovalStats {
  const applications = getAllApplications()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  return {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    denied: applications.filter(app => app.status === 'denied').length,
    needsInfo: applications.filter(app => app.status === 'needs_info').length,
    thisWeek: applications.filter(app => {
      const submittedAt = app.submittedAt instanceof Date ? app.submittedAt : new Date(app.submittedAt)
      return submittedAt >= weekAgo
    }).length,
    thisMonth: applications.filter(app => {
      const submittedAt = app.submittedAt instanceof Date ? app.submittedAt : new Date(app.submittedAt)
      return submittedAt >= monthAgo
    }).length
  }
}

// Search applications
export function searchApplications(query: string): ArtistApplication[] {
  const applications = getAllApplications()
  const lowerQuery = query.toLowerCase()
  
  return applications.filter(app => 
    app.artistName.toLowerCase().includes(lowerQuery) ||
    app.email.toLowerCase().includes(lowerQuery) ||
    app.businessName?.toLowerCase().includes(lowerQuery) ||
    app.licenseNumber?.toLowerCase().includes(lowerQuery) ||
    app.status.toLowerCase().includes(lowerQuery)
  )
}

// Filter applications by status
export function filterApplicationsByStatus(status: ArtistApplication['status'] | 'all'): ArtistApplication[] {
  const applications = getAllApplications()
  
  if (status === 'all') return applications
  return applications.filter(app => app.status === status)
}

// Get applications needing review
export function getApplicationsNeedingReview(): ArtistApplication[] {
  const applications = getAllApplications()
  return applications.filter(app => 
    app.status === 'pending' || app.status === 'needs_info'
  )
}

// Get document types
export function getDocumentTypes(): { value: string; label: string }[] {
  return [
    { value: 'license', label: 'PMU License' },
    { value: 'certification', label: 'Certification' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'identification', label: 'Identification' },
    { value: 'business_license', label: 'Business License' },
    { value: 'insurance', label: 'Insurance Certificate' },
    { value: 'other', label: 'Other' }
  ]
}

// Get response types
export function getResponseTypes(): { value: string; label: string }[] {
  return [
    { value: 'request_info', label: 'Request More Information' },
    { value: 'approval', label: 'Approval Notice' },
    { value: 'denial', label: 'Denial Notice' },
    { value: 'general', label: 'General Communication' }
  ]
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get status color
export function getStatusColor(status: ArtistApplication['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'denied':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'needs_info':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Get status icon
export function getStatusIcon(status: ArtistApplication['status']): string {
  switch (status) {
    case 'pending':
      return '⏳'
    case 'approved':
      return '✅'
    case 'denied':
      return '❌'
    case 'needs_info':
      return '⚠️'
    default:
      return '❓'
  }
}
