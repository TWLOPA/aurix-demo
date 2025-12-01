'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { CallEvent } from '@/types'

export function useCallEvents(callSid: string | null) {
  const [events, setEvents] = useState<CallEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!callSid) {
      setEvents([])
      setLoading(false)
      return
    }

    // Fetch existing events
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('call_events')
        .select('*')
        .eq('call_sid', callSid)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setEvents(data as CallEvent[])
      }
      setLoading(false)
    }

    fetchEvents()

    // Subscribe to new events
    const channel = supabase
      .channel(`call_events:${callSid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_events',
          filter: `call_sid=eq.${callSid}`
        },
        (payload) => {
          setEvents(prev => [...prev, payload.new as CallEvent])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [callSid])

  return { events, loading }
}

