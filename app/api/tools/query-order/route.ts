import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  // Create Supabase client inside handler - support both env var names
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey!
  )

  try {
    const { order_number, customer_name, call_sid } = await request.json()
    // Use a fixed Demo ID if no specific call_sid is provided (common in Webhook calls)
    const callSid = call_sid || 'DEMO_SESSION_ID'

    console.log(`[Query Order] Processing order ${order_number} for ${customer_name}`)
    console.log(`[Query Order] Using callSid: ${callSid}`)

    // 1. Log Agent Thinking (UI Update)
    await supabase.from('call_events').insert({
      call_sid: callSid,
      event_type: 'agent_thinking',
      event_data: {
        order_number,
        customer_name: customer_name || 'Customer',
        issue_type: 'order_status'
      }
    })
    console.log('[Query Order] Inserted agent_thinking event')

    // Small delay for UI effect
    await new Promise(resolve => setTimeout(resolve, 500))

    // 2. Log SQL Generation (UI Update)
    await supabase.from('call_events').insert({
      call_sid: callSid,
      event_type: 'querying',
      event_data: {
        sql: `SELECT status, delivery_date, tracking_number FROM orders WHERE order_number = '${order_number}'`
      }
    })
    console.log('[Query Order] Inserted querying event')

    await new Promise(resolve => setTimeout(resolve, 500))

    // 3. Query Database
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', order_number)
      .single()

    if (error || !order) {
      console.log('[Query Order] Order not found:', error)
      
      // Log error result
      await supabase.from('call_events').insert({
        call_sid: callSid,
        event_type: 'results',
        event_data: { error: 'Order not found', order_number }
      })

      return NextResponse.json({ 
        error: 'Order not found',
        message: `I couldn't find an order with number ${order_number}. Could you please verify the order number?`
      }, { status: 404 })
    }

    console.log('[Query Order] Found order:', order.status)

    // 4. Log Results (UI Update)
    await supabase.from('call_events').insert({
      call_sid: callSid,
      event_type: 'results',
      event_data: {
        status: order.status,
        delivery_date: order.delivery_date,
        tracking_number: order.tracking_number,
        customer_name: order.customer_name
      }
    })
    console.log('[Query Order] Inserted results event')

    await new Promise(resolve => setTimeout(resolve, 500))

    // 5. Log Action - SMS Sent (UI Update)
    await supabase.from('call_events').insert({
      call_sid: callSid,
      event_type: 'action',
      event_data: {
        type: 'sms',
        description: `SMS sent with tracking number ${order.tracking_number}`,
        message: `Your order #${order_number} is ${order.status}. Track at: ${order.tracking_number}`
      }
    })
    console.log('[Query Order] Inserted action event')

    // 6. Return to ElevenLabs Agent
    const response = {
      status: order.status,
      delivery_date: order.delivery_date,
      tracking_number: order.tracking_number,
      customer_name: order.customer_name,
      notes: order.notes || `Your order is currently ${order.status}. Expected delivery: ${order.delivery_date}. Tracking number: ${order.tracking_number}`
    }

    console.log('[Query Order] Returning response:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('[Query Order] Error:', error)
    return NextResponse.json({ error: 'Internal tool error' }, { status: 500 })
  }
}
