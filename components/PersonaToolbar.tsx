'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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
      'Order: Finasteride 1mg (hair loss treatment)',
      'Expected delivery: 22 Jan 2025',
      'Ask about: Order status + side effects',
      'Agent should: Answer order, block medical advice'
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
      'Prescription: Tadalafil 5mg (ED treatment)',
      'Request: Refill needed + payment update',
      'Verification code: 8765',
      'Agent should: Verify identity, process refill'
    ]
  },
  {
    id: 3,
    customer_name: 'David Miller',
    customer_dob: '8 Nov 1982',
    order_id: 'ORD-9012',
    phone: '+44 7555 123456',
    verification_last4: '2468',
    address: 'Currently: Office → Change to: Home',
    key_info: [
      'Product: Sildenafil 50mg (ED treatment)',
      'Issue: Privacy concern (delivery to office)',
      'Customer tier: Gold VIP (£3,200 LTV)',
      'Agent should: Empathetic handling, discreet language'
    ]
  }
]

const toolbarStyles = {
  background: 'rgba(26, 26, 46, 0.95)',
  backdropFilter: 'blur(12px)',
  borderColor: '#2A2A3E',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  border: '2px solid #2A2A3E'
}

export function PersonaToolbar({ activeScenario, mode = 'landing' }: PersonaToolbarProps) {
  if (mode === 'simulation' && !activeScenario) return null

  // Single scenario view (simulation)
  if (mode === 'simulation' && activeScenario) {
    const scenario = SCENARIOS.find(s => s.id === activeScenario)
    if (!scenario) return null

    return (
      <div 
        className="fixed top-6 left-1/2 z-40 w-full max-w-4xl px-6"
        style={{ transform: 'translateX(-50%)' }}
      >
        <Card style={toolbarStyles}>
          <div className="p-4">
            <ScenarioContent scenario={scenario} />
          </div>
        </Card>
      </div>
    )
  }

  // Multi-scenario tabs view (landing)
  return (
    <div 
      className="fixed top-6 left-1/2 z-40 w-full max-w-5xl px-6"
      style={{ transform: 'translateX(-50%)' }}
    >
      <Card style={toolbarStyles}>
        <Tabs defaultValue="1" className="w-full">
          {/* Tab Headers */}
          <div className="bg-[rgba(42,42,62,0.3)] border-b border-[#2A2A3E] px-4 py-2">
            <TabsList className="grid w-full grid-cols-3 bg-transparent gap-2">
              {SCENARIOS.map(scenario => (
                <TabsTrigger 
                  key={scenario.id}
                  value={scenario.id.toString()}
                  className="text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  Scenario {scenario.id}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Content */}
          {SCENARIOS.map(scenario => (
            <TabsContent 
              key={scenario.id} 
              value={scenario.id.toString()} 
              className="p-4 m-0"
            >
              <ScenarioContent scenario={scenario} />
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  )
}

function ScenarioContent({ scenario }: { scenario: Scenario }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold flex items-center gap-2 text-xl text-white/95">
            You are: {scenario.customer_name}
          </h3>
          <p className="text-sm text-white/50 mt-1">
            DOB: {scenario.customer_dob}
          </p>
        </div>
        <Badge 
          variant="outline"
          className="text-[11px] px-2 py-1 border-[#2A2A3E] text-white/70"
        >
          Read this before calling
        </Badge>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-t border-b border-[#2A2A3E]">
        {scenario.order_id && <InfoItem label="Order" value={scenario.order_id} />}
        {scenario.prescription_id && <InfoItem label="Prescription" value={scenario.prescription_id} />}
        {scenario.phone && <InfoItem label="Phone" value={scenario.phone} />}
        {scenario.verification_last4 && <InfoItem label="Card Last 4" value={scenario.verification_last4} highlight />}
        {scenario.address && (
          <div className="col-span-2">
            <InfoItem label="Address" value={scenario.address} />
          </div>
        )}
      </div>

      {/* Key Information */}
      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-3">
          Key Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {scenario.key_info.map((info, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[#05B2DC] mt-0.5">•</span>
              <span className="text-sm text-white/70">{info}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-white/50 mb-1">{label}</div>
      <div 
        className={`text-sm font-medium ${highlight ? 'font-mono text-[#05B2DC]' : 'text-white/95'}`}
      >
        {value}
      </div>
    </div>
  )
}

