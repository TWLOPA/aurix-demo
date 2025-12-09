'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { 
  Clock, Shield, CheckCircle, AlertTriangle, 
  Package, Zap, ChevronRight, Phone, Calendar,
  Search, Filter, FileText
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    
    // Get unique call sessions with aggregated data
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
        e.event_type === 'compliance_check' && e.event_data?.allowed === false
      )

      sessionSummaries.push({
        call_sid,
        started_at: events[events.length - 1]?.created_at || new Date().toISOString(),
        event_count: events.length,
        verified,
        orders_accessed: [...new Set(orders)] as string[],
        actions_taken: actions,
        compliance_blocked: blocked
      })
    })

    // Sort by date, most recent first
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Call Logs</h1>
            <p className="text-sm text-neutral-500">View past conversation sessions and audit trails</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={fetchSessions}>
              <Search className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sessions List */}
        <div className="w-96 border-r border-neutral-200 bg-white overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-neutral-500">
              <div className="animate-pulse space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-24 bg-neutral-100 rounded-lg" />
                ))}
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center">
              <Phone className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500">No call sessions yet</p>
              <p className="text-sm text-neutral-400">Start a conversation to see logs here</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {sessions.map((session) => (
                <button
                  key={session.call_sid}
                  onClick={() => loadSessionEvents(session.call_sid)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-neutral-50 transition-colors",
                    selectedSession === session.call_sid && "bg-neutral-100"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        session.verified ? "bg-green-500" : "bg-amber-500"
                      )} />
                      <span className="font-mono text-xs text-neutral-500">
                        {session.call_sid.substring(0, 20)}...
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
                      <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {session.orders_accessed.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Package className="w-3 h-3 mr-1" />
                        {session.orders_accessed.length} order(s)
                      </Badge>
                    )}
                    {session.actions_taken > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Zap className="w-3 h-3 mr-1" />
                        {session.actions_taken} action(s)
                      </Badge>
                    )}
                    {session.compliance_blocked && (
                      <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">
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

        {/* Event Details */}
        <div className="flex-1 bg-neutral-50 overflow-y-auto">
          {!selectedSession ? (
            <div className="h-full flex items-center justify-center text-neutral-400">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                <p className="text-lg font-medium text-neutral-500">Select a session</p>
                <p className="text-sm">View the complete audit trail</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-1">Session Timeline</h2>
                <p className="text-sm text-neutral-500 font-mono">{selectedSession}</p>
              </div>

              <div className="space-y-3">
                {sessionEvents.map((event, idx) => (
                  <div 
                    key={event.id} 
                    className="bg-white rounded-lg border border-neutral-200 p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-neutral-400">
                        {formatTime(event.created_at)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {event.event_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-neutral-600">
                      {event.event_type === 'user_spoke' && (
                        <p className="italic">&quot;{event.event_data?.text}&quot;</p>
                      )}
                      {event.event_type === 'agent_spoke' && (
                        <p>&quot;{event.event_data?.text}&quot;</p>
                      )}
                      {event.event_type === 'querying' && (
                        <code className="text-xs bg-neutral-100 p-2 rounded block overflow-x-auto">
                          {event.event_data?.sql}
                        </code>
                      )}
                      {event.event_type === 'results' && (
                        <pre className="text-xs bg-neutral-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(event.event_data, null, 2)}
                        </pre>
                      )}
                      {event.event_type === 'action' && (
                        <p>
                          <span className="font-medium">{event.event_data?.type?.toUpperCase()}</span>: {event.event_data?.description}
                        </p>
                      )}
                      {event.event_type === 'compliance_check' && (
                        <p>
                          {event.event_data?.allowed ? '✓ Allowed' : '✗ Blocked'}: {event.event_data?.reason}
                        </p>
                      )}
                      {event.event_type === 'identity_verification' && (
                        <p>
                          {event.event_data?.verified ? '✓ Verified' : '✗ Failed'} via {event.event_data?.method}
                        </p>
                      )}
                      {!['user_spoke', 'agent_spoke', 'querying', 'results', 'action', 'compliance_check', 'identity_verification'].includes(event.event_type) && (
                        <pre className="text-xs bg-neutral-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(event.event_data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

