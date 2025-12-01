export type EventType = 
  | 'call_started'
  | 'user_spoke'
  | 'agent_thinking'
  | 'querying'
  | 'results'
  | 'agent_spoke'
  | 'action'
  | 'call_ended'

export interface CallEvent {
  id: string
  call_sid: string
  event_type: EventType
  event_data: Record<string, any>
  created_at: string
}

export interface Order {
  id: number
  order_number: string
  customer_name: string
  status: string
  order_date: string
  delivery_date: string
  tracking_number: string
  notes?: string
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  account_manager: string
}

export interface CallLog {
  id: string
  call_sid: string
  customer_name: string
  order_number: string
  call_duration: number
  transcript: Message[]
  resolution: string
  sentiment: string
  created_at: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

