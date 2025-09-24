"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Send, X } from "lucide-react";

export function UxRequestTimeOff() {
  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    hours: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Time off request submitted successfully!');
    setFormData({
      type: '',
      startDate: '',
      endDate: '',
      reason: '',
      hours: ''
    });
    setShowForm(false);
    setIsSubmitting(false);
  };

  return (
    <div className="border-t border-white/5 pt-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-neutral-400 hover:text-white hover:bg-white/10"
        onClick={() => setShowForm(!showForm)}
      >
        <Calendar className="h-4 w-4 mr-2" />
        Request Time Off
      </Button>
      
      {showForm && (
        <div className="mt-3 p-4 bg-neutral-800 rounded-lg border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Request Time Off</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
              className="h-6 w-6 p-0 text-neutral-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="type" className="text-xs text-neutral-400">Type of Request</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate" className="text-xs text-neutral-400">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-neutral-700 border-neutral-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs text-neutral-400">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-neutral-700 border-neutral-600 text-white"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="hours" className="text-xs text-neutral-400">Hours Requested</Label>
              <Input
                id="hours"
                type="number"
                placeholder="8"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="reason" className="text-xs text-neutral-400">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Brief reason for time off..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="bg-neutral-700 border-neutral-600 text-white"
                rows={2}
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !formData.type || !formData.startDate}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Send className="h-3 w-3 mr-1" />
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
                className="border-neutral-600 text-neutral-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
