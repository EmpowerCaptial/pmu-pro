"use client"

import { useState, useRef, useEffect, ChangeEvent, FormEvent, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  BookOpen,
  GraduationCap,
  Video,
  Upload,
  CalendarCheck,
  Users,
  ClipboardList,
  CheckCircle2,
  PenSquare,
  Download,
  Eye,
  FileText,
  ArrowRight,
  PlayCircle,
  MessageSquare,
  UserCircle
} from 'lucide-react'

interface SMPModule {
  id: string
  title: string
  description: string
  content: string[]
  order: number
}

const SMP_MODULES: SMPModule[] = [
  {
    id: 'welcome',
    title: 'Welcome to MicroBarber™ Academy',
    description: 'Your step-by-step SMP system for precision, restraint, and repeatable results',
    order: 1,
    content: [
      'Welcome to MicroBarberTM Academy',
      'Congratulations on beginning your journey into the field of Scalp Micropigmentation (SMP)—a specialized, fast-growing solution in the world of hair loss. At Universal Beauty Studio Academy, we are committed to delivering education that is practical, thorough, and rooted in real-world experience, so you can confidently create natural, lasting results for your clients.',
      'This workbook is your training guide and professional reference. Inside, you\'ll find:',
      '• The science of skin and hair, including anatomy, pigment behaviour, and hair loss conditions.',
      '• Step-by-step SMP techniques: mapping, needle selection, depth control, layering, and blending.',
      '• Guidance on hairline design and density planning for natural, customized results.',
      '• Client protocols: consultations, contraindications, pain management, aftercare, and healing.',
      '• Essential business foundations: pricing, consent protocols, marketing strategies, and systems for growth.',
      'Use this resource both in class for structured learning and afterwards as a reference tool as you begin working with clients.',
      'We\'re proud to guide you through this certification and excited to see how you\'ll use these skills to build a successful SMP career.'
    ]
  },
  {
    id: 'what-is-smp',
    title: 'What is SMP?',
    description: 'Understanding Scalp Micropigmentation',
    order: 2,
    content: [
      'Scalp MicroPigmentation (SMP) is a non-surgical cosmetic tattoo procedure that replicates the appearance of natural hair follicles on the scalp. By carefully implanting pigment into the upper dermis, SMP creates the look of a short buzz cut, adds density to thinning hair, and camouflages scars or areas of hair loss.',
      'Unlike traditional tattooing, SMP is performed with specialized equipment, pigments, and techniques designed specifically for the scalp. The result is subtle, realistic, and long-lasting.',
      'SMP can be life-changing for clients dealing with:',
      '• Male or female pattern baldness',
      '• Alopecia (all types)',
      '• Thinning or diffuse hair',
      '• Scarring from injury or transplant',
      '• Desire for a sharper or more youthful hairline',
      'By the end of this course, you\'ll understand not only how to perform SMP, but also how to tailor it to each client\'s needs — giving them confidence and a renewed sense of self.'
    ]
  },
  {
    id: 'course-overview',
    title: 'Course Overview',
    description: 'Foundations Certification in Scalp Micropigmentation',
    order: 3,
    content: [
      'This Foundations Certification in Scalp Micropigmentation (SMP) blends theory, hands-on practice, and business training to give you the skills, confidence, and systems to launch your SMP career.',
      'What You\'ll Learn:',
      '• Core Theory: Skin anatomy, hair biology, colour theory, pigment behaviour.',
      '• Techniques: Machine setup, needle choices, depth, angle, spacing, layering.',
      '• Design Skills: Hairline types, density planning, blending, scar camouflage.',
      '• Client Care: Consultations, contraindications, pain management, aftercare.',
      '• Business Essentials: Pricing, scripts, marketing, waivers & consent.',
      'What You Can Do After:',
      '• Perform full SMP procedures for hair loss.',
      '• Design natural, customized hairlines for any face shape.',
      '• Apply the 3-layer technique for depth and realism.',
      '• Blend SMP seamlessly with natural hair.',
      '• Advise clients on expectations, aftercare, and maintenance.',
      '• Start and grow your SMP business with confidence.',
      'Outcome: Graduate with SMP Certification, hands-on practice, and a clear path to offering SMP as a professional service.'
    ]
  }
]

const STEP_BY_STEP_PATH = [
  {
    step: 1,
    title: 'Introduce Yourself',
    description: 'Do this first',
    instructions: [
      'Comment below with:',
      '• Name + location',
      '• Background (barber / PMU / tattoo / beginner)',
      '• Your goal (what do you want SMP to do for you?)'
    ]
  },
  {
    step: 2,
    title: 'Go to Classroom',
    description: 'Watch the Welcome lessons',
    instructions: [
      'Turn CC on for subtitles',
      'Watch the Welcome lessons so you understand:',
      '• how the course is structured',
      '• how to practice properly'
    ]
  },
  {
    step: 3,
    title: 'Download the Student Workbooks',
    description: 'Use it while you watch',
    instructions: [
      'Use it while you watch. Don't just watch videos — do the reps.'
    ]
  },
  {
    step: 4,
    title: 'Start with Paper Exercises & Planning',
    description: 'Train your eye + plan before you ever touch skin',
    instructions: [
      'Go to the Paper Exercises & Planning category and post:',
      '• hairline sketches (straight / soft / receded / winged)',
      '• session plans (Session 1 / 2 / 3)',
      '• blending + spacing maps',
      '• depth intention notes',
      'Purpose: train your eye + plan before you ever touch skin.'
    ]
  },
  {
    step: 5,
    title: 'Move to Practice Skins',
    description: 'Build control without pressure',
    instructions: [
      'Go to Practice Skins and post your reps:',
      '• session 1 / 2 / 3 practice passes',
      '• hairline reps',
      '• blending and transitions',
      '• spacing + depth control',
      'Purpose: build control without pressure.'
    ]
  },
  {
    step: 6,
    title: 'Graduate to Mannequin Work',
    description: 'Combine everything into realistic outcomes',
    instructions: [
      'Go to Mannequin Work and post:',
      '• complete hairlines',
      '• full looks / full sessions',
      '• multi-session progress pics',
      '• density work (if applicable)',
      'Purpose: combine everything into realistic outcomes.'
    ]
  },
  {
    step: 7,
    title: 'Ask Questions Anytime',
    description: 'Get help when you need it',
    instructions: [
      "If you're stuck, post your work and ask:",
      '• "What should I focus on next?"',
      '• "Is my spacing too tight/loose?"',
      '• "Does this hairline read natural?"'
    ]
  }
]

