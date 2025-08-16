"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Download, Eye, Search } from "lucide-react"
import Link from "next/link"

export default function LibraryPage() {
  const resources = [
    {
      id: 1,
      title: "PMU Aftercare Instructions",
      description: "Complete guide for post-procedure care",
      category: "Aftercare",
      type: "PDF",
      downloadUrl: "/resources/aftercare-guide.pdf",
    },
    {
      id: 2,
      title: "Fitzpatrick Skin Type Guide",
      description: "Professional reference for skin typing",
      category: "Analysis",
      type: "PDF",
      downloadUrl: "/resources/fitzpatrick-guide.pdf",
    },
    {
      id: 3,
      title: "Pigment Color Theory",
      description: "Understanding undertones and color matching",
      category: "Education",
      type: "PDF",
      downloadUrl: "/resources/color-theory.pdf",
    },
    {
      id: 4,
      title: "Contraindication Checklist",
      description: "Safety screening reference",
      category: "Safety",
      type: "PDF",
      downloadUrl: "/resources/contraindications.pdf",
    },
  ]

  const handleView = (resource: any) => {
    // Open PDF in new tab for viewing
    window.open(resource.downloadUrl, "_blank")
  }

  const handleDownload = (resource: any) => {
    // Create download link and trigger download
    const link = document.createElement("a")
    link.href = resource.downloadUrl
    link.download = `${resource.title}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ivory)" }}>
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.03 }}>
        <img src="/images/pmu-guide-logo-transparent.png" alt="" className="w-3/5 max-w-2xl h-auto" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-charcoal)" }}>
            Resource Library
          </h1>
          <p className="text-lg" style={{ color: "var(--color-charcoal-light)" }}>
            Professional PMU guides, forms, and educational materials
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--color-lavender)" }}
            />
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-lavender)",
                focusRingColor: "var(--color-lavender)",
              }}
            />
          </div>
          <Button
            variant="outline"
            style={{
              borderColor: "var(--color-lavender)",
              color: "var(--color-lavender)",
            }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            All Categories
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: "var(--color-lavender-light)",
                      color: "var(--color-lavender)",
                    }}
                  >
                    {resource.category}
                  </Badge>
                  <Badge variant="outline">{resource.type}</Badge>
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    style={{
                      backgroundColor: "var(--color-lavender)",
                      color: "white",
                    }}
                    onClick={() => handleView(resource)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    style={{
                      borderColor: "var(--color-lavender)",
                      color: "var(--color-lavender)",
                    }}
                    onClick={() => handleDownload(resource)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard">
            <Button
              variant="outline"
              style={{
                borderColor: "var(--color-lavender)",
                color: "var(--color-lavender)",
              }}
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
