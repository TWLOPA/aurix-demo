'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  collapse: () => void
  expand: () => void
  showGuide: boolean
  setShowGuide: (show: boolean) => void
  openGuide: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Sidebar is permanently collapsed
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [showGuide, setShowGuide] = useState(false)

  const collapse = useCallback(() => setIsCollapsed(true), [])
  const expand = useCallback(() => setIsCollapsed(false), [])
  const openGuide = useCallback(() => setShowGuide(true), [])

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, collapse, expand, showGuide, setShowGuide, openGuide }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

