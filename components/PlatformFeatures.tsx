'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function PlatformFeatures() {
  return (
    <div className="hidden lg:block fixed bottom-6 right-6 z-40 w-[380px]">
      <Card 
        className="p-5 rounded-2xl border-2 border-white/10"
        style={{
          background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Badge 
            variant="outline"
            className="text-[11px] px-2 py-1 border-white/30 text-white/90 bg-white/10"
          >
            Powered by
          </Badge>
          <span className="font-semibold text-sm text-white/95">
            ElevenLabs Enterprise
          </span>
        </div>
        
        <div className="flex flex-col gap-3">
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
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <a 
            href="https://elevenlabs.io/conversational-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/70 hover:text-white/95 transition-colors duration-300 inline-flex items-center gap-1"
          >
            Learn more about ElevenLabs Platform →
          </a>
        </div>
      </Card>
    </div>
  )
}

function FeatureItem({ text, subtext }: { text: string; subtext: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-1 h-1 rounded-full bg-[#7DD3FC] mt-2 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm leading-tight text-white/95">
          {text}
        </div>
        <div className="text-xs leading-tight text-white/70 mt-0.5">
          {subtext}
        </div>
      </div>
    </div>
  )
}

