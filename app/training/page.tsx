"use client"

import { useMemo } from 'react'
import Link from 'next/link'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'
import { useLocale } from 'next-intl'
import { normalizeLocale } from '@/lib/i18n'
import { SpanishFallbackNotice } from '@/components/training/spanish-fallback-notice'
import { shouldShowSpanishFallback } from '@/lib/training-localization'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { LucideIcon } from 'lucide-react'
import {
  Award,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
  Timer,
  FileText,
  UploadCloud
} from 'lucide-react'

interface TrainingTrack {
  id: string
  title: string
  titleEs?: string
  level: string
  levelEs?: string
  audience: string[]
  duration: string
  competencies: string[]
  competenciesEs?: string[]
  cpdHours: number
  link: string
  description: string
  descriptionEs?: string
}

interface ResourceItem {
  id: string
  title: string
  titleEs?: string
  description: string
  descriptionEs?: string
  href: string
  badge?: string
  badgeEs?: string
}

const TRAINING_TRACKS: TrainingTrack[] = [
  {
    id: 'fundamentals-foundations',
    title: 'Fundamentals & Foundations of PMU Application',
    titleEs: 'Fundamentos y bases de aplicacion PMU',
    level: 'Level 1',
    levelEs: 'Nivel 1',
    audience: ['apprentice', 'student'],
    duration: '6 weeks',
    competencies: ['Sanitation & Infection Control', 'PMU Fundamentals', 'Contraindication Screening'],
    competenciesEs: ['Saneamiento y control de infecciones', 'Fundamentos de PMU', 'Evaluacion de contraindicaciones'],
    cpdHours: 24,
    link: '/training/fundamentals',
    description: 'Structured onboarding curriculum that guides new apprentices through core PMU theory, sanitation standards, and supervised practice requirements.',
    descriptionEs: 'Curriculo estructurado que guia a nuevas aprendices en teoria base de PMU, estandares de saneamiento y requisitos de practica supervisada.'
  },
  {
    id: 'scalp-micropigmentation',
    title: 'Scalp Micropigmentation (SMP) Certification',
    titleEs: 'Certificacion en micropigmentacion capilar (SMP)',
    level: 'Advanced',
    levelEs: 'Avanzado',
    audience: ['apprentice', 'staff'],
    duration: 'Self-paced',
    competencies: ['SMP Techniques', 'Hairline Design', 'Depth Control', 'Client Protocols', 'Business Foundations'],
    competenciesEs: ['Tecnicas SMP', 'Diseno de linea frontal', 'Control de profundidad', 'Protocolos de cliente', 'Fundamentos de negocio'],
    cpdHours: 40,
    link: '/training/smp',
    description: 'Step-by-step SMP system built for precision, restraint, and repeatable results. Learn hairline design, density planning, and professional SMP application techniques.',
    descriptionEs: 'Sistema SMP paso a paso para precision, control y resultados repetibles. Aprende diseno de linea frontal, planificacion de densidad y tecnicas profesionales.'
  },
  {
    id: 'advanced-brows',
    title: 'Advanced Brows Practicum',
    titleEs: 'Practicum avanzado de cejas',
    level: 'Level 2',
    levelEs: 'Nivel 2',
    audience: ['apprentice', 'staff'],
    duration: '4 weeks',
    competencies: ['Brow Mapping Lab', 'Powder Brow Technique', 'Color Theory'],
    competenciesEs: ['Laboratorio de mapeo de cejas', 'Tecnica powder brow', 'Teoria del color'],
    cpdHours: 16,
    link: '/studio/supervision?tab=find',
    description: 'Hands-on mentorship program with instructor sign-off for intermediate artists and apprentices.',
    descriptionEs: 'Programa de mentoria practica con validacion de instructor para artistas intermedias y aprendices.'
  },
  {
    id: 'compliance',
    title: 'Compliance & HR Certification',
    titleEs: 'Certificacion de cumplimiento y RRHH',
    level: 'Management',
    levelEs: 'Gestion',
    audience: ['staff', 'management'],
    duration: 'Self-paced',
    competencies: ['Employment Policies', 'HR Standards', 'Incident Documentation'],
    competenciesEs: ['Politicas laborales', 'Estandares de RRHH', 'Documentacion de incidentes'],
    cpdHours: 8,
    link: '/studio/team',
    description: 'Keep HR, Directors, and Managers aligned on onboarding, permissions, and regulatory requirements.',
    descriptionEs: 'Mantiene a RRHH, directores y gerencia alineados en onboarding, permisos y requisitos regulatorios.'
  },
  {
    id: 'director-leadership',
    title: 'Director Leadership Intensive',
    titleEs: 'Intensivo de liderazgo para direccion',
    level: 'Executive',
    levelEs: 'Ejecutivo',
    audience: ['management'],
    duration: '3 weeks',
    competencies: ['Studio Operations', 'Financial Oversight', 'Performance Coaching'],
    competenciesEs: ['Operaciones de estudio', 'Supervision financiera', 'Coaching de desempeno'],
    cpdHours: 12,
    link: '/reports',
    description: 'Leadership cohort focused on KPIs, financial reporting, and training program accountability.',
    descriptionEs: 'Cohorte de liderazgo enfocada en KPI, reportes financieros y responsabilidad del programa de capacitacion.'
  }
]

