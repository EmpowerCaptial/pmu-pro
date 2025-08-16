// AI Client abstraction for PMU Pro
// Supports pluggable providers: OpenAI, Azure, Vertex AI

interface AIProvider {
  name: string
  analyzeIntake(data: IntakeAnalysisRequest): Promise<ContraindicationResult>
  detectSkin(imageData: string): Promise<SkinAnalysisResult>
  matchPigment(request: PigmentMatchRequest): Promise<PigmentRecommendation>
}

interface IntakeAnalysisRequest {
  conditions: string[]
  medications: string[]
  notes?: string
}

interface ContraindicationResult {
  result: "safe" | "precaution" | "not_recommended"
  rationale: string
  flaggedItems: string[]
  recommendations: string[]
  confidence: number
}

interface SkinAnalysisResult {
  fitzpatrick: number
  undertone: "cool" | "neutral" | "warm"
  confidence: number
  photoQuality: "good" | "fair" | "poor"
}

interface PigmentMatchRequest {
  fitzpatrick: number
  undertone: "cool" | "neutral" | "warm"
  useCase: "brows" | "lips" | "liner"
}

interface PigmentRecommendation {
  best: {
    pigmentId: string
    why: string
    expectedHealShift?: string
  }
  warmAlt: {
    pigmentId: string
    why: string
    expectedHealShift?: string
  }
  coolAlt: {
    pigmentId: string
    why: string
    expectedHealShift?: string
  }
}

// Mock AI Provider for development
class MockAIProvider implements AIProvider {
  name = "Mock AI Provider"

  async analyzeIntake(data: IntakeAnalysisRequest): Promise<ContraindicationResult> {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock contraindication logic
    const hasHighRiskMeds = data.medications.some(
      (med) =>
        med.toLowerCase().includes("isotretinoin") ||
        med.toLowerCase().includes("accutane") ||
        med.toLowerCase().includes("warfarin"),
    )

    const hasHighRiskConditions = data.conditions.some(
      (condition) =>
        condition.toLowerCase().includes("diabetes") ||
        condition.toLowerCase().includes("keloid") ||
        condition.toLowerCase().includes("infection"),
    )

    let result: "safe" | "precaution" | "not_recommended"
    let rationale: string
    let flaggedItems: string[] = []
    let recommendations: string[] = []

    if (hasHighRiskMeds && data.medications.some((med) => med.toLowerCase().includes("isotretinoin"))) {
      result = "not_recommended"
      rationale =
        "Client is taking isotretinoin (Accutane), which significantly increases risk of poor healing and scarring. PMU is contraindicated for 6-12 months after discontinuation."
      flaggedItems = data.medications.filter(
        (med) => med.toLowerCase().includes("isotretinoin") || med.toLowerCase().includes("accutane"),
      )
      recommendations = ["Do not proceed with PMU", "Recommend 6-12 month waiting period", "Document contraindication"]
    } else if (hasHighRiskMeds || hasHighRiskConditions) {
      result = "precaution"
      rationale =
        "Client has conditions or medications that require special consideration. Proceed with caution and consider medical clearance."
      flaggedItems = [
        ...data.medications.filter(
          (med) => med.toLowerCase().includes("warfarin") || med.toLowerCase().includes("aspirin"),
        ),
        ...data.conditions.filter(
          (condition) => condition.toLowerCase().includes("diabetes") || condition.toLowerCase().includes("keloid"),
        ),
      ]
      recommendations = [
        "Consider medical clearance",
        "Inform client of increased risks",
        "Monitor healing closely",
        "Use modified technique if needed",
      ]
    } else {
      result = "safe"
      rationale =
        "No significant contraindications found. Client appears suitable for PMU procedures with standard precautions."
      recommendations = [
        "Proceed with standard PMU protocols",
        "Ensure proper aftercare instructions",
        "Schedule follow-up as needed",
      ]
    }

    return {
      result,
      rationale,
      flaggedItems,
      recommendations,
      confidence: 0.92,
    }
  }

  async detectSkin(imageData: string): Promise<SkinAnalysisResult> {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock skin analysis
    return {
      fitzpatrick: Math.floor(Math.random() * 6) + 1,
      undertone: ["cool", "neutral", "warm"][Math.floor(Math.random() * 3)] as "cool" | "neutral" | "warm",
      confidence: 0.85 + Math.random() * 0.15,
      photoQuality: "good",
    }
  }

  async matchPigment(request: PigmentMatchRequest): Promise<PigmentRecommendation> {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock pigment matching logic
    return {
      best: {
        pigmentId: "1",
        why: `Perfect match for Fitzpatrick ${request.fitzpatrick} with ${request.undertone} undertones`,
        expectedHealShift: "Stable healing with minimal color shift",
      },
      warmAlt: {
        pigmentId: "2",
        why: "Warm alternative for enhanced golden tones",
        expectedHealShift: "May heal slightly warmer",
      },
      coolAlt: {
        pigmentId: "3",
        why: "Cool alternative for ash undertones",
        expectedHealShift: "May fade to cooler tones",
      },
    }
  }
}

