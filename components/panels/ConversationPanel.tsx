'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CallEvent } from '@/types'
import { User, Bot, Loader2 } from 'lucide-react'

interface ConversationPanelProps {
  events: CallEvent[]
  loading?: boolean
}

export function ConversationPanel({ events, loading }: ConversationPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-orix-accent animate-spin" />
      </div>
    )
  }

  // Filter to only speech events
  const messages = events.filter(
    e => e.event_type === 'user_spoke' || e.event_type === 'agent_spoke'
  )

  // Calculate call duration
  const callStartEvent = events.find(e => e.event_type === 'call_started')
  const callEndEvent = events.find(e => e.event_type === 'call_ended')
  const isCallActive = callStartEvent && !callEndEvent

  const getDuration = () => {
    if (!callStartEvent) return '0:00'
    const start = new Date(callStartEvent.created_at).getTime()
    const end = callEndEvent 
      ? new Date(callEndEvent.created_at).getTime() 
      : Date.now()
    
    const seconds = Math.floor((end - start) / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <h2 className="text-lg font-semibold text-white">
            💬 Live Conversation
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {isCallActive && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              Active
            </Badge>
          )}
          <span className="text-sm font-mono text-slate-400">
            {getDuration()}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500 text-sm">
              Waiting for conversation to start...
            </p>
          </div>
        ) : (
          <>
            {messages.map((event) => (
              <MessageBubble
                key={event.id}
                role={event.event_type === 'user_spoke' ? 'user' : 'assistant'}
                content={event.event_data.text}
                timestamp={event.created_at}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ 
  role, 
  content, 
  timestamp 
}: { 
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}>
      {/* Avatar */}
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser ? 'bg-orix-accent/20' : 'bg-orix-purple/20'}
      `}>
        {isUser ? (
          <User className="w-5 h-5 text-orix-accent" />
        ) : (
          <Bot className="w-5 h-5 text-orix-purple" />
        )}
      </div>

      {/* Message */}
      <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
        <Card className={`
          inline-block max-w-[80%] p-4
          ${isUser 
            ? 'bg-orix-accent/10 border-orix-accent/20' 
            : 'bg-slate-800 border-slate-700'
          }
        `}>
          <p className="text-sm text-slate-100 leading-relaxed">
            {content}
          </p>
        </Card>
        <p className="text-xs text-slate-500 mt-1 px-1">
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

