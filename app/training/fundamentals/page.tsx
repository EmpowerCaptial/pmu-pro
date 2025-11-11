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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { upload } from '@vercel/blob/client'
import {
  BookOpen,
  FileText,
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
  Trash2
} from 'lucide-react'
import { TRAINING_LESSON_PLANS } from '@/data/training-lesson-plan'

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded'
  rubric?: string
  estimatedHours?: number
  weekId?: string
  dueDateISO?: string | null
  isPersisted?: boolean
}

interface LectureVideo {
  id: string
  title: string
  duration: string
  description: string
  url: string
  fileSize?: number
  uploadedAt?: string
  uploadedBy?: string
}

interface CourseWeek {
  id: string
  order: number
  title: string
  summary: string
  targetHours: number
  assignments: Assignment[]
}

const COURSE_WEEKS: CourseWeek[] = [
  {
    id: 'week-1',
    order: 1,
    title: 'Week 1 • Orientation & Safety Foundations',
    summary: 'Orientation, OSHA/BBP review, sanitation rituals, workstation setup, and client intake basics.',
    targetHours: 10,
    assignments: [
      {
        id: 'week1-safety-quiz',
        weekId: 'week-1',
        title: 'Sanitation & Safety Quiz',
        description: 'Demonstrate knowledge of BBP standards, workstation setup, and sterilization requirements.',
        dueDate: 'Due Week 1 Friday',
        status: 'pending',
        rubric: 'Score each section (Sanitation, PPE, Workstation Prep) out of 10. Passing requires 24/30 with no section below 6.',
        estimatedHours: 4
      },
      {
        id: 'week1-workstation-drill',
        weekId: 'week-1',
        title: 'Workstation Setup & BBP Drill',
        description: 'Record your full workstation setup, sanitation reset, and tool breakdown following the studio checklist.',
        dueDate: 'Due Week 1 Sunday',
        status: 'pending',
        rubric: 'Workstation layout (10 pts), sanitation protocol adherence (10 pts), BBP disposal compliance (10 pts). Passing ≥ 25/30.',
        estimatedHours: 6
      }
    ]
  },
  {
    id: 'week-2',
    order: 2,
    title: 'Week 2 • Brow Mapping & Color Theory',
    summary: 'Mapping ratios, facial symmetry, pigment undertones, and Fitzpatrick/skin depth considerations.',
    targetHours: 12,
    assignments: [
      {
        id: 'week2-brow-map',
        weekId: 'week-2',
        title: 'Brow Mapping Practice Upload',
        description: 'Submit before/after photos of brow mapping on practice skin with measurement notes.',
        dueDate: 'Due Week 2 Saturday',
        status: 'pending',
        rubric: 'Landmarks identified (5 pts), symmetry within 1 mm (10 pts), photo clarity (5 pts), notes cite mapping tools (5 pts).',
        estimatedHours: 6
      },
      {
        id: 'week2-pigment-plan',
        weekId: 'week-2',
        title: 'Color Theory Pigment Plan',
        description: 'Build a pigment plan for three skin profiles, including undertone analysis and neutralizer selections.',
        dueDate: 'Due Week 2 Sunday',
        status: 'pending',
        rubric: 'Undertone accuracy (10 pts), pigment justification (10 pts), modifier/neutralizer plan (10 pts).',
        estimatedHours: 6
      }
    ]
  },
  {
    id: 'week-3',
    order: 3,
    title: 'Week 3 • Client Intake & Contraindication Screening',
    summary: 'Consent forms, medical red flags, communication scripts, and risk mitigation planning.',
    targetHours: 11,
    assignments: [
      {
        id: 'week3-contraindication-journal',
        weekId: 'week-3',
        title: 'Contraindication Case Journal',
        description: 'Log three mock consultation scenarios and note go/no-go decisions with supporting evidence.',
        dueDate: 'Due Week 3 Friday',
        status: 'pending',
        rubric: 'Case completeness (10 pts), risk analysis accuracy (10 pts), recommendation clarity (10 pts). Passing ≥ 24/30.',
        estimatedHours: 6
      },
      {
        id: 'week3-intake-roleplay',
        weekId: 'week-3',
        title: 'Intake Form Roleplay Reflection',
        description: 'Complete an intake roleplay with a peer or director and submit your annotated intake form with reflection notes.',
        dueDate: 'Due Week 3 Sunday',
        status: 'pending',
        rubric: 'Form accuracy (10 pts), contraindication follow-up questions (10 pts), reflection depth (10 pts).',
        estimatedHours: 5
      }
    ]
  },
  {
    id: 'week-4',
    order: 4,
    title: 'Week 4 • Machine Technique & Needle Control',
    summary: 'Machine calibration, stroke practice, depth control, and anesthetic protocols.',
    targetHours: 12,
    assignments: [
      {
        id: 'week4-machine-calibration',
        weekId: 'week-4',
        title: 'Machine Calibration Lab Report',
        description: 'Document voltage tests, stroke patterns, and cartridge selections for three procedure types.',
        dueDate: 'Due Week 4 Friday',
        status: 'pending',
        rubric: 'Calibration benchmarks (10 pts), stroke analysis (10 pts), safety notes (10 pts).',
        estimatedHours: 6
      },
      {
        id: 'week4-stroke-practice',
        weekId: 'week-4',
        title: 'Stroke Practice on Latex',
        description: 'Upload photos of stroke patterns on latex skin with notes on needle angle, speed, and depth control.',
        dueDate: 'Due Week 4 Sunday',
        status: 'pending',
        rubric: 'Consistency (10 pts), depth control (10 pts), documentation quality (10 pts).',
        estimatedHours: 6
      }
    ]
  },
  {
    id: 'week-5',
    order: 5,
    title: 'Week 5 • Service Delivery & Client Communication',
    summary: 'Pre/post care, anesthetic strategy, client communication, and emergency protocols.',
    targetHours: 12,
    assignments: [
      {
        id: 'week5-anesthetic-checklist',
        weekId: 'week-5',
        title: 'Anesthetic Protocol Checklist',
        description: 'Create a protocol covering topical vs. secondary anesthetics, including timing and contraindications.',
        dueDate: 'Due Week 5 Friday',
        status: 'pending',
        rubric: 'Protocol completeness (10 pts), timing accuracy (10 pts), contraindication safeguards (10 pts).',
        estimatedHours: 7
      },
      {
        id: 'week5-client-communication',
        weekId: 'week-5',
        title: 'Client Communication Roleplay',
        description: 'Record a mock consultation handling client concerns about pain, healing, and pricing.',
        dueDate: 'Due Week 5 Sunday',
        status: 'pending',
        rubric: 'Empathy & clarity (10 pts), policy alignment (10 pts), follow-up plan (10 pts).',
        estimatedHours: 5
      }
    ]
  },
  {
    id: 'week-6',
    order: 6,
    title: 'Week 6 • Live Model Preparation & Supervision',
    summary: 'Mock procedures, station efficiency, photography standards, and supervised practice readiness.',
    targetHours: 11,
    assignments: [
      {
        id: 'week6-mock-procedure',
        weekId: 'week-6',
        title: 'Mock Procedure Dry Run',
        description: 'Simulate a full procedure on latex or mannequin, including timing, sanitation resets, and documentation.',
        dueDate: 'Due Week 6 Friday',
        status: 'pending',
        rubric: 'Timeline accuracy (10 pts), sanitation resets (10 pts), documentation completeness (10 pts).',
        estimatedHours: 6
      },
      {
        id: 'week6-healing-analysis',
        weekId: 'week-6',
        title: 'Healing Timeline Analysis',
        description: 'Analyze a past model\'s healing photos and produce a touch-up plan with pigment adjustments.',
        dueDate: 'Due Week 6 Sunday',
        status: 'pending',
        rubric: 'Observation detail (10 pts), corrective plan (10 pts), client communication (10 pts).',
        estimatedHours: 5
      }
    ]
  },
  {
    id: 'week-7',
    order: 7,
    title: 'Week 7 • Capstone & Portfolio (Half Week)',
    summary: 'Capstone evaluation, portfolio submission, and exit interview preparation.',
    targetHours: 7,
    assignments: [
      {
        id: 'week7-capstone-eval',
        weekId: 'week-7',
        title: 'Capstone Live Model Evaluation',
        description: 'Complete your supervised live model or detailed case study for capstone review.',
        dueDate: 'Due Week 7 Wednesday',
        status: 'pending',
        rubric: 'Technique execution (15 pts), sanitation compliance (10 pts), client comfort documentation (10 pts).',
        estimatedHours: 4
      },
      {
        id: 'week7-portfolio-exit',
        weekId: 'week-7',
        title: 'Portfolio & Exit Interview Prep',
        description: 'Compile before/after images, reflective journal entries, and submit the exit interview readiness checklist.',
        dueDate: 'Due Week 7 Friday',
        status: 'pending',
        rubric: 'Portfolio completeness (10 pts), reflection insight (10 pts), readiness checklist (10 pts).',
        estimatedHours: 3
      }
    ]
  }
]

