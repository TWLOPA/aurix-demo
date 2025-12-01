'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, MessageSquare, Database, Mail, Bell } from 'lucide-react'
import { memo } from 'react'

export const ActionsPanel = memo(function ActionsPanel({ actions }: { actions: Record<string, any>[] }) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <MessageSquare className="w-4 h-4 text-blue-400" />
      case 'email':
        return <Mail className="w-4 h-4 text-purple-400" />
      case 'crm_update':
        return <Database className="w-4 h-4 text-green-400" />
      case 'notification':
        return <Bell className="w-4 h-4 text-yellow-400" />
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700 animate-slide-up">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-slate-200">
          📱 Actions Triggered
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-700/50"
          >
            <div className="flex-shrink-0">
              {getActionIcon(action.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-300">
                {action.description}
              </p>
              {action.message && (
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {action.message}
                </p>
              )}
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
})

