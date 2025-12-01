'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'

// Dynamically import Orb to avoid SSR issues with Three.js/Canvas
const Orb = dynamic(() => import('@/components/ui/orb').then(mod => mod.Orb), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center rounded-full">
      <div className="w-32 h-32 bg-muted rounded-full animate-pulse" />
    </div>
  )
})

interface WaitingStateProps {
  onCallStart: (callSid: string) => void
}

export function WaitingState({ onCallStart }: WaitingStateProps) {
  const [loading, setLoading] = useState(false)

  const handleSimulateCall = async () => {
    setLoading(true)
    
    // Generate unique call SID
    const callSid = `CALL_${Date.now()}`
    
    try {
      // Start simulation via API
      const response = await fetch('/api/simulate-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callSid })
      })

      if (response.ok) {
        onCallStart(callSid)
      }
    } catch (error) {
      console.error('Failed to start simulation:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background p-8">
      <div className="text-center space-y-8 max-w-lg w-full">
        {/* ElevenLabs Orb Hero Visual */}
        <div className="relative flex justify-center items-center h-64 w-full">
          <div className="w-64 h-64">
            <Orb 
              agentState={loading ? "listening" : "thinking"} 
              colors={['#3b82f6', '#8b5cf6']}
            />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            AURIX
          </h1>
          <p className="text-base text-muted-foreground">
            Voice AI Customer Success Agent
          </p>
        </div>

        {/* Primary CTA */}
        <div className="pt-4 flex justify-center">
          <Button
            onClick={handleSimulateCall}
            disabled={loading}
            size="default"
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                Start Demo Call
              </>
            )}
          </Button>
        </div>

        {/* Demo Context - Minimal Card */}
        <Card className="p-6 text-left space-y-4 border-neutral-200 shadow-none">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-foreground">Demo Scenario</h3>
            <p className="text-xs text-muted-foreground">Mock customer data for this interaction.</p>
          </div>
          
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium text-foreground">Tom</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-muted-foreground">Order</span>
              <span className="font-medium text-foreground">#417</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Issue</span>
              <span className="font-medium text-foreground">Delivery delay</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
