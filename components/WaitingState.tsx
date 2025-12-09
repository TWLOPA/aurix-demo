'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Orb to avoid SSR issues with Three.js/Canvas
const Orb = dynamic(() => import('@/components/ui/orb').then(mod => mod.Orb), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center rounded-full">
      <div className="w-48 h-48 bg-neutral-100 rounded-full animate-pulse" />
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
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-50 to-white p-8">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Floating Orb */}
        <div className="relative flex justify-center items-center h-72 w-full">
          <div className="w-full h-full">
            <Orb 
              agentState={loading ? "listening" : null} 
              colors={['#171717', '#262626']}
            />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Health Support Agent
          </h1>
          <p className="text-base text-neutral-500 max-w-sm mx-auto">
            AI-powered customer service with transparent decision-making and compliance boundaries
          </p>
        </div>

        {/* Primary CTA */}
        <div className="pt-2">
          <Button
            onClick={handleStartCall}
            disabled={loading}
            size="lg"
            className="gap-3 min-w-[200px] h-14 text-base bg-neutral-900 hover:bg-neutral-800 shadow-lg shadow-neutral-900/20 transition-all hover:shadow-xl hover:shadow-neutral-900/30"
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

        {/* Subtle hint */}
        <p className="text-xs text-neutral-400">
          Press to speak with the AI agent
        </p>
      </div>
    </div>
  )
}
