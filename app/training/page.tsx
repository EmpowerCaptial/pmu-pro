"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Compass
} from 'lucide-react'

interface TrainingTrack {
  id: string
  title: string
  level: string
  audience: string[]
  duration: string
  competencies: string[]
  cpdHours: number
  link: string
  description: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  href: string
  icon: LucideIcon
  badge: string
  colorClass: string
}

interface ResourceItem {
  id: string
  title: string
  description: string
  href: string
  badge?: string
}

const AUDIENCE_FILTERS = [
  { id: 'all', label: 'All Programs' },
  { id: 'apprentice', label: 'Apprentices & Students' },
  { id: 'staff', label: 'Staff & HR' },
  { id: 'management', label: 'Directors & Owners' }
]

const TRAINING_TRACKS: TrainingTrack[] = [
  {
    id: 'foundations',
    title: 'Apprentice Foundations',
    level: 'Level 1',
    audience: ['apprentice', 'student'],
    duration: '6 weeks',
    competencies: ['Sanitation & Infection Control', 'PMU Fundamentals', 'Contraindication Screening'],
    cpdHours: 24,
    link: '/studio/supervision',
    description: 'Structured onboarding curriculum for new apprentices covering sanitation, safety, and PMU fundamentals.'
  },
  {
    id: 'advanced-brows',
    title: 'Advanced Brows Practicum',
    level: 'Level 2',
    audience: ['apprentice', 'staff'],
    duration: '4 weeks',
    competencies: ['Brow Mapping Lab', 'Powder Brow Technique', 'Color Theory'],
    cpdHours: 16,
    link: '/studio/supervision?tab=find',
    description: 'Hands-on mentorship program with instructor sign-off for intermediate artists and apprentices.'
  },
  {
    id: 'compliance',
    title: 'Compliance & HR Certification',
    level: 'Management',
    audience: ['staff', 'management'],
    duration: 'Self-paced',
    competencies: ['Employment Policies', 'HR Standards', 'Incident Documentation'],
    cpdHours: 8,
    link: '/studio/team',
    description: 'Keep HR, Directors, and Managers aligned on onboarding, permissions, and regulatory requirements.'
  },
  {
    id: 'director-leadership',
    title: 'Director Leadership Intensive',
    level: 'Executive',
    audience: ['management'],
    duration: '3 weeks',
    competencies: ['Studio Operations', 'Financial Oversight', 'Performance Coaching'],
    cpdHours: 12,
    link: '/reports',
    description: 'Leadership cohort focused on KPIs, financial reporting, and training program accountability.'
  }
]

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'assign-instructor',
    title: 'Assign Instructor',
    description: 'Match apprentices with certified supervisors and document training hours.',
    href: '/studio/supervision',
    icon: Users,
    badge: 'Supervision',
    colorClass: 'bg-blue-50 text-blue-700'
  },
  {
    id: 'book-room',
    title: 'Book Training Room',
    description: 'Reserve 1 hr 15 min ProCell-approved treatment rooms for skill labs.',
    href: '/studio/room-booking',
    icon: CalendarCheck,
    badge: 'Scheduling',
    colorClass: 'bg-teal-50 text-teal-700'
  },
  {
    id: 'update-permissions',
    title: 'Update Permissions',
    description: 'Control HR, Manager, and Staff access to training and supervision tools.',
    href: '/studio/team',
    icon: ShieldCheck,
    badge: 'Access Control',
    colorClass: 'bg-purple-50 text-purple-700'
  },
  {
    id: 'download-materials',
    title: 'Download Curriculum PDFs',
    description: 'Access training checklists, consent forms, and state-by-state requirements.',
    href: '/library',
    icon: BookOpen,
    badge: 'Resources',
    colorClass: 'bg-amber-50 text-amber-700'
  }
]

