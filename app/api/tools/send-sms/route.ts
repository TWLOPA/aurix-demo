import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN
const TWILIO_NUMBER = process.env.TWILIO_PHONE_NUMBER

export async function POST(request: Request) {
  console.log('[Send SMS] ========================================')
  console.log('[Send SMS] SMS send request received')
  
  try {
    const { 
      recipient_phone,
      message_type,
      order_id,
      tracking_number,
      call_sid
    } = await request.json()

    console.log(`[Send SMS] Sending to REAL number: ${recipient_phone}`)
    console.log(`[Send SMS] Message type: ${message_type}`)
    console.log(`[Send SMS] Order ID: ${order_id}`)

    // Build message based on type
    let message = ''
    
    if (message_type === 'tracking') {
      message = `AURIX Demo: Your order ${order_id} is on its way! Track it here: https://track.demo/${tracking_number}`
    } else if (message_type === 'verification') {
      message = `AURIX Demo: Your verification code is: 123456`
    } else if (message_type === 'payment_link') {
      message = `AURIX Demo: Update your payment method securely: https://pay.demo/update`
    } else {
      message = `AURIX Demo: This is a demonstration SMS from your customer service agent.`
    }

    // Check if Twilio is configured
    if (!TWILIO_SID || !TWILIO_AUTH || !TWILIO_NUMBER) {
      console.log('[Send SMS] Twilio not configured - simulating SMS send')
      
      // Log to Supabase anyway for demo purposes
      if (supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        await supabase.from('call_events').insert({
          call_sid: call_sid || 'DEMO_SESSION_ID',
          event_type: 'sms_sent',
          event_data: {
            recipient: recipient_phone,
            message_type,
            message_preview: message.substring(0, 50) + '...',
            status: 'simulated',
            note: 'Twilio not configured - SMS simulated'
          }
        })
      }
      
      return NextResponse.json({
        success: true,
        message_sid: 'SIM_' + Date.now(),
        simulated: true
      })
    }

    // Send real SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
    
    const formData = new URLSearchParams({
      To: recipient_phone,
      From: TWILIO_NUMBER,
      Body: message
    })

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })

    const twilioResponse = await response.json()

    if (!response.ok) {
      console.error('[Send SMS] Twilio error:', twilioResponse)
      return NextResponse.json({
        success: false,
        error: 'Failed to send SMS'
      }, { status: 500 })
    }

    console.log('[Send SMS] SMS sent successfully:', twilioResponse.sid)

    // Log to Supabase
    if (supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      await supabase.from('call_events').insert({
        call_sid: call_sid || 'DEMO_SESSION_ID',
        event_type: 'sms_sent',
        event_data: {
          recipient: recipient_phone,
          message_type,
          twilio_sid: twilioResponse.sid,
          status: 'delivered'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message_sid: twilioResponse.sid
    })
  } catch (error) {
    console.error('[Send SMS] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send SMS'
    }, { status: 500 })
  }
}

