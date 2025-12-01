'use client'

import { useState } from 'react'
import { WaitingState } from '@/components/WaitingState'
import { ConversationPanel } from '@/components/panels/ConversationPanel'
import { AgentBrainPanel } from '@/components/panels/AgentBrainPanel'
import { MobileTabs } from '@/components/MobileTabs'
import { useCallEvents } from '@/hooks/useCallEvents'
import { Phone, ExternalLink } from 'lucide-react'
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
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 p-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orix-accent to-orix-purple flex items-center justify-center">
            <span className="text-2xl">🎙️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              AURIX
            </h1>
            <p className="text-xs text-slate-400">
              Voice AI Customer Success Platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {callActive && (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Call Active</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-slate-700 hover:bg-slate-800"
              >
                End Call
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
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
              <div className="w-1/2 border-r border-slate-800 h-full">
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
      <footer className="border-t border-slate-800 p-3 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-500">
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
