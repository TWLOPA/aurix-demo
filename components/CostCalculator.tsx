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
      className="rounded-2xl border border-neutral-200/80 overflow-hidden transition-all duration-300 ease-in-out shadow-sm"
      style={{
        background: 'radial-gradient(ellipse at top, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-neutral-800" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-sm text-azure block">
              Cost Comparison
            </span>
            {isActive && (
              <span className="text-[10px] text-neutral-500">
                {formatTime(seconds)} elapsed
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <Badge className="text-[10px] px-2 py-0.5 bg-emerald-500 text-white border-0">
              Live
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
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
              <div className="w-2 h-2 rounded-full bg-azure" />
              <span className="text-sm text-neutral-600">AI Agent</span>
            </div>
            <span className="font-medium text-sm text-azure">
              {formatCost(aiCost)}
            </span>
          </div>

          {/* Human Cost */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neutral-400" />
              <span className="text-sm text-neutral-600">Human Agent</span>
            </div>
            <span className="font-medium text-sm text-neutral-500">
              {formatCost(humanCost)}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-200" />

          {/* Savings */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-neutral-900">Savings</span>
            <div className="text-right">
              <div 
                className="font-semibold text-lg"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #EC4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {formatCost(savings)}
              </div>
              <div className="text-[10px] text-neutral-400">
                {savingsPercent.toFixed(0)}% cheaper
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-[10px] text-neutral-400 pt-2 border-t border-neutral-100">
            $0.08/min AI vs $0.50/min human
          </p>
        </div>
      </div>
    </Card>
  )
}
