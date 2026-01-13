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
  UserCircle,
  Trash2
} from 'lucide-react'
import { upload } from '@vercel/blob/client'
import { DiscussionBoard } from '@/components/training/discussion-board'

interface SMPModule {
  id: string
  title: string
  description: string
  content: string[]
  order: number
  subModules?: Array<{
    id: string
    title: string
    description?: string
  }>
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
      "What You'll Learn:",
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
  },
  {
    id: 'tools-equipment',
    title: 'Tools & Equipment for SMP',
    description: 'Your SMP Toolkit Explained',
    order: 4,
    subModules: [
      { id: 'tools-overview', title: 'Tools & Equipment Overview' },
      { id: 'tattoo-machine-safety', title: 'Tattoo Machine Safety' },
      { id: 'practice-supplies', title: 'Practice Supplies & Equipment – Quick Reference' }
    ],
    content: [
      'Your SMP toolkit consists of specialized equipment designed for precision and safety.',
      'Essential tools include: SMP machine or pen, needles, pigments, practice skins, mannequins, and sanitization supplies.',
      'Understanding your equipment is the foundation of professional SMP work.'
    ]
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions (FAQ)',
    description: 'Frequently Asked Questions Explained',
    order: 5,
    content: [
      'Common questions about SMP pricing, sessions, healing, and maintenance are covered in this module.',
      'Understanding client concerns and having clear answers builds trust and sets proper expectations.'
    ]
  },
  {
    id: 'business-smp',
    title: 'The Business of SMP',
    description: 'Pricing, marketing, and growing your SMP practice',
    order: 6,
    content: [
      'Learn how to price your services, market your SMP practice, and build a sustainable business.',
      'This module covers client consultations, consent protocols, and systems for growth.'
    ]
  },
  {
    id: 'trichology',
    title: 'Trichology: The Science of Hair Loss',
    description: 'Introduction to Trichology',
    order: 7,
    subModules: [
      { id: 'trichology-intro', title: 'Introduction to Trichology' },
      { id: 'hair-loss-anatomy', title: 'Hair Loss & Skin Anatomy Explained' }
    ],
    content: [
      'Trichology is the study of hair and scalp health. Understanding hair loss patterns, skin anatomy, and the science behind hair growth is essential for creating realistic SMP results.',
      'This module covers the biological foundations that inform your SMP technique.'
    ]
  },
  {
    id: 'hairlines-part1',
    title: 'Hairlines Part 1: Shapes & Fundamentals',
    description: 'Introduction to Hairlines',
    order: 8,
    subModules: [
      { id: 'hairline-intro', title: 'Introduction to Hairlines' },
      { id: 'hairline-shapes', title: 'Hairline Shapes & Design Basics' },
      { id: 'straight-hairline-paper', title: 'Drawing a Straight Hairline on Paper' },
      { id: 'round-hairline-paper', title: 'Drawing a Round Hairline on Paper' },
      { id: 'winged-hairline-paper', title: 'Drawing a Winged Hairline on Paper' }
    ],
    content: [
      'Hairline design is where artistry meets technique. Learn the three fundamental shapes: Straight, Round, and Winged.',
      'Start with paper exercises to train your eye and develop muscle memory before moving to practice skins.'
    ]
  },
  {
    id: 'hairlines-part2',
    title: 'Hairlines Part 2: Mannequin Practice',
    description: 'Introduction to Hairlines Level 2',
    order: 9,
    subModules: [
      { id: 'hairline-level2-intro', title: 'Introduction to Hairlines Level 2' },
      { id: 'straight-hairline-mannequin', title: 'Drawing a Straight Hairline on a Mannequin' },
      { id: 'round-hairline-mannequin', title: 'Drawing a Round Hairline on a Mannequin' },
      { id: 'winged-hairline-mannequin', title: 'Drawing a Winged Hairline on a Mannequin' }
    ],
    content: [
      'Progress from paper to mannequin work. Practice creating hairlines on a 3D surface to develop spatial awareness and technique.',
      'This builds the foundation for working on real clients.'
    ]
  },
  {
    id: 'female-hairlines',
    title: 'Designing Female Hairlines',
    description: 'Introduction to Female Hairlines',
    order: 10,
    subModules: [
      { id: 'female-hairline-intro', title: 'Introduction to Female Hairlines' },
      { id: 'female-hairline-principles', title: 'Female Hairline Shapes & Design Principles' }
    ],
    content: [
      'Female hairlines require different techniques than male hairlines. Learn the softer, more rounded approach needed for natural feminine results.',
      'Key differences include higher placement, softer diffusion, and rounded temple transitions.'
    ]
  },
  {
    id: 'layering-sessions',
    title: 'Layering & Sessions',
    description: 'Introduction to Sessions & Layering',
    order: 11,
    subModules: [
      { id: 'sessions-intro', title: 'Introduction to Sessions & Layering' },
      { id: 'smp-builds-sessions', title: 'How SMP Builds Across Sessions' },
      { id: 'paper-exercise-1', title: 'Paper Exercise 1: Foundation Layer' },
      { id: 'paper-exercise-2', title: 'Paper Exercise 2: Layer Two Development' },
      { id: 'paper-exercise-3', title: 'Paper Exercise 3: Final Layer & Blending' }
    ],
    content: [
      'SMP is built over multiple sessions. Learn the 3-layer technique: Foundation, Density, and Refinement.',
      'Each session builds upon the previous one, allowing for healing, adjustment, and natural-looking results.'
    ]
  },
  {
    id: 'follicle-patterns',
    title: 'Understanding Natural Follicle Patterns',
    description: 'Follicle Flow, Growth Patterns & SMP Design',
    order: 12,
    subModules: [
      { id: 'follicle-patterns-intro', title: 'Follicle Flow, Growth Patterns & SMP Design' },
      { id: 'follicle-patterns-guide', title: 'How Follicle Patterns Guide Your SMP Work' }
    ],
    content: [
      'Every client has a unique follicle pattern. Learn to observe and replicate fine hair, random/diffuse patterns, and coarse/afro textures.',
      'Matching the natural follicle pattern ensures realistic, natural-looking results.'
    ]
  },
  {
    id: 'diffusion',
    title: 'Diffusion: Softness, Blending & Transitions',
    description: 'Introduction to Diffusion',
    order: 13,
    subModules: [
      { id: 'diffusion-intro', title: 'Introduction to Diffusion' },
      { id: 'diffusion-techniques', title: 'Diffusion Techniques: Blending & Feathering' },
      { id: 'diffusion-exercise-1', title: 'Exercise 1: Pigment Gradient' },
      { id: 'diffusion-exercise-2', title: 'Exercise 2: Density Gradient (Dense → Sparse)' },
      { id: 'diffusion-exercise-3', title: 'Exercise 3: Needle Size Gradient' },
      { id: 'diffusion-exercise-4', title: 'Exercise 4: Combination Blend Technique' }
    ],
    content: [
      'Diffusion creates soft, natural transitions at hairlines and blend areas. Master three methods: Pigment Shade, Density, and Needle Gauge.',
      'Proper diffusion makes SMP look natural and allows clients to maintain their style when shaving.'
    ]
  },
  {
    id: 'hairlines-part3',
    title: 'Hairlines Part 3: Diffusion & Soft Transitions',
    description: 'Introduction: Diffusion for Hairlines',
    order: 14,
    subModules: [
      { id: 'hairline-diffusion-intro', title: 'Introduction: Diffusion for Hairlines' },
      { id: 'zero-diffusion-straight', title: 'Zero Diffusion Practice — Straight Hairline' },
      { id: 'medium-diffusion-round', title: 'Medium Diffusion Practice — Round Hairline' },
      { id: 'high-diffusion-winged', title: 'High Diffusion Practice — Winged Hairline' }
    ],
    content: [
      'Apply diffusion techniques to hairlines. Practice Zero, Medium, and High diffusion levels for different hairline styles.',
      'This creates the soft, feathered edges that make SMP look natural.'
    ]
  },
  {
    id: 'smp-needles',
    title: 'Understanding SMP Needles',
    description: 'Introduction to SMP Needles',
    order: 15,
    subModules: [
      { id: 'needles-intro', title: 'Introduction to SMP Needles' },
      { id: 'needle-sizes', title: 'SMP Needle Sizes & When to Use Them' }
    ],
    content: [
      'SMP needles are coded by diameter, count, and type (e.g., 0603RL). Understanding needle terminology is key for consistent results.',
      'Learn which needle configurations work best for different follicle patterns and techniques.'
    ]
  },
  {
    id: 'pigment-depth',
    title: 'Proper Pigment Depth',
    description: 'Introduction to Depth',
    order: 16,
    subModules: [
      { id: 'depth-intro', title: 'Introduction to Depth' },
      { id: 'correct-depth', title: 'Correct Pigment Depth for SMP' },
      { id: 'depth-control-drills', title: 'Depth Control Drills' }
    ],
    content: [
      'Correct depth placement (upper dermis, ~1mm) is critical. Too deep causes blowouts; too shallow causes premature fading.',
      'Master the "short, sharp jab" technique for clean, lasting impressions.'
    ]
  },
  {
    id: 'skin-pigment',
    title: 'Skin Types & Pigment Selection',
    description: 'Introduction to Skin & Pigment',
    order: 17,
    subModules: [
      { id: 'skin-pigment-intro', title: 'Introduction to Skin & Pigment' },
      { id: 'choosing-pigment', title: 'Choosing the Right Pigment for Each Client' },
      { id: 'pigment-cheat-sheet', title: 'Pigment Selection Cheat Sheet' }
    ],
    content: [
      'Understanding the Fitzpatrick scale helps you select the right pigment shade for each client\'s skin type.',
      'Learn to match pigment to skin tone, existing hair color, and desired density for natural results.'
    ]
  },
  {
    id: 'scalp-prep',
    title: 'Preparing the Scalp for SMP',
    description: 'Introduction to Scalp Preparation',
    order: 18,
    subModules: [
      { id: 'scalp-prep-intro', title: 'Introduction to Scalp Preparation' },
      { id: 'how-to-prep', title: 'How to Prep the Scalp for SMP' }
    ],
    content: [
      'Proper scalp preparation ensures clean, safe, and predictable results. Learn the step-by-step prep process for buzzed and density clients.',
      'Includes marking guides, shaving, exfoliation, moisturization, and sanitization protocols.'
    ]
  },
  {
    id: 'sessions-level2',
    title: 'Sessions Level 2: Machine Work on Practice Skin',
    description: 'Introduction to Sessions Level 2',
    order: 19,
    subModules: [
      { id: 'sessions-level2-intro', title: 'Introduction to Sessions Level 2' },
      { id: 'session1-practice-skin', title: 'Session 1: Foundation Layer on Fake Skin' },
      { id: 'session2-practice-skin', title: 'Session 2: Building Layer Two on Fake Skin' },
      { id: 'session3-practice-skin', title: 'Session 3: Final Layer & Blend on Fake Skin' }
    ],
    content: [
      'Progress to machine work on practice skins. Apply the 3-session technique with real equipment.',
      'Practice skins allow you to build muscle memory and technique before working on mannequins or clients.'
    ]
  },
  {
    id: 'diffusion-level2',
    title: 'Diffusion Level 2: Practice Skin',
    description: 'Intro to creating soft, natural diffusion',
    order: 20,
    subModules: [
      { id: 'diffusion-level2-intro', title: 'Intro to creating soft, natural diffusion' },
      { id: 'zero-diffusion-practice', title: 'Exercise 1: Zero Diffusion – Straight Hairline' },
      { id: 'medium-diffusion-practice', title: 'Exercise 2: Medium Diffusion – Round Hairline' },
      { id: 'high-diffusion-practice', title: 'Exercise 3: High Diffusion – Winged Hairline' }
    ],
    content: [
      'Practice diffusion techniques on practice skins. Apply what you learned in paper exercises to machine work.',
      'Master the three diffusion levels for different hairline styles.'
    ]
  },
  {
    id: 'mannequin-straight',
    title: 'Full Mannequin Total Look: Straight Hairline',
    description: 'Introduction to the Straight Hairline Sessions',
    order: 21,
    subModules: [
      { id: 'straight-intro', title: 'Introduction to the Straight Hairline Sessions' },
      { id: 'straight-session1', title: 'Session 1: Straight Hairline – Foundation Layer' },
      { id: 'straight-session2', title: 'Session 2: Second Layer & Density Build' },
      { id: 'straight-session3', title: 'Session 3: Final Layer & Precision Blend' },
      { id: 'straight-session4', title: 'Introducing Session 4: Randomized Diffuse Pattern' },
      { id: 'straight-session4-detail', title: 'Session 4: Randomized Diffuse Follicle Pattern' }
    ],
    content: [
      'Complete a full straight hairline treatment on a mannequin. This combines all techniques into a realistic outcome.',
      'Practice the complete 3-4 session process from foundation to final refinement.'
    ]
  },
  {
    id: 'mannequin-round',
    title: 'Full Mannequin Total Look: Round Hairline',
    description: 'Introduction to the Round Hairline Sessions',
    order: 22,
    subModules: [
      { id: 'round-intro', title: 'Introduction to the Round Hairline Sessions' },
      { id: 'round-session1', title: 'Session 1: Round Hairline – Foundation Layer' },
      { id: 'round-session2', title: 'Session 2: Second Layer & Medium Diffusion' },
      { id: 'round-session3', title: 'Session 3: Refinement & Final Blend' },
      { id: 'round-session4', title: 'Introducing Session 4: Randomized Diffuse Pattern' },
      { id: 'round-session4-detail', title: 'Session 4: Randomized Diffuse Follicle Pattern' }
    ],
    content: [
      'Complete a full round hairline treatment. Round hairlines require softer curves and medium diffusion.',
      'Practice the complete treatment process for this popular hairline style.'
    ]
  },
  {
    id: 'mannequin-winged',
    title: 'Full Mannequin Total Look: Winged Hairline',
    description: 'Introduction to the Winged Hairline Sessions',
    order: 23,
    subModules: [
      { id: 'winged-intro', title: 'Introduction to the Winged Hairline Sessions' },
      { id: 'winged-session1', title: 'Session 1: Winged Hairline – Foundation Layer' },
      { id: 'winged-session2', title: 'Session 2: Second Layer & High Diffusion' },
      { id: 'winged-session3', title: 'Session 3: Refinement & Final Blend' },
      { id: 'winged-session4', title: 'Introducing Session 4: Randomized Diffuse Pattern' },
      { id: 'winged-session4-detail', title: 'Session 4: Randomized Diffuse Follicle Pattern' }
    ],
    content: [
      'Complete a full winged hairline treatment. Winged hairlines feature receded temples and require high diffusion.',
      'Master the angled, receded look that works well for mature clients.'
    ]
  },
  {
    id: 'mannequin-afro',
    title: 'Full Mannequin Total Look: Afro Follicle Pattern',
    description: 'Afro Hair Follicle Pattern Overview',
    order: 24,
    subModules: [
      { id: 'afro-overview', title: 'Afro Hair Follicle Pattern Overview' },
      { id: 'afro-session1', title: 'Session 1: Base Clusters for Afro Texture' },
      { id: 'afro-session2', title: 'Session 2: Expanding the Afro Clusters' },
      { id: 'afro-session3', title: 'Session 3: Final Cluster Build & Refinement' }
    ],
    content: [
      'Afro-textured hair requires a different approach. Learn to create larger gaps and clustered formations using triple-tap techniques.',
      'This pattern mimics the natural look of coarse, coily hair when shaved.'
    ]
  },
  {
    id: 'density-smp',
    title: 'Density SMP (Under Longer Hair)',
    description: 'Understanding Density SMP',
    order: 25,
    subModules: [
      { id: 'density-intro', title: 'Understanding Density SMP' },
      { id: 'density-session1', title: 'Session 1 — Foundation Layer' },
      { id: 'density-session2', title: 'Session 2 — Build & Reinforce Density' },
      { id: 'density-session3', title: 'Session 3 — Refine & Perfect the Blend' }
    ],
    content: [
      'Density SMP adds fullness to thinning hair without requiring a shaved look. Learn to blend SMP seamlessly with existing hair.',
      'This technique requires careful part management and blending to create a natural, undetectable result.'
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
      "Use it while you watch. Don't just watch videos — do the reps."
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

interface SMPVideo {
  id: string
  title: string
  url: string
  description?: string
  videoType: 'file' | 'url'
  uploadedAt?: string
  uploadedBy?: string
}

export default function SMPTrainingPortal() {
  const { currentUser } = useDemoAuth()
  const [activeTab, setActiveTab] = useState<'student' | 'instructor'>('student')
  const [selectedModule, setSelectedModule] = useState<string>('welcome')
  
  // PDF Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfFileName, setPdfFileName] = useState<string | null>(null)
  const [isUploadingPdf, setIsUploadingPdf] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  
  // Video URL Upload State
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [videoDuration, setVideoDuration] = useState('')
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null)
  const [videoUploadSuccess, setVideoUploadSuccess] = useState<string | null>(null)
  const [smpVideos, setSmpVideos] = useState<SMPVideo[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)

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

  // Fetch SMP videos
  const fetchSMPVideos = useCallback(async () => {
    if (!currentUser?.email) return
    
    setIsLoadingVideos(true)
    try {
      const response = await fetch('/api/training/videos')
      if (response.ok) {
        const data = await response.json()
        // Filter for SMP training videos (those with fileType containing 'smp' or all training videos)
        const videos = (data.videos || []).filter((v: any) => 
          v.title?.toLowerCase().includes('smp') || 
          v.description?.toLowerCase().includes('smp') ||
          v.fileType?.includes('smp')
        )
        setSmpVideos(videos)
      }
    } catch (error) {
      console.error('Failed to fetch SMP videos:', error)
    } finally {
      setIsLoadingVideos(false)
    }
  }, [currentUser?.email])

  useEffect(() => {
    if (activeTab === 'student') {
      fetchSMPVideos()
    }
  }, [activeTab, fetchSMPVideos])

  // PDF Upload Handlers
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      setPdfFile(null)
      setPdfFileName(null)
      return
    }

    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF document.')
      setPdfFile(null)
      setPdfFileName(null)
      return
    }

    if (file.size > 150 * 1024 * 1024) {
      setUploadError('PDF file size must be less than 150 MB.')
      setPdfFile(null)
      setPdfFileName(null)
      return
    }

    setUploadError(null)
    setUploadSuccess(null)
    setPdfFile(file)
    setPdfFileName(file.name)
  }

  const handlePdfUpload = async () => {
    if (!pdfFile || !currentUser?.email) {
      setUploadError('Please select a PDF file and ensure you are logged in.')
      return
    }

    setIsUploadingPdf(true)
    setUploadError(null)
    setUploadSuccess(null)
    setUploadProgress(0)

    try {
      const normalizedTitle = pdfFileName?.replace(/\.pdf$/i, '').trim() || 'SMP Training Resource'
      const safeSegment = normalizedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const fileName = `${safeSegment || 'smp-resource'}-${Date.now()}.pdf`
      const userIdentifier = currentUser.id || currentUser.email.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'user'
      const pathname = `resource-library/${userIdentifier}/${fileName}`

      const clientPayload = JSON.stringify({
        title: normalizedTitle,
        category: 'training',
        fileSize: pdfFile.size,
        originalFilename: pdfFile.name
      })

      await upload(pathname, pdfFile, {
        access: 'public',
        contentType: 'application/pdf',
        handleUploadUrl: '/api/resource-library',
        headers: {
          'x-user-email': currentUser.email
        },
        clientPayload,
        multipart: pdfFile.size > 15 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage))
      })

      setUploadSuccess('PDF uploaded successfully! It is now available in the resource library for students.')
      setPdfFile(null)
      setPdfFileName(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('PDF upload failed:', error)
      const message = error instanceof Error ? error.message : 'Failed to upload PDF'
      setUploadError(message)
    } finally {
      setIsUploadingPdf(false)
      setUploadProgress(null)
    }
  }

  // Video URL Upload Handler
  const handleVideoUrlSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!currentUser?.email) {
      setVideoUploadError('You must be logged in to upload videos.')
      return
    }

    const trimmedUrl = videoUrl.trim()
    const trimmedTitle = videoTitle.trim()

    if (!trimmedUrl) {
      setVideoUploadError('Please enter a video URL.')
      return
    }

    if (!trimmedTitle) {
      setVideoUploadError('Please enter a video title.')
      return
    }

    try {
      new URL(trimmedUrl)
    } catch {
      setVideoUploadError('Please enter a valid URL.')
      return
    }

    setIsUploadingVideo(true)
    setVideoUploadError(null)
    setVideoUploadSuccess(null)

    try {
      const response = await fetch('/api/training/videos/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          title: trimmedTitle + ' (SMP Training)',
          url: trimmedUrl,
          description: (videoDescription.trim() || 'SMP training video') + ' - SMP Training Course',
          durationLabel: videoDuration.trim() || undefined
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save video URL.')
      }

      setVideoUploadSuccess('Video URL saved successfully!')
      setVideoUrl('')
      setVideoTitle('')
      setVideoDescription('')
      setVideoDuration('')
      await fetchSMPVideos()
    } catch (error) {
      console.error('Failed to save video URL:', error)
      setVideoUploadError(error instanceof Error ? error.message : 'Failed to save the video URL.')
    } finally {
      setIsUploadingVideo(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

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
                <CardDescription>Work through each module in order - click to view details</CardDescription>
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
                        <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                        {module.subModules && module.subModules.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              {module.subModules.length} sub-module{module.subModules.length !== 1 ? 's' : ''}:
                            </p>
                            <ul className="text-xs text-gray-600 space-y-0.5">
                              {module.subModules.slice(0, 3).map((sub) => (
                                <li key={sub.id} className="flex items-center gap-1">
                                  <span className="text-slate-500">•</span>
                                  <span className="truncate">{sub.title}</span>
                                </li>
                              ))}
                              {module.subModules.length > 3 && (
                                <li className="text-slate-500 italic">
                                  +{module.subModules.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Module Content */}
                {currentModule && (
                  <Card className="mt-6 border-slate-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">{currentModule.title}</CardTitle>
                          <CardDescription className="mt-1">{currentModule.description}</CardDescription>
                        </div>
                        <Badge className="bg-slate-600 text-white">Module {currentModule.order}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentModule.content.map((paragraph, idx) => (
                        <p key={idx} className="text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                      
                      {currentModule.subModules && currentModule.subModules.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                          <h4 className="font-semibold text-gray-900 mb-3">Sub-Modules in this Section:</h4>
                          <div className="grid gap-3 md:grid-cols-2">
                            {currentModule.subModules.map((subModule) => (
                              <Card key={subModule.id} className="border-slate-200 bg-slate-50">
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <h5 className="font-medium text-sm text-gray-900">{subModule.title}</h5>
                                      {subModule.description && (
                                        <p className="text-xs text-gray-600 mt-1">{subModule.description}</p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
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

            {/* Discussion Board */}
            <DiscussionBoard programId="smp" />

            {/* Resources */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Student Resources</CardTitle>
                <CardDescription>Download workbooks and watch instructional videos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/library?category=training">
                      <Download className="h-4 w-4 mr-2" />
                      Download Student Workbook
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/library?category=training">
                      <FileText className="h-4 w-4 mr-2" />
                      View All Resources
                    </Link>
                  </Button>
                </div>

                {/* Video Library */}
                {isLoadingVideos && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                    Loading videos...
                  </div>
                )}
                {smpVideos.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Instructional Videos</h3>
                    <div className="space-y-2">
                      {smpVideos.map(video => (
                        <Card key={video.id} className="border border-slate-200">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Video className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 mb-1">{video.title}</h4>
                                {video.description && (
                                  <p className="text-xs text-gray-600 mb-2">{video.description}</p>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(video.url, '_blank', 'noopener,noreferrer')}
                                  className="text-slate-600 border-slate-200 hover:bg-slate-50"
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Watch Video
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {!isLoadingVideos && smpVideos.length === 0 && (
                  <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 text-center">
                    No videos available yet. Instructors will add video links here.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {canManageContent && (
            <TabsContent value="instructor" className="space-y-6">
              {/* Upload PDF Section */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Upload Student Resources</CardTitle>
                  <CardDescription>Upload PDF workbooks and materials for students to download</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="smp-pdf-upload">Upload PDF Workbook</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Upload PDF workbooks, slide decks, or reference materials. Students will download these from the resource library.
                      </p>
                      <div className="space-y-2">
                        <input
                          ref={fileInputRef}
                          id="smp-pdf-upload"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingPdf}
                          className="w-full"
                        >
                          {isUploadingPdf ? (
                            <>
                              <Upload className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Select PDF
                            </>
                          )}
                        </Button>
                        {pdfFile && !isUploadingPdf && (
                          <Button
                            type="button"
                            onClick={handlePdfUpload}
                            className="bg-slate-600 hover:bg-slate-700 text-white w-full"
                            disabled={isUploadingPdf}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload to Library
                          </Button>
                        )}
                        {uploadProgress !== null && (
                          <div className="space-y-1">
                            <Progress value={uploadProgress} className="h-2" />
                            <span className="text-xs text-gray-600">{uploadProgress}% uploaded</span>
                          </div>
                        )}
                        {pdfFileName ? (
                          <span className="text-xs font-medium text-gray-800">
                            Selected: {pdfFileName}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600">No PDF selected yet.</span>
                        )}
                        <p className="text-xs text-gray-600">
                          Max file size 150 MB. Uploaded PDFs become available in the resource library for students.
                        </p>
                        {uploadError && (
                          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            {uploadError}
                          </div>
                        )}
                        {uploadSuccess && (
                          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                            {uploadSuccess}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Video URL Section */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Upload Video Links</CardTitle>
                  <CardDescription>Add video URLs (YouTube, Vimeo, etc.) for students to watch</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVideoUrlSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="video-title">Video Title *</Label>
                      <Input
                        id="video-title"
                        placeholder="e.g., SMP Hairline Design Basics"
                        value={videoTitle}
                        onChange={(e) => {
                          setVideoTitle(e.target.value)
                          setVideoUploadError(null)
                        }}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-url">Video URL *</Label>
                      <Input
                        id="video-url"
                        type="url"
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                        value={videoUrl}
                        onChange={(e) => {
                          setVideoUrl(e.target.value)
                          setVideoUploadError(null)
                        }}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-description">Description (optional)</Label>
                      <Textarea
                        id="video-description"
                        rows={3}
                        placeholder="Brief description of the video content..."
                        value={videoDescription}
                        onChange={(e) => setVideoDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-duration">Duration (optional)</Label>
                      <Input
                        id="video-duration"
                        placeholder="e.g., 45 min"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-slate-600 hover:bg-slate-700 text-white"
                      disabled={isUploadingVideo || !videoTitle.trim() || !videoUrl.trim()}
                    >
                      {isUploadingVideo ? (
                        <>
                          <Upload className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Video className="h-4 w-4 mr-2" />
                          Save Video Link
                        </>
                      )}
                    </Button>
                    {videoUploadError && (
                      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {videoUploadError}
                      </div>
                    )}
                    {videoUploadSuccess && (
                      <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                        {videoUploadSuccess}
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* List of Uploaded Videos */}
              {smpVideos.length > 0 && (
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">Uploaded Videos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {smpVideos.map(video => (
                        <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 border border-slate-200 rounded">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-slate-600 flex-shrink-0" />
                              <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                              <Badge variant="outline" className="text-xs">URL</Badge>
                            </div>
                            {video.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{video.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                              {video.uploadedAt && <span>Uploaded: {formatDateTime(video.uploadedAt)}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(video.url, '_blank', 'noopener,noreferrer')}
                              className="text-slate-600 border-slate-200 hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}

