'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X, Check, MessageSquare, Send } from 'lucide-react'

interface SMSPromptData {
  message_type: string
  order_id?: string
  tracking_number?: string
  prompt_text: string
}

export function SMSPrompt() {
  const [promptData, setPromptData] = useState<SMSPromptData | null>(null)
  const [isVisible, setIsVisible] = useState(false) // Controls actual visibility
  const [phoneNumber, setPhoneNumber] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const pendingPromptRef = useRef<SMSPromptData | null>(null) // Store pending prompt until agent finishes speaking about SMS
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const speechPauseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const agentMentionedSMSRef = useRef(false)

  useEffect(() => {
    const channel = supabase
      .channel('sms_prompts_and_speech')
      // Listen for SMS prompt events - store but don't show yet
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_events',
          filter: 'event_type=eq.sms_prompt'
        },
        (payload) => {
          console.log('[SMS Prompt] Received - waiting for agent to finish speaking about SMS...')
          const eventData = payload.new as { event_data: SMSPromptData }
          pendingPromptRef.current = eventData.event_data
          agentMentionedSMSRef.current = false
          setSent(false)
          setError('')
          
          // Fallback: if agent doesn't mention SMS within 15s, show anyway
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          timeoutRef.current = setTimeout(() => {
            if (pendingPromptRef.current && !isVisible) {
              console.log('[SMS Prompt] Fallback timeout - showing modal')
              setPromptData(pendingPromptRef.current)
              setIsVisible(true)
              pendingPromptRef.current = null
            }
          }, 15000)
        }
      )
      // Listen for agent speech - detect when they mention SMS, then wait for speech to stop
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_events',
          filter: 'event_type=eq.agent_spoke'
        },
        (payload) => {
          const eventData = payload.new as { event_data: { text: string } }
          const spokenText = eventData.event_data?.text?.toLowerCase() || ''
          
          // Check if agent mentioned SMS-related keywords
          const smsKeywords = ['text', 'sms', 'message', 'send you', 'tracking link', 'phone']
          const mentionedSMS = smsKeywords.some(keyword => spokenText.includes(keyword))
          
          if (mentionedSMS && pendingPromptRef.current) {
            console.log('[SMS Prompt] Agent mentioned SMS - waiting for speech to finish...')
            agentMentionedSMSRef.current = true
          }
          
          // If agent has mentioned SMS, reset the "speech finished" timer on each new speech
          // This way we wait for a pause in speech
          if (agentMentionedSMSRef.current && pendingPromptRef.current && !isVisible) {
            if (speechPauseTimerRef.current) clearTimeout(speechPauseTimerRef.current)
            
            // Wait 3 seconds after last speech to consider "finished speaking"
            speechPauseTimerRef.current = setTimeout(() => {
              if (pendingPromptRef.current && agentMentionedSMSRef.current) {
                console.log('[SMS Prompt] Agent finished speaking about SMS - showing modal')
                setPromptData(pendingPromptRef.current)
                setIsVisible(true)
                pendingPromptRef.current = null
                agentMentionedSMSRef.current = false
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
              }
            }, 3000)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (speechPauseTimerRef.current) clearTimeout(speechPauseTimerRef.current)
    }
  }, [isVisible])

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
    setIsVisible(false)
    // Clear data after animation
    setTimeout(() => {
      setPromptData(null)
      setPhoneNumber('')
      setError('')
    }, 300)
  }

  const glassyCardStyle = {
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.7)'
  }

  if (!promptData || !isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - Blue gradient like the app */}
      <div 
        className="absolute inset-0 animate-fade-in"
        style={{
          background: 'linear-gradient(180deg, rgba(232, 244, 252, 0.95) 0%, rgba(212, 234, 247, 0.95) 50%, rgba(199, 226, 244, 0.95) 100%)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={handleClose}
      />

      {/* Modal - Glassy */}
      <div 
        className="relative rounded-2xl overflow-hidden max-w-md w-full mx-4 animate-scale-in"
        style={glassyCardStyle}
      >
        {!sent ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-neutral-900">
                    Receive Real SMS
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Demo feature powered by Twilio
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Info Box */}
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3">
                <p className="text-sm text-blue-800 leading-relaxed">
                  <strong>This is real!</strong> Enter your phone number to receive an actual SMS with your tracking information.
                </p>
              </div>

              {/* Input */}
              <div>
                <label className="block font-medium text-sm text-neutral-700 mb-2">
                  Your Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+44 7123 456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={sending}
                  className={`font-mono bg-white/60 ${error ? 'border-red-400' : 'border-white/60'} rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50`}
                />
                {error && (
                  <p className="text-xs text-red-500 mt-2">{error}</p>
                )}
                <p className="text-xs text-neutral-400 mt-2">
                  Include country code (e.g., +44 for UK, +1 for US)
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/40 flex items-center gap-2">
              <button
                onClick={handleClose}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 bg-white/60 hover:bg-white/80 transition-colors border border-white/60"
              >
                Skip
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !phoneNumber}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send SMS'}
              </button>
            </div>
          </>
        ) : (
          // Success State
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg text-neutral-900 mb-2">
              SMS Sent!
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">
              Check your phone - you should receive the text message in a few seconds.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-xs text-blue-600">
              <MessageSquare className="w-3 h-3" />
              Delivered via Twilio
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

