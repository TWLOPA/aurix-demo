import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function extractEntities(userSpeech: string) {
  const prompt = `Extract structured information from this customer query:
"${userSpeech}"

Return ONLY valid JSON with this structure (no markdown, no explanation):
{
  "order_number": "string or null",
  "customer_name": "string or null",
  "issue_type": "delivery_delay|order_status|account_info|other",
  "expected_date": "string or null",
  "sentiment": "positive|neutral|concerned|angry"
}

If a field cannot be determined, use null.`

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  
  // Clean potential markdown
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    console.error("Failed to parse entities JSON", cleaned)
    return {}
  }
}

export async function generateSQL(entities: any) {
  const prompt = `Generate a SQLite query for this customer request.
Extracted information:
${JSON.stringify(entities, null, 2)}

Database schema:
- orders: id, order_number, customer_name, status, order_date, delivery_date, tracking_number, notes
- customers: id, name, email, phone, account_manager

Rules:
1. Return ONLY the SQL query, nothing else
2. Use single quotes for strings
3. If order_number exists, query orders table
4. If asking about account manager, join customers table
5. If query is impossible, return "INVALID"

Example queries:
- SELECT status, delivery_date, tracking_number FROM orders WHERE order_number = '417'
- SELECT account_manager FROM customers WHERE name LIKE '%Tom%'`

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }]
  })

  const sql = response.content[0].type === 'text' ? response.content[0].text.trim() : 'INVALID'
  
  return sql
}

export async function formatResponse(results: any, entities: any) {
  const prompt = `Format a natural customer service response.
Customer question context:
${JSON.stringify(entities, null, 2)}

Database results:
${JSON.stringify(results, null, 2)}

Create a helpful, conversational response (2-3 sentences max).
Be empathetic if there's a problem. Include relevant details.`

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }]
  })

  return response.content[0].type === 'text' ? response.content[0].text : 'I can help you with that.'
}

