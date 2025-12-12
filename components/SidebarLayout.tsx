'use client'

import { useState } from 'react'
import { Bot, FileText, HelpCircle, X, MessageSquare, Shield, Zap, Package, AlertTriangle, Menu, ChevronLeft, ChevronRight, Github } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/lib/sidebar-context'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [showGuide, setShowGuide] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const githubRepoUrl = 'https://github.com/TWLOPA/aurix-demo'
  
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
    <div className="flex h-screen w-full overflow-hidden">
      {/* Mobile Menu Button - Fixed position */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-md border border-neutral-200/60 hover:bg-neutral-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-neutral-600" />
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Slide-in Menu */}
          <aside 
            className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl animate-slide-in-left"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)'
            }}
          >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-100">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Image 
                  src="/assets/AL.png" 
                  alt="Aurix" 
                  width={80} 
                  height={24}
                  className="h-6 w-auto"
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
              {navSections.map((section, sectionIndex) => (
                <div key={section.title} className={cn(sectionIndex > 0 && "mt-4")}>
                  <div className="px-4 mb-2">
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      {section.title}
                    </span>
                  </div>
                  <div className="space-y-1 px-2">
                    {section.items.map((item) => {
                      const isActive = item.matches.includes(pathname)
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                            isActive 
                              ? "bg-neutral-100/80 shadow-sm" 
                              : "hover:bg-neutral-50"
                          )}
                        >
                          <item.icon className={cn(
                            "w-5 h-5 shrink-0",
                            isActive ? "text-neutral-700" : "text-neutral-500"
                          )} />
                          <span className={cn(
                            "text-sm font-medium",
                            isActive ? "text-neutral-900" : "text-neutral-600"
                          )}>
                            {item.title}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Help Button */}
              <div className="mt-4 px-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setShowGuide(true)
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200 text-neutral-600 hover:bg-neutral-50"
                >
                  <HelpCircle className="w-5 h-5 text-neutral-400 shrink-0" />
                  <span className="text-sm font-medium">How to Use</span>
                </button>
              </div>

            {/* GitHub Link */}
            <div className="mt-2 px-2">
              <a
                href={githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200 text-neutral-600 hover:bg-neutral-50"
              >
                <Github className="w-5 h-5 text-neutral-400 shrink-0" />
                <span className="text-sm font-medium">Project on GitHub</span>
              </a>
            </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Image 
                  src="/assets/elevenlabs-symbol.svg" 
                  alt="ElevenLabs" 
                  width={14} 
                  height={14}
                  className="opacity-50"
                />
                <span>Powered by ElevenLabs</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside 
        className={cn(
          "hidden lg:flex flex-shrink-0 flex-col relative border-r border-neutral-200/60 transition-[width] duration-200 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)'
        }}
      >
        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className={cn("h-14 flex items-center border-b border-neutral-100 relative", isCollapsed ? "justify-center px-2" : "px-3")}>
            <Link href="/" className="flex items-center">
              <Image 
                src="/assets/AL.png" 
                alt="Aurix" 
                width={isCollapsed ? 24 : 80} 
                height={24}
                className="h-6 w-auto"
              />
            </Link>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-md hover:bg-neutral-100 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-neutral-500" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {navSections.map((section, sectionIndex) => (
              <div key={section.title} className={cn(sectionIndex > 0 && "mt-4")}>
                {!isCollapsed && (
                  <div className="px-4 mb-2">
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      {section.title}
                    </span>
                  </div>
                )}
                <div className={cn("space-y-1", isCollapsed ? "px-2" : "px-2")}>
                  {section.items.map((item) => {
                    const active = item.matches.includes(pathname)
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-lg transition-all duration-200",
                          isCollapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2.5",
                          active ? "bg-neutral-100/80 shadow-sm" : "hover:bg-neutral-50"
                        )}
                        title={item.title}
                      >
                        <item.icon
                          className={cn(
                            isCollapsed ? "w-[18px] h-[18px]" : "w-5 h-5",
                            active ? "text-neutral-700" : "text-neutral-500"
                          )}
                        />
                        {!isCollapsed && (
                          <span className={cn("text-sm font-medium", active ? "text-neutral-900" : "text-neutral-600")}>
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
            <div className="mt-4">
              <div className="px-2">
                <button
                  onClick={() => setShowGuide(true)}
                  className={cn(
                    "w-full rounded-lg transition-all duration-200 hover:bg-neutral-50",
                    isCollapsed ? "flex items-center justify-center px-2 py-2" : "flex items-center gap-3 px-3 py-2.5 text-neutral-600"
                  )}
                  title="How to Use"
                >
                  <HelpCircle className={cn(isCollapsed ? "w-[18px] h-[18px]" : "w-5 h-5", "text-neutral-400 shrink-0")} />
                  {!isCollapsed && <span className="text-sm font-medium">How to Use</span>}
                </button>
              </div>
            </div>

            {/* GitHub Link (below How to Use) */}
            <div className="mt-2">
              <div className="px-2">
                <a
                  href={githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "rounded-lg transition-all duration-200 hover:bg-neutral-50",
                    isCollapsed 
                      ? "flex items-center justify-center px-2 py-2" 
                      : "flex items-center gap-3 px-3 py-2.5 text-neutral-600"
                  )}
                  title="Project on GitHub"
                  aria-label="Open project on GitHub"
                >
                  <Github className={cn(isCollapsed ? "w-[18px] h-[18px]" : "w-5 h-5", "text-neutral-400 shrink-0")} />
                  {!isCollapsed && <span className="text-sm font-medium">Project on GitHub</span>}
                </a>
              </div>
            </div>
          </nav>

          {/* Footer - Powered by ElevenLabs */}
          <div className="p-3 border-t border-neutral-100">
            <div className={cn("flex items-center", isCollapsed ? "justify-center py-1" : "gap-2 px-1")}>
              <Image 
                src="/assets/elevenlabs-symbol.svg" 
                alt="ElevenLabs" 
                width={16} 
                height={16}
                className="opacity-40"
              />
              {!isCollapsed && <span className="text-xs text-neutral-400">Powered by ElevenLabs</span>}
            </div>
          </div>
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
