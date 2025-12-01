'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Zap } from 'lucide-react'
import { memo } from 'react'

export const DatabasePanel = memo(function DatabasePanel({ 
  query, 
  results 
}: { 
  query?: any
  results?: any 
}) {
  return (
    <Card className="bg-slate-800 border-slate-700 animate-slide-up">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-slate-200">
          🔍 Database Query
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SQL Query */}
        {query && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                SQL Query
              </span>
            </div>
            <pre className="text-xs font-mono bg-slate-900 p-3 rounded-lg text-blue-300 overflow-x-auto border border-slate-700">
              {query.sql}
            </pre>
          </div>
        )}

        {/* Query Results */}
        {results && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-semibold">
                Query executed successfully
              </span>
            </div>
            
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <div className="space-y-2">
                {Object.entries(results).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 capitalize">
                      {key.replace('_', ' ')}:
                    </span>
                    <span className="text-slate-100 font-semibold font-mono">
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

