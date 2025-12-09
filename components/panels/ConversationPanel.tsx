'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CallEvent } from '@/types'
import { Loader2, MessageSquare, Mic } from 'lucide-react'
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
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50">
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
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}>
      {/* Agent gets orb, user gets no icon */}
      {!isUser && (
        <div className="flex-shrink-0">
          <AnimatedOrb size={28} />
        </div>
      )}

      <div className={`flex flex-col max-w-[75%] space-y-0.5 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser 
            ? 'bg-neutral-200/80 text-neutral-600 rounded-tr-md' 
            : 'bg-neutral-900 text-white rounded-tl-md'
          }
        `}>
          {content}
        </div>
        <span className="text-[10px] text-neutral-400 px-1">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

function ListeningIndicator() {
  return (
    <div className="flex gap-3 flex-row-reverse animate-fade-in">
      <div className="flex flex-col max-w-[75%] space-y-0.5 items-end">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tr-md bg-neutral-200/50">
          <span className="text-xs text-neutral-500">Listening</span>
          <div className="flex items-center gap-0.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 bg-neutral-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
