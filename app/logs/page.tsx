'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { 
  Clock, Shield, CheckCircle, AlertTriangle, 
  Package, Zap, ChevronRight, Phone, Calendar,
  Search, RefreshCw, FileText, MessageSquare, Database
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CallSession {
  call_sid: string
  started_at: string
  event_count: number
  verified: boolean
  orders_accessed: string[]
  actions_taken: number
  compliance_blocked: boolean
}

const glassyCardStyle = {
  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.65) 100%)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.6)'
}

export default function CallLogsPage() {
  const [sessions, setSessions] = useState<CallSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [sessionEvents, setSessionEvents] = useState<any[]>([])

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('call_events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
      setLoading(false)
      return
    }

    // Group events by call_sid
    const sessionMap = new Map<string, any[]>()
    data?.forEach(event => {
      const existing = sessionMap.get(event.call_sid) || []
      existing.push(event)
      sessionMap.set(event.call_sid, existing)
    })

    // Convert to session summaries
    const sessionSummaries: CallSession[] = []
    sessionMap.forEach((events, call_sid) => {
      if (call_sid === 'DEMO_SESSION_ID' && events.length === 0) return
      
      const verified = events.some(e => 
        e.event_type === 'identity_verification' && 
        (e.event_data?.verified || e.event_data?.compliance === 'PASSED')
      )
      
      const orders = events
        .filter(e => e.event_type === 'querying')
        .map(e => {
          const match = e.event_data?.sql?.match(/order_id = '([^']+)'/)
          return match ? match[1] : null
        })
        .filter(Boolean)

      const actions = events.filter(e => e.event_type === 'action').length
      const blocked = events.some(e => 
        (e.event_type === 'compliance_check' && e.event_data?.allowed === false) ||
        (e.event_type === 'action' && (e.event_data?.type === 'clinician_escalation' || e.event_data?.type === 'escalation'))
      )

      sessionSummaries.push({
        call_sid,
        started_at: events[events.length - 1]?.created_at || new Date().toISOString(),
        event_count: events.length,
        verified,
        orders_accessed: Array.from(new Set(orders)) as string[],
        actions_taken: actions,
        compliance_blocked: blocked
      })
    })

    sessionSummaries.sort((a, b) => 
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    )

    setSessions(sessionSummaries)
    setLoading(false)
  }

  const loadSessionEvents = async (call_sid: string) => {
    setSelectedSession(call_sid)
    
    const { data, error } = await supabase
      .from('call_events')
      .select('*')
      .eq('call_sid', call_sid)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setSessionEvents(data)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'user_spoke':
        return <MessageSquare className="w-3 h-3 text-blue-600" />
      case 'agent_spoke':
        return <MessageSquare className="w-3 h-3 text-neutral-600" />
      case 'querying':
        return <Database className="w-3 h-3 text-blue-600" />
      case 'results':
        return <CheckCircle className="w-3 h-3 text-emerald-600" />
      case 'action':
        return <Zap className="w-3 h-3 text-blue-600" />
      case 'compliance_check':
        return <Shield className="w-3 h-3 text-amber-600" />
      case 'identity_verification':
        return <Shield className="w-3 h-3 text-blue-600" />
      default:
        return <FileText className="w-3 h-3 text-neutral-500" />
    }
  }

  const getEventBadgeStyle = (eventType: string, data: any) => {
    if (eventType === 'compliance_check' && data?.allowed === false) {
      return 'bg-red-100 text-red-700'
    }
    if (eventType === 'action' && (data?.type === 'clinician_escalation' || data?.type === 'escalation')) {
      return 'bg-red-100 text-red-700'
    }
    if (eventType === 'identity_verification' && data?.verified) {
      return 'bg-emerald-100 text-emerald-700'
    }
    if (eventType === 'user_spoke') {
      return 'bg-blue-100 text-blue-700'
    }
    return 'bg-neutral-100 text-neutral-600'
  }

  return (
    <div 
      className="h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #E8F4FC 0%, #D4EAF7 50%, #C7E2F4 100%)',
      }}
    >
      {/* Header */}
      <div className="p-4 pb-0">
        <div 
          className="rounded-2xl px-5 py-4"
          style={glassyCardStyle}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-900">Call Logs</h1>
                <p className="text-sm text-neutral-500">View past conversation sessions and audit trails</p>
              </div>
            </div>
            <button 
              onClick={fetchSessions}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 text-sm font-medium text-neutral-700 transition-colors border border-white/60"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Sessions List */}
        <div 
          className="w-96 rounded-2xl overflow-hidden flex flex-col"
          style={glassyCardStyle}
        >
          <div className="p-4 border-b border-white/40">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-500">{sessions.length} sessions</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-neutral-500">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-6 text-center">
                <Phone className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-600 font-medium">No call sessions yet</p>
                <p className="text-sm text-neutral-400">Start a conversation to see logs here</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {sessions.map((session) => (
                  <button
                    key={session.call_sid}
                    onClick={() => loadSessionEvents(session.call_sid)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl transition-all duration-200",
                      selectedSession === session.call_sid 
                        ? "bg-blue-50/80 border-2 border-blue-200" 
                        : "bg-white/50 border border-white/60 hover:bg-white/80"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          session.verified ? "bg-emerald-500" : "bg-amber-500"
                        )} />
                        <span className="font-mono text-xs text-neutral-500">
                          {session.call_sid.substring(0, 16)}...
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                      <Calendar className="w-3 h-3" />
                      {formatDate(session.started_at)}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {session.verified && (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {session.orders_accessed.length > 0 && (
                        <Badge className="text-[10px] bg-blue-100 text-blue-700 border-0">
                          <Package className="w-3 h-3 mr-1" />
                          {session.orders_accessed.length} order(s)
                        </Badge>
                      )}
                      {session.actions_taken > 0 && (
                        <Badge className="text-[10px] bg-neutral-100 text-neutral-600 border-0">
                          <Zap className="w-3 h-3 mr-1" />
                          {session.actions_taken} action(s)
                        </Badge>
                      )}
                      {session.compliance_blocked && (
                        <Badge className="text-[10px] bg-red-100 text-red-700 border-0">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Escalated
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div 
          className="flex-1 rounded-2xl overflow-hidden flex flex-col"
          style={glassyCardStyle}
        >
          {!selectedSession ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                <p className="text-lg font-medium text-neutral-600">Select a session</p>
                <p className="text-sm text-neutral-400">View the complete audit trail</p>
              </div>
            </div>
          ) : (
            <>
              {/* Timeline Header */}
              <div className="p-5 border-b border-white/40">
                <h2 className="text-base font-semibold text-neutral-900 mb-1">Session Timeline</h2>
                <p className="text-xs text-neutral-500 font-mono">{selectedSession}</p>
              </div>

              {/* Timeline Events */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {sessionEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className={cn(
                      "bg-white/60 rounded-xl p-4 border border-white/60",
                      event.event_type === 'action' && (event.event_data?.type === 'clinician_escalation' || event.event_data?.type === 'escalation') && "border-red-200 bg-red-50/50",
                      event.event_type === 'compliance_check' && event.event_data?.allowed === false && "border-red-200 bg-red-50/50"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 rounded-md bg-white/80 flex items-center justify-center border border-white/60">
                        {getEventIcon(event.event_type)}
                      </div>
                      <span className="font-mono text-xs text-neutral-400">
                        {formatTime(event.created_at)}
                      </span>
                      <Badge className={cn("text-[10px] border-0", getEventBadgeStyle(event.event_type, event.event_data))}>
                        {event.event_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-neutral-600 pl-9">
                      {event.event_type === 'user_spoke' && (
                        <p className="italic text-blue-700">&quot;{event.event_data?.text}&quot;</p>
                      )}
                      {event.event_type === 'agent_spoke' && (
                        <p className="text-neutral-600">&quot;{event.event_data?.text}&quot;</p>
                      )}
                      {event.event_type === 'querying' && (
                        <code className="text-xs bg-neutral-900 text-blue-300 p-2 rounded-lg block overflow-x-auto">
                          {event.event_data?.sql}
                        </code>
                      )}
                      {event.event_type === 'results' && (
                        <div className="text-xs space-y-1">
                          {Object.entries(event.event_data || {}).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="text-neutral-500">{key.replace(/_/g, ' ')}:</span>
                              <span className="font-medium text-neutral-700">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {event.event_type === 'action' && (
                        <div>
                          <p className={cn(
                            "font-medium",
                            (event.event_data?.type === 'clinician_escalation' || event.event_data?.type === 'escalation') ? "text-red-700" : "text-blue-700"
                          )}>
                            {event.event_data?.type?.replace(/_/g, ' ').toUpperCase()}
                          </p>
                          <p className="text-neutral-600">{event.event_data?.description}</p>
                          {event.event_data?.scheduled_within && (
                            <p className="text-xs text-red-600 mt-1">Callback: {event.event_data.scheduled_within}</p>
                          )}
                        </div>
                      )}
                      {event.event_type === 'compliance_check' && (
                        <p className={cn(
                          "font-medium",
                          event.event_data?.allowed ? "text-emerald-700" : "text-red-700"
                        )}>
                          {event.event_data?.allowed ? '✓ Allowed' : '✗ BLOCKED'}: {event.event_data?.reason}
                        </p>
                      )}
                      {event.event_type === 'identity_verification' && (
                        <p className={cn(
                          "font-medium",
                          event.event_data?.verified ? "text-emerald-700" : "text-amber-700"
                        )}>
                          {event.event_data?.verified ? '✓ Verified' : '✗ Failed'} via {event.event_data?.method?.replace(/_/g, ' ')}
                        </p>
                      )}
                      {!['user_spoke', 'agent_spoke', 'querying', 'results', 'action', 'compliance_check', 'identity_verification'].includes(event.event_type) && (
                        <pre className="text-xs bg-neutral-100 p-2 rounded-lg overflow-x-auto">
                          {JSON.stringify(event.event_data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
