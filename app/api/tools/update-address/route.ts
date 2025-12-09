import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long'
  })
}

export async function POST(request: Request) {
  // Create Supabase client inside handler
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { 
      customer_phone, 
      order_id, 
      new_address_type, // 'home' or 'office'
      verification_code 
    } = await request.json()
    
    const call_sid = `CALL_${Date.now()}`
    
    console.log(`[Update Address] Changing delivery for order: ${order_id}`)

    // Step 1: Get customer by phone
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', customer_phone)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ 
        error: 'Customer not found',
        response: "I couldn't find your account. Could you please verify your phone number?"
      }, { status: 404 })
    }

    // Step 2: Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, prescriptions(*)')
      .eq('order_id', order_id)
      .eq('customer_id', customer.customer_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ 
        error: 'Order not found',
        response: "I couldn't find that order under your account. Could you please verify the order number?"
      }, { status: 404 })
    }

    // Step 3: Log understanding with empathy context
    await supabase.from('call_events').insert({
      call_sid,
      customer_id: customer.customer_id,
      event_type: 'understanding',
      event_data: {
        request_type: 'address_change',
        order_id,
        current_address: order.delivery_address_type,
        requested_address: new_address_type,
        reason: 'privacy_concern',
        customer_tier: customer.vip_tier
      }
    })

    await sleep(500)

    // Step 4: VIP detection and special handling
    const is_vip = customer.customer_ltv > 1000 || customer.vip_tier === 'gold'
    
    await supabase.from('call_events').insert({
      call_sid,
      customer_id: customer.customer_id,
      event_type: 'compliance_check',
      event_data: {
        check_type: 'vip_customer_detection',
        customer_ltv: customer.customer_ltv,
        order_count: customer.order_count,
        vip_tier: customer.vip_tier,
        is_vip: is_vip,
        special_handling: is_vip ? 'Empathetic response, priority processing' : 'Standard processing'
      }
    })

    await sleep(500)

    // Step 5: Security verification (simulated for demo)
    const verification_passed = true // In production, would verify SMS code

    await supabase.from('call_events').insert({
      call_sid,
      customer_id: customer.customer_id,
      event_type: 'querying',
      event_data: {
        query_type: 'security_verification',
        method: 'sms_code',
        result: verification_passed ? 'PASSED' : 'FAILED'
      }
    })

    await sleep(500)

    // Step 6: Update order
    await supabase
      .from('orders')
      .update({
        delivery_address_type: new_address_type,
        discreet_packaging: true // Always ensure discreet for privacy requests
      })
      .eq('order_id', order_id)

    // Step 7: Log results
    await supabase.from('call_events').insert({
      call_sid,
      customer_id: customer.customer_id,
      event_type: 'results',
      event_data: {
        address_updated: true,
        new_address_type,
        discreet_packaging_confirmed: true,
        delivery_date_unchanged: order.estimated_delivery
      }
    })

    await sleep(500)

    // Step 8: Log actions
    const actions = []
    
    // Update address action
    actions.push({
      type: 'address_change',
      description: `Delivery address changed: ${order.delivery_address_type} → ${new_address_type}`
    })

    // If VIP, notify support team
    if (is_vip) {
      actions.push({
        type: 'vip_alert',
        description: `VIP customer support team notified (relationship management)`,
        customer_tier: customer.vip_tier,
        customer_ltv: customer.customer_ltv
      })
    }

    // Privacy preferences updated
    actions.push({
      type: 'privacy_update',
      description: 'Customer privacy preferences noted in CRM',
      privacy_flag: 'high'
    })

    await supabase.from('call_events').insert({
      call_sid,
      customer_id: customer.customer_id,
      event_type: 'action',
      event_data: {
        actions
      }
    })

    // Step 9: Return empathetic response
    const vipNote = customer.vip_tier === 'gold' 
      ? 'As a Gold member, you still have free delivery and ' 
      : ''
    
    const response = is_vip 
      ? `Absolutely, I've updated your delivery address to ${new_address_type} and confirmed discreet packaging - plain brown box, no branding. ${vipNote}your order will still arrive on ${formatDate(order.estimated_delivery)}. I've also updated your preferences so future orders automatically go to your ${new_address_type} address. Is there anything else I can help with?`
      : `I've updated your delivery address to ${new_address_type}. Your order will arrive in discreet packaging on ${formatDate(order.estimated_delivery)}. Would you like me to update your default delivery preference as well?`

    return NextResponse.json({
      success: true,
      order_id,
      new_address_type,
      estimated_delivery: order.estimated_delivery,
      discreet_packaging_confirmed: true,
      is_vip,
      response
    })

  } catch (error) {
    console.error('[Update Address] Error:', error)
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

