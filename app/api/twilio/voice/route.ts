import { NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: Request) {
  try {
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()

    // Generate unique call ID
    const callSid = request.headers.get('X-Twilio-CallSid') || `CALL_${Date.now()}`
    console.log(`[Twilio] Incoming call: ${callSid}`)

    // Get configuration
    const agentId = process.env.ELEVENLABS_AGENT_ID
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY // Using local/public key for demo simplicity, or use server-side key
    
    if (!agentId) {
      console.error('Missing ELEVENLABS_AGENT_ID')
      response.say('System configuration error.')
      response.hangup()
      return new NextResponse(response.toString(), { headers: { 'Content-Type': 'text/xml' }})
    }

    // Construct WebSocket URL
    // If we have an API key, we should try to sign the URL or pass headers, 
    // but Twilio <Stream> doesn't support custom headers easily.
    // The standard ElevenLabs pattern for PRIVATE agents is to use a signed URL.
    // For now, we assume PUBLIC access or that the ID is correct.
    
    // If you need to use a private agent, you would fetch a signed URL from ElevenLabs API here:
    // POST https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id={agentId}
    // headers: { xi-api-key: apiKey }
    
    let streamUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`

    // Attempt to get signed URL if API key is present (Handles Private Agents)
    if (apiKey) {
      try {
        const signedUrlRes = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`, {
          method: 'GET',
          headers: {
            'xi-api-key': apiKey
          }
        })

        if (signedUrlRes.ok) {
          const data = await signedUrlRes.json()
          if (data.signed_url) {
            streamUrl = data.signed_url
            console.log('[Twilio] Using Signed URL for Private Agent')
          }
        } else {
           console.warn('[Twilio] Failed to get signed URL, falling back to public URL', await signedUrlRes.text())
        }
      } catch (e) {
        console.warn('[Twilio] Error fetching signed URL', e)
      }
    }

    // Connect to ElevenLabs
    const connect = response.connect()
    const stream = connect.stream({
      url: streamUrl
    })
    
    // Optional: Pass callSid as a parameter to trace logs
    stream.parameter({ name: 'callSid', value: callSid })

    return new NextResponse(response.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('Twilio webhook error:', error)
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say('Connection error. Goodbye.')
    response.hangup()
    return new NextResponse(response.toString(), { headers: { 'Content-Type': 'text/xml' }})
  }
}
