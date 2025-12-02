import { supabase, supabaseAdmin } from './client'
import type { CallEvent, Order } from '@/types'

export async function insertCallEvent(event: Omit<CallEvent, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('call_events')
    .insert(event)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getCallEvents(callSid: string) {
  const { data, error } = await supabase
    .from('call_events')
    .select('*')
    .eq('call_sid', callSid)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data as CallEvent[]
}

export async function queryOrder(orderNumber: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single()
  
  if (error) throw error
  return data as Order
}

export async function executeSQL(sql: string) {
  // This is a simplified version - in production, use Supabase RPC
  // For demo, we'll parse simple SELECT queries
  // Note: 'execute_query' RPC function must be created in Supabase
  const { data, error} = await supabaseAdmin.rpc('execute_query', { query: sql })
  
  if (error) throw error
  return data
}



