'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, CheckCircle, User, MessageSquare, Shield, Phone } from 'lucide-react'

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
  callback_requested: boolean
  callback_scheduled_at: string | null
}

const glassyCardStyle = {
  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.65) 100%)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.6)'
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
    console.log('[Escalations] Fetching escalations...')
    try {
      const { data, error } = await supabase
        .from('clinician_escalations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Escalations] Error fetching:', error.message)
        console.error('[Escalations] Error details:', JSON.stringify(error))
        return
      }

      console.log('[Escalations] Fetched', data?.length || 0, 'escalations:', data)
      setEscalations(data || [])
    } catch (err) {
      console.error('[Escalations] Catch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-0">Pending Review</Badge>
      case 'callback_requested':
        return <Badge className="bg-blue-100 text-blue-700 border-0">Callback Requested</Badge>
      case 'callback_scheduled':
        return <Badge className="bg-purple-100 text-purple-700 border-0">Callback Scheduled</Badge>
      case 'resolved':
        return <Badge className="bg-emerald-100 text-emerald-700 border-0">Resolved</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getInquiryTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'side_effects': 'bg-red-100 text-red-700',
      'dosage': 'bg-orange-100 text-orange-700',
      'medical_advice': 'bg-purple-100 text-purple-700',
      'drug_interaction': 'bg-pink-100 text-pink-700'
    }
    return (
      <Badge className={`${colors[type] || 'bg-neutral-100 text-neutral-600'} border-0`}>
        {type.replace(/_/g, ' ')}
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
    <div 
      className="h-full flex"
      style={{
        background: 'linear-gradient(180deg, #E8F4FC 0%, #D4EAF7 50%, #C7E2F4 100%)',
      }}
    >
      {/* Left Panel - Escalation List */}
      <div className="w-1/2 overflow-hidden flex flex-col p-4">
        {/* Header Card */}
        <div 
          className="rounded-2xl p-5 mb-4"
          style={glassyCardStyle}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">Clinician Escalations</h1>
              <p className="text-sm text-neutral-500">
                Medical inquiries requiring licensed clinician review
              </p>
            </div>
          </div>
        </div>

        {/* Escalations List */}
        <div 
          className="flex-1 overflow-y-auto rounded-2xl"
          style={glassyCardStyle}
        >
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : escalations.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
                <p className="text-neutral-600 font-medium">No escalations yet</p>
                <p className="text-sm text-neutral-400 mt-1">
                  Medical advice requests will appear here
                </p>
              </div>
            ) : (
              escalations.map((escalation) => (
                <button
                  key={escalation.id}
                  onClick={() => setSelectedEscalation(escalation)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    selectedEscalation?.id === escalation.id 
                      ? 'bg-blue-50/80 border-2 border-blue-200' 
                      : 'bg-white/50 border border-white/60 hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(escalation.escalation_status)}
                        {getInquiryTypeBadge(escalation.inquiry_type)}
                      </div>
                      <p className="text-sm text-neutral-700 line-clamp-2">
                        {escalation.inquiry_text}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
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
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Escalation Details */}
      <div className="w-1/2 overflow-hidden flex flex-col p-4 pl-0">
        <div 
          className="flex-1 rounded-2xl overflow-hidden flex flex-col"
          style={glassyCardStyle}
        >
          {selectedEscalation ? (
            <>
              {/* Detail Header */}
              <div className="p-5 border-b border-white/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-neutral-900">Escalation Details</h2>
                    <p className="text-sm text-neutral-500">
                      {formatTime(selectedEscalation.created_at)}
                    </p>
                  </div>
                  {getStatusBadge(selectedEscalation.escalation_status)}
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Inquiry Type */}
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
                    Inquiry Type
                  </h3>
                  {getInquiryTypeBadge(selectedEscalation.inquiry_type)}
                </div>

                {/* Customer Question */}
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
                    Customer Question
                  </h3>
                  <div className="bg-white/60 rounded-xl p-4 border border-white/60">
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      &ldquo;{selectedEscalation.inquiry_text}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Blocked Reason */}
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
                    Compliance Block Reason
                  </h3>
                  <div className="bg-red-50/80 rounded-xl p-4 border border-red-100">
                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-700">
                        {selectedEscalation.blocked_reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Callback Status */}
                {selectedEscalation.callback_requested && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
                      Callback Status
                    </h3>
                    <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-blue-700 font-medium">
                            Customer requested clinician callback
                          </p>
                          {selectedEscalation.callback_scheduled_at && (
                            <p className="text-xs text-blue-600 mt-1">
                              Scheduled: {formatTime(selectedEscalation.callback_scheduled_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Agent Response */}
                {selectedEscalation.agent_response && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
                      Agent Response
                    </h3>
                    <div className="bg-white/60 rounded-xl p-4 border border-white/60">
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {selectedEscalation.agent_response}
                      </p>
                    </div>
                  </div>
                )}

                {/* Session Info */}
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
                    Session Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/60 rounded-xl p-3 border border-white/60">
                      <p className="text-xs text-neutral-500 mb-1">Call Session</p>
                      <p className="text-xs font-mono text-neutral-700 truncate">{selectedEscalation.call_sid}</p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 border border-white/60">
                      <p className="text-xs text-neutral-500 mb-1">Customer ID</p>
                      <p className="text-xs font-mono text-neutral-700">{selectedEscalation.customer_id || 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                {/* Resolution */}
                {selectedEscalation.resolved_at && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
                      Resolution
                    </h3>
                    <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-emerald-700">
                            Resolved by {selectedEscalation.resolved_by}
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            {formatTime(selectedEscalation.resolved_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500 font-medium">Select an escalation</p>
                <p className="text-sm text-neutral-400">View details and manage callbacks</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
