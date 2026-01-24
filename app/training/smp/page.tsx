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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Trash2,
  ArrowLeft,
  Plus
} from 'lucide-react'
import { upload } from '@vercel/blob/client'
import { DiscussionBoard } from '@/components/training/discussion-board'
import { VideoPlayer } from '@/components/training/video-player'

type SMPCategory = 
  | 'hairline-design'
  | 'smp-techniques'
  | 'client-protocols'
  | 'treatment-sessions'
  | 'depth-needles'
  | 'business-foundations'

interface SMPModule {
  id: string
  title: string
  description: string
  content: string[]
  order: number
  category: SMPCategory
  coverImage?: string
  subModules?: Array<{
    id: string
    title: string
    description?: string
  }>
}

const CATEGORIES: Record<SMPCategory, { label: string; description: string }> = {
  'hairline-design': {
    label: 'Hairline Design',
    description: 'Learn to create natural, customized hairlines for any face shape. Master straight, round, and winged styles with proper diffusion.'
  },
  'smp-techniques': {
    label: 'SMP Techniques',
    description: 'Master needle selection, depth control, spacing, layering, and blending techniques for realistic results.'
  },
  'client-protocols': {
    label: 'Client Protocols',
    description: 'Learn consultations, contraindications, pain management, aftercare, and healing protocols.'
  },
  'treatment-sessions': {
    label: 'Treatment Sessions',
    description: 'Understand the 3-session approach: Foundation, Density, and Refinement for complete results.'
  },
  'depth-needles': {
    label: 'Depth & Needles',
    description: 'Learn proper depth placement (upper dermis), needle gauge selection, and how to avoid blowouts.'
  },
  'business-foundations': {
    label: 'Business Foundations',
    description: 'Pricing strategies, consent protocols, marketing, and systems for growing your SMP business.'
  }
}

