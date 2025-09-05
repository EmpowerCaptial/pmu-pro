// Shared storage for signature requests and signed documents
// In production, this would be a database

export const signatureRequests = new Map()
export const signedDocuments = new Map()

export interface SignatureRequest {
  token: string
  documentTitle: string
  documentUrl: string
  artistName: string
  personalMessage?: string
  clientEmail: string
  createdAt: Date
  expiresAt: Date
  status: 'pending' | 'completed'
  artistEmail?: string
}

export interface SignedDocument {
  id: string
  token: string
  clientName: string
  clientEmail: string
  signature: string
  signedAt: Date
  documentTitle: string
  documentUrl: string
  artistName: string
  status: 'completed'
}

