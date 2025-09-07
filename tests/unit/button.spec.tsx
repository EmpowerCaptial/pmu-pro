import { render, screen } from "@testing-library/react"
import user from "@testing-library/user-event"
import { UIButton } from "@/components/ui/Button"
import { describe, it, expect, vi } from "vitest"

describe("UIButton", () => {
  it("fires onClick", async () => {
    const fn = vi.fn()
    render(<UIButton data-testid="btn" onClick={fn}>Go</UIButton>)
    await user.click(screen.getByTestId("btn"))
    expect(fn).toHaveBeenCalled()
  })

  it("renders with test id", () => {
    render(<UIButton data-testid="test-button">Click me</UIButton>)
    expect(screen.getByTestId("test-button")).toBeInTheDocument()
  })

  it("applies variant classes", () => {
    render(<UIButton data-testid="btn" variant="destructive">Delete</UIButton>)
    const button = screen.getByTestId("btn")
    expect(button).toHaveClass("bg-destructive")
  })

  it("applies size classes", () => {
    render(<UIButton data-testid="btn" size="sm">Small</UIButton>)
    const button = screen.getByTestId("btn")
    expect(button).toHaveClass("h-9")
  })
})
