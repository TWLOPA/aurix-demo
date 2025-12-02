import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { extractEntities, generateSQL, formatResponse } from '@/lib/services/claude'
import { queryOrder } from '@/lib/supabase/queries'
import { insertCallEvent } from '@/lib/supabase/queries'

export async function POST(request: Request) {
  try {
    const body = await request.formData()
    const speechResult = body.get('SpeechResult') as string
    const callSid = body.get('CallSid') as string

    console.log(`[Twilio] Process: ${callSid} said "${speechResult}"`)

    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()

    if (!speechResult) {
      response.say('I didn\'t hear anything.')
      response.redirect('/api/twilio/voice')
      return new NextResponse(response.toString(), { headers: { 'Content-Type': 'text/xml' }})
    }

    // 1. Log User Speech (Real-time UI update)
    await insertCallEvent({ 
      call_sid: callSid, 
      event_type: 'user_spoke', 
      event_data: { text: speechResult } 
    })

    // 2. AI Processing (Claude)
    // Extract Entities
    const entities = await extractEntities(speechResult)
    await insertCallEvent({ 
      call_sid: callSid, 
      event_type: 'agent_thinking', 
      event_data: entities 
    })

    // Generate & Execute SQL
    const sql = await generateSQL(entities)
    let results = {}
    
    if (sql !== 'INVALID') {
        await insertCallEvent({ 
            call_sid: callSid, 
            event_type: 'querying', 
            event_data: { sql } 
        })

        // Execute Query (Simple Order lookup for demo)
        if (sql.includes('orders') && entities.order_number) {
            try {
                results = await queryOrder(entities.order_number)
            } catch (e) {
                results = { error: 'Not found' }
            }
        }
        
        await insertCallEvent({ 
            call_sid: callSid, 
            event_type: 'results', 
            event_data: results 
        })
    }

    // Format Response
    const aiResponseText = await formatResponse(results, entities)
    
    // Log Agent Response
    await insertCallEvent({ 
      call_sid: callSid, 
      event_type: 'agent_spoke', 
      event_data: { text: aiResponseText } 
    })

    // 3. Respond to User (Loop)
    const gather = response.gather({
      input: ['speech'],
      action: '/api/twilio/process',
      speechTimeout: 'auto',
    })
    
    // Ideally: Use ElevenLabs TTS here via <Play>
    // For now: Use Twilio TTS for instant speed
    gather.say(aiResponseText)

    // Fallback if no input
    response.say('Are you still there?')
    response.redirect('/api/twilio/voice')

    return new NextResponse(response.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    })

  } catch (error) {
    console.error('[Twilio] Process Error:', error)
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say('I encountered an error processing your request.')
    response.hangup()
    return new NextResponse(response.toString(), { headers: { 'Content-Type': 'text/xml' }})
  }
}

