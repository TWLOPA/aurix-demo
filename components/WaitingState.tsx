'use client'

import { useState } from 'react'
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Soft gradient background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #E8F4FC 0%, #D4EAF7 30%, #C7E2F4 60%, #E0EEF8 100%)'
        }}
      />
      
      {/* Subtle radial glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center 40%, rgba(125, 211, 252, 0.15) 0%, transparent 60%)'
        }}
      />
      
      {/* Glassy Container */}
      <div 
        className="relative rounded-[32px] p-8 max-w-md w-full"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.4) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.6)'
        }}
      >
        <div className="text-center space-y-6">
          {/* Floating Orb with glow effect */}
          <div className="relative flex justify-center items-center h-56 w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-[#7DD3FC]/10 blur-3xl" />
            </div>
            <div className="relative w-full h-full">
              <Orb 
                agentState={loading ? "listening" : null} 
                colors={['#2563EB', '#22D3EE']}
              />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-800">
              Health Support Agent
            </h1>
            <p className="text-sm text-neutral-500 max-w-xs mx-auto leading-relaxed">
              Multimodal AI customer service with voice, SMS, and transparent decision-making
            </p>
          </div>

          {/* Primary CTA */}
          <div className="pt-2">
            <button
              onClick={handleStartCall}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2.5 min-w-[180px] h-12 px-6 text-sm font-medium rounded-full bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Start Talking
                </>
              )}
            </button>
          </div>

          {/* Subtle hint */}
          <p className="text-xs text-neutral-400">
            Click to speak with the AI agent
          </p>
        </div>
      </div>
    </div>
  )
}
