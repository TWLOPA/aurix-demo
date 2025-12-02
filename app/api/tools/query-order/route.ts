import { NextResponse } from 'next/server'
import { insertCallEvent, queryOrder } from '@/lib/supabase/queries'

export async function POST(request: Request) {
  try {
    const { order_number, customer_name, call_sid } = await request.json()
    // Use a fixed Demo ID if no specific call_sid is provided (common in Webhook calls)
    const callSid = call_sid || 'DEMO_SESSION_ID'

    // 1. Log Agent Thinking (UI Update)
    await insertCallEvent({
      call_sid: callSid,
      event_type: 'agent_thinking',
      event_data: {
        order_number,
        customer_name,
        issue_type: 'order_status'
      }
    })

    // 2. Log SQL Generation (UI Update)
    // We simulate the SQL generation step here for the UI since we know the query
    await insertCallEvent({
      call_sid: callSid,
      event_type: 'querying',
      event_data: {
        sql: `SELECT status, delivery_date, tracking_number FROM orders WHERE order_number = '${order_number}'`
      }
    })

    // 3. Query Database
    let result
    try {
      result = await queryOrder(order_number)
    } catch (e) {
      result = { error: 'Order not found' }
    }

    // 4. Log Results (UI Update)
    await insertCallEvent({
      call_sid: callSid,
      event_type: 'results',
      event_data: result
    })

    // 5. Return to ElevenLabs Agent
    return NextResponse.json(result)

  } catch (error) {
    console.error('Tool execution error:', error)
    return NextResponse.json({ error: 'Internal tool error' }, { status: 500 })
  }
}


