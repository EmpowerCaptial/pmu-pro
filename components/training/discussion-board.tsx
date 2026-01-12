"use client"

import { useState, useEffect, useRef } from 'react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageSquare,
  Send,
  UserCircle,
  Clock
} from 'lucide-react'

interface Discussion {
  id: string
  title: string
  content: string
  programId: string
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string | null
  }
  replies: Reply[]
}

interface Reply {
  id: string
  content: string
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string | null
  }
}

interface DiscussionBoardProps {
  programId: string
}

export function DiscussionBoard({ programId }: DiscussionBoardProps) {
  const { currentUser } = useDemoAuth()
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})
  const [isSubmittingReply, setIsSubmittingReply] = useState<Record<string, boolean>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchDiscussions = async () => {
    if (!currentUser?.email) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/training/discussions?programId=${programId}`, {
        headers: {
          'x-user-email': currentUser.email
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load discussions')
      }

      const data = await response.json()
      setDiscussions(data.discussions || [])
    } catch (error) {
      console.error('Failed to fetch discussions:', error)
      setError('Failed to load discussions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscussions()
  }, [programId, currentUser?.email])

  const handleCreatePost = async () => {
    if (!currentUser?.email || !newPostTitle.trim() || !newPostContent.trim()) {
      return
    }

    setIsSubmittingPost(true)
    try {
      const response = await fetch('/api/training/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          programId,
          title: newPostTitle.trim(),
          content: newPostContent.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      setNewPostTitle('')
      setNewPostContent('')
      setShowNewPostForm(false)
      await fetchDiscussions()
    } catch (error) {
      console.error('Failed to create post:', error)
      setError('Failed to create post. Please try again.')
    } finally {
      setIsSubmittingPost(false)
    }
  }

  const handleReply = async (discussionId: string) => {
    const content = replyContent[discussionId]?.trim()
    if (!currentUser?.email || !content) {
      return
    }

    setIsSubmittingReply(prev => ({ ...prev, [discussionId]: true }))
    try {
      const response = await fetch(`/api/training/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          content
        })
      })

      if (!response.ok) {
        throw new Error('Failed to post reply')
      }

      setReplyContent(prev => ({ ...prev, [discussionId]: '' }))
      setReplyingToId(null)
      await fetchDiscussions()
    } catch (error) {
      console.error('Failed to post reply:', error)
      setError('Failed to post reply. Please try again.')
    } finally {
      setIsSubmittingReply(prev => ({ ...prev, [discussionId]: false }))
    }
  }

  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  const getUserInitials = (name: string, email: string): string => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.charAt(0).toUpperCase()
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-slate-600" />
            Discussion Board
          </CardTitle>
          {!showNewPostForm && (
            <Button
              size="sm"
              onClick={() => setShowNewPostForm(true)}
              className="bg-slate-600 hover:bg-slate-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              New Post
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {showNewPostForm && (
          <Card className="border-slate-300 bg-slate-50">
            <CardContent className="p-4 space-y-3">
              <div>
                <Input
                  placeholder="Post title..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="mb-2"
                />
                <Textarea
                  placeholder="What would you like to discuss?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreatePost}
                  disabled={isSubmittingPost || !newPostTitle.trim() || !newPostContent.trim()}
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  {isSubmittingPost ? 'Posting...' : 'Post'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowNewPostForm(false)
                    setNewPostTitle('')
                    setNewPostContent('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading discussions...</div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No discussions yet. Be the first to start a conversation!</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div ref={scrollRef} className="space-y-4">
              {discussions.map((discussion) => (
                <Card key={discussion.id} className="border-slate-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {discussion.user.avatar ? (
                          <img
                            src={discussion.user.avatar}
                            alt={discussion.user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center font-semibold text-sm">
                            {getUserInitials(discussion.user.name, discussion.user.email)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{discussion.user.name}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(discussion.createdAt)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{discussion.title}</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{discussion.content}</p>

                        {/* Replies */}
                        {discussion.replies.length > 0 && (
                          <div className="mt-4 space-y-3 pl-4 border-l-2 border-slate-200">
                            {discussion.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <div className="flex-shrink-0">
                                  {reply.user.avatar ? (
                                    <img
                                      src={reply.user.avatar}
                                      alt={reply.user.name}
                                      className="w-8 h-8 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-500 text-white flex items-center justify-center font-semibold text-xs">
                                      {getUserInitials(reply.user.name, reply.user.email)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm text-gray-900">{reply.user.name}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDateTime(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyingToId === discussion.id ? (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyContent[discussion.id] || ''}
                              onChange={(e) =>
                                setReplyContent(prev => ({ ...prev, [discussion.id]: e.target.value }))
                              }
                              rows={2}
                              className="resize-none text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReply(discussion.id)}
                                disabled={isSubmittingReply[discussion.id] || !replyContent[discussion.id]?.trim()}
                                className="bg-slate-600 hover:bg-slate-700"
                              >
                                <Send className="h-3 w-3 mr-1" />
                                {isSubmittingReply[discussion.id] ? 'Posting...' : 'Reply'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReplyingToId(null)
                                  setReplyContent(prev => ({ ...prev, [discussion.id]: '' }))
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setReplyingToId(discussion.id)}
                            className="mt-2 text-slate-600 hover:text-slate-900"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

