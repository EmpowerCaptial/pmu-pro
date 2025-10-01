import { useState, useCallback } from 'react'
import { useDemoAuth } from './use-demo-auth'

interface FileUploadOptions {
  fileType?: 'image' | 'document' | 'signature' | 'id_document'
  clientId?: string
  isTemporary?: boolean
  onSuccess?: (file: any) => void
  onError?: (error: string) => void
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const { currentUser } = useDemoAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { fileType = 'document', clientId, isTemporary = false, onSuccess, onError } = options

  const uploadFile = useCallback(async (file: File): Promise<any> => {
    if (!currentUser?.email) {
      const errorMsg = 'User not authenticated'
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    if (!file) {
      const errorMsg = 'No file provided'
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/zip'
    ]

    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'File type not allowed'
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      const errorMsg = 'File size must be less than 50MB'
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    try {
      setIsUploading(true)
      setError(null)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', fileType)
      if (clientId) {
        formData.append('clientId', clientId)
      }
      formData.append('isTemporary', isTemporary.toString())

      // Simulate progress (since we can't get real progress from fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const response = await fetch('/api/file-uploads', {
        method: 'POST',
        headers: {
          'x-user-email': currentUser.email
        },
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const data = await response.json()
        onSuccess?.(data.fileUpload)
        return data.fileUpload
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed'
      setError(errorMsg)
      onError?.(errorMsg)
      console.error('File upload error:', error)
      return null
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000) // Reset progress after 1 second
    }
  }, [currentUser?.email, fileType, clientId, isTemporary, onSuccess, onError])

  const uploadMultipleFiles = useCallback(async (files: File[]): Promise<any[]> => {
    const uploadPromises = files.map(file => uploadFile(file))
    const results = await Promise.all(uploadPromises)
    return results.filter(result => result !== null)
  }, [uploadFile])

  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    if (!currentUser?.email) {
      const errorMsg = 'User not authenticated'
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    }

    try {
      const response = await fetch(`/api/file-uploads?id=${fileId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser.email
        }
      })

      if (response.ok) {
        return true
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Delete failed')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Delete failed'
      setError(errorMsg)
      onError?.(errorMsg)
      console.error('File delete error:', error)
      return false
    }
  }, [currentUser?.email, onError])

  const getFiles = useCallback(async (options: {
    fileType?: string
    clientId?: string
    includeTemporary?: boolean
  } = {}): Promise<any[]> => {
    if (!currentUser?.email) {
      const errorMsg = 'User not authenticated'
      setError(errorMsg)
      onError?.(errorMsg)
      return []
    }

    try {
      const params = new URLSearchParams()
      if (options.fileType) params.append('fileType', options.fileType)
      if (options.clientId) params.append('clientId', options.clientId)
      if (options.includeTemporary) params.append('includeTemporary', 'true')

      const response = await fetch(`/api/file-uploads?${params}`, {
        headers: {
          'x-user-email': currentUser.email
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.files || []
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch files')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch files'
      setError(errorMsg)
      onError?.(errorMsg)
      console.error('Get files error:', error)
      return []
    }
  }, [currentUser?.email, onError])

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getFiles,
    isUploading,
    uploadProgress,
    error
  }
}
