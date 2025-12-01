'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Zap } from 'lucide-react'
import { memo } from 'react'

export const DatabasePanel = memo(function DatabasePanel({ 
  query, 
  results 
}: { 
  query?: Record<string, any>
  results?: Record<string, any>
}) {
  return (
    <Card className="animate-slide-up shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          🔍 Database Query
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SQL Query */}
        {query && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <Database className="w-3 h-3" />
              <span>SQL Query</span>
            </div>
            <pre className="text-xs font-mono bg-muted p-3 rounded-lg text-foreground overflow-x-auto border border-border">
              {query.sql}
            </pre>
          </div>
        )}

        {/* Query Results */}
        {results && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
              <Zap className="w-3 h-3" />
              <span>Query executed successfully</span>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg border border-border">
              <div className="space-y-2">
                {Object.entries(results).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
