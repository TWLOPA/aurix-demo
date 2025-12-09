import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

// Compliance checker - determines what inquiries are allowed
function checkCompliance(inquiry_type: string) {
  const ALLOWED_INQUIRIES = [
    'order_status',
    'delivery_date',
    'tracking_number',
    'refill_request',
    'payment_update',
    'address_change'
  ]

  const BLOCKED_INQUIRIES = [
    'medical_advice',
    'side_effects',
    'dosage_change',
    'drug_interactions',
    'medical_condition'
  ]

  if (BLOCKED_INQUIRIES.includes(inquiry_type)) {
    return {
      allowed: false,
      reason: 'Medical advice requires licensed clinician',
      action: 'Schedule clinician callback'
    }
  }

  if (ALLOWED_INQUIRIES.includes(inquiry_type)) {
    return {
      allowed: true,
      reason: 'Order/delivery inquiry within agent scope',
      action: 'Process request'
    }
  }

  // Default: allow but flag for review
  return {
    allowed: true,
    reason: 'General inquiry - allowed with monitoring',
    action: 'Process with caution'
  }
}

export async function POST(request: Request) {
  console.log('========================================')
  console.log('[Handle Inquiry] 🚀 REQUEST RECEIVED')
  console.log('========================================')
  
  // Log environment check - support both env var names
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  console.log('[Handle Inquiry] ENV CHECK:')
  console.log('  - SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('  - SERVICE_KEY exists:', !!serviceKey)
  
  // Create Supabase client inside handler
  let supabase;
  try {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey!
    )
    console.log('[Handle Inquiry] ✅ Supabase client created')
  } catch (e) {
    console.error('[Handle Inquiry] ❌ Failed to create Supabase client:', e)
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  try {
    // Parse request body
    const body = await request.json()
    console.log('[Handle Inquiry] 📥 Request body:', JSON.stringify(body, null, 2))
    
    const { customer_phone, inquiry_type, order_id, question_text } = body
    
    console.log('[Handle Inquiry] 📋 Parsed params:')
    console.log('  - customer_phone:', customer_phone)
    console.log('  - inquiry_type:', inquiry_type)
    console.log('  - order_id:', order_id)
    console.log('  - question_text:', question_text?.substring(0, 50))
    
    const call_sid = `CALL_${Date.now()}`
    console.log('[Handle Inquiry] 🆔 Generated call_sid:', call_sid)

    // Step 1: Log understanding
    console.log('[Handle Inquiry] Step 1: Inserting understanding event...')
    const { error: err1 } = await supabase.from('call_events').insert({
      call_sid,
      event_type: 'understanding',
      event_data: {
        inquiry_type,
        order_id,
        question_text: question_text?.substring(0, 100)
      }
    })
    if (err1) console.error('[Handle Inquiry] ❌ Error inserting understanding:', err1)
    else console.log('[Handle Inquiry] ✅ Understanding event inserted')

    await sleep(500)

    // Step 2: Compliance check
    console.log('[Handle Inquiry] Step 2: Running compliance check...')
    const compliance_result = checkCompliance(inquiry_type || 'order_status')
    console.log('[Handle Inquiry] Compliance result:', compliance_result)
    
    const { error: err2 } = await supabase.from('call_events').insert({
      call_sid,
      event_type: 'compliance_check',
      event_data: {
        inquiry_type: inquiry_type || 'order_status',
        allowed: compliance_result.allowed,
        reason: compliance_result.reason,
        action: compliance_result.action
      }
    })
    if (err2) console.error('[Handle Inquiry] ❌ Error inserting compliance:', err2)
    else console.log('[Handle Inquiry] ✅ Compliance event inserted')

    await sleep(500)

    // Step 3: If blocked, return early with escalation
    if (!compliance_result.allowed) {
      console.log('[Handle Inquiry] 🚫 Request blocked by compliance')
      await supabase.from('call_events').insert({
        call_sid,
        event_type: 'action',
        event_data: {
          type: 'escalation',
          description: 'Clinician callback scheduled (medical advice boundary)',
          scheduled_within: '2 hours'
        }
      })

      return NextResponse.json({
        allowed: false,
        reason: compliance_result.reason,
        response: "I want to make sure you get accurate medical information, so I've scheduled a callback from one of our clinicians within the next 2 hours. They'll be able to discuss any concerns you have about the medication. Is there anything else about your order I can help with?"
      })
    }

    // Step 4: Query customer and order data
    console.log('[Handle Inquiry] Step 4: Querying order data for:', order_id)
    const { error: err3 } = await supabase.from('call_events').insert({
      call_sid,
      event_type: 'querying',
      event_data: {
        sql: `SELECT * FROM orders WHERE order_id = '${order_id}'`
      }
    })
    if (err3) console.error('[Handle Inquiry] ❌ Error inserting query event:', err3)

    await sleep(800)

    // Execute query
    console.log('[Handle Inquiry] Executing Supabase query...')
    const { data: orderData, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (*),
        prescriptions (*)
      `)
      .eq('order_id', order_id)
      .single()

    console.log('[Handle Inquiry] Query result:')
    console.log('  - error:', error?.message || 'none')
    console.log('  - data found:', !!orderData)

    if (error || !orderData) {
      console.log('[Handle Inquiry] ⚠️ Order not found, logging failure...')
      
      await supabase.from('call_events').insert({
        call_sid,
        event_type: 'results',
        event_data: {
          order_id,
          status: 'NOT_FOUND',
          error: error?.message || 'Order not found in database',
          suggestion: 'Verify order number format (ORD_XXXX)'
        }
      })

      await sleep(300)

      await supabase.from('call_events').insert({
        call_sid,
        event_type: 'action',
        event_data: {
          type: 'customer_assistance',
          description: 'Offering alternative lookup methods',
          options: ['Search by phone number', 'Search by email', 'Recent orders']
        }
      })

      console.log('[Handle Inquiry] 📤 Returning NOT_FOUND response')
      return NextResponse.json({ 
        found: false,
        order_id,
        response: `I couldn't find an order with ID ${order_id}. Let me help you - could you provide your phone number or email address so I can look up your recent orders? Alternatively, order numbers are usually in the format ORD followed by 4 digits, like ORD-7823.`
      })
    }

    console.log('[Handle Inquiry] ✅ Order found:', orderData.order_id)

    // Step 5: Log results
    console.log('[Handle Inquiry] Step 5: Logging results...')
    const { error: err4 } = await supabase.from('call_events').insert({
      call_sid,
      customer_id: orderData.customer_id,
      event_type: 'results',
      event_data: {
        order_status: orderData.order_status,
        estimated_delivery: orderData.estimated_delivery,
        tracking_number: orderData.tracking_number,
        product: orderData.product_name,
        customer_tier: orderData.customers?.vip_tier,
        discreet_packaging: orderData.discreet_packaging
      }
    })
    if (err4) console.error('[Handle Inquiry] ❌ Error inserting results:', err4)
    else console.log('[Handle Inquiry] ✅ Results event inserted')

    await sleep(500)

    // Step 6: Take actions
    console.log('[Handle Inquiry] Step 6: Logging action...')
    const { error: err5 } = await supabase.from('call_events').insert({
      call_sid,
      customer_id: orderData.customer_id,
      event_type: 'action',
      event_data: {
        type: 'sms',
        description: `Tracking link sent via SMS: ${orderData.tracking_number}`,
        recipient: customer_phone || orderData.customers?.phone
      }
    })
    if (err5) console.error('[Handle Inquiry] ❌ Error inserting action:', err5)
    else console.log('[Handle Inquiry] ✅ Action event inserted')

    // Step 7: Return response
    const discreetNote = orderData.discreet_packaging 
      ? 'As always, it will arrive in plain, discreet packaging.' 
      : ''

    const response = {
      allowed: true,
      order_status: orderData.order_status,
      estimated_delivery: orderData.estimated_delivery,
      tracking_number: orderData.tracking_number,
      product_name: orderData.product_name,
      discreet_packaging: orderData.discreet_packaging,
      response: `Your ${orderData.product_name} order is ${orderData.order_status} and will arrive on ${formatDate(orderData.estimated_delivery)}. I'm sending you a tracking link via text now. ${discreetNote}`
    }

    console.log('[Handle Inquiry] 📤 SUCCESS - Returning response')
    console.log('========================================')
    return NextResponse.json(response)

  } catch (error) {
    console.error('========================================')
    console.error('[Handle Inquiry] ❌ UNHANDLED ERROR:', error)
    console.error('========================================')
    return NextResponse.json({ 
      error: 'Failed to process inquiry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
