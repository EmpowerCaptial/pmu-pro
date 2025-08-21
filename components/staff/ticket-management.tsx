"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Calendar,
  Send,
  FileImage,
  File,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Archive,
  RefreshCw
} from 'lucide-react'
import { 
  SupportTicket,
  getAllTickets,
  updateTicketStatus,
  assignTicket,
  resolveTicket,
  closeTicket,
  getTicketStats,
  searchTickets,
  getTicketsByStatus,
  getTicketsByPriority,
  getTicketsByCategory,
  getPriorityColor,
  getStatusColor,
  getStatusIcon,
  getCategoryIcon
} from '@/lib/ticket-management'

interface TicketManagementProps {
  currentStaffMember: any
}

export default function TicketManagement({ currentStaffMember }: TicketManagementProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | SupportTicket['status']>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | SupportTicket['priority']>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | SupportTicket['category']>('all')
  const [stats, setStats] = useState(getTicketStats())
  const [showResolutionForm, setShowResolutionForm] = useState(false)
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [resolutionData, setResolutionData] = useState({
    resolution: '',
    resolutionNotes: ''
  })
  const [assignmentData, setAssignmentData] = useState({
    assignedTo: ''
  })

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = () => {
    const allTickets = getAllTickets()
    setTickets(allTickets)
    setStats(getTicketStats())
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = searchTickets(query)
      setTickets(results)
    } else {
      applyFilters()
    }
  }

  const applyFilters = () => {
    let filteredTickets = getAllTickets()
    
    if (statusFilter !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter)
    }
    
    if (priorityFilter !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priorityFilter)
    }
    
    if (categoryFilter !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.category === categoryFilter)
    }
    
    setTickets(filteredTickets)
  }

  const handleStatusFilter = (status: 'all' | SupportTicket['status']) => {
    setStatusFilter(status)
    setPriorityFilter('all')
    setCategoryFilter('all')
    if (status === 'all') {
      setTickets(getAllTickets())
    } else {
      setTickets(getTicketsByStatus(status))
    }
  }

  const handlePriorityFilter = (priority: 'all' | SupportTicket['priority']) => {
    setPriorityFilter(priority)
    setStatusFilter('all')
    setCategoryFilter('all')
    if (priority === 'all') {
      setTickets(getAllTickets())
    } else {
      setTickets(getTicketsByPriority(priority))
    }
  }

  const handleCategoryFilter = (category: 'all' | SupportTicket['category']) => {
    setCategoryFilter(category)
    setStatusFilter('all')
    setPriorityFilter('all')
    if (category === 'all') {
      setTickets(getAllTickets())
    } else {
      setTickets(getTicketsByCategory(category))
    }
  }

  const handleStatusUpdate = (ticketId: string, newStatus: SupportTicket['status']) => {
    const updated = updateTicketStatus(ticketId, newStatus, currentStaffMember.username)
    if (updated) {
      loadTickets()
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updated)
      }
    }
  }

  const handleTicketAssignment = (ticketId: string, assignedTo: string) => {
    const updated = assignTicket(ticketId, assignedTo)
    if (updated) {
      loadTickets()
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updated)
      }
      setShowAssignmentForm(false)
    }
  }

  const handleTicketResolution = (ticketId: string, resolution: string, resolutionNotes: string) => {
    const updated = resolveTicket(ticketId, currentStaffMember.username, resolution, resolutionNotes)
    if (updated) {
      loadTickets()
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updated)
      }
      setShowResolutionForm(false)
      setResolutionData({ resolution: '', resolutionNotes: '' })
    }
  }

  const handleTicketClose = (ticketId: string) => {
    const updated = closeTicket(ticketId, currentStaffMember.username)
    if (updated) {
      loadTickets()
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updated)
      }
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getStaffMembers = () => [
    { id: 'manager1', name: 'Manager 1', role: 'Manager' },
    { id: 'rep1', name: 'Representative 1', role: 'Representative' },
    { id: 'director1', name: 'Director 1', role: 'Director' }
  ]

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Open</p>
                <p className="text-2xl font-bold text-red-800">{stats.open}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Resolved</p>
                <p className="text-2xl font-bold text-green-800">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets by title, description, or category..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value: any) => handleStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={(value: any) => handlePriorityFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={(value: any) => handleCategoryFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="feature_request">Feature Request</SelectItem>
              <SelectItem value="bug_report">Bug Report</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadTickets} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card 
            key={ticket.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTicket?.id === ticket.id ? 'ring-2 ring-lavender' : ''
            }`}
            onClick={() => setSelectedTicket(ticket)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{ticket.title}</h3>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusIcon(ticket.status)} {ticket.status}
                    </Badge>
                    <Badge variant="outline">
                      {getCategoryIcon(ticket.category)} {ticket.category}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👤 {ticket.createdBy}</span>
                    {ticket.assignedTo && (
                      <span>🎯 Assigned to: {ticket.assignedTo}</span>
                    )}
                    <span>📅 {formatTimestamp(ticket.createdAt)}</span>
                    {ticket.resolvedAt && (
                      <span>✅ Resolved: {formatTimestamp(ticket.resolvedAt)}</span>
                    )}
                    {ticket.closedAt && (
                      <span>🔒 Closed: {formatTimestamp(ticket.closedAt)}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTicket(ticket)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <Card className="border-lavender/30 bg-gradient-to-br from-lavender/5 to-beige/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lavender-700">
                  Ticket Details: {selectedTicket.title}
                </CardTitle>
                <CardDescription>
                  Manage ticket status, assignment, and resolution
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTicket(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Ticket Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>ID:</strong> {selectedTicket.id}</p>
                      <p><strong>Status:</strong> 
                        <Badge className={`ml-2 ${getStatusColor(selectedTicket.status)}`}>
                          {getStatusIcon(selectedTicket.status)} {selectedTicket.status}
                        </Badge>
                      </p>
                      <p><strong>Priority:</strong> 
                        <Badge className={`ml-2 ${getPriorityColor(selectedTicket.priority)}`}>
                          {selectedTicket.priority}
                        </Badge>
                      </p>
                      <p><strong>Category:</strong> 
                        <Badge variant="outline" className="ml-2">
                          {getCategoryIcon(selectedTicket.category)} {selectedTicket.category}
                        </Badge>
                      </p>
                      <p><strong>Created:</strong> {formatTimestamp(selectedTicket.createdAt)}</p>
                      <p><strong>Updated:</strong> {formatTimestamp(selectedTicket.updatedAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">User Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Created By:</strong> {selectedTicket.createdBy}</p>
                      <p><strong>Assigned To:</strong> {selectedTicket.assignedTo || 'Unassigned'}</p>
                      {selectedTicket.resolvedBy && (
                        <p><strong>Resolved By:</strong> {selectedTicket.resolvedBy}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedTicket.description}
                  </p>
                </div>
                
                {selectedTicket.resolution && (
                  <div>
                    <h4 className="font-semibold mb-2">Resolution</h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                      {selectedTicket.resolution}
                    </p>
                  </div>
                )}
                
                {selectedTicket.resolutionNotes && (
                  <div>
                    <h4 className="font-semibold mb-2">Resolution Notes</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      {selectedTicket.resolutionNotes}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Actions Tab */}
              <TabsContent value="actions" className="space-y-4">
                <h4 className="font-semibold">Ticket Actions</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setShowAssignmentForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={selectedTicket.status === 'closed'}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Assign Ticket
                  </Button>
                  
                  <Button
                    onClick={() => setShowResolutionForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={selectedTicket.status === 'closed'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve Ticket
                  </Button>
                  
                  <Button
                    onClick={() => handleStatusUpdate(selectedTicket.id, 'in_progress')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                    disabled={selectedTicket.status === 'in_progress' || selectedTicket.status === 'closed'}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark In Progress
                  </Button>
                  
                  <Button
                    onClick={() => handleTicketClose(selectedTicket.id)}
                    className="bg-gray-600 hover:bg-gray-700"
                    disabled={selectedTicket.status === 'closed'}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Close Ticket
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <h5 className="font-medium mb-2">Quick Status Updates</h5>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(selectedTicket.id, 'open')}
                      disabled={selectedTicket.status === 'open'}
                    >
                      Reopen
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(selectedTicket.id, 'resolved')}
                      disabled={selectedTicket.status === 'resolved'}
                    >
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4">
                <h4 className="font-semibold">Ticket History</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium">Ticket Created</p>
                    <p className="text-xs text-gray-600">{formatTimestamp(selectedTicket.createdAt)}</p>
                  </div>
                  
                  {selectedTicket.updatedAt !== selectedTicket.createdAt && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-gray-600">{formatTimestamp(selectedTicket.updatedAt)}</p>
                    </div>
                  )}
                  
                  {selectedTicket.resolvedAt && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">Resolved</p>
                      <p className="text-xs text-gray-600">{formatTimestamp(selectedTicket.resolvedAt)}</p>
                    </div>
                  )}
                  
                  {selectedTicket.closedAt && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">Closed</p>
                      <p className="text-xs text-gray-600">{formatTimestamp(selectedTicket.closedAt)}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4">
                <h4 className="font-semibold">Email Notifications</h4>
                {selectedTicket.emailNotifications.length === 0 ? (
                  <p className="text-gray-500">No notifications sent yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedTicket.emailNotifications.map((notification) => (
                      <div key={notification.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{notification.type}</Badge>
                          <span className="text-xs text-gray-600">
                            {formatTimestamp(notification.sentAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{notification.subject}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">To: {notification.sentTo}</span>
                          <Badge 
                            className={notification.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {notification.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Assignment Form Modal */}
      {showAssignmentForm && selectedTicket && (
        <Card className="fixed inset-4 bg-white border-lavender/30 shadow-2xl z-50 overflow-y-auto">
          <CardHeader>
            <CardTitle>Assign Ticket</CardTitle>
            <CardDescription>
              Assign ticket "{selectedTicket.title}" to a staff member
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Assign To</label>
              <Select value={assignmentData.assignedTo} onValueChange={(value) => setAssignmentData({ assignedTo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {getStaffMembers().map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => handleTicketAssignment(selectedTicket.id, assignmentData.assignedTo)}
                disabled={!assignmentData.assignedTo}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Assign Ticket
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAssignmentForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolution Form Modal */}
      {showResolutionForm && selectedTicket && (
        <Card className="fixed inset-4 bg-white border-lavender/30 shadow-2xl z-50 overflow-y-auto">
          <CardHeader>
            <CardTitle>Resolve Ticket</CardTitle>
            <CardDescription>
              Provide resolution details for ticket "{selectedTicket.title}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Resolution Summary *</label>
              <Input
                placeholder="Brief description of how the issue was resolved..."
                value={resolutionData.resolution}
                onChange={(e) => setResolutionData({ ...resolutionData, resolution: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Resolution Notes (Optional)</label>
              <Textarea
                placeholder="Additional details, steps taken, or technical notes..."
                value={resolutionData.resolutionNotes}
                onChange={(e) => setResolutionData({ ...resolutionData, resolutionNotes: e.target.value })}
                rows={4}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => handleTicketResolution(selectedTicket.id, resolutionData.resolution, resolutionData.resolutionNotes)}
                disabled={!resolutionData.resolution.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                Resolve Ticket
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowResolutionForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
