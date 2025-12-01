'use client'

import { useEffect, useState } from 'react'
import type { CallEvent } from '@/types'
import { ThinkingPanel } from './ThinkingPanel'
import { DatabasePanel } from './DatabasePanel'
import { ActionsPanel } from './ActionsPanel'
import { Brain, Activity } from 'lucide-react'

interface AgentBrainPanelProps {
  events: CallEvent[]
}

export function AgentBrainPanel({ events }: AgentBrainPanelProps) {
  const [agentState, setAgentState] = useState<'idle' | 'listening' | 'thinking' | 'talking'>('idle')

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
    }
  }, [events])

  // Get latest event of each type
  const thinkingEvent = [...events].reverse().find(e => e.event_type === 'agent_thinking')
  const queryEvent = [...events].reverse().find(e => e.event_type === 'querying')
  const resultsEvent = [...events].reverse().find(e => e.event_type === 'results')
  const actionEvents = events.filter(e => e.event_type === 'action')

  const getStateColor = () => {
    switch (agentState) {
      case 'idle': return 'text-slate-500'
      case 'listening': return 'text-orix-accent animate-pulse'
      case 'thinking': return 'text-yellow-500 animate-pulse'
      case 'talking': return 'text-orix-purple animate-pulse'
    }
  }

  const getStateText = () => {
    switch (agentState) {
      case 'idle': return 'Idle'
      case 'listening': return 'Listening...'
      case 'thinking': return 'Processing...'
      case 'talking': return 'Responding...'
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-800 p-4 sticky top-0 bg-slate-900 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-orix-purple" />
            <h2 className="text-lg font-semibold text-white">
              Agent Brain
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${getStateColor()}`} />
            <span className={`text-sm font-medium ${getStateColor()}`}>
              {getStateText()}
            </span>
          </div>
        </div>
      </div>

      {/* Agent Orb Visualization */}
      <div className="p-6 flex justify-center">
        <AgentOrb state={agentState} />
      </div>

      {/* Panels */}
      <div className="flex-1 p-6 space-y-4">
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
          <div className="h-64 flex items-center justify-center">
            <p className="text-slate-500 text-sm">
              Waiting for agent to process...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Simple Agent Orb (can be replaced with @11labs/react component later)
function AgentOrb({ state }: { state: string }) {
  const getOrbStyles = () => {
    switch (state) {
      case 'idle':
        return 'bg-slate-700 shadow-slate-500/20'
      case 'listening':
        return 'bg-orix-accent shadow-orix-accent/50 animate-pulse'
      case 'thinking':
        return 'bg-yellow-500 shadow-yellow-500/50 animate-pulse-slow'
      case 'talking':
        return 'bg-orix-purple shadow-orix-purple/50 animate-pulse'
      default:
        return 'bg-slate-700'
    }
  }

  return (
    <div className="relative">
      <div className={`w-32 h-32 rounded-full ${getOrbStyles()} shadow-2xl transition-all duration-300`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
      </div>
      {/* Rings */}
      {state !== 'idle' && (
        <>
          <div className={`absolute inset-0 rounded-full border-2 ${getOrbStyles()} opacity-30 animate-ping`} style={{ animationDuration: '2s' }} />
          <div className={`absolute inset-0 rounded-full border ${getOrbStyles()} opacity-20 animate-ping`} style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        </>
      )}
    </div>
  )
}

