'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CallEvent } from '@/types'
import { User, Loader2, MessageSquare, Mic } from 'lucide-react'
import { AnimatedOrb } from '@/components/ui/animated-orb'

interface ConversationPanelProps {
  events: CallEvent[]
  loading?: boolean
  agentSpeaking?: boolean
}

export function ConversationPanel({ events, loading, agentSpeaking }: ConversationPanelProps) {
  const [showListening, setShowListening] = useState(false)
  const [callDuration, setCallDuration] = useState('0:00')
  const lastMessageCountRef = useRef(0)
  const callStartTimeRef = useRef<number | null>(null)

  // Track call start time from first event
  useEffect(() => {
    if (events.length > 0 && !callStartTimeRef.current) {
      callStartTimeRef.current = Date.now()
    }
  }, [events])

  // Update timer every second
  useEffect(() => {
    if (!callStartTimeRef.current || events.length === 0) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartTimeRef.current!) / 1000)
      const mins = Math.floor(elapsed / 60)
      const secs = elapsed % 60
      setCallDuration(`${mins}:${secs.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [events.length])

  // Show "Listening..." with a delay after agent stops speaking
  useEffect(() => {
    const messageCount = events.filter(
      e => e.event_type === 'user_spoke' || e.event_type === 'agent_spoke'
    ).length

    if (messageCount > lastMessageCountRef.current) {
      setShowListening(false)
      lastMessageCountRef.current = messageCount
    }

    if (!agentSpeaking && messageCount > 0) {
      const timer = setTimeout(() => {
        setShowListening(true)
      }, 1500)
      
      return () => clearTimeout(timer)
    } else if (agentSpeaking) {
      setShowListening(false)
    }
  }, [agentSpeaking, events])

  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  const messages = events.filter(
    e => e.event_type === 'user_spoke' || e.event_type === 'agent_spoke'
  )

  const isCallActive = events.length > 0

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
            {callDuration}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50">
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
            
            {showListening && !agentSpeaking && (
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
      {isUser ? (
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border bg-blue-600 text-white border-blue-600">
          <User className="w-4 h-4" />
        </div>
      ) : (
        <div className="flex-shrink-0">
          <AnimatedOrb size={32} />
        </div>
      )}

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
          p-4 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isUser 
            ? 'bg-blue-600 text-white rounded-tr-none' 
            : 'bg-neutral-900 text-white rounded-tl-none'
          }
        `}>
          {content}
        </div>
      </div>
    </div>
  )
}

function ListeningIndicator() {
  return (
    <div className="flex gap-4 flex-row-reverse animate-fade-in">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border bg-blue-100 text-blue-600 border-blue-200 relative">
        <div className="absolute inset-0 rounded-full animate-pulse opacity-50 bg-blue-200" />
        <Mic className="w-4 h-4 relative z-10" />
      </div>

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
        <div className="px-4 py-3 rounded-2xl rounded-tr-none text-sm shadow-sm bg-blue-50 text-blue-600 border border-blue-100">
          <div className="flex items-center gap-0.5 h-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-blue-400 rounded-full animate-pulse"
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
