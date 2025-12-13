'use client'

import { useState } from 'react'
import { Mic, Loader2, Users, HelpCircle } from 'lucide-react'
import Image from 'next/image'
import { useSidebar } from '@/lib/sidebar-context'

interface WaitingStateProps {
  onCallStart: (callSid: string) => void
}

export function WaitingState({ onCallStart }: WaitingStateProps) {
  const [loading, setLoading] = useState(false)
  const { openGuide } = useSidebar()

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
        className="relative rounded-[32px] px-10 py-8 max-w-sm w-full"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.4) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.6)'
        }}
      >
        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center py-6">
            <Image 
              src="/assets/AL.png" 
              alt="Aurix" 
              width={280} 
              height={80}
              style={{ height: '72px', width: 'auto' }}
            />
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-800">
              Aurix Support Agent
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Regulated AI agent for sensitive healthcare e-commerce
            </p>
          </div>

          {/* Primary CTA */}
          <div className="pt-2">
            <button
              onClick={handleStartCall}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2.5 w-full h-12 px-6 text-sm font-medium rounded-full bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
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

          {/* Guide link */}
          <button
            onClick={openGuide}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to use this demo</span>
          </button>
        </div>
      </div>

      {/* Persona hint - below main card */}
      <div 
        className="relative mt-6 flex items-center gap-3 px-5 py-3 rounded-xl max-w-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.4)'
        }}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#088395]/10">
          <Users className="w-4 h-4 text-[#088395]" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] text-neutral-600 leading-snug">
            <span className="font-medium text-neutral-700">Test personas</span> appear in the left sidebar during calls to trigger different flows
          </p>
        </div>
      </div>
    </div>
  )
}
