'use client'

import { useState } from 'react'
import { WaitingState } from '@/components/WaitingState'
import { ConversationPanel } from '@/components/panels/ConversationPanel'
import { AgentBrainPanel } from '@/components/panels/AgentBrainPanel'
import { MobileTabs } from '@/components/MobileTabs'
import { useCallEvents } from '@/hooks/useCallEvents'
import { ExternalLink, Mic, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  const [callActive, setCallActive] = useState(false)
  const [callSid, setCallSid] = useState<string | null>(null)
  const { events, loading } = useCallEvents(callSid)

  const handleCallStart = (sid: string) => {
    setCallActive(true)
    setCallSid(sid)
  }

  const handleReset = () => {
    setCallActive(false)
    setCallSid(null)
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Header - ElevenLabs Style */}
      <header className="border-b border-neutral-200 bg-background px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Mic className="w-5 h-5" />
            AURIX
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time Voice AI Customer Success Agent
          </p>
        </div>
        <div className="flex items-center gap-3">
          {callActive && (
            <>
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Call
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
              >
                End Session
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            asChild
          >
            <Link href="/crm" target="_blank">
              <LayoutDashboard className="w-4 h-4" />
              CRM View
            </Link>
          </Button>
        </div>
      </header>

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
