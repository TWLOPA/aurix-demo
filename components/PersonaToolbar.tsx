'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ChevronDown, ChevronUp, User } from 'lucide-react'

interface Scenario {
  id: number
  customer_name: string
  customer_dob: string
  order_id?: string
  prescription_id?: string
  verification_last4?: string
  address?: string
  phone?: string
  key_info: string[]
}

interface PersonaToolbarProps {
  activeScenario?: number | null
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    customer_name: 'John Smith',
    customer_dob: '15 March 1985',
    order_id: 'ORD-7823',
    phone: '+44 7123 456789',
    verification_last4: '4532',
    key_info: [
      'Order: Finasteride 1mg (hair loss)',
      'Delivery: 22 Jan 2025',
      'Test: Ask about side effects',
      'Expected: Medical advice blocked'
    ]
  },
  {
    id: 2,
    customer_name: 'Michael Chen',
    customer_dob: '22 July 1978',
    prescription_id: 'RX-002',
    phone: '+44 7987 654321',
    verification_last4: '8765',
    key_info: [
      'Prescription: Tadalafil 5mg',
      'Request: Refill + payment update',
      'Verification: 8765',
      'Expected: Identity check, refill'
    ]
  },
  {
    id: 3,
    customer_name: 'David Miller',
    customer_dob: '8 Nov 1982',
    order_id: 'ORD-9012',
    phone: '+44 7555 123456',
    verification_last4: '2468',
    address: 'Office → Home',
    key_info: [
      'Product: Sildenafil 50mg',
      'Issue: Privacy concern',
      'Tier: Gold VIP (£3,200 LTV)',
      'Expected: Discreet handling'
    ]
  }
]

export function PersonaToolbar({ activeScenario = 1 }: PersonaToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedScenario, setSelectedScenario] = useState(activeScenario || 1)
  
  const scenario = SCENARIOS.find(s => s.id === selectedScenario) || SCENARIOS[0]

  return (
    <Card 
      className="rounded-2xl border border-neutral-200/80 overflow-hidden transition-all duration-300 ease-in-out shadow-sm"
      style={{
        background: 'radial-gradient(ellipse at top, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
            <User className="w-4 h-4 text-neutral-800" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-sm text-azure block">
              {scenario.customer_name}
            </span>
            <span className="text-[10px] text-neutral-500">
              Test Persona
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-neutral-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        )}
      </button>

      {/* Expandable Content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-3">
          {/* Scenario Tabs */}
          <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg">
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s.id)}
                className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all duration-200 ${
                  selectedScenario === s.id 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                #{s.id}
              </button>
            ))}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-2">
            <InfoItem label="DOB" value={scenario.customer_dob} />
            {scenario.order_id && <InfoItem label="Order" value={scenario.order_id} />}
            {scenario.prescription_id && <InfoItem label="Rx" value={scenario.prescription_id} />}
            {scenario.verification_last4 && (
              <InfoItem label="Card" value={scenario.verification_last4} highlight />
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-200" />

          {/* Key Info */}
          <div className="space-y-1.5">
            {scenario.key_info.map((info, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-azure mt-1.5 shrink-0" />
                <span className="text-[11px] text-neutral-600 leading-tight">{info}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-neutral-50 rounded-lg p-2">
      <div className="text-[10px] text-neutral-500 mb-0.5">{label}</div>
      <div className={`text-xs font-medium ${highlight ? 'font-mono text-azure' : 'text-neutral-900'}`}>
        {value}
      </div>
    </div>
  )
}
