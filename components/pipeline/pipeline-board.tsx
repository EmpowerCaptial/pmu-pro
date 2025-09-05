"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  RefreshCw, 
  Star,
  Plus,
  Edit,
  Trash2,
  Move,
  Filter,
  Search,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
  Phone,
  Mail,
  CalendarDays,
  User,
  Send,
  ExternalLink
} from 'lucide-react'
import { ClientPipeline, PipelineStage, EnhancedClientProfile } from '@/types/client-pipeline'
import { ClientPortalService } from '@/lib/client-portal-service'

interface PipelineBoardProps {
  clients: EnhancedClientProfile[]
  onClientMove: (clientId: string, newStage: PipelineStage) => void
  onAddNote: (clientId: string, note: string) => void
  onUpdatePipeline: (clientId: string, updates: Partial<ClientPipeline>) => void
}

const PIPELINE_STAGES: { stage: PipelineStage; label: string; color: string; icon: any; description: string }[] = [
  { 
    stage: 'lead', 
    label: 'Leads', 
    color: 'bg-blue-50 border-blue-200', 
    icon: Users,
    description: 'New prospects and inquiries'
  },
  { 
    stage: 'consultation', 
    label: 'Consultation', 
    color: 'bg-purple-50 border-purple-200', 
    icon: MessageSquare,
    description: 'Initial consultations scheduled'
  },
  { 
    stage: 'booking', 
    label: 'Booked', 
    color: 'bg-green-50 border-green-200', 
    icon: Calendar,
    description: 'Procedures scheduled and confirmed'
  },
  { 
    stage: 'procedure', 
    label: 'Procedure', 
    color: 'bg-orange-50 border-orange-200', 
    icon: CheckCircle,
    description: 'Procedures in progress'
  },
  { 
    stage: 'aftercare', 
    label: 'Aftercare', 
    color: 'bg-yellow-50 border-yellow-200', 
    icon: Clock,
    description: 'Post-procedure care and monitoring'
  },
  { 
    stage: 'touchup', 
    label: 'Touch-up', 
    color: 'bg-pink-50 border-pink-200', 
    icon: RefreshCw,
    description: 'Touch-up sessions scheduled'
  },
  { 
    stage: 'retention', 
    label: 'Retention', 
    color: 'bg-indigo-50 border-indigo-200', 
    icon: Star,
    description: 'Long-term client relationships'
  }
]

