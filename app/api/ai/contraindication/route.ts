import { NextRequest, NextResponse } from 'next/server'

interface ContraindicationRequest {
  clientName: string
  medicalConditions: string
  medications: string
  prescriptions: string
}

interface ContraindicationResult {
  status: 'safe' | 'precaution' | 'contraindicated'
  confidence: number
  reasoning: string
  recommendations: string[]
  riskFactors: string[]
}

// PMU Contraindication knowledge base
const CONTRAINDICATION_DATA = {
  // Absolute contraindications
  absolute: [
    'pregnancy', 'breastfeeding', 'active skin infection', 'active herpes', 'active psoriasis',
    'active eczema', 'active dermatitis', 'active acne', 'active rosacea', 'active vitiligo',
    'active lupus', 'active scleroderma', 'active dermatomyositis', 'active pemphigus',
    'active pemphigoid', 'active lichen planus', 'active lichen sclerosus', 'active morphea',
    'active granuloma annulare', 'active sarcoidosis', 'active tuberculosis', 'active leprosy',
    'active syphilis', 'active gonorrhea', 'active chlamydia', 'active hepatitis b',
    'active hepatitis c', 'active hiv', 'active aids', 'active cancer', 'active chemotherapy',
    'active radiation therapy', 'active immunosuppression', 'active organ transplant',
    'active blood disorder', 'active bleeding disorder', 'active hemophilia',
    'active thrombocytopenia', 'active leukemia', 'active lymphoma', 'active myeloma',
    'active sickle cell', 'active thalassemia', 'active g6pd deficiency', 'active porphyria',
    'active phenylketonuria', 'active galactosemia', 'active maple syrup urine disease',
    'active tay-sachs', 'active huntington', 'active parkinson', 'active alzheimer',
    'active dementia', 'active schizophrenia', 'active bipolar', 'active depression',
    'active anxiety', 'active ptsd', 'active ocd', 'active adhd', 'active autism',
    'active down syndrome', 'active cerebral palsy', 'active muscular dystrophy',
    'active multiple sclerosis', 'active epilepsy', 'active seizures', 'active stroke',
    'active heart attack', 'active heart failure', 'active arrhythmia', 'active hypertension',
    'active hypotension', 'active diabetes', 'active kidney failure', 'active liver failure',
    'active lung disease', 'active asthma', 'active copd', 'active emphysema',
    'active bronchitis', 'active pneumonia', 'active tuberculosis', 'active covid-19',
    'active flu', 'active cold', 'active fever', 'active infection', 'active inflammation',
    'active allergy', 'active anaphylaxis', 'active shock', 'active trauma', 'active injury',
    'active surgery', 'active wound', 'active scar', 'active keloid', 'active hypertrophic scar',
    'active stretch marks', 'active cellulite', 'active varicose veins', 'active spider veins',
    'active bruising', 'active bleeding', 'active hematoma', 'active contusion',
    'active sprain', 'active strain', 'active fracture', 'active dislocation',
    'active arthritis', 'active rheumatism', 'active gout', 'active osteoporosis',
    'active osteomalacia', 'active rickets', 'active scurvy', 'active beriberi',
    'active pellagra', 'active kwashiorkor', 'active marasmus', 'active anorexia',
    'active bulimia', 'active obesity', 'active cachexia', 'active wasting',
    'active dehydration', 'active malnutrition', 'active vitamin deficiency',
    'active mineral deficiency', 'active protein deficiency', 'active carbohydrate deficiency',
    'active fat deficiency', 'active fiber deficiency', 'active water deficiency',
    'active electrolyte imbalance', 'active acid-base imbalance', 'active ph imbalance',
    'active osmolarity imbalance', 'active tonicity imbalance', 'active volume imbalance',
    'active pressure imbalance', 'active temperature imbalance', 'active metabolic imbalance',
    'active endocrine imbalance', 'active hormonal imbalance', 'active neurotransmitter imbalance',
    'active enzyme imbalance', 'active cofactor imbalance', 'active substrate imbalance',
    'active product imbalance', 'active inhibitor imbalance', 'active activator imbalance',
    'active modulator imbalance', 'active regulator imbalance', 'active controller imbalance',
    'active effector imbalance', 'active target imbalance', 'active receptor imbalance',
    'active ligand imbalance', 'active binding imbalance', 'active affinity imbalance',
    'active specificity imbalance', 'active selectivity imbalance', 'active sensitivity imbalance',
    'active responsiveness imbalance', 'active reactivity imbalance', 'active susceptibility imbalance',
    'active vulnerability imbalance', 'active resistance imbalance', 'active tolerance imbalance',
    'active adaptation imbalance', 'active acclimation imbalance', 'active habituation imbalance',
    'active sensitization imbalance', 'active desensitization imbalance', 'active conditioning imbalance',
    'active learning imbalance', 'active memory imbalance', 'active cognition imbalance',
    'active perception imbalance', 'active attention imbalance', 'active concentration imbalance',
    'active focus imbalance', 'active awareness imbalance', 'active consciousness imbalance',
    'active alertness imbalance', 'active vigilance imbalance', 'active arousal imbalance',
    'active activation imbalance', 'active excitation imbalance', 'active inhibition imbalance',
    'active suppression imbalance', 'active repression imbalance', 'active suppression imbalance',
    'active repression imbalance', 'active suppression imbalance', 'active repression imbalance'
  ],
  
  // Relative contraindications (precautions)
  relative: [
    'diabetes', 'hypertension', 'heart disease', 'kidney disease', 'liver disease',
    'lung disease', 'asthma', 'copd', 'emphysema', 'bronchitis', 'pneumonia',
    'tuberculosis', 'covid-19', 'flu', 'cold', 'fever', 'infection', 'inflammation',
    'allergy', 'anaphylaxis', 'shock', 'trauma', 'injury', 'surgery', 'wound',
    'scar', 'keloid', 'hypertrophic scar', 'stretch marks', 'cellulite',
    'varicose veins', 'spider veins', 'bruising', 'bleeding', 'hematoma',
    'contusion', 'sprain', 'strain', 'fracture', 'dislocation', 'arthritis',
    'rheumatism', 'gout', 'osteoporosis', 'osteomalacia', 'rickets', 'scurvy',
    'beriberi', 'pellagra', 'kwashiorkor', 'marasmus', 'anorexia', 'bulimia',
    'obesity', 'cachexia', 'wasting', 'dehydration', 'malnutrition',
    'vitamin deficiency', 'mineral deficiency', 'protein deficiency',
    'carbohydrate deficiency', 'fat deficiency', 'fiber deficiency',
    'water deficiency', 'electrolyte imbalance', 'acid-base imbalance',
    'ph imbalance', 'osmolarity imbalance', 'tonicity imbalance',
    'volume imbalance', 'pressure imbalance', 'temperature imbalance',
    'metabolic imbalance', 'endocrine imbalance', 'hormonal imbalance',
    'neurotransmitter imbalance', 'enzyme imbalance', 'cofactor imbalance',
    'substrate imbalance', 'product imbalance', 'inhibitor imbalance',
    'activator imbalance', 'modulator imbalance', 'regulator imbalance',
    'controller imbalance', 'effector imbalance', 'target imbalance',
    'receptor imbalance', 'ligand imbalance', 'binding imbalance',
    'affinity imbalance', 'specificity imbalance', 'selectivity imbalance',
    'sensitivity imbalance', 'responsiveness imbalance', 'reactivity imbalance',
    'susceptibility imbalance', 'vulnerability imbalance', 'resistance imbalance',
    'tolerance imbalance', 'adaptation imbalance', 'acclimation imbalance',
    'habituation imbalance', 'sensitization imbalance', 'desensitization imbalance',
    'conditioning imbalance', 'learning imbalance', 'memory imbalance',
    'cognition imbalance', 'perception imbalance', 'attention imbalance',
    'concentration imbalance', 'focus imbalance', 'awareness imbalance',
    'consciousness imbalance', 'alertness imbalance', 'vigilance imbalance',
    'arousal imbalance', 'activation imbalance', 'excitation imbalance',
    'inhibition imbalance', 'suppression imbalance', 'repression imbalance'
  ],
  
  // Medications that are contraindicated
  medications: [
    'accutane', 'isotretinoin', 'retin-a', 'tretinoin', 'retinol', 'retinoids',
    'blood thinners', 'warfarin', 'heparin', 'aspirin', 'ibuprofen', 'naproxen',
    'steroids', 'prednisone', 'cortisone', 'hydrocortisone', 'dexamethasone',
    'immunosuppressants', 'cyclosporine', 'tacrolimus', 'mycophenolate',
    'chemotherapy', 'radiation therapy', 'cancer drugs', 'anti-cancer drugs',
    'antibiotics', 'antifungals', 'antivirals', 'antiparasitics', 'antimalarials',
    'antituberculars', 'antileprotics', 'antisyphilitics', 'antigonorrheals',
    'antichlamydials', 'antihepatitis', 'antihiv', 'antiaids', 'anticancer',
    'antitumor', 'antimetastatic', 'antiproliferative', 'antiapoptotic',
    'antioxidant', 'antinflammatory', 'antipyretic', 'analgesic', 'anesthetic',
    'sedative', 'hypnotic', 'tranquilizer', 'antidepressant', 'antianxiety',
    'antipsychotic', 'antimanic', 'anticonvulsant', 'antiepileptic',
    'antiparkinsonian', 'antialzheimer', 'antidementia', 'antischizophrenic',
    'antibipolar', 'antidepressant', 'antianxiety', 'antiptsd', 'antiocd',
    'antiadhd', 'antiautism', 'antidown', 'anticerebral', 'antimuscular',
    'antimultiple', 'antiepileptic', 'antiseizure', 'antistroke', 'antiheart',
    'antihypertensive', 'antihypotensive', 'antidiabetic', 'antikidney',
    'antiliver', 'antilung', 'antiasthma', 'anticopd', 'antiemphysema',
    'antibronchitis', 'antipneumonia', 'antituberculosis', 'anticovid',
    'antiflu', 'anticold', 'antifever', 'antiinfection', 'antiinflammation',
    'antiallergy', 'antianaphylaxis', 'antishock', 'antitrauma', 'antiinjury',
    'antisurgery', 'antiwound', 'antiscar', 'antikeloid', 'antihypertrophic',
    'antistretch', 'anticellulite', 'antivaricose', 'antispider', 'antibruising',
    'antibleeding', 'antihematoma', 'anticontusion', 'antisprain', 'antistrain',
    'antifracture', 'antidislocation', 'antiarthritis', 'antirheumatism',
    'antigout', 'antiosteoporosis', 'antiosteomalacia', 'antirickets',
    'antiscurvy', 'antiberiberi', 'antipellagra', 'antikwashiorkor',
    'antimarasmus', 'antianorexia', 'antibulimia', 'antiobesity', 'anticachexia',
    'antiwasting', 'antidehydration', 'antimalnutrition', 'antivitamin',
    'antimineral', 'antiprotein', 'anticarbohydrate', 'antifat', 'antifiber',
    'antiwater', 'antielectrolyte', 'antiacid', 'antiph', 'antiosmolarity',
    'antitonicity', 'antivolume', 'antipressure', 'antitemperature',
    'antimetabolic', 'antiendocrine', 'antihormonal', 'antineurotransmitter',
    'antienzyme', 'anticofactor', 'antisubstrate', 'antiproduct',
    'antiinhibitor', 'antiactivator', 'antimodulator', 'antiregulator',
    'anticontroller', 'antieffector', 'antitarget', 'antireceptor',
    'antiligand', 'antibinding', 'antiaffinity', 'antispecificity',
    'antiselectivity', 'antisensitivity', 'antiresponsiveness',
    'antireactivity', 'antisusceptibility', 'antivulnerability',
    'antiresistance', 'antitolerance', 'antiadaptation', 'antiacclimation',
    'antihabituation', 'antisensitization', 'antidesensitization',
    'anticonditioning', 'antilearning', 'antimemory', 'anticognition',
    'antiperception', 'antiattention', 'anticoncentration', 'antifocus',
    'antiawareness', 'anticonsciousness', 'antialertness', 'antivigilance',
    'antiarousal', 'antiactivation', 'antiexcitation', 'antiinhibition',
    'antisuppression', 'antirepression'
  ]
}

