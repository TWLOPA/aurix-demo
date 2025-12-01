'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, User, Package } from 'lucide-react'
import Link from 'next/link'
import type { CallLog } from '@/types'

export default function CRMPage() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCallLogs()
  }, [])

  async function fetchCallLogs() {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && data) {
      setCallLogs(data as CallLog[])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Customer Interaction Log
            </h1>
            <p className="text-slate-400 mt-1">
              All voice AI interactions tracked in real-time
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Demo
          </Link>
        </div>

        {/* Call Logs */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Loading interactions...</p>
          </div>
        ) : callLogs.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">
                No interactions yet. Start a demo call to see data here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {callLogs.map((log) => (
              <CallLogCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CallLogCard({ log }: { log: CallLog }) {
  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg text-white">
              Interaction #{log.call_sid.slice(-8)}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {log.customer_name || 'Unknown'}
              </div>
              {log.order_number && (
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  Order #{log.order_number}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {log.call_duration}s
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              Resolved
            </Badge>
            {log.sentiment && (
              <Badge variant="outline">
                {log.sentiment}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transcript */}
        {log.transcript && log.transcript.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-300">Transcript:</h4>
            <div className="bg-slate-950 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
              {log.transcript.map((msg, i) => (
                <div key={i} className="text-sm">
                  <span className={msg.role === 'user' ? 'text-blue-400' : 'text-purple-400'}>
                    {msg.role === 'user' ? '👤 Customer' : '🤖 Agent'}:
                  </span>
                  <span className="text-slate-300 ml-2">{msg.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution */}
        {log.resolution && (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-300">Resolution:</h4>
            <p className="text-sm text-slate-400">{log.resolution}</p>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
          {new Date(log.created_at).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}

