'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ChevronDown, X } from 'lucide-react'

interface PlatformFeaturesProps {
  defaultExpanded?: boolean
  defaultTab?: 'problem' | 'solution'
}

const problemContent = [
  {
    title: "High Agent Costs",
    description: "UK contact centres average £25-30/hour per agent for routine queries"
  },
  {
    title: "60-80% Repetitive",
    description: "Order status, tracking, refills - questions that don't need humans"
  },
  {
    title: "Legal Blocks AI",
    description: "Can't audit decisions or prove what was said to regulators"
  },
  {
    title: "No Compliance Trail",
    description: "Traditional AI can't prove it stayed within boundaries"
  },
  {
    title: "Black Box Risk",
    description: "Regulators won't approve what they can't inspect"
  },
  {
    title: "The Catch-22",
    description: "Want to automate, but can't get AI past legal review"
  }
]

const solutionContent = [
  {
    title: "Watch the AI Think",
    description: "See exactly why decisions are made in real-time"
  },
  {
    title: "Every Query Logged",
    description: "Full audit trail of database lookups and actions"
  },
  {
    title: "Guardrails in Action",
    description: "Medical questions trigger clinician escalation"
  },
  {
    title: "Identity Verification",
    description: "DOB and postcode checks before sensitive data"
  },
  {
    title: "Live Cost Savings",
    description: "See per-call savings vs human agent costs"
  },
  {
    title: "Multimodal Demo",
    description: "Voice call triggers SMS follow-up seamlessly"
  }
]

export function PlatformFeatures({
  defaultExpanded = false,
  defaultTab = 'solution'
}: PlatformFeaturesProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [activeTab, setActiveTab] = useState<'problem' | 'solution'>(defaultTab)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleTabChange = (tab: 'problem' | 'solution') => {
    if (tab === activeTab || isTransitioning) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveTab(tab)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 100)
    }, 100)
  }

  const currentContent = activeTab === 'problem' ? problemContent : solutionContent

  return (
    <div className="hidden lg:block fixed bottom-6 right-6 z-40">
      <Card 
        className="rounded-xl border border-white/[0.08] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25)',
          width: '320px'
        }}
      >
        {/* Collapsed Header - Only visible when collapsed */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'
          }`}
        >
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors duration-150"
            aria-expanded={isExpanded}
            aria-controls="platform-features-content"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-medium text-[13px] text-white/90">
                Problem & Solution
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>

        {/* Expanded Content */}
        <div 
          id="platform-features-content"
          className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Header with tabs and close */}
          <div className="px-4 pt-3 pb-0">
            <div className="flex items-center justify-between mb-3">
              {/* Tab Bar */}
              <div className="relative flex" role="tablist">
              {/* Sliding indicator */}
              <div 
                className="absolute bottom-0 h-[1.5px] bg-white transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  width: activeTab === 'problem' ? '76px' : '72px',
                  transform: activeTab === 'problem' ? 'translateX(0)' : 'translateX(92px)'
                }}
              />
              
              <button
                role="tab"
                aria-selected={activeTab === 'problem'}
                onClick={() => handleTabChange('problem')}
                className={`relative pb-2 mr-4 text-[12px] font-medium transition-colors duration-150 focus:outline-none ${
                  activeTab === 'problem'
                    ? 'text-white'
                    : 'text-white/35 hover:text-white/60'
                }`}
              >
                The Problem
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'solution'}
                onClick={() => handleTabChange('solution')}
                className={`relative pb-2 text-[12px] font-medium transition-colors duration-150 focus:outline-none ${
                  activeTab === 'solution'
                    ? 'text-white'
                    : 'text-white/35 hover:text-white/60'
                }`}
              >
                The Solution
              </button>
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 -mr-1 text-white/30 hover:text-white/60 transition-colors duration-150 focus:outline-none"
                aria-label="Collapse"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Separator */}
            <div className="h-px bg-white/[0.06] -mx-4 px-4" />
          </div>

          {/* Tab Content */}
          <div 
            role="tabpanel"
            className={`px-4 pt-3 pb-4 flex flex-col gap-2 transition-opacity duration-100 ease-out ${
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

            {/* Footer */}
            <div className="mt-2 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[10px] text-white/30">
                {activeTab === 'problem' ? 'The compliance gap' : 'Powered by ElevenLabs'}
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
    <div className="flex items-start gap-2.5">
      <div 
        className={`w-1 h-1 rounded-full mt-[6px] shrink-0 ${
          isProblem ? 'bg-amber-400/70' : 'bg-white/50'
        }`} 
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[12px] leading-tight text-white/85">
          {title}
        </div>
        <div className="text-[10px] leading-[1.4] text-white/45 mt-0.5">
          {description}
        </div>
      </div>
    </div>
  )
}
