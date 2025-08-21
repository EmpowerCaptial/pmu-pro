// PDF Generator for PMU Pro Resources
// Creates downloadable and printable PDF documents

export interface PDFResource {
  id: string
  title: string
  category: string
  content: string[]
  sections: PDFSection[]
}

export interface PDFSection {
  title: string
  content: string[]
  subsections?: PDFSubsection[]
}

export interface PDFSubsection {
  title: string
  content: string | string[]
}

// PMU Aftercare Instructions PDF
export const AFTERCARE_PDF: PDFResource = {
  id: 'aftercare',
  title: 'PMU Aftercare Instructions',
  category: 'Aftercare',
  content: [
    'Complete guide for post-procedure care including cleaning, moisturizing, and sun protection protocols',
    'Follow these instructions carefully to ensure optimal healing and long-lasting results.'
  ],
  sections: [
    {
      title: 'Immediate Aftercare (First 24 Hours)',
      content: [
        'Keep the treated area clean and dry',
        'Avoid touching, scratching, or picking at the area',
        'Do not apply any makeup, creams, or lotions',
        'Sleep on your back to avoid rubbing the area',
        'Avoid direct sunlight and tanning beds'
      ]
    },
    {
      title: 'Cleaning Protocol (Days 2-7)',
      content: [
        'Gently clean the area 2-3 times daily with lukewarm water',
        'Use a mild, fragrance-free cleanser if recommended by your artist',
        'Pat dry with a clean, soft towel - do not rub',
        'Allow the area to air dry completely before applying any products'
      ]
    },
    {
      title: 'Moisturizing (Days 2-14)',
      content: [
        'Apply a thin layer of recommended ointment 2-3 times daily',
        'Use only products recommended by your PMU artist',
        'Avoid petroleum-based products unless specifically recommended',
        'Do not over-apply - a thin layer is sufficient'
      ]
    },
    {
      title: 'Sun Protection',
      content: [
        'Avoid direct sun exposure for at least 2 weeks',
        'Wear a wide-brimmed hat when outdoors',
        'Apply SPF 30+ sunscreen to the treated area after healing',
        'Reapply sunscreen every 2 hours when outdoors'
      ]
    },
    {
      title: 'Activities to Avoid (First 2 Weeks)',
      content: [
        'Swimming in pools, lakes, or oceans',
        'Saunas, steam rooms, and hot tubs',
        'Intense exercise that causes excessive sweating',
        'Facial treatments and chemical peels',
        'Exfoliating products and scrubs'
      ]
    },
    {
      title: 'Healing Timeline',
      content: [
        'Days 1-3: Initial healing, some swelling and redness',
        'Days 4-7: Scabbing and flaking may occur',
        'Days 8-14: Color may appear lighter as skin heals',
        'Weeks 3-4: True color begins to emerge',
        'Month 2-3: Final color and healing complete'
      ]
    },
    {
      title: 'When to Contact Your Artist',
      content: [
        'Excessive swelling or redness',
        'Signs of infection (pus, fever, severe pain)',
        'Allergic reactions or severe itching',
        'Color loss beyond normal healing expectations',
        'Any concerns about the healing process'
      ]
    }
  ]
}

