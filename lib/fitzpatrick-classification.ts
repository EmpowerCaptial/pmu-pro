/**
 * Fitzpatrick Skin Type Classification System
 * Based on scientific research and dermatological standards
 * 
 * Fitzpatrick, T.B. (1988). The validity and practicality of sun-reactive skin types I through VI. 
 * Archives of Dermatology, 124(6), 869-871.
 */

export interface FitzpatrickCharacteristics {
  type: number
  name: string
  description: string
  skinColor: string
  sunReaction: string
  tanningAbility: string
  freckling: string
  eyeColor: string
  hairColor: string
  burnTime: string
  typicalEthnicities: string[]
  riskFactors: string[]
  colorRange: {
    hex: string
    rgb: string
    description: string
  }[]
}

export const fitzpatrickTypes: FitzpatrickCharacteristics[] = [
  {
    type: 1,
    name: "Type I",
    description: "Very Fair",
    skinColor: "Pale white",
    sunReaction: "Always burns, never tans",
    tanningAbility: "No tanning ability",
    freckling: "Heavy freckling",
    eyeColor: "Light blue, light gray, light green",
    hairColor: "Red, very light blonde",
    burnTime: "5-10 minutes",
    typicalEthnicities: ["Celtic", "Scandinavian", "Northern European"],
    riskFactors: ["Highest skin cancer risk", "Severe photoaging", "Melanoma prone"],
    colorRange: [
      { hex: "#FFE5D1", rgb: "255, 229, 209", description: "Very pale cream" },
      { hex: "#F4D4C3", rgb: "244, 212, 195", description: "Pale peach" },
      { hex: "#E6C3A8", rgb: "230, 195, 168", description: "Light beige" }
    ]
  },
  {
    type: 2,
    name: "Type II",
    description: "Fair",
    skinColor: "White",
    sunReaction: "Usually burns, tans minimally",
    tanningAbility: "Minimal tanning",
    freckling: "Moderate freckling",
    eyeColor: "Blue, gray, green, hazel",
    hairColor: "Blonde, light brown",
    burnTime: "10-20 minutes",
    typicalEthnicities: ["Northern European", "British", "German"],
    riskFactors: ["High skin cancer risk", "Severe photoaging", "Melanoma prone"],
    colorRange: [
      { hex: "#E6C3A8", rgb: "230, 195, 168", description: "Light beige" },
      { hex: "#D4A574", rgb: "212, 165, 116", description: "Light tan" },
      { hex: "#C19A6B", rgb: "193, 154, 107", description: "Medium beige" }
    ]
  },
  {
    type: 3,
    name: "Type III",
    description: "Light Medium",
    skinColor: "Light brown",
    sunReaction: "Sometimes burns, tans gradually",
    tanningAbility: "Moderate tanning",
    freckling: "Light freckling",
    eyeColor: "Brown, hazel, green",
    hairColor: "Brown, dark blonde",
    burnTime: "20-30 minutes",
    typicalEthnicities: ["Southern European", "Mediterranean", "Middle Eastern"],
    riskFactors: ["Moderate skin cancer risk", "Moderate photoaging"],
    colorRange: [
      { hex: "#C19A6B", rgb: "193, 154, 107", description: "Medium beige" },
      { hex: "#B87C56", rgb: "184, 124, 86", description: "Medium tan" },
      { hex: "#A67B5B", rgb: "166, 123, 91", description: "Olive tan" }
    ]
  },
  {
    type: 4,
    name: "Type IV",
    description: "Medium",
    skinColor: "Olive",
    sunReaction: "Burns minimally, tans well",
    tanningAbility: "Good tanning",
    freckling: "Rare freckling",
    eyeColor: "Brown, dark brown",
    hairColor: "Dark brown, black",
    burnTime: "30-45 minutes",
    typicalEthnicities: ["Mediterranean", "Middle Eastern", "Latin American"],
    riskFactors: ["Lower skin cancer risk", "Mild photoaging"],
    colorRange: [
      { hex: "#A67B5B", rgb: "166, 123, 91", description: "Olive tan" },
      { hex: "#8B5A3C", rgb: "139, 90, 60", description: "Medium olive" },
      { hex: "#7A5C3D", rgb: "122, 92, 61", description: "Dark olive" }
    ]
  },
  {
    type: 5,
    name: "Type V",
    description: "Medium Dark",
    skinColor: "Dark brown",
    sunReaction: "Rarely burns, tans deeply",
    tanningAbility: "Excellent tanning",
    freckling: "No freckling",
    eyeColor: "Dark brown, black",
    hairColor: "Black, dark brown",
    burnTime: "45-60 minutes",
    typicalEthnicities: ["South Asian", "Middle Eastern", "North African"],
    riskFactors: ["Low skin cancer risk", "Minimal photoaging"],
    colorRange: [
      { hex: "#7A5C3D", rgb: "122, 92, 61", description: "Dark olive" },
      { hex: "#5D3A1F", rgb: "93, 58, 31", description: "Dark brown" },
      { hex: "#4A2C1A", rgb: "74, 44, 26", description: "Very dark brown" }
    ]
  },
  {
    type: 6,
    name: "Type VI",
    description: "Dark",
    skinColor: "Deeply pigmented",
    sunReaction: "Never burns, deeply pigmented",
    tanningAbility: "Maximum pigmentation",
    freckling: "No freckling",
    eyeColor: "Dark brown, black",
    hairColor: "Black",
    burnTime: "60+ minutes (rarely burns)",
    typicalEthnicities: ["African", "African American", "Australian Aboriginal"],
    riskFactors: ["Lowest skin cancer risk", "Minimal photoaging", "Higher melanoma risk in non-sun exposed areas"],
    colorRange: [
      { hex: "#4A2C1A", rgb: "74, 44, 26", description: "Very dark brown" },
      { hex: "#3D2814", rgb: "61, 40, 20", description: "Dark chocolate" },
      { hex: "#2F1B0E", rgb: "47, 27, 14", description: "Deep black-brown" }
    ]
  }
]

