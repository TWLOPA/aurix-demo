'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Orb to avoid SSR issues with Three.js/Canvas
const Orb = dynamic(() => import('@/components/ui/orb').then(mod => mod.Orb), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-azure/20 to-electric-cyan/20 animate-pulse" />
    </div>
  )
})

interface WaitingStateProps {
  onCallStart: (callSid: string) => void
}

export function WaitingState({ onCallStart }: WaitingStateProps) {
  const [loading, setLoading] = useState(false)

  const handleStartCall = async () => {
    console.log('[WaitingState] Start button clicked')
    setLoading(true)
    
    const callSid = 'DEMO_SESSION_ID'
    console.log('[WaitingState] Using callSid:', callSid)
    
    try {
      console.log('[WaitingState] Calling onCallStart...')
      onCallStart(callSid)
      console.log('[WaitingState] onCallStart completed')
    } catch (error) {
      console.error('[WaitingState] Failed to start:', error)
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-cloud p-8">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 gradient-mist-rise opacity-50" />
      
      <div className="relative text-center space-y-8 max-w-md w-full">
        {/* Floating Orb with glow effect */}
        <div className="relative flex justify-center items-center h-72 w-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-electric-cyan/5 blur-3xl" />
          </div>
          <div className="relative w-full h-full">
            <Orb 
              agentState={loading ? "listening" : null} 
              colors={['#2563EB', '#22D3EE']} // azure to electric-cyan
            />
          </div>
        </div>

        {/* Title & Subtitle - Following 1.25 type scale */}
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-shadow-blue">
            Health Support Agent
          </h1>
          <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
            AI-powered customer service with transparent decision-making and compliance boundaries
          </p>
        </div>

        {/* Primary CTA - Premium variant for main action */}
        <div className="pt-4">
          <Button
            onClick={handleStartCall}
            disabled={loading}
            variant="premium"
            size="lg"
            className="gap-3 min-w-[200px] h-14 text-base rounded-pill"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Talking
              </>
            )}
          </Button>
        </div>

        {/* Subtle hint - Caption text */}
        <p className="text-xs text-muted-foreground/70">
          Click to speak with the AI agent
        </p>
      </div>
    </div>
  )
}