export default function SMPTrainingPortal() {
  const { currentUser } = useDemoAuth()
  const [activeTab, setActiveTab] = useState<'student' | 'instructor'>('student')
  const [selectedModule, setSelectedModule] = useState<string>('welcome')

  const userRole = currentUser?.role?.toLowerCase() || 'guest'
  const canManageContent = ['owner', 'director', 'manager', 'hr', 'staff', 'admin', 'instructor'].includes(userRole)

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

  const currentModule = SMP_MODULES.find(m => m.id === selectedModule) || SMP_MODULES[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <NavBar currentPath="/training/smp" user={user} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-20">
        {/* Hero Section */}
        <Card className="bg-gradient-to-br from-slate-700 via-slate-600 to-gray-700 text-white overflow-hidden shadow-xl mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="max-w-4xl">
              <Badge className="bg-white/20 text-white border-white/30 mb-3">
                <GraduationCap className="h-4 w-4 mr-1" /> Advanced Course
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif mb-3">
                Scalp Micropigmentation (SMP) Certification
              </h1>
              <p className="text-lg text-slate-100 leading-relaxed mb-4">
                Welcome in. This is a step-by-step SMP system built for precision, restraint, and repeatable results. Follow this order and you\'ll progress fast.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/20 text-white">40 CPD Hours</Badge>
                <Badge className="bg-white/20 text-white">Self-Paced</Badge>
                <Badge className="bg-white/20 text-white">Advanced Level</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'student' | 'instructor')} className="space-y-6">
          <TabsList className="bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Student Portal
            </TabsTrigger>
            {canManageContent && (
              <TabsTrigger value="instructor" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Instructor Console
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="student" className="space-y-6">
            {/* Step-by-Step Path */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Your Step-By-Step Path</CardTitle>
                <CardDescription>Use the course this way</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {STEP_BY_STEP_PATH.map((step) => (
                  <Card key={step.step} className="border-l-4 border-l-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 italic">{step.description}</p>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {step.instructions.map((instruction, idx) => (
                              <li key={idx} className={instruction.startsWith('•') ? 'ml-4' : ''}>
                                {instruction}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Course Modules */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Course Modules</CardTitle>
                <CardDescription>Work through each module in order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {SMP_MODULES.map((module) => (
                    <Card
                      key={module.id}
                      className={`cursor-pointer transition-all ${
                        selectedModule === module.id
                          ? 'border-slate-600 bg-slate-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                      onClick={() => setSelectedModule(module.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-slate-600 text-white">Module {module.order}</Badge>
                          {selectedModule === module.id && (
                            <CheckCircle2 className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Module Content */}
                {currentModule && (
                  <Card className="mt-6 border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">{currentModule.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentModule.content.map((paragraph, idx) => (
                        <p key={idx} className="text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Key Topics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-600" />
                    Hairline Design
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Learn to create natural, customized hairlines for any face shape. Master straight, round, and winged styles with proper diffusion.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Module
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <PenSquare className="h-5 w-5 text-slate-600" />
                    SMP Techniques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Master needle selection, depth control, spacing, layering, and blending techniques for realistic results.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Module
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-600" />
                    Client Protocols
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Learn consultations, contraindications, pain management, aftercare, and healing protocols.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Module
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-slate-600" />
                    Treatment Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Understand the 3-session approach: Foundation, Density, and Refinement for complete results.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Module
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-600" />
                    Depth & Needles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Learn proper depth placement (upper dermis), needle gauge selection, and how to avoid blowouts.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Module
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-slate-600" />
                    Business Foundations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Pricing strategies, consent protocols, marketing, and systems for growing your SMP business.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Module
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Resources */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Student Resources</CardTitle>
                <CardDescription>Download workbooks and reference materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/library?category=training">
                      <Download className="h-4 w-4 mr-2" />
                      Download Student Workbook
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/library?category=training">
                      <Video className="h-4 w-4 mr-2" />
                      Access Video Library
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {canManageContent && (
            <TabsContent value="instructor" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Instructor Console</CardTitle>
                  <CardDescription>Manage SMP course content and student progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Upload course materials, track student progress, and manage assignments for the SMP certification program.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Course Materials
                    </Button>
                    <Button variant="outline" className="w-full">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      View Student Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}

