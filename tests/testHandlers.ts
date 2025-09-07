import { http, HttpResponse } from "msw"

export const handlers = [
  // Mock AI grading
  http.post("/api/analyze", () => 
    HttpResponse.json({ score: 92, overlays: [{ type: "stroke", x: 10, y: 20 }] })
  ),
  
  // Mock Stripe
  http.post("/api/stripe/checkout", () => 
    HttpResponse.json({ url: "/checkout/mock" })
  ),
  
  // Mock admin APIs
  http.get("/api/admin/users", () => 
    HttpResponse.json({ 
      success: true, 
      data: [
        { id: "1", name: "Test User", email: "test@example.com", subscriptionStatus: "active" }
      ] 
    })
  ),
  
  http.put("/api/admin/users/:id", () => 
    HttpResponse.json({ success: true, data: { id: "1", subscriptionStatus: "active" } })
  ),
  
  // Mock Supabase RPC (example)
  http.post("https://*.supabase.co/rest/v1/rpc/*", () => 
    HttpResponse.json({ ok: true })
  ),
  
  // Mock deposit payments
  http.post("/api/deposit-payments", () => 
    HttpResponse.json({ success: true, depositLink: "test-link-123" })
  ),
  
  // Mock Meta connections
  http.post("/api/meta/connect", () => 
    HttpResponse.json({ pages: [{ id: "1", name: "Test Page" }] })
  ),
  
  // Mock client creation
  http.post("/api/clients", () => 
    HttpResponse.json({ success: true, data: { id: "1", name: "Test Client" } })
  )
]
