"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Mail, Home, Shield, Users, AlertTriangle, FileCheck, MapPin, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const documents = [
  {
    id: "photo-permission",
    title: "Permission to Use Photo for Public Post",
    description: "Client consent form for using before/after photos in marketing materials",
    category: "Marketing",
    icon: <Eye className="h-5 w-5" />,
    required: false,
    downloadUrl: "/documents/photo-permission-form.pdf",
  },
  {
    id: "tattoo-consent",
    title: "Missouri Adult Informed Consent",
    description: "Missouri state-compliant adult informed consent form for tattooing procedures",
    category: "Legal",
    icon: <FileCheck className="h-5 w-5" />,
    required: true,
    downloadUrl: "/documents/missouri-adult-consent.pdf",
  },
  {
    id: "parental-consent",
    title: "Missouri Minor Consent (Parent/Guardian)",
    description: "Required consent form for tattooing minors in Missouri with parent/guardian signature",
    category: "Legal",
    icon: <Users className="h-5 w-5" />,
    required: true,
    downloadUrl: "/documents/missouri-minor-consent.pdf",
  },
  {
    id: "medical-history",
    title: "Missouri Medical History & Contraindications",
    description: "Medical history assessment and contraindication screening form",
    category: "Medical",
    icon: <AlertTriangle className="h-5 w-5" />,
    required: true,
    downloadUrl: "/documents/missouri-medical-history.pdf",
  },
  {
    id: "resuscitation-waiver",
    title: "Waiver Form Indicating Resuscitation Permission",
    description: "Medical emergency response authorization and liability waiver",
    category: "Medical",
    icon: <AlertTriangle className="h-5 w-5" />,
    required: true,
    downloadUrl: "/documents/resuscitation-waiver.pdf",
  },
  {
    id: "procedure-record",
    title: "Missouri Tattoo Procedure Record",
    description: "Technician procedure record for documentation and compliance",
    category: "Legal",
    icon: <FileCheck className="h-5 w-5" />,
    required: true,
    downloadUrl: "/documents/missouri-procedure-record.pdf",
  },
  {
    id: "aftercare-instructions",
    title: "Missouri Tattoo Aftercare Instructions",
    description: "Standard aftercare instructions for tattoo healing and maintenance",
    category: "Medical",
    icon: <Shield className="h-5 w-5" />,
    required: true,
    downloadUrl: "/documents/missouri-aftercare-instructions.pdf",
  },
  {
    id: "missouri-forms",
    title: "Missouri Standard Forms for Tattooing",
    description: "State-specific forms required for tattooing in Missouri",
    category: "State Compliance",
    icon: <MapPin className="h-5 w-5" />,
    required: true,
    downloadUrl: "/documents/missouri-tattoo-forms.pdf",
  },
  {
    id: "missouri-regulations",
    title: "Missouri State Regulations with Standard of Practice",
    description: "Complete guide to Missouri tattooing regulations and professional standards",
    category: "State Compliance",
    icon: <Shield className="h-5 w-5" />,
    required: true,
    downloadUrl: "/documents/missouri-regulations-standards.pdf",
  },
]

const categories = ["All", "Legal", "Medical", "Marketing", "State Compliance"]

export default function StandardDocumentsPage() {
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const handleView = (doc: any) => {
    setSelectedDocument(doc)
    setShowModal(true)
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSendEmail = (documentTitle: string) => {
    const subject = encodeURIComponent(`${documentTitle} - PMU Pro`)
    const body = encodeURIComponent(
      `Please find the attached ${documentTitle} document. If you have any questions, please contact our studio.`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Watermark Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/images/pmu-guide-logo-transparent.png"
          alt="PMU Guide Watermark"
          className="w-[60%] max-w-2xl h-auto opacity-[0.15] object-contain"
        />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-ink mb-2">Standard Documents</h1>
              <p className="text-ink/70">
                Legal forms, consent documents, and state regulations for client files and insurance
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5 bg-transparent">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Documents Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-lavender/10 rounded-lg flex items-center justify-center text-lavender">
                        {doc.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-ink leading-tight">{doc.title}</CardTitle>
                      </div>
                    </div>
                    {doc.required && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-ink/70 mt-2">{doc.description}</CardDescription>
                  <Badge variant="outline" className="w-fit mt-2">
                    {doc.category}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-lavender/30 text-lavender hover:bg-lavender/5 bg-transparent"
                      onClick={() => handleView(doc)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-lavender hover:bg-lavender-600 text-white"
                      onClick={() => handleDownload(doc.downloadUrl, `${doc.title}.pdf`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-lavender/30 text-lavender hover:bg-lavender/5 bg-transparent"
                      onClick={() => handleSendEmail(doc.title)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Important Notice */}
          <Card className="mt-8 bg-lavender/5 border-lavender/30">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-lavender mt-1" />
                <div>
                  <h3 className="font-semibold text-ink mb-2">Important Legal Notice</h3>
                  <p className="text-ink/70 text-sm leading-relaxed">
                    These documents are provided as templates and may need to be customized for your specific location
                    and practice. Always consult with a qualified attorney to ensure compliance with local, state, and
                    federal regulations. PMU Pro is not responsible for legal compliance - these forms are for reference
                    only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal for displaying document content */}
      {showModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-ink">{selectedDocument.title}</h2>
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="prose max-w-none">
                {selectedDocument.id === "tattoo-consent" && (
                  <div className="space-y-4 text-sm">
                    <h3 className="font-bold">Missouri Tattoo Adult Informed Consent</h3>
                    <p>
                      <strong>Purpose:</strong> This consent form confirms the client's informed consent to receive a
                      tattoo at the establishment named below.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Client Disclosures (initial each):</h4>
                      <p>___ I am at least 18 years old and am not under the influence of alcohol or drugs.</p>
                      <p>___ I do not have known conditions that would impair healing.</p>
                      <p>
                        ___ I understand the procedure involves needles and blood and that risks include infection,
                        allergic reaction, scarring, and dissatisfaction with appearance.
                      </p>
                      <p>___ I have received and read written aftercare instructions.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p>
                          <strong>Design/description:</strong> _______________________
                        </p>
                        <p>
                          <strong>Location:</strong> _______________________
                        </p>
                        <p>
                          <strong>Single-use needle lot #:</strong> __________________
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Ink/pigment lot(s) #:</strong> ______________
                        </p>
                        <p>
                          <strong>Start time:</strong> __________ <strong>End time:</strong> __________
                        </p>
                        <p>
                          <strong>Artist initials:</strong> ______
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Add other document content as needed */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