// OpenAI Provider (placeholder for real implementation)
class OpenAIProvider implements AIProvider {
  name = "OpenAI"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async analyzeIntake(data: IntakeAnalysisRequest): Promise<ContraindicationResult> {
    // TODO: Implement OpenAI API integration
    // For now, fallback to mock
    const mockProvider = new MockAIProvider()
    return mockProvider.analyzeIntake(data)
  }

  async detectSkin(imageData: string): Promise<SkinAnalysisResult> {
    // TODO: Implement OpenAI Vision API integration
    const mockProvider = new MockAIProvider()
    return mockProvider.detectSkin(imageData)
  }

  async matchPigment(request: PigmentMatchRequest): Promise<PigmentRecommendation> {
    // TODO: Implement OpenAI API integration
    const mockProvider = new MockAIProvider()
    return mockProvider.matchPigment(request)
  }
}

// Groq provider implementation
class GroqProvider implements AIProvider {
  name = "Groq"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async analyzeIntake(data: IntakeAnalysisRequest): Promise<ContraindicationResult> {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content: `You are a PMU (Permanent Makeup) safety expert. Analyze client intake data for contraindications. 
              
              Respond with a JSON object containing:
              - result: "safe" | "precaution" | "not_recommended"
              - rationale: detailed explanation
              - flaggedItems: array of concerning items
              - recommendations: array of action items
              - confidence: number between 0-1
              
              High-risk medications include: isotretinoin, accutane, warfarin, chemotherapy drugs
              High-risk conditions include: active infections, keloid scarring, uncontrolled diabetes, autoimmune disorders`,
            },
            {
              role: "user",
              content: `Analyze this PMU intake:
              Conditions: ${data.conditions.join(", ")}
              Medications: ${data.medications.join(", ")}
              Notes: ${data.notes || "None"}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      const result = await response.json()
      const content = result.choices[0]?.message?.content

      try {
        return JSON.parse(content)
      } catch {
        // Fallback to mock if JSON parsing fails
        const mockProvider = new MockAIProvider()
        return mockProvider.analyzeIntake(data)
      }
    } catch (error) {
      console.error("Groq API error:", error)
      // Fallback to mock provider
      const mockProvider = new MockAIProvider()
      return mockProvider.analyzeIntake(data)
    }
  }

  async detectSkin(imageData: string): Promise<SkinAnalysisResult> {
    // For now, use mock implementation as Groq doesn't have vision capabilities
    const mockProvider = new MockAIProvider()
    return mockProvider.detectSkin(imageData)
  }

  async matchPigment(request: PigmentMatchRequest): Promise<PigmentRecommendation> {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content: `You are a PMU pigment matching expert. Recommend pigments based on Fitzpatrick skin type and undertones.
              
              Respond with JSON containing:
              - best: {pigmentId, why, expectedHealShift}
              - warmAlt: {pigmentId, why, expectedHealShift}  
              - coolAlt: {pigmentId, why, expectedHealShift}`,
            },
            {
              role: "user",
              content: `Match pigment for:
              Fitzpatrick: ${request.fitzpatrick}
              Undertone: ${request.undertone}
              Use case: ${request.useCase}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      const result = await response.json()
      const content = result.choices[0]?.message?.content

      try {
        return JSON.parse(content)
      } catch {
        const mockProvider = new MockAIProvider()
        return mockProvider.matchPigment(request)
      }
    } catch (error) {
      console.error("Groq API error:", error)
      const mockProvider = new MockAIProvider()
      return mockProvider.matchPigment(request)
    }
  }
}

// AI Client singleton
class AIClient {
  private provider: AIProvider

  constructor() {
    // Initialize with appropriate provider based on environment
    const groqKey = process.env.GROQ_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    if (groqKey) {
      this.provider = new GroqProvider(groqKey)
    } else if (openaiKey) {
      this.provider = new OpenAIProvider(openaiKey)
    } else {
      this.provider = new MockAIProvider()
    }
  }

  async analyzeIntake(data: IntakeAnalysisRequest): Promise<ContraindicationResult> {
    return this.provider.analyzeIntake(data)
  }

  async detectSkin(imageData: string): Promise<SkinAnalysisResult> {
    return this.provider.detectSkin(imageData)
  }

  async matchPigment(request: PigmentMatchRequest): Promise<PigmentRecommendation> {
    return this.provider.matchPigment(request)
  }

  getProviderName(): string {
    return this.provider.name
  }
}

// Export singleton instance
export const aiClient = new AIClient()
export type {
  ContraindicationResult,
  SkinAnalysisResult,
  PigmentRecommendation,
  IntakeAnalysisRequest,
  PigmentMatchRequest,
}
