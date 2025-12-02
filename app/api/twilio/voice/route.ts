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
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
    
    console.log(`[Twilio] Config check - AgentID: ${agentId ? 'Present' : 'Missing'}, APIKey: ${apiKey ? 'Present' : 'Missing'}`)

    if (!agentId) {
      console.error('[Twilio] CRITICAL: Missing ELEVENLABS_AGENT_ID env var')
      response.say('System configuration error. Missing Agent ID.')
      response.hangup()
      return new NextResponse(response.toString(), { headers: { 'Content-Type': 'text/xml' }})
    }

    // Construct initial WebSocket URL (Public)
    let streamUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`

    // Attempt to get signed URL if API key is present
    if (apiKey) {
      console.log('[Twilio] Attempting to generate Signed URL...')
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
            console.log('[Twilio] Successfully generated Signed URL.')
          } else {
            console.warn('[Twilio] Response ok but no signed_url field:', data)
          }
        } else {
           const errorText = await signedUrlRes.text()
           console.warn(`[Twilio] Failed to get signed URL. Status: ${signedUrlRes.status}. Response: ${errorText}`)
        }
      } catch (e) {
        console.warn('[Twilio] Exception fetching signed URL:', e)
      }
    } else {
      console.log('[Twilio] No API Key found, using Public URL.')
    }

    console.log(`[Twilio] Final Stream URL: ${streamUrl}`)

    // Connect to ElevenLabs
    const connect = response.connect()
    const stream = connect.stream({
      url: streamUrl
    })
    
    // Optional: Pass parameters for debugging on ElevenLabs side if supported
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
