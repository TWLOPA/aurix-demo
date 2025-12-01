'use client'

import dynamic from 'next/dynamic'
import type { CallEvent } from '@/types'
import { Brain, Activity, Database, MessageSquare, Zap, Terminal, ArrowRight, Clock } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
  const [agentState, setAgentState] = useState<'idle' | 'listening' | 'thinking' | 'talking' | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Update agent state based on latest events
  useEffect(() => {
    if (events.length === 0) {
      setAgentState('idle')
      return
    }
    const latestEvent = events[events.length - 1]
    
    switch (latestEvent.event_type) {
      case 'user_spoke':
        setAgentState('listening')
        break
      case 'agent_thinking':
      case 'querying':
        setAgentState('thinking')
        break
      case 'agent_spoke':
        setAgentState('talking')
        break
      default:
        break
    }
  }, [events])

  // Auto-scroll log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  // Helper for Orb state
  const getOrbState = () => {
    if (agentState === 'idle') return null
    return agentState
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Agent Header & Orb - Fixed Top */}
      <div className="border-b border-neutral-200 bg-background p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16">
            <Orb 
              agentState={getOrbState()} 
              colors={['#3b82f6', '#8b5cf6']}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              Agent Runtime
              <Badge variant="outline" className="font-mono text-xs font-normal text-muted-foreground">
                v1.0.2
              </Badge>
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={cn(
                "w-2 h-2 rounded-full",
                agentState === 'thinking' ? "bg-yellow-500 animate-pulse" :
                agentState === 'talking' ? "bg-purple-500 animate-pulse" :
                agentState === 'listening' ? "bg-blue-500 animate-pulse" :
                "bg-neutral-300"
              )} />
              <span className="capitalize">{agentState || 'Idle'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Log - Scrollable Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-6 py-3 bg-neutral-50/50 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-3 h-3" />
            Execution Trace
          </h3>
          <span className="text-xs font-mono text-muted-foreground">
            {events.length} events
          </span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-0">
          <div className="divide-y divide-neutral-100">
            {events.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Waiting for session initialization...
              </div>
            ) : (
              events.map((event) => (
                <LogEntry key={event.id} event={event} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LogEntry({ event }: { event: CallEvent }) {
  const timestamp = new Date(event.created_at).toLocaleTimeString([], { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3 
  })

  switch (event.event_type) {
    case 'agent_thinking':
      return (
        <div className="group flex gap-4 p-4 hover:bg-neutral-50 transition-colors">
          <div className="w-24 font-mono text-xs text-muted-foreground shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-foreground">Intent Classification</span>
            </div>
            <Card className="bg-neutral-50 border-neutral-200 shadow-none">
              <CardContent className="p-3 font-mono text-xs space-y-1">
                {Object.entries(event.event_data).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-muted-foreground">{k}:</span>
                    <span className="text-foreground font-semibold">
                      {typeof v === 'string' ? v.replace('_', ' ') : String(v)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )

    case 'querying':
      return (
        <div className="group flex gap-4 p-4 hover:bg-neutral-50 transition-colors">
          <div className="w-24 font-mono text-xs text-muted-foreground shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-foreground">SQL Execution</span>
            </div>
            <div className="font-mono text-xs bg-neutral-900 text-neutral-50 p-3 rounded-md overflow-x-auto">
              {event.event_data.sql}
            </div>
          </div>
        </div>
      )

    case 'results':
      return (
        <div className="group flex gap-4 p-4 hover:bg-neutral-50 transition-colors">
          <div className="w-24 font-mono text-xs text-muted-foreground shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-foreground">Query Result</span>
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              {JSON.stringify(event.event_data, null, 2)}
            </div>
          </div>
        </div>
      )

    case 'action':
      return (
        <div className="group flex gap-4 p-4 bg-blue-50/30 hover:bg-blue-50/50 transition-colors border-l-2 border-blue-500">
          <div className="w-24 font-mono text-xs text-muted-foreground shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-foreground">Tool Execution</span>
            </div>
            <p className="text-sm text-foreground">{event.event_data.description}</p>
            {event.event_data.message && (
              <p className="text-xs font-mono text-muted-foreground mt-1">
                Payload: &quot;{event.event_data.message}&quot;
              </p>
            )}
          </div>
        </div>
      )

    default:
      return null
  }
}
