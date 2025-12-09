'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface CostCalculatorProps {
  isActive?: boolean
}

export function CostCalculator({ isActive = false }: CostCalculatorProps) {
  const [seconds, setSeconds] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

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

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[280px]">
      <Card 
        className="p-4 border-2 bg-[rgba(26,26,46,0.95)] backdrop-blur-xl border-[#2A2A3E] rounded-2xl"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2 text-sm text-white/95">
              Cost Comparison
              {isActive && (
                <Badge 
                  className="text-xs bg-[#05B2DC] text-white animate-pulse"
                >
                  Live
                </Badge>
              )}
            </h3>
            {isActive && (
              <p className="mt-1 text-xs text-white/50">
                Duration: {formatTime(seconds)}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/50 hover:text-white/95 transition-colors duration-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cost Items */}
        <div className="space-y-3">
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
          <div className="h-px bg-[#2A2A3E] my-2" />

          {/* Savings */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-white/95">Savings</span>
            <div className="text-right">
              <div className="font-mono font-bold text-base text-[#7DD3FC]">
                {formatCost(savings)}
              </div>
              <div className="text-xs text-white/50">
                ({savingsPercent.toFixed(0)}% cheaper)
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-[#2A2A3E]">
          <p className="text-[11px] leading-relaxed text-white/50">
            Based on ElevenLabs pricing: $0.08/min for AI vs $30/hr ($0.50/min) for human agents
          </p>
        </div>
      </Card>
    </div>
  )
}

