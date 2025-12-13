'use client'

import { useState } from 'react'
import { Bot, FileText, HelpCircle, X, MessageSquare, Shield, AlertTriangle, Menu, ChevronLeft, ChevronRight, Github } from 'lucide-react'
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
  const { isCollapsed, setIsCollapsed, showGuide, setShowGuide } = useSidebar()
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
          <div className={cn("h-14 flex items-center border-b border-neutral-100", isCollapsed ? "justify-center px-2" : "justify-between px-3")}>
            <Link href="/" className="flex items-center">
              <Image 
                src="/assets/AL.png" 
                alt="Aurix" 
                width={isCollapsed ? 32 : 120} 
                height={isCollapsed ? 32 : 32}
                className={isCollapsed ? "h-7 w-auto" : "h-8 w-auto"}
              />
            </Link>
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-neutral-100 transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-neutral-500" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {isCollapsed ? (
              /* Collapsed: Single flat list with even spacing */
              <div className="px-2 space-y-1">
                {navSections.flatMap(section => section.items).map((item) => {
                  const active = item.matches.includes(pathname)
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center rounded-lg transition-all duration-200 px-2 py-2.5",
                        active ? "bg-neutral-100/80 shadow-sm" : "hover:bg-neutral-50"
                      )}
                      title={item.title}
                    >
                      <item.icon
                        className={cn(
                          "w-[18px] h-[18px]",
                          active ? "text-neutral-700" : "text-neutral-500"
                        )}
                      />
                    </Link>
                  )
                })}
                <button
                  onClick={() => setShowGuide(true)}
                  className="w-full flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-neutral-50 px-2 py-2.5"
                  title="How to Use"
                >
                  <HelpCircle className="w-[18px] h-[18px] text-neutral-400" />
                </button>
                <a
                  href={githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-neutral-50 px-2 py-2.5"
                  title="Project on GitHub"
                  aria-label="Open project on GitHub"
                >
                  <Github className="w-[18px] h-[18px] text-neutral-400" />
                </a>
              </div>
            ) : (
              /* Expanded: Grouped sections */
              <>
                {navSections.map((section, sectionIndex) => (
                  <div key={section.title} className={cn(sectionIndex > 0 && "mt-4")}>
                    <div className="px-4 mb-2">
                      <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        {section.title}
                      </span>
                    </div>
                    <div className="space-y-1 px-2">
                      {section.items.map((item) => {
                        const active = item.matches.includes(pathname)
                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                              active ? "bg-neutral-100/80 shadow-sm" : "hover:bg-neutral-50"
                            )}
                            title={item.title}
                          >
                            <item.icon
                              className={cn(
                                "w-5 h-5",
                                active ? "text-neutral-700" : "text-neutral-500"
                              )}
                            />
                            <span className={cn("text-sm font-medium", active ? "text-neutral-900" : "text-neutral-600")}>
                              {item.title}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Help Section - Expanded */}
                <div className="mt-4">
                  <div className="px-2 space-y-1">
                    <button
                      onClick={() => setShowGuide(true)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-neutral-50 text-neutral-600"
                      title="How to Use"
                    >
                      <HelpCircle className="w-5 h-5 text-neutral-400 shrink-0" />
                      <span className="text-sm font-medium">How to Use</span>
                    </button>
                    <a
                      href={githubRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-neutral-50 text-neutral-600"
                      title="Project on GitHub"
                      aria-label="Open project on GitHub"
                    >
                      <Github className="w-5 h-5 text-neutral-400 shrink-0" />
                      <span className="text-sm font-medium">Project on GitHub</span>
                    </a>
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* Expand Button (when collapsed) */}
          {isCollapsed && (
            <div className="px-2 py-3 border-t border-neutral-100">
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-full flex items-center justify-center py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
          )}

          {/* Footer - Powered by ElevenLabs */}
          <div className="p-3 border-t border-neutral-100">
            {isCollapsed ? (
              <div className="flex items-center justify-center py-1">
                <Image 
                  src="/assets/elevenlabs-symbol.svg" 
                  alt="ElevenLabs" 
                  width={16} 
                  height={16}
                  className="opacity-40"
                />
              </div>
            ) : (
              <div className="flex flex-col items-start gap-1 px-1">
                <span className="text-[10px] text-neutral-400">Powered by</span>
                <Image 
                  src="/assets/ElevenLabs_logo.png" 
                  alt="ElevenLabs" 
                  width={100} 
                  height={20}
                  className="h-5 w-auto opacity-60"
                />
              </div>
            )}
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
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Welcome Video */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Welcome</h3>
                <div className="relative w-full rounded-lg overflow-hidden bg-neutral-100" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src="https://www.tella.tv/video/aurix-welcome-1-bcev/embed?b=0&title=0&a=1&loop=0&autoPlay=false&t=0&muted=0&wt=0"
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    style={{ border: 'none' }}
                  />
                </div>
              </div>

              {/* What is this */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-1.5">What is this?</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  An AI voice agent for regulated healthcare e-commerce. Watch it handle orders, 
                  enforce compliance boundaries, and escalate medical questions - all with full transparency.
                </p>
              </div>

              {/* How to Demo */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-3">How to Demo</h3>
                <div className="space-y-2.5">
                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Bot className="w-4 h-4 text-[#088395]" />
                      <span className="text-sm font-medium text-neutral-700">1. Select a Persona</span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Use the persona cards in the sidebar to see suggested phrases and expected outcomes
                    </p>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MessageSquare className="w-4 h-4 text-[#088395]" />
                      <span className="text-sm font-medium text-neutral-700">2. Start Talking</span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Click the orb to connect, then say the suggested phrase from the persona card
                    </p>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-neutral-700">3. Watch the Agent Think</span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      The right panel shows real-time reasoning, database queries, and compliance checks
                    </p>
                  </div>
                </div>
              </div>

              {/* Demo Controls */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-3">Demo Controls</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded bg-red-500/10 flex items-center justify-center mt-0.5 shrink-0">
                      <div className="w-2 h-2 rounded-sm bg-red-500" />
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Mic Mute</span>
                      <p className="text-neutral-500 text-xs">Mute your mic to narrate without the agent hearing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded bg-amber-500/10 flex items-center justify-center mt-0.5 shrink-0">
                      <div className="w-2 h-2 rounded-sm bg-amber-500" />
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Speaker Mute</span>
                      <p className="text-neutral-500 text-xs">Silence agent audio while you explain what&apos;s happening</p>
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