const RESOURCE_LIBRARY: ResourceItem[] = [
  {
    id: 'curriculum',
    title: 'PMU Training Curriculum Template',
    description: 'Editable module outlines covering sanitation, technique, pigmentology, and client safety.',
    href: '/library?category=training',
    badge: 'Template'
  },
  {
    id: 'evaluation',
    title: 'Instructor Evaluation Form',
    description: 'Document apprentice progress, competency sign-offs, and follow-up actions.',
    href: '/library?category=supervision',
    badge: 'Doc'
  },
  {
    id: 'compliance-guide',
    title: 'Training Compliance Guide',
    description: 'State compliance checklist with required hours, documentation, and inspection prep.',
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
    date: 'Nov 12, 2025',
    time: '2:00 PM EST',
    modality: 'In-Studio',
    instructor: 'Careya Garcia',
    roomLink: '/studio/room-booking'
  },
  {
    id: 'session-2',
    title: 'Client Safety & Contraindications Workshop',
    date: 'Nov 15, 2025',
    time: '11:00 AM EST',
    modality: 'Virtual',
    instructor: 'Director Tyrone Jackson',
    roomLink: '/ai-contraindication'
  },
  {
    id: 'session-3',
    title: 'HR Compliance Roundtable',
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
  const { currentUser } = useDemoAuth()
  const [selectedAudience, setSelectedAudience] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<string>('tracks')

  const filteredTracks = useMemo(() => {
    if (selectedAudience === 'all') {
      return TRAINING_TRACKS
    }
    return TRAINING_TRACKS.filter(track => track.audience.includes(selectedAudience))
  }, [selectedAudience])

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
                    <Sparkles className="h-4 w-4 mr-1" /> Training Hub is Live
                  </Badge>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif">
                    Training & Certification Hub
                  </h1>
                  <p className="mt-3 text-sm sm:text-base text-purple-50 leading-relaxed">
                    Launch structured training plans, track apprentice hours, and keep your studio compliant. Directors and HR can assign roles, book ProCell-approved rooms, and manage sign-offs from one place.
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <Button asChild className="bg-white text-purple-700 hover:bg-purple-50">
                      <Link href="#tracks">
                        <GraduationCap className="h-4 w-4 mr-2" /> Start a Training Plan
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white/70 text-white hover:bg-white/10">
                      <Link href="/studio/supervision">
                        <Users className="h-4 w-4 mr-2" /> Book Supervision Session
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-none">
                    <CardContent className="p-4">
                      <div className="text-xs uppercase tracking-wide text-purple-100">Completion Rate</div>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-bold">{TRAINING_METRICS.completionRate}%</span>
                        <span className="text-xs text-purple-100">of assigned modules</span>
                      </div>
                      <Progress value={TRAINING_METRICS.completionRate} className="mt-3 h-2 bg-white/20" />
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-none">
                    <CardContent className="p-4">
                      <div className="text-xs uppercase tracking-wide text-purple-100">Compliant Hours Logged</div>
                      <div className="mt-2 text-3xl font-bold">{TRAINING_METRICS.compliantHours}</div>
                      <div className="text-xs text-purple-100">Across apprentices and staff</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-none">
                    <CardContent className="p-4">
                      <div className="text-xs uppercase tracking-wide text-purple-100">Active Learners</div>
                      <div className="mt-2 text-3xl font-bold">{TRAINING_METRICS.activeLearners}</div>
                      <div className="text-xs text-purple-100">In training this month</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-none">
                    <CardContent className="p-4">
                      <div className="text-xs uppercase tracking-wide text-purple-100">Sessions Scheduled</div>
                      <div className="mt-2 text-3xl font-bold">{TRAINING_METRICS.scheduledSessions}</div>
                      <div className="text-xs text-purple-100">Upcoming classes</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Quick Actions</h2>
            <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
              <ClipboardList className="h-3.5 w-3.5 mr-1" /> Daily Workflow
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {QUICK_ACTIONS.map(action => (
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
        </section>

        {/* Training Content */}
        <section id="tracks" className="mb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap gap-2 bg-gray-100/70 p-1 rounded-lg">
              <TabsTrigger value="tracks" className="flex items-center gap-2">
                <Award className="h-4 w-4" /> Training Tracks
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" /> Upcoming Sessions
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Compliance
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Resources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tracks" className="mt-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {AUDIENCE_FILTERS.map(filter => (
                  <Button
                    key={filter.id}
                    variant={selectedAudience === filter.id ? 'default' : 'outline'}
                    className={selectedAudience === filter.id ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
                    onClick={() => setSelectedAudience(filter.id)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {filteredTracks.map(track => (
                  <Card key={track.id} className="border border-gray-200 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">{track.title}</CardTitle>
                        <Badge className="bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Compass className="h-3.5 w-3.5" /> {track.level}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-600 leading-relaxed">
                        {track.description}
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
                          <span>{track.cpdHours} CPD hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span>
                            {track.audience.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}
                          </span>
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

                      <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                        <Link href={track.link}>Open Program</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="mt-6">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {UPCOMING_SESSIONS.map(session => (
                  <Card key={session.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                          <p className="text-sm text-gray-600">Led by {session.instructor}</p>
                        </div>
                        <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200">
                          {session.modality}
                        </Badge>
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
            </TabsContent>

            <TabsContent value="compliance" className="mt-6">
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

                <Card className="border border-green-200 bg-green-50 shadow-sm">
                  <CardContent className="p-5 space-y-3">
                    <Badge className="bg-green-100 text-green-700 border border-green-200">Policy Spotlight</Badge>
                    <h3 className="text-base font-semibold text-green-900">
                      Students can only book treatment rooms for ProCell services.
                    </h3>
                    <p className="text-sm text-green-800">
                      Ensure your apprentices select “ProCell” in the room booking form and have a Director or Manager approval on file before scheduling services.
                    </p>
                    <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                      <Link href="/studio/room-booking">Review Booking Policy</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <div className="grid gap-5 md:grid-cols-2">
                {RESOURCE_LIBRARY.map(resource => (
                  <Card key={resource.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        <h3 className="text-base font-semibold text-gray-900">{resource.title}</h3>
                        {resource.badge && (
                          <Badge className="bg-gray-100 text-gray-700 border border-gray-200">{resource.badge}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={resource.href}>Open Resource</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                <Card className="border border-purple-200 bg-purple-50">
                  <CardContent className="p-5 space-y-3">
                    <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                      Need Help?
                    </Badge>
                    <h3 className="text-base font-semibold text-purple-900">Training support from Directors & HR</h3>
                    <p className="text-sm text-purple-800 leading-relaxed">
                      Owners and Directors can adjust permissions, sign off competencies, and generate compliance reports directly from the Studio Team hub.
                    </p>
                    <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Link href="/studio/team">Manage Team Permissions</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  )
}
