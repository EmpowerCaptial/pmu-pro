// Enhanced Consent Form Data Model Types

export interface ConsentForm {
  id: string
  clientId: string
  clientName: string
  artistEmail: string
  formType: ConsentFormType
  sendMethod: "email" | "sms"
  contactInfo: string
  customMessage?: string
  token: string
  createdAt: Date
  sentAt: Date
  expiresAt: Date
  status: ConsentFormStatus
  reminderSent: boolean
  completedAt?: Date
  formData?: ConsentFormData
  pdfUrl?: string
  appointmentDate?: Date
  reminderHistory?: ReminderRecord[]
}

export type ConsentFormType = 
  | "general-consent"
  | "medical-history"
  | "brows"
  | "lips"
  | "liner"
  | "smp"
  | "photo-release"
  | "aftercare"

export type ConsentFormStatus = "sent" | "completed" | "expired" | "cancelled"

export interface ConsentFormData {
  clientSignature: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  dateOfBirth?: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  medicalHistory?: {
    allergies: string[]
    medications: string[]
    conditions: string[]
    surgeries: string[]
  }
  consentAcknowledged: boolean
  photoConsent?: boolean
  marketingConsent?: boolean
  submittedAt: Date
  ipAddress?: string
  userAgent?: string
}

export interface ReminderRecord {
  id: string
  sentAt: Date
  method: "email" | "sms"
  message: string
  status: "sent" | "delivered" | "failed"
}

export interface ConsentNotification {
  id: string
  type: "form-signed" | "reminder-needed" | "form-expired" | "appointment-reminder"
  clientId: string
  clientName: string
  formType: string
  message: string
  timestamp: Date
  isRead: boolean
  actionRequired: boolean
  priority: "low" | "medium" | "high"
  appointmentDate?: Date
}

// Extended Client Profile Schema
export interface ClientProfile {
  id: string
  name: string
  email: string
  phone?: string
  dateOfBirth?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  medicalHistory?: {
    allergies: string[]
    medications: string[]
    conditions: string[]
    surgeries: string[]
    lastUpdated: Date
  }
  consentForms: ConsentForm[]
  consentFormSettings: {
    autoReminders: boolean
    reminderFrequency: number // hours
    requirePhotoConsent: boolean
    requireMarketingConsent: boolean
    defaultFormTypes: ConsentFormType[]
  }
  createdAt: Date
  updatedAt: Date
}

// Form Template Configuration
export interface FormTemplate {
  id: ConsentFormType
  name: string
  description: string
  required: boolean
  fields: FormField[]
  autoSend?: boolean
  sendBeforeAppointment?: number // hours
}

export interface FormField {
  id: string
  label: string
  type: "text" | "email" | "phone" | "date" | "checkbox" | "radio" | "select" | "textarea" | "signature"
  required: boolean
  options?: string[]
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
    custom?: string
  }
  helpText?: string
  order: number
}

// Notification Settings
export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  dashboardNotifications: boolean
  reminderFrequency: number // hours
  autoReminders: boolean
  appointmentReminders: boolean
  formCompletionAlerts: boolean
  reminderTemplates: {
    email: string
    sms: string
  }
}



