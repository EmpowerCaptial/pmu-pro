"use client"

import { useState, useEffect, useRef } from 'react'
import { DailyCall } from '@daily-co/daily-js'
import { DailyProvider, useDaily, useParticipant, useParticipants } from '@daily-co/daily-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Users, 
  X,
  Send,
  Phone,
  PhoneOff
} from 'lucide-react'

interface LiveStreamViewerProps {
  roomUrl: string
  token: string
  userName: string
  isInstructor: boolean
  onLeave: () => void
}

function ChatPanel({ userName }: { userName: string }) {
  const daily = useDaily()
  const [messages, setMessages] = useState<Array<{ id: string; userName: string; message: string; timestamp: Date }>>([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!daily) return

    const handleAppMessage = (event: any) => {
      if (event.data && event.data.message) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          userName: event.data.userName || 'Anonymous',
          message: event.data.message,
          timestamp: new Date()
        }])
      }
    }

    daily.on('app-message', handleAppMessage)

    return () => {
      daily.off('app-message', handleAppMessage)
    }
  }, [daily])

  const sendMessage = () => {
    if (!daily || !inputMessage.trim()) return

    daily.sendAppMessage({ message: inputMessage, userName: userName }, '*')
    setInputMessage('')
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-3 pt-0">
        <ScrollArea className="flex-1 mb-3">
          <div className="space-y-2">
            {messages.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No messages yet</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="text-xs">
                  <span className="font-semibold text-gray-700">{msg.userName}:</span>{' '}
                  <span className="text-gray-600">{msg.message}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="text-xs h-8"
          />
          <Button size="sm" onClick={sendMessage} className="h-8">
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ParticipantList({ isInstructor }: { isInstructor: boolean }) {
  const participants = useParticipants()
  const daily = useDaily()

  const muteParticipant = (sessionId: string) => {
    if (!daily || !isInstructor) return
    daily.setInputDevicesAsync({ audioDeviceId: null })
    // Note: Daily.co doesn't have direct mute-other-participant API
    // This would require server-side implementation
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          Participants ({Object.keys(participants).length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {Object.values(participants).map((participant: any) => (
              <div key={participant.session_id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="font-medium">{participant.user_name || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-1">
                  {participant.audio ? (
                    <Mic className="h-3 w-3 text-green-600" />
                  ) : (
                    <MicOff className="h-3 w-3 text-gray-400" />
                  )}
                  {participant.video ? (
                    <Video className="h-3 w-3 text-green-600" />
                  ) : (
                    <VideoOff className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function VideoCall({ roomUrl, token, userName, isInstructor, onLeave }: LiveStreamViewerProps) {
  const daily = useDaily()
  const [isJoined, setIsJoined] = useState(false)
  const [camEnabled, setCamEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const callFrameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!daily || !callFrameRef.current) return

    const callFrame = daily.createFrame(callFrameRef.current, {
      showLeaveButton: false,
      showFullscreenButton: true,
      iframeStyle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        border: '0'
      }
    })

    callFrame.join({ url: roomUrl, token })

    callFrame.on('joined-meeting', () => {
      setIsJoined(true)
    })

    callFrame.on('left-meeting', () => {
      onLeave()
    })

    return () => {
      callFrame.leave()
    }
  }, [daily, roomUrl, token, onLeave])

  const toggleCamera = () => {
    if (!daily) return
    daily.setLocalVideo(!camEnabled)
    setCamEnabled(!camEnabled)
  }

  const toggleMic = () => {
    if (!daily) return
    daily.setLocalAudio(!micEnabled)
    setMicEnabled(!micEnabled)
  }

  const leaveCall = () => {
    if (daily) {
      daily.leave()
    }
    onLeave()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative bg-black rounded-lg overflow-hidden mb-4" ref={callFrameRef} />
      
      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={toggleCamera}
          variant={camEnabled ? "default" : "destructive"}
          size="sm"
        >
          {camEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
        <Button
          onClick={toggleMic}
          variant={micEnabled ? "default" : "destructive"}
          size="sm"
        >
          {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        <Button
          onClick={leaveCall}
          variant="destructive"
          size="sm"
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          Leave
        </Button>
      </div>
    </div>
  )
}

export function LiveStreamViewer({ roomUrl, token, userName, isInstructor, onLeave }: LiveStreamViewerProps) {
  const [daily, setDaily] = useState<DailyCall | null>(null)

  useEffect(() => {
    import('@daily-co/daily-js').then(({ DailyCall }) => {
      const call = DailyCall.createInstance()
      setDaily(call)
    })

    return () => {
      if (daily) {
        daily.destroy()
      }
    }
  }, [])

  if (!daily) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading video call...</p>
      </div>
    )
  }

  return (
    <DailyProvider callObject={daily}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        <div className="lg:col-span-2">
          <VideoCall
            roomUrl={roomUrl}
            token={token}
            userName={userName}
            isInstructor={isInstructor}
            onLeave={onLeave}
          />
        </div>
        <div className="space-y-4">
          <ParticipantList isInstructor={isInstructor} />
          <ChatPanel userName={userName} />
        </div>
      </div>
    </DailyProvider>
  )
}

