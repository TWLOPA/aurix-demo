import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

export async function POST(request: Request) {
  // Create Supabase client inside handler - support both env var names
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey!
  )

  try {
    const { customer_phone, prescription_id, verification_last4 } = await request.json()
    
    const call_sid = `CALL_${Date.now()}`
    
    console.log(`[Request Refill] Processing refill for prescription: ${prescription_id}`)

    // Step 1: Log understanding
    await supabase.from('call_events').insert({
      call_sid,
      event_type: 'understanding',
      event_data: {
        request_type: 'prescription_refill',
        prescription_id,
        verification_required: true
      }
    })

    await sleep(500)

    // Step 2: Get customer by phone
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', customer_phone)
      .single()

    if (customerError || !customer) {
      console.log('[Request Refill] Customer not found:', customerError)
      return NextResponse.json({ 
        error: 'Customer not found',
        response: "I couldn't find your account. Could you please verify your phone number?"
      }, { status: 404 })
    }

    // Step 3: Identity verification check
    const verification_passed = customer.security_last4_digits === verification_last4

    await supabase.from('call_events').insert({
      call_sid,
      customer_id: customer.customer_id,
      event_type: 'compliance_check',
      event_data: {
        check_type: 'identity_verification',
        method: 'last_4_digits',
        result: verification_passed ? 'PASSED' : 'FAILED',
        hipaa_required: true
      }
    })

    await sleep(500)

    if (!verification_passed) {
      return NextResponse.json({
        success: false,
        error: 'Verification failed',
        response: "I'm sorry, that doesn't match our records. For your security, I'll need to verify your identity another way. Let me connect you with our support team."
      }, { status: 403 })
    }

    // Step 4: Query prescription and billing
    await supabase.from('call_events').insert({
      call_sid,
      customer_id: customer.customer_id,
      event_type: 'querying',
      event_data: {
        systems: ['prescription_system', 'billing_system'],
        queries: [
          `SELECT prescription_status, refills_remaining FROM prescriptions WHERE prescription_id = '${prescription_id}'`,
          `SELECT card_last4, next_billing_date FROM billing WHERE customer_id = '${customer.customer_id}'`
        ]
      }
    })

    await sleep(800)

    // Get prescription
    const { data: prescription, error: rxError } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('prescription_id', prescription_id)
      .single()

    if (rxError || !prescription) {
      return NextResponse.json({
        success: false,
        error: 'Prescription not found',
        response: "I couldn't find that prescription in our system. Would you like me to check under a different prescription ID?"
      }, { status: 404 })
    }

    // Check refills remaining
    if (prescription.refills_remaining === 0) {
      return NextResponse.json({
        success: false,
        error: 'No refills remaining',
        response: "I can see your prescription has no refills remaining. I can connect you with our team to get a new prescription from your doctor. Would you like me to do that?"
      })
    }

    // Get billing info
    const { data: billing } = await supabase
      .from('billing')
      .select('*')
      .eq('customer_id', customer.customer_id)
      .single()

    // Step 5: Log results
    await supabase.from('call_events').insert({
      call_sid,
      customer_id: customer.customer_id,
      event_type: 'results',
      event_data: {
        prescription_status: prescription.prescription_status,
        refills_remaining: prescription.refills_remaining,
        billing_status: billing?.billing_status,
        next_billing_date: billing?.next_billing_date,
        customer_tier: customer.vip_tier
      }
    })

    await sleep(500)

    // Step 6: Create refill order
    const new_order_id = `ORD_${Date.now()}`
    const estimated_delivery = new Date()
    estimated_delivery.setDate(estimated_delivery.getDate() + (customer.vip_tier === 'gold' ? 2 : 3))

    await supabase.from('orders').insert({
      order_id: new_order_id,
      customer_id: customer.customer_id,
      prescription_id: prescription.prescription_id,
      product_name: prescription.product_name,
      quantity: 30, // standard refill
      order_status: 'processing',
      estimated_delivery: estimated_delivery.toISOString().split('T')[0],
      discreet_packaging: customer.discreet_packaging,
      order_total: 65.00
    })

    // Update prescription refills
    await supabase
      .from('prescriptions')
      .update({ refills_remaining: prescription.refills_remaining - 1 })
      .eq('prescription_id', prescription_id)

    // Step 7: Log actions
    await supabase.from('call_events').insert({
      call_sid,
      customer_id: customer.customer_id,
      event_type: 'action',
      event_data: {
        type: 'order_created',
        order_id: new_order_id,
        description: `Refill order created: ${prescription.product_name}`,
        shipping: customer.vip_tier === 'gold' ? 'Express (free)' : 'Standard',
        payment_method: `Card ending ${billing?.card_last4}`
      }
    })

    // Step 8: Return response
    const vipNote = customer.vip_tier === 'gold' 
      ? 'As a Gold member, you get free express shipping - ' 
      : ''

    return NextResponse.json({
      success: true,
      order_id: new_order_id,
      estimated_delivery: estimated_delivery.toISOString().split('T')[0],
      refills_remaining: prescription.refills_remaining - 1,
      shipping_type: customer.vip_tier === 'gold' ? 'express' : 'standard',
      response: `Perfect, I've processed your refill for ${prescription.product_name}. ${vipNote}It will arrive on ${formatDate(estimated_delivery)}. You have ${prescription.refills_remaining - 1} refills remaining after this order. Is there anything else I can help with?`
    })

  } catch (error) {
    console.error('[Request Refill] Error:', error)
    return NextResponse.json({ error: 'Failed to process refill' }, { status: 500 })
  }
}

