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
    
    const { 
      customer_phone, 
      inquiry_type, 
      order_id, 
      question_text,
      // Identity verification fields (HIPAA/GDPR compliance)
      verification_dob,      // Date of birth: "1985-03-15"
      verification_postcode  // Postcode on file: "SW1A 1AA"
    } = body
    
    console.log('[Handle Inquiry] 📋 Parsed params:')
    console.log('  - customer_phone:', customer_phone)
    console.log('  - inquiry_type:', inquiry_type)
    console.log('  - order_id:', order_id)
    console.log('  - verification_dob:', verification_dob || '(not provided)')
    console.log('  - verification_postcode:', verification_postcode || '(not provided)')
    
    // Use DEMO_SESSION_ID so the frontend can see the events
    const call_sid = 'DEMO_SESSION_ID'
    console.log('[Handle Inquiry] 🆔 Using call_sid:', call_sid)

    // Step 1: Log understanding
    console.log('[Handle Inquiry] Step 1: Inserting understanding event...')
    const { error: err1 } = await supabase.from('call_events').insert({
      call_sid,
      event_type: 'understanding',
      event_data: {
        inquiry_type,
        order_id,
        question_text: question_text?.substring(0, 100),
        identity_provided: !!(verification_dob || verification_postcode)
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

    // Step 3: If blocked, return early with escalation OFFER (not automatic)
    if (!compliance_result.allowed) {
      console.log('[Handle Inquiry] 🚫 Request blocked by compliance - MEDICAL ESCALATION')
      
      // Log prominent MEDICAL ESCALATION event - this should be very visible in Agent Brain
      await supabase.from('call_events').insert({
        call_sid,
        event_type: 'compliance_check',
        event_data: {
          check_type: 'medical_inquiry_detected',
          inquiry_type: inquiry_type || 'medical_advice',
          allowed: false,
          result: 'BLOCKED',
          reason: compliance_result.reason,
          action: 'OFFER_CLINICIAN_CALLBACK',
          severity: 'high',
          compliance_boundary: 'Medical advice requires licensed clinician - agent cannot provide'
        }
      })

      await sleep(500)

      // Log the escalation detection - NOT scheduling yet, just offering
      await supabase.from('call_events').insert({
        call_sid,
        event_type: 'action',
        event_data: {
          type: 'escalation_offer',
          description: 'Medical inquiry detected - Offering clinician callback option',
          reason: `Customer asked: "${question_text || inquiry_type}"`,
          status: 'PENDING_CUSTOMER_DECISION'
        }
      })

      // Log to clinician_escalations table - status is pending customer decision
      const escalationResponse = "I'm not able to provide medical advice as I'm not a licensed clinician. However, I can arrange for one of our clinicians to call you back within 2 hours to discuss your question. Would you like me to schedule that callback for you?"
      
      // Insert escalation with detailed error logging
      const escalationData = {
        call_sid,
        inquiry_type: inquiry_type || 'medical_advice',
        inquiry_text: question_text || `Customer asked about: ${inquiry_type}`,
        blocked_reason: compliance_result.reason,
        escalation_status: 'pending_customer_decision',
        agent_response: escalationResponse
      }
      
      console.log('[Handle Inquiry] 📝 Inserting escalation:', JSON.stringify(escalationData))
      
      const { data: escalationResult, error: escalationError } = await supabase
        .from('clinician_escalations')
        .insert(escalationData)
        .select()
      
      if (escalationError) {
        console.error('[Handle Inquiry] ❌ Escalation insert error:', escalationError.message)
        console.error('[Handle Inquiry] ❌ Error details:', JSON.stringify(escalationError))
      } else {
        console.log('[Handle Inquiry] ✅ Escalation logged successfully:', escalationResult)
      }

      return NextResponse.json({
        allowed: false,
        reason: compliance_result.reason,
        offer_callback: true,
        response: escalationResponse
      })
    }

    // Step 4: IDENTITY VERIFICATION CHECK (HIPAA/GDPR Compliance)
    // Before revealing ANY health-related order information, verify identity
    console.log('[Handle Inquiry] Step 4: Identity verification check...')
    
    const identityProvided = verification_dob || verification_postcode
    
    await supabase.from('call_events').insert({
      call_sid,
      event_type: 'identity_check',
      event_data: {
        order_id,
        verification_method: verification_dob ? 'date_of_birth' : (verification_postcode ? 'postcode' : 'none'),
        identity_provided: !!identityProvided,
        compliance_regulation: 'HIPAA/GDPR',
        reason: 'Health data requires identity verification before disclosure'
      }
    })

    if (!identityProvided) {
      console.log('[Handle Inquiry] 🔒 Identity verification required')
      
      await supabase.from('call_events').insert({
        call_sid,
        event_type: 'action',
        event_data: {
          type: 'identity_required',
          description: 'Requesting identity verification before proceeding',
          accepted_methods: ['Date of birth', 'Postcode on file']
        }
      })

      return NextResponse.json({
        verified: false,
        identity_required: true,
        response: "For your security and to comply with data protection regulations, I need to verify your identity before I can share any order information. Could you please confirm either your date of birth, or the postcode we have on file for you?"
      })
    }

    await sleep(500)

    // Step 5: Query customer and order data
    console.log('[Handle Inquiry] Step 5: Querying order data for:', order_id)
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

    // Step 6: Verify identity matches customer record
    console.log('[Handle Inquiry] Step 6: Verifying identity against customer record...')
    const customer = orderData.customers
    let identityVerified = false
    let verificationMethod = ''

    if (verification_dob && customer?.date_of_birth) {
      // Compare DOB (format: YYYY-MM-DD)
      identityVerified = verification_dob === customer.date_of_birth
      verificationMethod = 'date_of_birth'
    } else if (verification_postcode && customer?.postcode) {
      // Compare postcode (case-insensitive, ignore spaces)
      const providedPostcode = verification_postcode.replace(/\s/g, '').toUpperCase()
      const storedPostcode = customer.postcode.replace(/\s/g, '').toUpperCase()
      identityVerified = providedPostcode === storedPostcode
      verificationMethod = 'postcode'
    }

    await supabase.from('call_events').insert({
      call_sid,
      event_type: 'identity_verification',
      event_data: {
        method: verificationMethod,
        verified: identityVerified,
        customer_id: customer?.customer_id,
        compliance: identityVerified ? 'PASSED' : 'FAILED'
      }
    })

    if (!identityVerified) {
      console.log('[Handle Inquiry] 🚫 Identity verification FAILED')
      
      await supabase.from('call_events').insert({
        call_sid,
        event_type: 'action',
        event_data: {
          type: 'verification_failed',
          description: 'Identity verification did not match records',
          security_action: 'Request alternative verification or suggest contacting support'
        }
      })

      return NextResponse.json({
        verified: false,
        identity_failed: true,
        response: "I'm sorry, but the information you provided doesn't match our records. For your security, I can't share order details without proper verification. Would you like to try a different verification method, or I can transfer you to our customer support team who can help verify your identity?"
      })
    }

    console.log('[Handle Inquiry] ✅ Identity VERIFIED for customer:', customer?.customer_id)

    // Step 7: Log results (only after identity verified)
    console.log('[Handle Inquiry] Step 7: Logging results...')
    const { error: err4 } = await supabase.from('call_events').insert({
      call_sid,
      customer_id: orderData.customer_id,
      event_type: 'results',
      event_data: {
        identity_verified: true,
        order_status: orderData.order_status,
        estimated_delivery: orderData.estimated_delivery,
        tracking_number: orderData.tracking_number,
        product: orderData.product_name,
        customer_tier: customer?.vip_tier,
        discreet_packaging: orderData.discreet_packaging
      }
    })
    if (err4) console.error('[Handle Inquiry] ❌ Error inserting results:', err4)
    else console.log('[Handle Inquiry] ✅ Results event inserted')

    await sleep(500)

    // Step 8: Take actions
    console.log('[Handle Inquiry] Step 8: Logging action...')
    const { error: err5 } = await supabase.from('call_events').insert({
      call_sid,
      customer_id: orderData.customer_id,
      event_type: 'action',
      event_data: {
        type: 'sms',
        description: `Tracking link sent via SMS: ${orderData.tracking_number}`,
        recipient: customer_phone || customer?.phone
      }
    })
    if (err5) console.error('[Handle Inquiry] ❌ Error inserting action:', err5)
    else console.log('[Handle Inquiry] ✅ Action event inserted')

    // Trigger SMS prompt for frontend (real SMS demonstration)
    await supabase.from('call_events').insert({
      call_sid,
      event_type: 'sms_prompt',
      event_data: {
        message_type: 'tracking',
        order_id: orderData.order_id,
        tracking_number: orderData.tracking_number,
        prompt_text: 'Agent is sending you a tracking link via SMS. Enter your phone number to receive the actual text message.'
      }
    })
    console.log('[Handle Inquiry] ✅ SMS prompt event inserted')

    // Step 9: Return response
    const discreetNote = orderData.discreet_packaging 
      ? 'As always, it will arrive in plain, discreet packaging.' 
      : ''

    const response = {
      verified: true,
      allowed: true,
      order_status: orderData.order_status,
      estimated_delivery: orderData.estimated_delivery,
      tracking_number: orderData.tracking_number,
      product_name: orderData.product_name,
      discreet_packaging: orderData.discreet_packaging,
      response: `Thank you for verifying your identity. Your ${orderData.product_name} order is ${orderData.order_status} and will arrive on ${formatDate(orderData.estimated_delivery)}. I'm sending you a tracking link via text now. ${discreetNote}`
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