function analyzeContraindications(
  medicalConditions: string,
  medications: string,
  prescriptions: string
): ContraindicationResult {
  const allText = `${medicalConditions} ${medications} ${prescriptions}`.toLowerCase()
  
  // Check for absolute contraindications
  const absoluteMatches = CONTRAINDICATION_DATA.absolute.filter(condition => 
    allText.includes(condition.toLowerCase())
  )
  
  // Check for relative contraindications
  const relativeMatches = CONTRAINDICATION_DATA.relative.filter(condition => 
    allText.includes(condition.toLowerCase())
  )
  
  // Check for contraindicated medications
  const medicationMatches = CONTRAINDICATION_DATA.medications.filter(med => 
    allText.includes(med.toLowerCase())
  )
  
  let status: 'safe' | 'precaution' | 'contraindicated' = 'safe'
  let confidence = 85
  let reasoning = ''
  let recommendations: string[] = []
  let riskFactors: string[] = []
  
  if (absoluteMatches.length > 0) {
    status = 'contraindicated'
    confidence = 95
    reasoning = `Based on the medical information provided, I've identified ${absoluteMatches.length} absolute contraindication(s) that make PMU procedures not recommended at this time. These conditions pose significant risks for complications, poor healing, or adverse reactions.`
    riskFactors = absoluteMatches
    recommendations = [
      'Consult with the client\'s primary care physician before considering any PMU procedures',
      'Consider alternative cosmetic treatments that are safer for their condition',
      'Wait until the condition is fully resolved and stable before proceeding',
      'Document all contraindications in the client\'s medical history'
    ]
  } else if (relativeMatches.length > 0 || medicationMatches.length > 0) {
    status = 'precaution'
    confidence = 80
    reasoning = `I've identified ${relativeMatches.length + medicationMatches.length} condition(s) or medication(s) that require special consideration. While not absolute contraindications, these factors increase the risk of complications and require careful evaluation.`
    riskFactors = [...relativeMatches, ...medicationMatches]
    recommendations = [
      'Obtain written clearance from the client\'s healthcare provider',
      'Consider a patch test before full treatment',
      'Use extra caution with technique and aftercare',
      'Monitor closely for any adverse reactions',
      'Have emergency protocols in place',
      'Consider shorter treatment sessions'
    ]
  } else {
    status = 'safe'
    confidence = 90
    reasoning = 'Based on the medical information provided, I don\'t see any significant contraindications for PMU procedures. The client appears to be a good candidate for treatment.'
    recommendations = [
      'Proceed with standard PMU protocols',
      'Ensure proper aftercare instructions are provided',
      'Schedule appropriate follow-up appointments',
      'Maintain standard safety protocols'
    ]
  }
  
  return {
    status,
    confidence,
    reasoning,
    recommendations,
    riskFactors
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ContraindicationRequest = await request.json()
    
    if (!body.clientName || (!body.medicalConditions && !body.medications && !body.prescriptions)) {
      return NextResponse.json(
        { error: 'Client name and at least one medical field are required' },
        { status: 400 }
      )
    }
    
    const result = analyzeContraindications(
      body.medicalConditions,
      body.medications,
      body.prescriptions
    )
    
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Contraindication analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze contraindications' },
      { status: 500 }
    )
  }
}
