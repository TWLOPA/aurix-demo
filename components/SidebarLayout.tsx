'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Brain, Activity, Settings, Phone, FileText, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname()
  
  // Define navigation items based on "Head of Design" guidelines
  // Icons must visually map to mental models:
  // Agents → brain / message pattern
  // Voices → wave / audio glyph (using Activity for now as closest proxy)
  // Integrations → plug glyph (using Settings for now)
  const navItems = [
    {
      title: 'Agents',
      icon: Brain,
      href: '/',
      matches: ['/']
    },
    {
      title: 'Call Logs',
      icon: FileText, // Represents logs/records
      href: '/crm',
      matches: ['/crm']
    },
    {
      title: 'Voices',
      icon: Activity, // Waveform proxy
      href: '#',
      matches: []
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '#',
      matches: []
    }
  ]

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Left Sidebar - ~256px width (w-64) */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-muted/10 flex flex-col">
        {/* Header / Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center">
              <span className="text-xs font-bold">11</span>
            </div>
            <span>ElevenLabs</span>
          </div>
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
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group",
                  isActive 
                    ? "bg-accent text-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {item.title}
              </Link>
            )
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              TW
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Thomas Walsh</p>
              <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {children}
      </main>
    </div>
  )
}

