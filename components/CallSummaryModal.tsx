'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, Clock, Shield, Zap, FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CallEvent } from '@/types'

interface CallSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  events: CallEvent[]
  callDuration: number // in seconds
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

export function CallSummaryModal({ isOpen, onClose, events, callDuration }: CallSummaryModalProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null)

  useEffect(() => {
    if (isOpen && events.length > 0) {
      // Generate summary from events
      const summaryData: SummaryData = {
        customerVerified: false,
        verificationMethod: null,
        ordersLookedUp: [],
        actionsPerformed: [],
        complianceBlocked: false,
        escalationsScheduled: 0,
        informationProvided: []
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
              summaryData.informationProvided.push(
                `Order status: ${data.order_status}`
              )
            }
            if (data.estimated_delivery) {
              summaryData.informationProvided.push(
                `Delivery date: ${new Date(data.estimated_delivery).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
              )
            }
            if (data.tracking_number) {
              summaryData.informationProvided.push(
                `Tracking: ${data.tracking_number}`
              )
            }
            if (data.product) {
              summaryData.informationProvided.push(
                `Product: ${data.product}`
              )
            }
            break

          case 'querying':
            // Extract order ID from SQL
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

  if (!isOpen) return null

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Call Summary</h2>
                <p className="text-sm text-white/70">Session Complete</p>
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
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Call Stats */}
          <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Duration:</span>
              <span className="font-mono font-semibold">{formatDuration(callDuration)}</span>
            </div>
            <div className="h-4 w-px bg-neutral-200" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Events:</span>
              <span className="font-mono font-semibold">{events.length}</span>
            </div>
          </div>

          {/* Identity Verification */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Identity Verification
            </h3>
            <div className={`p-3 rounded-lg border ${summary?.customerVerified ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              {summary?.customerVerified ? (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Verified via {summary.verificationMethod}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Not verified during call</span>
                </div>
              )}
            </div>
          </div>

          {/* Orders Looked Up */}
          {summary?.ordersLookedUp && summary.ordersLookedUp.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Orders Accessed
              </h3>
              <div className="flex flex-wrap gap-2">
                {summary.ordersLookedUp.map((order, idx) => (
                  <Badge key={idx} variant="outline" className="font-mono">
                    #{order}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Information Provided */}
          {summary?.informationProvided && summary.informationProvided.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Information Disclosed
              </h3>
              <ul className="space-y-1">
                {Array.from(new Set(summary.informationProvided)).map((info, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="w-3 h-3 mt-1 text-blue-500 shrink-0" />
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions Performed */}
          {summary?.actionsPerformed && summary.actionsPerformed.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Actions Taken
              </h3>
              <div className="space-y-2">
                {summary.actionsPerformed.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Badge className="bg-blue-100 text-blue-700 shrink-0">
                      {action.type.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    <span className="text-sm">{action.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Notes */}
          {(summary?.complianceBlocked || (summary?.escalationsScheduled ?? 0) > 0) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Compliance Notes
              </h3>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                {summary?.complianceBlocked && (
                  <p className="text-amber-700">⚠️ Medical inquiry blocked - escalated to clinician</p>
                )}
                {(summary?.escalationsScheduled ?? 0) > 0 && (
                  <p className="text-amber-700">📞 {summary?.escalationsScheduled} clinician callback(s) scheduled</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <Button onClick={onClose} className="gap-2">
            Start New Call
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

