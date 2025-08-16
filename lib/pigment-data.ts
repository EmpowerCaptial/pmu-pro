export interface PigmentData {
  pigmentName: string
  brand: string
  colorCategory: string
  digitalSwatch: string
  healedResultPhoto: string
  baseTone: string
  undertoneDescription: string
  opacityLevel: string
  temperatureShift: string
  skinCompatibility: {
    bestFor: string[]
    recommendedFitzpatrick: number[]
  }
  commonUses: string[]
  correctorModifierPairings: {
    suggestedModifiers: string[]
    mixingNotes: string
  }
  needleRecommendations: {
    suggestedConfigurations: string[]
    dilutionRatios: string
  }
  doNotMixWith: string[]
  shelfLife: string
  storageConditions: string
  patchTestNotes: string
  msdsLink: string
  aiPigmentMatchTags: {
    skinToneMatches: string[]
    undertoneMatches: string[]
    desiredHealedResults: string[]
  }
}

export const pigmentLibrary: PigmentData[] = [
  {
    pigmentName: "Medium Brown",
    brand: "Permablend",
    colorCategory: "Brows",
    digitalSwatch: "/medium-brown-pigment-swatch.png",
    healedResultPhoto: "/healed-medium-brown-brows.png",
    baseTone: "Neutral",
    undertoneDescription: "Balanced mix of warm and cool with slight yellow",
    opacityLevel: "Medium",
    temperatureShift: "Slightly cools over time",
    skinCompatibility: {
      bestFor: ["Dry", "Normal", "Combo"],
      recommendedFitzpatrick: [2, 3, 4],
    },
    commonUses: ["Initial brow procedures", "Touch-ups", "Blending corrections"],
    correctorModifierPairings: {
      suggestedModifiers: ["Warm Modifier", "Yellow Adjuster"],
      mixingNotes: "Add 1 drop warm modifier for cooler undertones",
    },
    needleRecommendations: {
      suggestedConfigurations: ["3RL", "5RS"],
      dilutionRatios: "70% pigment / 30% shading solution for powder brows",
    },
    doNotMixWith: ["Cool Black", "Deep Olive"],
    shelfLife: "24 months unopened, 12 months opened",
    storageConditions: "Store at room temperature away from sunlight",
    patchTestNotes: "Always patch test 24 hours before procedure",
    msdsLink: "#",
    aiPigmentMatchTags: {
      skinToneMatches: ["Light-Medium", "Medium", "Tan"],
      undertoneMatches: ["Cool", "Neutral", "Slightly Warm"],
      desiredHealedResults: ["Soft Natural Brown", "Neutral Medium Brown", "Everyday Brow", "Balanced Tone Brow"],
    },
  },
  {
    pigmentName: "Darkest Brown",
    brand: "Tina Davies",
    colorCategory: "Brows",
    digitalSwatch: "/darkest-brown-swatch.png",
    healedResultPhoto: "/healed-darkest-brown-brows.png",
    baseTone: "Cool",
    undertoneDescription: "Deep brown with slight ash base",
    opacityLevel: "High",
    temperatureShift: "Can cool significantly over time",
    skinCompatibility: {
      bestFor: ["Normal", "Oily"],
      recommendedFitzpatrick: [4, 5, 6],
    },
    commonUses: ["Bold brows", "Covering warm faded brows"],
    correctorModifierPairings: {
      suggestedModifiers: ["Warm Orange Corrector"],
      mixingNotes: "Add 1 drop orange for clients with cool undertones",
    },
    needleRecommendations: {
      suggestedConfigurations: ["1RL", "3RL"],
      dilutionRatios: "Use undiluted for strong color saturation",
    },
    doNotMixWith: ["Blue Black"],
    shelfLife: "24 months unopened, 12 months opened",
    storageConditions: "Cool, dark place",
    patchTestNotes: "Essential for clients with pigment sensitivities",
    msdsLink: "#",
    aiPigmentMatchTags: {
      skinToneMatches: ["Medium", "Tan", "Deep"],
      undertoneMatches: ["Warm", "Neutral", "Cool with Correction"],
      desiredHealedResults: ["Bold Dark Brown", "Soft Black-Brown", "Deep Defined Brow", "High Contrast Brow"],
    },
  },
  {
    pigmentName: "Royal Red",
    brand: "LI Pigments",
    colorCategory: "Lips",
    digitalSwatch: "/royal-red-lip-swatch.png",
    healedResultPhoto: "/healed-royal-red-lips.png",
    baseTone: "Cool",
    undertoneDescription: "Blue-based red for vibrant healed lips",
    opacityLevel: "High",
    temperatureShift: "Stays cool over time",
    skinCompatibility: {
      bestFor: ["Normal", "Dry"],
      recommendedFitzpatrick: [1, 2, 3, 4],
    },
    commonUses: ["Full lip color", "Lip neutralization after healing"],
    correctorModifierPairings: {
      suggestedModifiers: ["Warm Coral Modifier"],
      mixingNotes: "Blend with warm coral for clients with dark lips",
    },
    needleRecommendations: {
      suggestedConfigurations: ["3RS", "5RS"],
      dilutionRatios: "80% pigment / 20% solution for softer look",
    },
    doNotMixWith: ["Deep Violet"],
    shelfLife: "18 months unopened, 12 months opened",
    storageConditions: "Avoid heat exposure",
    patchTestNotes: "Test especially for clients with lipstick allergies",
    msdsLink: "#",
    aiPigmentMatchTags: {
      skinToneMatches: ["Light", "Light-Medium", "Medium"],
      undertoneMatches: ["Cool", "Neutral"],
      desiredHealedResults: ["Classic Red Lips", "Berry-Toned Lips", "Bold Lip Color", "Vibrant Red"],
    },
  },
  {
    pigmentName: "Black Onyx",
    brand: "Permablend",
    colorCategory: "Eyeliner",
    digitalSwatch: "/black-onyx-eyeliner-swatch.png",
    healedResultPhoto: "/healed-black-eyeliner.png",
    baseTone: "Cool",
    undertoneDescription: "True black with minimal blue shift",
    opacityLevel: "High",
    temperatureShift: "May slightly cool with blue hint over years",
    skinCompatibility: {
      bestFor: ["All skin types"],
      recommendedFitzpatrick: [1, 2, 3, 4, 5, 6],
    },
    commonUses: ["Classic eyeliner", "Lash enhancement"],
    correctorModifierPairings: {
      suggestedModifiers: [],
      mixingNotes: "Use as is for eyeliner",
    },
    needleRecommendations: {
      suggestedConfigurations: ["1RL", "3RL"],
      dilutionRatios: "Use undiluted for maximum saturation",
    },
    doNotMixWith: ["Brown pigments for brows"],
    shelfLife: "24 months unopened, 12 months opened",
    storageConditions: "Room temperature, avoid freezing",
    patchTestNotes: "Essential for eyeliner clients with sensitivities",
    msdsLink: "#",
    aiPigmentMatchTags: {
      skinToneMatches: ["All"],
      undertoneMatches: ["Cool", "Neutral", "Warm"],
      desiredHealedResults: ["Deep Black Eyeliner", "Classic Lash Line", "Intense Liner"],
    },
  },
  {
    pigmentName: "Golden Sunrise",
    brand: "Tina Davies",
    colorCategory: "Correction",
    digitalSwatch: "/golden-sunrise-pigment.png",
    healedResultPhoto: "/corrected-brow-tone.png",
    baseTone: "Warm",
    undertoneDescription: "Bright yellow-orange for neutralizing cool or ashy brows",
    opacityLevel: "Medium",
    temperatureShift: "Maintains warmth",
    skinCompatibility: {
      bestFor: ["All skin types"],
      recommendedFitzpatrick: [1, 2, 3, 4, 5],
    },
    commonUses: ["Correcting ashy brows", "Mixing with cool pigments"],
    correctorModifierPairings: {
      suggestedModifiers: [],
      mixingNotes: "Mix 1:1 with cool pigment for balanced brow tone",
    },
    needleRecommendations: {
      suggestedConfigurations: ["3RL", "5RS"],
      dilutionRatios: "Can be used undiluted for correction",
    },
    doNotMixWith: ["Lip pigments"],
    shelfLife: "24 months unopened, 12 months opened",
    storageConditions: "Store in cool, dry place",
    patchTestNotes: "Always test for orange/yellow pigment sensitivities",
    msdsLink: "#",
    aiPigmentMatchTags: {
      skinToneMatches: ["All"],
      undertoneMatches: ["Cool", "Neutral", "Ashy"],
      desiredHealedResults: ["Neutralized Natural Brow Tone", "Corrected Brow Base", "Warm Base Adjustment"],
    },
  },
]
