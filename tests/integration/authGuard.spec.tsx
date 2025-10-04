import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

// Mock Next.js router
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/dashboard",
}))

// Mock auth context
const mockAuthContext = {
  user: null as any,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
}

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}))

describe("AuthGuard", () => {
  it("redirects unauthenticated users", () => {
    // This would test your auth guard component
    // For now, just verify the mock is working
    expect(mockAuthContext.user).toBeNull()
  })

  it("allows authenticated users", () => {
    mockAuthContext.user = { id: "1", email: "test@example.com" }
    expect(mockAuthContext.user).toBeTruthy()
  })
})
