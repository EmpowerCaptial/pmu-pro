"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, X, Download, Trash2 } from "lucide-react"
import { addClientDocument, deleteClientDocument, type ClientDocument } from "@/lib/client-storage"

interface DocumentUploadProps {
  clientId: string
  documents: ClientDocument[]
  onDocumentsUpdate: () => void
}

export function DocumentUpload({ clientId, documents, onDocumentsUpdate }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState<'consent' | 'medical' | 'insurance' | 'photo' | 'other'>('other')
  const [documentNotes, setDocumentNotes] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [savedDocumentName, setSavedDocumentName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, "")) // Remove file extension
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !documentName.trim()) return

    setIsUploading(true)
    try {
      // In a real app, you'd upload to a file storage service
      // For now, we'll create a mock file URL
      const mockFileUrl = URL.createObjectURL(selectedFile)
      
      const newDocument = addClientDocument(clientId, {
        name: documentName,
        type: documentType,
        fileName: selectedFile.name,
        fileUrl: mockFileUrl,
        notes: documentNotes
      })

      if (newDocument) {
        // Show success message
        setSavedDocumentName(documentName)
        setShowSaveSuccess(true)
        
        // Reset form
        setDocumentName("")
        setDocumentType('other')
        setDocumentNotes("")
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        
        // Notify parent component
        onDocumentsUpdate()
        
        // Hide success message after 8 seconds (longer for better visibility)
        setTimeout(() => setShowSaveSuccess(false), 8000)
      }
    } catch (error) {
      console.error('Error uploading document:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = (documentId: string) => {
    if (deleteClientDocument(clientId, documentId)) {
      onDocumentsUpdate()
    }
  }

  const handleDownload = (doc: ClientDocument) => {
    // In a real app, this would download the actual file
    // For now, we'll create a temporary link
    const link = document.createElement('a')
    link.href = doc.fileUrl
    link.download = doc.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Message */}
          {showSaveSuccess && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg shadow-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-800 font-bold text-lg">✅ DOCUMENT STORED!</p>
                    <p className="text-green-700 text-sm">"{savedDocumentName}" has been successfully uploaded and saved to the client's profile.</p>
                  </div>
                </div>
                <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                  STORED ✓
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document-name">Document Name *</Label>
              <Input
                id="document-name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type *</Label>
              <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consent">Consent Form</SelectItem>
                  <SelectItem value="medical">Medical Record</SelectItem>
                  <SelectItem value="insurance">Insurance Card</SelectItem>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-file">Select File *</Label>
            <Input
              id="document-file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{selectedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-notes">Notes (Optional)</Label>
            <Textarea
              id="document-notes"
              value={documentNotes}
              onChange={(e) => setDocumentNotes(e.target.value)}
              placeholder="Add any notes about this document"
              rows={3}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !documentName.trim() || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Documents List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{document.name}</p>
                      <p className="text-sm text-gray-600">
                        {document.fileName} • {new Date(document.uploadedAt).toLocaleDateString()}
                      </p>
                      {document.notes && (
                        <p className="text-sm text-gray-500">{document.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
