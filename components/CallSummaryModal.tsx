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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative rounded-2xl border-2 border-white/10 overflow-hidden max-w-xl w-full mx-4 animate-scale-in"
        style={{
          background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Call Summary</h2>
              <p className="text-xs text-white/60">
                Session completed at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Duration */}
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Clock className="w-4 h-4 mx-auto mb-1.5 text-white/60" />
              <p className="text-xl font-semibold text-white">
                {formatDuration(callDuration)}
              </p>
              <p className="text-[10px] text-white/50">Duration</p>
            </div>
            
            {/* Actions */}
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Zap className="w-4 h-4 mx-auto mb-1.5 text-white/60" />
              <p className="text-xl font-semibold text-white">
                {summary?.actionsPerformed.length || 0}
              </p>
              <p className="text-[10px] text-white/50">Actions</p>
            </div>
            
            {/* Verification Status */}
            <div className={`rounded-lg p-3 text-center ${
              summary?.customerVerified 
                ? 'bg-emerald-500/20' 
                : 'bg-amber-500/20'
            }`}>
              <Shield className={`w-4 h-4 mx-auto mb-1.5 ${
                summary?.customerVerified 
                  ? 'text-emerald-400' 
                  : 'text-amber-400'
              }`} />
              <p className={`text-sm font-semibold ${
                summary?.customerVerified 
                  ? 'text-emerald-400' 
                  : 'text-amber-400'
              }`}>
                {summary?.customerVerified ? 'Verified' : 'Unverified'}
              </p>
              <p className="text-[10px] text-white/50">Identity</p>
            </div>
          </div>

          {/* Meeting Notes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-white/60" />
                Meeting Notes
              </h3>
              <button 
                onClick={handleCopyNotes}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-white/10 text-white/80 hover:bg-white/20 transition-colors duration-200"
              >
                {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Notes Content */}
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              {/* Verification Status */}
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  summary?.customerVerified 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {summary?.customerVerified 
                    ? <CheckCircle className="w-3.5 h-3.5" /> 
                    : <AlertTriangle className="w-3.5 h-3.5" />
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Identity Verification</p>
                  <p className="text-xs text-white/60">
                    {summary?.customerVerified 
                      ? `Verified via ${summary.verificationMethod}` 
                      : 'Customer identity not verified during call'}
                  </p>
                </div>
              </div>

              {/* Orders */}
              {summary?.ordersLookedUp && summary.ordersLookedUp.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#7DD3FC]/20 text-[#7DD3FC] flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Orders Accessed</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {summary.ordersLookedUp.map((order, idx) => (
                        <Badge key={idx} className="bg-white/10 text-white/80 border-0 text-[10px]">
                          {order}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Information Provided */}
              {summary?.informationProvided && summary.informationProvided.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#7DD3FC]/20 text-[#7DD3FC] flex items-center justify-center shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Information Disclosed</p>
                    <ul className="text-xs text-white/60 mt-1 space-y-0.5">
                      {Array.from(new Set(summary.informationProvided)).map((info, idx) => (
                        <li key={idx}>• {info}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Actions */}
              {summary?.actionsPerformed && summary.actionsPerformed.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Actions Taken</p>
                    <ul className="text-xs text-white/60 mt-1 space-y-0.5">
                      {summary.actionsPerformed.map((action, idx) => (
                        <li key={idx}>
                          • <span className="text-emerald-400">{action.type.toUpperCase()}</span>: {action.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Compliance Note */}
              {summary?.complianceBlocked && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-400">Compliance Alert</p>
                    <p className="text-xs text-white/60">
                      Medical inquiry blocked and escalated to licensed clinician
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button 
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
          <button 
            onClick={onNewCall}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white text-[#0A4D68] hover:bg-white/90 transition-colors duration-200"
          >
            <Phone className="w-4 h-4" />
            Start New Call
          </button>
        </div>
      </div>
    </div>
  )
}
