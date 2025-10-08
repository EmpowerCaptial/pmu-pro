/**
 * Cache-first clients hook with SWR
 * Provides instant loading, automatic revalidation, and graceful error handling
 */

import useSWR from 'swr'
import { getJSON, type AppError } from '@/lib/http'

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  userId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastSeenAt?: string
  birthdate?: string
  address?: string
  notes?: string
  emergencyContact?: string
  allergies?: string
  medicalConditions?: string
  medications?: string
  skinType?: string
  concerns?: string
  goals?: string
  consent?: boolean
  consentDate?: string
}

interface UseClientsOptions {
  userEmail?: string
  enabled?: boolean
}

interface UseClientsReturn {
  clients: Client[]
  error: AppError | null
  isLoading: boolean
  isValidating: boolean
  refresh: () => Promise<void>
  mutate: (data?: Client[] | Promise<Client[]>, shouldRevalidate?: boolean) => Promise<Client[] | undefined>
}

/**
 * Hook to fetch and manage clients list with cache-first loading
 * 
 * Features:
 * - Instant cache-first load (stale-while-revalidate)
 * - Automatic revalidation on focus
 * - Deduping to prevent duplicate requests
 * - Keeps previous data while revalidating (no flash)
 * - Graceful error handling
 * 
 * @example
 * const { clients, error, isLoading, isValidating, refresh } = useClients({ userEmail: 'user@example.com' })
 */
export function useClients(options: UseClientsOptions = {}): UseClientsReturn {
  const { userEmail, enabled = true } = options

  // Construct the SWR key - null disables the request
  const key = enabled && userEmail ? `/api/clients?userEmail=${encodeURIComponent(userEmail)}` : null

  const { data, error, isValidating, mutate } = useSWR<Client[], AppError>(
    key,
    // Fetcher function using our retry-enabled getJSON
    (url: string) => getJSON<Client[]>(url),
    {
      // Keep previous data while revalidating (no flash/blank screen)
      keepPreviousData: true,
      
      // Revalidate when user focuses the window
      revalidateOnFocus: true,
      
      // Dedupe requests within 20 seconds
      dedupingInterval: 20000,
      
      // Revalidate if stale (default 2 seconds)
      revalidateIfStale: true,
      
      // Revalidate on mount if stale
      revalidateOnMount: true,
      
      // Don't revalidate on reconnect (we handle this with revalidateOnFocus)
      revalidateOnReconnect: false,
      
      // Error retry configuration
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      
      // Don't suspend rendering
      suspense: false,
      
      // Fallback data
      fallbackData: undefined,
    }
  )

  // Helper to manually trigger refresh
  const refresh = async () => {
    await mutate(undefined, { revalidate: true })
  }

  return {
    clients: data || [],
    error: error || null,
    isLoading: !data && !error, // First load
    isValidating, // Background revalidation
    refresh,
    mutate,
  }
}

/**
 * Optimistically add a client to the cache
 * Use this when creating a new client for instant UI update
 */
export async function optimisticAddClient(
  mutate: UseClientsReturn['mutate'],
  currentClients: Client[],
  newClient: Client
): Promise<void> {
  // Optimistically update the UI
  await mutate([newClient, ...currentClients], false)
}

/**
 * Optimistically update a client in the cache
 * Use this when editing a client for instant UI update
 */
export async function optimisticUpdateClient(
  mutate: UseClientsReturn['mutate'],
  currentClients: Client[],
  updatedClient: Partial<Client> & { id: string }
): Promise<void> {
  const updated = currentClients.map((client) =>
    client.id === updatedClient.id ? { ...client, ...updatedClient } : client
  )
  await mutate(updated, false)
}

/**
 * Optimistically remove a client from the cache
 * Use this when deleting a client for instant UI update
 */
export async function optimisticRemoveClient(
  mutate: UseClientsReturn['mutate'],
  currentClients: Client[],
  clientId: string
): Promise<void> {
  const filtered = currentClients.filter((client) => client.id !== clientId)
  await mutate(filtered, false)
}

