'use client'

import { useState, useEffect } from 'react'
import { 
  X, CheckCircle, Clock, Shield, Zap, FileText, ArrowRight, 
  Phone, Package, MessageSquare, AlertTriangle, Home,
  Copy, CheckCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { CallEvent } from '@/types'

interface CallSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  onNewCall: () => void
  events: CallEvent[]
  callDuration: number
}

interface SummaryData {
  customerVerified: boolean
  verificationMethod: string | null
  ordersLookedUp: string[]
  actionsPerformed: Array<{ type: string; description: string }>
  complianceBlocked: boolean
  escalationsScheduled: number
  informationProvided: string[]
}

export function CallSummaryModal({ isOpen, onClose, onNewCall, events, callDuration }: CallSummaryModalProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen && events.length > 0) {
      const summaryData: SummaryData = {
        customerVerified: false,
        verificationMethod: null,
        ordersLookedUp: [],
        actionsPerformed: [],
        complianceBlocked: false,
        escalationsScheduled: 0,
        informationProvided: [],
      }

      events.forEach(event => {
        const data = event.event_data

        switch (event.event_type) {
          case 'identity_verification':
            if (data.verified || data.compliance === 'PASSED') {
              summaryData.customerVerified = true
              summaryData.verificationMethod = data.method?.replace(/_/g, ' ') || 'Verified'
            }
            break

          case 'results':
            if (data.order_status) {
              summaryData.informationProvided.push(`Order status: ${data.order_status}`)
            }
            if (data.estimated_delivery) {
              summaryData.informationProvided.push(
                `Delivery: ${new Date(data.estimated_delivery).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
              )
            }
            if (data.tracking_number) {
              summaryData.informationProvided.push(`Tracking: ${data.tracking_number}`)
            }
            if (data.product) {
              summaryData.informationProvided.push(`Product: ${data.product}`)
            }
            break

          case 'querying':
            const match = data.sql?.match(/order_id = '([^']+)'/)
            if (match && match[1] && !summaryData.ordersLookedUp.includes(match[1])) {
              summaryData.ordersLookedUp.push(match[1])
            }
            break

          case 'action':
            if (data.type && data.description) {
              summaryData.actionsPerformed.push({
                type: data.type,
                description: data.description
              })
            }
            if (data.type === 'escalation') {
              summaryData.escalationsScheduled++
            }
            break

          case 'compliance_check':
            if (data.allowed === false) {
              summaryData.complianceBlocked = true
            }
            break
        }
      })

      setSummary(summaryData)
    }
  }, [isOpen, events])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const generateMeetingNotes = () => {
    if (!summary) return ''
    
    const lines = [
      `CALL SUMMARY - ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      `Duration: ${formatDuration(callDuration)}`,
      '',
      '--- VERIFICATION ---',
      summary.customerVerified 
        ? `✓ Customer verified via ${summary.verificationMethod}` 
        : '⚠ Customer not verified',
      '',
      '--- ORDERS ACCESSED ---',
      summary.ordersLookedUp.length > 0 
        ? summary.ordersLookedUp.map(o => `• ${o}`).join('\n')
        : '• None',
      '',
      '--- INFORMATION PROVIDED ---',
      ...Array.from(new Set(summary.informationProvided)).map(i => `• ${i}`),
      '',
      '--- ACTIONS TAKEN ---',
      ...summary.actionsPerformed.map(a => `• ${a.type.toUpperCase()}: ${a.description}`),
      '',
      summary.complianceBlocked ? '⚠ COMPLIANCE: Medical inquiry escalated to clinician' : '',
    ].filter(Boolean)
    
    return lines.join('\n')
  }

  const handleCopyNotes = async () => {
    const notes = generateMeetingNotes()
    await navigator.clipboard.writeText(notes)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const glassyCardStyle = {
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.7)'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - Blue gradient like the app */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(232, 244, 252, 0.95) 0%, rgba(212, 234, 247, 0.95) 50%, rgba(199, 226, 244, 0.95) 100%)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />
      
      {/* Modal - Glassy premium */}
      <div 
        className="relative rounded-2xl overflow-hidden max-w-md w-full mx-4 animate-scale-in"
        style={glassyCardStyle}
      >
        {/* Header - Glassy */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center">
              <FileText className="w-4 h-4 text-neutral-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Call Summary</h2>
              <p className="text-[10px] text-neutral-400">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Content - Tight spacing */}
        <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            {/* Duration */}
            <div className="bg-white/50 rounded-xl p-2.5 text-center border border-white/60">
              <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-neutral-400" />
              <p className="text-base font-semibold text-neutral-900">
                {formatDuration(callDuration)}
              </p>
              <p className="text-[9px] text-neutral-400 uppercase tracking-wide">Duration</p>
            </div>
            
            {/* Actions */}
            <div className="bg-white/50 rounded-xl p-2.5 text-center border border-white/60">
              <Zap className="w-3.5 h-3.5 mx-auto mb-1 text-neutral-400" />
              <p className="text-base font-semibold text-neutral-900">
                {summary?.actionsPerformed.length || 0}
              </p>
              <p className="text-[9px] text-neutral-400 uppercase tracking-wide">Actions</p>
            </div>
            
            {/* Verification Status */}
            <div className={`rounded-xl p-2.5 text-center border ${
              summary?.customerVerified 
                ? 'bg-emerald-50/80 border-emerald-100' 
                : 'bg-amber-50/80 border-amber-100'
            }`}>
              <Shield className={`w-3.5 h-3.5 mx-auto mb-1 ${
                summary?.customerVerified 
                  ? 'text-emerald-500' 
                  : 'text-amber-500'
              }`} />
              <p className={`text-xs font-semibold ${
                summary?.customerVerified 
                  ? 'text-emerald-600' 
                  : 'text-amber-600'
              }`}>
                {summary?.customerVerified ? 'Verified' : 'Unverified'}
              </p>
              <p className="text-[9px] text-neutral-400 uppercase tracking-wide">Identity</p>
            </div>
          </div>

          {/* Meeting Notes Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Notes
              </h3>
              <button 
                onClick={handleCopyNotes}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-neutral-500 hover:bg-white/60 transition-colors"
              >
                {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Notes Content */}
            <div className="bg-white/50 rounded-xl p-3 space-y-2.5 border border-white/60">
              {/* Verification Status */}
              <div className="flex items-start gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  summary?.customerVerified 
                    ? 'bg-emerald-100 text-emerald-500' 
                    : 'bg-amber-100 text-amber-500'
                }`}>
                  {summary?.customerVerified 
                    ? <CheckCircle className="w-3 h-3" /> 
                    : <AlertTriangle className="w-3 h-3" />
                  }
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-700">Identity Verification</p>
                  <p className="text-[11px] text-neutral-500">
                    {summary?.customerVerified 
                      ? `Verified via ${summary.verificationMethod}` 
                      : 'Not verified during call'}
                  </p>
                </div>
              </div>

              {/* Orders */}
              {summary?.ordersLookedUp && summary.ordersLookedUp.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-neutral-200/80 text-neutral-500 flex items-center justify-center shrink-0">
                    <Package className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-700">Orders Accessed</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {summary.ordersLookedUp.map((order, idx) => (
                        <Badge key={idx} className="bg-neutral-200/80 text-neutral-600 border-0 text-[10px] px-1.5 py-0">
                          {order}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Information Provided */}
              {summary?.informationProvided && summary.informationProvided.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-neutral-200/80 text-neutral-500 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-700">Information Disclosed</p>
                    <ul className="text-[11px] text-neutral-500 mt-0.5 space-y-0.5">
                      {Array.from(new Set(summary.informationProvided)).map((info, idx) => (
                        <li key={idx}>• {info}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Actions */}
              {summary?.actionsPerformed && summary.actionsPerformed.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center shrink-0">
                    <Zap className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-700">Actions Taken</p>
                    <ul className="text-[11px] text-neutral-500 mt-0.5 space-y-0.5">
                      {summary.actionsPerformed.map((action, idx) => (
                        <li key={idx}>
                          • <span className="text-emerald-600 font-medium">{action.type}</span>: {action.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Compliance Note */}
              {summary?.complianceBlocked && (
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-600">Compliance Alert</p>
                    <p className="text-[11px] text-neutral-500">
                      Medical inquiry escalated to clinician
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Glassy */}
        <div className="px-4 py-3 border-t border-white/40 flex items-center gap-2">
          <button 
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-neutral-600 bg-white/60 hover:bg-white/80 transition-colors border border-white/60"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </button>
          <button 
            onClick={onNewCall}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            New Call
          </button>
        </div>
      </div>
    </div>
  )
}
