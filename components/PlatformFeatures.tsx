'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown } from 'lucide-react'

interface PlatformFeaturesProps {
  defaultExpanded?: boolean
  defaultTab?: 'problem' | 'features'
}

const problemContent = [
  {
    title: "£300k Annual Waste",
    description: "Healthcare e-commerce spends £300k/year on routine inquiries at £30/hour per agent"
  },
  {
    title: "70% Are Repetitive",
    description: "Order status, tracking, refills - questions AI should handle"
  },
  {
    title: "Legal Blocks AI",
    description: "Cannot audit decisions or prove what was said"
  },
  {
    title: "No Compliance Proof",
    description: "Cannot guarantee boundaries or verify data access"
  },
  {
    title: "Zero Transparency",
    description: "Black-box AI creates regulatory risk"
  },
  {
    title: "The Catch-22",
    description: "Stuck paying humans because can't get AI past legal"
  }
]

const featuresContent = [
  {
    title: "Sub-100ms latency",
    description: "Natural conversation flow"
  },
  {
    title: "RAG-powered retrieval",
    description: "Grounded in your data"
  },
  {
    title: "Multi-system integration",
    description: "CRM, billing, prescriptions unified"
  },
  {
    title: "Workflow orchestration",
    description: "Multi-step verification & routing"
  },
  {
    title: "Omnichannel ready",
    description: "Voice, chat, and SMS"
  },
  {
    title: "HIPAA/SOC 2 compliant",
    description: "Enterprise-grade security"
  },
  {
    title: "Bring your own LLM",
    description: "Claude, GPT-4, or proprietary"
  }
]

export function PlatformFeatures({
  defaultExpanded = false,
  defaultTab = 'features'
}: PlatformFeaturesProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [activeTab, setActiveTab] = useState<'problem' | 'features'>(defaultTab)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleTabChange = (tab: 'problem' | 'features') => {
    if (tab === activeTab || isTransitioning) return
    
    setIsTransitioning(true)
    // Fade out, then switch, then fade in
    setTimeout(() => {
      setActiveTab(tab)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 150)
    }, 150)
  }

  const currentContent = activeTab === 'problem' ? problemContent : featuresContent

  return (
    <div className="hidden lg:block fixed bottom-6 right-6 z-40">
      <Card 
        className="rounded-2xl border-2 border-white/10 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          width: isExpanded ? '380px' : 'auto'
        }}
      >
        {/* Header - Always visible, clickable to toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors duration-200"
          aria-expanded={isExpanded}
          aria-controls="platform-features-content"
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm text-white/95">
              Aurix Features
            </span>
            <Badge 
              variant="outline"
              className="text-[11px] px-2 py-0.5 border-white/30 text-white/70 bg-white/10"
            >
              Powered by ElevenLabs
            </Badge>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-white/70 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isExpanded ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>

        {/* Expandable Content */}
        <div 
          id="platform-features-content"
          className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Tab Buttons */}
          <div className="px-5 pb-3 flex gap-2" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'problem'}
              aria-controls="tab-panel-problem"
              onClick={() => handleTabChange('problem')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#05B2DC] focus:ring-offset-2 focus:ring-offset-transparent ${
                activeTab === 'problem'
                  ? 'bg-white/15 text-white/95 border-b-2 border-[#05B2DC]'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              The Problem
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'features'}
              aria-controls="tab-panel-features"
              onClick={() => handleTabChange('features')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#05B2DC] focus:ring-offset-2 focus:ring-offset-transparent ${
                activeTab === 'features'
                  ? 'bg-white/15 text-white/95 border-b-2 border-[#05B2DC]'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              Features
            </button>
          </div>

          {/* Tab Content */}
          <div 
            role="tabpanel"
            id={`tab-panel-${activeTab}`}
            className={`px-5 pb-5 flex flex-col gap-3 transition-opacity duration-150 ease-in-out ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {currentContent.map((item, index) => (
              <FeatureItem 
                key={`${activeTab}-${index}`}
                title={item.title} 
                description={item.description}
                isProblem={activeTab === 'problem'}
              />
            ))}

            <div className="mt-2 pt-4 border-t border-white/20">
              <span className="text-xs text-white/50">
                {activeTab === 'problem' 
                  ? 'Why healthcare companies need Aurix'
                  : 'Aurix Support Agent'
                }
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function FeatureItem({ 
  title, 
  description,
  isProblem = false 
}: { 
  title: string
  description: string
  isProblem?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div 
        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
          isProblem ? 'bg-amber-400' : 'bg-[#05B2DC]'
        }`} 
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm leading-tight text-white/95">
          {title}
        </div>
        <div className="text-xs leading-[1.4] text-white/70 mt-0.5">
          {description}
        </div>
      </div>
    </div>
  )
}