interface ActionCard {
  id: string
  title: string
  titleEs?: string
  description: string
  descriptionEs?: string
  href: string
  icon: LucideIcon
  badge: string
  badgeEs?: string
  colorClass: string
}

const STUDENT_ACTIONS: ActionCard[] = [
  {
    id: 'choose-program',
    title: 'Choose Your Program',
    titleEs: 'Elige tu programa',
    description: 'Compare live programs and unlock modules, videos, and printable checklists.',
    descriptionEs: 'Compara programas activos y desbloquea modulos, videos y listas imprimibles.',
    href: '#student-programs',
    icon: GraduationCap,
    badge: 'Start',
    badgeEs: 'Inicio',
    colorClass: 'bg-purple-50 text-purple-700'
  },
  {
    id: 'download-materials',
    title: 'Download Course PDFs',
    titleEs: 'Descargar PDFs del curso',
    description: 'Grab e-books, consent forms, and study guides from the shared library.',
    descriptionEs: 'Descarga e-books, consentimientos y guias de estudio desde la biblioteca compartida.',
    href: '/library?category=training',
    icon: BookOpen,
    badge: 'Resources',
    badgeEs: 'Recursos',
    colorClass: 'bg-amber-50 text-amber-700'
  },
  {
    id: 'book-room',
    title: 'Book Training Room',
    titleEs: 'Reservar sala de entrenamiento',
    description: 'Reserve ProCell-only practice rooms with built-in cleanup buffer.',
    descriptionEs: 'Reserva salas de practica solo ProCell con margen de limpieza incorporado.',
    href: '/studio/room-booking',
    icon: CalendarCheck,
    badge: 'Scheduling',
    badgeEs: 'Agenda',
    colorClass: 'bg-teal-50 text-teal-700'
  }
]

const INSTRUCTOR_ACTIONS: ActionCard[] = [
  {
    id: 'upload-materials',
    title: 'Upload Training Materials',
    titleEs: 'Subir materiales de entrenamiento',
    description: 'Add PDFs and downloadable resources directly to the student library.',
    descriptionEs: 'Agrega PDFs y recursos descargables directamente a la biblioteca del estudiante.',
    href: '/library#upload-resources',
    icon: UploadCloud,
    badge: 'Resources',
    badgeEs: 'Recursos',
    colorClass: 'bg-indigo-50 text-indigo-700'
  },
  {
    id: 'track-attendance',
    title: 'Track Attendance & Hours',
    titleEs: 'Registrar asistencia y horas',
    description: 'Log student check-ins, supervised hours, and competency sign-offs.',
    descriptionEs: 'Registra check-ins de estudiantes, horas supervisadas y validaciones de competencias.',
    href: '/training/fundamentals?view=instructor',
    icon: ClipboardList,
    badge: 'Attendance',
    badgeEs: 'Asistencia',
    colorClass: 'bg-emerald-50 text-emerald-700'
  },
  {
    id: 'grade-assignments',
    title: 'Grade Assignments',
    titleEs: 'Calificar asignaciones',
    description: 'Review submissions, record grades, and release feedback instantly.',
    descriptionEs: 'Revisa entregas, registra calificaciones y publica retroalimentacion al instante.',
    href: '/training/fundamentals?view=instructor',
    icon: Award,
    badge: 'Assessment',
    badgeEs: 'Evaluacion',
    colorClass: 'bg-amber-50 text-amber-700'
  },
  {
    id: 'schedule-supervision',
    title: 'Schedule Supervision',
    titleEs: 'Programar supervision',
    description: 'Pair students with instructors and manage live supervision sessions.',
    descriptionEs: 'Asigna estudiantes con instructores y gestiona sesiones de supervision en vivo.',
    href: '/studio/supervision',
    icon: Users,
    badge: 'Supervision',
    badgeEs: 'Supervision',
    colorClass: 'bg-blue-50 text-blue-700'
  }
]

