import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(request: Request) {
  console.log('========================================')
  console.log('[Book Callback] 🚀 REQUEST RECEIVED')
  console.log('========================================')
  
  // Create Supabase client
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  
  let supabase;
  try {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey!
    )
    console.log('[Book Callback] ✅ Supabase client created')
  } catch (e) {
    console.error('[Book Callback] ❌ Failed to create Supabase client:', e)
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  try {
    const body = await request.json()
    console.log('[Book Callback] 📥 Request body:', JSON.stringify(body, null, 2))
    
    const { 
      customer_id,
      customer_name,
      callback_reason,
      preferred_time,
      phone_number,
      notes
    } = body
    
    const call_sid = 'DEMO_SESSION_ID'
    console.log('[Book Callback] 🆔 Using call_sid:', call_sid)

    // Step 1: Log that callback was accepted
    await supabase.from('call_events').insert({
      call_sid,
      customer_id,
      event_type: 'action',
      event_data: {
        type: 'clinician_callback_booked',
        description: 'Customer accepted clinician callback - Scheduled',
        reason: callback_reason,
        preferred_time: preferred_time || 'within 2 hours',
        status: 'SCHEDULED'
      }
    })
    console.log('[Book Callback] ✅ Callback booked event logged')

    await sleep(300)

    // Step 2: Update escalation record
    const { error: updateError } = await supabase
      .from('clinician_escalations')
      .update({
        escalation_status: 'callback_scheduled',
        callback_requested: true,
        callback_scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        customer_id: customer_id || null
      })
      .eq('call_sid', call_sid)
      .eq('escalation_status', 'pending_customer_decision')
      .order('created_at', { ascending: false })
      .limit(1)

    if (updateError) {
      console.error('[Book Callback] ⚠️ Failed to update escalation:', updateError)
    } else {
      console.log('[Book Callback] ✅ Escalation updated to callback_scheduled')
    }

    // Step 3: Update customer notes if we have a customer_id
    if (customer_id) {
      const noteEntry = `[${new Date().toISOString()}] Clinician callback scheduled - Reason: ${callback_reason || 'Medical inquiry'}`
      
      // Get existing notes first
      const { data: customerData } = await supabase
        .from('customers')
        .select('notes')
        .eq('customer_id', customer_id)
        .single()

      const existingNotes = customerData?.notes || ''
      const updatedNotes = existingNotes ? `${existingNotes}\n${noteEntry}` : noteEntry

      const { error: notesError } = await supabase
        .from('customers')
        .update({ notes: updatedNotes })
        .eq('customer_id', customer_id)

      if (notesError) {
        console.error('[Book Callback] ⚠️ Failed to update customer notes:', notesError)
      } else {
        console.log('[Book Callback] ✅ Customer notes updated')
      }
    }

    // Step 4: Log notes update action
    await supabase.from('call_events').insert({
      call_sid,
      customer_id,
      event_type: 'action',
      event_data: {
        type: 'customer_notes_updated',
        description: 'Added callback request to customer record',
        note: `Clinician callback scheduled - ${callback_reason || 'Medical inquiry'}`
      }
    })

    const response = {
      success: true,
      callback_scheduled: true,
      scheduled_within: preferred_time || '2 hours',
      response: `I've scheduled a callback from one of our clinicians within the next ${preferred_time || '2 hours'}. They'll call you on the number we have on file to discuss your question. Is there anything else I can help you with today?`
    }

    console.log('[Book Callback] 📤 SUCCESS - Returning response')
    console.log('========================================')
    return NextResponse.json(response)

  } catch (error) {
    console.error('========================================')
    console.error('[Book Callback] ❌ UNHANDLED ERROR:', error)
    console.error('========================================')
    return NextResponse.json({ 
      error: 'Failed to book callback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

