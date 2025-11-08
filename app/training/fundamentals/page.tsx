"use client"

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
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
  Search
} from 'lucide-react'
import pdfWorkerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url'

const TrainingPdfViewer = dynamic(
  () => import('@/components/training/pdf-viewer').then(mod => mod.TrainingPdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
        Loading PDF viewer…
      </div>
    )
  }
)

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded'
}

interface LectureVideo {
  id: string
  title: string
  duration: string
  description: string
  url: string
}

const STUDENT_ASSIGNMENTS: Assignment[] = [
  {
    id: 'safety-quiz',
    title: 'Sanitation & Safety Quiz',
    description: 'Demonstrate knowledge of BBP standards, workstation setup, and sterilization requirements.',
    dueDate: 'Due Nov 18, 2025',
    status: 'pending'
  },
  {
    id: 'brow-map',
    title: 'Brow Mapping Practice Upload',
    description: 'Submit before/after photos of brow mapping on practice skin with measurement notes.',
    dueDate: 'Due Nov 22, 2025',
    status: 'submitted'
  },
  {
    id: 'contraindication-journal',
    title: 'Contraindication Case Journal',
    description: 'Log three mock consultation scenarios and note go/no-go decisions with supporting evidence.',
    dueDate: 'Due Nov 25, 2025',
    status: 'graded'
  }
]

const LECTURE_VIDEOS: LectureVideo[] = [
  {
    id: 'module-1',
    title: 'Module 1: Foundations of PMU Application',
    duration: '32 min',
    description: 'Overview of skin anatomy, sanitation protocols, and consultation workflow for first-time clients.',
    url: '#'
  },
  {
    id: 'module-2',
    title: 'Module 2: Brow Mapping & Color Theory',
    duration: '45 min',
    description: 'Live demonstration of brow design mapping, Fitzpatrick assessment, and pigment selection strategy.',
    url: '#'
  },
  {
    id: 'module-3',
    title: 'Module 3: Needle Selection & Machine Setup',
    duration: '27 min',
    description: 'Step-by-step walkthrough of machine calibration, cartridge safety, and depth control best practices.',
    url: '#'
  }
]

const STUDENT_PROGRESS = {
  overallCompletion: 62,
  attendedSessions: 4,
  requiredSessions: 6
}

