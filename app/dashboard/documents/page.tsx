import { DocumentViewer } from "@/components/consent/document-viewer"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function DashboardDocumentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">View and manage signed consent forms</p>
        </div>
        <DocumentViewer />
      </main>
    </div>
  )
}

