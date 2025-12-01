'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, MessageSquare, Database, Mail, Bell } from 'lucide-react'
import { memo } from 'react'

export const ActionsPanel = memo(function ActionsPanel({ actions }: { actions: Record<string, any>[] }) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'email':
        return <Mail className="w-4 h-4 text-purple-500" />
      case 'crm_update':
        return <Database className="w-4 h-4 text-green-500" />
      case 'notification':
        return <Bell className="w-4 h-4 text-yellow-500" />
      default:
        return <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <Card className="animate-slide-up shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          📱 Actions Triggered
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
          >
            <div className="flex-shrink-0">
              {getActionIcon(action.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {action.description}
              </p>
              {action.message && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {action.message}
                </p>
              )}
            </div>
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
})
