// Server-side only HTTP client using Undici
// This file should only be imported in API routes and server components

import { request, Agent, errors, FormData } from 'undici'

// Enhanced HTTP client configuration
const agent = new Agent({
  keepAliveTimeout: 60000, // 1 minute
  keepAliveMaxTimeout: 300000, // 5 minutes
  connections: 10, // Connection pool size
  pipelining: 1, // HTTP/1.1 pipelining
})

// Request timeout configuration
const DEFAULT_TIMEOUT = 30000 // 30 seconds
const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000 // 1 second

// Enhanced error types
export class HTTPError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message)
    this.name = 'HTTPError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

// Request options interface
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: string | Buffer | FormData
  timeout?: number
  retries?: number
  signal?: AbortSignal
}

// Response interface
interface HTTPResponse<T = any> {
  data: T
  statusCode: number
  headers: Record<string, string>
}

// Enhanced HTTP client class
export class EnhancedHTTPClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'user-agent': 'PMU-Pro/1.0.0',
      'accept': 'application/json',
      'content-type': 'application/json',
      ...defaultHeaders,
    }
  }

  // Main request method with retry logic
  async request<T = any>(
    path: string,
    options: RequestOptions = {}
  ): Promise<HTTPResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = DEFAULT_TIMEOUT,
      retries = RETRY_ATTEMPTS,
      signal,
    } = options

    const url = this.baseURL + path
    const requestHeaders = { ...this.defaultHeaders, ...headers }

    // Remove content-type for FormData
    if (body instanceof FormData) {
      delete requestHeaders['content-type']
    }

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        // Combine signals
        if (signal) {
          signal.addEventListener('abort', () => controller.abort())
        }

        const response = await request(url, {
          method,
          headers: requestHeaders,
          body,
          signal: controller.signal,
          dispatcher: agent,
        })
        
        const responseBody = response.body
        const statusCode = response.statusCode
        const responseHeaders = response.headers

        clearTimeout(timeoutId)

        // Handle different response types
        let data: T
        const contentType = responseHeaders['content-type'] || ''

        if (contentType.includes('application/json')) {
          data = await responseBody.json() as T
        } else if (contentType.includes('text/')) {
          data = await responseBody.text() as T
        } else {
          data = responseBody as T
        }

        // Convert headers to plain object
        const headersObj: Record<string, string> = {}
        if (responseHeaders && typeof responseHeaders === 'object') {
          // Handle different header types from Undici
          if (Array.isArray(responseHeaders)) {
            // Headers as array of [key, value] pairs
            responseHeaders.forEach(([key, value]) => {
              if (key && value) headersObj[key] = value
            })
          } else if (responseHeaders instanceof Map) {
            // Headers as Map
            responseHeaders.forEach((value, key) => {
              headersObj[key] = value
            })
          } else {
            // Headers as plain object
            Object.entries(responseHeaders).forEach(([key, value]) => {
              if (value !== undefined) {
                headersObj[key] = Array.isArray(value) ? value.join(', ') : value
              }
            })
          }
        }

        return {
          data,
          statusCode,
          headers: headersObj,
        }
      } catch (error) {
        lastError = error as Error

        // Don't retry on client errors (4xx)
        if (error instanceof HTTPError && error.statusCode >= 400 && error.statusCode < 500) {
          throw error
        }

        // Don't retry on abort/timeout
        if (error instanceof TimeoutError || (error instanceof Error && error.name === 'AbortError')) {
          throw error
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = RETRY_DELAY * Math.pow(2, attempt - 1)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('Request failed after all retries')
  }

  // Convenience methods
  async get<T = any>(path: string, options?: Omit<RequestOptions, 'method'>): Promise<HTTPResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  async post<T = any>(path: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<HTTPResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined
    return this.request<T>(path, { ...options, method: 'POST', body })
  }

  async put<T = any>(path: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<HTTPResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined
    return this.request<T>(path, { ...options, method: 'PUT', body })
  }

  async delete<T = any>(path: string, options?: Omit<RequestOptions, 'method'>): Promise<HTTPResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }

  async patch<T = any>(path: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<HTTPResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined
    return this.request<T>(path, { ...options, method: 'PATCH', body })
  }

  // File upload method
  async upload<T = any>(path: string, formData: FormData, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<HTTPResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body: formData })
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', { timeout: 5000 })
      return response.statusCode === 200
    } catch {
      return false
    }
  }

  // Set base URL
  setBaseURL(url: string): void {
    this.baseURL = url
  }

  // Set default headers
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers }
  }

  // Get connection pool stats
  getConnectionStats() {
    return {
      // Note: These properties may not be available in all Undici versions
      // Using type assertion to access potentially available properties
      activeConnections: (agent as any).activeConnections || 0,
      pendingConnections: (agent as any).pendingConnections || 0,
      freeConnections: (agent as any).freeConnections || 0,
    }
  }
}

// Create default client instance
export const httpClient = new EnhancedHTTPClient()

// Export specific clients for different services
export const skinAnalysisClient = new EnhancedHTTPClient('/api/skin-analysis')
export const clientManagementClient = new EnhancedHTTPClient('/api/clients')
export const staffClient = new EnhancedHTTPClient('/api/staff')
export const stripeClient = new EnhancedHTTPClient('/api/stripe')

// Utility functions for common operations
export async function uploadFile(url: string, file: File, additionalData?: Record<string, any>): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value))
    })
  }

  const response = await httpClient.upload(url, formData)
  return response.data
}

export async function downloadFile(url: string): Promise<Blob> {
  const response = await httpClient.get(url, {
    headers: { 'accept': '*/*' },
    timeout: 60000, // 1 minute for downloads
  })
  
  return response.data as Blob
}

// Error handling utilities
export function isHTTPError(error: any): error is HTTPError {
  return error instanceof HTTPError
}

export function isTimeoutError(error: any): error is TimeoutError {
  return error instanceof TimeoutError
}

export function getErrorMessage(error: any): string {
  if (isHTTPError(error)) {
    return `HTTP ${error.statusCode}: ${error.message}`
  }
  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again.'
  }
  return error.message || 'An unexpected error occurred.'
}
