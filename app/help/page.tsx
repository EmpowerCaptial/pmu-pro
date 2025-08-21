"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  BookOpen, 
  Users, 
  Palette, 
  FileText, 
  Eye, 
  Settings, 
  MessageSquare, 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Star,
  HelpCircle,
  Mail,
  Phone,
  Calendar,
  Download,
  Upload,
  Camera,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Award,
  Rocket,
  Smartphone,
  Monitor
} from 'lucide-react'
import Link from 'next/link'
import InstallationGuide from '@/components/pwa/installation-guide'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketData, setTicketData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general'
  })

  // Help content organized by feature
  const helpContent = {
    overview: {
      title: "Welcome to PMU Pro! 🎨✨",
      description: "Your comprehensive platform for professional PMU practice management",
      icon: <Rocket className="h-8 w-8 text-lavender" />,
      sections: [
        {
          title: "What is PMU Pro?",
          content: "PMU Pro is your all-in-one platform for managing a professional PMU practice. From client management to skin analysis, pigment selection to resource management - everything you need is here!",
          tips: ["Start with the Dashboard to get an overview", "Use the navigation menu to explore features", "AI Leah is always available to help"]
        },
        {
          title: "Getting Started",
          content: "Begin your PMU Pro journey by exploring the dashboard and familiarizing yourself with the key features. Each tool is designed to enhance your practice and streamline your workflow.",
          steps: [
            "1. Explore the Dashboard overview",
            "2. Try adding your first client",
            "3. Test the skin analysis tools",
            "4. Browse the pigment library",
            "5. Download professional resources"
          ]
        }
      ]
    },
    dashboard: {
      title: "Dashboard Mastery 🎯",
      description: "Your command center for all PMU Pro features",
      icon: <Target className="h-8 w-8 text-blue-500" />,
      sections: [
        {
          title: "Dashboard Overview",
          content: "The dashboard is your central hub where you can access all PMU Pro features at a glance. It provides quick access to your most important tools and recent activities.",
          features: ["Quick access to all features", "Recent activity overview", "Navigation to all sections", "System status and updates"]
        },
        {
          title: "Navigation Tips",
          content: "Use the top navigation bar to move between different sections. The dashboard cards provide direct links to key features for quick access.",
          tips: ["Click on dashboard cards for quick access", "Use the top menu for detailed navigation", "Return buttons are available on all pages"]
        }
      ]
    },
    clients: {
      title: "Client Management System 👥",
      description: "Organize, track, and manage your PMU clients professionally",
      icon: <Users className="h-8 w-8 text-green-500" />,
      sections: [
        {
          title: "Adding New Clients",
          content: "Create comprehensive client profiles with all necessary information for PMU procedures.",
          steps: [
            "1. Click 'Add New Client' from the Clients page",
            "2. Fill in client information (name, email, phone, notes)",
            "3. Click 'Create Client' to save",
            "4. Client will appear in your client list immediately"
          ],
          tips: ["Always include contact information", "Add detailed notes about client preferences", "Use the search function to find clients quickly"]
        },
        {
          title: "Client Profiles",
          content: "Each client gets a comprehensive profile where you can manage documents, track procedures, and maintain consultation records.",
          features: [
            "Personal information and contact details",
            "Document management (ID, consent forms, photos)",
            "Procedure tracking and history",
            "Medical information and contraindications",
            "Insurance provider details"
          ]
        },
        {
          title: "Document Management",
          content: "Upload and organize all client-related documents including identification, consent forms, and procedure photos.",
          steps: [
            "1. Navigate to client profile",
            "2. Go to Documents tab",
            "3. Click 'Upload Document'",
            "4. Select document type and file",
            "5. Add notes and save"
          ]
        },
        {
          title: "Procedure Tracking",
          content: "Record and track all PMU procedures with detailed information about techniques, pigments, and settings used.",
          features: [
            "Procedure type and technique used",
            "Pigment brand, color, and lot number",
            "Needle configuration and voltage settings",
            "Procedure notes and observations",
            "Follow-up scheduling"
          ]
        }
      ]
    },
    skinAnalysis: {
      title: "Skin Analysis Tools 🔬",
      description: "Professional skin typing and pigment recommendations",
      icon: <Eye className="h-8 w-8 text-purple-500" />,
      sections: [
        {
          title: "Fitzpatrick Skin Type Analysis",
          content: "Determine your client's skin type using our advanced analysis tools for optimal pigment selection.",
          steps: [
            "1. Access Skin Analysis from dashboard",
            "2. Upload client photo or use camera",
            "3. Answer skin response questions",
            "4. Get automatic Fitzpatrick type determination",
            "5. Receive undertone analysis and pigment recommendations"
          ],
          tips: ["Good lighting improves accuracy", "Answer questions honestly for best results", "Save results to client profile"]
        },
        {
          title: "Undertone Detection",
          content: "Our system automatically detects cool, warm, or neutral undertones to help with pigment selection.",
          features: [
            "Automatic undertone detection",
            "Visual undertone indicators",
            "Pigment recommendations based on undertone",
            "Color theory guidance"
          ]
        },
        {
          title: "Pigment Recommendations",
          content: "Get personalized pigment suggestions based on skin type, undertone, and desired results.",
          benefits: [
            "Brand-specific recommendations",
            "Fitzpatrick type matching",
            "Undertone consideration",
            "Professional color theory"
          ]
        },
        {
          title: "Save to Profile",
          content: "Save analysis results directly to client profiles for future reference and treatment planning.",
          steps: [
            "1. Complete skin analysis",
            "2. Click 'Save to Profile'",
            "3. Enter client information if new",
            "4. Results saved to client profile"
          ]
        }
      ]
    },
    pigmentLibrary: {
      title: "Pigment Library Mastery 🎨",
      description: "Comprehensive pigment database with professional recommendations",
      icon: <Palette className="h-8 w-8 text-orange-500" />,
      sections: [
        {
          title: "Exploring the Pigment Library",
          content: "Browse our extensive collection of professional pigments from top brands with detailed recommendations.",
          features: [
            "24 professional pigments across 4 brands",
            "Fitzpatrick type recommendations",
            "Undertone matching guidance",
            "Visual color previews",
            "Professional product codes"
          ]
        },
        {
          title: "Search and Filter",
          content: "Find the perfect pigment quickly using our advanced search and filtering system.",
          steps: [
            "1. Use search bar for name, brand, or code",
            "2. Filter by brand using dropdown",
            "3. View results count and details",
            "4. Click on pigments for detailed view"
          ]
        },
        {
          title: "Brand Coverage",
          content: "Access professional pigments from industry-leading brands.",
          brands: [
            "Permablend - 6 shades (ash to chocolate)",
            "Evenflo - 6 shades (light to espresso)",
            "LI Pigments - 6 shades (light to rich)",
            "Quantum - 6 shades (ash to deep)"
          ]
        },
        {
          title: "Making Selections",
          content: "Choose pigments based on comprehensive analysis and professional recommendations.",
          tips: [
            "Consider Fitzpatrick skin type",
            "Match undertones appropriately",
            "Use visual color previews",
            "Reference product codes for ordering"
          ]
        }
      ]
    },
    resources: {
      title: "Resource Library 📚",
      description: "Professional forms, guides, and templates for your practice",
      icon: <FileText className="h-8 w-8 text-red-500" />,
      sections: [
        {
          title: "Available Resources",
          content: "Download professional PMU resources to enhance your practice and client consultations.",
          resources: [
            "PMU Aftercare Instructions - Complete healing protocol",
            "Fitzpatrick Skin Type Guide - Professional reference",
            "Pigment Color Theory - Color matching guidance",
            "Contraindication Checklist - Safety screening",
            "Client Consultation Form - Professional template",
            "Consent and Waiver Template - Legal forms"
          ]
        },
        {
          title: "Downloading Resources",
          content: "All resources are available for immediate download and printing.",
          steps: [
            "1. Browse resources by category",
            "2. Use search to find specific topics",
            "3. Click 'Download' button",
            "4. File downloads as text document",
            "5. Print or save for professional use"
          ]
        },
        {
          title: "Using Resources",
          content: "Integrate these professional resources into your daily practice.",
          applications: [
            "Client consultations and education",
            "Safety screening and documentation",
            "Aftercare instructions",
            "Professional forms and templates",
            "Staff training and reference"
          ]
        }
      ]
    },
    colorCorrection: {
      title: "Color Correction Tools 🔧",
      description: "Advanced tools for correcting and adjusting PMU results",
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      sections: [
        {
          title: "Understanding Color Correction",
          content: "Color correction is the process of adjusting or fixing PMU results that may have faded, changed color, or need adjustment.",
          whenToUse: [
            "Faded or lightened PMU results",
            "Color changes over time",
            "Unsatisfactory initial results",
            "Maintenance and touch-ups"
          ]
        },
        {
          title: "Using the Color Correction Tool",
          content: "Our advanced tool helps you visualize and plan color corrections.",
          steps: [
            "1. Upload current PMU photo",
            "2. Select areas needing correction",
            "3. Choose target colors",
            "4. Preview correction results",
            "5. Save correction plan"
          ]
        },
        {
          title: "Color Theory for Corrections",
          content: "Understanding color theory is crucial for successful corrections.",
          principles: [
            "Use complementary colors to neutralize",
            "Consider skin undertones",
            "Plan multiple sessions if needed",
            "Test colors on small areas first"
          ]
        }
      ]
    },
    staff: {
      title: "Staff Management System 👨‍💼",
      description: "Role-based access control and team management",
      icon: <Shield className="h-8 w-8 text-indigo-500" />,
      sections: [
        {
          title: "Staff Roles and Permissions",
          content: "PMU Pro includes a comprehensive staff management system with role-based access control.",
          roles: [
            "Representative - Basic access, view-only with approval",
            "Manager - Enhanced access, can approve changes",
            "Director - Full access to all features and settings"
          ]
        },
        {
          title: "Accessing Staff Admin",
          content: "Staff members can access the administrative system through the staff login.",
          steps: [
            "1. Navigate to staff admin login",
            "2. Enter username and password",
            "3. Access role-appropriate features",
            "4. Use Artist View Mode for client assistance"
          ]
        },
        {
          title: "Artist View Mode",
          content: "Staff can view client accounts from the user's perspective to provide better support.",
          features: [
            "View user dashboard and features",
            "Access client information",
            "Provide technical support",
            "Role-based editing permissions"
          ]
        }
      ]
    },
    aiLeah: {
      title: "AI Leah Assistant 🤖",
      description: "Your intelligent PMU and platform assistant",
      icon: <Star className="h-8 w-8 text-pink-500" />,
      sections: [
        {
          title: "What Leah Can Help With",
          content: "AI Leah is your comprehensive assistant for both PMU knowledge and platform navigation.",
          capabilities: [
            "PMU procedure information and guidance",
            "Platform navigation and feature explanations",
            "Skin analysis and pigment recommendations",
            "Aftercare and healing information",
            "Technical support and troubleshooting"
          ]
        },
        {
          title: "Getting the Most from Leah",
          content: "Ask Leah specific questions to get detailed, helpful responses.",
          tips: [
            "Be specific with your questions",
            "Ask about platform features",
            "Request PMU procedure guidance",
            "Use for troubleshooting help"
          ]
        },
        {
          title: "Contact Information",
          content: "Leah always provides contact information for additional support.",
          contact: "Email: admin@thepmuguide.com for technical support and questions"
        }
      ]
    },
    pwa: {
      title: "PWA Installation Guide 📱",
      description: "Learn how to install PMU Pro as a Progressive Web App (PWA) for a seamless mobile experience.",
      icon: <Smartphone className="h-8 w-8 text-teal-500" />,
      sections: [
        {
          title: "What is a PWA?",
          content: "A Progressive Web App (PWA) is a type of application software delivered through the web, built using common web technologies including HTML, CSS, and JavaScript. It provides a native app-like experience to users, with features like offline access, push notifications, and a standalone icon on the home screen.",
          benefits: [
            "Seamless mobile experience",
            "Offline access to all features",
            "Push notifications for important updates",
            "Standalone icon on home screen"
          ]
        },
        {
          title: "How to Install PMU Pro as a PWA",
          content: "Installing PMU Pro as a PWA is a simple process that requires a web browser that supports PWA features. Here's how to do it:",
          steps: [
            "1. Open your web browser (Chrome, Firefox, Edge, or Safari)",
            "2. Navigate to the PMU Pro website (https://your-app-url.com)",
            "3. Look for a 'Install App' or 'Add to Home Screen' button in the browser's address bar or menu.",
            "4. Click the button to add PMU Pro to your home screen.",
            "5. You may need to enable 'Install App' in your browser settings if it's not automatically offered."
          ],
          tips: [
            "Ensure your browser supports PWA features (Chrome, Firefox, Edge, Safari)",
            "Check for a '+' or 'Install App' button in the browser's address bar",
            "You might need to enable 'Install App' in your browser settings"
          ]
        },
        {
          title: "Benefits of PWA Installation",
          content: "Once installed, PMU Pro as a PWA offers several advantages:",
          benefits: [
            "No app store restrictions",
            "Instant updates",
            "Offline access to all features",
            "Push notifications for important updates",
            "Standalone icon on home screen"
          ]
        }
      ]
    }
  }

  // Filter content based on search
  const filteredContent = Object.entries(helpContent).filter(([key, content]) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      content.title.toLowerCase().includes(searchLower) ||
      content.description.toLowerCase().includes(searchLower) ||
      content.sections.some(section => 
        section.title.toLowerCase().includes(searchLower) ||
        section.content.toLowerCase().includes(searchLower)
      )
    )
  })

  // Handle ticket submission
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send to a ticketing system
    console.log('Ticket submitted:', ticketData)
    alert('Ticket submitted successfully! We\'ll get back to you soon.')
    setShowTicketForm(false)
    setTicketData({ subject: '', description: '', priority: 'medium', category: 'general' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Return Button */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="h-12 w-12 text-lavender" />
              <h1 className="text-4xl font-bold text-foreground">How to Use PMU Pro</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Master all the features of your PMU Pro platform with our comprehensive guide
            </p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for features, tips, or help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg border-2 border-lavender/30 focus:border-lavender"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4">
            <Button 
              onClick={() => setShowTicketForm(true)}
              className="gap-2 bg-lavender hover:bg-lavender/90"
            >
              <MessageSquare className="h-4 w-4" />
              Submit Support Ticket
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Guide
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="skinAnalysis">Skin Analysis</TabsTrigger>
            <TabsTrigger value="pigmentLibrary">Pigments</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="colorCorrection">Correction</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="pwa">PWA</TabsTrigger>
          </TabsList>

          {/* Content for each tab */}
          {filteredContent.map(([key, content]) => (
            <TabsContent key={key} value={key} className="space-y-6">
              {/* Feature Header */}
              <Card className="border-lavender/30 bg-lavender/5">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    {content.icon}
                    <h2 className="text-3xl font-bold text-foreground">{content.title}</h2>
                  </div>
                  <CardDescription className="text-lg">{content.description}</CardDescription>
                </CardHeader>
              </Card>

              {/* Feature Sections */}
              {content.sections.map((section, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{section.content}</p>
                    
                    {/* Steps */}
                    {'steps' in section && section.steps && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Play className="h-4 w-4 text-lavender" />
                          Steps to Follow
                        </h4>
                        <div className="space-y-2">
                          {section.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-1">{stepIndex + 1}</Badge>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tips */}
                    {'tips' in section && section.tips && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Pro Tips
                        </h4>
                        <ul className="space-y-1">
                          {section.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2">
                              <span className="text-lavender">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Features */}
                    {'features' in section && section.features && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-500" />
                          Key Features
                        </h4>
                        <ul className="space-y-1">
                          {section.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-2">
                              <span className="text-lavender">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Benefits */}
                    {'benefits' in section && section.benefits && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          Benefits
                        </h4>
                        <ul className="space-y-1">
                          {section.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-start gap-2">
                              <span className="text-lavender">•</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Applications */}
                    {'applications' in section && section.applications && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-500" />
                          Applications
                        </h4>
                        <ul className="space-y-1">
                          {section.applications.map((application, appIndex) => (
                            <li key={appIndex} className="flex items-start gap-2">
                              <span className="text-lavender">•</span>
                              <span>{application}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* When to Use */}
                    {'whenToUse' in section && section.whenToUse && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          When to Use
                        </h4>
                        <ul className="space-y-1">
                          {section.whenToUse.map((use, useIndex) => (
                            <li key={useIndex} className="flex items-start gap-2">
                              <span className="text-lavender">•</span>
                              <span>{use}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Principles */}
                    {'principles' in section && section.principles && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-indigo-500" />
                          Key Principles
                        </h4>
                        <ul className="space-y-1">
                          {section.principles.map((principle, principleIndex) => (
                            <li key={principleIndex} className="flex items-start gap-2">
                              <span className="text-lavender">•</span>
                              <span>{principle}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Contact */}
                    {'contact' in section && section.contact && (
                      <div className="p-3 bg-lavender/10 rounded-lg border border-lavender/20">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-lavender" />
                          Contact Information
                        </h4>
                        <p className="text-sm">{section.contact}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* PWA Installation Guide */}
        <div className="mt-12">
          <InstallationGuide />
        </div>

        {/* Support Section */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-lavender/10 to-blue-500/10 rounded-lg border border-lavender/20">
          <h3 className="text-2xl font-bold mb-4">Need More Help? 🆘</h3>
          <p className="text-lg text-muted-foreground mb-6">
            Our support team is here to help you master PMU Pro and grow your practice!
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button 
              onClick={() => setShowTicketForm(true)}
              className="gap-2 bg-lavender hover:bg-lavender/90"
            >
              <MessageSquare className="h-4 w-4" />
              Submit Support Ticket
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Email Support
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Email: <a href="mailto:admin@thepmuguide.com" className="text-lavender hover:underline">admin@thepmuguide.com</a></p>
            <p>Response time: Usually within 24 hours</p>
          </div>
        </div>
      </div>

      {/* Ticket Submission Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-lavender" />
                Submit Support Ticket
              </CardTitle>
              <CardDescription>
                Tell us what you need help with and we'll get back to you quickly!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select
                      value={ticketData.category}
                      onChange={(e) => setTicketData({...ticketData, category: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="general">General Support</option>
                      <option value="technical">Technical Issue</option>
                      <option value="feature">Feature Request</option>
                      <option value="billing">Billing Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority</label>
                    <select
                      value={ticketData.priority}
                      onChange={(e) => setTicketData({...ticketData, priority: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <textarea
                    value={ticketData.description}
                    onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
                    placeholder="Please describe your issue or question in detail..."
                    rows={4}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowTicketForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-lavender hover:bg-lavender/90">
                    Submit Ticket
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
