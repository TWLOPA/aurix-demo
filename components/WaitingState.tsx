'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Loader2, Package, User, Clock, Eye } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    console.log('[WaitingState] Start Call button clicked')
    setLoading(true)
    
    // Generate unique call SID for local state
    const callSid = `CALL_${Date.now()}`
    console.log('[WaitingState] Generated callSid:', callSid)
    
    try {
      // Directly trigger the parent handler to start the ElevenLabs session
      console.log('[WaitingState] Calling onCallStart...')
      onCallStart(callSid)
      console.log('[WaitingState] onCallStart completed')
    } catch (error) {
      console.error('[WaitingState] Failed to start simulation:', error)
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-8">
      <div className="text-center space-y-8 max-w-xl w-full">
        
        {/* Hero Orb */}
        <div className="relative flex justify-center items-center h-48 w-full">
          <div className="w-48 h-48">
            <Orb 
              agentState={loading ? "listening" : "thinking"} 
              colors={['#000000', '#000000']}
            />
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            AURIX
          </h1>
          <p className="text-lg text-muted-foreground">
            AI Customer Success Agent with <span className="text-foreground font-medium">Transparent Reasoning</span>
          </p>
        </div>

        {/* Demo Scenario Card */}
        <Card className="text-left border-2 border-primary/20 bg-primary/5 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">
                🎭 Demo Scenario
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are calling customer service to check on your order. Play the role below:
            </p>

            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-xs text-muted-foreground">Your Name</span>
                  <p className="font-semibold text-foreground">Tom Wilson</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-xs text-muted-foreground">Order Number</span>
                  <p className="font-semibold text-foreground font-mono">#423</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <span className="text-xs text-muted-foreground">Issue</span>
                  <p className="font-semibold text-foreground">Package hasn't arrived (was due Tuesday)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Button */}
        <div className="pt-2">
          <Button
            onClick={handleSimulateCall}
            disabled={loading}
            size="lg"
            className="gap-3 min-w-[200px] h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Call
              </>
            )}
          </Button>
        </div>

        {/* Hint */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2 mx-auto w-fit">
          <Eye className="w-4 h-4" />
          <span>Watch the <strong>right panel</strong> to see the agent's reasoning in real-time</span>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/60 pt-4">
          Powered by ElevenLabs Conversational AI
        </p>
      </div>
    </div>
  )
}