// Fitzpatrick Skin Type Guide PDF
export const FITZPATRICK_PDF: PDFResource = {
  id: 'fitzpatrick',
  title: 'Fitzpatrick Skin Type Guide',
  category: 'Analysis',
  content: [
    'Professional reference for skin typing and pigment selection',
    'Understanding your client\'s skin type is crucial for optimal PMU results.'
  ],
  sections: [
    {
      title: 'Type I - Very Fair',
      content: [
        'Always burns, never tans',
        'Extremely fair skin, freckles',
        'Red or blonde hair, blue eyes',
        'Pigment recommendations: Light ash tones, taupe',
        'Healing time: 7-10 days',
        'Color retention: May require touch-ups'
      ]
    },
    {
      title: 'Type II - Fair',
      content: [
        'Usually burns, tans minimally',
        'Fair skin, some freckles',
        'Blonde or light brown hair, blue/green eyes',
        'Pigment recommendations: Light to medium ash browns',
        'Healing time: 8-12 days',
        'Color retention: Good with proper care'
      ]
    },
    {
      title: 'Type III - Medium',
      content: [
        'Sometimes burns, tans gradually',
        'Medium skin tone, few freckles',
        'Brown hair, brown eyes',
        'Pigment recommendations: Medium browns, warm tones',
        'Healing time: 10-14 days',
        'Color retention: Excellent'
      ]
    },
    {
      title: 'Type IV - Medium Dark',
      content: [
        'Rarely burns, tans easily',
        'Medium-dark skin, olive undertones',
        'Dark brown hair, brown eyes',
        'Pigment recommendations: Rich browns, warm tones',
        'Healing time: 12-16 days',
        'Color retention: Very good'
      ]
    },
    {
      title: 'Type V - Dark',
      content: [
        'Very rarely burns, tans very easily',
        'Dark skin, warm undertones',
        'Dark brown or black hair, dark eyes',
        'Pigment recommendations: Deep browns, rich tones',
        'Healing time: 14-18 days',
        'Color retention: Excellent'
      ]
    },
    {
      title: 'Type VI - Very Dark',
      content: [
        'Never burns, deeply pigmented',
        'Very dark skin, cool undertones',
        'Black hair, dark eyes',
        'Pigment recommendations: Deep rich browns, espresso tones',
        'Healing time: 16-20 days',
        'Color retention: Outstanding'
      ]
    }
  ]
}

// Pigment Color Theory PDF
export const COLOR_THEORY_PDF: PDFResource = {
  id: 'color-theory',
  title: 'Pigment Color Theory',
  category: 'Education',
  content: [
    'Understanding undertones and color matching for optimal results',
    'Master the art of color selection for beautiful, natural-looking PMU.'
  ],
  sections: [
    {
      title: 'Understanding Undertones',
      content: [
        'Cool undertones: Blue, purple, or pink base',
        'Warm undertones: Yellow, golden, or peachy base',
        'Neutral undertones: Balance of warm and cool',
        'Identifying undertones is crucial for pigment selection'
      ]
    },
    {
      title: 'Color Theory Basics',
      content: [
        'Primary colors: Red, blue, yellow',
        'Secondary colors: Green, orange, purple',
        'Tertiary colors: Combinations of primary and secondary',
        'Complementary colors: Opposite on color wheel'
      ]
    },
    {
      title: 'Pigment Selection Guidelines',
      content: [
        'Fair skin: Choose pigments 1-2 shades darker than natural',
        'Medium skin: Choose pigments 2-3 shades darker than natural',
        'Dark skin: Choose pigments 3-4 shades darker than natural',
        'Always consider undertones when selecting pigments'
      ]
    },
    {
      title: 'Common Color Mistakes',
      content: [
        'Choosing too light - will fade quickly',
        'Ignoring undertones - can result in unnatural color',
        'Not considering healing process - colors lighten during healing',
        'Using warm pigments on cool undertones'
      ]
    },
    {
      title: 'Color Correction Principles',
      content: [
        'Understand the color wheel for corrections',
        'Use complementary colors to neutralize unwanted tones',
        'Consider multiple sessions for major corrections',
        'Always test colors on a small area first'
      ]
    }
  ]
}

// Contraindication Checklist PDF
export const CONTRAINDICATIONS_PDF: PDFResource = {
  id: 'contraindications',
  title: 'Contraindication Checklist',
  category: 'Safety',
  content: [
    'Safety screening reference for client consultations',
    'This checklist helps identify clients who may not be suitable candidates for PMU procedures.'
  ],
  sections: [
    {
      title: 'Absolute Contraindications',
      content: [
        'Pregnancy or breastfeeding',
        'Active skin infections or conditions',
        'Uncontrolled diabetes',
        'Blood clotting disorders',
        'Autoimmune diseases (lupus, scleroderma)',
        'Recent chemotherapy or radiation therapy',
        'Organ transplant recipients'
      ]
    },
    {
      title: 'Relative Contraindications',
      content: [
        'History of keloid scarring',
        'Psoriasis or eczema in treatment area',
        'Recent sunburn or tanning',
        'Blood thinners (consult physician)',
        'Recent facial procedures (wait 6-8 weeks)',
        'Allergies to pigments or numbing agents'
      ]
    },
    {
      title: 'Pre-Procedure Assessment',
      content: [
        'Complete medical history review',
        'Current medications and supplements',
        'Previous PMU or tattoo procedures',
        'Skin condition and sensitivity',
        'Lifestyle factors (sun exposure, activities)',
        'Expectations and goals discussion'
      ]
    },
    {
      title: 'Client Education Requirements',
      content: [
        'Procedure explanation and risks',
        'Aftercare instructions and timeline',
        'Expected healing process',
        'Touch-up requirements',
        'Long-term maintenance',
        'Emergency contact information'
      ]
    },
    {
      title: 'Documentation Requirements',
      content: [
        'Signed consent forms',
        'Medical history documentation',
        'Before photos',
        'Treatment plan and pigment selection',
        'Aftercare instructions provided',
        'Follow-up appointment scheduled'
      ]
    }
  ]
}