const SMP_MODULES: SMPModule[] = [
  {
    id: 'welcome',
    title: 'Welcome to MicroBarber™ Academy',
    description: 'Your step-by-step SMP system for precision, restraint, and repeatable results',
    category: 'business-foundations',
    order: 1,
    coverImage: undefined, // Can be set to a URL later
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
    category: 'business-foundations',
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
    category: 'business-foundations',
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
    category: 'client-protocols',
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
    category: 'client-protocols',
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
    category: 'business-foundations',
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
    category: 'smp-techniques',
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
    category: 'hairline-design',
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
    category: 'hairline-design',
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
    category: 'hairline-design',
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
    category: 'treatment-sessions',
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
    category: 'smp-techniques',
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
    category: 'smp-techniques',
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
    category: 'hairline-design',
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
    category: 'depth-needles',
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
    category: 'depth-needles',
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
    category: 'depth-needles',
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
    category: 'client-protocols',
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
    category: 'treatment-sessions',
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
    category: 'smp-techniques',
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
    category: 'treatment-sessions',
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
    category: 'treatment-sessions',
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
    category: 'treatment-sessions',
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
    category: 'treatment-sessions',
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
    category: 'treatment-sessions',
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
  category?: string
  coverImageUrl?: string
}

export default function SMPTrainingPortal() {
  const { currentUser } = useDemoAuth()
  const [activeTab, setActiveTab] = useState<'student' | 'instructor'>('student')
  const [selectedModule, setSelectedModule] = useState<string>('welcome')
  const [expandedCategory, setExpandedCategory] = useState<SMPCategory | null>(null)
  
  // Helper function to get modules by category
  const getModulesByCategory = (category: SMPCategory) => {
    return SMP_MODULES.filter(module => module.category === category).sort((a, b) => a.order - b.order)
  }
  
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
  const [videoCategory, setVideoCategory] = useState<SMPCategory | ''>('')
  const [videoCoverImage, setVideoCoverImage] = useState<File | null>(null)
  const [videoCoverImageUrl, setVideoCoverImageUrl] = useState<string | null>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [isUploadingCoverImage, setIsUploadingCoverImage] = useState(false)
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null)
  const [videoUploadSuccess, setVideoUploadSuccess] = useState<string | null>(null)
  const [smpVideos, setSmpVideos] = useState<SMPVideo[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  // Video edit state
  const [editingVideo, setEditingVideo] = useState<SMPVideo | null>(null)
  const [editVideoTitle, setEditVideoTitle] = useState('')
  const [editVideoDescription, setEditVideoDescription] = useState('')
  const [editVideoUrl, setEditVideoUrl] = useState('')
  const [editVideoDuration, setEditVideoDuration] = useState('')
  const [editVideoCategory, setEditVideoCategory] = useState<SMPCategory | ''>('')
  const [editVideoCoverImage, setEditVideoCoverImage] = useState<File | null>(null)
  const [editVideoCoverImageUrl, setEditVideoCoverImageUrl] = useState<string | null>(null)
  const [isEditingVideo, setIsEditingVideo] = useState(false)
  const [isUploadingEditCover, setIsUploadingEditCover] = useState(false)
  const editCoverImageInputRef = useRef<HTMLInputElement>(null)
  // Video player state
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null)
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false)

  // Assignment state
  interface SMPAssignment {
    id: string
    title: string
    description: string
    dueDate: string
    status: 'pending' | 'submitted' | 'graded'
    rubric?: string
    estimatedHours?: number
    moduleId: string
    dueDateISO?: string | null
    isPersisted?: boolean
  }
  
  const [moduleAssignments, setModuleAssignments] = useState<Record<string, SMPAssignment[]>>({})
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false)
  const [assignmentError, setAssignmentError] = useState<string | null>(null)
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null)
  const [openRubricId, setOpenRubricId] = useState<string | null>(null)
  const [assignmentPendingUpload, setAssignmentPendingUpload] = useState<SMPAssignment | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  
  // Assignment creation state
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('')
  const [newAssignmentDescription, setNewAssignmentDescription] = useState('')
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('')
  const [newAssignmentModuleId, setNewAssignmentModuleId] = useState<string>('')
  const [newAssignmentHours, setNewAssignmentHours] = useState<string>('')
  const [newAssignmentRubric, setNewAssignmentRubric] = useState('')
  const [isSavingAssignment, setIsSavingAssignment] = useState(false)
  
  // Assignment edit state
  const [editingAssignment, setEditingAssignment] = useState<SMPAssignment | null>(null)
  const [editAssignmentTitle, setEditAssignmentTitle] = useState('')
  const [editAssignmentDescription, setEditAssignmentDescription] = useState('')
  const [editAssignmentDueDate, setEditAssignmentDueDate] = useState('')
  const [editAssignmentHours, setEditAssignmentHours] = useState<string>('')
  const [editAssignmentRubric, setEditAssignmentRubric] = useState('')
  const [isEditAssignmentDialogOpen, setIsEditAssignmentDialogOpen] = useState(false)
  
  // Assignment delete state
  const [assignmentPendingDelete, setAssignmentPendingDelete] = useState<{ assignment: SMPAssignment; moduleId: string } | null>(null)
  const [isDeleteAssignmentDialogOpen, setIsDeleteAssignmentDialogOpen] = useState(false)
  const [deleteAssignmentConfirmText, setDeleteAssignmentConfirmText] = useState('')
  const [deleteAssignmentError, setDeleteAssignmentError] = useState<string | null>(null)
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false)

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
      const response = await fetch('/api/training/videos', {
        headers: {
          'x-user-email': currentUser.email
        }
      })
      if (response.ok) {
        const data = await response.json()
        // Filter for SMP training videos (those with category matching SMP categories)
        const videos = (data.videos || []).filter((v: any) => 
          v.category && Object.keys(CATEGORIES).includes(v.category)
        ).map((v: any) => ({
          id: v.id,
          title: v.title,
          url: v.url,
          description: v.description,
          videoType: v.videoType || 'url',
          uploadedAt: v.uploadedAt,
          uploadedBy: v.uploadedBy,
          category: v.category,
          coverImageUrl: v.coverImageUrl
        }))
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

  // Fetch assignments for SMP modules
  const fetchAssignments = useCallback(async () => {
    if (!currentUser?.email) return
    
    setIsLoadingAssignments(true)
    setAssignmentError(null)
    try {
      const response = await fetch('/api/training/assignments', {
        headers: {
          'x-user-email': currentUser.email
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to load assignments')
      }
      
      const data = await response.json()
      // Filter assignments for SMP modules (weekId will contain module IDs for SMP)
      const assignments: SMPAssignment[] = (data.assignments || [])
        .filter((a: any) => SMP_MODULES.some(m => m.id === a.weekId))
        .map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description || '',
          dueDate: a.dueDateLabel || 'Due date shared in class',
          dueDateISO: a.dueDateISO || null,
          status: (a.status || 'pending') as 'pending' | 'submitted' | 'graded',
          estimatedHours: a.estimatedHours ?? undefined,
          rubric: a.rubric ?? undefined,
          moduleId: a.weekId, // Using weekId to store moduleId
          isPersisted: true
        }))
      
      // Group assignments by moduleId
      const grouped: Record<string, SMPAssignment[]> = {}
      assignments.forEach(assignment => {
        if (!grouped[assignment.moduleId]) {
          grouped[assignment.moduleId] = []
        }
        grouped[assignment.moduleId].push(assignment)
      })
      
      setModuleAssignments(grouped)
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
      setAssignmentError(error instanceof Error ? error.message : 'Failed to load assignments')
    } finally {
      setIsLoadingAssignments(false)
    }
  }, [currentUser?.email])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  // Assignment CRUD handlers
  const handleCreateAssignment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!currentUser?.email || !canEditAssignments) {
      setAssignmentError('You do not have permission to create assignments.')
      return
    }

    if (!newAssignmentTitle.trim()) {
      setAssignmentError('Please enter an assignment title.')
      return
    }

    if (!newAssignmentModuleId) {
      setAssignmentError('Please select a module for this assignment.')
      return
    }

    setIsSavingAssignment(true)
    setAssignmentError(null)
    setAssignmentSuccess(null)

    try {
      const response = await fetch('/api/training/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          weekId: newAssignmentModuleId, // Using weekId field to store moduleId
          title: newAssignmentTitle.trim(),
          description: newAssignmentDescription.trim() || '',
          dueDateLabel: newAssignmentDueDate.trim() || 'Due date shared in class',
          dueDateISO: newAssignmentDueDate ? new Date(newAssignmentDueDate).toISOString() : null,
          status: 'pending',
          estimatedHours: newAssignmentHours ? parseFloat(newAssignmentHours) : null,
          rubric: newAssignmentRubric.trim() || null
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create assignment')
      }

      setAssignmentSuccess('Assignment created successfully!')
      setNewAssignmentTitle('')
      setNewAssignmentDescription('')
      setNewAssignmentDueDate('')
      setNewAssignmentModuleId('')
      setNewAssignmentHours('')
      setNewAssignmentRubric('')
      await fetchAssignments()
    } catch (error) {
      console.error('Failed to create assignment:', error)
      setAssignmentError(error instanceof Error ? error.message : 'Failed to create assignment')
    } finally {
      setIsSavingAssignment(false)
    }
  }

  const openEditAssignmentDialog = (assignment: SMPAssignment, moduleId: string) => {
    if (!canEditAssignments) return
    setEditingAssignment(assignment)
    setEditAssignmentTitle(assignment.title)
    setEditAssignmentDescription(assignment.description)
    setEditAssignmentDueDate(assignment.dueDateISO ? new Date(assignment.dueDateISO).toISOString().split('T')[0] : '')
    setEditAssignmentHours(assignment.estimatedHours?.toString() || '')
    setEditAssignmentRubric(assignment.rubric || '')
    setAssignmentError(null)
    setAssignmentSuccess(null)
    setIsEditAssignmentDialogOpen(true)
  }

  const closeEditAssignmentDialog = () => {
    setEditingAssignment(null)
    setEditAssignmentTitle('')
    setEditAssignmentDescription('')
    setEditAssignmentDueDate('')
    setEditAssignmentHours('')
    setEditAssignmentRubric('')
    setAssignmentError(null)
    setAssignmentSuccess(null)
    setIsEditAssignmentDialogOpen(false)
  }

  const handleUpdateAssignment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!currentUser?.email || !editingAssignment || !canEditAssignments) {
      setAssignmentError('You do not have permission to update assignments.')
      return
    }

    setIsSavingAssignment(true)
    setAssignmentError(null)
    setAssignmentSuccess(null)

    try {
      const response = await fetch(`/api/training/assignments/${editingAssignment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          weekId: editingAssignment.moduleId,
          title: editAssignmentTitle.trim(),
          description: editAssignmentDescription.trim() || '',
          dueDateLabel: editAssignmentDueDate.trim() || 'Due date shared in class',
          dueDateISO: editAssignmentDueDate ? new Date(editAssignmentDueDate).toISOString() : null,
          estimatedHours: editAssignmentHours ? parseFloat(editAssignmentHours) : null,
          rubric: editAssignmentRubric.trim() || null
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update assignment')
      }

      setAssignmentSuccess('Assignment updated successfully!')
      closeEditAssignmentDialog()
      await fetchAssignments()
    } catch (error) {
      console.error('Failed to update assignment:', error)
      setAssignmentError(error instanceof Error ? error.message : 'Failed to update assignment')
    } finally {
      setIsSavingAssignment(false)
    }
  }

  const openDeleteAssignmentDialog = (assignment: SMPAssignment, moduleId: string) => {
    if (!canEditAssignments) return
    setAssignmentError(null)
    setAssignmentSuccess(null)
    setAssignmentPendingDelete({ assignment, moduleId })
    setDeleteAssignmentConfirmText('')
    setDeleteAssignmentError(null)
    setIsDeleteAssignmentDialogOpen(true)
  }

  const handleDeleteAssignment = async () => {
    if (!assignmentPendingDelete || !currentUser?.email) return
    
    setIsDeletingAssignment(true)
    setDeleteAssignmentError(null)

    try {
      const response = await fetch(`/api/training/assignments/${assignmentPendingDelete.assignment.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser.email
        }
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete assignment')
      }

      setAssignmentSuccess('Assignment deleted successfully!')
      setIsDeleteAssignmentDialogOpen(false)
      setAssignmentPendingDelete(null)
      setDeleteAssignmentConfirmText('')
      await fetchAssignments()
    } catch (error) {
      console.error('Failed to delete assignment:', error)
      setDeleteAssignmentError(error instanceof Error ? error.message : 'Failed to delete assignment')
    } finally {
      setIsDeletingAssignment(false)
    }
  }

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

  // Cover Image Upload Handler
  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setVideoUploadError('Please select an image file for the cover.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setVideoUploadError('Cover image must be less than 5 MB.')
      return
    }

    setVideoCoverImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setVideoCoverImageUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
    setVideoUploadError(null)
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

    if (!videoCategory) {
      setVideoUploadError('Please select a category for this video.')
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

    let coverImageUrl: string | null = null

    // Upload cover image if provided
    if (videoCoverImage && currentUser.email) {
      setIsUploadingCoverImage(true)
      try {
        const normalizedTitle = videoTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const fileName = `video-cover-${normalizedTitle}-${Date.now()}.${videoCoverImage.name.split('.').pop()}`
        const userIdentifier = currentUser.id || currentUser.email.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'user'
        const pathname = `resource-library/${userIdentifier}/${fileName}`

        const clientPayload = JSON.stringify({
          title: `Cover: ${videoTitle}`,
          category: 'training',
          fileSize: videoCoverImage.size,
          originalFilename: videoCoverImage.name
        })

        const blob = await upload(pathname, videoCoverImage, {
          access: 'public',
          contentType: videoCoverImage.type,
          handleUploadUrl: '/api/resource-library',
          headers: {
            'x-user-email': currentUser.email
          },
          clientPayload
        })

        coverImageUrl = blob.url
      } catch (error) {
        console.error('Failed to upload cover image:', error)
        setVideoUploadError('Failed to upload cover image. Please try again.')
        setIsUploadingVideo(false)
        setIsUploadingCoverImage(false)
        return
      } finally {
        setIsUploadingCoverImage(false)
      }
    }

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
          durationLabel: videoDuration.trim() || undefined,
          category: videoCategory,
          coverImageUrl: coverImageUrl || undefined
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
      setVideoCategory('')
      setVideoCoverImage(null)
      setVideoCoverImageUrl(null)
      if (coverImageInputRef.current) {
        coverImageInputRef.current.value = ''
      }
      await fetchSMPVideos()
    } catch (error) {
      console.error('Failed to save video URL:', error)
      setVideoUploadError(error instanceof Error ? error.message : 'Failed to save the video URL.')
    } finally {
      setIsUploadingVideo(false)
    }
  }

  // Edit Video Handlers
  const handleEditCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setVideoUploadError('Please select an image file for the cover.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setVideoUploadError('Cover image must be less than 5 MB.')
      return
    }

    setEditVideoCoverImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setEditVideoCoverImageUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
    setVideoUploadError(null)
  }

  const handleEditVideoSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!currentUser?.email || !editingVideo) {
      setVideoUploadError('You must be logged in to edit videos.')
      return
    }

    const trimmedUrl = editVideoUrl.trim()
    const trimmedTitle = editVideoTitle.trim()

    if (!trimmedUrl) {
      setVideoUploadError('Please enter a video URL.')
      return
    }

    if (!trimmedTitle) {
      setVideoUploadError('Please enter a video title.')
      return
    }

    if (!editVideoCategory) {
      setVideoUploadError('Please select a category for this video.')
      return
    }

    try {
      new URL(trimmedUrl)
    } catch {
      setVideoUploadError('Please enter a valid URL.')
      return
    }

    setIsEditingVideo(true)
    setVideoUploadError(null)
    setVideoUploadSuccess(null)

    let coverImageUrl: string | null = editVideoCoverImageUrl

    // Upload new cover image if provided
    if (editVideoCoverImage && currentUser.email) {
      setIsUploadingEditCover(true)
      try {
        const normalizedTitle = editVideoTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const fileName = `video-cover-${normalizedTitle}-${Date.now()}.${editVideoCoverImage.name.split('.').pop()}`
        const userIdentifier = currentUser.id || currentUser.email.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'user'
        const pathname = `resource-library/${userIdentifier}/${fileName}`

        const clientPayload = JSON.stringify({
          title: `Cover: ${editVideoTitle}`,
          category: 'training',
          fileSize: editVideoCoverImage.size,
          originalFilename: editVideoCoverImage.name
        })

        const blob = await upload(pathname, editVideoCoverImage, {
          access: 'public',
          contentType: editVideoCoverImage.type,
          handleUploadUrl: '/api/resource-library',
          headers: {
            'x-user-email': currentUser.email
          },
          clientPayload
        })

        coverImageUrl = blob.url
      } catch (error) {
        console.error('Failed to upload cover image:', error)
        setVideoUploadError('Failed to upload cover image. Please try again.')
        setIsEditingVideo(false)
        setIsUploadingEditCover(false)
        return
      } finally {
        setIsUploadingEditCover(false)
      }
    }

    try {
      const response = await fetch(`/api/training/videos/${editingVideo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          title: trimmedTitle + ' (SMP Training)',
          url: trimmedUrl,
          description: (editVideoDescription.trim() || 'SMP training video') + ' - SMP Training Course',
          durationLabel: editVideoDuration.trim() || undefined,
          category: editVideoCategory,
          coverImageUrl: coverImageUrl || undefined
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update video.')
      }

      setVideoUploadSuccess('Video updated successfully!')
      setEditingVideo(null)
      setEditVideoTitle('')
      setEditVideoDescription('')
      setEditVideoUrl('')
      setEditVideoDuration('')
      setEditVideoCategory('')
      setEditVideoCoverImage(null)
      setEditVideoCoverImageUrl(null)
      if (editCoverImageInputRef.current) {
        editCoverImageInputRef.current.value = ''
      }
      await fetchSMPVideos()
    } catch (error) {
      console.error('Failed to update video:', error)
      setVideoUploadError(error instanceof Error ? error.message : 'Failed to update the video.')
    } finally {
      setIsEditingVideo(false)
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
            {/* Return to Training Hub */}
            <div className="flex justify-start">
              <Button variant="outline" asChild className="text-slate-600 border-slate-200 hover:bg-slate-50">
                <Link href="/training">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Training HUB
                </Link>
              </Button>
            </div>

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

            {/* Course Modules by Category */}
            {(Object.keys(CATEGORIES) as SMPCategory[]).map((categoryKey) => {
              const category = CATEGORIES[categoryKey]
              const modules = getModulesByCategory(categoryKey)
              const isExpanded = expandedCategory === categoryKey
              
              return (
                <Card key={categoryKey} data-category={categoryKey} className="border-slate-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">{category.label}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedCategory(isExpanded ? null : categoryKey)}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        {isExpanded ? 'Hide Modules' : `View Modules (${modules.length})`}
                      </Button>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                        {modules.map((module) => (
                          <Card
                            key={module.id}
                            className={`cursor-pointer transition-all overflow-hidden ${
                              selectedModule === module.id
                                ? 'border-slate-600 bg-slate-50 shadow-md'
                                : 'border-slate-200 hover:border-slate-400'
                            }`}
                            onClick={() => setSelectedModule(module.id)}
                          >
                            {module.coverImage && (
                              <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                                <img
                                  src={module.coverImage}
                                  alt={module.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                <div className="absolute top-2 right-2">
                                  <Badge className="bg-slate-600 text-white">Module {module.order}</Badge>
                                </div>
                                {selectedModule === module.id && (
                                  <div className="absolute top-2 left-2">
                                    <CheckCircle2 className="h-5 w-5 text-white drop-shadow-lg" />
                                  </div>
                                )}
                                <h3 className="absolute bottom-4 left-4 right-4 font-semibold text-white text-sm drop-shadow-lg">
                                  {module.title}
                                </h3>
                              </div>
                            )}
                            {!module.coverImage && (
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <Badge className="bg-slate-600 text-white">Module {module.order}</Badge>
                                  {selectedModule === module.id && (
                                    <CheckCircle2 className="h-5 w-5 text-slate-600" />
                                  )}
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
                                <p className="text-sm text-gray-600">{module.description}</p>
                                {module.subModules && module.subModules.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-slate-200">
                                    <p className="text-xs text-slate-600">
                                      {module.subModules.length} lesson{module.subModules.length !== 1 ? 's' : ''} included
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>

                      {/* Module Content */}
                      {selectedModule && modules.find(m => m.id === selectedModule) && currentModule && (
                        <Card className="border-slate-200 bg-slate-50">
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
                            
                            {/* Videos for this category */}
                            {(() => {
                              const categoryVideos = smpVideos.filter(v => v.category === categoryKey)
                              return categoryVideos.length > 0 ? (
                                <div className="mt-6 pt-6 border-t border-slate-200">
                                  <h4 className="font-semibold text-gray-900 mb-3">Instructional Videos</h4>
                                  <div className="space-y-2">
                                    {categoryVideos.map(video => (
                                      <Card key={video.id} className="border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                        <CardContent className="p-0">
                                          <div className="flex flex-col sm:flex-row">
                                            {video.coverImageUrl ? (
                                              <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-slate-100 flex-shrink-0">
                                                <img
                                                  src={video.coverImageUrl}
                                                  alt={video.title}
                                                  className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                                  <PlayCircle className="h-12 w-12 text-white opacity-0 hover:opacity-100 transition-opacity drop-shadow-lg" />
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                <Video className="h-12 w-12 text-slate-400" />
                                              </div>
                                            )}
                                            <div className="flex-1 p-4 flex flex-col">
                                              <div className="flex items-start gap-2 mb-2">
                                                {!video.coverImageUrl && <Video className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />}
                                                <div className="flex-1 min-w-0">
                                                  <h5 className="text-sm font-semibold text-gray-900 mb-1">{video.title}</h5>
                                                </div>
                                              </div>
                                              {video.description && (
                                                <p className="text-xs text-gray-600 mb-3 flex-1">{video.description}</p>
                                              )}
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  setSelectedVideo({ url: video.url, title: video.title })
                                                  setVideoPlayerOpen(true)
                                                }}
                                                className="text-slate-600 border-slate-200 hover:bg-slate-50 w-full sm:w-auto self-start"
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
                              ) : null
                            })()}
                            
                            {currentModule.subModules && currentModule.subModules.length > 0 && (
                              <div className="mt-6 pt-6 border-t border-slate-200">
                                <h4 className="font-semibold text-gray-900 mb-3">Sub-Modules in this Section:</h4>
                                <div className="grid gap-3 md:grid-cols-2">
                                  {currentModule.subModules.map((subModule) => (
                                    <Card key={subModule.id} className="border-slate-200 bg-white">
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
                            
                            {/* Assignments for this module */}
                            {(() => {
                              const moduleAssignmentsList = moduleAssignments[selectedModule] || []
                              return moduleAssignmentsList.length > 0 ? (
                                <div className="mt-6 pt-6 border-t border-slate-200">
                                  <h4 className="font-semibold text-gray-900 mb-3">Module Assignments</h4>
                                  <div className="space-y-3">
                                    {moduleAssignmentsList.map(assignment => (
                                      <Card key={assignment.id} className="border border-slate-200 shadow-sm">
                                        <CardContent className="p-4 space-y-3">
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div>
                                              <h5 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-slate-600" />
                                                {assignment.title}
                                              </h5>
                                              <p className="text-sm text-gray-600 leading-relaxed mt-1">{assignment.description}</p>
                                            </div>
                                            <Badge
                                              className={
                                                assignment.status === 'graded'
                                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                                  : assignment.status === 'submitted'
                                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                                              }
                                            >
                                              {assignment.status === 'graded' && 'Graded'}
                                              {assignment.status === 'submitted' && 'Submitted'}
                                              {assignment.status === 'pending' && 'Pending'}
                                            </Badge>
                                          </div>
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span>{assignment.dueDate}</span>
                                              {assignment.estimatedHours !== undefined && assignment.estimatedHours > 0 && (
                                                <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
                                                  ~{assignment.estimatedHours} hrs
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  setAssignmentPendingUpload(assignment)
                                                  setUploadDialogOpen(true)
                                                }}
                                              >
                                                <Upload className="h-4 w-4 mr-1" /> Upload Work
                                              </Button>
                                              {assignment.rubric && (
                                                <Button
                                                  size="sm"
                                                  variant="secondary"
                                                  onClick={() =>
                                                    setOpenRubricId(prev => (prev === assignment.id ? null : assignment.id))
                                                  }
                                                >
                                                  <Eye className="h-4 w-4 mr-1" />
                                                  {openRubricId === assignment.id ? 'Hide Rubric' : 'View Rubric'}
                                                </Button>
                                              )}
                                            </div>
                                          </div>
                                          {assignment.rubric && openRubricId === assignment.id && (
                                            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 whitespace-pre-line">
                                              {assignment.rubric}
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              ) : null
                            })()}
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}

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

                {/* Video Library - Grouped by Category */}
                {isLoadingVideos && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                    Loading videos...
                  </div>
                )}
                {!isLoadingVideos && smpVideos.length === 0 && (
                  <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 text-center">
                    No videos available yet. Instructors will add video links here.
                  </div>
                )}
                {!isLoadingVideos && smpVideos.length > 0 && (
                  <div className="mt-4 space-y-6">
                    {(Object.keys(CATEGORIES) as SMPCategory[]).map((categoryKey) => {
                      const categoryVideos = smpVideos.filter(v => v.category === categoryKey)
                      if (categoryVideos.length === 0) return null
                      
                      return (
                        <div key={categoryKey}>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            {CATEGORIES[categoryKey].label} Videos
                          </h3>
                          <div className="space-y-2">
                            {categoryVideos.map(video => (
                              <Card key={video.id} className="border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                <CardContent className="p-0">
                                  <div className="flex flex-col sm:flex-row">
                                    {video.coverImageUrl ? (
                                      <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-slate-100 flex-shrink-0">
                                        <img
                                          src={video.coverImageUrl}
                                          alt={video.title}
                                          className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                          <PlayCircle className="h-12 w-12 text-white opacity-0 hover:opacity-100 transition-opacity drop-shadow-lg" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <Video className="h-12 w-12 text-slate-400" />
                                      </div>
                                    )}
                                    <div className="flex-1 p-4 flex flex-col">
                                      <div className="flex items-start gap-2 mb-2">
                                        {!video.coverImageUrl && <Video className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-sm font-semibold text-gray-900 mb-1">{video.title}</h4>
                                        </div>
                                      </div>
                                      {video.description && (
                                        <p className="text-xs text-gray-600 mb-3 flex-1">{video.description}</p>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(video.url, '_blank', 'noopener,noreferrer')}
                                        className="text-slate-600 border-slate-200 hover:bg-slate-50 w-full sm:w-auto self-start"
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
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {canManageContent && (
            <TabsContent value="instructor" className="space-y-6">
              {/* Return to Training Hub */}
              <div className="flex justify-start">
                <Button variant="outline" asChild className="text-slate-600 border-slate-200 hover:bg-slate-50">
                  <Link href="/training">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Training HUB
                  </Link>
                </Button>
              </div>

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
                      <Label htmlFor="video-category">Category *</Label>
                      <Select
                        value={videoCategory}
                        onValueChange={(value: SMPCategory) => {
                          setVideoCategory(value)
                          setVideoUploadError(null)
                        }}
                        required
                      >
                        <SelectTrigger id="video-category">
                          <SelectValue placeholder="Select a category for this video" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(CATEGORIES) as SMPCategory[]).map((categoryKey) => (
                            <SelectItem key={categoryKey} value={categoryKey}>
                              {CATEGORIES[categoryKey].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        This determines which module category the video will appear in for students
                      </p>
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
                      <Label htmlFor="video-cover-image">Cover Image (optional)</Label>
                      <div className="space-y-2">
                        <Input
                          id="video-cover-image"
                          type="file"
                          accept="image/*"
                          ref={coverImageInputRef}
                          onChange={handleCoverImageChange}
                          className="cursor-pointer"
                        />
                        {videoCoverImageUrl && (
                          <div className="relative w-full h-48 border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                            <img
                              src={videoCoverImageUrl}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setVideoCoverImage(null)
                                setVideoCoverImageUrl(null)
                                if (coverImageInputRef.current) {
                                  coverImageInputRef.current.value = ''
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          Upload a cover image for students to see (max 5 MB). Recommended size: 1280x720px
                        </p>
                      </div>
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
                      disabled={isUploadingVideo || isUploadingCoverImage || !videoTitle.trim() || !videoUrl.trim() || !videoCategory}
                    >
                      {isUploadingVideo || isUploadingCoverImage ? (
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
                              onClick={() => {
                                setSelectedVideo({ url: video.url, title: video.title })
                                setVideoPlayerOpen(true)
                              }}
                              className="text-slate-600 border-slate-200 hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {canManageContent && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingVideo(video)
                                  setEditVideoTitle(video.title.replace(' (SMP Training)', ''))
                                  setEditVideoDescription(video.description?.replace(' - SMP Training Course', '') || '')
                                  setEditVideoUrl(video.url)
                                  setEditVideoDuration('')
                                  setEditVideoCategory((video.category as SMPCategory) || '')
                                  setEditVideoCoverImageUrl(video.coverImageUrl || null)
                                  setEditVideoCoverImage(null)
                                }}
                                className="text-slate-600 border-slate-200 hover:bg-slate-50"
                              >
                                <PenSquare className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assignment Management Section */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Module Assignments</CardTitle>
                  <CardDescription>Create and manage assignments for each module</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {assignmentError && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {assignmentError}
                    </div>
                  )}
                  {assignmentSuccess && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                      {assignmentSuccess}
                    </div>
                  )}
                  
                  {/* Create Assignment Form */}
                  <form onSubmit={handleCreateAssignment} className="space-y-4">
                    <div>
                      <Label htmlFor="assignment-module">Module *</Label>
                      <Select
                        value={newAssignmentModuleId}
                        onValueChange={setNewAssignmentModuleId}
                        required
                      >
                        <SelectTrigger id="assignment-module">
                          <SelectValue placeholder="Select a module" />
                        </SelectTrigger>
                        <SelectContent>
                          {SMP_MODULES.map(module => (
                            <SelectItem key={module.id} value={module.id}>
                              {module.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="assignment-title">Assignment Title *</Label>
                      <Input
                        id="assignment-title"
                        placeholder="e.g., Hairline Design Practice"
                        value={newAssignmentTitle}
                        onChange={(e) => setNewAssignmentTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="assignment-description">Description</Label>
                      <Textarea
                        id="assignment-description"
                        rows={3}
                        placeholder="Describe what students need to complete..."
                        value={newAssignmentDescription}
                        onChange={(e) => setNewAssignmentDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="assignment-due-date">Due Date (optional)</Label>
                        <Input
                          id="assignment-due-date"
                          type="date"
                          value={newAssignmentDueDate}
                          onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="assignment-hours">Estimated Hours (optional)</Label>
                        <Input
                          id="assignment-hours"
                          type="number"
                          step="0.5"
                          min="0"
                          placeholder="e.g., 2.5"
                          value={newAssignmentHours}
                          onChange={(e) => setNewAssignmentHours(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="assignment-rubric">Rubric/Grading Criteria (optional)</Label>
                      <Textarea
                        id="assignment-rubric"
                        rows={4}
                        placeholder="Enter grading criteria, point breakdown, or evaluation standards..."
                        value={newAssignmentRubric}
                        onChange={(e) => setNewAssignmentRubric(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-slate-600 hover:bg-slate-700 text-white"
                      disabled={isSavingAssignment || !newAssignmentTitle.trim() || !newAssignmentModuleId}
                    >
                      {isSavingAssignment ? (
                        <>
                          <Upload className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Assignment
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Existing Assignments */}
                  {isLoadingAssignments && (
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                      Loading assignments...
                    </div>
                  )}
                  {!isLoadingAssignments && Object.keys(moduleAssignments).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Existing Assignments</h4>
                      {Object.entries(moduleAssignments).map(([moduleId, assignments]) => {
                        const module = SMP_MODULES.find(m => m.id === moduleId)
                        if (!module || assignments.length === 0) return null
                        return (
                          <div key={moduleId} className="space-y-2">
                            <h5 className="text-sm font-medium text-gray-700">{module.title}</h5>
                            {assignments.map(assignment => (
                              <Card key={assignment.id} className="border border-slate-200">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <h6 className="font-semibold text-gray-900">{assignment.title}</h6>
                                      {assignment.description && (
                                        <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                                      )}
                                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                                        <span>{assignment.dueDate}</span>
                                        {assignment.estimatedHours && (
                                          <span>~{assignment.estimatedHours} hrs</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openEditAssignmentDialog(assignment, moduleId)}
                                      >
                                        <PenSquare className="h-4 w-4 mr-1" />
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => openDeleteAssignmentDialog(assignment, moduleId)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Assignment Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
              <DialogDescription>
                {assignmentPendingUpload
                  ? `Submit your work for "${assignmentPendingUpload.title}"`
                  : 'Submit your assignment work'}
              </DialogDescription>
            </DialogHeader>
            {assignmentPendingUpload && (
              <div className="space-y-4">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-900">{assignmentPendingUpload.title}</p>
                  {assignmentPendingUpload.description && (
                    <p className="text-sm text-gray-600">{assignmentPendingUpload.description}</p>
                  )}
                  <p className="text-xs text-gray-500">Due: {assignmentPendingUpload.dueDate}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    To submit your assignment, email your work to the instructor:
                  </p>
                  <Button asChild className="w-full bg-slate-600 hover:bg-slate-700 text-white">
                    <Link href={`mailto:Instructor@universalbeautystudio.com?subject=SMP Training Assignment Submission: ${encodeURIComponent(assignmentPendingUpload.title)}`}>
                      <Upload className="h-4 w-4 mr-2" />
                      Email Instructor
                    </Link>
                  </Button>
                  <p className="text-xs text-gray-500">
                    Attach your files (photos, documents, etc.) to the email. Include your name and the assignment title in the email body.
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Assignment Dialog */}
        <Dialog open={isEditAssignmentDialogOpen} onOpenChange={(open) => {
          if (!open) {
            closeEditAssignmentDialog()
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
              <DialogDescription>Update assignment details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateAssignment} className="space-y-4">
              <div>
                <Label htmlFor="edit-assignment-title">Assignment Title *</Label>
                <Input
                  id="edit-assignment-title"
                  value={editAssignmentTitle}
                  onChange={(e) => setEditAssignmentTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-assignment-description">Description</Label>
                <Textarea
                  id="edit-assignment-description"
                  rows={3}
                  value={editAssignmentDescription}
                  onChange={(e) => setEditAssignmentDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="edit-assignment-due-date">Due Date (optional)</Label>
                  <Input
                    id="edit-assignment-due-date"
                    type="date"
                    value={editAssignmentDueDate}
                    onChange={(e) => setEditAssignmentDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-assignment-hours">Estimated Hours (optional)</Label>
                  <Input
                    id="edit-assignment-hours"
                    type="number"
                    step="0.5"
                    min="0"
                    value={editAssignmentHours}
                    onChange={(e) => setEditAssignmentHours(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-assignment-rubric">Rubric/Grading Criteria (optional)</Label>
                <Textarea
                  id="edit-assignment-rubric"
                  rows={4}
                  value={editAssignmentRubric}
                  onChange={(e) => setEditAssignmentRubric(e.target.value)}
                />
              </div>
              {assignmentError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {assignmentError}
                </div>
              )}
              {assignmentSuccess && (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {assignmentSuccess}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeEditAssignmentDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingAssignment} className="bg-slate-600 hover:bg-slate-700 text-white">
                  {isSavingAssignment ? 'Updating...' : 'Update Assignment'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Assignment Dialog */}
        <Dialog open={isDeleteAssignmentDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsDeleteAssignmentDialogOpen(false)
            setAssignmentPendingDelete(null)
            setDeleteAssignmentConfirmText('')
            setDeleteAssignmentError(null)
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Assignment</DialogTitle>
              <DialogDescription>
                {assignmentPendingDelete
                  ? `This will permanently remove "${assignmentPendingDelete.assignment.title}" from the module.`
                  : 'This will permanently remove the selected assignment.'}
              </DialogDescription>
            </DialogHeader>
            {assignmentPendingDelete && (
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  Type <span className="font-semibold text-gray-900">"{assignmentPendingDelete.assignment.title}"</span> to confirm deletion.
                </p>
                <Input
                  value={deleteAssignmentConfirmText}
                  onChange={(e) => setDeleteAssignmentConfirmText(e.target.value)}
                  placeholder={assignmentPendingDelete.assignment.title}
                />
                {deleteAssignmentError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {deleteAssignmentError}
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteAssignmentDialogOpen(false)
                  setAssignmentPendingDelete(null)
                  setDeleteAssignmentConfirmText('')
                  setDeleteAssignmentError(null)
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={
                  !assignmentPendingDelete ||
                  deleteAssignmentConfirmText.trim() !== assignmentPendingDelete.assignment.title ||
                  isDeletingAssignment
                }
                onClick={handleDeleteAssignment}
              >
                {isDeletingAssignment ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Video Dialog */}
        <Dialog open={!!editingVideo} onOpenChange={(open) => !open && setEditingVideo(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Video</DialogTitle>
              <DialogDescription>Update video information and category</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditVideoSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-video-title">Video Title *</Label>
                <Input
                  id="edit-video-title"
                  placeholder="e.g., SMP Hairline Design Basics"
                  value={editVideoTitle}
                  onChange={(e) => {
                    setEditVideoTitle(e.target.value)
                    setVideoUploadError(null)
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-video-category">Category *</Label>
                <Select
                  value={editVideoCategory}
                  onValueChange={(value: SMPCategory) => {
                    setEditVideoCategory(value)
                    setVideoUploadError(null)
                  }}
                  required
                >
                  <SelectTrigger id="edit-video-category">
                    <SelectValue placeholder="Select a category for this video" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORIES) as SMPCategory[]).map((categoryKey) => (
                      <SelectItem key={categoryKey} value={categoryKey}>
                        {CATEGORIES[categoryKey].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  This determines which module category the video will appear in for students
                </p>
              </div>
              <div>
                <Label htmlFor="edit-video-url">Video URL *</Label>
                <Input
                  id="edit-video-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  value={editVideoUrl}
                  onChange={(e) => {
                    setEditVideoUrl(e.target.value)
                    setVideoUploadError(null)
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-video-cover-image">Cover Image (optional)</Label>
                <div className="space-y-2">
                  <Input
                    id="edit-video-cover-image"
                    type="file"
                    accept="image/*"
                    ref={editCoverImageInputRef}
                    onChange={handleEditCoverImageChange}
                    className="cursor-pointer"
                  />
                  {editVideoCoverImageUrl && (
                    <div className="relative w-full h-48 border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                      <img
                        src={editVideoCoverImageUrl}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setEditVideoCoverImage(null)
                          setEditVideoCoverImageUrl(null)
                          if (editCoverImageInputRef.current) {
                            editCoverImageInputRef.current.value = ''
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Upload a new cover image to replace the existing one (max 5 MB). Recommended size: 1280x720px
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-video-description">Description (optional)</Label>
                <Textarea
                  id="edit-video-description"
                  rows={3}
                  placeholder="Brief description of the video content..."
                  value={editVideoDescription}
                  onChange={(e) => setEditVideoDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-video-duration">Duration (optional)</Label>
                <Input
                  id="edit-video-duration"
                  placeholder="e.g., 45 min"
                  value={editVideoDuration}
                  onChange={(e) => setEditVideoDuration(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingVideo(null)
                    setEditVideoTitle('')
                    setEditVideoDescription('')
                    setEditVideoUrl('')
                    setEditVideoDuration('')
                    setEditVideoCategory('')
                    setEditVideoCoverImage(null)
                    setEditVideoCoverImageUrl(null)
                    setVideoUploadError(null)
                    setVideoUploadSuccess(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-slate-600 hover:bg-slate-700 text-white"
                  disabled={isEditingVideo || isUploadingEditCover || !editVideoTitle.trim() || !editVideoUrl.trim() || !editVideoCategory}
                >
                  {isEditingVideo || isUploadingEditCover ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <PenSquare className="h-4 w-4 mr-2" />
                      Update Video
                    </>
                  )}
                </Button>
              </div>
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
          </DialogContent>
        </Dialog>

        {/* Video Player Dialog */}
        {selectedVideo && (
          <VideoPlayer
            url={selectedVideo.url}
            title={selectedVideo.title}
            open={videoPlayerOpen}
            onClose={() => {
              setVideoPlayerOpen(false)
              setSelectedVideo(null)
            }}
          />
        )}
      </main>
    </div>
  )
}

