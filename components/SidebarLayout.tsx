'use client'

import { useState } from 'react'
import { Bot, FileText, ChevronRight, ChevronLeft, HelpCircle, X, MessageSquare, Shield, Zap, Package, AlertTriangle, Settings, Phone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarLayoutProps {
  children: React.ReactNode
  isSimulationMode?: boolean
}

export function SidebarLayout({ children, isSimulationMode = false }: SidebarLayoutProps) {
  const pathname = usePathname()
  const [showGuide, setShowGuide] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(isSimulationMode)
  
  const navSections = [
    {
      title: 'Demo',
      items: [
        {
          title: 'Agent',
          icon: Bot,
          href: '/',
          matches: ['/'],
        },
        {
          title: 'Call Logs',
          icon: FileText,
          href: '/logs',
          matches: ['/logs'],
        },
      ]
    },
    {
      title: 'Monitor',
      items: [
        {
          title: 'Escalations',
          icon: AlertTriangle,
          href: '/escalations',
          matches: ['/escalations'],
        },
      ]
    },
  ]

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Left Sidebar */}
      <aside 
        className={cn(
          "flex-shrink-0 border-r border-neutral-200 bg-white flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo Area */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-100">
          {!isCollapsed ? (
            <Link href="/" className="flex items-center">
              <Image 
                src="/assets/hims-brand-logo.png" 
                alt="Hims & Hers" 
                width={100} 
                height={24}
                className="h-5 w-auto"
              />
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <Image 
                src="/assets/elevenlabs-symbol.svg" 
                alt="ElevenLabs" 
                width={20} 
                height={20}
                className="opacity-70"
              />
            </Link>
          )}
          
          {/* Collapse Toggle */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded hover:bg-neutral-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-400" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 mx-auto mt-2 rounded hover:bg-neutral-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navSections.map((section, sectionIndex) => (
            <div key={section.title} className={cn(sectionIndex > 0 && "mt-6")}>
              {/* Section Header */}
              {!isCollapsed && (
                <div className="px-4 mb-2">
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    {section.title}
                  </span>
                </div>
              )}
              
              {/* Section Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.matches.includes(pathname)
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm",
                        "transition-colors duration-150",
                        isActive 
                          ? "bg-neutral-100 text-neutral-900" 
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50",
                        isCollapsed && "justify-center mx-1 px-2"
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className={cn(
                        "w-[18px] h-[18px] shrink-0",
                        isActive ? "text-neutral-700" : "text-neutral-400"
                      )} />
                      {!isCollapsed && (
                        <span className={isActive ? "font-medium" : "font-normal"}>
                          {item.title}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Help Section */}
          <div className={cn("mt-6", isCollapsed && "mt-4")}>
            {!isCollapsed && (
              <div className="px-4 mb-2">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Help
                </span>
              </div>
            )}
            <button
              onClick={() => setShowGuide(true)}
              className={cn(
                "flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm w-[calc(100%-16px)]",
                "transition-colors duration-150",
                "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50",
                isCollapsed && "justify-center mx-1 px-2 w-[calc(100%-8px)]"
              )}
              title={isCollapsed ? "How to Use" : undefined}
            >
              <HelpCircle className="w-[18px] h-[18px] text-neutral-400 shrink-0" />
              {!isCollapsed && <span>How to Use</span>}
            </button>
          </div>
        </nav>

        {/* Footer - Powered by */}
        <div className="p-3 border-t border-neutral-100">
          {!isCollapsed ? (
            <div className="px-2 py-1">
              <p className="text-[10px] text-neutral-400 mb-1">Powered by</p>
              <Image 
                src="/assets/ElevenLabs_logo.png" 
                alt="ElevenLabs" 
                width={60} 
                height={12}
                className="h-3 w-auto opacity-60"
              />
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <Image 
                src="/assets/elevenlabs-symbol.svg" 
                alt="ElevenLabs" 
                width={16} 
                height={16}
                className="opacity-50"
              />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {children}
      </main>

      {/* Application Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowGuide(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Application Guide</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">How to use the Health Support Agent</p>
                </div>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* What is this */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-1.5">What is this?</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  A demonstration of an AI-powered customer service agent for health e-commerce, 
                  showcasing transparent decision-making, compliance boundaries, and identity verification.
                </p>
              </div>

              {/* Test Scenarios */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-3">Test Scenarios</h3>
                <div className="space-y-2.5">
                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Package className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm font-medium text-neutral-700">Order Inquiry</span>
                    </div>
                    <code className="text-xs bg-white border border-neutral-200 px-2 py-1 rounded block text-neutral-600">
                      &quot;Can you check on order 7823 for me?&quot;
                    </code>
                    <p className="text-xs text-neutral-400 mt-1.5">
                      Verify: DOB <strong>15th March 1985</strong> or postcode <strong>SW1A 1AA</strong>
                    </p>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-neutral-700">Compliance Test</span>
                    </div>
                    <code className="text-xs bg-white border border-neutral-200 px-2 py-1 rounded block text-neutral-600">
                      &quot;What are the side effects of this medication?&quot;
                    </code>
                    <p className="text-xs text-neutral-400 mt-1.5">
                      Watch the agent escalate to a clinician
                    </p>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Zap className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-neutral-700">Refill Request</span>
                    </div>
                    <code className="text-xs bg-white border border-neutral-200 px-2 py-1 rounded block text-neutral-600">
                      &quot;I need to refill my prescription&quot;
                    </code>
                    <p className="text-xs text-neutral-400 mt-1.5">
                      Verify with last 4 card digits: <strong>4532</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Understanding the UI */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-3">Understanding the UI</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-neutral-700">Live Transcript</span>
                      <p className="text-neutral-500 text-xs">Real-time conversation with the agent</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Bot className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-neutral-700">Agent Reasoning</span>
                      <p className="text-neutral-500 text-xs">Transparent view of decision-making and compliance checks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-neutral-700">Call Logs</span>
                      <p className="text-neutral-500 text-xs">Review past sessions and audit trails</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50">
              <Button 
                onClick={() => setShowGuide(false)} 
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
