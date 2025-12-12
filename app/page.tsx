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
import { useConversation } from '@elevenlabs/react'
import { insertCallEvent } from '@/lib/supabase/queries'
import { useSidebar } from '@/lib/sidebar-context'

// Smart farewell detection - detects natural call endings
function isFarewellMessage(text: string): boolean {
  const lowerText = text.toLowerCase().trim()
  
  // Must be relatively short (farewells are typically brief)
  if (lowerText.length > 80) return false
  
  // Strong farewell indicators (high confidence)
  const strongFarewells = [
    'goodbye',
    'bye bye',
    'bye for now',
    'take care',
    'have a great day',
    'have a good day', 
    'have a nice day',
    'have a wonderful day',
    'thank you for calling',
    'thanks for calling',
  ]
  
  // Check for strong farewells
  for (const farewell of strongFarewells) {
    if (lowerText.includes(farewell)) {
      // Extra check: make sure it's not mid-sentence context
      // "take care" is fine, "take care of your medication" is not
      if (farewell === 'take care' && lowerText.includes('take care of')) {
        continue
      }
      return true
    }
  }
  
  // Combination patterns (need 2+ signals)
  const signals = [
    lowerText.includes('thank'),
    lowerText.includes('bye'),
    lowerText.includes('care'),
    lowerText.includes('call') && lowerText.includes('again'),
    lowerText.endsWith('.') && lowerText.length < 40, // Short final statement
  ]
  
  const signalCount = signals.filter(Boolean).length
  return signalCount >= 2
}

