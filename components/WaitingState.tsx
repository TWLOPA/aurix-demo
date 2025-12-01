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
    <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-full">
      <div className="w-32 h-32 bg-primary/20 rounded-full animate-pulse" />
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

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            AURIX
          </h1>
          <p className="text-xl text-muted-foreground">
            Voice AI Customer Success Agent
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-foreground/80">
            Experience real-time AI-powered customer support
          </p>
          <p className="text-sm text-muted-foreground">
            Watch the agent think, query, and respond in real-time
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <Button
            onClick={handleSimulateCall}
            disabled={loading}
            size="lg"
            className="w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="w-6 h-6 mr-3" />
                Start Demo Call
              </>
            )}
          </Button>
        </div>

        {/* Demo Instructions */}
        <div className="pt-8 space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Demo Scenario
          </p>
          <Card className="bg-muted/50 border-border p-4 text-left space-y-2">
            <div className="text-sm flex justify-between">
              <span className="text-muted-foreground font-medium">Customer</span>
              <span className="text-foreground">Tom</span>
            </div>
            <div className="text-sm flex justify-between">
              <span className="text-muted-foreground font-medium">Order</span>
              <span className="text-foreground">#417</span>
            </div>
            <div className="text-sm flex justify-between">
              <span className="text-muted-foreground font-medium">Issue</span>
              <span className="text-foreground">Delivery delay inquiry</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
