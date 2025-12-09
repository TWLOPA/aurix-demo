'use client'

import dynamic from 'next/dynamic'
import type { CallEvent } from '@/types'
import { Database, Zap, Shield, CheckCircle, Crown, Terminal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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

  // Filter to only reasoning events (not speech)
  const reasoningEvents = events.filter(e => 
    ['understanding', 'agent_thinking', 'compliance_check', 'identity_check', 'identity_verification', 'querying', 'results', 'action'].includes(e.event_type)
  )

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
      case 'understanding':
      case 'agent_thinking':
      case 'compliance_check':
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

  const glassyStyle = {
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.65) 100%)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.6)'
  }

  return (
    <div 
      className="h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #E8F4FC 0%, #D4EAF7 50%, #C7E2F4 100%)',
      }}
    >
      {/* Header with Large Centered Orb - Glassy */}
      <div 
        className="shrink-0 m-4 mb-0 rounded-2xl"
        style={glassyStyle}
      >
        {/* Orb Section */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-32 h-32 mb-4">
            <Orb 
              agentState={getOrbState()} 
              colors={['#000000', '#1a1a1a']}
            />
          </div>
          
          {/* State Indicator */}
          <div className="flex items-center gap-2 text-sm">
            <div className={cn(
              "w-2 h-2 rounded-full transition-colors",
              agentState === 'thinking' && "bg-blue-400 animate-pulse",
              agentState === 'talking' && "bg-neutral-800 animate-pulse",
              agentState === 'listening' && "bg-blue-500 animate-pulse",
              (!agentState || agentState === 'idle') && "bg-neutral-300"
            )} />
            <span className="text-neutral-600 capitalize font-medium">
              {agentState || 'Idle'}
            </span>
          </div>
        </div>

        {/* Title Bar */}
        <div className="px-6 py-3 border-t border-white/40 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-neutral-800">
            Agent Reasoning
          </h2>
          <Badge variant="outline" className="font-mono text-xs font-normal text-neutral-500 bg-white/50 border-white/60">
            Real-time
          </Badge>
        </div>
      </div>

      {/* Execution Log - Scrollable Area - Glassy */}
      <div 
        className="flex-1 overflow-hidden flex flex-col m-4 rounded-2xl"
        style={glassyStyle}
      >
        <div className="px-6 py-3 border-b border-white/40 flex items-center justify-between">
          <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-3 h-3" />
            Decision Audit Trail
          </h3>
          <span className="text-xs font-mono text-neutral-500">
            {reasoningEvents.length} events
          </span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="divide-y divide-white/40">
            {reasoningEvents.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500">
                <p>The agent&apos;s decision-making process will appear here in real-time...</p>
              </div>
            ) : (
              reasoningEvents.map((event) => (
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
    second: '2-digit'
  })

  const data = event.event_data

  // Glassy inner card style - consistent across all events
  const glassyInnerCard = "bg-white/60 border border-white/80 rounded-xl p-3 space-y-1.5 text-sm"

  switch (event.event_type) {
    // Understanding Phase
    case 'understanding':
    case 'agent_thinking':
      return (
        <div className="group flex gap-3 p-4 hover:bg-white/30 transition-colors">
          <div className="w-16 font-mono text-[10px] text-neutral-400 shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
                <Zap className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-neutral-700">Understanding Request</span>
            </div>
            <div className={glassyInnerCard}>
              {data.inquiry_type && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 text-xs">Type:</span>
                  <Badge variant="outline" className="text-[10px] bg-white/50">{data.inquiry_type.replace(/_/g, ' ')}</Badge>
                </div>
              )}
              {data.request_type && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 text-xs">Request:</span>
                  <Badge variant="outline" className="text-[10px] bg-white/50">{data.request_type.replace(/_/g, ' ')}</Badge>
                </div>
              )}
              {data.order_id && (
                <div className="text-xs"><span className="text-neutral-500">Order:</span> <span className="font-mono font-medium text-neutral-800">#{data.order_id}</span></div>
              )}
              {data.prescription_id && (
                <div className="text-xs"><span className="text-neutral-500">Prescription:</span> <span className="font-mono text-neutral-800">{data.prescription_id}</span></div>
              )}
              {data.customer_name && (
                <div className="text-xs"><span className="text-neutral-500">Customer:</span> <span className="text-neutral-800">{data.customer_name}</span></div>
              )}
              {data.order_number && (
                <div className="text-xs"><span className="text-neutral-500">Order:</span> <span className="text-neutral-800">#{data.order_number}</span></div>
              )}
            </div>
          </div>
        </div>
      )

    // Scope Check Phase
    case 'compliance_check':
      const isAllowed = data.allowed !== false && data.result !== 'FAILED'
      const isVIP = data.is_vip || data.check_type === 'vip_customer_detection'
      
      return (
        <div className={cn(
          "group flex gap-3 p-4 transition-colors",
          !isAllowed && "bg-red-50/30"
        )}>
          <div className="w-16 font-mono text-[10px] text-neutral-400 shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center",
                isAllowed ? "bg-blue-500/20" : "bg-red-500/20"
              )}>
                <Shield className={cn("w-3 h-3", isAllowed ? "text-blue-600" : "text-red-500")} />
              </div>
              <span className="text-xs font-medium text-neutral-700">Scope Check</span>
              {!isAllowed && <Badge className="bg-red-100 text-red-600 text-[10px]">Blocked</Badge>}
            </div>
            <div className={glassyInnerCard}>
              {data.check_type && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 text-xs">Check:</span>
                  <Badge variant="outline" className="text-[10px] bg-white/50">{data.check_type.replace(/_/g, ' ')}</Badge>
                </div>
              )}
              {data.inquiry_type && (
                <div className="text-xs"><span className="text-neutral-500">Inquiry:</span> <span className="text-neutral-700">{data.inquiry_type.replace(/_/g, ' ')}</span></div>
              )}
              {(data.allowed !== undefined || data.result) && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 text-xs">Permitted:</span>
                  <span className={cn("text-xs font-medium", isAllowed ? "text-blue-600" : "text-red-600")}>
                    {isAllowed ? '✓ Yes' : '✗ Escalate'}
                  </span>
                </div>
              )}
              {data.reason && (
                <div className="text-neutral-500 text-[11px] italic">{data.reason}</div>
              )}
              {isVIP && data.customer_ltv && (
                <div className="mt-2 pt-2 border-t border-white/60 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-neutral-600" />
                    <span className="text-xs font-medium text-neutral-700">VIP Customer</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 pl-5">
                    LTV: £{Number(data.customer_ltv).toLocaleString()} · {data.vip_tier?.toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )

    // Identity Check Phase
    case 'identity_check':
      return (
        <div className="group flex gap-3 p-4 hover:bg-white/30 transition-colors border-l-2 border-blue-400">
          <div className="w-16 font-mono text-[10px] text-neutral-400 shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
                <Shield className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-neutral-700">Identity Required</span>
              <Badge className="bg-blue-100 text-blue-600 text-[10px]">HIPAA</Badge>
            </div>
            <div className={glassyInnerCard}>
              {data.order_id && (
                <div className="text-xs"><span className="text-neutral-500">For Order:</span> <span className="font-mono font-medium text-neutral-800">#{data.order_id}</span></div>
              )}
              {data.verification_method && (
                <div className="text-xs"><span className="text-neutral-500">Method:</span> <span className="text-neutral-700">{data.verification_method.replace(/_/g, ' ')}</span></div>
              )}
              {data.identity_provided === false && (
                <div className="flex items-center gap-1.5 text-blue-600 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Awaiting verification...
                </div>
              )}
            </div>
          </div>
        </div>
      )

    // Identity Verification Result
    case 'identity_verification':
      const identityVerified = data.verified === true || data.compliance === 'PASSED'
      return (
        <div className={cn(
          "group flex gap-3 p-4 transition-colors border-l-2",
          identityVerified ? "border-blue-500" : "border-red-500 bg-red-50/30"
        )}>
          <div className="w-16 font-mono text-[10px] text-neutral-400 shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center",
                identityVerified ? "bg-blue-500/20" : "bg-red-500/20"
              )}>
                <Shield className={cn("w-3 h-3", identityVerified ? "text-blue-600" : "text-red-500")} />
              </div>
              <span className="text-xs font-medium text-neutral-700">Identity Verified</span>
              <Badge className={cn("text-[10px]", identityVerified ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600")}>
                {identityVerified ? '✓ Passed' : '✗ Failed'}
              </Badge>
            </div>
            <div className={glassyInnerCard}>
              {data.method && (
                <div className="text-xs"><span className="text-neutral-500">Method:</span> <span className="text-neutral-700">{data.method.replace(/_/g, ' ')}</span></div>
              )}
              {data.customer_id && (
                <div className="text-xs"><span className="text-neutral-500">Customer:</span> <span className="font-mono text-neutral-700">{data.customer_id}</span></div>
              )}
              {identityVerified && (
                <div className="text-[11px] text-blue-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Proceeding with request
                </div>
              )}
            </div>
          </div>
        </div>
      )

    // Query Phase
    case 'querying':
      return (
        <div className="group flex gap-3 p-4 hover:bg-white/30 transition-colors">
          <div className="w-16 font-mono text-[10px] text-neutral-400 shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
                <Database className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-neutral-700">Database Query</span>
            </div>
            {data.systems && (
              <div className="text-[11px] text-neutral-500">
                Systems: {data.systems.join(', ')}
              </div>
            )}
            {data.sql && (
              <div className="font-mono text-[10px] bg-neutral-800 text-blue-300 p-2.5 rounded-lg overflow-x-auto">
                {data.sql}
              </div>
            )}
            {data.queries && Array.isArray(data.queries) && (
              <div className="space-y-1.5">
                {data.queries.map((query: string, idx: number) => (
                  <div key={idx} className="font-mono text-[10px] bg-neutral-800 text-blue-300 p-2.5 rounded-lg overflow-x-auto">
                    {query}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )

    // Results Phase
    case 'results':
      return (
        <div className="group flex gap-3 p-4 hover:bg-white/30 transition-colors">
          <div className="w-16 font-mono text-[10px] text-neutral-400 shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-neutral-700">Query Results</span>
            </div>
            <div className={glassyInnerCard}>
              {Object.entries(data).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) return null
                return (
                  <div key={key} className="flex gap-2 text-xs">
                    <span className="text-neutral-500">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-medium text-neutral-700">{String(value)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )

    // Action Phase - with special styling for escalations
    case 'action':
      const isEscalation = data.type === 'clinician_escalation' || data.type === 'escalation'
      
      return (
        <div className={cn(
          "group flex gap-3 p-4 transition-colors border-l-2",
          isEscalation 
            ? "bg-red-50/50 border-red-500" 
            : "hover:bg-white/30 border-blue-500"
        )}>
          <div className="w-16 font-mono text-[10px] text-neutral-400 shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center",
                isEscalation ? "bg-red-500/20" : "bg-blue-500/20"
              )}>
                {isEscalation ? (
                  <Shield className="w-3 h-3 text-red-600" />
                ) : (
                  <Zap className="w-3 h-3 text-blue-600" />
                )}
              </div>
              <span className="text-xs font-medium text-neutral-700">
                {isEscalation ? 'Clinician Escalation' : 'Action'}
              </span>
              {data.type && (
                <Badge className={cn(
                  "text-[10px]",
                  isEscalation ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                )}>
                  {isEscalation ? 'ESCALATED' : data.type.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
            <div className={cn(
              glassyInnerCard,
              isEscalation && "border-red-200 bg-red-50/50"
            )}>
              {data.description && (
                <div className="flex items-start gap-1.5 text-xs">
                  <span className={isEscalation ? "text-red-600" : "text-blue-600"}>
                    {isEscalation ? '⚠' : '✓'}
                  </span>
                  <span className={cn("text-neutral-700", isEscalation && "font-medium")}>
                    {data.description}
                  </span>
                </div>
              )}
              {/* Escalation-specific fields */}
              {isEscalation && data.scheduled_within && (
                <div className="text-xs text-red-600 mt-1">
                  Callback scheduled within: {data.scheduled_within}
                </div>
              )}
              {isEscalation && data.reason && (
                <div className="text-[11px] text-neutral-500 italic mt-1">
                  Trigger: {data.reason}
                </div>
              )}
              {data.message && (
                <p className="text-[11px] font-mono text-neutral-500 italic">
                  &quot;{data.message}&quot;
                </p>
              )}
              {data.actions && Array.isArray(data.actions) && (
                <div className="space-y-1.5 pt-1">
                  {data.actions.map((action: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs pl-2 border-l border-blue-200">
                      <span className="text-blue-600">✓</span>
                      <span className="text-neutral-700">{action.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}
