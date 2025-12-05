'use client'

import dynamic from 'next/dynamic'
import type { CallEvent } from '@/types'
import { Brain, Database, Zap, CheckCircle, Package, User, MapPin, Truck, MessageSquare } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Dynamically import Orb to avoid SSR issues with Three.js/Canvas
const Orb = dynamic(() => import('@/components/ui/orb').then(mod => mod.Orb), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-primary/10 rounded-full animate-pulse" />
})

interface AgentBrainPanelProps {
  events: CallEvent[]
}

export function AgentBrainPanel({ events }: AgentBrainPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Filter to only reasoning events (not speech)
  const reasoningEvents = events.filter(e => 
    ['agent_thinking', 'querying', 'results', 'action'].includes(e.event_type)
  )

  // Determine current agent state
  const getAgentState = () => {
    if (events.length === 0) return 'idle'
    const latest = events[events.length - 1]
    if (latest.event_type === 'user_spoke') return 'listening'
    if (latest.event_type === 'agent_thinking' || latest.event_type === 'querying') return 'thinking'
    if (latest.event_type === 'agent_spoke') return 'talking'
    return 'idle'
  }

  const agentState = getAgentState()

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with Orb */}
      <div className="border-b border-neutral-200 bg-gradient-to-r from-background to-muted/30 p-6 flex items-center gap-6 shrink-0">
        {/* Orb */}
        <div className="w-20 h-20 shrink-0">
          <Orb 
            agentState={agentState === 'idle' ? null : agentState} 
            colors={['#000000', '#000000']}
          />
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="w-5 h-5 text-primary" />
            Agent Brain
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time decision-making process
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className={cn(
              "w-2 h-2 rounded-full transition-colors",
              agentState === 'thinking' && "bg-yellow-500 animate-pulse",
              agentState === 'talking' && "bg-purple-500 animate-pulse",
              agentState === 'listening' && "bg-blue-500 animate-pulse",
              agentState === 'idle' && "bg-neutral-300"
            )} />
            <span className="text-xs font-medium text-muted-foreground capitalize">
              {agentState}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {reasoningEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Waiting for conversation...</p>
              <p className="text-xs text-muted-foreground mt-1">
                The agent&apos;s decision-making process will appear here in real-time
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
            
            {/* Events */}
            <div className="space-y-0">
              {reasoningEvents.map((event, idx) => (
                <TimelineEntry 
                  key={event.id} 
                  event={event} 
                  isLast={idx === reasoningEvents.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TimelineEntry({ event, isLast }: { event: CallEvent; isLast: boolean }) {
  const timestamp = new Date(event.created_at).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })

  const getIcon = () => {
    switch (event.event_type) {
      case 'agent_thinking':
        return <Brain className="w-4 h-4" />
      case 'querying':
        return <Database className="w-4 h-4" />
      case 'results':
        return <CheckCircle className="w-4 h-4" />
      case 'action':
        return <Zap className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getColor = () => {
    switch (event.event_type) {
      case 'agent_thinking':
        return 'bg-yellow-500 text-white'
      case 'querying':
        return 'bg-blue-500 text-white'
      case 'results':
        return 'bg-green-500 text-white'
      case 'action':
        return 'bg-purple-500 text-white'
      default:
        return 'bg-neutral-500 text-white'
    }
  }

  const getTitle = () => {
    switch (event.event_type) {
      case 'agent_thinking':
        return 'Understanding Request'
      case 'querying':
        return 'Database Query'
      case 'results':
        return 'Query Results'
      case 'action':
        return 'Action Triggered'
      default:
        return event.event_type
    }
  }

  return (
    <div className={cn(
      "relative pl-16 pr-6 py-5 transition-colors animate-fade-in",
      isLast ? "bg-primary/5" : "hover:bg-muted/30"
    )}>
      {/* Timeline dot */}
      <div className={cn(
        "absolute left-6 w-5 h-5 rounded-full flex items-center justify-center shadow-md",
        getColor(),
        isLast && "ring-4 ring-primary/20"
      )}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            {getTitle()}
            {isLast && (
              <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                Latest
              </Badge>
            )}
          </h4>
          <span className="text-[11px] font-mono text-muted-foreground">
            {timestamp}
          </span>
        </div>

        {/* Body */}
        {event.event_type === 'agent_thinking' && (
          <div className="grid gap-2">
            {event.event_data.customer_name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{event.event_data.customer_name}</span>
              </div>
            )}
            {event.event_data.order_number && (
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Order:</span>
                <span className="font-mono font-medium">#{event.event_data.order_number}</span>
              </div>
            )}
            {event.event_data.issue_type && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Intent:</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {event.event_data.issue_type.replace(/_/g, ' ')}
                </Badge>
              </div>
            )}
          </div>
        )}

        {event.event_type === 'querying' && event.event_data.sql && (
          <div className="font-mono text-xs bg-neutral-900 text-green-400 p-3 rounded-lg overflow-x-auto">
            <span className="text-neutral-500">→ </span>
            {event.event_data.sql}
          </div>
        )}

        {event.event_type === 'results' && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3 space-y-2">
            {event.event_data.status && (
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-3.5 h-3.5 text-green-600" />
                <span className="text-muted-foreground">Status:</span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  {event.event_data.status}
                </Badge>
              </div>
            )}
            {event.event_data.delivery_date && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Delivery:</span>
                <span className="font-medium">{event.event_data.delivery_date}</span>
              </div>
            )}
            {event.event_data.tracking_number && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Tracking:</span>
                <code className="font-mono text-xs bg-background px-2 py-0.5 rounded border">
                  {event.event_data.tracking_number}
                </code>
              </div>
            )}
          </div>
        )}

        {event.event_type === 'action' && (
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 uppercase text-[10px]">
                {event.event_data.type || 'action'}
              </Badge>
              <span className="text-sm font-medium">{event.event_data.description}</span>
            </div>
            {event.event_data.message && (
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                &quot;{event.event_data.message}&quot;
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