export default function FundamentalsTrainingPortal() {
  const { currentUser } = useDemoAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'student' | 'instructor'>('student')
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null)
  const [pdfFileName, setPdfFileName] = useState<string | null>(null)
  const [pdfNumPages, setPdfNumPages] = useState<number>(0)
  const [currentPdfPage, setCurrentPdfPage] = useState<number>(1)
  const [pageInput, setPageInput] = useState<string>('1')
  const [pageTexts, setPageTexts] = useState<Record<number, string>>({})
  const [isIndexingPdf, setIsIndexingPdf] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

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

  const attendancePercent = Math.round((STUDENT_PROGRESS.attendedSessions / STUDENT_PROGRESS.requiredSessions) * 100)
  const hasUploadedPdf = Boolean(pdfObjectUrl)

  useEffect(() => {
    return () => {
      if (pdfObjectUrl) {
        URL.revokeObjectURL(pdfObjectUrl)
      }
    }
  }, [pdfObjectUrl])

  const resetPdfState = () => {
    setPdfObjectUrl(null)
    setPdfFileName(null)
    setPdfNumPages(0)
    setCurrentPdfPage(1)
    setPageInput('1')
    setPageTexts({})
    setSearchTerm('')
    setSearchResults([])
    setSearchPerformed(false)
  }

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click()
  }

  const indexPdfText = async (file: File) => {
    setIsIndexingPdf(true)
    let pdfjsLib: typeof import('pdfjs-dist/legacy/build/pdf') | null = null
    let loadingTask: any = null
    try {
      pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc

      const arrayBuffer = await file.arrayBuffer()
      loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise

      setPdfNumPages(pdf.numPages)

      const textIndex: Record<number, string> = {}
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ')
        textIndex[pageNumber] = pageText.toLowerCase()
      }

      setPageTexts(textIndex)
    } catch (error) {
      console.error('Error indexing PDF:', error)
      setUploadError('Failed to process PDF text. Please try another file or re-upload.')
      resetPdfState()
    } finally {
      if (loadingTask) {
        await loadingTask.destroy().catch(() => {})
      }
      setIsIndexingPdf(false)
    }
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
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
    if (pdfObjectUrl) {
      URL.revokeObjectURL(pdfObjectUrl)
    }

    const objectUrl = URL.createObjectURL(file)
    setPdfObjectUrl(objectUrl)
    setPdfFileName(file.name)
    setCurrentPdfPage(1)
    setPageInput('1')
    setSearchTerm('')
    setSearchResults([])
    setSearchPerformed(false)

    await indexPdfText(file)
  }

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!searchTerm.trim()) {
      setSearchResults([])
      setSearchPerformed(true)
      return
    }

    if (!pageTexts || Object.keys(pageTexts).length === 0) {
      setSearchResults([])
      setSearchPerformed(true)
      return
    }

    const term = searchTerm.toLowerCase()
    const matches = Object.entries(pageTexts)
      .filter(([, text]) => text.includes(term))
      .map(([page]) => Number(page))

    setSearchResults(matches)
    setSearchPerformed(true)

    if (matches.length > 0) {
      const firstMatch = matches[0]
      setCurrentPdfPage(firstMatch)
      setPageInput(String(firstMatch))
    }
  }

  const handlePageJump = () => {
    if (!pdfNumPages) return
    const parsed = parseInt(pageInput, 10)
    if (Number.isNaN(parsed)) {
      return
    }
    const targetPage = Math.min(Math.max(parsed, 1), pdfNumPages)
    setCurrentPdfPage(targetPage)
    setPageInput(String(targetPage))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-violet-100">
      <NavBar currentPath="/training/fundamentals" user={user} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-20">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <Card className="border-purple-200 bg-white shadow-lg mb-8">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'student' | 'instructor')} className="space-y-6">
          <TabsList className="bg-purple-100/70 p-1 rounded-lg flex flex-wrap gap-2">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Student Portal
            </TabsTrigger>
            <TabsTrigger value="instructor" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Instructor Console
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Assignments</CardTitle>
                    <CardDescription className="text-gray-600">Submit required coursework and track your status.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {STUDENT_ASSIGNMENTS.map(assignment => (
                      <Card key={assignment.id} className="border border-gray-200 shadow-sm">
                        <CardContent className="p-4 space-y-3">
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
                            <span>{assignment.dueDate}</span>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Upload className="h-4 w-4 mr-1" /> Upload Work
                              </Button>
                              <Button size="sm" variant="secondary">
                                <Eye className="h-4 w-4 mr-1" /> View Rubric
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Lecture Library</CardTitle>
                    <CardDescription className="text-gray-600">Watch recorded modules before attending hands-on sessions.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {LECTURE_VIDEOS.map(video => (
                      <Card key={video.id} className="border border-gray-200 shadow-sm">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Video className="h-5 w-5 text-purple-600" />
                            <h3 className="text-base font-semibold text-gray-900">{video.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{video.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{video.duration}</span>
                            <Button size="sm" asChild>
                              <Link href={video.url}>Watch</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Training Materials Viewer</CardTitle>
                    <CardDescription className="text-gray-600">Search the uploaded e-book and jump directly to the pages your instructor assigns.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isIndexingPdf && (
                      <div className="rounded-md border border-purple-200 bg-purple-50 p-3 text-sm text-purple-800">
                        Indexing PDF text… Students will be able to search every page in a moment.
                      </div>
                    )}

                    {uploadError && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {uploadError}
                      </div>
                    )}

                    {!hasUploadedPdf && !isIndexingPdf && (
                      <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 text-center">
                        Instructors can upload the course PDF from the Instructor Console. Once added, it will appear here with full keyword search.
                      </div>
                    )}

                    {hasUploadedPdf && (
                      <>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                          <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
                            <Input
                              value={searchTerm}
                              onChange={(event) => setSearchTerm(event.target.value)}
                              placeholder="Search keywords (e.g., sanitation, pigment, contraindication)"
                              disabled={isIndexingPdf}
                            />
                            <Button type="submit" disabled={isIndexingPdf}>
                              <Search className="h-4 w-4 mr-1" /> Search
                            </Button>
                          </form>
                          <div className="flex items-center gap-2">
                            <Input
                              value={pageInput}
                              onChange={(event) => setPageInput(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault()
                                  handlePageJump()
                                }
                              }}
                              disabled={!pdfNumPages}
                              className="w-24"
                              placeholder="Page #"
                            />
                            <Button type="button" variant="outline" onClick={handlePageJump} disabled={!pdfNumPages}>
                              Go
                            </Button>
                          </div>
                        </div>

                        {searchPerformed && searchResults.length === 0 && !isIndexingPdf && (
                          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                            No matches found. Try another keyword or check that the PDF includes selectable text.
                          </div>
                        )}

                        {searchResults.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                            <span className="font-medium text-gray-800">Matches:</span>
                            {searchResults.map((page) => (
                              <Button
                                key={page}
                                size="sm"
                                variant={currentPdfPage === page ? 'default' : 'outline'}
                                onClick={() => {
                                  setCurrentPdfPage(page)
                                  setPageInput(String(page))
                                }}
                              >
                                Page {page}
                              </Button>
                            ))}
                          </div>
                        )}

                        <div className="rounded-lg border border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 text-xs text-gray-600">
                            <span>{pdfFileName}</span>
                            <span>Page {currentPdfPage} of {pdfNumPages || '—'}</span>
                          </div>
                          <div className="max-h-[600px] overflow-auto bg-white">
                            <TrainingPdfViewer
                              fileUrl={pdfObjectUrl}
                              pageNumber={currentPdfPage}
                              onDocumentLoadSuccess={(numPages) => {
                                setPdfNumPages(numPages)
                                if (currentPdfPage > numPages) {
                                  setCurrentPdfPage(numPages)
                                  setPageInput(String(numPages))
                                }
                              }}
                              onDocumentLoadError={(error) => {
                                console.error('PDF load error:', error)
                                setUploadError('Could not display the PDF. Please re-upload the file.')
                                resetPdfState()
                              }}
                            />
                          </div>
                          {pdfNumPages > 1 && (
                            <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-3 py-2 text-xs text-gray-600">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const previous = Math.max(1, currentPdfPage - 1)
                                  setCurrentPdfPage(previous)
                                  setPageInput(String(previous))
                                }}
                                disabled={currentPdfPage <= 1}
                              >
                                Previous
                              </Button>
                              <span className="flex-1 text-center">Page {currentPdfPage} / {pdfNumPages}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const next = Math.min(pdfNumPages, currentPdfPage + 1)
                                  setCurrentPdfPage(next)
                                  setPageInput(String(next))
                                }}
                                disabled={currentPdfPage >= pdfNumPages}
                              >
                                Next
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-purple-900">Progress Overview</CardTitle>
                    <CardDescription className="text-purple-700">Track your completion toward studio certification.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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

                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">Program Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700">
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
            </div>
          </TabsContent>

          <TabsContent value="instructor" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Attendance & Grading Console</CardTitle>
                  <CardDescription className="text-gray-600">Track class participation, grade submissions, and upload lecture updates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border border-gray-200 shadow-sm">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <ClipboardList className="h-5 w-5 text-purple-600" /> Attendance Logs
                        </div>
                        <p className="text-sm text-gray-600">Review sign-ins for in-person practicums and virtual lectures. Export attendance for compliance.</p>
                        <Button size="sm" variant="outline">Open Attendance Sheet</Button>
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-200 shadow-sm">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <PenSquare className="h-5 w-5 text-purple-600" /> Grade Submissions
                        </div>
                        <p className="text-sm text-gray-600">Review uploaded practice work, apply rubric scoring, and leave feedback for apprentices.</p>
                        <Button size="sm" variant="outline">Open Gradebook</Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border border-dashed border-purple-300 bg-purple-50">
                    <CardContent className="p-6 space-y-4 text-center">
                      <Upload className="h-8 w-8 text-purple-600 mx-auto" />
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-purple-900">Upload Lecture Video or Resources</h3>
                        <p className="text-sm text-purple-800">Attach MP4 lessons, slide decks, or assignment PDFs. Uploaded PDFs are instantly available in the student portal with full-text search.</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          variant="outline"
                          className="bg-white"
                          onClick={handleUploadButtonClick}
                          disabled={isIndexingPdf}
                        >
                          {isIndexingPdf ? 'Processing…' : 'Upload Files'}
                        </Button>
                        {pdfFileName && (
                          <span className="text-xs font-medium text-purple-800">Current PDF: {pdfFileName}</span>
                        )}
                        {uploadError && (
                          <span className="text-xs text-red-600">{uploadError}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-purple-900">Instructor Notes</CardTitle>
                  <CardDescription className="text-purple-700">Centralize communication with Directors and HR.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-purple-900">
                  <p>• Sync with Directors to confirm booth rent agreements before granting machine access.</p>
                  <p>• Log ProCell-only bookings for students via the room booking tool.</p>
                  <p>• Use permissions modal in Studio Team to adjust staff and HR access for training tools.</p>
                  <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 w-full">
                    <Link href="/studio/team">Open Permissions</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
