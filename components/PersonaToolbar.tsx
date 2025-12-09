'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  mode?: 'landing' | 'simulation'
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

export function PersonaToolbar({ activeScenario = 1, mode = 'simulation' }: PersonaToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedScenario, setSelectedScenario] = useState(activeScenario || 1)
  
  const scenario = SCENARIOS.find(s => s.id === selectedScenario) || SCENARIOS[0]

  // For simulation mode - collapsible card in sidebar
  if (mode === 'simulation') {
    return (
      <Card 
        className="rounded-2xl border-2 border-white/10 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors duration-200"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white/90" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-sm text-white/95 block">
                {scenario.customer_name}
              </span>
              <span className="text-[10px] text-white/50">
                Test Persona
              </span>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-white/70" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/70" />
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
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
              {SCENARIOS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenario(s.id)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all duration-200 ${
                    selectedScenario === s.id 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/50 hover:text-white/70'
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
            <div className="h-px bg-white/20" />

            {/* Key Info */}
            <div className="space-y-1.5">
              {scenario.key_info.map((info, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#7DD3FC] mt-1.5 shrink-0" />
                  <span className="text-[11px] text-white/70 leading-tight">{info}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Landing mode - floating tabs (original behavior)
  return (
    <div 
      className="fixed top-6 left-1/2 z-40 w-full max-w-4xl px-6"
      style={{ transform: 'translateX(-50%)' }}
    >
      <Card 
        className="rounded-2xl border-2 border-white/10 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Scenario Tabs */}
        <div className="flex border-b border-white/10">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedScenario(s.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                selectedScenario === s.id 
                  ? 'bg-white/10 text-white border-b-2 border-[#7DD3FC]' 
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              Scenario {s.id}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg text-white/95">
                You are: {scenario.customer_name}
              </h3>
              <p className="text-xs text-white/50">DOB: {scenario.customer_dob}</p>
            </div>
            <Badge className="text-[10px] px-2 py-1 bg-white/10 text-white/70 border-white/20">
              Read before calling
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-3 py-3 border-t border-b border-white/10">
            {scenario.order_id && <InfoItem label="Order" value={scenario.order_id} />}
            {scenario.prescription_id && <InfoItem label="Rx" value={scenario.prescription_id} />}
            {scenario.phone && <InfoItem label="Phone" value={scenario.phone} />}
            {scenario.verification_last4 && (
              <InfoItem label="Card Last 4" value={scenario.verification_last4} highlight />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {scenario.key_info.map((info, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[#7DD3FC] mt-1.5 shrink-0" />
                <span className="text-xs text-white/70">{info}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-white/50 mb-0.5">{label}</div>
      <div className={`text-xs font-medium ${highlight ? 'font-mono text-[#7DD3FC]' : 'text-white/95'}`}>
        {value}
      </div>
    </div>
  )
}
