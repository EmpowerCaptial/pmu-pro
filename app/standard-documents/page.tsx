"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Eye, Mail, Home, Shield, Users, AlertTriangle, FileCheck, MapPin, X, Upload, Settings, FileText } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { PDFUploadManager } from "@/components/admin/pdf-upload-manager"

// Sample PDF documents - these would be replaced by uploaded documents
const sampleDocuments = [
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
    downloadUrl: "/documents/missouri-resuscitation-waiver.pdf",
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
  const [showUploadManager, setShowUploadManager] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'documents' | 'upload'>('documents')
  const [selectedState, setSelectedState] = useState<string>('all')

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

  const getFilteredDocuments = () => {
    const allDocuments = [...uploadedDocuments, ...sampleDocuments]
    
    if (selectedState === 'all') {
      return allDocuments
    }
    
    // Filter documents by state
    return allDocuments.filter(doc => {
      // Check if document has state-specific information
      if (doc.state && doc.state.toLowerCase() === selectedState.toLowerCase()) {
        return true
      }
      
      // Check if document is national/universal
      if (doc.state === 'National' || doc.state === 'national') {
        return true
      }
      
      // Check if document title contains state information
      if (doc.title.toLowerCase().includes(selectedState.toLowerCase())) {
        return true
      }
      
      // Check if document description contains state information
      if (doc.description.toLowerCase().includes(selectedState.toLowerCase())) {
        return true
      }
      
      return false
    })
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
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setActiveTab(activeTab === 'documents' ? 'upload' : 'documents')}
                className="bg-lavender hover:bg-lavender-600 text-white"
              >
                {activeTab === 'documents' ? (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload PDFs
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    View Documents
                  </>
                )}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5 bg-transparent">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'documents'
                  ? 'bg-white text-lavender shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📄 View Documents
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-lavender shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📤 Upload PDFs
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'documents' ? (
            <>
              {/* State Filter for Artists */}
              <div className="mb-6">
                <Card className="bg-lavender/5 border-lavender/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor="state-filter" className="text-sm font-medium text-lavender-700">
                          🌍 Select Your State to View Relevant Documents
                        </Label>
                        <Select 
                          value={selectedState} 
                          onValueChange={(value) => setSelectedState(value)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select your state to filter documents" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60">
                            <SelectItem value="all">All States - View All Documents</SelectItem>
                            <SelectItem value="alabama">Alabama</SelectItem>
                            <SelectItem value="alaska">Alaska</SelectItem>
                            <SelectItem value="arizona">Arizona</SelectItem>
                            <SelectItem value="arkansas">Arkansas</SelectItem>
                            <SelectItem value="california">California</SelectItem>
                            <SelectItem value="colorado">Colorado</SelectItem>
                            <SelectItem value="connecticut">Connecticut</SelectItem>
                            <SelectItem value="delaware">Delaware</SelectItem>
                            <SelectItem value="florida">Florida</SelectItem>
                            <SelectItem value="georgia">Georgia</SelectItem>
                            <SelectItem value="hawaii">Hawaii</SelectItem>
                            <SelectItem value="idaho">Idaho</SelectItem>
                            <SelectItem value="illinois">Illinois</SelectItem>
                            <SelectItem value="indiana">Indiana</SelectItem>
                            <SelectItem value="iowa">Iowa</SelectItem>
                            <SelectItem value="kansas">Kansas</SelectItem>
                            <SelectItem value="kentucky">Kentucky</SelectItem>
                            <SelectItem value="louisiana">Louisiana</SelectItem>
                            <SelectItem value="maine">Maine</SelectItem>
                            <SelectItem value="maryland">Maryland</SelectItem>
                            <SelectItem value="massachusetts">Massachusetts</SelectItem>
                            <SelectItem value="michigan">Michigan</SelectItem>
                            <SelectItem value="minnesota">Minnesota</SelectItem>
                            <SelectItem value="mississippi">Mississippi</SelectItem>
                            <SelectItem value="missouri">Missouri</SelectItem>
                            <SelectItem value="montana">Montana</SelectItem>
                            <SelectItem value="nebraska">Nebraska</SelectItem>
                            <SelectItem value="nevada">Nevada</SelectItem>
                            <SelectItem value="new-hampshire">New Hampshire</SelectItem>
                            <SelectItem value="new-jersey">New Jersey</SelectItem>
                            <SelectItem value="new-mexico">New Mexico</SelectItem>
                            <SelectItem value="new-york">New York</SelectItem>
                            <SelectItem value="north-carolina">North Carolina</SelectItem>
                            <SelectItem value="north-dakota">North Dakota</SelectItem>
                            <SelectItem value="ohio">Ohio</SelectItem>
                            <SelectItem value="oklahoma">Oklahoma</SelectItem>
                            <SelectItem value="oregon">Oregon</SelectItem>
                            <SelectItem value="pennsylvania">Pennsylvania</SelectItem>
                            <SelectItem value="rhode-island">Rhode Island</SelectItem>
                            <SelectItem value="south-carolina">South Carolina</SelectItem>
                            <SelectItem value="south-dakota">South Dakota</SelectItem>
                            <SelectItem value="tennessee">Tennessee</SelectItem>
                            <SelectItem value="texas">Texas</SelectItem>
                            <SelectItem value="utah">Utah</SelectItem>
                            <SelectItem value="vermont">Vermont</SelectItem>
                            <SelectItem value="virginia">Virginia</SelectItem>
                            <SelectItem value="washington">Washington</SelectItem>
                            <SelectItem value="west-virginia">West Virginia</SelectItem>
                            <SelectItem value="wisconsin">Wisconsin</SelectItem>
                            <SelectItem value="wyoming">Wyoming</SelectItem>
                            <SelectItem value="district-of-columbia">District of Columbia</SelectItem>
                            <SelectItem value="national">National (All States)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-600 mt-2">
                          Select your state to see documents specific to your location, or choose "All States" to view all available documents.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Documents Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredDocuments().map((doc) => (
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
            </>
          ) : (
            /* PDF Upload Manager */
            <PDFUploadManager
              documents={uploadedDocuments}
              onDocumentsChange={setUploadedDocuments}
            />
          )}
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
