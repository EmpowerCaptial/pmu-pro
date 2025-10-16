// Preloaded Consent Form Templates
// Business-name-free templates that can be customized per artist

import { FormTemplate, ConsentFormType } from "@/types/consent-forms"

export const CONSENT_FORM_TEMPLATES: Record<ConsentFormType, FormTemplate> = {
  "general-consent": {
    id: "general-consent",
    name: "General Consent",
    description: "General PMU procedure consent and acknowledgment",
    required: true,
    fields: [
      {
        id: "clientName",
        label: "Full Legal Name",
        type: "text",
        required: true,
        order: 1,
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      {
        id: "dateOfBirth",
        label: "Date of Birth",
        type: "date",
        required: true,
        order: 2
      },
      {
        id: "emergencyContact",
        label: "Emergency Contact Name",
        type: "text",
        required: true,
        order: 3,
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      {
        id: "emergencyPhone",
        label: "Emergency Contact Phone",
        type: "phone",
        required: true,
        order: 4
      },
      {
        id: "procedureConsent",
        label: "I consent to the PMU procedure and understand the risks involved",
        type: "checkbox",
        required: true,
        order: 5,
        helpText: "You must check this box to proceed"
      },
      {
        id: "aftercareConsent",
        label: "I agree to follow all aftercare instructions provided",
        type: "checkbox",
        required: true,
        order: 6,
        helpText: "Following aftercare is crucial for optimal results"
      },
      {
        id: "clientSignature",
        label: "Digital Signature",
        type: "signature",
        required: true,
        order: 7,
        helpText: "Please sign below to confirm your consent"
      }
    ]
  },

  "medical-history": {
    id: "medical-history",
    name: "Medical History & Health Screening",
    description: "Comprehensive medical history and contraindication screening",
    required: true,
    fields: [
      {
        id: "clientName",
        label: "Full Legal Name",
        type: "text",
        required: true,
        order: 1
      },
      {
        id: "dateOfBirth",
        label: "Date of Birth",
        type: "date",
        required: true,
        order: 2
      },
      {
        id: "allergies",
        label: "Do you have any allergies?",
        type: "radio",
        required: true,
        options: ["Yes", "No"],
        order: 3
      },
      {
        id: "allergyDetails",
        label: "If yes, please specify allergies:",
        type: "textarea",
        required: false,
        order: 4,
        helpText: "Include food, medication, and environmental allergies"
      },
      {
        id: "medications",
        label: "Are you currently taking any medications?",
        type: "radio",
        required: true,
        options: ["Yes", "No"],
        order: 5
      },
      {
        id: "medicationDetails",
        label: "If yes, please list current medications:",
        type: "textarea",
        required: false,
        order: 6
      },
      {
        id: "medicalConditions",
        label: "Do you have any medical conditions?",
        type: "radio",
        required: true,
        options: ["Yes", "No"],
        order: 7
      },
      {
        id: "conditionDetails",
        label: "If yes, please specify conditions:",
        type: "textarea",
        required: false,
        order: 8
      },
      {
        id: "pregnancy",
        label: "Are you currently pregnant or nursing?",
        type: "radio",
        required: true,
        options: ["Yes", "No", "Not Applicable"],
        order: 9
      },
      {
        id: "skinConditions",
        label: "Do you have any skin conditions?",
        type: "radio",
        required: true,
        options: ["Yes", "No"],
        order: 10
      },
      {
        id: "skinConditionDetails",
        label: "If yes, please specify:",
        type: "textarea",
        required: false,
        order: 11
      },
      {
        id: "medicalAccuracy",
        label: "I confirm that all medical information provided is accurate and complete",
        type: "checkbox",
        required: true,
        order: 12
      },
      {
        id: "clientSignature",
        label: "Digital Signature",
        type: "signature",
        required: true,
        order: 13
      }
    ]
  },

  "brows": {
    id: "brows",
    name: "Brows Consent",
    description: "Eyebrow PMU specific consent and expectations",
    required: true,
    fields: [
      {
        id: "clientName",
        label: "Full Legal Name",
        type: "text",
        required: true,
        order: 1
      },
      {
        id: "browExpectations",
        label: "I understand that PMU brows require multiple sessions for optimal results",
        type: "checkbox",
        required: true,
        order: 2
      },
      {
        id: "colorFading",
        label: "I understand that PMU color may fade over time and touch-ups may be needed",
        type: "checkbox",
        required: true,
        order: 3
      },
      {
        id: "browShape",
        label: "I understand that the final brow shape will be determined by my facial structure",
        type: "checkbox",
        required: true,
        order: 4
      },
      {
        id: "healingProcess",
        label: "I understand the healing process and that results may not be visible immediately",
        type: "checkbox",
        required: true,
        order: 5
      },
      {
        id: "clientSignature",
        label: "Digital Signature",
        type: "signature",
        required: true,
        order: 6
      }
    ]
  },

  "lips": {
    id: "lips",
    name: "Lip Blush Consent",
    description: "Lip PMU specific consent and expectations",
    required: true,
    fields: [
      {
        id: "clientName",
        label: "Full Legal Name",
        type: "text",
        required: true,
        order: 1
      },
      {
        id: "lipExpectations",
        label: "I understand that lip blush requires multiple sessions for optimal results",
        type: "checkbox",
        required: true,
        order: 2
      },
      {
        id: "colorVariation",
        label: "I understand that lip color may vary based on my natural lip color",
        type: "checkbox",
        required: true,
        order: 3
      },
      {
        id: "swelling",
        label: "I understand that temporary swelling and tenderness may occur",
        type: "checkbox",
        required: true,
        order: 4
      },
      {
        id: "healingTime",
        label: "I understand that complete healing may take 6-8 weeks",
        type: "checkbox",
        required: true,
        order: 5
      },
      {
        id: "clientSignature",
        label: "Digital Signature",
        type: "signature",
        required: true,
        order: 6
      }
    ]
  },

  "liner": {
    id: "liner",
    name: "Eyeliner Consent",
    description: "Eyeliner PMU specific consent and expectations",
    required: true,
    fields: [
      {
        id: "clientName",
        label: "Full Legal Name",
        type: "text",
        required: true,
        order: 1
      },
      {
        id: "eyeSensitivity",
        label: "I understand that eyes are sensitive and may water during the procedure",
        type: "checkbox",
        required: true,
        order: 2
      },
      {
        id: "linerStyle",
        label: "I understand that the final liner style will be determined by my eye shape",
        type: "checkbox",
        required: true,
        order: 3
      },
      {
        id: "touchUps",
        label: "I understand that eyeliner PMU may require touch-ups to maintain definition",
        type: "checkbox",
        required: true,
        order: 4
      },
      {
        id: "aftercare",
        label: "I understand that proper aftercare is crucial for eyeliner healing",
        type: "checkbox",
        required: true,
        order: 5
      },
      {
        id: "clientSignature",
        label: "Digital Signature",
        type: "signature",
        required: true,
        order: 6
      }
    ]
  },

  "smp": {
    id: "smp",
    name: "SMP Consent",
    description: "Scalp micropigmentation consent and expectations",
    required: true,
    fields: [
      {
        id: "clientName",
        label: "Full Legal Name",
        type: "text",
        required: true,
        order: 1
      },
      {
        id: "scalpHealth",
        label: "I confirm that my scalp is healthy and free from active conditions",
        type: "checkbox",
        required: true,
        order: 2
      },
      {
        id: "hairLoss",
        label: "I understand that SMP does not prevent future hair loss",
        type: "checkbox",
        required: true,
        order: 3
      },
      {
        id: "multipleSessions",
        label: "I understand that SMP requires multiple sessions for optimal results",
        type: "checkbox",
        required: true,
        order: 4
      },
      {
        id: "maintenance",
        label: "I understand that SMP may require periodic touch-ups",
        type: "checkbox",
        required: true,
        order: 5
      },
      {
        id: "clientSignature",
        label: "Digital Signature",
        type: "signature",
        required: true,
        order: 6
      }
    ]
  },

  "photo-release": {
    id: "photo-release",
    name: "Photo & Video Release",
    description: "Permission to use photos and videos for marketing purposes",
    required: false,
    fields: [
      {
        id: "clientName",
        label: "Full Legal Name",
        type: "text",
        required: true,
        order: 1
      },
      {
        id: "photoConsent",
        label: "I consent to the use of my photos and videos for marketing purposes",
        type: "checkbox",
        required: true,
        order: 2,
        helpText: "This includes social media, website, and promotional materials"
      },
      {
        id: "usageRights",
        label: "I understand that these images may be used indefinitely",
        type: "checkbox",
        required: true,
        order: 3
      },
      {
        id: "compensation",
        label: "I understand that no compensation will be provided for the use of my image",
        type: "checkbox",
        required: true,
        order: 4
      },
      {
        id: "withdrawal",
        label: "I understand that I may withdraw this consent at any time in writing",
        type: "checkbox",
        required: true,
        order: 5
      },
      {
        id: "clientSignature",
        label: "Digital Signature",
        type: "signature",
        required: true,
        order: 6
      }
    ]
  },

  "aftercare": {
    id: "aftercare",
    name: "Aftercare Acknowledgment",
    description: "Acknowledgment of aftercare instructions and responsibilities",
    required: true,
    fields: [
      {
        id: "clientName",
        label: "Full Legal Name",
        type: "text",
        required: true,
        order: 1
      },
      {
        id: "instructionsReceived",
        label: "I have received and understand the aftercare instructions",
        type: "checkbox",
        required: true,
        order: 2
      },
      {
        id: "followInstructions",
        label: "I agree to follow all aftercare instructions exactly as provided",
        type: "checkbox",
        required: true,
        order: 3
      },
      {
        id: "avoidActivities",
        label: "I understand activities to avoid during healing (swimming, sun exposure, etc.)",
        type: "checkbox",
        required: true,
        order: 4
      },
      {
        id: "contactArtist",
        label: "I will contact the artist if I have any concerns during healing",
        type: "checkbox",
        required: true,
        order: 5
      },
      {
        id: "healingTime",
        label: "I understand that complete healing may take 6-8 weeks",
        type: "checkbox",
        required: true,
        order: 6
      },
      {
        id: "clientSignature",
        label: "Digital Signature",
        type: "signature",
        required: true,
        order: 7
      }
    ]
  }
}

// Helper function to get template by ID
export function getFormTemplate(templateId: ConsentFormType): FormTemplate | undefined {
  return CONSENT_FORM_TEMPLATES[templateId]
}

// Helper function to get all available templates
export function getAllFormTemplates(): FormTemplate[] {
  return Object.values(CONSENT_FORM_TEMPLATES)
}

// Helper function to get template names for display
export function getTemplateNames(): Array<{ id: ConsentFormType; name: string; description: string }> {
  return Object.values(CONSENT_FORM_TEMPLATES).map(template => ({
    id: template.id,
    name: template.name,
    description: template.description
  }))
}



