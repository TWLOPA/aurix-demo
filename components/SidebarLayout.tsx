'use client'

import { useState } from 'react'
import { Brain, FileText, ChevronRight, HelpCircle, X, MessageSquare, Shield, Zap, Package, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname()
  const [showGuide, setShowGuide] = useState(false)
  
  const navItems = [
    {
      title: 'Agent',
      icon: Brain,
      href: '/',
      matches: ['/'],
      description: 'Live conversation'
    },
    {
      title: 'Call Logs',
      icon: FileText,
      href: '/logs',
      matches: ['/logs'],
      description: 'Session history'
    },
    {
      title: 'Escalations',
      icon: AlertTriangle,
      href: '/escalations',
      matches: ['/escalations'],
      description: 'Clinician reviews'
    }
  ]

  return (
    <div className="flex h-screen w-full bg-cloud overflow-hidden">
      {/* Left Sidebar - 256px width */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-white flex flex-col">
        {/* Logo Area - 64px height */}
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <Link href="/" className="flex items-center">
            <Image 
              src="/assets/hims-brand-logo.png" 
              alt="Hims & Hers" 
              width={140} 
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Navigation - 24px padding, 4px gap */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = item.matches.includes(pathname)
            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm",
                  "transition-all duration-200 ease-in-out group",
                  isActive 
                    ? "bg-mist text-shadow-blue font-medium" 
                    : "text-muted-foreground hover:text-shadow-blue hover:bg-mist/50"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors duration-200",
                  isActive ? "text-azure" : "text-muted-foreground group-hover:text-azure"
                )} />
                <div className="flex-1">
                  <span className="block">{item.title}</span>
                  {isActive && (
                    <span className="text-xs text-muted-foreground font-normal">{item.description}</span>
                  )}
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </Link>
            )
          })}

          {/* Guide Button */}
          <button
            onClick={() => setShowGuide(true)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm w-full",
              "transition-all duration-200 ease-in-out group",
              "text-muted-foreground hover:text-shadow-blue hover:bg-mist/50"
            )}
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground group-hover:text-azure transition-colors duration-200" />
            <span>How to Use</span>
          </button>
        </nav>

        {/* Footer - Powered by */}
        <div className="p-4 border-t border-border/50">
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground mb-2">Powered by</p>
            <Image 
              src="/assets/ElevenLabs_logo.png" 
              alt="ElevenLabs" 
              width={120} 
              height={24}
              className="h-6 w-auto opacity-80"
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-cloud">
        {children}
      </main>

      {/* Application Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-shadow-blue/50 backdrop-blur-sm"
            onClick={() => setShowGuide(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="gradient-deep-dive text-white px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Application Guide</h2>
                    <p className="text-sm text-white/70">How to use the Health Support Agent</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* What is this */}
              <div>
                <h3 className="font-semibold text-shadow-blue mb-2">What is this?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This is a demonstration of an AI-powered customer service agent for health e-commerce. 
                  It showcases transparent decision-making, compliance boundaries, and identity verification 
                  for sensitive health data (HIPAA/GDPR).
                </p>
              </div>

              {/* Test Scenarios */}
              <div>
                <h3 className="font-semibold text-shadow-blue mb-4">Test Scenarios</h3>
                <div className="space-y-3">
                  <div className="bg-mist rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-azure" />
                      <span className="font-medium text-sm">Order Inquiry</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Ask about an order status:</p>
                    <code className="text-xs bg-white border border-border px-2 py-1 rounded block font-mono">
                      &quot;Can you check on order 7823 for me?&quot;
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Verify with DOB: <strong>15th March 1985</strong> or postcode: <strong>SW1A 1AA</strong>
                    </p>
                  </div>

                  <div className="bg-mist rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-warning" />
                      <span className="font-medium text-sm">Compliance Test</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Ask a medical question:</p>
                    <code className="text-xs bg-white border border-border px-2 py-1 rounded block font-mono">
                      &quot;What are the side effects of this medication?&quot;
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Watch the agent escalate to a clinician
                    </p>
                  </div>

                  <div className="bg-mist rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-success" />
                      <span className="font-medium text-sm">Refill Request</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Request a prescription refill:</p>
                    <code className="text-xs bg-white border border-border px-2 py-1 rounded block font-mono">
                      &quot;I need to refill my prescription&quot;
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Verify with last 4 card digits: <strong>4532</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Understanding the UI */}
              <div>
                <h3 className="font-semibold text-shadow-blue mb-4">Understanding the UI</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium text-shadow-blue">Live Transcript</span>
                      <p className="text-muted-foreground">Shows the real-time conversation between you and the agent</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Brain className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium text-shadow-blue">Agent Reasoning</span>
                      <p className="text-muted-foreground">Transparent view of the agent&apos;s decision-making process, database queries, and compliance checks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium text-shadow-blue">Call Logs</span>
                      <p className="text-muted-foreground">Review past sessions and their complete audit trails</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-mist">
              <Button onClick={() => setShowGuide(false)} className="w-full">
                Got it, let&apos;s start
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
