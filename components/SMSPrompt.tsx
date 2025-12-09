'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Check, Info } from 'lucide-react'

// Using imported supabase client

interface SMSPromptData {
  message_type: string
  order_id?: string
  tracking_number?: string
  prompt_text: string
}

export function SMSPrompt() {
  const [promptData, setPromptData] = useState<SMSPromptData | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const channel = supabase
      .channel('sms_prompts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_events',
          filter: 'event_type=eq.sms_prompt'
        },
        (payload) => {
          console.log('[SMS Prompt] Received:', payload.new)
          const eventData = payload.new as { event_data: SMSPromptData }
          setPromptData(eventData.event_data)
          setSent(false)
          setError('')
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const handleSend = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number')
      return
    }

    const cleanPhone = phoneNumber.replace(/\s/g, '')
    if (!/^\+?[1-9]\d{7,14}$/.test(cleanPhone)) {
      setError('Please enter a valid phone number (e.g., +447123456789)')
      return
    }

    setSending(true)
    setError('')

    try {
      const response = await fetch('/api/tools/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_phone: cleanPhone,
          message_type: promptData?.message_type,
          order_id: promptData?.order_id,
          tracking_number: promptData?.tracking_number,
          call_sid: 'DEMO_SESSION_ID'
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send SMS')
      }

      setSent(true)
      setTimeout(() => {
        setPromptData(null)
        setPhoneNumber('')
      }, 3000)
    } catch (err) {
      console.error('[SMS Prompt] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send SMS')
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setPromptData(null)
    setPhoneNumber('')
    setError('')
  }

  if (!promptData) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
      />

      {/* Modal */}
      <div 
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md px-4 animate-scale-in"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <Card 
          className="p-6 bg-[rgba(26,26,46,0.98)] backdrop-blur-xl border-2 border-[#2A2A3E] rounded-2xl"
          style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}
        >
          {!sent ? (
            <>
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-xl text-white/95">
                    Receive Real SMS
                  </h3>
                  <p className="text-sm text-white/70 mt-1 leading-relaxed">
                    {promptData.prompt_text}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/50 hover:text-white/95 transition-colors duration-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-[#05B2DC]/10 border border-[#05B2DC] rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#05B2DC] mt-0.5 shrink-0" />
                  <div className="text-sm text-white/95 leading-relaxed">
                    <strong>This is a real demonstration!</strong>
                    <p className="mt-1 text-white/70">
                      The agent is sending an actual SMS to your phone. You&apos;ll receive a text message in a few seconds.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="mb-4">
                <label className="block font-medium text-sm text-white/95 mb-2">
                  Your Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+44 7123 456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={sending}
                  className={`font-mono bg-[#0F0F1A] border-2 ${error ? 'border-red-500' : 'border-[#2A2A3E]'} rounded-lg px-3 py-2.5 text-sm text-white/95 placeholder:text-white/30 w-full`}
                />
                {error && (
                  <p className="text-xs text-red-500 mt-2">{error}</p>
                )}
                <p className="text-xs text-white/50 mt-2">
                  Include country code (e.g., +44 for UK, +1 for US)
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={sending}
                  className="flex-1 border-[#2A2A3E] text-white/70 hover:text-white hover:bg-white/5"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sending || !phoneNumber}
                  className="flex-1 bg-[#05B2DC] hover:bg-[#05B2DC]/80 text-white"
                >
                  {sending ? 'Sending...' : 'Send SMS'}
                </Button>
              </div>
            </>
          ) : (
            // Success State
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#05B2DC] flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-xl text-white/95 mb-2">
                SMS Sent!
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Check your phone - you should receive the text message in a few seconds.
              </p>
              <Badge 
                variant="outline"
                className="mt-4 border-[#2A2A3E] text-white/70"
              >
                Real SMS delivered via Twilio
              </Badge>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

