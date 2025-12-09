-- ============================================
-- AURIX v2.1 - Clinician Escalations Table
-- Run this in Supabase SQL Editor
-- ============================================

-- Create clinician_escalations table to track medical advice escalations
CREATE TABLE IF NOT EXISTS clinician_escalations (
  id SERIAL PRIMARY KEY,
  call_sid TEXT NOT NULL,
  customer_id TEXT REFERENCES customers(customer_id),
  
  -- Escalation details
  inquiry_type TEXT NOT NULL, -- 'side_effects', 'dosage', 'medical_advice', 'drug_interaction'
  inquiry_text TEXT NOT NULL, -- The actual question asked
  
  -- Compliance info
  blocked_reason TEXT NOT NULL, -- 'medical_advice_prohibited', 'requires_licensed_clinician'
  escalation_status TEXT DEFAULT 'pending', -- 'pending', 'assigned', 'resolved'
  
  -- Agent response
  agent_response TEXT, -- What the agent said when escalating
  
  -- Tracking
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved_by TEXT -- Clinician name/ID if resolved
);

-- Enable realtime for clinician_escalations
ALTER PUBLICATION supabase_realtime ADD TABLE clinician_escalations;

-- Create index for efficient queries
CREATE INDEX idx_escalations_call_sid ON clinician_escalations(call_sid);
CREATE INDEX idx_escalations_status ON clinician_escalations(escalation_status);
CREATE INDEX idx_escalations_created ON clinician_escalations(created_at DESC);