const RESOURCE_LIBRARY: ResourceItem[] = [
  {
    id: 'curriculum',
    title: 'PMU Training Curriculum Template',
    titleEs: 'Plantilla de curriculo de entrenamiento PMU',
    description: 'Editable module outlines covering sanitation, technique, pigmentology, and client safety.',
    descriptionEs: 'Esquemas editables de modulos sobre saneamiento, tecnica, pigmentologia y seguridad del cliente.',
    href: '/library?category=training',
    badge: 'Template',
    badgeEs: 'Plantilla'
  },
  {
    id: 'evaluation',
    title: 'Instructor Evaluation Form',
    titleEs: 'Formulario de evaluacion de instructor',
    description: 'Document apprentice progress, competency sign-offs, and follow-up actions.',
    descriptionEs: 'Documenta progreso de aprendices, validaciones de competencias y acciones de seguimiento.',
    href: '/library?category=supervision',
    badge: 'Doc',
    badgeEs: 'Documento'
  },
  {
    id: 'compliance-guide',
    title: 'Training Compliance Guide',
    titleEs: 'Guia de cumplimiento de entrenamiento',
    description: 'State compliance checklist with required hours, documentation, and inspection prep.',
    descriptionEs: 'Lista estatal de cumplimiento con horas requeridas, documentacion y preparacion para inspecciones.',
    href: '/library?category=regulations'
  }
]

const COMPLIANCE_CHECKLIST = [
  'Verify apprentice registration and licensing status',
  'Log training hours and signed evaluations in the supervision portal',
  'Maintain proof of sanitation and bloodborne pathogen certification',
  'Ensure ProCell-only services for students booking treatment rooms',
  'Upload employment agreements and permissions for HR and Directors'
]

const UPCOMING_SESSIONS = [
  {
    id: 'session-1',
    title: 'Live Brow Mapping Lab',
    titleEs: 'Laboratorio en vivo de mapeo de cejas',
    date: 'Nov 12, 2025',
    time: '2:00 PM EST',
    modality: 'In-Studio',
    instructor: 'Careya Garcia',
    roomLink: '/studio/room-booking'
  },
  {
    id: 'session-2',
    title: 'Client Safety & Contraindications Workshop',
    titleEs: 'Taller de seguridad del cliente y contraindicaciones',
    date: 'Nov 15, 2025',
    time: '11:00 AM EST',
    modality: 'Virtual',
    instructor: 'Director Tyrone Jackson',
    roomLink: '/ai-contraindication'
  },
  {
    id: 'session-3',
    title: 'HR Compliance Roundtable',
    titleEs: 'Mesa redonda de cumplimiento de RRHH',
    date: 'Nov 20, 2025',
    time: '5:30 PM EST',
    modality: 'Hybrid',
    instructor: 'Piresa Willis',
    roomLink: '/studio/team'
  }
]

const TRAINING_METRICS = {
  completionRate: 78,
  compliantHours: 312,
  activeLearners: 14,
  scheduledSessions: UPCOMING_SESSIONS.length
}

