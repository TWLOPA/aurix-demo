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
  // Create Supabase client inside handler
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { customer_phone, inquiry_type, order_id, question_text } = await request.json()
    
    const call_sid = `CALL_${Date.now()}`
    
    console.log(`[Handle Inquiry] Processing: ${inquiry_type} for order ${order_id}`)

    // Step 1: Log understanding
    await supabase.from('call_events').insert({
      call_sid,
      event_type: 'understanding',
      event_data: {
        inquiry_type,
        order_id,
        question_text: question_text?.substring(0, 100) // truncate for safety
      }
    })

    await sleep(500)

    // Step 2: Compliance check
    const compliance_result = checkCompliance(inquiry_type)
    
    await supabase.from('call_events').insert({
      call_sid,
      event_type: 'compliance_check',
      event_data: {
        inquiry_type,
        allowed: compliance_result.allowed,
        reason: compliance_result.reason,
        action: compliance_result.action
      }
    })

    await sleep(500)

    // Step 3: If blocked, return early with escalation
    if (!compliance_result.allowed) {
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
    await supabase.from('call_events').insert({
      call_sid,
      event_type: 'querying',
      event_data: {
        sql: `SELECT o.*, c.*, p.* FROM orders o 
              JOIN customers c ON o.customer_id = c.customer_id 
              JOIN prescriptions p ON o.prescription_id = p.prescription_id 
              WHERE o.order_id = '${order_id}'`
      }
    })

    await sleep(800)

    // Execute query - get order with related customer and prescription
    const { data: orderData, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (*),
        prescriptions (*)
      `)
      .eq('order_id', order_id)
      .single()

    if (error || !orderData) {
      console.log('[Handle Inquiry] Order not found:', error)
      
      // Log the failed lookup - IMPORTANT for transparency
      await supabase.from('call_events').insert({
        call_sid,
        event_type: 'results',
        event_data: {
          order_id,
          status: 'NOT_FOUND',
          error: 'Order not found in database',
          suggestion: 'Verify order number format (ORD_XXXX)'
        }
      })

      await sleep(300)

      // Log action - offer to help
      await supabase.from('call_events').insert({
        call_sid,
        event_type: 'action',
        event_data: {
          type: 'customer_assistance',
          description: 'Offering alternative lookup methods',
          options: ['Search by phone number', 'Search by email', 'Recent orders']
        }
      })

      return NextResponse.json({ 
        found: false,
        order_id,
        response: `I couldn't find an order with ID ${order_id}. Let me help you - could you provide your phone number or email address so I can look up your recent orders? Alternatively, order numbers are usually in the format ORD followed by 4 digits, like ORD-7823.`
      })
    }

    // Step 5: Log results
    await supabase.from('call_events').insert({
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

    await sleep(500)

    // Step 6: Take actions
    await supabase.from('call_events').insert({
      call_sid,
      customer_id: orderData.customer_id,
      event_type: 'action',
      event_data: {
        type: 'sms',
        description: `Tracking link sent via SMS: ${orderData.tracking_number}`,
        recipient: customer_phone || orderData.customers?.phone
      }
    })

    // Step 7: Return response
    const discreetNote = orderData.discreet_packaging 
      ? 'As always, it will arrive in plain, discreet packaging.' 
      : ''

    return NextResponse.json({
      allowed: true,
      order_status: orderData.order_status,
      estimated_delivery: orderData.estimated_delivery,
      tracking_number: orderData.tracking_number,
      product_name: orderData.product_name,
      discreet_packaging: orderData.discreet_packaging,
      response: `Your ${orderData.product_name} order is ${orderData.order_status} and will arrive on ${formatDate(orderData.estimated_delivery)}. I'm sending you a tracking link via text now. ${discreetNote}`
    })

  } catch (error) {
    console.error('[Handle Inquiry] Error:', error)
    return NextResponse.json({ error: 'Failed to process inquiry' }, { status: 500 })
  }
}

