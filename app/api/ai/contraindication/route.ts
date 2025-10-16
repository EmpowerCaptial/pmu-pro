import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic"

interface ContraindicationResult {
  recommendation: 'safe' | 'caution' | 'not_recommended'
  confidence: number
  riskFactors: string[]
}

// Medically accurate PMU contraindication knowledge base
const CONTRAINDICATION_DATA = {
  // Absolute contraindications
  absolute: [
    'pregnancy', 'breastfeeding', 'active skin infection', 'active herpes outbreak',
    'uncontrolled diabetes', 'active chemotherapy', 'active radiation therapy',
    'active cancer', 'organ transplant recipient', 'hemophilia', 'active bleeding disorder',
    'active autoimmune flare', 'active lupus', 'active scleroderma',
    'keloid in treatment area', 'active psoriasis flare', 'active eczema flare'
  ],
  
  // Relative contraindications (require physician clearance)
  relative: [
    'controlled diabetes', 'blood thinners', 'aspirin', 'warfarin', 'plavix',
    'history of keloid scarring', 'history of hypertrophic scarring',
    'autoimmune disease', 'recent botox', 'recent filler',
    'accutane', 'isotretinoin', 'retinol', 'retin-a',
    'corticosteroids', 'immunosuppressants', 'chemotherapy history'
  ],
  
  // Medications that require caution
  medications: [
    'blood thinners', 'aspirin', 'ibuprofen', 'warfarin', 'coumadin',
    'accutane', 'isotretinoin', 'retin-a', 'retinol', 'vitamin a',
    'steroids', 'prednisone', 'cortisone', 'immunosuppressants'
  ]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientName, medicalConditions, medications, prescriptionMedications } = body

    if (!clientName) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      )
    }

    const allInfo = `${medicalConditions || ''} ${medications || ''} ${prescriptionMedications || ''}`.toLowerCase()

    const result: ContraindicationResult = {
      recommendation: 'safe',
      confidence: 85,
      riskFactors: []
    }

    // Check for absolute contraindications
    for (const condition of CONTRAINDICATION_DATA.absolute) {
      if (allInfo.includes(condition.toLowerCase())) {
        result.recommendation = 'not_recommended'
        result.confidence = 95
        result.riskFactors.push(condition)
      }
    }

    // Check for relative contraindications
    if (result.recommendation === 'safe') {
      for (const condition of CONTRAINDICATION_DATA.relative) {
        if (allInfo.includes(condition.toLowerCase())) {
          result.recommendation = 'caution'
          result.confidence = 80
          result.riskFactors.push(condition)
        }
      }
    }

    // Check medications
    if (result.recommendation === 'safe') {
      for (const med of CONTRAINDICATION_DATA.medications) {
        if (allInfo.includes(med.toLowerCase())) {
          result.recommendation = 'caution'
          result.confidence = 75
          result.riskFactors.push(med)
        }
      }
    }

    return NextResponse.json({
      success: true,
      clientName,
      result
    })

  } catch (error) {
    console.error('Contraindication analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze contraindications' },
      { status: 500 }
    )
  }
}
