'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CallEvent } from '@/types'
import { User, Bot, Loader2, MessageSquare, Mic } from 'lucide-react'

interface ConversationPanelProps {
  events: CallEvent[]
  loading?: boolean
  agentSpeaking?: boolean
  userSpeaking?: boolean
}

export function ConversationPanel({ events, loading, agentSpeaking, userSpeaking }: ConversationPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
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
    <Card className="h-full flex flex-col border-none rounded-none bg-background shadow-none">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Live Transcript
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isCallActive && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
              Active Call
            </Badge>
          )}
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {getDuration()}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
            <MessageSquare className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
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
            
            {/* Live speaking indicators */}
            {agentSpeaking && (
              <SpeakingIndicator role="assistant" />
            )}
            {!agentSpeaking && messages.length > 0 && (
              <ListeningIndicator />
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </Card>
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
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-slide-up group`}>
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border
        ${isUser 
          ? 'bg-primary text-primary-foreground border-primary' 
          : 'bg-background text-foreground border-border'
        }
      `}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message */}
      <div className={`flex flex-col max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? 'Customer' : 'AI Agent'}
          </span>
          <span className="text-[10px] text-muted-foreground/50">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className={`
          p-4 rounded-2xl text-sm leading-relaxed shadow-sm border
          ${isUser 
            ? 'bg-primary text-primary-foreground border-primary rounded-tr-none' 
            : 'bg-card text-card-foreground border-border rounded-tl-none'
          }
        `}>
          {content}
        </div>
      </div>
    </div>
  )
}

function SpeakingIndicator({ role }: { role: 'user' | 'assistant' }) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
      {/* Avatar with pulse animation */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border relative
        ${isUser 
          ? 'bg-primary text-primary-foreground border-primary' 
          : 'bg-background text-foreground border-border'
        }
      `}>
        {/* Pulse ring */}
        <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${isUser ? 'bg-primary' : 'bg-foreground'}`} />
        {isUser ? (
          <Mic className="w-4 h-4 relative z-10" />
        ) : (
          <Bot className="w-4 h-4 relative z-10" />
        )}
      </div>

      {/* Speaking indicator bubble */}
      <div className={`flex flex-col max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? 'Customer' : 'AI Agent'}
          </span>
          <span className="text-[10px] text-green-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {isUser ? 'Speaking...' : 'Responding...'}
          </span>
        </div>
        <div className={`
          px-4 py-3 rounded-2xl text-sm shadow-sm border
          ${isUser 
            ? 'bg-primary/80 text-primary-foreground border-primary rounded-tr-none' 
            : 'bg-card text-card-foreground border-border rounded-tl-none'
          }
        `}>
          {/* Animated typing dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ListeningIndicator() {
  return (
    <div className="flex gap-4 flex-row-reverse animate-fade-in">
      {/* User avatar with subtle pulse */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border bg-primary/10 text-primary border-primary/20 relative">
        {/* Subtle pulse ring */}
        <div className="absolute inset-0 rounded-full animate-pulse opacity-50 bg-primary/20" />
        <Mic className="w-4 h-4 relative z-10" />
      </div>

      {/* Listening indicator */}
      <div className="flex flex-col max-w-[80%] space-y-1 items-end">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Your turn
          </span>
          <span className="text-[10px] text-blue-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Listening...
          </span>
        </div>
        <div className="px-4 py-3 rounded-2xl rounded-tr-none text-sm shadow-sm border bg-primary/5 text-muted-foreground border-primary/20">
          {/* Audio waveform visualization */}
          <div className="flex items-center gap-0.5 h-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary/40 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 12 + 4}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
