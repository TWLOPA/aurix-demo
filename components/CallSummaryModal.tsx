'use client'

import { useState, useEffect } from 'react'
import { 
  X, CheckCircle, Clock, Shield, Zap, FileText, ArrowRight, 
  Phone, User, Package, MessageSquare, AlertTriangle, Home,
  Copy, CheckCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  customerName: string | null
  conversationHighlights: string[]
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
        customerName: null,
        conversationHighlights: []
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

          case 'user_spoke':
            if (data.text && data.text.length > 20) {
              summaryData.conversationHighlights.push(`Customer: "${data.text.substring(0, 80)}..."`)
            }
            break

          case 'agent_spoke':
            if (data.text && data.text.length > 30 && summaryData.conversationHighlights.length < 4) {
              summaryData.conversationHighlights.push(`Agent: "${data.text.substring(0, 80)}..."`)
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Call Summary</h2>
                <p className="text-sm text-white/60">Session completed at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[55vh] overflow-y-auto">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-neutral-50 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 mx-auto mb-2 text-neutral-500" />
              <p className="text-2xl font-bold font-mono">{formatDuration(callDuration)}</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4 text-center">
              <Zap className="w-5 h-5 mx-auto mb-2 text-neutral-500" />
              <p className="text-2xl font-bold font-mono">{summary?.actionsPerformed.length || 0}</p>
              <p className="text-xs text-muted-foreground">Actions</p>
            </div>
            <div className={`rounded-xl p-4 text-center ${summary?.customerVerified ? 'bg-green-50' : 'bg-amber-50'}`}>
              <Shield className={`w-5 h-5 mx-auto mb-2 ${summary?.customerVerified ? 'text-green-600' : 'text-amber-600'}`} />
              <p className={`text-sm font-bold ${summary?.customerVerified ? 'text-green-700' : 'text-amber-700'}`}>
                {summary?.customerVerified ? 'Verified' : 'Unverified'}
              </p>
              <p className="text-xs text-muted-foreground">Identity</p>
            </div>
          </div>

          <Separator />

          {/* Meeting Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Meeting Notes
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyNotes}
                className="gap-2 text-xs"
              >
                {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy Notes'}
              </Button>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 space-y-4 font-mono text-sm">
              {/* Verification Status */}
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${summary?.customerVerified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  {summary?.customerVerified ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Identity Verification</p>
                  <p className="text-neutral-600">
                    {summary?.customerVerified 
                      ? `Verified via ${summary.verificationMethod}` 
                      : 'Customer identity not verified during call'}
                  </p>
                </div>
              </div>

              {/* Orders */}
              {summary?.ordersLookedUp && summary.ordersLookedUp.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Orders Accessed</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {summary.ordersLookedUp.map((order, idx) => (
                        <Badge key={idx} variant="secondary" className="font-mono text-xs">
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
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Information Disclosed</p>
                    <ul className="text-neutral-600 mt-1 space-y-0.5">
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
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Actions Taken</p>
                    <ul className="text-neutral-600 mt-1 space-y-0.5">
                      {summary.actionsPerformed.map((action, idx) => (
                        <li key={idx}>• <span className="text-emerald-600 font-medium">{action.type.toUpperCase()}</span>: {action.description}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Compliance Note */}
              {summary?.complianceBlocked && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-700">Compliance Alert</p>
                    <p className="text-amber-600">Medical inquiry blocked and escalated to licensed clinician</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
          <Button 
            onClick={onNewCall}
            className="gap-2 bg-neutral-900 hover:bg-neutral-800"
          >
            <Phone className="w-4 h-4" />
            Start New Call
          </Button>
        </div>
      </div>
    </div>
  )
}