export default function TrainingPage() {
  const locale = normalizeLocale(useLocale())
  const { currentUser } = useDemoAuth()
  const role = currentUser?.role?.toLowerCase() || 'guest'
  const isOwner = role === 'owner'
  const isStudentRole = ['student', 'apprentice'].includes(role)
  const isInstructorRole = ['instructor', 'director', 'manager', 'hr'].includes(role)

  const fallbackView = !isOwner && !isStudentRole && !isInstructorRole
  const showStudentPortal = isOwner || isStudentRole || fallbackView
  // Explicitly hide Instructor Console from students
  const showInstructorConsole = !isStudentRole && (isOwner || isInstructorRole || fallbackView)

  const studentPrograms = useMemo(
    () => TRAINING_TRACKS.filter(track => track.audience.some(audience => audience === 'apprentice' || audience === 'student')),
    []
  )

  const instructorPrograms = useMemo(
    () => TRAINING_TRACKS.filter(track => track.audience.some(audience => audience === 'staff' || audience === 'management')),
    []
  )
  const showSpanishTrainingFallback = useMemo(
    () =>
      shouldShowSpanishFallback(locale, [
        ...TRAINING_TRACKS.flatMap(track => [track.title, track.description, ...track.competencies]),
        ...RESOURCE_LIBRARY.flatMap(resource => [resource.title, resource.description])
      ]),
    [locale]
  )

  const heroVariant: 'student' | 'instructor' | 'owner' = isOwner
    ? 'owner'
    : showInstructorConsole && !showStudentPortal
      ? 'instructor'
      : showStudentPortal && !showInstructorConsole
        ? 'student'
        : 'owner'

  const heroTitle = {
    student: locale === 'es' ? 'Portal de entrenamiento del estudiante' : 'Student Training Portal',
    instructor: locale === 'es' ? 'Consola de entrenamiento del instructor' : 'Instructor Training Console',
    owner: locale === 'es' ? 'Centro de entrenamiento y certificacion del estudio' : 'Studio Training & Certification Hub'
  }[heroVariant]

  const heroDescription = {
    student:
      locale === 'es'
        ? 'Elige tu ruta de entrenamiento, accede a modulos y descarga los recursos preparados por tu instructor.'
        : 'Choose your training track, access modules, and download the resources your instructor prepared for you.',
    instructor:
      locale === 'es'
        ? 'Gestiona cohortes, sube recursos del curriculo y registra asistencia, calificaciones y cumplimiento en un solo lugar.'
        : 'Manage cohorts, upload curriculum resources, and track attendance, grades, and compliance in one place.',
    owner:
      locale === 'es'
        ? 'Guia a estudiantes e instructores en todo el estudio. Lanza programas, monitorea cumplimiento y respalda flujos de supervision.'
        : 'Guide every learner and instructor across the studio. Launch programs, monitor compliance, and support supervised training workflows.'
  }[heroVariant]

  const primaryCta = {
    student: {
      href: studentPrograms[0]?.link ?? '/training/fundamentals',
      label: locale === 'es' ? 'Elegir programa' : 'Choose Your Program',
      icon: GraduationCap
    },
    instructor: {
      href: '/training/fundamentals?view=instructor',
      label: locale === 'es' ? 'Abrir consola de instructor' : 'Open Instructor Console',
      icon: Users
    },
    owner: {
      href: '#student-portal',
      label: locale === 'es' ? 'Ver portal del estudiante' : 'View Student Portal',
      icon: GraduationCap
    }
  }[heroVariant]

  const secondaryCta = (() => {
    if (heroVariant === 'owner') {
      return {
        href: '/training/fundamentals?view=instructor',
        label: locale === 'es' ? 'Abrir consola de instructor' : 'Open Instructor Console',
        icon: Users
      }
    }
    if (heroVariant === 'student' && showInstructorConsole) {
      return {
        href: '/training/fundamentals?view=instructor',
        label: locale === 'es' ? 'Consola de instructor' : 'Instructor Console',
        icon: Users
      }
    }
    if (heroVariant === 'instructor' && showStudentPortal) {
      return {
        href: '#student-portal',
        label: locale === 'es' ? 'Programas para estudiantes' : 'Student Programs',
        icon: GraduationCap
      }
    }
    return null
  })()

  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase(),
    avatar: currentUser.avatar
  } : {
    name: 'PMU Artist',
    email: 'user@pmupro.com',
    initials: 'PA'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-lavender-50">
      <NavBar currentPath="/training" user={user} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-20">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-10">
          <Card className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-500 text-white overflow-hidden shadow-xl">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="max-w-2xl">
                  <Badge className="bg-white/20 text-white border-white/30 mb-3">
                    <Sparkles className="h-4 w-4 mr-1" /> {locale === 'es' ? 'Centro de entrenamiento activo' : 'Training Hub is Live'}
                  </Badge>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif">
                    {heroTitle}
                  </h1>
                  <p className="mt-3 text-sm sm:text-base text-purple-50 leading-relaxed">
                    {heroDescription}
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <Button asChild className="bg-white text-purple-700 hover:bg-purple-50">
                      <Link href={primaryCta.href}>
                        <primaryCta.icon className="h-4 w-4 mr-2" /> {primaryCta.label}
                      </Link>
                    </Button>
                    {secondaryCta && (
                      <Button asChild variant="outline" className="border-white/70 text-white hover:bg-white/10">
                        <Link href={secondaryCta.href}>
                          <secondaryCta.icon className="h-4 w-4 mr-2" /> {secondaryCta.label}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {showInstructorConsole && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-none">
                      <CardContent className="p-4">
                        <div className="text-xs uppercase tracking-wide text-purple-100">{locale === 'es' ? 'Tasa de finalizacion' : 'Completion Rate'}</div>
                        <div className="mt-2 flex items-end gap-2">
                          <span className="text-3xl font-bold">{TRAINING_METRICS.completionRate}%</span>
                          <span className="text-xs text-purple-100">{locale === 'es' ? 'de modulos asignados' : 'of assigned modules'}</span>
                        </div>
                        <Progress value={TRAINING_METRICS.completionRate} className="mt-3 h-2 bg-white/20" />
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-none">
                      <CardContent className="p-4">
                        <div className="text-xs uppercase tracking-wide text-purple-100">{locale === 'es' ? 'Horas de cumplimiento registradas' : 'Compliant Hours Logged'}</div>
                        <div className="mt-2 text-3xl font-bold">{TRAINING_METRICS.compliantHours}</div>
                        <div className="text-xs text-purple-100">{locale === 'es' ? 'Entre aprendices y personal' : 'Across apprentices and staff'}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-none">
                      <CardContent className="p-4">
                        <div className="text-xs uppercase tracking-wide text-purple-100">{locale === 'es' ? 'Estudiantes activos' : 'Active Learners'}</div>
                        <div className="mt-2 text-3xl font-bold">{TRAINING_METRICS.activeLearners}</div>
                        <div className="text-xs text-purple-100">{locale === 'es' ? 'En entrenamiento este mes' : 'In training this month'}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-none">
                      <CardContent className="p-4">
                        <div className="text-xs uppercase tracking-wide text-purple-100">{locale === 'es' ? 'Sesiones programadas' : 'Sessions Scheduled'}</div>
                        <div className="mt-2 text-3xl font-bold">{TRAINING_METRICS.scheduledSessions}</div>
                        <div className="text-xs text-purple-100">{locale === 'es' ? 'Proximas clases' : 'Upcoming classes'}</div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {showStudentPortal && (
          <section id="student-portal" className="mb-14 space-y-6">
            {showSpanishTrainingFallback && <SpanishFallbackNotice />}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{locale === 'es' ? 'Portal del estudiante' : 'Student Portal'}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {locale === 'es'
                    ? 'Explora programas activos, descarga PDFs del curriculo y preparate para las proximas sesiones.'
                    : 'Browse active programs, download curriculum PDFs, and stay ready for upcoming sessions.'}
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-700 border border-purple-200">{locale === 'es' ? 'Acceso estudiante' : 'Student Access'}</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {STUDENT_ACTIONS.map(action => (
                <Card key={action.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-4">
                    <Badge className={action.colorClass}>{locale === 'es' ? action.badgeEs || action.badge : action.badge}</Badge>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{locale === 'es' ? action.titleEs || action.title : action.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{locale === 'es' ? action.descriptionEs || action.description : action.description}</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={action.href}>{locale === 'es' ? 'Abrir' : 'Open'}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div id="student-programs" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{locale === 'es' ? 'Catalogo de programas' : 'Program Catalog'}</h3>
                <p className="text-sm text-gray-600">{locale === 'es' ? 'Selecciona un programa para ver modulos, asignaciones y materiales descargables.' : 'Select a program to view modules, assignments, and downloadable materials.'}</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {studentPrograms.map(track => (
                  <Card key={track.id} className="border border-gray-200 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">{locale === 'es' ? track.titleEs || track.title : track.title}</CardTitle>
                        <Badge className="bg-purple-100 text-purple-700 border border-purple-200">{locale === 'es' ? track.levelEs || track.level : track.level}</Badge>
                      </div>
                      <CardDescription className="text-gray-600 leading-relaxed">
                        {locale === 'es' ? track.descriptionEs || track.description : track.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-purple-600" />
                          <span>{track.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span>{locale === 'es' ? `${track.cpdHours} horas CPD` : `${track.cpdHours} CPD hours`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span>{locale === 'es' ? 'Para' : 'For'} {track.audience.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">{locale === 'es' ? 'Competencias clave' : 'Key Competencies'}</h4>
                        <div className="flex flex-wrap gap-2">
                          {(locale === 'es' && track.competenciesEs ? track.competenciesEs : track.competencies).map(item => (
                            <Badge key={item} className="bg-gray-100 text-gray-700 border border-gray-200">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                        <Link href={track.link}>{locale === 'es' ? 'Entrar al programa' : 'Enter Program'}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{locale === 'es' ? 'Proximas sesiones' : 'Upcoming Sessions'}</h3>
                <p className="text-sm text-gray-600">{locale === 'es' ? 'Registrate con anticipacion para asegurar tu lugar en laboratorios y talleres en vivo.' : 'Register early to secure your seat for live labs and workshops.'}</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {UPCOMING_SESSIONS.map(session => (
                  <Card key={session.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">{locale === 'es' ? session.titleEs || session.title : session.title}</h4>
                          <p className="text-sm text-gray-600">{locale === 'es' ? 'Impartido por' : 'Led by'} {session.instructor}</p>
                        </div>
                        <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200">{session.modality}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <CalendarCheck className="h-4 w-4 text-indigo-600" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Timer className="h-4 w-4 text-indigo-600" />
                        <span>{session.time}</span>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={session.roomLink}>{locale === 'es' ? 'Ver detalles de sesion' : 'View Session Details'}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{locale === 'es' ? 'Recursos utiles' : 'Helpful Resources'}</h3>
              <div className="grid gap-5 md:grid-cols-2">
                {RESOURCE_LIBRARY.map(resource => (
                  <Card key={resource.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        <h4 className="text-base font-semibold text-gray-900">{locale === 'es' ? resource.titleEs || resource.title : resource.title}</h4>
                        {resource.badge && (
                          <Badge className="bg-gray-100 text-gray-700 border border-gray-200">{locale === 'es' ? resource.badgeEs || resource.badge : resource.badge}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{locale === 'es' ? resource.descriptionEs || resource.description : resource.description}</p>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={resource.href}>{locale === 'es' ? 'Abrir recurso' : 'Open Resource'}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {showInstructorConsole && (
          <section id="instructor-console" className="mb-6 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Instructor Console</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Upload curriculum, manage grades and attendance, and keep compliance records inspection-ready.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200">Instructor Access</Badge>
                <Button
                  asChild
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  size="sm"
                >
                  <Link href="/training/fundamentals?view=instructor">Launch Console</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {INSTRUCTOR_ACTIONS.map(action => (
                <Card key={action.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-4">
                    <Badge className={action.colorClass}>{action.badge}</Badge>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={action.href}>Open</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {instructorPrograms.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Studio Programs & Certifications</h3>
                <div className="grid gap-6 lg:grid-cols-2">
                  {instructorPrograms.map(track => (
                    <Card key={track.id} className="border border-gray-200 shadow-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold text-gray-900">{track.title}</CardTitle>
                          <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200">{track.level}</Badge>
                        </div>
                        <CardDescription className="text-gray-600 leading-relaxed">
                          {track.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-indigo-600" />
                            <span>{track.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-600" />
                            <span>{track.cpdHours} CPD hours</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-indigo-600" />
                            <span>Audience: {track.audience.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Competencies</h4>
                          <div className="flex flex-wrap gap-2">
                            {track.competencies.map(item => (
                              <Badge key={item} className="bg-gray-100 text-gray-700 border border-gray-200">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                          <Link href={track.link}>Open Program</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Training Compliance Checklist</CardTitle>
                  <CardDescription>Keep documentation ready for state inspections and internal audits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {COMPLIANCE_CHECKLIST.map(item => (
                    <div key={item} className="flex items-start gap-3 text-sm text-gray-700">
                      <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border border-indigo-200 bg-indigo-50 shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200">Resource Sharing</Badge>
                  <h3 className="text-base font-semibold text-indigo-900">Upload materials to the Resource Library</h3>
                  <p className="text-sm text-indigo-800 leading-relaxed">
                    Keep students synced with the latest e-books, forms, and compliance documents. Upload once and make it instantly available in the library.
                  </p>
                  <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    <Link href="/library#upload-resources">Open Upload Console</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {UPCOMING_SESSIONS.map(session => (
                  <Card key={session.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">{session.title}</h4>
                          <p className="text-sm text-gray-600">Instructor: {session.instructor}</p>
                        </div>
                        <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200">{session.modality}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <CalendarCheck className="h-4 w-4 text-indigo-600" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Timer className="h-4 w-4 text-indigo-600" />
                        <span>{session.time}</span>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={session.roomLink}>Manage Session</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
