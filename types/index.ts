export type EventType = 
  | 'call_started'
  | 'user_spoke'
  | 'agent_thinking'
  | 'understanding'      // New: Intent classification
  | 'compliance_check'   // New: Compliance/verification checks
  | 'querying'
  | 'results'
  | 'agent_spoke'
  | 'action'
  | 'call_ended'

export interface CallEvent {
  id: string
  call_sid: string
  customer_id?: string
  event_type: EventType
  event_data: Record<string, any>
  created_at: string
}

export interface Customer {
  id: number
  customer_id: string
  name: string
  email: string
  phone: string
  date_of_birth?: string
  customer_ltv: number
  order_count: number
  vip_tier: 'standard' | 'gold' | 'platinum'
  subscription_status: 'none' | 'active' | 'paused'
  privacy_flag: 'normal' | 'high' | 'maximum'
  discreet_packaging: boolean
  security_last4_digits?: string
}

export interface Prescription {
  id: number
  prescription_id: string
  customer_id: string
  product_name: string
  product_category: 'hair_loss' | 'ed' | 'mental_health'
  dosage?: string
  prescriber_name: string
  prescription_status: 'active' | 'expired' | 'cancelled'
  refills_remaining: number
  refill_date?: string
  expires_at?: string
}

export interface Order {
  id: number
  order_id: string
  customer_id: string
  prescription_id?: string
  product_name: string
  quantity: number
  order_status: 'processing' | 'in_transit' | 'delivered'
  estimated_delivery?: string
  tracking_number?: string
  delivery_address_type: 'home' | 'office'
  discreet_packaging: boolean
  order_total: number
}

export interface Billing {
  id: number
  customer_id: string
  card_last4: string
  card_expiry?: string
  billing_status: 'active' | 'failed' | 'expired'
  next_billing_date?: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Legacy types (kept for backwards compatibility)
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