// Client Consultation Form PDF
export const CONSULTATION_FORM_PDF: PDFResource = {
  id: 'consultation-form',
  title: 'Client Consultation Form',
  category: 'Forms',
  content: [
    'Professional consultation template for new clients',
    'Comprehensive form to gather all necessary information for PMU procedures.'
  ],
  sections: [
    {
      title: 'Personal Information',
      content: [
        'Full Name: _________________________',
        'Date of Birth: _____________________',
        'Phone: ____________________________',
        'Email: ____________________________',
        'Emergency Contact: _________________',
        'Emergency Phone: __________________'
      ]
    },
    {
      title: 'Medical History',
      content: [
        'Do you have any medical conditions? Yes/No',
        'Are you currently taking any medications? Yes/No',
        'Do you have any allergies? Yes/No',
        'Have you had any previous PMU procedures? Yes/No',
        'Do you have any skin conditions? Yes/No',
        'Are you pregnant or breastfeeding? Yes/No'
      ]
    },
    {
      title: 'Procedure Information',
      content: [
        'Desired procedure: _________________',
        'Preferred style: ___________________',
        'Color preferences: _________________',
        'Previous experience: ________________',
        'Expectations: _____________________',
        'Timeline: _________________________'
      ]
    },
    {
      title: 'Lifestyle Assessment',
      content: [
        'Sun exposure habits: _______________',
        'Exercise routine: __________________',
        'Swimming frequency: _______________',
        'Makeup usage: ____________________',
        'Skin care routine: _________________',
        'Occupation: ______________________'
      ]
    },
    {
      title: 'Consultation Notes',
      content: [
        'Skin type assessment: _______________',
        'Undertone analysis: ________________',
        'Pigment recommendations: ___________',
        'Treatment plan: ___________________',
        'Pricing discussed: _________________',
        'Next steps: _______________________'
      ]
    }
  ]
}

// Consent and Waiver Template PDF
export const CONSENT_WAIVER_PDF: PDFResource = {
  id: 'consent-waiver',
  title: 'Consent and Waiver Template',
  category: 'Forms',
  content: [
    'Legal consent forms for PMU procedures',
    'Professional templates to protect both client and artist.'
  ],
  sections: [
    {
      title: 'Procedure Consent',
      content: [
        'I understand that PMU is a semi-permanent cosmetic procedure',
        'I acknowledge that results may vary and are not guaranteed',
        'I understand that multiple sessions may be required',
        'I agree to follow all aftercare instructions provided',
        'I understand that touch-ups may be necessary',
        'I acknowledge that the procedure involves some discomfort'
      ]
    },
    {
      title: 'Medical Disclosure',
      content: [
        'I have disclosed all relevant medical information',
        'I am not pregnant or breastfeeding',
        'I do not have any contraindications',
        'I have consulted my physician if necessary',
        'I understand the risks involved',
        'I am proceeding at my own risk'
      ]
    },
    {
      title: 'Artist Responsibilities',
      content: [
        'Maintain professional standards and hygiene',
        'Use sterile equipment and materials',
        'Provide detailed aftercare instructions',
        'Schedule appropriate follow-up appointments',
        'Maintain client confidentiality',
        'Provide emergency contact information'
      ]
    },
    {
      title: 'Client Responsibilities',
      content: [
        'Follow all aftercare instructions',
        'Attend scheduled follow-up appointments',
        'Report any complications immediately',
        'Avoid activities that may interfere with healing',
        'Protect treated area from sun exposure',
        'Maintain good overall health'
      ]
    },
    {
      title: 'Liability Release',
      content: [
        'I release the artist from liability for normal healing variations',
        'I understand that individual results may vary',
        'I acknowledge that touch-ups are not included in initial price',
        'I agree to pay for any additional services required',
        'I understand the cancellation policy',
        'I have read and understood all terms and conditions'
      ]
    }
  ]
}

