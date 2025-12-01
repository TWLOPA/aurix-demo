'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { memo } from 'react'

export const ThinkingPanel = memo(function ThinkingPanel({ data }: { data: Record<string, any> }) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20'
      case 'neutral': return 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20'
      case 'concerned': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20'
      case 'angry': return 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <Card className="animate-slide-up shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          🧠 Intent Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.order_number && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Order Number</span>
            </div>
            <span className="font-mono font-medium">#{data.order_number}</span>
          </div>
        )}
        {data.customer_name && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Customer</span>
            </div>
            <span className="font-medium">{data.customer_name}</span>
          </div>
        )}
        {data.issue_type && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span>Issue Type</span>
            </div>
            <span className="capitalize font-medium">
              {data.issue_type.replace('_', ' ')}
            </span>
          </div>
        )}
        {data.expected_date && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Expected Date</span>
            </div>
            <span className="font-medium">{data.expected_date}</span>
          </div>
        )}
        {data.sentiment && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Sentiment</span>
            <Badge variant="outline" className={getSentimentColor(data.sentiment)}>
              {data.sentiment}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
