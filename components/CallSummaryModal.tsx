'use client'

import { useState, useEffect } from 'react'
import { 
  X, CheckCircle, Clock, Shield, Zap, FileText, ArrowRight, 
  Phone, Package, MessageSquare, AlertTriangle, Home,
  Copy, CheckCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { CallEvent } from '@/types'

/**
 * CallSummaryModal - ElevenLabs UI Standards Compliant
 * 
 * Border Radius: 12px (lg) for modal
 * Spacing: 24px (p-6) padding
 * Animation: ease-in-out scale
 * Colors: Uses approved tokens
 */

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
      {/* Backdrop - shadow-blue with blur */}
      <div 
        className="absolute inset-0 bg-shadow-blue/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - 12px border radius, approved shadow */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden animate-scale-in">
        {/* Header - Deep Dive gradient */}
        <div className="gradient-deep-dive text-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold leading-tight">Call Summary</h2>
                <p className="text-sm text-white/70">
                  Session completed at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-md transition-colors duration-200 ease-in-out"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - 24px padding, 24px gap */}
        <div className="p-6 space-y-6 max-h-[55vh] overflow-y-auto">
          {/* Quick Stats Row - 16px gap */}
          <div className="grid grid-cols-3 gap-4">
            {/* Duration */}
            <div className="bg-mist rounded-lg p-4 text-center">
              <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-semibold font-mono text-shadow-blue">
                {formatDuration(callDuration)}
              </p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            
            {/* Actions */}
            <div className="bg-mist rounded-lg p-4 text-center">
              <Zap className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-semibold font-mono text-shadow-blue">
                {summary?.actionsPerformed.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Actions</p>
            </div>
            
            {/* Verification Status */}
            <div className={`rounded-lg p-4 text-center ${
              summary?.customerVerified 
                ? 'bg-success/10' 
                : 'bg-warning/10'
            }`}>
              <Shield className={`w-5 h-5 mx-auto mb-2 ${
                summary?.customerVerified 
                  ? 'text-success' 
                  : 'text-warning'
              }`} />
              <p className={`text-sm font-semibold ${
                summary?.customerVerified 
                  ? 'text-success' 
                  : 'text-warning'
              }`}>
                {summary?.customerVerified ? 'Verified' : 'Unverified'}
              </p>
              <p className="text-xs text-muted-foreground">Identity</p>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Meeting Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-shadow-blue flex items-center gap-2">
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

            {/* Notes Content - 8px border radius, mono font */}
            <div className="bg-mist rounded-md p-4 space-y-4 text-sm">
              {/* Verification Status */}
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  summary?.customerVerified 
                    ? 'bg-success/20 text-success' 
                    : 'bg-warning/20 text-warning'
                }`}>
                  {summary?.customerVerified 
                    ? <CheckCircle className="w-4 h-4" /> 
                    : <AlertTriangle className="w-4 h-4" />
                  }
                </div>
                <div>
                  <p className="font-medium text-shadow-blue">Identity Verification</p>
                  <p className="text-muted-foreground">
                    {summary?.customerVerified 
                      ? `Verified via ${summary.verificationMethod}` 
                      : 'Customer identity not verified during call'}
                  </p>
                </div>
              </div>

              {/* Orders */}
              {summary?.ordersLookedUp && summary.ordersLookedUp.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-azure/20 text-azure flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-shadow-blue">Orders Accessed</p>
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
                  <div className="w-6 h-6 rounded-full bg-electric-cyan/20 text-azure flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-shadow-blue">Information Disclosed</p>
                    <ul className="text-muted-foreground mt-1 space-y-0.5">
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
                  <div className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-shadow-blue">Actions Taken</p>
                    <ul className="text-muted-foreground mt-1 space-y-0.5">
                      {summary.actionsPerformed.map((action, idx) => (
                        <li key={idx}>
                          • <span className="text-success font-medium">{action.type.toUpperCase()}</span>: {action.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Compliance Note */}
              {summary?.complianceBlocked && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-warning/20 text-warning flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-warning">Compliance Alert</p>
                    <p className="text-muted-foreground">
                      Medical inquiry blocked and escalated to licensed clinician
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - mist background, 16px padding */}
        <div className="px-6 py-4 border-t border-border bg-mist flex items-center justify-between">
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
            className="gap-2"
          >
            <Phone className="w-4 h-4" />
            Start New Call
          </Button>
        </div>
      </div>
    </div>
  )
}
