'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'

export function PlatformFeatures() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="hidden lg:block fixed bottom-6 right-6 z-40">
      <Card 
        className="rounded-2xl border border-neutral-200/80 overflow-hidden transition-all duration-300 ease-in-out shadow-lg"
        style={{
          background: 'radial-gradient(ellipse at top, #ffffff 0%, #f8f9fa 100%)',
          width: isExpanded ? '380px' : 'auto'
        }}
      >
        {/* Header - Always visible, clickable to toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <Image 
              src="/assets/elevenlabs-symbol.svg" 
              alt="ElevenLabs" 
              width={20} 
              height={20}
              className="opacity-80"
            />
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline"
                className="text-[10px] px-2 py-0.5 border-neutral-300 text-neutral-500 bg-neutral-50"
              >
                Powered by
              </Badge>
              <span className="font-semibold text-sm text-neutral-900">
                ElevenLabs
              </span>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {/* Expandable Content */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 flex flex-col gap-2.5">
            <FeatureItem 
              text="Multimodal AI" 
              subtext="Voice + SMS in a single session"
            />
            <FeatureItem 
              text="Sub-100ms latency" 
              subtext="Natural conversation flow"
            />
            <FeatureItem 
              text="RAG-powered retrieval" 
              subtext="Grounded in your data"
            />
            <FeatureItem 
              text="Multi-system integration" 
              subtext="CRM, billing, prescriptions unified"
            />
            <FeatureItem 
              text="Workflow orchestration" 
              subtext="Multi-step verification & routing"
            />
            <FeatureItem 
              text="HIPAA/SOC 2 compliant" 
              subtext="Enterprise-grade security"
            />
            <FeatureItem 
              text="Bring your own LLM" 
              subtext="Claude, GPT-4, or proprietary"
            />

            <div className="mt-2 pt-3 border-t border-neutral-200">
              <a 
                href="https://elevenlabs.io/conversational-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors duration-300 inline-flex items-center gap-1"
              >
                Learn more about ElevenLabs Platform →
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function FeatureItem({ text, subtext }: { text: string; subtext: string }) {
  return (
    <div className="flex items-start gap-3 bg-neutral-50 rounded-lg p-3">
      <div className="w-1.5 h-1.5 rounded-full bg-azure mt-1.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm leading-tight text-neutral-900">
          {text}
        </div>
        <div className="text-xs leading-tight text-neutral-500 mt-0.5">
          {subtext}
        </div>
      </div>
    </div>
  )
}
