"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Download, FileText, BookOpen, Shield, FileCheck, Clipboard, AlertTriangle, Mail } from 'lucide-react'
import { getAllPDFResources, PDFResource } from '@/lib/pdf-generator'
import Link from 'next/link'

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  
  const resources = getAllPDFResources()
  
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = activeTab === 'all' || resource.category === activeTab
    
    return matchesSearch && matchesTab
  })

  const categories = ['all', 'licensing', 'establishment', 'regulations', 'renewal', 'inspection', 'consent']
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'licensing': return <FileCheck className="h-5 w-5" />
      case 'establishment': return <Shield className="h-5 w-5" />
      case 'regulations': return <BookOpen className="h-5 w-5" />
      case 'renewal': return <Clipboard className="h-5 w-5" />
      case 'inspection': return <AlertTriangle className="h-5 w-5" />
      case 'consent': return <FileText className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'licensing': return 'bg-blue-100 text-blue-800'
      case 'establishment': return 'bg-green-100 text-green-800'
      case 'regulations': return 'bg-purple-100 text-purple-800'
      case 'renewal': return 'bg-orange-100 text-orange-800'
      case 'inspection': return 'bg-red-100 text-red-800'
      case 'consent': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'licensing': return 'Licensing'
      case 'establishment': return 'Establishment'
      case 'regulations': return 'Regulations'
      case 'renewal': return 'Renewal'
      case 'inspection': return 'Inspection'
      case 'consent': return 'Consent Forms'
      default: return 'All Documents'
    }
  }

  const handleDownload = async (resource: PDFResource) => {
    try {
      // For now, we'll create a text file with the content
      // In production, this would generate actual PDFs
      const content = generatePDFContent(resource)
      const blob = new Blob([content], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resource.title.replace(/\s+/g, '_')}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  const generatePDFContent = (resource: PDFResource): string => {
    let content = `${resource.title}\n`
    content += `${'='.repeat(resource.title.length)}\n\n`
    content += `Category: ${resource.category}\n\n`
    
    resource.sections.forEach((section, index) => {
      content += `${index + 1}. ${section.title}\n`
      content += `${'-'.repeat(section.title.length + 3)}\n`
      
      if (section.subsections) {
        section.subsections.forEach((subsection, subIndex) => {
          content += `  ${index + 1}.${subIndex + 1} ${subsection.title}\n`
          content += `     ${subsection.content}\n\n`
        })
      }
    })
    
    return content
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Resource Library</h1>
          <p className="text-lg text-muted-foreground">
            Official Missouri Board documents and professional resources for PMU artists
          </p>
        </div>

        {/* Return to Dashboard */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              ← Return to Dashboard
            </Button>
          </Link>
        </div>

        {/* Search and Category Dropdown */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lavender h-4 w-4" />
              <Input
                placeholder="Search documents by title, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-lavender/30 focus:border-lavender"
              />
            </div>
            
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full sm:w-48 px-4 py-2 border border-lavender/30 rounded-md bg-white focus:border-lavender focus:outline-none text-sm font-medium text-foreground shadow-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredResources.length} of {resources.length} documents
        </div>

        {/* Documents Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(resource.category)}
                    <Badge className={getCategoryColor(resource.category)}>
                      {getCategoryName(resource.category)}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription className="text-sm">
                  {resource.content[0]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-gray-500">
                    <p><strong>Category:</strong> {resource.category}</p>
                    <p><strong>Sections:</strong> {resource.sections.length}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleDownload(resource)}
                      size="sm" 
                      className="flex-1"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No documents found' : 'No documents available'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms or selecting a different category'
                  : 'Documents will be available here once added to the system'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Need Official Missouri Board Documents?
              </h3>
              <p className="text-blue-700 mb-4">
                For the most current official forms and applications, visit the Missouri Board of Tattoo, Branding and Piercing website.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  variant="outline" 
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => window.open('https://health.mo.gov/living/healthcondiseases/communicable/tattoo/', '_blank')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Visit Missouri Board Website
                </Button>
                <Button 
                  variant="outline" 
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => window.location.href = 'mailto:admin@thepmuguide.com?subject=Missouri Board Documents Request'}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
