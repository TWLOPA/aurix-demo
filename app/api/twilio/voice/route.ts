import { NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: Request) {
  try {
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()

    // Generate unique call ID
    const callSid = request.headers.get('X-Twilio-CallSid') || `CALL_${Date.now()}`
    console.log(`[Twilio] New Call Started: ${callSid}`)

    // Initial Greeting
    // We use <Gather> to listen for user input immediately after the greeting
    const gather = response.gather({
      input: ['speech'], // Listen for speech
      action: '/api/twilio/process', // Send results here
      speechTimeout: 'auto', // Auto-detect silence
      language: 'en-US',
    })

    gather.say('Hello! This is ORIX. How can I help you today?')

    // If the user doesn't say anything, loop back
    response.say('I didn\'t catch that. Could you repeat?')
    response.redirect('/api/twilio/voice')

    return new NextResponse(response.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('[Twilio] Error:', error)
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say('System error. Goodbye.')
    response.hangup()
    return new NextResponse(response.toString(), { headers: { 'Content-Type': 'text/xml' }})
  }
}
