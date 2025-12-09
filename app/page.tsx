'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { WaitingState } from '@/components/WaitingState'
import { ConversationPanel } from '@/components/panels/ConversationPanel'
import { AgentBrainPanel } from '@/components/panels/AgentBrainPanel'
import { MobileTabs } from '@/components/MobileTabs'
import { CallSummaryModal } from '@/components/CallSummaryModal'
import { CostCalculator } from '@/components/CostCalculator'
import { PersonaToolbar } from '@/components/PersonaToolbar'
import { PlatformFeatures } from '@/components/PlatformFeatures'
import { SMSPrompt } from '@/components/SMSPrompt'
import { useCallEvents } from '@/hooks/useCallEvents'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useConversation } from '@elevenlabs/react'
import { insertCallEvent } from '@/lib/supabase/queries'

export default function Home() {
  const [callActive, setCallActive] = useState(false)
  const [callSid, setCallSid] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const callSidRef = useRef<string | null>(null) // Ref to avoid closure issues
  const callStartTimeRef = useRef<number | null>(null) // Track call start time
  const eventsForSummaryRef = useRef<typeof events>([]) // Store events for summary
  const { events, loading } = useCallEvents(callSid)

  // Update events ref whenever events change
  useEffect(() => {
    if (events.length > 0) {
      eventsForSummaryRef.current = events
    }
  }, [events])

  // Initialize ElevenLabs Conversation Hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('[ElevenLabs] ✅ Connected to ElevenLabs WebRTC')
      console.log('[ElevenLabs] 🔊 Setting volume to maximum...')
      // Ensure audio is at full volume
      try {
        conversation.setVolume({ volume: 1.0 })
        console.log('[ElevenLabs] 🔊 Volume set to 1.0')
      } catch (e) {
        console.warn('[ElevenLabs] Could not set volume:', e)
      }
      setCallActive(true)
      callStartTimeRef.current = Date.now()
    },
    onDisconnect: () => {
      console.log('[ElevenLabs] ❌ Disconnected from ElevenLabs')
      // Calculate duration before showing summary
      if (callStartTimeRef.current) {
        const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000)
        setCallDuration(duration)
      }
      setCallActive(false)
      setShowSummary(true) // Show summary modal instead of resetting
    },
    onMessage: async (message: { message: string, source: string }) => {
        console.log('[ElevenLabs] 💬 Received message:', JSON.stringify(message))
        const currentCallSid = callSidRef.current // Use ref instead of state
        if (currentCallSid) {
            console.log('[ElevenLabs] Inserting event to Supabase for callSid:', currentCallSid)
            await insertCallEvent({
                call_sid: currentCallSid,
                event_type: message.source === 'user' ? 'user_spoke' : 'agent_spoke',
                event_data: { text: message.message }
            })
        } else {
            console.warn('[ElevenLabs] ⚠️ No callSid set, cannot insert event')
        }
    },
    onError: (error: string) => {
      console.error('[ElevenLabs] 🔴 Error:', error)
    }
  })

  const handleCallStart = useCallback(async (sid: string) => {
    console.log('[Page] handleCallStart called with sid:', sid)
    
    // Clear old events for DEMO_SESSION_ID before starting new call
    if (sid === 'DEMO_SESSION_ID') {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        await supabase.from('call_events').delete().eq('call_sid', 'DEMO_SESSION_ID')
        console.log('[Page] Cleared old DEMO_SESSION_ID events')
      } catch (e) {
        console.warn('[Page] Could not clear old events:', e)
      }
    }
    
    setCallSid(sid)
    callSidRef.current = sid // Set ref immediately
    eventsForSummaryRef.current = [] // Clear events ref
    try {
      // Request microphone permission explicitly first if needed, 
      // but startSession usually handles it.
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
      console.log('[Page] Agent ID from env:', agentId)
      if (!agentId) {
        throw new Error('NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not defined')
      }
      console.log('[Page] Calling conversation.startSession...')
      await conversation.startSession({
        agentId,
        // @ts-ignore
        connectionType: 'webrtc',
      })
      console.log('[Page] ✅ startSession completed successfully')
    } catch (error) {
      console.error('[Page] 🔴 Failed to start conversation:', error)
    }
  }, [conversation])

  const handleEndCall = async () => {
    // Calculate duration
    if (callStartTimeRef.current) {
      const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000)
      setCallDuration(duration)
    }
    
    // End the ElevenLabs session
    await conversation.endSession()
    setCallActive(false)
    setShowSummary(true) // Show summary modal
  }

  const handleCloseSummary = () => {
    setShowSummary(false)
    setCallSid(null)
    callSidRef.current = null
    callStartTimeRef.current = null
    eventsForSummaryRef.current = []
  }

  const handleNewCallFromSummary = () => {
    setShowSummary(false)
    // Clear state then immediately start new call
    setCallSid(null)
    callSidRef.current = null
    callStartTimeRef.current = null
    eventsForSummaryRef.current = []
    // Small delay to allow state to reset, then start new call
    setTimeout(() => {
      handleCallStart('DEMO_SESSION_ID')
    }, 100)
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden flex-col lg:flex-row bg-white">
        {!callActive && !showSummary ? (
          <>
            {/* Landing Page with Platform Features */}
            <WaitingState onCallStart={handleCallStart} />
            <PlatformFeatures />
          </>
        ) : callActive ? (
          <>
             {/* Mobile: Tabs */}
            <div className="lg:hidden h-full">
              <MobileTabs 
                events={events} 
                agentSpeaking={conversation.isSpeaking}
              />
            </div>
            
            {/* Desktop: Three-column layout with sidebar */}
            <div className="hidden lg:flex lg:flex-1 h-full">
              {/* Left Sidebar - Blue gradient with glassy cards */}
              <div 
                className="w-72 shrink-0 p-4 space-y-4 overflow-y-auto flex flex-col"
                style={{
                  background: 'linear-gradient(180deg, #E8F4FC 0%, #D4EAF7 50%, #C7E2F4 100%)',
                }}
              >
                <PersonaToolbar />
                <CostCalculator isActive={callActive} />
                
                {/* End Session Button - at bottom of sidebar */}
                <div className="mt-auto pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEndCall}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50/80 bg-white/60 backdrop-blur-sm border border-white/40"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    End Session
                  </Button>
                </div>
              </div>
              
              {/* Main Panels */}
              <div className="flex-1 flex">
                <div className="w-1/2 h-full">
                  <ConversationPanel 
                    events={events} 
                    loading={loading} 
                    agentSpeaking={conversation.isSpeaking}
                  />
                </div>
                <div className="w-1/2 h-full">
                  <AgentBrainPanel events={events} />
                </div>
              </div>
            </div>

            {/* SMS Prompt Modal - shown during call when agent triggers SMS */}
            <SMSPrompt />
          </>
        ) : (
          // Show waiting state in background when summary is displayed
          <WaitingState onCallStart={handleCallStart} />
        )}
      </div>

      {/* Call Summary Modal */}
      <CallSummaryModal
        isOpen={showSummary}
        onClose={handleCloseSummary}
        onNewCall={handleNewCallFromSummary}
        events={eventsForSummaryRef.current}
        callDuration={callDuration}
      />
    </div>
  )
}
