'use client'

import { useState, useCallback } from 'react'
import { WaitingState } from '@/components/WaitingState'
import { ConversationPanel } from '@/components/panels/ConversationPanel'
import { AgentBrainPanel } from '@/components/panels/AgentBrainPanel'
import { MobileTabs } from '@/components/MobileTabs'
import { useCallEvents } from '@/hooks/useCallEvents'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useConversation } from '@elevenlabs/react'
import { insertCallEvent } from '@/lib/supabase/queries'

export default function Home() {
  const [callActive, setCallActive] = useState(false)
  const [callSid, setCallSid] = useState<string | null>(null)
  const { events, loading } = useCallEvents(callSid)

  // Initialize ElevenLabs Conversation Hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs')
      setCallActive(true)
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs')
      setCallActive(false)
      setCallSid(null)
    },
    onMessage: async (message: { message: string, source: string }) => {
        if (callSid) {
            await insertCallEvent({
                call_sid: callSid,
                event_type: message.source === 'user' ? 'user_spoke' : 'agent_spoke',
                event_data: { text: message.message }
            })
        }
    },
    onError: (error: string) => {
      console.error('ElevenLabs Error:', error)
    }
  })

  const handleCallStart = useCallback(async (sid: string) => {
    setCallSid(sid)
    try {
      // Request microphone permission explicitly first if needed, 
      // but startSession usually handles it.
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
      if (!agentId) {
        throw new Error('NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not defined')
      }
      await conversation.startSession({
        agentId
      })
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }, [conversation])

  const handleReset = async () => {
    await conversation.endSession()
    setCallActive(false)
    setCallSid(null)
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Call Active Control Bar - Only shown when call is active */}
      {callActive && (
        <div className="bg-background border-b border-neutral-200 px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Session: {callSid}
              </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            End Session
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden flex-col lg:flex-row bg-neutral-50/50">
        {!callActive ? (
          <WaitingState onCallStart={handleCallStart} />
        ) : (
          <>
             {/* Mobile: Tabs */}
            <div className="lg:hidden h-full">
              <MobileTabs events={events} />
            </div>
            
            {/* Desktop: Split Panels */}
            <div className="hidden lg:flex lg:flex-1 h-full gap-px">
              <div className="w-1/2 border-r border-neutral-200 bg-background h-full">
                <ConversationPanel events={events} loading={loading} />
              </div>
              <div className="w-1/2 bg-background h-full">
                <AgentBrainPanel events={events} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
