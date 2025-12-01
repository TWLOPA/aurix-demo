'use client'

import dynamic from 'next/dynamic'
import type { CallEvent } from '@/types'
import { ThinkingPanel } from './ThinkingPanel'
import { DatabasePanel } from './DatabasePanel'
import { ActionsPanel } from './ActionsPanel'
import { Brain, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

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
        // Don't reset state for other events to avoid flickering
        break
    }
  }, [events])

  // Get latest event of each type
  const thinkingEvent = [...events].reverse().find(e => e.event_type === 'agent_thinking')
  const queryEvent = [...events].reverse().find(e => e.event_type === 'querying')
  const resultsEvent = [...events].reverse().find(e => e.event_type === 'results')
  const actionEvents = events.filter(e => e.event_type === 'action')

  const getStateColor = () => {
    switch (agentState) {
      case 'idle': return 'text-muted-foreground'
      case 'listening': return 'text-primary animate-pulse'
      case 'thinking': return 'text-yellow-500 animate-pulse'
      case 'talking': return 'text-purple-500 animate-pulse'
      default: return 'text-muted-foreground'
    }
  }

  const getStateText = () => {
    switch (agentState) {
      case 'idle': return 'Idle'
      case 'listening': return 'Listening...'
      case 'thinking': return 'Processing...'
      case 'talking': return 'Responding...'
      default: return 'Idle'
    }
  }

  // Helper for Orb state (maps our state to Orb's expected types)
  // Orb expects: null | "thinking" | "listening" | "talking"
  const getOrbState = () => {
    if (agentState === 'idle') return null
    return agentState
  }

  return (
    <Card className="h-full flex flex-col border-none rounded-none bg-background shadow-none">
      {/* Header */}
      <div className="border-b p-4 sticky top-0 bg-card z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Agent Brain
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Activity className={`w-3.5 h-3.5 ${getStateColor()}`} />
            <span className={`text-xs font-medium ${getStateColor()}`}>
              {getStateText()}
            </span>
          </div>
        </div>
      </div>

      {/* Agent Orb Visualization */}
      <div className="p-8 flex justify-center items-center min-h-[300px] bg-gradient-to-b from-background to-muted/30 border-b">
        <div className="w-64 h-64">
          <Orb 
            agentState={getOrbState()} 
            colors={['#3b82f6', '#8b5cf6']} // Blue to Purple gradient (keeping consistent with brand)
          />
        </div>
      </div>

      {/* Panels */}
      <div className="flex-1 p-6 space-y-6 bg-muted/10">
        {/* Thinking Panel */}
        {thinkingEvent && (
          <ThinkingPanel data={thinkingEvent.event_data} />
        )}

        {/* Database Panel */}
        {(queryEvent || resultsEvent) && (
          <DatabasePanel
            query={queryEvent?.event_data}
            results={resultsEvent?.event_data}
          />
        )}

        {/* Actions Panel */}
        {actionEvents.length > 0 && (
          <ActionsPanel actions={actionEvents.map(e => e.event_data)} />
        )}

        {/* Empty state */}
        {!thinkingEvent && !queryEvent && !resultsEvent && actionEvents.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
            <Brain className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Waiting for agent to process...
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
