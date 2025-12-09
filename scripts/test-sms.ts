// Test script for Twilio SMS
// Run with: npx tsx scripts/test-sms.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN
const TWILIO_NUMBER = process.env.TWILIO_PHONE_NUMBER

const TEST_RECIPIENT = '+447540166083'

async function sendTestSMS() {
  console.log('========================================')
  console.log('AURIX SMS Test Script')
  console.log('========================================')
  console.log('')
  console.log('Configuration:')
  console.log(`  Twilio SID: ${TWILIO_SID?.substring(0, 10)}...`)
  console.log(`  Twilio Number: ${TWILIO_NUMBER}`)
  console.log(`  Recipient: ${TEST_RECIPIENT}`)
  console.log('')

  if (!TWILIO_SID || !TWILIO_AUTH || !TWILIO_NUMBER) {
    console.error('❌ Missing Twilio credentials in .env.local')
    process.exit(1)
  }

  const message = `AURIX Demo Test: This is a test SMS from the AURIX Health Support Agent demo. Sent at ${new Date().toLocaleTimeString()}`

  console.log('Sending SMS...')
  console.log(`  Message: "${message}"`)
  console.log('')

  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
    
    const formData = new URLSearchParams({
      To: TEST_RECIPIENT,
      From: TWILIO_NUMBER,
      Body: message
    })

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Twilio Error:')
      console.error(JSON.stringify(result, null, 2))
      process.exit(1)
    }

    console.log('✅ SMS Sent Successfully!')
    console.log('')
    console.log('Response:')
    console.log(`  Message SID: ${result.sid}`)
    console.log(`  Status: ${result.status}`)
    console.log(`  To: ${result.to}`)
    console.log(`  From: ${result.from}`)
    console.log('')
    console.log('========================================')
    console.log('Check your phone for the message!')
    console.log('========================================')

  } catch (error) {
    console.error('❌ Error sending SMS:', error)
    process.exit(1)
  }
}

sendTestSMS()

