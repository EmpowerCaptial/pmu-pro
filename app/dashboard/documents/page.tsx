"use client"

import { DocumentViewer } from "@/components/consent/document-viewer"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function DocumentsPageContent() {
  const searchParams = useSearchParams()
  const highlightFormId = searchParams.get('highlight')

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">View and manage signed consent forms</p>
          {highlightFormId && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                📋 Showing consent form: <span className="font-semibold">{highlightFormId}</span>
              </p>
            </div>
          )}
        </div>
        <DocumentViewer highlightFormId={highlightFormId} />
      </main>
    </div>
  )
}

export default function DashboardDocumentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">View and manage signed consent forms</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
              <p className="text-muted">Loading documents...</p>
            </div>
          </div>
        </main>
      </div>
    }>
      <DocumentsPageContent />
    </Suspense>
  )
}


