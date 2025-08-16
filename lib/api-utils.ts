// API utilities for safe JSON handling and error management

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp?: string
}

export class ApiError extends Error {
  public status: number
  public data?: any

  constructor(message: string, status: number = 500, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Safe API call function that handles JSON parsing errors
 */
export async function safeApiCall<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    let responseData: any
    const contentType = response.headers.get('content-type')
    
    // Check if response is JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json()
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError)
        return {
          success: false,
          error: 'Invalid JSON response from server',
          timestamp: new Date().toISOString(),
        }
      }
    } else {
      // Try to get text response
      const textResponse = await response.text()
      console.error('Non-JSON response received:', textResponse)
      return {
        success: false,
        error: 'Unexpected response format from server',
        timestamp: new Date().toISOString(),
      }
    }

    if (!response.ok) {
      throw new ApiError(
        responseData?.error || `HTTP error! status: ${response.status}`,
        response.status,
        responseData
      )
    }

    // If the response already has a success structure, return it
    if (typeof responseData === 'object' && 'success' in responseData) {
      return responseData
    }

    // Otherwise, wrap the data in a success structure
    return {
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('API call failed:', error)
    
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Safe FormData API call for file uploads
 */
export async function safeFileUpload<T = any>(
  url: string,
  formData: FormData,
  options?: Omit<RequestInit, 'body'>
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      ...options,
    })

    let responseData: any
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json()
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError)
        return {
          success: false,
          error: 'Invalid JSON response from server',
          timestamp: new Date().toISOString(),
        }
      }
    } else {
      const textResponse = await response.text()
      console.error('Non-JSON response received:', textResponse)
      return {
        success: false,
        error: 'Unexpected response format from server',
        timestamp: new Date().toISOString(),
      }
    }

    if (!response.ok) {
      throw new ApiError(
        responseData?.error || `HTTP error! status: ${response.status}`,
        response.status,
        responseData
      )
    }

    // If the response already has a success structure, return it
    if (typeof responseData === 'object' && 'success' in responseData) {
      return responseData
    }

    // Otherwise, wrap the data in a success structure
    return {
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('File upload failed:', error)
    
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Photo analysis specific function
 */
export async function analyzePhoto(imageFile: File): Promise<ApiResponse<any>> {
  const formData = new FormData()
  formData.append('image', imageFile)

  return safeFileUpload('/api/photo/analyze', formData)
}
