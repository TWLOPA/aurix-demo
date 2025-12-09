'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CallEvent } from '@/types'
import { Loader2, MessageSquare } from 'lucide-react'
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
    <Card className="h-full flex flex-col border-none rounded-none shadow-none overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200 p-4 flex items-center justify-between bg-neutral-50">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-neutral-500" />
            <h2 className="text-sm font-semibold text-neutral-800">
              Live Transcript
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isCallActive && (
            <Badge className="bg-green-500/20 text-green-700 border-0 text-xs">
              Active Call
            </Badge>
          )}
          <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md">
            {callDuration}
          </span>
        </div>
      </div>

      {/* Messages - White background */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-4 relative bg-white"
      >
        
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-neutral-50 border border-neutral-100">
                <MessageSquare className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-500">
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
      {/* Agent gets orb */}
      {!isUser && (
        <div className="flex-shrink-0">
          <AnimatedOrb size={32} />
        </div>
      )}

      <div className={`flex flex-col max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-3 text-sm leading-relaxed ${
            isUser 
              ? 'rounded-2xl rounded-tr-md bg-neutral-900 text-white' 
              : 'rounded-2xl rounded-tl-md bg-neutral-100 text-neutral-700'
          }`}
        >
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
      <div className="flex flex-col max-w-[75%] space-y-1 items-end">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tr-md bg-neutral-100">
          <span className="text-xs text-neutral-500">Listening</span>
          <div className="flex items-center gap-0.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-pulse"
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