/**
 * Enhanced Fitzpatrick Classification Algorithm
 * Uses multiple factors for accurate classification
 */
export interface SkinAnalysisFactors {
  skinTone: number // 0-100 scale
  undertone: "cool" | "neutral" | "warm"
  sunReaction: "always_burns" | "usually_burns" | "sometimes_burns" | "rarely_burns" | "never_burns"
  tanningAbility: "never" | "minimal" | "moderate" | "good" | "excellent" | "maximum"
  freckling: "heavy" | "moderate" | "light" | "rare" | "none"
  eyeColor: string
  hairColor: string
  ethnicity: string
  photoQuality: "excellent" | "good" | "fair" | "poor"
}

export function classifyFitzpatrickType(factors: SkinAnalysisFactors): {
  type: number
  confidence: number
  reasoning: string
  characteristics: FitzpatrickCharacteristics
} {
  let scores: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  let reasoning: string[] = []

  // Factor 1: Skin Tone Analysis (0-100 scale)
  const skinToneScore = analyzeSkinTone(factors.skinTone)
  scores[skinToneScore.primary] += 40
  scores[skinToneScore.secondary] += 20
  reasoning.push(`Skin tone analysis: Primary match Type ${skinToneScore.primary}, secondary Type ${skinToneScore.secondary}`)

  // Factor 2: Sun Reaction Pattern
  const sunReactionScore = analyzeSunReaction(factors.sunReaction)
  scores[sunReactionScore.primary] += 25
  scores[sunReactionScore.secondary] += 15
  reasoning.push(`Sun reaction: ${factors.sunReaction} pattern matches Type ${sunReactionScore.primary}`)

  // Factor 3: Tanning Ability
  const tanningScore = analyzeTanningAbility(factors.tanningAbility)
  scores[tanningScore.primary] += 20
  scores[tanningScore.secondary] += 10
  reasoning.push(`Tanning ability: ${factors.tanningAbility} matches Type ${tanningScore.primary}`)

  // Factor 4: Ethnic Background (if provided)
  if (factors.ethnicity) {
    const ethnicityScore = analyzeEthnicity(factors.ethnicity)
    scores[ethnicityScore.primary] += 15
    reasoning.push(`Ethnic background: ${factors.ethnicity} typically Type ${ethnicityScore.primary}`)
  }

  // Factor 5: Photo Quality Adjustment
  const qualityMultiplier = getPhotoQualityMultiplier(factors.photoQuality)
  Object.keys(scores).forEach(type => {
    scores[parseInt(type)] *= qualityMultiplier
  })
  reasoning.push(`Photo quality: ${factors.photoQuality} (confidence adjustment: ${(qualityMultiplier * 100).toFixed(0)}%)`)

  // Find the best match
  let bestType = 1
  let bestScore = 0
  
  Object.entries(scores).forEach(([type, score]) => {
    if (score > bestScore) {
      bestScore = score
      bestType = parseInt(type)
    }
  })

  // Calculate confidence based on score distribution
  const totalPossibleScore = 100
  const confidence = Math.min(0.95, Math.max(0.7, bestScore / totalPossibleScore))

  return {
    type: bestType,
    confidence,
    reasoning: reasoning.join("; "),
    characteristics: fitzpatrickTypes.find(t => t.type === bestType)!
  }
}

