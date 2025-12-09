'use client'

import { Brain, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname()
  
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
          <Link href="/" className="flex items-center gap-3">
            {/* Hims Logo - Stylized */}
            <div className="flex items-center">
              <span className="text-2xl font-bold tracking-tight text-neutral-900">hims</span>
              <span className="text-2xl font-light text-neutral-400">&</span>
              <span className="text-2xl font-bold tracking-tight text-neutral-900">hers</span>
            </div>
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
        </nav>

        {/* Footer - Powered by */}
        <div className="p-4 border-t border-neutral-100">
          <div className="px-3 py-2">
            <p className="text-xs text-neutral-400 mb-2">Powered by</p>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-neutral-900 text-white flex items-center justify-center">
                <span className="text-[10px] font-bold">11</span>
              </div>
              <span className="text-sm font-medium text-neutral-600">ElevenLabs</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-neutral-50">
        {children}
      </main>
    </div>
  )
}
