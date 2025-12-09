'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, CheckCircle, User, MessageSquare } from 'lucide-react'

const supabase = createClient()

interface Escalation {
  id: number
  call_sid: string
  customer_id: string | null
  inquiry_type: string
  inquiry_text: string
  blocked_reason: string
  escalation_status: string
  agent_response: string | null
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
}

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null)

  useEffect(() => {
    fetchEscalations()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('escalations_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clinician_escalations'
        },
        (payload) => {
          console.log('[Escalations] New escalation:', payload.new)
          setEscalations(prev => [payload.new as Escalation, ...prev])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const fetchEscalations = async () => {
    try {
      const { data, error } = await supabase
        .from('clinician_escalations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Escalations] Error fetching:', error)
        return
      }

      setEscalations(data || [])
    } catch (err) {
      console.error('[Escalations] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>
      case 'assigned':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Assigned</Badge>
      case 'resolved':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Resolved</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getInquiryTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'side_effects': 'bg-red-500/20 text-red-400 border-red-500/30',
      'dosage': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'medical_advice': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'drug_interaction': 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    }
    return (
      <Badge className={colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
        {type.replace('_', ' ')}
      </Badge>
    )
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Escalation List */}
      <div className="w-1/2 border-r border-border overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Clinician Escalations</h1>
              <p className="text-sm text-muted-foreground">
                Medical inquiries requiring licensed clinician review
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : escalations.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No escalations yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Medical advice requests will appear here
              </p>
            </div>
          ) : (
            escalations.map((escalation) => (
              <Card
                key={escalation.id}
                className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                  selectedEscalation?.id === escalation.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedEscalation(escalation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(escalation.escalation_status)}
                        {getInquiryTypeBadge(escalation.inquiry_type)}
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {escalation.inquiry_text}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTime(escalation.created_at)}
                        {escalation.customer_id && (
                          <>
                            <span>•</span>
                            <User className="w-3 h-3" />
                            {escalation.customer_id}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Escalation Details */}
      <div className="w-1/2 overflow-hidden flex flex-col bg-mist/30">
        {selectedEscalation ? (
          <>
            <div className="p-6 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">Escalation Details</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(selectedEscalation.created_at)}
                  </p>
                </div>
                {getStatusBadge(selectedEscalation.escalation_status)}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Inquiry Type */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Inquiry Type
                </h3>
                {getInquiryTypeBadge(selectedEscalation.inquiry_type)}
              </div>

              {/* Customer Question */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Customer Question
                </h3>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed">
                      &ldquo;{selectedEscalation.inquiry_text}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Blocked Reason */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Compliance Block Reason
                </h3>
                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-200">
                        {selectedEscalation.blocked_reason}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Agent Response */}
              {selectedEscalation.agent_response && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Agent Response
                  </h3>
                  <Card className="bg-card">
                    <CardContent className="p-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {selectedEscalation.agent_response}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Session Info */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Session Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-card">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Call Session</p>
                      <p className="text-sm font-mono">{selectedEscalation.call_sid}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Customer ID</p>
                      <p className="text-sm font-mono">{selectedEscalation.customer_id || 'Unknown'}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Resolution */}
              {selectedEscalation.resolved_at && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Resolution
                  </h3>
                  <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-emerald-200">
                            Resolved by {selectedEscalation.resolved_by}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(selectedEscalation.resolved_at)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Select an escalation to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

