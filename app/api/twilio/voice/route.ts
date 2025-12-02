import { NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: Request) {
  try {
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()

    // Generate unique call ID
    const callSid = request.headers.get('X-Twilio-CallSid') || `CALL_${Date.now()}`
    console.log(`[Twilio] Incoming call detected. CallSid: ${callSid}`)

    // Get configuration
    const agentId = process.env.ELEVENLABS_AGENT_ID
    
    if (!agentId) {
      console.error('[Twilio] CRITICAL: Missing ELEVENLABS_AGENT_ID env var')
      response.say('System configuration error.')
      response.hangup()
      return new NextResponse(response.toString(), { headers: { 'Content-Type': 'text/xml' }})
    }

    // Force Public URL for testing (Assuming Agent is Public)
    // This eliminates potential issues with the Signed URL generation
    const streamUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`

    console.log(`[Twilio] Connecting to Public Stream URL: ${streamUrl}`)

    // Connect to ElevenLabs
    const connect = response.connect()
    const stream = connect.stream({
      url: streamUrl
    })
    
    // Pass parameters that might help
    stream.parameter({ name: 'callSid', value: callSid })

    const twimlString = response.toString()
    console.log('[Twilio] Generated TwiML:', twimlString)

    return new NextResponse(twimlString, {
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('[Twilio] Unhandled error in webhook:', error)
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say('Sorry, an internal error occurred.')
    response.hangup()
    return new NextResponse(response.toString(), { headers: { 'Content-Type': 'text/xml' }})
  }
}
