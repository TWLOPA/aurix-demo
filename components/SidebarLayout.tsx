'use client'

import { useState } from 'react'
import { Brain, FileText, ChevronRight, HelpCircle, X, MessageSquare, Shield, Zap, Package } from 'lucide-react'
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
    }
  ]

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-neutral-200 bg-white flex flex-col">
        {/* Hims Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-100">
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

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = item.matches.includes(pathname)
            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all group",
                  isActive 
                    ? "bg-neutral-100 text-neutral-900 font-medium" 
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-neutral-900" : "text-neutral-400 group-hover:text-neutral-600"
                )} />
                <div className="flex-1">
                  <span className="block">{item.title}</span>
                  {isActive && (
                    <span className="text-xs text-neutral-500 font-normal">{item.description}</span>
                  )}
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                )}
              </Link>
            )
          })}

          {/* Guide Button */}
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all group text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 w-full"
          >
            <HelpCircle className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600" />
            <span>How to Use</span>
          </button>
        </nav>

        {/* Footer - Powered by */}
        <div className="p-4 border-t border-neutral-100">
          <div className="px-3 py-2">
            <p className="text-xs text-neutral-400 mb-2">Powered by</p>
            <Image 
              src="/assets/ElevenLabs_logo.png" 
              alt="ElevenLabs" 
              width={120} 
              height={24}
              className="h-6 w-auto"
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-neutral-50">
        {children}
      </main>

      {/* Application Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowGuide(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Application Guide</h2>
                    <p className="text-sm text-white/60">How to use the Health Support Agent</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* What is this */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">What is this?</h3>
                <p className="text-sm text-neutral-600">
                  This is a demonstration of an AI-powered customer service agent for health e-commerce. 
                  It showcases transparent decision-making, compliance boundaries, and identity verification 
                  for sensitive health data (HIPAA/GDPR).
                </p>
              </div>

              {/* Test Scenarios */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Test Scenarios</h3>
                <div className="space-y-3">
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">Order Inquiry</span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">Ask about an order status:</p>
                    <code className="text-xs bg-neutral-100 px-2 py-1 rounded block">
                      &quot;Can you check on order 7823 for me?&quot;
                    </code>
                    <p className="text-xs text-neutral-500 mt-2">
                      Verify with DOB: <strong>15th March 1985</strong> or postcode: <strong>SW1A 1AA</strong>
                    </p>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-sm">Compliance Test</span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">Ask a medical question:</p>
                    <code className="text-xs bg-neutral-100 px-2 py-1 rounded block">
                      &quot;What are the side effects of this medication?&quot;
                    </code>
                    <p className="text-xs text-neutral-500 mt-2">
                      Watch the agent escalate to a clinician
                    </p>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-sm">Refill Request</span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">Request a prescription refill:</p>
                    <code className="text-xs bg-neutral-100 px-2 py-1 rounded block">
                      &quot;I need to refill my prescription&quot;
                    </code>
                    <p className="text-xs text-neutral-500 mt-2">
                      Verify with last 4 card digits: <strong>4532</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Understanding the UI */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Understanding the UI</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 text-neutral-400 mt-0.5" />
                    <div>
                      <span className="font-medium">Live Transcript</span>
                      <p className="text-neutral-500">Shows the real-time conversation between you and the agent</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Brain className="w-4 h-4 text-neutral-400 mt-0.5" />
                    <div>
                      <span className="font-medium">Agent Reasoning</span>
                      <p className="text-neutral-500">Transparent view of the agent&apos;s decision-making process, database queries, and compliance checks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-neutral-400 mt-0.5" />
                    <div>
                      <span className="font-medium">Call Logs</span>
                      <p className="text-neutral-500">Review past sessions and their complete audit trails</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
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
