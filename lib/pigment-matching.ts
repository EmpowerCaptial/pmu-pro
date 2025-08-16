import { type PigmentData, pigmentLibrary } from "./pigment-data"

export interface PigmentMatch {
  pigmentName: string
  brand: string
  swatch: string
  healedPhoto: string
  suggestedModifiers: string[]
  mixingNotes: string
  confidenceScore: number
}

export function findPigmentMatches(
  clientSkinTone: string,
  clientUndertone: string,
  desiredResult: string,
  category?: string,
): PigmentMatch[] {
  return pigmentLibrary
    .filter((pigment) => {
      if (category && pigment.colorCategory !== category) return false

      const toneMatch =
        pigment.aiPigmentMatchTags.skinToneMatches.includes(clientSkinTone) ||
        pigment.aiPigmentMatchTags.skinToneMatches.includes("All")
      const undertoneMatch = pigment.aiPigmentMatchTags.undertoneMatches.includes(clientUndertone)
      const resultMatch = pigment.aiPigmentMatchTags.desiredHealedResults.some(
        (result) =>
          result.toLowerCase().includes(desiredResult.toLowerCase()) ||
          desiredResult.toLowerCase().includes(result.toLowerCase()),
      )

      return toneMatch && undertoneMatch && resultMatch
    })
    .map((match) => {
      let confidenceScore = 0
      if (match.aiPigmentMatchTags.skinToneMatches.includes(clientSkinTone)) confidenceScore += 40
      if (match.aiPigmentMatchTags.undertoneMatches.includes(clientUndertone)) confidenceScore += 30
      if (
        match.aiPigmentMatchTags.desiredHealedResults.some(
          (result) => result.toLowerCase() === desiredResult.toLowerCase(),
        )
      )
        confidenceScore += 30

      return {
        pigmentName: match.pigmentName,
        brand: match.brand,
        swatch: match.digitalSwatch,
        healedPhoto: match.healedResultPhoto,
        suggestedModifiers: match.correctorModifierPairings.suggestedModifiers,
        mixingNotes: match.correctorModifierPairings.mixingNotes,
        confidenceScore,
      }
    })
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
}

export function getPigmentsByCategory(category: string): PigmentData[] {
  return pigmentLibrary.filter((pigment) => pigment.colorCategory === category)
}

export function searchPigments(query: string): PigmentData[] {
  const searchTerm = query.toLowerCase()
  return pigmentLibrary.filter(
    (pigment) =>
      pigment.pigmentName.toLowerCase().includes(searchTerm) ||
      pigment.brand.toLowerCase().includes(searchTerm) ||
      pigment.colorCategory.toLowerCase().includes(searchTerm) ||
      pigment.baseTone.toLowerCase().includes(searchTerm),
  )
}