const COURSE_TOTAL_HOURS = COURSE_WEEKS.reduce((sum, week) => sum + week.targetHours, 0)

const BASE_WEEKS_TEMPLATE: CourseWeek[] = COURSE_WEEKS.map(week => ({
  ...week,
  assignments: week.assignments.map(assignment => ({
    ...assignment,
    weekId: assignment.weekId || week.id,
    isPersisted: assignment.isPersisted ?? false,
    dueDateISO: assignment.dueDateISO ?? null
  }))
}))

const buildBaseWeeks = (): CourseWeek[] =>
  BASE_WEEKS_TEMPLATE.map(week => ({
    ...week,
    assignments: week.assignments.map(assignment => ({ ...assignment }))
  }))

const LECTURE_VIDEOS: LectureVideo[] = []

const STUDENT_PROGRESS = {
  overallCompletion: 62,
  attendedSessions: 4,
  requiredSessions: 6
}

export default function FundamentalsTrainingPortal() {
  const { currentUser } = useDemoAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [courseWeeks, setCourseWeeks] = useState<CourseWeek[]>(() => buildBaseWeeks())
  const [selectedWeekId, setSelectedWeekId] = useState<string>(() => buildBaseWeeks()[0]?.id ?? '')
  const [activeTab, setActiveTab] = useState<'student' | 'instructor'>('student')
  const [openRubricId, setOpenRubricId] = useState<string | null>(null)
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null)
  const [assignmentError, setAssignmentError] = useState<string | null>(null)
  const [assignmentLoadError, setAssignmentLoadError] = useState<string | null>(null)
  const [isLoadingAssignments, setIsLoadingAssignments] = useState<boolean>(false)
  const [isSavingAssignment, setIsSavingAssignment] = useState<boolean>(false)
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('')
  const [newAssignmentDescription, setNewAssignmentDescription] = useState('')
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('')
  const [newAssignmentWeekId, setNewAssignmentWeekId] = useState<string>(COURSE_WEEKS[0]?.id ?? '')
  const [newAssignmentHours, setNewAssignmentHours] = useState<string>('')
  const [newAssignmentRubric, setNewAssignmentRubric] = useState('')
  const [lectureVideos, setLectureVideos] = useState<LectureVideo[]>(LECTURE_VIDEOS)
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [newVideoTitle, setNewVideoTitle] = useState('')
  const [newVideoDescription, setNewVideoDescription] = useState('')
  const [newVideoDuration, setNewVideoDuration] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null)
  const [videoUploadSuccess, setVideoUploadSuccess] = useState<string | null>(null)
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null)
  const [pdfFileName, setPdfFileName] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [attendanceForm, setAttendanceForm] = useState({ session: '', date: '', notes: '' })
  const [gradeForm, setGradeForm] = useState({ student: '', assignment: '', score: '', feedback: '' })
  const [scheduleForm, setScheduleForm] = useState({ student: '', instructor: '', date: '', time: '', notes: '' })
  const [instructorActivityLog, setInstructorActivityLog] = useState<
    { type: 'attendance' | 'grade' | 'schedule'; title: string; timestamp: string; summary: string }[]
  >([])
  const [instructorActivityBanner, setInstructorActivityBanner] = useState<
    { type: 'success' | 'warning'; message: string } | null
  >(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [videoPendingDelete, setVideoPendingDelete] = useState<LectureVideo | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeletingVideo, setIsDeletingVideo] = useState(false)
  const [isEditAssignmentDialogOpen, setIsEditAssignmentDialogOpen] = useState(false)
  const [assignmentBeingEdited, setAssignmentBeingEdited] = useState<{ assignmentId: string; weekId: string } | null>(null)
  const [editAssignmentTitle, setEditAssignmentTitle] = useState('')
  const [editAssignmentDescription, setEditAssignmentDescription] = useState('')
  const [editAssignmentWeekId, setEditAssignmentWeekId] = useState<string>(COURSE_WEEKS[0]?.id ?? '')
  const [editAssignmentHours, setEditAssignmentHours] = useState<string>('')
  const [editAssignmentRubric, setEditAssignmentRubric] = useState('')
  const [editAssignmentStatus, setEditAssignmentStatus] = useState<'pending' | 'submitted' | 'graded'>('pending')
  const [editAssignmentDueDateISO, setEditAssignmentDueDateISO] = useState<string>('')
  const [editAssignmentCustomDueLabel, setEditAssignmentCustomDueLabel] = useState<string>('')
  const totalCourseHours = useMemo(
    () => courseWeeks.reduce((sum, week) => sum + week.targetHours, 0),
    [courseWeeks]
  )
  const MAX_VIDEO_MB = 500
  const VIDEO_UPLOAD_PREFIX = 'training-video'
  const userRole = currentUser?.role?.toLowerCase() || 'guest'
  const canManageVideos = ['owner', 'director', 'manager', 'hr', 'staff', 'admin', 'instructor'].includes(userRole)
  const canManageAssignments = ['owner', 'director', 'manager', 'instructor'].includes(userRole)
  const canEditAssignments = canManageAssignments && activeTab === 'instructor'
  const [isDeleteAssignmentDialogOpen, setIsDeleteAssignmentDialogOpen] = useState(false)
  const [assignmentPendingDelete, setAssignmentPendingDelete] = useState<{ assignment: Assignment; weekId: string } | null>(null)
  const [deleteAssignmentConfirmText, setDeleteAssignmentConfirmText] = useState('')
  const [deleteAssignmentError, setDeleteAssignmentError] = useState<string | null>(null)
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false)
  const [selectedLessonWeekId, setSelectedLessonWeekId] = useState(
    TRAINING_LESSON_PLANS[0]?.id ?? ''
  )
  const [selectedLessonDayId, setSelectedLessonDayId] = useState(
    TRAINING_LESSON_PLANS[0]?.days[0]?.id ?? ''
  )
  const attendancePercent = Math.round((STUDENT_PROGRESS.attendedSessions / STUDENT_PROGRESS.requiredSessions) * 100)
  const ACTIVITY_ICON_MAP = {
    attendance: ClipboardList,
    grade: PenSquare,
    schedule: CalendarCheck
  } as const

  useEffect(() => {
    const week = TRAINING_LESSON_PLANS.find(plan => plan.id === selectedLessonWeekId)
    if (!week) {
      const fallbackWeek = TRAINING_LESSON_PLANS[0]
      if (fallbackWeek) {
        setSelectedLessonWeekId(fallbackWeek.id)
        setSelectedLessonDayId(fallbackWeek.days[0]?.id ?? '')
      }
      return
    }
    if (!week.days.some(day => day.id === selectedLessonDayId)) {
      setSelectedLessonDayId(week.days[0]?.id ?? '')
    }
  }, [selectedLessonWeekId, selectedLessonDayId])

  const selectedLessonWeek = useMemo(
    () => TRAINING_LESSON_PLANS.find(plan => plan.id === selectedLessonWeekId),
    [selectedLessonWeekId]
  )

  const selectedLessonDay = useMemo(
    () => selectedLessonWeek?.days.find(day => day.id === selectedLessonDayId),
    [selectedLessonWeek, selectedLessonDayId]
  )

  const toAssignmentStatus = (value?: string): Assignment['status'] => {
    if (!value) return 'pending'
    const normalized = value.toLowerCase()
    return normalized === 'submitted' || normalized === 'graded' ? normalized : 'pending'
  }

  const fetchAssignments = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) {
        setIsLoadingAssignments(true)
      }
      setAssignmentLoadError(null)
      try {
        const response = await fetch('/api/training/assignments', {
          headers: currentUser?.email
            ? {
                'x-user-email': currentUser.email
              }
            : undefined
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error || 'Unable to load assignments.')
        }

        const persistedAssignments: Assignment[] = (data.assignments || []).map((assignment: any) => ({
          id: assignment.id,
          weekId: assignment.weekId,
          title: assignment.title,
          description: assignment.description || '',
          dueDate: assignment.dueDateLabel || 'Due date shared in class',
          dueDateISO: assignment.dueDateISO || null,
          status: toAssignmentStatus(assignment.status),
          estimatedHours: assignment.estimatedHours ?? undefined,
          rubric: assignment.rubric ?? undefined,
          isPersisted: true
        }))

        const weekMap = new Map<string, CourseWeek>()
        buildBaseWeeks().forEach(week => {
          weekMap.set(week.id, {
            ...week,
            assignments: week.assignments.map(assignment => ({
              ...assignment,
              isPersisted: assignment.isPersisted ?? false,
              dueDateISO: assignment.dueDateISO ?? null
            }))
          })
        })

        persistedAssignments.forEach(assignment => {
          const existingWeek = weekMap.get(assignment.weekId || '')
          if (existingWeek) {
            const existingIndex = existingWeek.assignments.findIndex(item => item.id === assignment.id)
            if (existingIndex >= 0) {
              existingWeek.assignments[existingIndex] = {
                ...existingWeek.assignments[existingIndex],
                ...assignment
              }
            } else {
              existingWeek.assignments = [assignment, ...existingWeek.assignments]
            }
            weekMap.set(existingWeek.id, existingWeek)
          } else {
            weekMap.set(assignment.weekId || `custom-${assignment.id}`, {
              id: assignment.weekId || `custom-${assignment.id}`,
              order: Number.MAX_SAFE_INTEGER,
              title: assignment.weekId ? `Week ${assignment.weekId}` : 'Custom Week',
              summary: '',
              targetHours: assignment.estimatedHours ?? 0,
              assignments: [assignment]
            })
          }
        })

        const updatedWeeks = Array.from(weekMap.values()).sort((a, b) => a.order - b.order)
        setCourseWeeks(updatedWeeks)
        setSelectedWeekId(prev =>
          updatedWeeks.some(week => week.id === prev) ? prev : updatedWeeks[0]?.id ?? prev
        )
        setNewAssignmentWeekId(prev =>
          updatedWeeks.some(week => week.id === prev) ? prev : updatedWeeks[0]?.id ?? prev
        )
      } catch (error) {
        console.error('Failed to fetch training assignments:', error)
        setAssignmentLoadError(error instanceof Error ? error.message : 'Unable to load assignments.')
        const fallbackWeeks = buildBaseWeeks()
        setCourseWeeks(fallbackWeeks)
        setSelectedWeekId(prev =>
          fallbackWeeks.some(week => week.id === prev) ? prev : fallbackWeeks[0]?.id ?? prev
        )
        setNewAssignmentWeekId(prev =>
          fallbackWeeks.some(week => week.id === prev) ? prev : fallbackWeeks[0]?.id ?? prev
        )
      } finally {
        if (showSpinner) {
          setIsLoadingAssignments(false)
        }
      }
    },
    [currentUser?.email]
  )

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const fetchTrainingVideos = useCallback(
    async (showSpinner = true) => {
      if (!currentUser?.email) {
        setLectureVideos([])
        return
      }
      if (showSpinner) {
        setIsLoadingVideos(true)
      }
      setVideoError(null)
      try {
        const response = await fetch('/api/training/videos', {
          headers: {
            'x-user-email': currentUser.email
          }
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error || 'Unable to load training videos.')
        }
        const videos: LectureVideo[] = (data.videos || []).map((video: any) => ({
          id: video.id,
          title: video.title,
          description: video.description || 'Instructor uploaded lesson recording.',
          duration: video.duration || 'Self-paced',
          url: video.url,
          fileSize: video.fileSize,
          uploadedAt: video.uploadedAt,
          uploadedBy: video.uploadedBy
        }))
        setLectureVideos(videos)
      } catch (error) {
        console.error('Failed to fetch training videos:', error)
        setVideoError(error instanceof Error ? error.message : 'Unable to load training videos.')
        setLectureVideos([])
      } finally {
        if (showSpinner) {
          setIsLoadingVideos(false)
        }
      }
    },
    [currentUser?.email]
  )

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return ''
    const units = ['bytes', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    const value = size % 1 === 0 ? size.toFixed(0) : size.toFixed(1)
    return `${value} ${units[unitIndex]}`
  }

  const formatDateTime = (value?: string) => {
    if (!value) return ''
    try {
      return new Date(value).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return value
    }
  }

  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase(),
    avatar: currentUser.avatar
  } : {
    name: 'PMU Artist',
    email: 'student@pmupro.com',
    initials: 'PA'
  }

  useEffect(() => {
    fetchTrainingVideos()
  }, [fetchTrainingVideos])

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleVideoButtonClick = () => {
    videoInputRef.current?.click()
  }

  const handleVideoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    setVideoUploadError(null)
    setVideoUploadSuccess(null)
    setVideoUploadProgress(null)

    if (!file) {
      setVideoFile(null)
      return
    }

    if (!file.type.startsWith('video/')) {
      setVideoFile(null)
      setVideoUploadError('Please choose a video file (mp4, mov, or similar).')
      return
    }

    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setVideoFile(null)
      setVideoUploadError(`Video exceeds the ${MAX_VIDEO_MB} MB limit.`)
      return
    }

    setVideoFile(file)
    if (!newVideoTitle) {
      const titleFromFile = file.name.replace(/\.[^/.]+$/, '')
      setNewVideoTitle(titleFromFile)
    }
  }

  const handleVideoUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setVideoUploadError(null)
    setVideoUploadSuccess(null)

    if (!currentUser?.email) {
      setVideoUploadError('You must be logged in to upload videos.')
      return
    }

    if (!videoFile) {
      setVideoUploadError('Select a video file before uploading.')
      return
    }

    const trimmedTitle = (newVideoTitle || videoFile.name.replace(/\.[^/.]+$/, '')).trim() || 'Lecture Video'
    const description = newVideoDescription.trim()
    const durationLabel = newVideoDuration.trim()
    const extension = videoFile.name.split('.').pop()?.toLowerCase() || 'mp4'
    const safeSegment = trimmedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const userIdentifier =
      (currentUser.id || currentUser.email || 'user').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'user'
    const pathname = `${VIDEO_UPLOAD_PREFIX}/${userIdentifier}/${safeSegment || 'lecture'}-${Date.now()}.${extension}`

    setVideoUploadProgress(0)
    try {
      await upload(pathname, videoFile, {
        access: 'public',
        contentType: videoFile.type || 'video/mp4',
        handleUploadUrl: '/api/training/videos',
        headers: {
          'x-user-email': currentUser.email
        },
        clientPayload: JSON.stringify({
          title: trimmedTitle,
          description,
          durationLabel,
          fileSize: videoFile.size,
          originalFilename: videoFile.name
        }),
        multipart: videoFile.size > 15 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setVideoUploadProgress(Math.round(percentage))
      })

      setVideoUploadSuccess('Video uploaded successfully.')
      if (videoInputRef.current) {
        videoInputRef.current.value = ''
      }
      setVideoFile(null)
      setNewVideoTitle('')
      setNewVideoDescription('')
      setNewVideoDuration('')
      await fetchTrainingVideos(false)
    } catch (error) {
      console.error('Training video upload failed:', error)
      setVideoUploadError(error instanceof Error ? error.message : 'Failed to upload the video.')
    } finally {
      setVideoUploadProgress(null)
    }
  }

  const openEditAssignmentDialog = (assignment: Assignment, weekId: string) => {
    if (!canEditAssignments) return
    setAssignmentError(null)
    setAssignmentSuccess(null)
    setAssignmentBeingEdited({ assignmentId: assignment.id, weekId })
    setEditAssignmentTitle(assignment.title)
    setEditAssignmentDescription(assignment.description)
    setEditAssignmentWeekId(assignment.weekId || weekId)
    setEditAssignmentHours(
      assignment.estimatedHours !== undefined && assignment.estimatedHours !== null
        ? String(assignment.estimatedHours)
        : ''
    )
    setEditAssignmentRubric(assignment.rubric || '')
    setEditAssignmentStatus(assignment.status)
    setEditAssignmentDueDateISO(assignment.dueDateISO || '')
    setEditAssignmentCustomDueLabel(
      assignment.dueDateISO ? '' : assignment.dueDate || 'Due date shared in class'
    )
    setAssignmentError(null)
    setAssignmentSuccess(null)
    setIsEditAssignmentDialogOpen(true)
  }

  const closeEditAssignmentDialog = () => {
    setIsEditAssignmentDialogOpen(false)
    setAssignmentBeingEdited(null)
    setEditAssignmentTitle('')
    setEditAssignmentDescription('')
    setEditAssignmentWeekId(COURSE_WEEKS[0]?.id ?? '')
    setEditAssignmentHours('')
    setEditAssignmentRubric('')
    setEditAssignmentStatus('pending')
    setEditAssignmentDueDateISO('')
    setEditAssignmentCustomDueLabel('')
    setIsSavingAssignment(false)
  }

  const openDeleteDialog = (video: LectureVideo) => {
    setVideoPendingDelete(video)
    setDeleteConfirmText('')
    setDeleteError(null)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteVideo = async () => {
    if (!videoPendingDelete || !currentUser?.email) return
    setDeleteError(null)
    setIsDeletingVideo(true)
    try {
      const response = await fetch(`/api/training/videos/${videoPendingDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to delete the video.')
      }
      setIsDeleteDialogOpen(false)
      setVideoPendingDelete(null)
      setDeleteConfirmText('')
      await fetchTrainingVideos(false)
    } catch (error) {
      console.error('Failed to delete training video:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete the video.')
    } finally {
      setIsDeletingVideo(false)
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF document.')
      return
    }

    setUploadError(null)
    setPdfFileName(file.name)
  }

  const handleAssignmentCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAssignmentError(null)
    setAssignmentSuccess(null)

    if (!currentUser?.email) {
      setAssignmentError('You must be signed in to create assignments.')
      return
    }

    if (!newAssignmentTitle.trim()) {
      setAssignmentError('Add a title before publishing the assignment.')
      return
    }

    const targetWeekId = newAssignmentWeekId || courseWeeks[0]?.id
    if (!targetWeekId) {
      setAssignmentError('Select a course week before posting the assignment.')
      return
    }

    const parsedHours = newAssignmentHours.trim()
      ? parseFloat(newAssignmentHours.trim())
      : undefined
    if (parsedHours !== undefined && (Number.isNaN(parsedHours) || parsedHours < 0)) {
      setAssignmentError('Enter a valid number of estimated hours (e.g., 6 or 6.5).')
      return
    }

    const description = newAssignmentDescription.trim() || 'Follow the instructions provided in class and upload proof of completion.'
    const rubric = newAssignmentRubric.trim()

    let dueDateLabel = 'Due date shared in class'
    let dueDateISO: string | null = null
    if (newAssignmentDueDate) {
      const dueDate = new Date(newAssignmentDueDate)
      if (!Number.isNaN(dueDate.getTime())) {
        dueDateLabel = `Due ${dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
        dueDateISO = newAssignmentDueDate
      }
    }

    setIsSavingAssignment(true)
    try {
      const response = await fetch('/api/training/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          weekId: targetWeekId,
          title: newAssignmentTitle.trim(),
          description,
          dueDateLabel,
          dueDateISO,
          status: 'pending',
          estimatedHours: parsedHours ?? null,
          rubric
        })
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create assignment.')
      }

      setAssignmentSuccess('Assignment posted for students. It now appears under Weekly Assignments.')
      setSelectedWeekId(targetWeekId)
      setNewAssignmentWeekId(targetWeekId)
      setNewAssignmentHours('')
      setNewAssignmentTitle('')
      setNewAssignmentDescription('')
      setNewAssignmentDueDate('')
      setNewAssignmentRubric('')
      await fetchAssignments(false)
    } catch (error) {
      console.error('Failed to create training assignment:', error)
      setAssignmentError(error instanceof Error ? error.message : 'Failed to create assignment.')
    } finally {
      setIsSavingAssignment(false)
    }
  }

  const handleAssignmentUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAssignmentError(null)
    setAssignmentSuccess(null)

    if (!assignmentBeingEdited) {
      setAssignmentError('No assignment selected for editing.')
      return
    }

    if (!currentUser?.email) {
      setAssignmentError('You must be signed in to update assignments.')
      return
    }

    const originalWeek = courseWeeks.find(week => week.id === assignmentBeingEdited.weekId)
    const originalAssignment = originalWeek?.assignments.find(
      assignment => assignment.id === assignmentBeingEdited.assignmentId
    )

    if (!originalWeek || !originalAssignment) {
      setAssignmentError('Assignment not found. Please refresh and try again.')
      return
    }

    if (!editAssignmentTitle.trim()) {
      setAssignmentError('Add a title before saving the assignment.')
      return
    }

    const targetWeekId = editAssignmentWeekId || assignmentBeingEdited.weekId
    const parsedHours = editAssignmentHours.trim()
      ? parseFloat(editAssignmentHours.trim())
      : undefined
    if (parsedHours !== undefined && (Number.isNaN(parsedHours) || parsedHours < 0)) {
      setAssignmentError('Enter a valid number of estimated hours (e.g., 6 or 6.5).')
      return
    }

    let dueDateLabel = originalAssignment.dueDate
    let dueDateISO: string | null | undefined = originalAssignment.dueDateISO ?? null

    if (editAssignmentDueDateISO) {
      const dueDate = new Date(editAssignmentDueDateISO)
      if (!Number.isNaN(dueDate.getTime())) {
        dueDateLabel = `Due ${dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
        dueDateISO = editAssignmentDueDateISO
      }
    } else if (editAssignmentCustomDueLabel.trim()) {
      dueDateLabel = editAssignmentCustomDueLabel.trim()
      dueDateISO = null
    }

    setIsSavingAssignment(true)
    try {
      const response = await fetch(`/api/training/assignments/${assignmentBeingEdited.assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          weekId: targetWeekId,
          title: editAssignmentTitle.trim(),
          description: editAssignmentDescription.trim() || originalAssignment.description,
          dueDateLabel,
          dueDateISO,
          status: editAssignmentStatus,
          estimatedHours: parsedHours ?? null,
          rubric: editAssignmentRubric.trim()
        })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update assignment.')
      }

      setAssignmentSuccess(`Assignment "${editAssignmentTitle.trim()}" has been updated.`)
      setSelectedWeekId(targetWeekId)
      closeEditAssignmentDialog()
      await fetchAssignments(false)
    } catch (error) {
      console.error('Failed to update training assignment:', error)
      setAssignmentError(error instanceof Error ? error.message : 'Failed to update assignment.')
    } finally {
      setIsSavingAssignment(false)
    }
  }

  const openDeleteAssignmentDialog = (assignment: Assignment, weekId: string) => {
    if (!canEditAssignments) return
    if (!assignment.isPersisted) {
      setAssignmentError('Default curriculum assignments cannot be deleted.')
      return
    }
    setAssignmentError(null)
    setAssignmentSuccess(null)
    setAssignmentPendingDelete({ assignment, weekId })
    setDeleteAssignmentConfirmText('')
    setDeleteAssignmentError(null)
    setIsDeleteAssignmentDialogOpen(true)
  }

  const handleDeleteAssignment = async () => {
    if (!assignmentPendingDelete) return
    if (!currentUser?.email) {
      setDeleteAssignmentError('You must be signed in to delete assignments.')
      return
    }
    setDeleteAssignmentError(null)
    setIsDeletingAssignment(true)
    try {
      const response = await fetch(`/api/training/assignments/${assignmentPendingDelete.assignment.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete assignment.')
      }

      setAssignmentSuccess(`Assignment "${assignmentPendingDelete.assignment.title}" has been deleted.`)
      setIsDeleteAssignmentDialogOpen(false)
      setAssignmentPendingDelete(null)
      setDeleteAssignmentConfirmText('')
      await fetchAssignments(false)
    } catch (error) {
      console.error('Failed to delete training assignment:', error)
      setDeleteAssignmentError(error instanceof Error ? error.message : 'Failed to delete assignment.')
    } finally {
      setIsDeletingAssignment(false)
    }
  }

  const recordInstructorActivity = (
    type: 'attendance' | 'grade' | 'schedule',
    title: string,
    summary: string
  ) => {
    setInstructorActivityLog(prev => [
      { type, title, summary, timestamp: new Date().toLocaleString() },
      ...prev
    ].slice(0, 6))
    setInstructorActivityBanner({
      type: 'success',
      message:
        type === 'attendance'
          ? 'Attendance saved for your records.'
          : type === 'grade'
            ? 'Grades posted for the student.'
            : 'Supervision session pencilled in. Directors can confirm availability in Supervision.'
    })
    setTimeout(() => setInstructorActivityBanner(null), 4000)
  }

  const handleAttendanceSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!attendanceForm.session || !attendanceForm.date) {
      setInstructorActivityBanner({
        type: 'warning',
        message: 'Enter a session title and date before saving attendance.'
      })
      return
    }
    recordInstructorActivity(
      'attendance',
      `${attendanceForm.session} (${attendanceForm.date})`,
      attendanceForm.notes ? attendanceForm.notes : 'Attendance recorded.'
    )
    setAttendanceDialogOpen(false)
    setAttendanceForm({ session: '', date: '', notes: '' })
  }

  const handleGradeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!gradeForm.student || !gradeForm.assignment || !gradeForm.score) {
      setInstructorActivityBanner({
        type: 'warning',
        message: 'Provide a student, assignment, and score before posting grades.'
      })
      return
    }
    recordInstructorActivity(
      'grade',
      `${gradeForm.student} • ${gradeForm.assignment}`,
      gradeForm.feedback
        ? `${gradeForm.score} – ${gradeForm.feedback}`
        : `${gradeForm.score} submitted.`
    )
    setGradeDialogOpen(false)
    setGradeForm({ student: '', assignment: '', score: '', feedback: '' })
  }

  const handleScheduleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!scheduleForm.student || !scheduleForm.instructor || !scheduleForm.date || !scheduleForm.time) {
      setInstructorActivityBanner({
        type: 'warning',
        message: 'Complete student, instructor, date, and time fields before scheduling.'
      })
      return
    }
    recordInstructorActivity(
      'schedule',
      `${scheduleForm.student} ⇄ ${scheduleForm.instructor}`,
      `${scheduleForm.date} at ${scheduleForm.time}${scheduleForm.notes ? ` – ${scheduleForm.notes}` : ''}`
    )
    setScheduleDialogOpen(false)
    setScheduleForm({ student: '', instructor: '', date: '', time: '', notes: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-violet-100">
      <NavBar currentPath="/training/fundamentals" user={user} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-20 overflow-x-hidden">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleVideoFileChange}
        />
        <Card className="border-purple-200 bg-white shadow-lg mb-8 break-words">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between break-words">
            <div>
              <Badge className="bg-purple-600 text-white mb-2">
                <GraduationCap className="h-4 w-4 mr-1" /> Level 1 Training Portal
              </Badge>
              <CardTitle className="text-3xl font-serif text-purple-900">Fundamentals & Foundations of PMU Application</CardTitle>
              <CardDescription className="text-purple-700 text-sm sm:text-base">
                Access curriculum, assignments, and lecture videos. Directors and instructors can manage attendance, grades, and training resources.
              </CardDescription>
            </div>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/library?category=training">
                <BookOpen className="h-4 w-4 mr-2" /> Download E-Book
              </Link>
            </Button>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'student' | 'instructor')} className="space-y-6 break-words">
          <TabsList className="bg-purple-100/70 p-1 rounded-lg flex flex-wrap gap-2 w-full">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Student Portal
            </TabsTrigger>
            <TabsTrigger value="instructor" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Instructor Console
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-6 break-words">
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                <Card className="border-gray-200 break-words">
                  <CardHeader className="break-words">
                    <CardTitle className="text-xl font-semibold text-gray-900">Assignments</CardTitle>
                    <CardDescription className="text-gray-600">
                      Submit required coursework and track your weekly progress. This is a 6.5-week, {totalCourseHours}-hour certification.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 break-words">
                    {assignmentLoadError && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {assignmentLoadError}
                      </div>
                    )}
                    {isLoadingAssignments && (
                      <div className="rounded-md border border-purple-200 bg-purple-50 p-3 text-sm text-purple-800">
                        Loading assignments…
                      </div>
                    )}
                    <div className="rounded-md border border-purple-200 bg-purple-50 p-3 text-sm text-purple-900 break-words">
                      <span className="font-semibold">Course Pace:</span>{' '}
                      Complete {totalCourseHours} hours across 6.5 weeks. Select a week below to review the assignments and estimated workload.
                    </div>
                    <Tabs
                      value={selectedWeekId}
                      onValueChange={(value) => setSelectedWeekId(value as string)}
                      className="space-y-4"
                    >
                      <TabsList className="flex w-full max-w-full overflow-x-auto rounded-lg bg-purple-100/70 p-1">
                        {courseWeeks.map(week => (
                          <TabsTrigger
                            key={week.id}
                            value={week.id}
                            className="whitespace-nowrap"
                          >
                            Week {week.order}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {courseWeeks.map(week => {
                        const actualHours = week.assignments.reduce(
                          (hours, assignment) => hours + (assignment.estimatedHours ?? 0),
                          0
                        )
                        const displayHours = actualHours || week.targetHours
                        return (
                          <TabsContent key={week.id} value={week.id} className="space-y-4">
                            <div className="rounded-md border-l-4 border-purple-300 bg-purple-50 p-4 space-y-2">
                              <p className="text-sm font-semibold text-purple-900">{week.title}</p>
                              <p className="text-sm text-purple-800">{week.summary}</p>
                              <p className="text-xs text-purple-700">
                                Weekly workload: ~{displayHours} hours (target {week.targetHours} hrs) • Course total {totalCourseHours} hrs
                              </p>
                            </div>

                            {week.assignments.length === 0 ? (
                              <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 text-center">
                                No assignments published for this week yet.
                              </div>
                            ) : (
                              week.assignments.map(assignment => (
                                <Card key={assignment.id} className="border border-gray-200 shadow-sm break-words">
                                  <CardContent className="p-4 space-y-3 break-words">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                      <div>
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                          <FileText className="h-5 w-5 text-purple-600" />
                                          {assignment.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">{assignment.description}</p>
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
                                          <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                                            ~{assignment.estimatedHours} hrs
                                          </Badge>
                                        )}
                                      </div>
                <div className="flex gap-2">
                                          {canEditAssignments && (
                                            <>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEditAssignmentDialog(assignment, week.id)}
                                              >
                                                <PenSquare className="h-4 w-4 mr-1" />
                                                Edit
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => openDeleteAssignmentDialog(assignment, week.id)}
                                                disabled={!assignment.isPersisted}
                                              >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                              </Button>
                                            </>
                                          )}
                                        <Button size="sm" variant="outline">
                                          <Upload className="h-4 w-4 mr-1" /> Upload Work
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() =>
                                            assignment.rubric &&
                                            setOpenRubricId(prev => (prev === assignment.id ? null : assignment.id))
                                          }
                                          disabled={!assignment.rubric}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          {openRubricId === assignment.id ? 'Hide Rubric' : 'View Rubric'}
                                        </Button>
                                      </div>
                                    </div>
                                    {assignment.rubric && openRubricId === assignment.id && (
                                      <div className="rounded-md border border-purple-200 bg-purple-50 p-3 text-sm text-purple-900 whitespace-pre-line">
                                        {assignment.rubric}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))
                            )}
                          </TabsContent>
                        )
                      })}
                    </Tabs>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 break-words">
                  <CardHeader className="break-words">
                    <CardTitle className="text-xl font-semibold text-gray-900">Lecture Library</CardTitle>
                    <CardDescription className="text-gray-600">Watch recorded modules before attending hands-on sessions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 break-words">
                    {isLoadingVideos && (
                      <div className="rounded-md border border-purple-200 bg-purple-50 p-3 text-sm text-purple-800">
                        Loading lecture videos…
                      </div>
                    )}
                    {videoError && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {videoError}
                      </div>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                      {lectureVideos.length === 0 && !isLoadingVideos && !videoError && (
                        <div className="md:col-span-2 rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600 text-center">
                          Instructors have not uploaded any lecture recordings yet. New videos will appear here as soon as they are published.
                        </div>
                      )}
                      {lectureVideos.map(video => (
                        <Card key={video.id} className="border border-gray-200 shadow-sm break-words">
                          <CardContent className="p-4 space-y-3 break-words">
                            <div className="flex items-center gap-2">
                              <Video className="h-5 w-5 text-purple-600" />
                              <h3 className="text-base font-semibold text-gray-900">{video.title}</h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{video.description || 'Instructor uploaded lesson recording.'}</p>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div className="flex flex-wrap gap-2">
                                <span><strong>Duration:</strong> {video.duration || 'Self-paced'}</span>
                                {video.fileSize ? <span><strong>Size:</strong> {formatFileSize(video.fileSize)}</span> : null}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {video.uploadedBy && <span><strong>Instructor:</strong> {video.uploadedBy}</span>}
                                {video.uploadedAt && <span><strong>Uploaded:</strong> {formatDateTime(video.uploadedAt)}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" asChild className="flex-1">
                                <a href={video.url} target="_blank" rel="noopener noreferrer">
                                  Watch
                                </a>
                              </Button>
                              {canManageVideos && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => openDeleteDialog(video)}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50 break-words">
                  <CardHeader className="break-words">
                    <CardTitle className="text-lg font-semibold text-purple-900">Progress Overview</CardTitle>
                    <CardDescription className="text-purple-700">Track your completion toward studio certification.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 break-words">
                    <div>
                      <div className="flex items-center justify-between text-sm text-purple-900">
                        <span>Course Completion</span>
                        <span>{STUDENT_PROGRESS.overallCompletion}%</span>
                      </div>
                      <Progress value={STUDENT_PROGRESS.overallCompletion} className="h-2 bg-purple-200" />
                    </div>
                    <div className="text-sm text-purple-900 flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4" /> Attendance: {STUDENT_PROGRESS.attendedSessions} / {STUDENT_PROGRESS.requiredSessions} sessions ({attendancePercent}%)
                    </div>
                    <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 w-full">
                      <Link href="/studio/room-booking">Book Supervised Session</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 break-words">
                  <CardHeader className="break-words">
                    <CardTitle className="text-lg font-semibold text-gray-900">Program Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700 break-words">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/library?category=training">
                        <Download className="h-4 w-4 mr-2" /> Download Training E-Book
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/ai-contraindication">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Review Contraindication Workflow
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/studio/supervision">
                        <CalendarCheck className="h-4 w-4 mr-2" /> View Instructor Availability
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-purple-200 bg-purple-50 break-words">
                  <CardHeader className="break-words">
                    <CardTitle className="text-lg font-semibold text-purple-900">Recent Instructor Activity</CardTitle>
                    <CardDescription className="text-purple-700">
                      Snapshots of the latest attendance logs, grades, and supervision drafts you have recorded.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-purple-900 break-words">
                    {instructorActivityLog.length === 0 && (
                      <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-500">
                        When you record attendance, post grades, or draft a supervision session, the timeline will appear here.
                      </div>
                    )}
                    {instructorActivityLog.map((activity, index) => {
                      const ActivityIcon = ACTIVITY_ICON_MAP[activity.type]
                      return (
                        <div
                          key={`${activity.timestamp}-${index}`}
                          className="flex items-start gap-3 rounded-md border border-gray-200 bg-white p-3 shadow-sm"
                        >
                          <ActivityIcon className="mt-1 h-5 w-5 text-purple-600" />
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-600 whitespace-pre-line">{activity.summary}</p>
                            <p className="text-xs text-gray-500">Logged {activity.timestamp}</p>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50 break-words">
                  <CardHeader className="break-words">
                    <CardTitle className="text-lg font-semibold text-purple-900">Instructor Notes</CardTitle>
                    <CardDescription className="text-purple-700">Centralize communication with Directors and HR.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-purple-900 break-words">
                    <p>• Sync with Directors to confirm booth rent agreements before granting machine access.</p>
                    <p>• Log ProCell-only bookings for students via the room booking tool.</p>
                    <p>• Use permissions modal in Studio Team to adjust staff and HR access for training tools.</p>
                    <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 w-full">
                      <Link href="/studio/team">Open Permissions</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="instructor" className="space-y-6 break-words">
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <Card className="border-gray-200 break-words">
                <CardHeader className="break-words">
                  <CardTitle className="text-xl font-semibold text-gray-900">Attendance & Grading Console</CardTitle>
                  <CardDescription className="text-gray-600">Track class participation, grade submissions, and upload lecture updates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 break-words">
                  {instructorActivityBanner && (
                    <div
                      className={`rounded-md border px-3 py-2 text-sm ${
                        instructorActivityBanner.type === 'success'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {instructorActivityBanner.message}
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Card className="border border-gray-200 shadow-sm break-words">
                      <CardContent className="p-4 space-y-3 break-words">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <ClipboardList className="h-5 w-5 text-purple-600" /> Attendance Logs
                        </div>
                        <p className="text-sm text-gray-600">
                          Log which apprentices attended live practicums or virtual lectures. Export attendance history for compliance audits.
                        </p>
                        <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              Record Attendance
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Record Attendance</DialogTitle>
                              <DialogDescription>
                                Track which apprentices were present. Attendance logs remain visible in this console for quick review.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                              <div className="space-y-1">
                                <Label htmlFor="attendance-session">Session / Module</Label>
                                <Input
                                  id="attendance-session"
                                  value={attendanceForm.session}
                                  onChange={(event) =>
                                    setAttendanceForm(prev => ({ ...prev, session: event.target.value }))
                                  }
                                  placeholder="e.g., Module 3: Needle Depth Practicum"
                                />
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <Label htmlFor="attendance-date">Date</Label>
                                  <Input
                                    id="attendance-date"
                                    type="date"
                                    value={attendanceForm.date}
                                    onChange={(event) =>
                                      setAttendanceForm(prev => ({ ...prev, date: event.target.value }))
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="attendance-notes">Notes (optional)</Label>
                                  <Textarea
                                    id="attendance-notes"
                                    rows={3}
                                    placeholder="List attendees or special observations."
                                    value={attendanceForm.notes}
                                    onChange={(event) =>
                                      setAttendanceForm(prev => ({ ...prev, notes: event.target.value }))
                                    }
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                                  Save Attendance
                                </Button>
                                <Button variant="ghost" type="button" asChild>
                                  <Link href="/studio/supervision">View Supervision Roster</Link>
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-200 shadow-sm break-words">
                      <CardContent className="p-4 space-y-3 break-words">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <PenSquare className="h-5 w-5 text-purple-600" /> Grade Submissions
                        </div>
                        <p className="text-sm text-gray-600">
                          Apply rubric scores, leave coaching notes, and confirm whether assignments meet competency thresholds.
                        </p>
                        <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              Open Gradebook
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Post Assignment Grades</DialogTitle>
                              <DialogDescription>
                                Document rubric scores and qualitative feedback. Students see updates instantly in their portal.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleGradeSubmit} className="space-y-4">
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <Label htmlFor="grade-student">Student</Label>
                                  <Input
                                    id="grade-student"
                                    value={gradeForm.student}
                                    onChange={(event) =>
                                      setGradeForm(prev => ({ ...prev, student: event.target.value }))
                                    }
                                    placeholder="e.g., Tierra Williams"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="grade-assignment">Assignment</Label>
                                  <Input
                                    id="grade-assignment"
                                    value={gradeForm.assignment}
                                    onChange={(event) =>
                                      setGradeForm(prev => ({ ...prev, assignment: event.target.value }))
                                    }
                                    placeholder="e.g., Brow Mapping Upload"
                                  />
                                </div>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <Label htmlFor="grade-score">Score / Outcome</Label>
                                  <Input
                                    id="grade-score"
                                    value={gradeForm.score}
                                    onChange={(event) =>
                                      setGradeForm(prev => ({ ...prev, score: event.target.value }))
                                    }
                                    placeholder="e.g., 27 / 30"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="grade-feedback">Feedback</Label>
                                  <Textarea
                                    id="grade-feedback"
                                    rows={3}
                                    placeholder="Highlight strengths, adjustments, and next steps."
                                    value={gradeForm.feedback}
                                    onChange={(event) =>
                                      setGradeForm(prev => ({ ...prev, feedback: event.target.value }))
                                    }
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                                  Save Grade
                                </Button>
                                <Button variant="ghost" type="button" asChild>
                                  <Link href="#student-portal">Preview Student View</Link>
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-200 shadow-sm break-words">
                      <CardContent className="p-4 space-y-3 break-words">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <CalendarCheck className="h-5 w-5 text-purple-600" /> Supervision Scheduler
                        </div>
                        <p className="text-sm text-gray-600">
                          Coordinate 1:1 supervision blocks with Directors or Senior Instructors. Logged sessions appear in the activity timeline.
                        </p>
                        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              Draft Session
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Schedule Supervision</DialogTitle>
                              <DialogDescription>
                                Draft a supervision request before confirming availability in the Supervision hub.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleScheduleSubmit} className="space-y-4">
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <Label htmlFor="schedule-student">Student</Label>
                                  <Input
                                    id="schedule-student"
                                    value={scheduleForm.student}
                                    onChange={(event) =>
                                      setScheduleForm(prev => ({ ...prev, student: event.target.value }))
                                    }
                                    placeholder="e.g., Careya Garcia"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="schedule-instructor">Instructor / Director</Label>
                                  <Input
                                    id="schedule-instructor"
                                    value={scheduleForm.instructor}
                                    onChange={(event) =>
                                      setScheduleForm(prev => ({ ...prev, instructor: event.target.value }))
                                    }
                                    placeholder="e.g., Director Jackson"
                                  />
                                </div>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <Label htmlFor="schedule-date">Date</Label>
                                  <Input
                                    id="schedule-date"
                                    type="date"
                                    value={scheduleForm.date}
                                    onChange={(event) =>
                                      setScheduleForm(prev => ({ ...prev, date: event.target.value }))
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="schedule-time">Start Time</Label>
                                  <Input
                                    id="schedule-time"
                                    type="time"
                                    value={scheduleForm.time}
                                    onChange={(event) =>
                                      setScheduleForm(prev => ({ ...prev, time: event.target.value }))
                                    }
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="schedule-notes">Session Notes (optional)</Label>
                                <Textarea
                                  id="schedule-notes"
                                  rows={3}
                                  placeholder="Outline objectives, model prep, or required supplies."
                                  value={scheduleForm.notes}
                                  onChange={(event) =>
                                    setScheduleForm(prev => ({ ...prev, notes: event.target.value }))
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                                  Save Draft
                                </Button>
                                <Button variant="ghost" type="button" asChild>
                                  <Link href="/studio/supervision">Open Supervision Hub</Link>
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-dashed border-purple-300 bg-purple-50 break-words">
                    <CardHeader className="text-center space-y-2 break-words">
                      <CardTitle className="text-lg font-semibold text-purple-900">Lecture Library Uploads</CardTitle>
                      <CardDescription className="text-purple-800">
                        Publish on-demand video lessons and downloadable handouts for apprentices to review.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 break-words">
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-lg border border-purple-200 bg-white p-4 space-y-3 text-left break-words">
                          <div className="flex items-center gap-2 text-purple-900 font-semibold">
                            <Video className="h-5 w-5 text-purple-600" />
                            Upload Lecture Video
                          </div>
                          <p className="text-sm text-purple-700">
                            Accepts MP4, MOV, and most browser-ready formats. Videos are added to the Lecture Library immediately for students. Maximum file size {MAX_VIDEO_MB} MB.
                          </p>
                          <form onSubmit={handleVideoUploadSubmit} className="space-y-3">
                            <div>
                              <Label htmlFor="video-title">Video title</Label>
                              <Input
                                id="video-title"
                                placeholder="e.g., Module 4: Machine Fundamentals"
                                value={newVideoTitle}
                                onChange={(event) => {
                                  setNewVideoTitle(event.target.value)
                                  setVideoUploadError(null)
                                  setVideoUploadSuccess(null)
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor="video-duration">Duration (optional)</Label>
                              <Input
                                id="video-duration"
                                placeholder="45 min"
                                value={newVideoDuration}
                                onChange={(event) => {
                                  setNewVideoDuration(event.target.value)
                                  setVideoUploadError(null)
                                  setVideoUploadSuccess(null)
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor="video-description">Lesson summary (optional)</Label>
                              <Textarea
                                id="video-description"
                                rows={3}
                                placeholder="Outline the key objectives, demo segments, or supplies used in the recording."
                                value={newVideoDescription}
                                onChange={(event) => {
                                  setNewVideoDescription(event.target.value)
                                  setVideoUploadError(null)
                                  setVideoUploadSuccess(null)
                                }}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleVideoButtonClick}
                                className="bg-white"
                              >
                                {videoFile ? 'Replace Video' : 'Select Video'}
                              </Button>
                              {videoFile && (
                                <span className="text-xs text-purple-700">Selected file: {videoFile.name}</span>
                              )}
                            </div>
                            <Button
                              type="submit"
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Publish Video
                            </Button>
                            {videoUploadProgress !== null && (
                              <span className="text-xs text-purple-700">
                                Uploading… {videoUploadProgress}%
                              </span>
                            )}
                          </form>
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
                        </div>
                        <div className="rounded-lg border border-purple-200 bg-white p-4 space-y-3 text-left break-words">
                          <div className="flex items-center gap-2 text-purple-900 font-semibold">
                            <FileText className="h-5 w-5 text-purple-600" />
                            Upload Handouts & Rubrics
                          </div>
                          <p className="text-sm text-purple-700">
                            Upload a PDF workbook, slide deck, or rubric. Students will download these resources from the library.
                          </p>
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="bg-white"
                              onClick={handleUploadButtonClick}
                             >
                              Upload PDF
                             </Button>
                            {pdfFileName ? (
                              <span className="text-xs font-medium text-purple-800">
                                Current PDF: {pdfFileName}
                              </span>
                            ) : (
                              <span className="text-xs text-purple-700">No PDF uploaded yet.</span>
                            )}
                            <p className="text-xs text-purple-700">
                              Max file size 150&nbsp;MB. Uploaded PDFs become available in the resource library for students.
                            </p>
                            {uploadError && (
                              <span className="text-xs text-red-600">{uploadError}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 break-words">
                    <CardHeader className="break-words">
                      <CardTitle className="text-xl font-semibold text-gray-900">Create Assignment & Rubric</CardTitle>
                      <CardDescription className="text-gray-600">
                        Publish coursework, deadlines, and scoring criteria. Students see new assignments instantly.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="break-words">
                      <form onSubmit={handleAssignmentCreate} className="space-y-4 text-left break-words">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-1 md:col-span-2">
                            <Label htmlFor="assignment-title">Assignment title</Label>
                            <Input
                              id="assignment-title"
                              placeholder="e.g., Live Model Brow Design"
                              value={newAssignmentTitle}
                              onChange={(event) => {
                                setNewAssignmentTitle(event.target.value)
                                setAssignmentError(null)
                                setAssignmentSuccess(null)
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="assignment-week">Course week</Label>
                            <Select value={newAssignmentWeekId} onValueChange={setNewAssignmentWeekId}>
                              <SelectTrigger id="assignment-week" className="w-full">
                                <SelectValue placeholder="Select week" />
                              </SelectTrigger>
                              <SelectContent>
                                {courseWeeks.map(week => (
                                  <SelectItem key={week.id} value={week.id}>
                                    Week {week.order}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1">
                            <Label htmlFor="assignment-due-date">Due date</Label>
                            <Input
                              id="assignment-due-date"
                              type="date"
                              value={newAssignmentDueDate}
                              onChange={(event) => {
                                setNewAssignmentDueDate(event.target.value)
                                setAssignmentError(null)
                                setAssignmentSuccess(null)
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="assignment-hours">Estimated hours (optional)</Label>
                            <Input
                              id="assignment-hours"
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step="0.5"
                              placeholder="e.g., 6"
                              value={newAssignmentHours}
                              onChange={(event) => {
                                setNewAssignmentHours(event.target.value)
                                setAssignmentError(null)
                                setAssignmentSuccess(null)
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="assignment-description">Assignment overview</Label>
                          <Textarea
                            id="assignment-description"
                            rows={3}
                            placeholder="Clarify deliverables, reference materials, and what students should upload."
                            value={newAssignmentDescription}
                            onChange={(event) => {
                              setNewAssignmentDescription(event.target.value)
                              setAssignmentError(null)
                              setAssignmentSuccess(null)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="assignment-rubric">Rubric / evaluation criteria</Label>
                          <Textarea
                            id="assignment-rubric"
                            rows={4}
                            placeholder="Break down grading categories, points, and minimum passing thresholds."
                            value={newAssignmentRubric}
                            onChange={(event) => {
                              setNewAssignmentRubric(event.target.value)
                              setAssignmentError(null)
                              setAssignmentSuccess(null)
                            }}
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
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-gray-500">
                            Tip: include rubric language students will recognise. The button above the assignment now reveals the rubric in their portal.
                          </p>
                          <Button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-70"
                            disabled={isSavingAssignment}
                          >
                            {isSavingAssignment ? 'Saving…' : 'Publish Assignment'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 break-words">
                    <CardHeader className="break-words">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold text-gray-900">Lesson Planner</CardTitle>
                          <CardDescription className="text-gray-600">
                            Access the word-for-word instructor script, cues, and homework for each day.
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <div className="w-full sm:w-48">
                            <Label htmlFor="lesson-week">Week</Label>
                            <Select
                              value={selectedLessonWeekId}
                              onValueChange={value => setSelectedLessonWeekId(value)}
                            >
                              <SelectTrigger id="lesson-week">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TRAINING_LESSON_PLANS.map(week => (
                                  <SelectItem key={week.id} value={week.id}>
                                    {week.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-full sm:w-48">
                            <Label htmlFor="lesson-day">Day</Label>
                            <Select
                              value={selectedLessonDayId}
                              onValueChange={value => setSelectedLessonDayId(value)}
                            >
                              <SelectTrigger id="lesson-day">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedLessonWeek?.days.map(day => (
                                  <SelectItem key={day.id} value={day.id}>
                                    {day.title}
                                  </SelectItem>
                                )) ?? null}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 break-words">
                      {selectedLessonWeek && (
                        <div className="rounded-md border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
                          <p className="font-semibold">{selectedLessonWeek.title}</p>
                          {selectedLessonWeek.summary && (
                            <p className="mt-1 text-purple-800">{selectedLessonWeek.summary}</p>
                          )}
                        </div>
                      )}
                      {!selectedLessonDay && (
                        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 text-center">
                          Select a week and day to view the detailed lesson plan.
                        </div>
                      )}
                      {selectedLessonDay && (
                        <div className="space-y-6">
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h3 className="text-lg font-semibold text-gray-900">{selectedLessonDay.title}</h3>
                            <div className="mt-3 space-y-1 text-sm text-gray-600">
                              <p className="font-medium text-gray-700">Focus for the day:</p>
                              <ul className="list-disc space-y-1 pl-5">
                                {selectedLessonDay.focus.map(item => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                              {selectedLessonDay.tone && (
                                <p className="mt-2 text-gray-600">
                                  <span className="font-medium text-gray-700">Instructor tone:</span> {selectedLessonDay.tone}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-4">
                            {selectedLessonDay.segments.map(segment => (
                              <Card key={segment.time + segment.title} className="border border-gray-200 shadow-sm">
                                <CardContent className="space-y-3 p-4">
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                      <p className="text-xs uppercase tracking-wide text-gray-500">{segment.time}</p>
                                      <h4 className="text-base font-semibold text-gray-900">{segment.title}</h4>
                                    </div>
                                    <Badge className="bg-slate-100 text-slate-700 border border-slate-200 self-start">
                                      {segment.time}
                                    </Badge>
                                  </div>
                                  {segment.instructorScript && (
                                    <div className="rounded-md border border-purple-200 bg-purple-50 p-3 text-sm text-purple-900 whitespace-pre-line">
                                      {segment.instructorScript}
                                    </div>
                                  )}
                                  {segment.prompts && segment.prompts.length > 0 && (
                                    <div className="space-y-1 text-sm text-gray-700">
                                      <p className="font-medium text-gray-800">Prompts / Commands:</p>
                                      <ul className="list-disc space-y-1 pl-5">
                                        {segment.prompts.map(prompt => (
                                          <li key={prompt}>{prompt}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {segment.activities && segment.activities.length > 0 && (
                                    <div className="space-y-1 text-sm text-gray-700">
                                      <p className="font-medium text-gray-800">Activities:</p>
                                      <ul className="list-disc space-y-1 pl-5">
                                        {segment.activities.map(activity => (
                                          <li key={activity}>{activity}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {segment.cues && segment.cues.length > 0 && (
                                    <div className="space-y-1 text-sm text-gray-700">
                                      <p className="font-medium text-gray-800">Instructor cues:</p>
                                      <ul className="list-disc space-y-1 pl-5">
                                        {segment.cues.map(cue => (
                                          <li key={cue}>{cue}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {segment.notes && segment.notes.length > 0 && (
                                    <div className="space-y-1 text-sm text-gray-700">
                                      <p className="font-medium text-gray-800">Notes:</p>
                                      <ul className="list-disc space-y-1 pl-5">
                                        {segment.notes.map(note => (
                                          <li key={note}>{note}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          {selectedLessonDay.homework.length > 0 && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                              <p className="text-sm font-semibold text-amber-800">Homework / Follow-up</p>
                              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                                {selectedLessonDay.homework.map(item => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog
        open={isEditAssignmentDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeEditAssignmentDialog()
          } else if (!assignmentBeingEdited) {
            setIsEditAssignmentDialogOpen(false)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update assignment details, move it to another week, or adjust estimated workload.
            </DialogDescription>
          </DialogHeader>
          {assignmentBeingEdited && (
            <form onSubmit={handleAssignmentUpdate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-1">
                  <Label htmlFor="edit-assignment-title">Assignment title</Label>
                  <Input
                    id="edit-assignment-title"
                    value={editAssignmentTitle}
                    onChange={(event) => setEditAssignmentTitle(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-assignment-week">Course week</Label>
                  <Select value={editAssignmentWeekId} onValueChange={setEditAssignmentWeekId}>
                    <SelectTrigger id="edit-assignment-week">
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseWeeks.map(week => (
                        <SelectItem key={week.id} value={week.id}>
                          Week {week.order}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="edit-assignment-due-date">Due date (optional)</Label>
                  <Input
                    id="edit-assignment-due-date"
                    type="date"
                    value={editAssignmentDueDateISO}
                    onChange={(event) => setEditAssignmentDueDateISO(event.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Choose a calendar date to auto-format the due label, or leave blank to use a custom label.
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-assignment-custom-label">Custom due label</Label>
                  <Input
                    id="edit-assignment-custom-label"
                    placeholder="e.g., Due Week 3 Friday"
                    value={editAssignmentCustomDueLabel}
                    onChange={(event) => setEditAssignmentCustomDueLabel(event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="edit-assignment-status">Status</Label>
                  <Select value={editAssignmentStatus} onValueChange={(value) => setEditAssignmentStatus(value as typeof editAssignmentStatus)}>
                    <SelectTrigger id="edit-assignment-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="graded">Graded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-assignment-hours">Estimated hours (optional)</Label>
                  <Input
                    id="edit-assignment-hours"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    placeholder="e.g., 6"
                    value={editAssignmentHours}
                    onChange={(event) => setEditAssignmentHours(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-assignment-description">Assignment overview</Label>
                <Textarea
                  id="edit-assignment-description"
                  rows={3}
                  placeholder="Clarify deliverables, reference materials, and what students should upload."
                  value={editAssignmentDescription}
                  onChange={(event) => setEditAssignmentDescription(event.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-assignment-rubric">Rubric / evaluation criteria</Label>
                <Textarea
                  id="edit-assignment-rubric"
                  rows={4}
                  placeholder="Break down grading categories, points, and minimum passing thresholds."
                  value={editAssignmentRubric}
                  onChange={(event) => setEditAssignmentRubric(event.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeEditAssignmentDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-70"
                  disabled={isSavingAssignment}
                >
                  {isSavingAssignment ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteAssignmentDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteAssignmentDialogOpen(false)
            setAssignmentPendingDelete(null)
            setDeleteAssignmentConfirmText('')
            setDeleteAssignmentError(null)
            setIsDeletingAssignment(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              {assignmentPendingDelete
                ? `This will permanently remove "${assignmentPendingDelete.assignment.title}" from Week ${assignmentPendingDelete.weekId}.`
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
                onChange={(event) => setDeleteAssignmentConfirmText(event.target.value)}
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
                setIsDeletingAssignment(false)
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

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setVideoPendingDelete(null)
            setDeleteConfirmText('')
            setDeleteError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lecture Video</DialogTitle>
            <DialogDescription>
              {videoPendingDelete
                ? `This will permanently remove "${videoPendingDelete.title}" from the lecture library.`
                : 'This will permanently remove the selected lecture video from the library.'}
            </DialogDescription>
          </DialogHeader>
          {videoPendingDelete && (
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                Type <span className="font-semibold text-gray-900">"{videoPendingDelete.title}"</span> to confirm deletion.
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(event) => setDeleteConfirmText(event.target.value)}
                placeholder={videoPendingDelete.title}
              />
              {deleteError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {deleteError}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setVideoPendingDelete(null)
                setDeleteConfirmText('')
                setDeleteError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                !videoPendingDelete ||
                deleteConfirmText.trim() !== videoPendingDelete.title ||
                isDeletingVideo
              }
              onClick={handleDeleteVideo}
            >
              {isDeletingVideo ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
