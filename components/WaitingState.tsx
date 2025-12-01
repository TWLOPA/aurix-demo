'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Loader2, Terminal } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

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
        {/* Geomorph Orb Hero Visual (Floating) */}
        <div className="relative flex justify-center items-center h-64 w-full">
          <div className="w-full h-full">
            <Orb 
              agentState={loading ? "listening" : "thinking"} 
              colors={['#000000', '#000000']}
            />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Agent Simulation
          </h1>
          <p className="text-sm text-muted-foreground">
            Ready to initialize conversation with agent <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">support-v1</span>.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="pt-4 flex justify-center">
          <Button
            onClick={handleSimulateCall}
            disabled={loading}
            size="default"
            className="gap-2 min-w-[160px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Simulation
              </>
            )}
          </Button>
        </div>

        {/* Demo Context - Technical Card */}
        <Card className="text-left border-neutral-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Session Context</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-muted-foreground">Customer ID</span>
              <span className="font-mono text-xs text-foreground">cust_8921 (Tom)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-muted-foreground">Reference Order</span>
              <span className="font-mono text-xs text-foreground">ord_417</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Intent Scope</span>
              <span className="font-medium text-foreground">Delivery Inquiry</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
