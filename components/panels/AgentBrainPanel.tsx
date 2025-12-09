'use client'

import dynamic from 'next/dynamic'
import type { CallEvent } from '@/types'
import { Brain, Database, Zap, Shield, CheckCircle, AlertTriangle, User, Crown, Terminal } from 'lucide-react'
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
    ['understanding', 'agent_thinking', 'compliance_check', 'querying', 'results', 'action'].includes(e.event_type)
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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Agent Header & Orb - Fixed Top */}
      <div className="border-b border-neutral-200 bg-background p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {/* Floating Geomorph Orb - Small (No Container) */}
          <div className="w-16 h-16">
            <Orb 
              agentState={getOrbState()} 
              colors={['#000000', '#000000']}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              🧠 Agent Reasoning
              <Badge variant="outline" className="font-mono text-xs font-normal text-muted-foreground">
                Real-time
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
            Decision Audit Trail
          </h3>
          <span className="text-xs font-mono text-muted-foreground">
            {reasoningEvents.length} events
          </span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-0">
          <div className="divide-y divide-neutral-100">
            {reasoningEvents.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
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

  switch (event.event_type) {
    // Understanding Phase
    case 'understanding':
    case 'agent_thinking':
      return (
        <div className="group flex gap-4 p-4 hover:bg-neutral-50 transition-colors">
          <div className="w-20 font-mono text-xs text-muted-foreground shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-foreground">⚡ Understanding</span>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-1 text-sm">
              {data.inquiry_type && (
                <div><span className="text-muted-foreground">Type:</span> <Badge variant="outline">{data.inquiry_type.replace(/_/g, ' ')}</Badge></div>
              )}
              {data.request_type && (
                <div><span className="text-muted-foreground">Request:</span> <Badge variant="outline">{data.request_type.replace(/_/g, ' ')}</Badge></div>
              )}
              {data.order_id && (
                <div><span className="text-muted-foreground">Order:</span> <span className="font-mono font-semibold">#{data.order_id}</span></div>
              )}
              {data.prescription_id && (
                <div><span className="text-muted-foreground">Prescription:</span> <span className="font-mono">{data.prescription_id}</span></div>
              )}
              {data.customer_name && (
                <div><span className="text-muted-foreground">Customer:</span> {data.customer_name}</div>
              )}
              {data.order_number && (
                <div><span className="text-muted-foreground">Order:</span> #{data.order_number}</div>
              )}
            </div>
          </div>
        </div>
      )

    // Compliance Check Phase
    case 'compliance_check':
      const isAllowed = data.allowed !== false && data.result !== 'FAILED'
      const isVIP = data.is_vip || data.check_type === 'vip_customer_detection'
      
      return (
        <div className={cn(
          "group flex gap-4 p-4 transition-colors",
          isAllowed ? "hover:bg-green-50/50" : "hover:bg-red-50/50 bg-red-50/30"
        )}>
          <div className="w-20 font-mono text-xs text-muted-foreground shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className={cn("w-4 h-4", isAllowed ? "text-green-500" : "text-red-500")} />
              <span className="text-sm font-medium text-foreground">🛡️ Compliance Check</span>
            </div>
            <div className={cn(
              "border rounded-lg p-3 space-y-2 text-sm",
              isAllowed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            )}>
              {/* Check Type */}
              {data.check_type && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Check:</span>
                  <Badge variant="outline">{data.check_type.replace(/_/g, ' ')}</Badge>
                </div>
              )}
              
              {/* Inquiry Type (for medical advice checks) */}
              {data.inquiry_type && (
                <div><span className="text-muted-foreground">Inquiry:</span> {data.inquiry_type.replace(/_/g, ' ')}</div>
              )}
              
              {/* Status */}
              {(data.allowed !== undefined || data.result) && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={isAllowed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {data.result || (data.allowed ? '✓ ALLOWED' : '✗ BLOCKED')}
                  </Badge>
                </div>
              )}
              
              {/* Reason */}
              {data.reason && (
                <div className="text-muted-foreground text-xs italic">{data.reason}</div>
              )}
              
              {/* Action */}
              {data.action && (
                <div className="flex items-center gap-2 pt-1">
                  <Zap className="w-3 h-3 text-blue-500" />
                  <span className="text-xs font-medium">{data.action}</span>
                </div>
              )}
              
              {/* VIP Detection */}
              {isVIP && data.customer_ltv && (
                <div className="mt-2 pt-2 border-t border-green-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-amber-700">⭐ VIP Customer Detected</span>
                  </div>
                  <div className="text-xs space-y-1 pl-6">
                    <div><span className="text-muted-foreground">LTV:</span> £{Number(data.customer_ltv).toLocaleString()}</div>
                    <div><span className="text-muted-foreground">Tier:</span> <Badge className="bg-amber-100 text-amber-700">{data.vip_tier?.toUpperCase()}</Badge></div>
                    {data.special_handling && (
                      <div className="text-amber-600 font-medium">{data.special_handling}</div>
                    )}
                  </div>
                </div>
              )}
              
              {/* HIPAA Notice */}
              {data.hipaa_required && (
                <div className="text-xs text-blue-600 flex items-center gap-1 pt-1">
                  <Shield className="w-3 h-3" />
                  HIPAA verification required
                </div>
              )}
            </div>
          </div>
        </div>
      )

    // Query Phase
    case 'querying':
      return (
        <div className="group flex gap-4 p-4 hover:bg-neutral-50 transition-colors">
          <div className="w-20 font-mono text-xs text-muted-foreground shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-foreground">🔍 Database Query</span>
            </div>
            {data.systems && (
              <div className="text-xs text-muted-foreground mb-2">
                Systems: {data.systems.join(', ')}
              </div>
            )}
            {data.sql && (
              <div className="font-mono text-xs bg-neutral-900 text-green-400 p-3 rounded-md overflow-x-auto">
                {data.sql}
              </div>
            )}
            {data.queries && Array.isArray(data.queries) && (
              <div className="space-y-2">
                {data.queries.map((query: string, idx: number) => (
                  <div key={idx} className="font-mono text-xs bg-neutral-900 text-green-400 p-3 rounded-md overflow-x-auto">
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
        <div className="group flex gap-4 p-4 hover:bg-neutral-50 transition-colors">
          <div className="w-20 font-mono text-xs text-muted-foreground shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-foreground">✅ Query Results</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1 text-sm">
              {Object.entries(data).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) return null
                return (
                  <div key={key} className="flex gap-2">
                    <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                    {typeof value === 'boolean' ? (
                      <Badge variant={value ? "default" : "secondary"}>{value ? 'Yes' : 'No'}</Badge>
                    ) : (
                      <span className="font-medium">{String(value)}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )

    // Action Phase
    case 'action':
      return (
        <div className="group flex gap-4 p-4 bg-blue-50/30 hover:bg-blue-50/50 transition-colors border-l-2 border-blue-500">
          <div className="w-20 font-mono text-xs text-muted-foreground shrink-0 text-right pt-1">
            {timestamp}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-foreground">📱 Action Triggered</span>
            </div>
            <div className="space-y-2">
              {data.type && (
                <Badge className="bg-blue-100 text-blue-700">
                  {data.type.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              )}
              {data.description && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-600">✓</span>
                  <span>{data.description}</span>
                </div>
              )}
              {data.message && (
                <p className="text-xs font-mono text-muted-foreground">
                  &quot;{data.message}&quot;
                </p>
              )}
              {/* Multiple actions */}
              {data.actions && Array.isArray(data.actions) && (
                <div className="space-y-2 pt-2">
                  {data.actions.map((action: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-sm border-l-2 border-blue-300 pl-3">
                      <Badge variant="outline" className="text-xs">
                        {action.type?.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      <span className="text-green-600">✓</span>
                      <span>{action.description}</span>
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
