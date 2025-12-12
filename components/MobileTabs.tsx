'use client'

import { useState } from 'react'
import { ConversationPanel } from './panels/ConversationPanel'
import { AgentBrainPanel } from './panels/AgentBrainPanel'
import { Button } from './ui/button'
import type { CallEvent } from '@/types'

interface MobileTabsProps {
  events: CallEvent[]
  agentSpeaking?: boolean
  onEndCall?: () => void
  isMuted?: boolean
  onToggleMute?: () => void
  isSpeakerMuted?: boolean
  onToggleSpeakerMute?: () => void
}

export function MobileTabs({ events, agentSpeaking, onEndCall, isMuted, onToggleMute, isSpeakerMuted, onToggleSpeakerMute }: MobileTabsProps) {
  const [activeTab, setActiveTab] = useState<'conversation' | 'brain'>('conversation')

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-neutral-200 bg-background">
        <Button
          variant="ghost"
          className={`flex-1 rounded-none ${activeTab === 'conversation' ? 'bg-neutral-100' : ''}`}
          onClick={() => setActiveTab('conversation')}
        >
          💬 Conversation
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 rounded-none ${activeTab === 'brain' ? 'bg-neutral-100' : ''}`}
          onClick={() => setActiveTab('brain')}
        >
          🧠 Agent Brain
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'conversation' ? (
          <ConversationPanel 
            events={events} 
            agentSpeaking={agentSpeaking}
            onEndCall={onEndCall}
            isMuted={isMuted}
            onToggleMute={onToggleMute}
            isSpeakerMuted={isSpeakerMuted}
            onToggleSpeakerMute={onToggleSpeakerMute}
          />
        ) : (
          <AgentBrainPanel events={events} />
        )}
      </div>
    </div>
  )
}



