'use client'

import { useState } from 'react'
import { ConversationPanel } from './panels/ConversationPanel'
import { AgentBrainPanel } from './panels/AgentBrainPanel'
import { Button } from './ui/button'
import type { CallEvent } from '@/types'

export function MobileTabs({ events }: { events: CallEvent[] }) {
  const [activeTab, setActiveTab] = useState<'conversation' | 'brain'>('conversation')

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900">
        <Button
          variant="ghost"
          className={`flex-1 rounded-none ${activeTab === 'conversation' ? 'bg-slate-800' : ''}`}
          onClick={() => setActiveTab('conversation')}
        >
          💬 Conversation
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 rounded-none ${activeTab === 'brain' ? 'bg-slate-800' : ''}`}
          onClick={() => setActiveTab('brain')}
        >
          🧠 Agent Brain
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'conversation' ? (
          <ConversationPanel events={events} />
        ) : (
          <AgentBrainPanel events={events} />
        )}
      </div>
    </div>
  )
}



