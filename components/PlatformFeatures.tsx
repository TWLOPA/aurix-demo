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
    setTimeout(() => {
      setActiveTab(tab)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 120)
    }, 120)
  }

  const currentContent = activeTab === 'problem' ? problemContent : featuresContent

  return (
    <div className="hidden lg:block fixed bottom-6 right-6 z-40">
      <Card 
        className="rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          width: isExpanded ? '360px' : 'auto'
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
              className="text-[10px] px-2 py-0.5 border-white/20 text-white/60 bg-white/5 font-medium"
            >
              Powered by ElevenLabs
            </Badge>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-white/50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
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
          {/* Sleek Tab Bar */}
          <div className="px-5 mb-4" role="tablist">
            <div className="relative flex">
              {/* Sliding indicator */}
              <div 
                className="absolute bottom-0 h-[2px] bg-white/90 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  width: activeTab === 'problem' ? '85px' : '68px',
                  transform: activeTab === 'problem' ? 'translateX(0)' : 'translateX(101px)'
                }}
              />
              
              {/* Tab buttons */}
              <button
                role="tab"
                aria-selected={activeTab === 'problem'}
                aria-controls="tab-panel-problem"
                onClick={() => handleTabChange('problem')}
                className={`relative pb-2 mr-4 text-[13px] font-medium tracking-wide transition-all duration-200 focus:outline-none ${
                  activeTab === 'problem'
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                The Problem
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'features'}
                aria-controls="tab-panel-features"
                onClick={() => handleTabChange('features')}
                className={`relative pb-2 text-[13px] font-medium tracking-wide transition-all duration-200 focus:outline-none ${
                  activeTab === 'features'
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                Features
              </button>
            </div>
            {/* Subtle separator line */}
            <div className="h-px bg-white/10 -mt-[2px]" />
          </div>

          {/* Tab Content */}
          <div 
            role="tabpanel"
            id={`tab-panel-${activeTab}`}
            className={`px-5 pb-5 flex flex-col gap-2.5 transition-opacity duration-120 ease-out ${
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

            <div className="mt-3 pt-3 border-t border-white/10">
              <span className="text-[11px] text-white/40 tracking-wide">
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
    <div className="flex items-start gap-2.5 group">
      <div 
        className={`w-1 h-1 rounded-full mt-[7px] shrink-0 transition-all duration-200 ${
          isProblem 
            ? 'bg-amber-400/80 group-hover:bg-amber-400' 
            : 'bg-white/60 group-hover:bg-white/90'
        }`} 
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[13px] leading-tight text-white/90 group-hover:text-white transition-colors duration-200">
          {title}
        </div>
        <div className="text-[11px] leading-[1.5] text-white/50 mt-0.5">
          {description}
        </div>
      </div>
    </div>
  )
}
