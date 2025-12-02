import { NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: Request) {
  try {
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()

    // Generate unique call ID from headers or timestamp
    const callSid = request.headers.get('X-Twilio-CallSid') || `CALL_${Date.now()}`
    console.log(`[Twilio] Incoming call: ${callSid}`)

    // For now: Just say a greeting (testing)
    response.say('Hello! You have reached ORIX, the voice AI customer success platform. This is a test call.')

    // Pause for 2 seconds
    response.pause({ length: 2 })

    // Say goodbye
    response.say('Thank you for calling. Goodbye.')

    // Hang up
    response.hangup()

    return new NextResponse(response.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('Twilio webhook error:', error)
    
    // Return error response
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say('Sorry, there was an error processing your call. Please try again later.')
    response.hangup()

    return new NextResponse(response.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  }
}

