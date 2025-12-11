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
      call_sid,
      // Additional context for richer messages
      product_name,
      delivery_date,
      order_status,
      callback_reason,
      callback_time
    } = await request.json()

    console.log(`[Send SMS] Sending to REAL number: ${recipient_phone}`)
    console.log(`[Send SMS] Message type: ${message_type}`)
    console.log(`[Send SMS] Order ID: ${order_id}`)

    // Build message based on type - with real information, no fake URLs
    let message = ''
    
    if (message_type === 'tracking') {
      // Format delivery date nicely
      const formattedDate = delivery_date 
        ? new Date(delivery_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
        : 'soon'
      
      message = `Aurix: Your order ${order_id} (${product_name || 'your medication'}) is ${order_status || 'on its way'}. Expected delivery: ${formattedDate}. Tracking: ${tracking_number}. All packages arrive in plain, discreet packaging.`
    } else if (message_type === 'callback_scheduled') {
      message = `Aurix: Your clinician callback has been scheduled. A licensed clinician will call you ${callback_time || 'within 2 hours'} to discuss: ${callback_reason || 'your inquiry'}. Please keep your phone nearby.`
    } else if (message_type === 'verification') {
      message = `Aurix: Your verification code is: 123456. Do not share this code with anyone.`
    } else if (message_type === 'payment_link') {
      message = `Aurix: To update your payment method, please log in to your account or call our support team. We never send payment links via SMS for your security.`
    } else if (message_type === 'refill_confirmation') {
      message = `Aurix: Your prescription refill for ${product_name || 'your medication'} has been processed. Order ${order_id}. Expected delivery: ${delivery_date ? new Date(delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : 'within 3-5 days'}.`
    } else {
      message = `Aurix: Thank you for contacting us. If you have any questions, our support team is here to help.`
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

