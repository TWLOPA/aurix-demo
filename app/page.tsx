'use client'

import { useState } from 'react'
import { WaitingState } from '@/components/WaitingState'
import { ConversationPanel } from '@/components/panels/ConversationPanel'
import { AgentBrainPanel } from '@/components/panels/AgentBrainPanel'
import { MobileTabs } from '@/components/MobileTabs'
import { useCallEvents } from '@/hooks/useCallEvents'
import { ExternalLink, Mic } from 'lucide-react'
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
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b p-4 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              AURIX
            </h1>
            <p className="text-xs text-muted-foreground">
              Voice AI Customer Success Platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {callActive && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Call Active</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
              >
                End Call
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href="/crm" target="_blank">
              View CRM
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        {!callActive ? (
          <WaitingState onCallStart={handleCallStart} />
        ) : (
          <>
             {/* Mobile: Tabs */}
            <div className="lg:hidden h-full">
              <MobileTabs events={events} />
            </div>
            
            {/* Desktop: Split Panels */}
            <div className="hidden lg:flex lg:flex-1 h-full">
              <div className="w-1/2 border-r h-full">
                <ConversationPanel events={events} loading={loading} />
              </div>
              <div className="w-1/2 h-full">
                <AgentBrainPanel events={events} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t p-3 bg-muted/30 text-muted-foreground">
        <div className="flex items-center justify-between text-xs">
          <div>
            Powered by ElevenLabs, Anthropic Claude & Supabase
          </div>
          <div>
            Built by Tom | Demo for FDE-S Role
          </div>
        </div>
      </footer>
    </div>
  )
}