function analyzeSkinTone(tone: number): { primary: number; secondary: number } {
  if (tone <= 20) return { primary: 1, secondary: 2 }
  if (tone <= 35) return { primary: 2, secondary: 1 }
  if (tone <= 50) return { primary: 3, secondary: 2 }
  if (tone <= 65) return { primary: 4, secondary: 3 }
  if (tone <= 80) return { primary: 5, secondary: 4 }
  return { primary: 6, secondary: 5 }
}

function analyzeSunReaction(reaction: string): { primary: number; secondary: number } {
  switch (reaction) {
    case "always_burns": return { primary: 1, secondary: 2 }
    case "usually_burns": return { primary: 2, secondary: 1 }
    case "sometimes_burns": return { primary: 3, secondary: 2 }
    case "rarely_burns": return { primary: 4, secondary: 3 }
    case "never_burns": return { primary: 6, secondary: 5 }
    default: return { primary: 3, secondary: 2 }
  }
}

function analyzeTanningAbility(ability: string): { primary: number; secondary: number } {
  switch (ability) {
    case "never": return { primary: 1, secondary: 2 }
    case "minimal": return { primary: 2, secondary: 1 }
    case "moderate": return { primary: 3, secondary: 2 }
    case "good": return { primary: 4, secondary: 3 }
    case "excellent": return { primary: 5, secondary: 4 }
    case "maximum": return { primary: 6, secondary: 5 }
    default: return { primary: 3, secondary: 2 }
  }
}

function analyzeEthnicity(ethnicity: string): { primary: number; secondary: number } {
  const ethnicityMap: { [key: string]: number } = {
    "celtic": 1, "scandinavian": 1, "northern_european": 2,
    "british": 2, "german": 2, "southern_european": 3,
    "mediterranean": 3, "middle_eastern": 4, "latin_american": 4,
    "south_asian": 5, "north_african": 5, "african": 6,
    "african_american": 6, "australian_aboriginal": 6
  }
  
  const normalized = ethnicity.toLowerCase().replace(/\s+/g, '_')
  const type = ethnicityMap[normalized] || 3
  return { primary: type, secondary: Math.max(1, type - 1) }
}

function getPhotoQualityMultiplier(quality: string): number {
  switch (quality) {
    case "excellent": return 1.0
    case "good": return 0.95
    case "fair": return 0.85
    case "poor": return 0.7
    default: return 0.8
  }
}

/**
 * Get Fitzpatrick type by name or description
 */
export function getFitzpatrickType(query: string | number): FitzpatrickCharacteristics | null {
  if (typeof query === "number") {
    return fitzpatrickTypes.find(t => t.type === query) || null
  }
  
  const normalized = query.toLowerCase()
  return fitzpatrickTypes.find(t => 
    t.name.toLowerCase().includes(normalized) ||
    t.description.toLowerCase().includes(normalized) ||
    t.typicalEthnicities.some(ethnicity => 
      ethnicity.toLowerCase().includes(normalized)
    )
  ) || null
}

/**
 * Get all Fitzpatrick types
 */
export function getAllFitzpatrickTypes(): FitzpatrickCharacteristics[] {
  return fitzpatrickTypes
}