export default function PipelineBoard({ clients, onClientMove, onAddNote, onUpdatePipeline }: PipelineBoardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState<PipelineStage | 'all'>('all')
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')
  const [draggedClient, setDraggedClient] = useState<string | null>(null)

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = filterStage === 'all' || client.pipeline.stage === filterStage
    return matchesSearch && matchesStage
  })

  const getClientsByStage = (stage: PipelineStage) => {
    return filteredClients.filter(client => client.pipeline.stage === stage)
  }

  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    setDraggedClient(clientId)
    e.dataTransfer.setData('clientId', clientId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedClient(null)
  }

  const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault()
    const clientId = e.dataTransfer.getData('clientId')
    if (clientId && clientId !== draggedClient) {
      onClientMove(clientId, targetStage)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const addNote = () => {
    if (selectedClient && newNote.trim()) {
      onAddNote(selectedClient, newNote)
      setNewNote('')
      setSelectedClient(null)
    }
  }

  const getStageStats = (stage: PipelineStage) => {
    const stageClients = getClientsByStage(stage)
    const totalValue = stageClients.reduce((sum, client) => sum + client.pipeline.estimatedValue, 0)
    const avgProbability = stageClients.length > 0 
      ? stageClients.reduce((sum, client) => sum + client.pipeline.probability, 0) / stageClients.length 
      : 0

    return {
      count: stageClients.length,
      totalValue,
      avgProbability
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(0)}%`
  }

  const getDaysUntilFollowUp = (followUpDate: Date | null) => {
    if (!followUpDate) return null
    const today = new Date()
    const diffTime = new Date(followUpDate).getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getFollowUpStatus = (followUpDate: Date | null) => {
    const daysUntil = getDaysUntilFollowUp(followUpDate)
    if (daysUntil === null) return 'no-followup'
    if (daysUntil < 0) return 'overdue'
    if (daysUntil <= 3) return 'urgent'
    if (daysUntil <= 7) return 'soon'
    return 'upcoming'
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Pipeline</h2>
          <p className="text-gray-600">Drag and drop clients between stages to manage their journey</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <Select value={filterStage} onValueChange={(value) => setFilterStage(value as PipelineStage | 'all')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {PIPELINE_STAGES.map(({ stage, label }) => (
                <SelectItem key={stage} value={stage}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {PIPELINE_STAGES.map(({ stage, label, color, icon: Icon, description }) => {
          const stats = getStageStats(stage)
          const stageClients = getClientsByStage(stage)

          return (
            <div
              key={stage}
              className={`${color} rounded-lg border-2 border-dashed border-gray-300 min-h-[600px] p-4 transition-all duration-200 ${
                draggedClient ? 'border-lavender border-solid' : ''
              }`}
              onDrop={(e) => handleDrop(e, stage)}
              onDragOver={handleDragOver}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{label}</h3>
                    <p className="text-xs text-gray-500">{description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-white/80">{stats.count}</Badge>
              </div>

              {/* Stage Stats */}
              <div className="space-y-2 mb-4 text-sm bg-white/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium text-green-700">{formatCurrency(stats.totalValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg Probability:</span>
                  <span className="font-medium text-blue-700">{formatPercentage(stats.avgProbability)}</span>
                </div>
              </div>

              {/* Client Cards */}
              <div className="space-y-3">
                {stageClients.map((client) => {
                  const followUpStatus = getFollowUpStatus(client.pipeline.followUpDate)
                  const daysUntil = getDaysUntilFollowUp(client.pipeline.followUpDate)
                  
                  return (
                    <Card
                      key={client.id}
                      className={`cursor-move hover:shadow-md transition-all duration-200 ${
                        draggedClient === client.id ? 'opacity-50 scale-95' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, client.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {client.firstName} {client.lastName}
                            </h4>
                            <p className="text-xs text-gray-600">{client.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                {formatCurrency(client.pipeline.estimatedValue)}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {formatPercentage(client.pipeline.probability)}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedClient(client.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>

                        {client.pipeline.nextAction && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Next:</strong> {client.pipeline.nextAction}
                          </div>
                        )}

                        {client.pipeline.followUpDate && (
                          <div className={`mt-2 text-xs p-2 rounded flex items-center gap-1 ${
                            followUpStatus === 'overdue' ? 'bg-red-50 text-red-700' :
                            followUpStatus === 'urgent' ? 'bg-orange-50 text-orange-700' :
                            followUpStatus === 'soon' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            <CalendarDays className="h-3 w-3" />
                            <span>
                              {followUpStatus === 'overdue' ? 'Overdue' :
                               followUpStatus === 'urgent' ? `${Math.abs(daysUntil!)} days overdue` :
                               followUpStatus === 'soon' ? `Due in ${daysUntil} days` :
                               `Due in ${daysUntil} days`}
                            </span>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 mt-2">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Calendar className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              const portalService = ClientPortalService.getInstance()
                              const portalUser = portalService.createPortalAccess(client)
                              const portalLink = portalService.generatePortalAccessLink(client.id)
                              alert(`Portal access link for ${client.firstName} ${client.lastName}:\n\n${window.location.origin}${portalLink}`)
                            }}
                            title="Send Portal Access"
                          >
                            <User className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Empty State */}
              {stageClients.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No clients in this stage</p>
                  <p className="text-xs">Drag clients here to move them</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
              <CardDescription>Manage client pipeline and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const client = clients.find(c => c.id === selectedClient)
                if (!client) return null

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Probability</label>
                        <Select
                          value={client.pipeline.probability.toString()}
                          onValueChange={(value) => onUpdatePipeline(selectedClient, { probability: parseFloat(value) })}
                        >
                          <SelectTrigger className="bg-white border border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            <SelectItem value="0.1" className="hover:bg-gray-50">10%</SelectItem>
                            <SelectItem value="0.25" className="hover:bg-gray-50">25%</SelectItem>
                            <SelectItem value="0.5" className="hover:bg-gray-50">50%</SelectItem>
                            <SelectItem value="0.75" className="hover:bg-gray-50">75%</SelectItem>
                            <SelectItem value="0.9" className="hover:bg-gray-50">90%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Estimated Value</label>
                        <Input
                          type="number"
                          value={client.pipeline.estimatedValue}
                          onChange={(e) => onUpdatePipeline(selectedClient, { estimatedValue: parseFloat(e.target.value) })}
                          className="bg-white border border-gray-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Next Action</label>
                      <Input
                        value={client.pipeline.nextAction}
                        onChange={(e) => onUpdatePipeline(selectedClient, { nextAction: e.target.value })}
                        className="bg-white border border-gray-200"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Follow-up Date</label>
                      <Input
                        type="date"
                        value={client.pipeline.followUpDate ? new Date(client.pipeline.followUpDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => onUpdatePipeline(selectedClient, { followUpDate: e.target.value ? new Date(e.target.value) : null })}
                        className="bg-white border border-gray-200"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Client Portal Access</label>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const portalService = ClientPortalService.getInstance()
                            const portalUser = portalService.createPortalAccess(client)
                            const portalLink = portalService.generatePortalAccessLink(client.id)
                            alert(`Portal access link generated: ${portalLink}`)
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Send Portal Access
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const portalService = ClientPortalService.getInstance()
                            const portalLink = portalService.generatePortalAccessLink(client.id)
                            if (portalLink) {
                              window.open(portalLink, '_blank')
                            }
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Portal
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Add Note</label>
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note about this client..."
                        rows={3}
                        className="bg-white border border-gray-200"
                      />
                      <Button onClick={addNote} className="mt-2">Add Note</Button>
                    </div>

                    {/* Existing Notes */}
                    {client.pipeline.notes.length > 0 && (
                      <div>
                        <label className="text-sm font-medium">Previous Notes</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {client.pipeline.notes.map((note) => (
                            <div key={note.id} className="text-sm bg-gray-50 p-2 rounded">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{note.author}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(note.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700 mt-1">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedClient(null)}>
                  Cancel
                </Button>
                <Button onClick={() => setSelectedClient(null)}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
