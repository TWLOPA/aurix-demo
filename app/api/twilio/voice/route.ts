import { NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: Request) {
  try {
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()

    // Generate unique call ID
    const callSid = request.headers.get('X-Twilio-CallSid') || `CALL_${Date.now()}`
    console.log(`[Twilio] Incoming call: ${callSid}`)

    // Get Agent ID from environment variables
    const agentId = process.env.ELEVENLABS_AGENT_ID
    
    if (!agentId) {
      console.error('Missing ELEVENLABS_AGENT_ID in environment variables')
      response.say('Sorry, the AI agent is not configured correctly.')
      response.hangup()
      return new NextResponse(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Connect to ElevenLabs Conversational AI via WebSocket Stream
    const connect = response.connect()
    const stream = connect.stream({
      url: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`
    })
    
    // Optional: Add parameters if needed by ElevenLabs (custom headers usually passed here)
    // stream.parameter({ name: 'some_param', value: 'some_value' })

    return new NextResponse(response.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('Twilio webhook error:', error)
    
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say('Sorry, there was an error connecting to the AI agent.')
    response.hangup()

    return new NextResponse(response.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  }
}
