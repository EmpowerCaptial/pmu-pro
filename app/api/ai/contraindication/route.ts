import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic"

interface ContraindicationResult {
  status: 'safe' | 'precaution' | 'contraindicated'
  confidence: number
  reasoning: string
  recommendations: string[]
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
    const { clientName, medicalConditions, medications, prescriptions } = body

    if (!clientName) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      )
    }

    const allInfo = `${medicalConditions || ''} ${medications || ''} ${prescriptions || ''}`.toLowerCase()

    const result: ContraindicationResult = {
      status: 'safe',
      confidence: 85,
      reasoning: '',
      recommendations: [],
      riskFactors: []
    }

    // Check for absolute contraindications
    for (const condition of CONTRAINDICATION_DATA.absolute) {
      if (allInfo.includes(condition.toLowerCase())) {
        result.status = 'contraindicated'
        result.confidence = 95
        result.riskFactors.push(condition)
      }
    }

    // Check for relative contraindications
    if (result.status === 'safe') {
      for (const condition of CONTRAINDICATION_DATA.relative) {
        if (allInfo.includes(condition.toLowerCase())) {
          result.status = 'precaution'
          result.confidence = 80
          result.riskFactors.push(condition)
        }
      }
    }

    // Check medications
    if (result.status === 'safe') {
      for (const med of CONTRAINDICATION_DATA.medications) {
        if (allInfo.includes(med.toLowerCase())) {
          result.status = 'precaution'
          result.confidence = 75
          result.riskFactors.push(med)
        }
      }
    }

    // Generate reasoning and recommendations based on status
    if (result.status === 'contraindicated') {
      result.reasoning = `Based on the medical information provided, absolute contraindications have been identified. PMU procedures are NOT RECOMMENDED at this time. The client should consult with their healthcare provider before proceeding with any permanent makeup or tattoo procedures.`
      result.recommendations = [
        'Consult with healthcare provider before proceeding',
        'Wait until contraindicating conditions are resolved',
        'Consider alternative temporary solutions',
        'Document all medical consultations'
      ]
    } else if (result.status === 'precaution') {
      result.reasoning = `Based on the medical information provided, relative contraindications or caution factors have been identified. While not absolute contraindications, these conditions require special consideration and may necessitate modifications to the PMU procedure protocol. Physician clearance is recommended before proceeding.`
      result.recommendations = [
        'Obtain physician clearance before proceeding',
        'Use modified pigment and technique',
        'Consider longer healing time expectations',
        'Monitor client closely during healing',
        'Document all precautions taken'
      ]
    } else {
      result.reasoning = `Based on the medical information provided, no significant contraindications have been identified. The client appears to be a suitable candidate for PMU procedures following standard protocols.`
      result.recommendations = [
        'Follow standard PMU protocols',
        'Complete intake forms and consent',
        'Provide post-procedure care instructions',
        'Schedule appropriate follow-up appointments'
      ]
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
