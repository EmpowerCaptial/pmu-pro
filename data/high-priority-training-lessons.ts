import type { LocalizedLesson } from '@/lib/training-localization'

export const HIGH_PRIORITY_TRAINING_LESSONS: Record<
  | 'sanitation-infection-control'
  | 'bloodborne-pathogens-basics'
  | 'contraindications'
  | 'aftercare-instructions'
  | 'brow-mapping-fundamentals',
  LocalizedLesson
> = {
  'sanitation-infection-control': {
    title: {
      en: 'Sanitation / Infection Control',
      es: 'Saneamiento y Control de Infecciones'
    },
    description: {
      en: 'Core clinic hygiene workflow for PMU services before, during, and after every procedure.',
      es: 'Flujo esencial de higiene clinica para servicios PMU antes, durante y despues de cada procedimiento.'
    },
    sections: [
      {
        heading: {
          en: 'Clean Field Setup',
          es: 'Preparacion del Campo Limpio'
        },
        body: {
          en: 'Disinfect all high-touch surfaces, apply barrier film to contact points, and place only sterile single-use items on the workstation.',
          es: 'Desinfecta todas las superficies de alto contacto, coloca pelicula de barrera en los puntos de contacto y prepara en la estacion solo articulos esteriles de un solo uso.'
        }
      },
      {
        heading: {
          en: 'Hand Hygiene and PPE Sequence',
          es: 'Secuencia de Higiene de Manos y EPP'
        },
        body: {
          en: 'Wash hands thoroughly before gloving, change gloves after any contamination event, and replace PPE between clients without exception.',
          es: 'Lavate las manos completamente antes de colocarte guantes, cambia los guantes despues de cualquier evento de contaminacion y reemplaza el EPP entre clientes sin excepcion.'
        }
      },
      {
        heading: {
          en: 'Cross-Contamination Prevention',
          es: 'Prevencion de Contaminacion Cruzada'
        },
        body: {
          en: 'Use a clean-to-dirty workflow, avoid double-dipping pigments, and never return used materials to sterile zones.',
          es: 'Trabaja de limpio a sucio, evita la doble inmersion en pigmentos y nunca regreses materiales usados a zonas esteriles.'
        }
      }
    ]
  },
  'bloodborne-pathogens-basics': {
    title: {
      en: 'Bloodborne Pathogens Basics',
      es: 'Fundamentos de Patogenos Transmitidos por Sangre'
    },
    description: {
      en: 'Safety fundamentals to reduce exposure risk and maintain OSHA-aligned PMU practice standards.',
      es: 'Fundamentos de seguridad para reducir el riesgo de exposicion y mantener estandares de practica PMU alineados con OSHA.'
    },
    sections: [
      {
        heading: {
          en: 'Primary Bloodborne Risks',
          es: 'Riesgos Principales por Exposicion a Sangre'
        },
        body: {
          en: 'Treat all blood and potentially infectious materials as hazardous and follow universal precautions with every client.',
          es: 'Trata toda sangre y material potencialmente infeccioso como peligroso y aplica precauciones universales con cada cliente.'
        }
      },
      {
        heading: {
          en: 'Sharps Handling and Disposal',
          es: 'Manejo y Eliminacion de Objetos Punzocortantes'
        },
        body: {
          en: 'Activate needle safety controls immediately after use and discard sharps directly into an approved puncture-resistant container.',
          es: 'Activa de inmediato los controles de seguridad de la aguja despues de usarla y desecha punzocortantes directamente en un contenedor aprobado resistente a perforaciones.'
        }
      },
      {
        heading: {
          en: 'Exposure Response Protocol',
          es: 'Protocolo de Respuesta ante Exposicion'
        },
        body: {
          en: 'If exposure occurs, stop the procedure, perform immediate first aid, document the incident, and follow medical evaluation procedures promptly.',
          es: 'Si ocurre una exposicion, detén el procedimiento, aplica primeros auxilios inmediatos, documenta el incidente y sigue sin demora los procedimientos de evaluacion medica.'
        }
      }
    ]
  },
  contraindications: {
    title: {
      en: 'Contraindications',
      es: 'Contraindicaciones'
    },
    description: {
      en: 'Decision framework for identifying when to proceed, modify service, postpone, or refer out.',
      es: 'Marco de decision para identificar cuando proceder, modificar el servicio, posponer o referir.'
    },
    sections: [
      {
        heading: {
          en: 'Absolute Contraindications',
          es: 'Contraindicaciones Absolutas'
        },
        body: {
          en: 'Do not proceed when active infection, uncontrolled medical risk, or clear safety disqualification is present.',
          es: 'No procedas cuando exista infeccion activa, riesgo medico no controlado o una descalificacion clara de seguridad.'
        }
      },
      {
        heading: {
          en: 'Relative Contraindications',
          es: 'Contraindicaciones Relativas'
        },
        body: {
          en: 'For conditions that may affect healing or retention, adjust technique and timing, and proceed only with informed clinical judgment.',
          es: 'En condiciones que pueden afectar la cicatrizacion o la retencion, ajusta tecnica y tiempos, y procede solo con juicio clinico informado.'
        }
      },
      {
        heading: {
          en: 'Client Communication and Documentation',
          es: 'Comunicacion y Documentacion con el Cliente'
        },
        body: {
          en: 'Explain safety decisions clearly, record risk factors in the intake form, and document recommendation outcomes in detail.',
          es: 'Explica con claridad las decisiones de seguridad, registra los factores de riesgo en el formulario de admision y documenta en detalle los resultados de la recomendacion.'
        }
      }
    ]
  },
  'aftercare-instructions': {
    title: {
      en: 'Aftercare Instructions',
      es: 'Instrucciones de Cuidado Posterior'
    },
    description: {
      en: 'Post-procedure healing guidance to protect pigment retention and reduce complication risk.',
      es: 'Guia de cicatrizacion posterior al procedimiento para proteger la retencion del pigmento y reducir el riesgo de complicaciones.'
    },
    sections: [
      {
        heading: {
          en: 'First 24-48 Hours',
          es: 'Primeras 24-48 Horas'
        },
        body: {
          en: 'Keep the area clean and dry, avoid friction, and follow the exact cleansing routine provided by your artist.',
          es: 'Mantén el area limpia y seca, evita la friccion y sigue exactamente la rutina de limpieza indicada por tu artista.'
        }
      },
      {
        heading: {
          en: 'Healing Window Expectations',
          es: 'Expectativas Durante la Cicatrizacion'
        },
        body: {
          en: 'Mild flaking, temporary lightening, and sensitivity are expected; do not pick, scratch, or exfoliate the treated area.',
          es: 'Es normal presentar descamacion leve, aclaramiento temporal y sensibilidad; no arranques costras, no rasques ni exfolies el area tratada.'
        }
      },
      {
        heading: {
          en: 'Activity and Product Restrictions',
          es: 'Restricciones de Actividad y Productos'
        },
        body: {
          en: 'Avoid heavy sweating, swimming, steam rooms, direct sun, and active skincare ingredients until cleared by your PMU professional.',
          es: 'Evita sudoracion intensa, natacion, sauna, sol directo e ingredientes activos para la piel hasta recibir autorizacion de tu profesional PMU.'
        }
      }
    ]
  },
  'brow-mapping-fundamentals': {
    title: {
      en: 'Brow Mapping Fundamentals',
      es: 'Fundamentos del Diseno y Mapeo de Cejas'
    },
    description: {
      en: 'Structural brow design principles for symmetry, facial harmony, and technique planning.',
      es: 'Principios de diseno estructural de cejas para lograr simetria, armonia facial y planificacion tecnica.'
    },
    sections: [
      {
        heading: {
          en: 'Reference Points and Landmarks',
          es: 'Puntos de Referencia y Marcas Anatomicas'
        },
        body: {
          en: 'Identify head, arch, and tail placement using consistent facial landmarks before any outline is drawn.',
          es: 'Identifica la posicion de inicio, arco y cola usando referencias faciales consistentes antes de dibujar cualquier contorno.'
        }
      },
      {
        heading: {
          en: 'Symmetry and Balance',
          es: 'Simetria y Equilibrio'
        },
        body: {
          en: 'Map for facial balance rather than forced mirror symmetry, and adjust shape to natural asymmetry and expression dynamics.',
          es: 'Mapea para lograr equilibrio facial, no simetria en espejo forzada, y ajusta la forma segun la asimetria natural y la dinamica de expresion.'
        }
      },
      {
        heading: {
          en: 'Design Approval Workflow',
          es: 'Flujo de Aprobacion del Diseno'
        },
        body: {
          en: 'Review mapping with the client before pigment placement, confirm expectations, and document approved design decisions.',
          es: 'Revisa el mapeo con la clienta antes de implantar pigmento, confirma expectativas y documenta las decisiones de diseno aprobadas.'
        }
      }
    ]
  }
}
