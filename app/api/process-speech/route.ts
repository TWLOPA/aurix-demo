import { NextResponse } from 'next/server'
import { insertCallEvent, queryOrder } from '@/lib/supabase/queries'
import { extractEntities, generateSQL, formatResponse } from '@/lib/services/claude'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: Request) {
  try {
    const { callSid, userSpeech } = await request.json()

    if (!callSid || !userSpeech) {
      return NextResponse.json(
        { error: 'Missing callSid or userSpeech' },
        { status: 400 }
      )
    }

    // Step 1: Log user speech
    await insertCallEvent({
      call_sid: callSid,
      event_type: 'user_spoke',
      event_data: { text: userSpeech }
    })

    // Step 2: Extract entities with Claude
    const entities = await extractEntities(userSpeech)
    
    await insertCallEvent({
      call_sid: callSid,
      event_type: 'agent_thinking',
      event_data: entities
    })

    // Step 3: Generate SQL
    const sql = await generateSQL(entities)
    
    if (sql === 'INVALID') {
      const errorResponse = "I'm sorry, I couldn't understand that question. Could you rephrase it?"
      
      await insertCallEvent({
        call_sid: callSid,
        event_type: 'agent_spoke',
        event_data: { text: errorResponse }
      })

      return NextResponse.json({ response: errorResponse })
    }

    await insertCallEvent({
      call_sid: callSid,
      event_type: 'querying',
      event_data: { sql }
    })

    // Step 4: Execute query
    let results
    try {
      // Simple parser for demo - just handle order queries
      if (sql.includes('orders') && entities.order_number) {
        results = await queryOrder(entities.order_number)
      } else {
        results = { error: 'Query not supported in demo' }
      }
    } catch (error) {
      results = { error: 'Query failed' }
    }

    await insertCallEvent({
      call_sid: callSid,
      event_type: 'results',
      event_data: results
    })

    // Step 5: Format natural language response
    const agentResponse = await formatResponse(results, entities)

    await insertCallEvent({
      call_sid: callSid,
      event_type: 'agent_spoke',
      event_data: { text: agentResponse }
    })

    // Step 6: Trigger actions (simulated)
    if (results && results.tracking_number) {
      await insertCallEvent({
        call_sid: callSid,
        event_type: 'action',
        event_data: {
          type: 'sms',
          description: 'SMS sent with tracking details',
          status: 'sent',
          recipient: entities.customer_name || 'Customer'
        }
      })
    }

    await insertCallEvent({
      call_sid: callSid,
      event_type: 'action',
      event_data: {
        type: 'crm_update',
        description: 'Call interaction logged in CRM',
        status: 'complete'
      }
    })

    return NextResponse.json({ 
      response: agentResponse,
      entities,
      results 
    })

  } catch (error) {
    console.error('Error processing speech:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

