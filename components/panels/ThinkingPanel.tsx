'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { memo } from 'react'

export const ThinkingPanel = memo(function ThinkingPanel({ data }: { data: any }) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'neutral': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'concerned': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'angry': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700 animate-slide-up">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-slate-200">
          🧠 Intent Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.order_number && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-slate-400">Order Number:</span>
            <span className="text-slate-100 font-semibold">#{data.order_number}</span>
          </div>
        )}
        {data.customer_name && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-slate-400">Customer:</span>
            <span className="text-slate-100 font-semibold">{data.customer_name}</span>
          </div>
        )}
        {data.issue_type && (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <span className="text-slate-400">Issue Type:</span>
            <span className="text-slate-100 font-semibold capitalize">
              {data.issue_type.replace('_', ' ')}
            </span>
          </div>
        )}
        {data.expected_date && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-slate-400">Expected Date:</span>
            <span className="text-slate-100 font-semibold">{data.expected_date}</span>
          </div>
        )}
        {data.sentiment && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Sentiment:</span>
            <Badge variant="outline" className={getSentimentColor(data.sentiment)}>
              {data.sentiment}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

