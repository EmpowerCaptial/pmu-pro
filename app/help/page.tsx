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
  Monitor,
  CreditCard,
  Facebook,
  Instagram,
  Link as LinkIcon,
  DollarSign,
  Clock,
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  RefreshCw,
  CalendarDays,
  Receipt,
  QrCode,
  Wallet
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
    aiAssistant: {
      title: "AI Assistant Integration 🤖",
      description: "Automate customer service and booking with intelligent AI",
      icon: <MessageSquare className="h-8 w-8 text-purple-500" />,
      sections: [
        {
          title: "What is the AI Assistant?",
          content: "The AI Assistant is an intelligent system that can automatically respond to customer messages on Facebook Messenger, book appointments, and provide 24/7 customer support for your PMU business.",
          benefits: [
            "24/7 automated customer service",
            "Automatic appointment booking",
            "Instant responses to common questions",
            "Integration with your booking platforms",
            "Reduces manual work and improves response time"
          ]
        },
        {
          title: "Setting Up Your AI Assistant",
          content: "Configure your AI Assistant to match your business needs and customer service style.",
          steps: [
            "1. Go to AI Assistant Settings in your dashboard",
            "2. Choose between AI Mode or Manual Response",
            "3. Set your business hours and availability",
            "4. Connect your booking platforms (Calendly, Square, etc.)",
            "5. Customize your greeting and response style",
            "6. Test the system with a sample message"
          ]
        },
        {
          title: "AI Response Modes",
          content: "Choose how your AI Assistant handles customer interactions.",
          features: [
            "AI Mode - Fully automated responses and booking",
            "Manual Mode - AI collects info, you handle responses",
            "Hybrid Mode - AI handles simple queries, you handle complex ones",
            "Booking Integration - AI checks availability and books appointments"
          ]
        },
        {
          title: "Booking Platform Integration",
          content: "Connect your AI Assistant to your existing booking systems for seamless appointment scheduling.",
          platforms: [
            "Calendly - Popular scheduling platform",
            "Acuity Scheduling - Advanced booking system",
            "Square Appointments - Payment-integrated booking",
            "Booksy - Beauty industry specific platform"
          ]
        },
        {
          title: "Customizing AI Responses",
          content: "Personalize your AI Assistant to match your brand voice and business style.",
          tips: [
            "Write a friendly, professional greeting",
            "Include your business hours and location",
            "Add information about your services and pricing",
            "Set up common FAQ responses",
            "Configure appointment confirmation messages"
          ]
        },
        {
          title: "Monitoring and Control",
          content: "Stay in control of your AI Assistant and monitor its performance.",
          features: [
            "Review all AI conversations",
            "Override AI responses when needed",
            "Monitor booking success rates",
            "Adjust settings based on performance",
            "Switch between AI and manual modes instantly"
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
    booking: {
      title: "Booking Calendar System 📅",
      description: "Complete appointment scheduling with client management and deposit payments",
      icon: <CalendarDays className="h-8 w-8 text-blue-500" />,
      sections: [
        {
          title: "Creating New Appointments",
          content: "The booking calendar allows you to schedule appointments with both new and existing clients, complete with service details and payment options.",
          steps: [
            "1. Navigate to the Booking page from your dashboard",
            "2. Click 'New Appointment' button",
            "3. Choose 'New Client' or 'Existing Client'",
            "4. Fill in appointment details (service, time, duration, price)",
            "5. Select payment method (Online Deposit or Pay in Person)",
            "6. Add notes and click 'Create Appointment'"
          ],
          tips: [
            "New clients are automatically added to your client database",
            "Service images appear on the calendar for easy identification",
            "Deposit links are automatically sent to clients for online payments",
            "All appointments are saved and visible on the calendar"
          ]
        },
        {
          title: "Client Selection Process",
          content: "When creating appointments, you can choose between adding a new client or selecting from your existing client database.",
          features: [
            "New Client: Complete form with contact information",
            "Existing Client: Search and select from your client list",
            "Automatic client database integration",
            "Client information pre-populated for existing clients"
          ]
        },
        {
          title: "Service Management Integration",
          content: "The booking system integrates with your services management to provide accurate service information and pricing.",
          features: [
            "Service list populated from your services database",
            "Default duration and pricing from service settings",
            "Service images displayed on calendar appointments",
            "Custom services support with image uploads"
          ]
        },
        {
          title: "Deposit Payment System",
          content: "Automated deposit collection system that sends payment links to clients for secure online payments.",
          features: [
            "30% deposit automatically calculated",
            "Secure Stripe payment processing",
            "Professional email notifications to clients",
            "Payment links expire after 7 days",
            "Integration with client portal for payment tracking"
          ],
          steps: [
            "1. Select 'Online Deposit' as payment method",
            "2. System calculates 30% deposit amount",
            "3. Unique payment link generated",
            "4. Professional email sent to client",
            "5. Client clicks link to complete payment",
            "6. Payment processed securely via Stripe"
          ]
        },
        {
          title: "Calendar View and Management",
          content: "View all your appointments in an organized calendar format with service details and client information.",
          features: [
            "Monthly calendar view with appointment blocks",
            "Service images displayed under 'Scheduled' text",
            "Click on dates to view appointment details",
            "Color-coded appointment blocks",
            "Easy navigation between months"
          ]
        }
      ]
    },
    services: {
      title: "Services Management 🎨",
      description: "Manage your PMU services with images, pricing, and custom options",
      icon: <ImageIcon className="h-8 w-8 text-purple-500" />,
      sections: [
        {
          title: "Service Management Overview",
          content: "The services management system allows you to create, edit, and organize all your PMU services with custom images and pricing.",
          features: [
            "Add, edit, and delete services",
            "Upload custom service images",
            "Set default pricing and duration",
            "Toggle service active/inactive status",
            "Organize services by category"
          ]
        },
        {
          title: "Adding New Services",
          content: "Create new services with complete details including images, pricing, and descriptions.",
          steps: [
            "1. Go to Services page from Features menu",
            "2. Click 'Add New Service' button",
            "3. Enter service name and description",
            "4. Set default duration and price",
            "5. Choose service category (PMU, Custom, etc.)",
            "6. Upload service image or use default",
            "7. Click 'Create Service' to save"
          ],
          tips: [
            "PMU services come with pre-generated AI images",
            "Custom services allow you to upload your own images",
            "Set realistic pricing based on your market",
            "Use descriptive names for easy identification"
          ]
        },
        {
          title: "Service Images and Icons",
          content: "Each service can have a custom image that appears on the booking calendar and throughout the system.",
          features: [
            "AI-generated images for standard PMU services",
            "Custom image upload for non-PMU services",
            "Images displayed on booking calendar",
            "Consistent image sizing and optimization",
            "Support for various image formats"
          ],
          applications: [
            "Visual service identification on calendar",
            "Professional service presentation",
            "Client recognition of services",
            "Brand consistency across platform"
          ]
        },
        {
          title: "Managing Existing Services",
          content: "Edit, update, and organize your existing services to keep your service menu current and professional.",
          steps: [
            "1. View all services on the Services page",
            "2. Click 'Edit' on any service",
            "3. Update service details as needed",
            "4. Change pricing or duration",
            "5. Upload new service image",
            "6. Toggle active/inactive status",
            "7. Save changes"
          ],
          tips: [
            "Regularly update pricing to reflect market changes",
            "Keep service descriptions current and accurate",
            "Use high-quality images for professional appearance",
            "Archive inactive services instead of deleting"
          ]
        },
        {
          title: "Service Categories and Organization",
          content: "Organize your services by category to make them easier to find and manage.",
          categories: [
            "PMU Services - Standard permanent makeup procedures",
            "Custom Services - Non-PMU services you offer",
            "Add-on Services - Additional treatments",
            "Package Deals - Combined service offerings"
          ],
          benefits: [
            "Easy service discovery for clients",
            "Organized booking calendar display",
            "Streamlined service management",
            "Professional service presentation"
          ]
        }
      ]
    },
    metaIntegration: {
      title: "Meta Integration 🤖",
      description: "Connect Facebook and Instagram for AI-powered DM responses",
      icon: <Facebook className="h-8 w-8 text-blue-600" />,
      sections: [
        {
          title: "What is Meta Integration?",
          content: "Meta Integration allows you to connect your Facebook Page and Instagram Business account to PMU Pro for AI-powered customer service and automated DM responses.",
          benefits: [
            "24/7 automated customer service",
            "AI-generated responses to Instagram DMs",
            "Seamless Facebook OAuth connection",
            "Professional customer interaction",
            "Reduced manual response time"
          ]
        },
        {
          title: "Setting Up Meta Integration",
          content: "Connect your Facebook Page and Instagram Business account in just a few simple steps.",
          steps: [
            "1. Go to Features page and click 'Meta Integration'",
            "2. Click 'Connect Facebook' button",
            "3. Log in with your Facebook account",
            "4. Grant permissions for Page access",
            "5. Select your Facebook Page",
            "6. System automatically links Instagram Business account",
            "7. Integration complete and ready to use"
          ],
          tips: [
            "Your Instagram must be a Business account linked to Facebook Page",
            "Grant all requested permissions for full functionality",
            "Only one Facebook Page can be connected per account",
            "Connection is secure and encrypted"
          ]
        },
        {
          title: "AI DM Response System",
          content: "The AI system automatically generates professional responses to Instagram direct messages.",
          features: [
            "Intelligent response generation using OpenAI",
            "Professional PMU industry knowledge",
            "Contextual understanding of client questions",
            "Brand-appropriate tone and style",
            "Automatic follow-up question suggestions"
          ],
          applications: [
            "Answering service inquiries",
            "Providing pricing information",
            "Scheduling appointment requests",
            "General PMU questions",
            "Aftercare instructions"
          ]
        },
        {
          title: "Managing Your Integration",
          content: "Monitor and manage your Meta integration from the dashboard and AI settings.",
          features: [
            "View connection status on dashboard",
            "See connected Facebook Page details",
            "Monitor Instagram Business account",
            "Disconnect and reconnect as needed",
            "Update integration settings"
          ],
          tips: [
            "Check connection status regularly",
            "Update permissions if Facebook changes requirements",
            "Test AI responses before going live",
            "Monitor response quality and adjust as needed"
          ]
        },
        {
          title: "Privacy and Security",
          content: "Your Meta integration is secure and complies with Facebook's privacy requirements.",
          features: [
            "Secure OAuth authentication",
            "Encrypted token storage",
            "Compliance with Facebook App Review",
            "Privacy Policy and Terms of Service available",
            "Data deletion request system"
          ],
          contact: "For privacy questions, visit our Privacy Policy page or contact admin@thepmuguide.com"
        }
      ]
    },
    calendarIntegration: {
      title: "Calendar Integration 📅",
      description: "Sync with external booking platforms like Calendly, Acuity, and more",
      icon: <RefreshCw className="h-8 w-8 text-green-500" />,
      sections: [
        {
          title: "External Calendar Integration",
          content: "Connect your existing booking platforms to PMU Pro for seamless appointment management and synchronization.",
          benefits: [
            "Sync with existing booking systems",
            "Unified appointment management",
            "Automatic calendar updates",
            "Reduced double-booking risk",
            "Streamlined workflow"
          ]
        },
        {
          title: "Supported Platforms",
          content: "PMU Pro integrates with popular booking and calendar platforms used by PMU artists.",
          platforms: [
            "Calendly - Popular scheduling platform",
            "Acuity Scheduling - Advanced booking system",
            "Google Calendar - Universal calendar access",
            "Outlook Calendar - Microsoft integration",
            "Bookly - Beauty industry specific",
            "SimplyBook.me - Multi-service booking"
          ],
          features: [
            "Bidirectional sync (import and export)",
            "Real-time appointment updates",
            "Webhook integration for instant sync",
            "API key authentication",
            "Custom sync frequency settings"
          ]
        },
        {
          title: "Setting Up Calendar Integration",
          content: "Configure your external calendar integration with your existing booking platform.",
          steps: [
            "1. Go to Features page and click 'Calendar Integration'",
            "2. Select your booking platform",
            "3. Enter your API key or webhook URL",
            "4. Choose sync direction (Import, Export, or Bidirectional)",
            "5. Set sync frequency (Real-time, Hourly, Daily)",
            "6. Test the connection",
            "7. Enable integration"
          ],
          tips: [
            "Get API keys from your booking platform's settings",
            "Test connection before enabling full sync",
            "Start with import-only to avoid conflicts",
            "Monitor sync status regularly"
          ]
        },
        {
          title: "Sync Directions and Options",
          content: "Choose how your calendars sync to match your workflow preferences.",
          options: [
            "Import Only - Bring external appointments into PMU Pro",
            "Export Only - Send PMU Pro appointments to external calendar",
            "Bidirectional - Full two-way synchronization"
          ],
          considerations: [
            "Start with Import Only for safety",
            "Use Bidirectional for complete integration",
            "Set appropriate sync frequency",
            "Monitor for sync conflicts"
          ]
        },
        {
          title: "Managing Integrations",
          content: "Monitor and manage your calendar integrations from the integration dashboard.",
          features: [
            "View all active integrations",
            "Monitor sync status and last sync time",
            "Test connections manually",
            "Update API keys and settings",
            "Disable or remove integrations",
            "View sync logs and errors"
          ],
          tips: [
            "Check sync status daily",
            "Update API keys before they expire",
            "Review sync logs for any issues",
            "Test integrations after platform updates"
          ]
        }
      ]
    },
    depositPayments: {
      title: "Deposit Payment System 💳",
      description: "Automated client deposit collection with secure payment processing",
      icon: <CreditCard className="h-8 w-8 text-green-500" />,
      sections: [
        {
          title: "Deposit Payment Overview",
          content: "The deposit payment system automatically generates secure payment links for clients to pay deposits online, reducing no-shows and securing appointments.",
          benefits: [
            "Automatic 30% deposit calculation",
            "Secure Stripe payment processing",
            "Professional email notifications",
            "Payment link expiration (7 days)",
            "Integration with client portal"
          ]
        },
        {
          title: "How Deposit Payments Work",
          content: "When creating appointments with online payment, the system automatically generates deposit payment links and sends them to clients.",
          steps: [
            "1. Create appointment with 'Online Deposit' payment method",
            "2. System calculates 30% deposit amount",
            "3. Unique payment link generated",
            "4. Professional email sent to client",
            "5. Client clicks link to complete payment",
            "6. Payment processed securely via Stripe",
            "7. Confirmation sent to both client and artist"
          ],
          features: [
            "Automatic deposit calculation",
            "Unique, secure payment links",
            "Professional email templates",
            "Mobile-optimized payment pages",
            "Payment confirmation emails"
          ]
        },
        {
          title: "Client Payment Experience",
          content: "Clients receive a professional payment experience with clear information about their deposit and remaining balance.",
          features: [
            "Professional branded payment page",
            "Clear payment breakdown (deposit, total, remaining)",
            "Secure Stripe checkout process",
            "Mobile-optimized design",
            "Payment confirmation and receipt"
          ],
          clientBenefits: [
            "Secure online payment processing",
            "Clear payment information",
            "Email receipts for all payments",
            "Easy payment completion",
            "Professional service experience"
          ]
        },
        {
          title: "Payment Management",
          content: "Track and manage all deposit payments from your dashboard and client portal.",
          features: [
            "View all pending and completed payments",
            "Track payment status and history",
            "Send payment reminders if needed",
            "Process refunds if necessary",
            "Generate payment reports"
          ],
          applications: [
            "Monitor payment completion rates",
            "Follow up on unpaid deposits",
            "Generate financial reports",
            "Track client payment history",
            "Manage refund requests"
          ]
        },
        {
          title: "Integration with Client Portal",
          content: "Deposit payments integrate seamlessly with the client portal for complete payment tracking.",
          features: [
            "Payment status visible in client portal",
            "Payment history tracking",
            "Remaining balance display",
            "Payment confirmation notifications",
            "Receipt storage and access"
          ],
          benefits: [
            "Complete payment transparency",
            "Client self-service payment tracking",
            "Reduced payment-related inquiries",
            "Professional client experience",
            "Automated payment management"
          ]
        },
        {
          title: "Security and Compliance",
          content: "All payment processing is secure and compliant with industry standards.",
          features: [
            "PCI DSS compliant Stripe processing",
            "Encrypted payment data transmission",
            "Secure payment link generation",
            "Payment link expiration for security",
            "Comprehensive payment logging"
          ],
          security: [
            "No sensitive payment data stored locally",
            "All payments processed by Stripe",
            "Secure HTTPS connections",
            "Payment link expiration",
            "Audit trail for all transactions"
          ]
        }
      ]
    },
    billing: {
      title: "Payment Processing 💰",
      description: "Accept client payments through multiple platforms and methods",
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      sections: [
        {
          title: "Payment Methods Overview",
          content: "PMU Pro supports multiple payment methods to help you accept payments from clients in the way that works best for your business.",
          paymentMethods: [
            "Venmo - Popular peer-to-peer payment app",
            "PayPal - Universal online payment platform",
            "CashApp - Mobile payment solution",
            "Zelle - Bank-to-bank transfers",
            "Stripe - Professional payment processing",
            "Cash - Traditional in-person payments"
          ]
        },
        {
          title: "Setting Up Payment Methods",
          content: "Configure your preferred payment methods to start accepting client payments.",
          steps: [
            "1. Go to Features page and click 'Billing'",
            "2. Review available payment methods",
            "3. Set up accounts for each method you want to use",
            "4. Configure payment links and QR codes",
            "5. Test payment methods with small amounts",
            "6. Enable methods for client use"
          ],
          tips: [
            "Start with methods your clients prefer",
            "Set up multiple options for flexibility",
            "Keep payment information updated",
            "Test all methods before going live"
          ]
        },
        {
          title: "Payment Links and QR Codes",
          content: "Generate payment links and QR codes for easy client payment processing.",
          features: [
            "Custom payment links for each service",
            "QR codes for in-person payments",
            "Mobile-optimized payment pages",
            "Automatic payment amount calculation",
            "Payment confirmation notifications"
          ],
          applications: [
            "Send payment links via text or email",
            "Display QR codes at your studio",
            "Include payment links in invoices",
            "Use QR codes for walk-in payments"
          ]
        },
        {
          title: "Stripe Integration",
          content: "Professional payment processing through Stripe for secure online payments.",
          features: [
            "Secure online payment processing",
            "Credit and debit card acceptance",
            "Automatic payment confirmation",
            "Professional payment receipts",
            "Integration with deposit payment system"
          ],
          benefits: [
            "Professional payment experience",
            "Secure payment processing",
            "Automatic receipt generation",
            "Payment tracking and reporting",
            "Integration with booking system"
          ]
        },
        {
          title: "Payment Tracking and Reporting",
          content: "Monitor all payments and generate reports for your business accounting.",
          features: [
            "Real-time payment status tracking",
            "Payment history and reports",
            "Revenue analytics and insights",
            "Tax reporting assistance",
            "Payment method performance analysis"
          ],
          applications: [
            "Daily payment reconciliation",
            "Monthly revenue reporting",
            "Tax preparation assistance",
            "Business performance analysis",
            "Client payment history tracking"
          ]
        },
        {
          title: "Fees and Costs",
          content: "Understand the fees associated with different payment methods to make informed decisions.",
          feeStructure: [
            "Venmo: Free for personal accounts, business fees apply",
            "PayPal: 2.9% + $0.30 per transaction",
            "CashApp: Free for personal, business fees apply",
            "Zelle: Free (bank-dependent)",
            "Stripe: 2.9% + $0.30 per transaction",
            "Cash: No fees"
          ],
          tips: [
            "Consider fees when setting prices",
            "Offer multiple payment options",
            "Factor fees into service pricing",
            "Use cash for larger payments to avoid fees"
          ]
        }
      ]
    },
    settings: {
      title: "Settings & Account Management ⚙️",
      description: "Manage your account settings, subscription, and profile information",
      icon: <Settings className="h-8 w-8 text-gray-500" />,
      sections: [
        {
          title: "Account Settings Overview",
          content: "The Settings page allows you to manage your account information, subscription, and platform preferences.",
          features: [
            "Profile information management",
            "Subscription plan management",
            "Password and security settings",
            "Notification preferences",
            "Platform customization options"
          ]
        },
        {
          title: "Profile Management",
          content: "Update your personal and business information to keep your profile current.",
          steps: [
            "1. Go to Settings page from dashboard",
            "2. Update personal information (name, email, phone)",
            "3. Edit business information (business name, address)",
            "4. Upload or change profile photo",
            "5. Update contact information",
            "6. Save changes"
          ],
          tips: [
            "Keep contact information current",
            "Use professional business name",
            "Upload high-quality profile photo",
            "Verify email address for notifications"
          ]
        },
        {
          title: "Subscription Management",
          content: "View and manage your PMU Pro subscription plan and billing information.",
          features: [
            "Current plan display and details",
            "Plan comparison and upgrade options",
            "Billing history and invoices",
            "Payment method management",
            "Subscription cancellation options"
          ],
          plans: [
            "Basic Plan - Essential PMU tools",
            "Professional Plan - Advanced features",
            "Enterprise Plan - Full platform access"
          ],
          benefits: [
            "Flexible plan options",
            "Easy plan upgrades",
            "Transparent billing",
            "Cancel anytime policy"
          ]
        },
        {
          title: "Security Settings",
          content: "Manage your account security and password settings.",
          features: [
            "Change password",
            "Two-factor authentication setup",
            "Login session management",
            "Account security monitoring",
            "Privacy settings"
          ],
          securityTips: [
            "Use strong, unique passwords",
            "Enable two-factor authentication",
            "Regularly review login sessions",
            "Keep security information updated",
            "Log out from shared devices"
          ]
        },
        {
          title: "Notification Preferences",
          content: "Customize how and when you receive notifications from PMU Pro.",
          notificationTypes: [
            "Email notifications for appointments",
            "SMS notifications for urgent updates",
            "Push notifications for mobile app",
            "Marketing and feature updates",
            "Payment and billing notifications"
          ],
          customization: [
            "Choose notification frequency",
            "Select notification methods",
            "Set quiet hours",
            "Customize notification content",
            "Manage subscription preferences"
          ]
        },
        {
          title: "Platform Customization",
          content: "Customize your PMU Pro experience to match your preferences and workflow.",
          options: [
            "Dashboard layout preferences",
            "Default service settings",
            "Calendar view options",
            "Theme and appearance settings",
            "Language and region settings"
          ],
          benefits: [
            "Personalized user experience",
            "Optimized workflow",
            "Improved productivity",
            "Reduced setup time",
            "Consistent preferences across devices"
          ]
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
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige relative overflow-hidden">
      {/* Background Logo Watermark - Fixed Position */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/images/pmu-guide-logo.png"
          alt="PMU Guide Background"
          className="w-[60%] max-w-2xl h-auto opacity-5 object-contain"
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Mobile Header - Title First */}
        <div className="md:hidden mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="h-10 w-10 text-lavender" />
              <h1 className="text-2xl font-bold text-foreground">How to Use PMU Pro</h1>
            </div>
            <p className="text-base text-muted-foreground px-4">
              Master all PMU Pro features with our comprehensive guide
            </p>
          </div>
          <div className="flex justify-start">
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2 bg-white/90 backdrop-blur-sm border-lavender/30 hover:bg-lavender/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Desktop Header - Original Layout */}
        <div className="hidden md:flex items-center justify-between mb-8">
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
        <div className="mb-8">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center justify-center gap-4">
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

          {/* Mobile Actions - Square Grid Layout */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setShowTicketForm(true)}
              className="h-20 bg-gradient-to-br from-lavender to-purple-600 hover:from-lavender/90 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-center">
                <MessageSquare className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Support Ticket</span>
              </div>
            </Button>
            <Button 
              variant="outline"
              className="h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            >
              <div className="text-center">
                <Mail className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Contact Support</span>
              </div>
            </Button>
            <Button 
              variant="outline"
              className="h-20 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            >
              <div className="text-center">
                <Download className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Download Guide</span>
              </div>
            </Button>
            <Button 
              variant="outline"
              className="h-20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            >
              <div className="text-center">
                <HelpCircle className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Quick Help</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tab List */}
          <TabsList className="hidden lg:grid w-full grid-cols-12 bg-white/90 backdrop-blur-sm border border-lavender/20 p-1 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-lavender/10 transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-blue-50 transition-all duration-200"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="clients"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-green-50 transition-all duration-200"
            >
              Clients
            </TabsTrigger>
            <TabsTrigger 
              value="booking"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-blue-50 transition-all duration-200"
            >
              Booking
            </TabsTrigger>
            <TabsTrigger 
              value="services"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-purple-50 transition-all duration-200"
            >
              Services
            </TabsTrigger>
            <TabsTrigger 
              value="skinAnalysis"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-purple-50 transition-all duration-200"
            >
              Skin Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="pigmentLibrary"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-orange-50 transition-all duration-200"
            >
              Pigments
            </TabsTrigger>
            <TabsTrigger 
              value="metaIntegration"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-700 data-[state=active]:to-blue-800 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-blue-50 transition-all duration-200"
            >
              Meta AI
            </TabsTrigger>
            <TabsTrigger 
              value="calendarIntegration"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-green-50 transition-all duration-200"
            >
              Calendar
            </TabsTrigger>
            <TabsTrigger 
              value="depositPayments"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-700 data-[state=active]:to-green-800 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-green-50 transition-all duration-200"
            >
              Payments
            </TabsTrigger>
            <TabsTrigger 
              value="billing"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-800 data-[state=active]:to-green-900 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-green-50 transition-all duration-200"
            >
              Billing
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 transition-all duration-200"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Mobile Box Grid - Enhanced Professional Design */}
          <div className="lg:hidden grid grid-cols-2 gap-3 p-2">
            {[
              { key: 'overview', title: 'Overview', icon: <Rocket className="h-7 w-7" />, color: 'from-lavender to-purple-500', description: 'Get Started' },
              { key: 'dashboard', title: 'Dashboard', icon: <Target className="h-7 w-7" />, color: 'from-blue-500 to-blue-600', description: 'Main Hub' },
              { key: 'clients', title: 'Clients', icon: <Users className="h-7 w-7" />, color: 'from-green-500 to-green-600', description: 'Management' },
              { key: 'booking', title: 'Booking', icon: <CalendarDays className="h-7 w-7" />, color: 'from-blue-600 to-blue-700', description: 'Calendar' },
              { key: 'services', title: 'Services', icon: <ImageIcon className="h-7 w-7" />, color: 'from-purple-500 to-purple-600', description: 'Management' },
              { key: 'skinAnalysis', title: 'Skin Analysis', icon: <Eye className="h-7 w-7" />, color: 'from-purple-600 to-purple-700', description: 'AI Tools' },
              { key: 'pigmentLibrary', title: 'Pigments', icon: <Palette className="h-7 w-7" />, color: 'from-orange-500 to-orange-600', description: 'Color Guide' },
              { key: 'metaIntegration', title: 'Meta AI', icon: <Facebook className="h-7 w-7" />, color: 'from-blue-700 to-blue-800', description: 'DM Responses' },
              { key: 'calendarIntegration', title: 'Calendar', icon: <RefreshCw className="h-7 w-7" />, color: 'from-green-600 to-green-700', description: 'Sync' },
              { key: 'depositPayments', title: 'Payments', icon: <CreditCard className="h-7 w-7" />, color: 'from-green-700 to-green-800', description: 'Deposits' },
              { key: 'billing', title: 'Billing', icon: <DollarSign className="h-7 w-7" />, color: 'from-green-800 to-green-900', description: 'Payment Methods' },
              { key: 'settings', title: 'Settings', icon: <Settings className="h-7 w-7" />, color: 'from-gray-500 to-gray-600', description: 'Account' }
            ].map((tab) => (
              <Card 
                key={tab.key}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 ${
                  activeTab === tab.key 
                    ? 'ring-2 ring-lavender ring-offset-2 shadow-xl bg-gradient-to-br from-lavender/10 to-purple-100' 
                    : 'hover:shadow-lg bg-white/95 backdrop-blur-sm'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-r ${tab.color} flex items-center justify-center text-white shadow-lg`}>
                    {tab.icon}
                  </div>
                  <h3 className="font-bold text-sm text-gray-800 mb-1">{tab.title}</h3>
                  <p className="text-xs text-gray-600 font-medium">{tab.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

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
