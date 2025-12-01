'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Orb to avoid SSR issues with Three.js/Canvas
const Orb = dynamic(() => import('@/components/ui/orb').then(mod => mod.Orb), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-orix-accent/10 rounded-full">
      <div className="w-32 h-32 bg-orix-accent/20 rounded-full animate-pulse" />
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
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-orix-dark via-slate-900 to-orix-dark p-8">
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
          <h1 className="text-5xl font-bold text-white tracking-tight">
            AURIX
          </h1>
          <p className="text-xl text-slate-400">
            Voice AI Customer Success Agent
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-slate-300">
            Experience real-time AI-powered customer support
          </p>
          <p className="text-sm text-slate-500">
            Watch the agent think, query, and respond in real-time
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <Button
            onClick={handleSimulateCall}
            disabled={loading}
            size="lg"
            className="bg-orix-accent hover:bg-blue-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105"
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
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Demo Scenario
          </p>
          <div className="bg-slate-800/50 rounded-lg p-4 text-left space-y-2">
            <div className="text-sm text-slate-300">
              <span className="text-orix-accent font-semibold">Customer:</span> Tom
            </div>
            <div className="text-sm text-slate-300">
              <span className="text-orix-accent font-semibold">Order:</span> #417
            </div>
            <div className="text-sm text-slate-300">
              <span className="text-orix-accent font-semibold">Issue:</span> Delivery delay inquiry
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
