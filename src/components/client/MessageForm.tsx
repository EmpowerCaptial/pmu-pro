"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('MessageForm')
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
        return t('templateAppointment', { name: client.name });
      case 'aftercare':
        return t('templateAftercare', { name: client.name });
      case 'followup':
        return t('templateFollowup', { name: client.name });
      case 'promotion':
        return t('templatePromotion', { name: client.name });
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
        <Label>{t('messageType')}</Label>
        <Select value={messageType} onValueChange={handleMessageTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appointment">{t('appointmentReminder')}</SelectItem>
            <SelectItem value="aftercare">{t('aftercareInstructions')}</SelectItem>
            <SelectItem value="followup">{t('followUpCheck')}</SelectItem>
            <SelectItem value="promotion">{t('specialOffer')}</SelectItem>
            <SelectItem value="custom">{t('customMessage')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{t('message')}</Label>
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
                <span>{t('hideVoiceInput')}</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                <span>{t('voiceInput')}</span>
              </>
            )}
          </Button>
        </div>
        
        {showVoiceInput && (
          <VoiceToText
            onTranscriptionComplete={handleTranscriptionComplete}
            onRewriteComplete={handleRewriteComplete}
            placeholder={t('voicePlaceholder')}
            className="mb-4"
          />
        )}
        
        <Textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('messagePlaceholder')}
          rows={6}
          className="resize-none"
        />
        <div className="text-xs text-muted-text">
          {t('characters', { count: message.length })}
        </div>
      </div>

      {/* Preview */}
      {message && (
        <div className="space-y-2">
          <Label>{t('preview')}</Label>
          <div className="p-3 bg-lavender/5 rounded-lg border border-lavender/20">
            <div className="text-sm font-medium text-lavender mb-2">
              {t('toLabel')} {client?.name} {client?.email && `(${client.email})`}
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
          {t('cancel')}
        </Button>
        <Button 
          type="submit"
          disabled={!message.trim() || isLoading}
          className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('sending')}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {t('sendMessage')}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
