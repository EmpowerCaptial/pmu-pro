'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { 
  TimeBlock, 
  TimeBlockRequest, 
  TIME_BLOCK_TYPES, 
  generateTimeSlots,
  formatTimeBlockDuration,
  validateTimeBlock
} from '@/lib/time-blocks'

interface TimeBlockManagerProps {
  userId: string
  selectedDate: string
  onTimeBlocksChange?: (blocks: TimeBlock[]) => void
}

export function TimeBlockManager({ userId, selectedDate, onTimeBlocksChange }: TimeBlockManagerProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState<TimeBlockRequest>({
    date: selectedDate,
    startTime: '',
    endTime: '',
    type: 'unavailable',
    title: '',
    notes: '',
    isRecurring: false,
    recurringPattern: 'daily',
    recurringEndDate: ''
  })

  // Fetch time blocks for the selected date
  useEffect(() => {
    fetchTimeBlocks()
  }, [userId, selectedDate])

  const fetchTimeBlocks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/time-blocks?userId=${userId}&date=${selectedDate}`)
      const result = await response.json()
      
      if (result.success) {
        setTimeBlocks(result.data)
        onTimeBlocksChange?.(result.data)
      }
    } catch (error) {
      console.error('Error fetching time blocks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateTimeBlock(formData)
    if (errors.length > 0) {
      alert(`Validation errors: ${errors.join(', ')}`)
      return
    }

    try {
      setIsLoading(true)
      
      const url = editingBlock ? '/api/time-blocks' : '/api/time-blocks'
      const method = editingBlock ? 'PUT' : 'POST'
      
      const requestBody = editingBlock 
        ? { ...formData, id: editingBlock.id }
        : { ...formData, userId }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchTimeBlocks()
        resetForm()
        setIsDialogOpen(false)
        setEditingBlock(null)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving time block:', error)
      alert('Failed to save time block')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this time block?')) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/time-blocks?id=${blockId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchTimeBlocks()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting time block:', error)
      alert('Failed to delete time block')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (block: TimeBlock) => {
    setEditingBlock(block)
    setFormData({
      date: block.date,
      startTime: block.startTime,
      endTime: block.endTime,
      type: block.type,
      title: block.title,
      notes: block.notes || '',
      isRecurring: block.isRecurring,
      recurringPattern: block.recurringPattern,
      recurringEndDate: block.recurringEndDate || ''
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      date: selectedDate,
      startTime: '',
      endTime: '',
      type: 'unavailable',
      title: '',
      notes: '',
      isRecurring: false,
      recurringPattern: 'daily',
      recurringEndDate: ''
    })
    setEditingBlock(null)
  }

  const timeSlots = generateTimeSlots(30)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-lavender" />
          <h3 className="text-lg font-semibold">Time Blocks</h3>
          <Badge variant="outline" className="text-xs">
            {timeBlocks.length} block{timeBlocks.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
              className="bg-lavender hover:bg-lavender-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Block
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBlock ? 'Edit Time Block' : 'Add Time Block'}
              </DialogTitle>
              <DialogDescription>
                Block out time when you're unavailable for appointments
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select value={formData.startTime} onValueChange={(value) => setFormData({ ...formData, startTime: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Select value={formData.endTime} onValueChange={(value) => setFormData({ ...formData, endTime: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Type */}
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIME_BLOCK_TYPES).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Lunch Break, Personal Appointment"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>

              {/* Recurring Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                  />
                  <Label htmlFor="recurring">Make this recurring</Label>
                </div>

                {formData.isRecurring && (
                  <>
                    <div>
                      <Label htmlFor="recurringPattern">Repeat</Label>
                      <Select 
                        value={formData.recurringPattern} 
                        onValueChange={(value: any) => setFormData({ ...formData, recurringPattern: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="recurringEndDate">End Date (Optional)</Label>
                      <Input
                        id="recurringEndDate"
                        type="date"
                        value={formData.recurringEndDate}
                        onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-lavender hover:bg-lavender-600 text-white">
                  {isLoading ? 'Saving...' : editingBlock ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Time Blocks List */}
      <div className="space-y-2">
        {timeBlocks.length === 0 ? (
          <Card className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500 text-sm">No time blocks for this date</p>
          </Card>
        ) : (
          timeBlocks.map((block) => (
            <Card key={block.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={TIME_BLOCK_TYPES[block.type].color}>
                      {TIME_BLOCK_TYPES[block.type].label}
                    </Badge>
                    {block.isRecurring && (
                      <Badge variant="outline" className="text-xs">
                        Recurring
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium text-sm">{block.title}</h4>
                  <p className="text-xs text-gray-500">
                    {block.startTime} - {block.endTime} ({formatTimeBlockDuration(block)})
                  </p>
                  {block.notes && (
                    <p className="text-xs text-gray-600 mt-1">{block.notes}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(block)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(block.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
