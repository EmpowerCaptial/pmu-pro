/**
 * HTTP helper with timeout, retries, and friendly error handling
 * No more raw "failed to fetch" errors!
 */

export type AppError = {
  kind: 'network' | 'timeout' | 'unauthorized' | 'forbidden' | 'notfound' | 'server' | 'unknown'
  message: string
  status?: number
  requestId?: string
}

interface FetchOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

/**
 * Convert raw fetch/network errors to friendly AppError
 */
function toAppError(error: unknown, url: string): AppError {
  // Network/connection errors
  if (error instanceof TypeError) {
    return {
      kind: 'network',
      message: 'Unable to connect. Please check your internet connection.',
    }
  }

  // Timeout errors
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      kind: 'timeout',
      message: 'Request timed out. The server is taking too long to respond.',
    }
  }

  // Generic error fallback
  return {
    kind: 'unknown',
    message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
  }
}

/**
 * Sleep helper for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Exponential backoff: 250ms, 750ms, 1500ms
 */
function getRetryDelay(attempt: number): number {
  const delays = [250, 750, 1500]
  return delays[attempt] || 1500
}

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * GET request with automatic retries and friendly errors
 */
export async function getJSON<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const { retries = 3, ...fetchOptions } = options
  let lastError: AppError | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        ...fetchOptions,
        method: 'GET',
        credentials: 'include',
      })

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        switch (response.status) {
          case 401:
            throw {
              kind: 'unauthorized',
              message: 'Please sign in to continue.',
              status: 401,
            } as AppError
          case 403:
            throw {
              kind: 'forbidden',
              message: 'You don\'t have permission to access this.',
              status: 403,
            } as AppError
          case 404:
            throw {
              kind: 'notfound',
              message: 'The requested data was not found.',
              status: 404,
            } as AppError
          case 500:
          case 502:
          case 503:
          case 504:
            throw {
              kind: 'server',
              message: 'The server encountered an error. We\'ll retry automatically.',
              status: response.status,
            } as AppError
          default:
            throw {
              kind: 'unknown',
              message: errorData.error || errorData.message || 'Request failed.',
              status: response.status,
            } as AppError
        }
      }

      // Success!
      const data = await response.json()
      return data
    } catch (error) {
      lastError = toAppError(error, url)

      // Don't retry on client errors (4xx except 408)
      if (
        lastError.kind === 'unauthorized' ||
        lastError.kind === 'forbidden' ||
        lastError.kind === 'notfound'
      ) {
        throw lastError
      }

      // If not last attempt, wait and retry
      if (attempt < retries - 1) {
        const delay = getRetryDelay(attempt)
        console.log(`⚠️ Retry attempt ${attempt + 1}/${retries} after ${delay}ms for ${url}`)
        await sleep(delay)
      }
    }
  }

  // All retries exhausted
  throw lastError
}

/**
 * POST request without auto-retries (unless idempotency key provided)
 */
export async function postJSON<T = any>(
  url: string,
  body: any,
  options: FetchOptions & { idempotencyKey?: string } = {}
): Promise<T> {
  const { idempotencyKey, retries = idempotencyKey ? 3 : 1, ...fetchOptions } = options

  const headers = new Headers(fetchOptions.headers)
  headers.set('Content-Type', 'application/json')
  if (idempotencyKey) {
    headers.set('Idempotency-Key', idempotencyKey)
  }

  let lastError: AppError | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        ...fetchOptions,
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          kind: response.status >= 500 ? 'server' : 'unknown',
          message: errorData.error || errorData.message || 'Request failed.',
          status: response.status,
        } as AppError
      }

      const data = await response.json()
      return data
    } catch (error) {
      lastError = toAppError(error, url)

      // Retry only if we have an idempotency key and it's a server/network error
      if (idempotencyKey && (lastError.kind === 'server' || lastError.kind === 'network')) {
        if (attempt < retries - 1) {
          const delay = getRetryDelay(attempt)
          console.log(`⚠️ POST retry ${attempt + 1}/${retries} after ${delay}ms for ${url}`)
          await sleep(delay)
          continue
        }
      }

      throw lastError
    }
  }

  throw lastError
}

/**
 * PATCH request without auto-retries
 */
export async function patchJSON<T = any>(
  url: string,
  body: any,
  options: FetchOptions = {}
): Promise<T> {
  const { retries = 1, ...fetchOptions } = options

  try {
    const response = await fetchWithTimeout(url, {
      ...fetchOptions,
      method: 'PATCH',
      credentials: 'include',
      headers: {
        ...fetchOptions.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        kind: response.status >= 500 ? 'server' : 'unknown',
        message: errorData.error || errorData.message || 'Update failed.',
        status: response.status,
      } as AppError
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw toAppError(error, url)
  }
}

/**
 * DELETE request without auto-retries
 */
export async function delJSON<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        kind: response.status >= 500 ? 'server' : 'unknown',
        message: errorData.error || errorData.message || 'Delete failed.',
        status: response.status,
      } as AppError
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw toAppError(error, url)
  }
}