export default function Home() {
  const { collapse, expand } = useSidebar()
  const [callActive, setCallActive] = useState(false)
  const [callSid, setCallSid] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [showPersonaHint, setShowPersonaHint] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false)
  const lastVolumeRef = useRef<number>(1.0)
  const peerConnectionsRef = useRef<Set<RTCPeerConnection>>(new Set())
  const originalSenderTrackRef = useRef<Map<RTCRtpSender, MediaStreamTrack>>(new Map())
  const silentTrackRef = useRef<MediaStreamTrack | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const callSidRef = useRef<string | null>(null) // Ref to avoid closure issues
  const callStartTimeRef = useRef<number | null>(null) // Track call start time
  const eventsForSummaryRef = useRef<typeof events>([]) // Store events for summary
  const farewellTimeoutRef = useRef<NodeJS.Timeout | null>(null) // For farewell detection
  const { events, loading } = useCallEvents(callSid)

  // Capture RTCPeerConnections created by ElevenLabs so we can swap the outgoing mic track.
  // This blocks input to the agent while preserving system mic for screen recording apps.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof (window as any).RTCPeerConnection === 'undefined') return

    const OriginalRTCPeerConnection = (window as any).RTCPeerConnection as typeof RTCPeerConnection
    // Avoid double-patching on HMR
    if ((OriginalRTCPeerConnection as any).__aurix_patched) return

    function PatchedRTCPeerConnection(this: RTCPeerConnection, ...args: any[]) {
      const pc = new (OriginalRTCPeerConnection as any)(...args) as RTCPeerConnection
      peerConnectionsRef.current.add(pc)
      pc.addEventListener('connectionstatechange', () => {
        if (pc.connectionState === 'closed' || pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          peerConnectionsRef.current.delete(pc)
        }
      })
      return pc
    }

    // Preserve static properties
    ;(PatchedRTCPeerConnection as any).prototype = OriginalRTCPeerConnection.prototype
    ;(PatchedRTCPeerConnection as any).__aurix_patched = true
    ;(PatchedRTCPeerConnection as any).__aurix_original = OriginalRTCPeerConnection

    ;(window as any).RTCPeerConnection = PatchedRTCPeerConnection as any

    return () => {
      // Restore original if we can
      const current = (window as any).RTCPeerConnection
      if (current && (current as any).__aurix_original) {
        ;(window as any).RTCPeerConnection = (current as any).__aurix_original
      }
    }
  }, [])

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
      // If speaker is muted at connect-time, re-apply it
      if (isSpeakerMuted) {
        try {
          conversation.setVolume({ volume: 0 })
        } catch {}
      }
      setCallActive(true)
      callStartTimeRef.current = Date.now()
      collapse() // Auto-collapse sidebar during call
      setShowPersonaHint(true) // Show persona hint on call start
    },
    onDisconnect: () => {
      console.log('[ElevenLabs] ❌ Disconnected from ElevenLabs')
      // Clear any farewell timeout
      if (farewellTimeoutRef.current) {
        clearTimeout(farewellTimeoutRef.current)
        farewellTimeoutRef.current = null
      }
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
        
        // Smart farewell detection - only for agent messages
        if (message.source === 'ai' || message.source === 'agent') {
          // Clear any existing farewell timeout (conversation is continuing)
          if (farewellTimeoutRef.current) {
            clearTimeout(farewellTimeoutRef.current)
            farewellTimeoutRef.current = null
          }
          
          // Check if this is a farewell message
          if (isFarewellMessage(message.message)) {
            console.log('[ElevenLabs] 👋 Farewell detected, waiting 5s for graceful ending...')
            
            // Wait 5 seconds for graceful ending - allows agent to finish speaking
            // and gives natural pause before disconnect
            farewellTimeoutRef.current = setTimeout(() => {
              console.log('[ElevenLabs] 👋 Ending call gracefully after farewell')
              conversation.endSession()
            }, 5000)
          }
        } else {
          // User spoke - cancel any pending farewell timeout
          // (they might have more questions)
          if (farewellTimeoutRef.current) {
            console.log('[ElevenLabs] User spoke after farewell, cancelling auto-end')
            clearTimeout(farewellTimeoutRef.current)
            farewellTimeoutRef.current = null
          }
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
    setIsMuted(false) // Reset mute state
    setIsSpeakerMuted(false) // Reset speaker state
    lastVolumeRef.current = 1.0
    // Best-effort: restore original sender tracks after ending.
    const senderEntries = Array.from(originalSenderTrackRef.current.entries())
    for (let i = 0; i < senderEntries.length; i++) {
      const [sender, track] = senderEntries[i]
      try {
        await sender.replaceTrack(track)
      } catch {}
    }
    originalSenderTrackRef.current.clear()
    setShowSummary(true) // Show summary modal
  }

  const getSilentTrack = useCallback(() => {
    if (silentTrackRef.current) return silentTrackRef.current

    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return null
    if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx()

    const ctx = audioCtxRef.current!
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    gain.gain.value = 0 // silence
    const destination = ctx.createMediaStreamDestination()
    oscillator.connect(gain)
    gain.connect(destination)
    oscillator.start()

    const track = destination.stream.getAudioTracks()[0] || null
    silentTrackRef.current = track
    return track
  }, [])

  const applyMuteToPeerConnections = useCallback(async (mute: boolean) => {
    const pcs = Array.from(peerConnectionsRef.current)
    if (pcs.length === 0) {
      console.warn('[Page] ⚠️ No RTCPeerConnection captured yet; mute may rely on SDK only.')
    }

    const silent = mute ? getSilentTrack() : null

    await Promise.all(
      pcs.map(async (pc) => {
        const senders = pc.getSenders?.() || []
        await Promise.all(
          senders.map(async (sender) => {
            const track = sender.track
            if (!track || track.kind !== 'audio') return

            try {
              if (mute) {
                if (!originalSenderTrackRef.current.has(sender)) {
                  originalSenderTrackRef.current.set(sender, track)
                }
                if (silent) {
                  await sender.replaceTrack(silent)
                } else {
                  // Fallback: disable sender track (may affect global mic consumers)
                  track.enabled = false
                }
              } else {
                const original = originalSenderTrackRef.current.get(sender)
                if (original) {
                  await sender.replaceTrack(original)
                } else {
                  track.enabled = true
                }
              }
            } catch (e) {
              console.warn('[Page] ⚠️ Failed to replace audio track on sender:', e)
            }
          })
        )
      })
    )
  }, [getSilentTrack])

  // Toggle microphone mute - mutes input ONLY to ElevenLabs (doesn't affect external recording)
  const handleToggleMute = useCallback(() => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)

    try {
      // ElevenLabs SDK methods vary by version. Try all known APIs.
      const conv: any = conversation as any
      let used: string | null = null

      if (typeof conv.setMicMuted === 'function') {
        conv.setMicMuted(newMutedState)
        used = 'setMicMuted'
      } else if (typeof conv.muteMic === 'function') {
        // Some versions expose muteMic() toggle-style; call only when state changes.
        // If it's a toggle, ensure it matches desired state by checking conv.isMuted where available.
        const before = typeof conv.isMuted === 'boolean' ? conv.isMuted : undefined
        conv.muteMic()
        const after = typeof conv.isMuted === 'boolean' ? conv.isMuted : undefined
        if (before !== undefined && after !== undefined && after !== newMutedState) {
          // Toggle again if needed
          conv.muteMic()
        }
        used = 'muteMic'
      } else if (typeof conv.toggleMute === 'function') {
        // Same caveat as above: toggleMute() may not accept a boolean
        const before = typeof conv.isMuted === 'boolean' ? conv.isMuted : undefined
        conv.toggleMute()
        const after = typeof conv.isMuted === 'boolean' ? conv.isMuted : undefined
        if (before !== undefined && after !== undefined && after !== newMutedState) {
          conv.toggleMute()
        }
        used = 'toggleMute'
      }

      console.log(`[Page] 🎤 ElevenLabs mute API used: ${used ?? 'none'}`)
    } catch (e) {
      console.warn('[Page] ⚠️ Could not mute mic via ElevenLabs SDK:', e)
    }

    // Robust fallback: swap outgoing WebRTC audio track to silence
    applyMuteToPeerConnections(newMutedState).then(() => {
      console.log(`[Page] 🎤 WebRTC sender track ${newMutedState ? 'silenced' : 'restored'}`)
    })
  }, [isMuted, conversation, applyMuteToPeerConnections])

  // Toggle agent output volume (speaker mute) - does NOT stop the call.
  const handleToggleSpeakerMute = useCallback(() => {
    const newState = !isSpeakerMuted
    setIsSpeakerMuted(newState)

    try {
      if (newState) {
        // Store last known volume so we can restore
        lastVolumeRef.current = 1.0
        ;(conversation as any).setVolume?.({ volume: 0 })
        console.log('[Page] 🔇 Speaker muted (agent audio)')
      } else {
        ;(conversation as any).setVolume?.({ volume: lastVolumeRef.current ?? 1.0 })
        console.log('[Page] 🔊 Speaker unmuted (agent audio)')
      }
    } catch (e) {
      console.warn('[Page] ⚠️ Could not toggle speaker mute:', e)
    }
  }, [isSpeakerMuted, conversation])

  const handleCloseSummary = () => {
    setShowSummary(false)
    setCallSid(null)
    callSidRef.current = null
    callStartTimeRef.current = null
    eventsForSummaryRef.current = []
    expand() // Expand sidebar when returning home
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
                onEndCall={handleEndCall}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                isSpeakerMuted={isSpeakerMuted}
                onToggleSpeakerMute={handleToggleSpeakerMute}
              />
            </div>
            
            {/* Desktop: Three-column layout with sidebar */}
            <div className="hidden lg:flex lg:flex-1 h-full">
              {/* Left Sidebar - Blue gradient with glassy cards */}
              <div 
                className="w-72 shrink-0 p-4 space-y-4 overflow-y-auto"
                style={{
                  background: 'linear-gradient(180deg, #E8F4FC 0%, #D4EAF7 50%, #C7E2F4 100%)',
                }}
              >
                <PersonaToolbar showOnboardingHint={showPersonaHint} />
                <CostCalculator isActive={callActive} />
              </div>
              
              {/* Main Panels */}
              <div className="flex-1 flex">
                <div className="w-1/2 h-full">
                  <ConversationPanel 
                    events={events} 
                    loading={loading} 
                    agentSpeaking={conversation.isSpeaking}
                    onEndCall={handleEndCall}
                    isMuted={isMuted}
                    onToggleMute={handleToggleMute}
                    isSpeakerMuted={isSpeakerMuted}
                    onToggleSpeakerMute={handleToggleSpeakerMute}
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
