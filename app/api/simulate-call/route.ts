import { NextResponse } from 'next/server'
import { insertCallEvent } from '@/lib/supabase/queries'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(request: Request) {
  try {
    const { callSid } = await request.json()

    if (!callSid) {
      return NextResponse.json(
        { error: 'Missing callSid' },
        { status: 400 }
      )
    }

    // Run simulation in background (don't await)
    simulateCallSequence(callSid).catch(console.error)

    return NextResponse.json({ success: true, callSid })
  } catch (error) {
    console.error('Error starting simulation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function simulateCallSequence(callSid: string) {
  // Call started
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'call_started',
    event_data: { timestamp: new Date().toISOString() }
  })

  await wait(1000)

  // Agent greeting
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'agent_spoke',
    event_data: { 
      text: "Hi, this is AURIX, your AI customer success assistant. How can I help you today?" 
    }
  })

  await wait(2000)

  // User speaks (first message)
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'user_spoke',
    event_data: { text: "Hi, I'm Tom and I'm calling about order 417" }
  })

  await wait(1500)

  // Agent thinking
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'agent_thinking',
    event_data: {
      order_number: '417',
      customer_name: 'Tom',
      issue_type: 'order_status',
      sentiment: 'neutral'
    }
  })

  await wait(1000)

  // Agent responds
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'agent_spoke',
    event_data: { 
      text: "Hi Tom, I understand you're calling about order 417. Let me check our records for you. Please bear with me." 
    }
  })

  await wait(2500)

  // User continues
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'user_spoke',
    event_data: { 
      text: "My parcel was due to be delivered on Tuesday, but it hasn't arrived yet." 
    }
  })

  await wait(1000)

  // Agent thinking (issue detected)
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'agent_thinking',
    event_data: {
      issue_type: 'delivery_delay',
      expected_date: 'Tuesday',
      sentiment: 'concerned'
    }
  })

  await wait(1500)

  // Database query
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'querying',
    event_data: {
      sql: "SELECT status, delivery_date, tracking_number FROM orders WHERE order_number = '417'"
    }
  })

  await wait(800)

  // Query results
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'results',
    event_data: {
      status: 'Rescheduled',
      delivery_date: '2025-01-17',
      tracking_number: 'TRK789012'
    }
  })

  await wait(1000)

  // Agent final response
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'agent_spoke',
    event_data: { 
      text: "I've checked our database. Your parcel was rescheduled due to weather and will be delivered today. I'll send you an SMS with the tracking details right now." 
    }
  })

  await wait(500)

  // Action: SMS
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'action',
    event_data: {
      type: 'sms',
      description: 'SMS sent to +44 7700 900001',
      status: 'sent',
      message: 'Order #417 rescheduled for delivery today. Track: TRK789012'
    }
  })

  await wait(300)

  // Action: CRM update
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'action',
    event_data: {
      type: 'crm_update',
      description: 'Interaction logged in CRM',
      status: 'complete'
    }
  })

  await wait(500)

  // Call ended
  await insertCallEvent({
    call_sid: callSid,
    event_type: 'call_ended',
    event_data: { 
      duration: 45,
      resolution: 'Informed customer of rescheduled delivery'
    }
  })
}

