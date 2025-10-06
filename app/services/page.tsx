"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { NavBar } from '@/components/ui/navbar'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Clock, 
  DollarSign, 
  Tag,
  Search,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  List,
  Menu
} from 'lucide-react'
import { 
  Service,
  getServices,
  createService,
  updateService,
  deleteService,
  getActiveServices,
  getServiceById,
  getServiceCategories,
  DEFAULT_PMU_SERVICES
} from '@/lib/services-api'
import { useDemoAuth } from '@/hooks/use-demo-auth'

export default function ServicesPage() {
  const router = useRouter()
  const { currentUser, isAuthenticated } = useDemoAuth()
  const [services, setServices] = useState<Service[]>([])
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Check if user can manage services (owner, manager, director, or artist with own account)
  const canManageServices = currentUser && (
    currentUser.role === 'owner' || 
    currentUser.role === 'manager' || 
    currentUser.role === 'director' ||
    (currentUser.role === 'artist' && !currentUser.studioName) // Artist with own account
  )

  // Load avatar from API first, then fallback to localStorage
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined)
  
  useEffect(() => {
    const loadAvatar = async () => {
      if (currentUser?.email && typeof window !== 'undefined') {
        try {
          // Try to load from API first
          const response = await fetch('/api/profile', {
            headers: {
              'x-user-email': currentUser.email
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.profile?.avatar) {
              setUserAvatar(data.profile.avatar)
              return
            }
          }
          
          // Fallback to localStorage
          const avatar = localStorage.getItem(`profile_photo_${currentUser.email}`)
          setUserAvatar(avatar || undefined)
        } catch (error) {
          console.error('Error loading avatar:', error)
          // Fallback to localStorage on error
          const avatar = localStorage.getItem(`profile_photo_${currentUser.email}`)
          setUserAvatar(avatar || undefined)
        }
      }
    }
    
    loadAvatar()
  }, [currentUser?.email])

  // Prepare user object for NavBar
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase(),
    avatar: userAvatar
  } : {
    name: "PMU Artist",
    email: "user@pmupro.com",
    initials: "PA",
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    description: '',
    defaultDuration: 60,
    defaultPrice: 0,
    category: 'other',
    isActive: true
  })

  const categories = getServiceCategories()

  // Load services on component mount
  useEffect(() => {
    if (isAuthenticated && currentUser?.email) {
      loadServices()
    }
  }, [isAuthenticated, currentUser?.email])

  const loadServices = async () => {
    if (!currentUser?.email) return
    
    setLoading(true)
    try {
      const userServices = await getServices(currentUser.email)
      setServices(userServices)
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format duration for display
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  // Get accent color for service category
  const getAccentColor = (category: Service['category']) => {
    switch (category) {
      case 'eyebrows': return '#8b5cf6'
      case 'lips': return '#ec4899'
      case 'eyeliner': return '#3b82f6'
      case 'consultation': return '#10b981'
      case 'touch-up': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  // Filter services based on search term
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveService = async () => {
    if (!currentUser?.email) return

    try {
      if (editingService) {
        // Update existing service
        const updated = await updateService(currentUser.email, editingService.id, editingService)
        if (updated) {
          await loadServices() // Reload services from API
          setEditingService(null)
          alert('Service updated successfully!')
        } else {
          alert('Failed to update service. Please try again.')
        }
      } else if (isAddingNew) {
        // Add new service
        if (newService.name) {
          const created = await createService(currentUser.email, newService as Omit<Service, 'id'>)
          if (created) {
            await loadServices() // Reload services from API
            setIsAddingNew(false)
            setNewService({
              name: '',
              description: '',
              defaultDuration: 60,
              defaultPrice: 0,
              category: 'other',
              isActive: true
            })
            alert('Service created successfully!')
          } else {
            alert('Failed to create service. Please try again.')
          }
        } else {
          alert('Please enter a service name.')
        }
      }
    } catch (error) {
      console.error('Error in handleSaveService:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    }
  }

  const handleCancel = () => {
    setEditingService(null)
    setIsAddingNew(false)
    setNewService({
      name: '',
      description: '',
      defaultDuration: 60,
      defaultPrice: 0,
      category: 'other',
      isActive: true
    })
  }

  const handleToggleStatus = async (serviceId: string) => {
    if (!currentUser?.email) return

    const service = services.find(s => s.id === serviceId)
    if (!service) return

    const updated = await updateService(currentUser.email, serviceId, { isActive: !service.isActive })
    if (updated) {
      await loadServices() // Reload services from API
    }
  }

  const getCategoryColor = (category: Service['category']) => {
    switch (category) {
      case 'eyebrows': return 'bg-purple-100 text-purple-800'
      case 'lips': return 'bg-pink-100 text-pink-800'
      case 'eyeliner': return 'bg-blue-100 text-blue-800'
      case 'consultation': return 'bg-green-100 text-green-800'
      case 'touch-up': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5">
      <NavBar currentPath="/services" user={user} />
      <div className="pb-24 md:pb-0">
      {/* Header (App Bar) */}
      <div className="flex items-center justify-between h-12 sm:h-14 px-3 sm:px-4 bg-white border-b border-gray-200 shadow-sm">
        {/* Left: Back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-700 hover:bg-gray-100 h-8 w-8 sm:h-9 sm:w-9 p-0"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        
        {/* Center: Title */}
        <h1 className="text-base sm:text-lg font-semibold text-gray-900">Services</h1>
        
        {/* Right: Icon buttons (conditionally show add button) */}
        <div className="flex gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-gray-700 hover:bg-gray-100">
            <List className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          {canManageServices && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-gray-700 hover:bg-gray-100"
              onClick={() => {
                console.log('Plus button clicked - opening add service modal')
                setIsAddingNew(true)
              }}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-lavender mx-auto"></div>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Loading services...</p>
          </div>
        )}

        {/* Not Authenticated */}
        {!isAuthenticated && !loading && (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-600 text-sm sm:text-base">Please log in to manage your services.</p>
          </div>
        )}

        {/* Authenticated Content */}
        {isAuthenticated && !loading && (
          <>
            {/* Search Bar */}
            <div className="relative mb-3 sm:mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                placeholder="Search Services & Categories"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 h-10 sm:h-11 rounded-full bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 shadow-sm text-sm sm:text-base"
              />
            </div>

            {/* Info Note */}
            {canManageServices ? (
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 px-1 sm:px-2">
                Want services to appear on your booking site in a specific order? Tap, hold, and drag services to reorder them.
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 px-1 sm:px-2">
                These are the services available from your studio. Contact your studio owner to add or modify services.
              </p>
            )}

            {/* Scrollable Services List */}
            <div className="space-y-3 sm:space-y-4">
              {filteredServices.map((service) => {
                const meta = [
                  formatDuration(service.defaultDuration),
                  `$${service.defaultPrice}`,
                  service.category
                ].filter(Boolean).join(' · ')

                return (
                  <div 
                    key={service.id}
                    onClick={() => canManageServices && setEditingService(service)}
                    className={`relative flex items-center rounded-xl bg-white border border-gray-200 p-3 sm:p-4 gap-2 sm:gap-3 transition-colors shadow-sm ${
                      canManageServices ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                    }`}
                  >
                    {/* Left accent bar */}
                    <span 
                      className="absolute left-0 top-0 h-full w-1 rounded-l-xl" 
                      style={{ backgroundColor: getAccentColor(service.category) }}
                    />
                    
                    {/* Thumbnail */}
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {service.imageUrl ? (
                        <img 
                          src={service.imageUrl} 
                          alt={service.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      )}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-base sm:text-lg font-semibold text-gray-900 truncate">{service.name}</div>
                      <div className="mt-1 text-xs sm:text-sm text-gray-600 truncate">{meta}</div>
                    </div>

                    {/* Drag handle (only show for users who can manage services) */}
                    {canManageServices && (
                      <div className="ml-1 sm:ml-2 text-gray-400 opacity-80">
                        <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Add/Edit Service Modal */}
        {(isAddingNew || editingService) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-[60]">
            <Card className="w-full max-w-md bg-white shadow-2xl border-2 border-gray-200 max-h-[90vh] overflow-y-auto">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  {isAddingNew ? 'Add New Service' : 'Edit Service'}
                  <Button variant="ghost" size="sm" onClick={handleCancel} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base">Service Name *</Label>
                  <Input
                    id="name"
                    value={isAddingNew ? newService.name : editingService?.name || ''}
                    onChange={(e) => {
                      if (isAddingNew) {
                        setNewService({...newService, name: e.target.value})
                      } else if (editingService) {
                        setEditingService({...editingService, name: e.target.value})
                      }
                    }}
                    placeholder="Enter service name"
                    className="force-white-bg force-gray-border force-dark-text h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
                  <Input
                    id="description"
                    value={isAddingNew ? newService.description : editingService?.description || ''}
                    onChange={(e) => {
                      if (isAddingNew) {
                        setNewService({...newService, description: e.target.value})
                      } else if (editingService) {
                        setEditingService({...editingService, description: e.target.value})
                      }
                    }}
                    placeholder="Service description"
                    className="force-white-bg force-gray-border force-dark-text h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="image" className="text-sm sm:text-base">Service Icon/Image</Label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                      {(isAddingNew ? newService.imageUrl : editingService?.imageUrl) ? (
                        <img 
                          src={isAddingNew ? newService.imageUrl : editingService?.imageUrl} 
                          alt="Service icon"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-4 w-4 sm:w-6 sm:h-6 text-gray-400" />
                      )}
              </div>
                    <div className="flex-1">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              const imageUrl = event.target?.result as string
                              if (isAddingNew) {
                                setNewService({...newService, imageUrl, isCustomImage: true})
                              } else if (editingService) {
                                setEditingService({...editingService, imageUrl, isCustomImage: true})
                              }
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="force-white-bg force-gray-border force-dark-text h-10 sm:h-11 text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload custom image for non-PMU services
                      </p>
                  </div>
                  </div>
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="category" className="text-sm sm:text-base">Category</Label>
                  <Select
                    value={isAddingNew ? newService.category : editingService?.category}
                    onValueChange={(value: Service['category']) => {
                      if (isAddingNew) {
                        setNewService({...newService, category: value})
                      } else if (editingService) {
                        setEditingService({...editingService, category: value})
                      }
                    }}
                  >
                    <SelectTrigger className="force-white-bg force-gray-border force-dark-text h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-sm sm:text-base">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="duration" className="text-sm sm:text-base">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={isAddingNew ? newService.defaultDuration : editingService?.defaultDuration || 60}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 60
                        if (isAddingNew) {
                          setNewService({...newService, defaultDuration: value})
                        } else if (editingService) {
                          setEditingService({...editingService, defaultDuration: value})
                        }
                      }}
                      className="force-white-bg force-gray-border force-dark-text h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="price" className="text-sm sm:text-base">Default Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={isAddingNew ? newService.defaultPrice : editingService?.defaultPrice || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        if (isAddingNew) {
                          setNewService({...newService, defaultPrice: value})
                        } else if (editingService) {
                          setEditingService({...editingService, defaultPrice: value})
                        }
                      }}
                      className="force-white-bg force-gray-border force-dark-text h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 pb-4 sm:pb-6">
                <Button
                  variant="outline"
                    onClick={handleCancel}
                    className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveService}
                    className="flex-1 bg-lavender hover:bg-lavender-600 text-white h-10 sm:h-11 text-sm sm:text-base"
                  >
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Save
                </Button>
                </div>
              </CardContent>
            </Card>
        </div>
        )}

        {filteredServices.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <Tag className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">No services found</h3>
            <p className="text-gray-500 text-sm sm:text-base">
              {canManageServices 
                ? "Try adjusting your search or add a new service."
                : "Try adjusting your search or contact your studio owner to add services."
              }
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}