// Generate PDF content for download
export function generatePDFContent(resource: PDFResource): string {
  let content = `${resource.title}\n`
  content += `${'='.repeat(resource.title.length)}\n\n`
  
  // Add main content
  resource.content.forEach(line => {
    content += `${line}\n\n`
  })
  
  // Add sections
  resource.sections.forEach(section => {
    content += `${section.title}\n`
    content += `${'-'.repeat(section.title.length)}\n\n`
    
    section.content.forEach(line => {
      content += `• ${line}\n`
    })
    
    if (section.subsections) {
      section.subsections.forEach(subsection => {
        content += `\n  ${subsection.title}\n`
        if (Array.isArray(subsection.content)) {
          subsection.content.forEach(line => {
            content += `    - ${line}\n`
          })
        } else {
          content += `    - ${subsection.content}\n`
        }
      })
    }
    
    content += '\n'
  })
  
  // Add footer
  content += `\n${'='.repeat(50)}\n`
  content += `Generated by PMU Pro\n`
  content += `For questions or support: admin@thepmuguide.com\n`
  content += `Date: ${new Date().toLocaleDateString()}\n`
  
  return content
}

// Get all available PDF resources
export const getAllPDFResources = (): PDFResource[] => [
  {
      id: '1',
      title: 'Missouri Tattoo Artist License Application',
      category: 'licensing',
      content: [
        'Official application form for tattoo artist licensing in Missouri',
        'Complete personal and professional information required'
      ],
      sections: [
      {
        title: 'Personal Information',
        content: [
          'Complete personal information section with government-issued identification',
          'Provide accurate contact information for licensing purposes'
        ],
        subsections: [
          { title: 'Full Legal Name', content: ['Enter your complete legal name as it appears on government ID'] },
          { title: 'Date of Birth', content: ['Provide your date of birth in MM/DD/YYYY format'] },
          { title: 'Social Security Number', content: ['Required for background check purposes'] },
          { title: 'Current Address', content: ['Include street address, city, state, and ZIP code'] }
        ]
      },
      {
        title: 'Professional Qualifications',
        content: [
          'Document your professional training and experience',
          'Provide proof of required certifications and licenses'
        ],
        subsections: [
          { title: 'Training Experience', content: 'Detail your tattoo training and apprenticeship experience' },
          { title: 'Previous Licenses', content: 'List any previous tattoo licenses held in other states' },
          { title: 'Bloodborne Pathogen Training', content: 'Proof of current BBP certification required' },
          { title: 'First Aid/CPR Certification', content: 'Current certification must be valid' }
        ]
      },
      {
        title: 'Required Documentation',
        content: [
          'Submit all required supporting documents',
          'Ensure documents are current and properly notarized'
        ],
        subsections: [
          { title: 'Government Photo ID', content: 'Valid driver\'s license, passport, or state ID' },
          { title: 'Passport Photos', content: 'Two recent 2x2 inch passport-style photographs' },
          { title: 'Background Check', content: 'FBI background check results (fingerprint card)' },
          { title: 'Application Fee', content: 'Non-refundable fee of $150.00' }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Missouri Tattoo Establishment License Application',
    category: 'establishment',
    content: [
      'Application for tattoo establishment licensing and inspection',
      'Complete business registration and licensing information required'
    ],
    sections: [
      {
        title: 'Business Information',
        content: [
          'Provide complete business registration and licensing information',
          'Include all required business documentation'
        ],
        subsections: [
          { title: 'Business Name', content: 'Legal business name as registered with Secretary of State' },
          { title: 'Business Address', content: 'Physical location where tattooing will occur' },
          { title: 'Business Type', content: 'Corporation, LLC, Partnership, or Sole Proprietorship' },
          { title: 'Tax ID Number', content: 'Federal Employer Identification Number (FEIN)' }
        ]
      },
      {
        title: 'Facility Requirements',
        content: [
          'Document facility compliance with health and safety standards',
          'Provide detailed facility specifications and equipment'
        ],
        subsections: [
          { title: 'Floor Plan', content: 'Detailed floor plan showing all rooms and equipment placement' },
          { title: 'Equipment List', content: 'Complete inventory of all tattooing equipment and supplies' },
          { title: 'Sterilization Equipment', content: 'Autoclave certification and maintenance records' },
          { title: 'Waste Disposal', content: 'Sharps container and biohazard waste disposal plan' }
        ]
      },
      {
        title: 'Staff Requirements',
        content: [
          'Ensure all staff meet licensing and training requirements',
          'Maintain current staff qualifications and certifications'
        ],
        subsections: [
          { title: 'Licensed Artists', content: 'List of all tattoo artists with valid Missouri licenses' },
          { title: 'Manager Designation', content: 'Designated responsible person for daily operations' },
          { title: 'Training Records', content: 'Staff training and certification documentation' },
          { title: 'Emergency Procedures', content: 'Written emergency response and first aid procedures' }
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'Missouri Tattoo Regulations and Standards',
    category: 'regulations',
    content: [
      'Complete regulations governing tattoo practices in Missouri',
      'Health and safety standards for tattoo establishments'
    ],
    sections: [
      {
        title: 'Health and Safety Standards',
        content: [
          'Maintain highest standards of health and safety',
          'Follow all sterilization and disinfection protocols'
        ],
        subsections: [
          { title: 'Sterilization Requirements', content: 'All equipment must be sterilized using approved methods' },
          { title: 'Personal Protective Equipment', content: 'Gloves, masks, and protective clothing required' },
          { title: 'Disinfection Procedures', content: 'Surface disinfection between clients required' },
          { title: 'Bloodborne Pathogen Prevention', content: 'Universal precautions and exposure control plan' }
        ]
      },
      {
        title: 'Client Requirements',
        content: [
          'Ensure all clients meet age and health requirements',
          'Maintain proper documentation and consent procedures'
        ],
        subsections: [
          { title: 'Age Verification', content: 'Valid government ID required for all clients' },
          { title: 'Consent Forms', content: 'Written informed consent required before procedure' },
          { title: 'Medical History', content: 'Health questionnaire and medical clearance if needed' },
          { title: 'Aftercare Instructions', content: 'Written aftercare instructions must be provided' }
        ]
      },
      {
        title: 'Record Keeping',
        content: [
          'Maintain comprehensive records as required by law',
          'Document all procedures and compliance activities'
        ],
        subsections: [
          { title: 'Client Records', content: 'Maintain records for minimum of 2 years' },
          { title: 'Equipment Logs', content: 'Sterilization and maintenance logs required' },
          { title: 'Incident Reports', content: 'Document any adverse reactions or complications' },
          { title: 'Inspection Records', content: 'Keep all inspection and compliance documentation' }
        ]
      }
    ]
  },
  {
    id: '4',
    title: 'Missouri Tattoo Artist Renewal Application',
    category: 'renewal',
    content: [
      'License renewal application for existing tattoo artists',
      'Annual renewal process and requirements'
    ],
    sections: [
      {
        title: 'Renewal Requirements',
        content: [
          'Meet all continuing education and certification requirements',
          'Ensure current license is in good standing'
        ],
        subsections: [
          { title: 'Current License', content: 'Must have active license in good standing' },
          { title: 'Continuing Education', content: 'Minimum 8 hours of approved continuing education' },
          { title: 'Bloodborne Pathogen Training', content: 'Current BBP certification required' },
          { title: 'First Aid/CPR', content: 'Valid certification must be current' }
        ]
      },
      {
        title: 'Renewal Process',
        content: [
          'Submit renewal application within required timeframe',
          'Include all required documentation and fees'
        ],
        subsections: [
          { title: 'Application Submission', content: 'Submit renewal application 60 days before expiration' },
          { title: 'Fee Payment', content: 'Renewal fee of $100.00 required' },
          { title: 'Documentation', content: 'Proof of continuing education and certifications' },
          { title: 'Background Check', content: 'Updated background check may be required' }
        ]
      },
      {
        title: 'Late Renewal',
        content: [
          'Understand late renewal penalties and requirements',
          'Avoid practice interruption due to expired license'
        ],
        subsections: [
          { title: 'Grace Period', content: '30-day grace period after expiration' },
          { title: 'Late Fees', content: 'Additional $50.00 late fee applies' },
          { title: 'Reinstatement', content: 'After grace period, new application required' },
          { title: 'Continuing Practice', content: 'Cannot practice with expired license' }
        ]
      }
    ]
  },
  {
    id: '5',
    title: 'Missouri Tattoo Establishment Inspection Checklist',
    category: 'inspection',
    content: [
      'Comprehensive inspection checklist for tattoo establishments',
      'Health and safety compliance verification'
    ],
    sections: [
      {
        title: 'Facility Standards',
        content: [
          'Ensure facility meets all health and safety requirements',
          'Maintain clean and sanitary environment'
        ],
        subsections: [
          { title: 'Cleanliness', content: 'All surfaces clean and free of debris' },
          { title: 'Ventilation', content: 'Adequate air circulation and temperature control' },
          { title: 'Lighting', content: 'Sufficient lighting for safe tattooing procedures' },
          { title: 'Restroom Facilities', content: 'Clean, accessible restrooms for clients' }
        ]
      },
      {
        title: 'Equipment and Supplies',
        content: [
          'Verify all equipment is properly maintained and certified',
          'Ensure adequate supplies for safe procedures'
        ],
        subsections: [
          { title: 'Sterilization Equipment', content: 'Autoclave in good working condition' },
          { title: 'Single-Use Items', content: 'Disposable needles, tubes, and barriers' },
          { title: 'Ink and Pigments', content: 'FDA-approved inks and pigments only' },
          { title: 'Emergency Equipment', content: 'First aid kit and emergency contact information' }
        ]
      },
      {
        title: 'Documentation',
        content: [
          'Maintain current and complete documentation',
          'Ensure compliance with record-keeping requirements'
        ],
        subsections: [
          { title: 'License Display', content: 'Current licenses prominently displayed' },
          { title: 'Client Records', content: 'Complete and current client records' },
          { title: 'Equipment Logs', content: 'Sterilization and maintenance logs current' },
          { title: 'Staff Certifications', content: 'All staff certifications current and valid' }
        ]
      }
    ]
  },
  {
    id: '6',
    title: 'Missouri Tattoo Client Consent Form',
    category: 'consent',
    content: [
      'Standard informed consent form for tattoo procedures',
      'Client consent and medical history documentation'
    ],
    sections: [
      {
        title: 'Client Information',
        content: [
          'Collect complete client information for safety',
          'Verify client eligibility and medical history'
        ],
        subsections: [
          { title: 'Personal Details', content: 'Full name, date of birth, and contact information' },
          { title: 'Emergency Contact', content: 'Name and phone number of emergency contact' },
          { title: 'Medical History', content: 'Current medications and medical conditions' },
          { title: 'Previous Tattoos', content: 'History of previous tattoo procedures' }
        ]
      },
      {
        title: 'Procedure Information',
        content: [
          'Provide comprehensive procedure information',
          'Ensure client understands risks and requirements'
        ],
        subsections: [
          { title: 'Tattoo Description', content: 'Detailed description of tattoo design and placement' },
          { title: 'Risks and Complications', content: 'Explanation of potential risks and side effects' },
          { title: 'Aftercare Requirements', content: 'Detailed aftercare instructions and timeline' },
          { title: 'Follow-up Care', content: 'Schedule for follow-up appointments and touch-ups' }
        ]
      },
      {
        title: 'Consent and Acknowledgment',
        content: [
          'Obtain informed consent from client',
          'Document understanding and agreement'
        ],
        subsections: [
          { title: 'Understanding', content: 'Client acknowledges understanding of procedure and risks' },
          { title: 'Questions', content: 'Opportunity to ask questions before procedure' },
          { title: 'Voluntary Consent', content: 'Client consents voluntarily without coercion' },
          { title: 'Signature', content: 'Client and artist signatures with date and time' }
        ]
      }
    ]
  }
]

// Get PDF resource by ID
export function getPDFResourceById(id: string): PDFResource | null {
  const resources = getAllPDFResources()
  return resources.find(resource => resource.id === id) || null
}
