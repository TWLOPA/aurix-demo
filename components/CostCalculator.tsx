'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, DollarSign } from 'lucide-react'

interface CostCalculatorProps {
  isActive?: boolean
}

export function CostCalculator({ isActive = false }: CostCalculatorProps) {
  const [seconds, setSeconds] = useState(0)
  const [isExpanded, setIsExpanded] = useState(true)

  const AI_COST_PER_SECOND = 0.08 / 60
  const HUMAN_COST_PER_SECOND = 0.50 / 60

  useEffect(() => {
    if (!isActive) {
      setSeconds(0)
      return
    }

    const interval = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive])

  const aiCost = seconds * AI_COST_PER_SECOND
  const humanCost = seconds * HUMAN_COST_PER_SECOND
  const savings = humanCost - aiCost
  const savingsPercent = humanCost > 0 ? ((savings / humanCost) * 100) : 0

  const formatCost = (cost: number) => `$${cost.toFixed(3)}`
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
  }

  return (
    <Card 
      className="rounded-2xl border-2 border-white/10 overflow-hidden transition-all duration-300 ease-in-out"
      style={{
        background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Header - Always visible, clickable to toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5 text-white/90" />
          </div>
          <span className="font-semibold text-sm text-white/95">
            Cost Comparison
          </span>
          {isActive && (
            <Badge className="text-[10px] px-1.5 py-0.5 bg-[#05B2DC] text-white border-0 animate-pulse">
              Live
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="text-xs font-mono text-white/70">
              {formatTime(seconds)}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-white/70" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/70" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-3">
          {/* AI Cost */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#05B2DC]" />
              <span className="text-sm text-white/70">AI Agent</span>
            </div>
            <span className="font-mono font-semibold text-sm text-[#05B2DC]">
              {formatCost(aiCost)}
            </span>
          </div>

          {/* Human Cost */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-sm text-white/70">Human Agent</span>
            </div>
            <span className="font-mono font-semibold text-sm text-[#F59E0B]">
              {formatCost(humanCost)}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/20" />

          {/* Savings */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-white/95">Savings</span>
            <div className="text-right">
              <div className="font-mono font-bold text-base text-[#7DD3FC]">
                {formatCost(savings)}
              </div>
              <div className="text-[10px] text-white/50">
                ({savingsPercent.toFixed(0)}% cheaper)
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-[10px] leading-relaxed text-white/50">
              $0.08/min AI vs $0.50/min human
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
