"use client";

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MessageSquare, Send, Mic, MicOff } from 'lucide-react';
import { Client } from './ClientList';
import { VoiceToText } from '@/components/voice/voice-to-text';

interface MessageFormProps {
  client: Client | null;
  onSend: (client: Client, messageType: string, message: string) => void;
  onCancel: () => void;
}

export default function MessageForm({ client, onSend, onCancel }: MessageFormProps) {
  const [messageType, setMessageType] = useState('appointment');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !message.trim()) return;

    setIsLoading(true);
    try {
      await onSend(client, messageType, message);
      setMessage('');
      setMessageType('appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultMessage = (type: string) => {
    if (!client) return '';
    
    switch (type) {
      case 'appointment':
        return `Hi ${client.name},\n\nThis is a reminder about your upcoming appointment. Please arrive 10 minutes early.\n\nBest regards,\nYour PMU Artist`;
      case 'aftercare':
        return `Hi ${client.name},\n\nHere are your aftercare instructions:\n\n• Keep the area clean and dry for 24 hours\n• Apply provided ointment as directed\n• Avoid direct sunlight\n• No swimming for 2 weeks\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nYour PMU Artist`;
      case 'followup':
        return `Hi ${client.name},\n\nWe hope you're healing well! This is a quick check-in to see how your procedure is progressing.\n\nPlease let us know if you have any concerns or questions.\n\nBest regards,\nYour PMU Artist`;
      case 'promotion':
        return `Hi ${client.name},\n\nWe have a special offer just for you! Contact us to learn more about our current promotions.\n\nBest regards,\nYour PMU Artist`;
      default:
        return '';
    }
  };

  const handleMessageTypeChange = (type: string) => {
    setMessageType(type);
    if (!message.trim()) {
      setMessage(getDefaultMessage(type));
    }
  };

  const handleTranscriptionComplete = (transcribedText: string) => {
    setMessage(transcribedText);
    setShowVoiceInput(false);
  };

  const handleRewriteComplete = (rewrittenText: string) => {
    setMessage(rewrittenText);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Message Type</Label>
        <Select value={messageType} onValueChange={handleMessageTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appointment">Appointment Reminder</SelectItem>
            <SelectItem value="aftercare">Aftercare Instructions</SelectItem>
            <SelectItem value="followup">Follow-up Check</SelectItem>
            <SelectItem value="promotion">Special Offer</SelectItem>
            <SelectItem value="custom">Custom Message</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Message</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowVoiceInput(!showVoiceInput)}
            className="flex items-center space-x-2"
          >
            {showVoiceInput ? (
              <>
                <MicOff className="h-4 w-4" />
                <span>Hide Voice Input</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                <span>Voice Input</span>
              </>
            )}
          </Button>
        </div>
        
        {showVoiceInput && (
          <VoiceToText
            onTranscriptionComplete={handleTranscriptionComplete}
            onRewriteComplete={handleRewriteComplete}
            placeholder="Click the microphone to dictate your message..."
            className="mb-4"
          />
        )}
        
        <Textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          rows={6}
          className="resize-none"
        />
        <div className="text-xs text-muted-text">
          {message.length} characters
        </div>
      </div>

      {/* Preview */}
      {message && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="p-3 bg-lavender/5 rounded-lg border border-lavender/20">
            <div className="text-sm font-medium text-lavender mb-2">
              To: {client?.name} {client?.email && `(${client.email})`}
            </div>
            <div className="text-sm whitespace-pre-wrap text-ink">
              {message}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={!message.trim() || isLoading}
          className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
