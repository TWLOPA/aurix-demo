-- ============================================
-- AURIX v2.0 - Health E-commerce Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Clean slate (drop old tables if they exist)
DROP TABLE IF EXISTS call_events CASCADE;
DROP TABLE IF EXISTS billing CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  customer_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  postcode TEXT, -- For identity verification (HIPAA/GDPR)
  
  -- VIP/Loyalty data
  customer_ltv DECIMAL(10,2) DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  vip_tier TEXT DEFAULT 'standard', -- 'standard', 'gold', 'platinum'
  subscription_status TEXT DEFAULT 'none', -- 'none', 'active', 'paused'
  
  -- Privacy preferences
  privacy_flag TEXT DEFAULT 'normal', -- 'normal', 'high', 'maximum'
  discreet_packaging BOOLEAN DEFAULT true,
  
  -- Security
  security_last4_digits TEXT, -- last 4 of card for verification
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE prescriptions (
  id SERIAL PRIMARY KEY,
  prescription_id TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES customers(customer_id),
  
  -- Product details
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL, -- 'hair_loss', 'ed', 'mental_health'
  dosage TEXT,
  
  -- Prescription info
  prescriber_name TEXT NOT NULL,
  prescription_status TEXT DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  refills_remaining INTEGER DEFAULT 0,
  refill_date DATE,
  expires_at DATE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES customers(customer_id),
  prescription_id TEXT REFERENCES prescriptions(prescription_id),
  
  -- Order details
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  order_status TEXT DEFAULT 'processing', -- 'processing', 'in_transit', 'delivered'
  
  -- Delivery
  estimated_delivery DATE,
  tracking_number TEXT,
  delivery_address_type TEXT DEFAULT 'home', -- 'home', 'office'
  discreet_packaging BOOLEAN DEFAULT true,
  
  -- Pricing
  order_total DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  shipped_at TIMESTAMP
);

-- ============================================
-- BILLING TABLE
-- ============================================
CREATE TABLE billing (
  id SERIAL PRIMARY KEY,
  customer_id TEXT REFERENCES customers(customer_id),
  
  card_last4 TEXT NOT NULL,
  card_expiry TEXT, -- 'MM/YY'
  billing_status TEXT DEFAULT 'active', -- 'active', 'failed', 'expired'
  next_billing_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CALL EVENTS TABLE (Audit Trail)
-- ============================================
CREATE TABLE call_events (
  id SERIAL PRIMARY KEY,
  call_sid TEXT NOT NULL,
  customer_id TEXT,
  
  event_type TEXT NOT NULL, -- 'understanding', 'compliance_check', 'querying', 'results', 'action'
  event_data JSONB NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE call_events;

-- ============================================
-- SEED DATA - 3 CUSTOMER SCENARIOS
-- ============================================

-- Scenario 1: Standard customer with medical question
INSERT INTO customers (customer_id, name, email, phone, customer_ltv, order_count, vip_tier, subscription_status, security_last4_digits, date_of_birth, postcode)
VALUES 
('CUST_001', 'John Smith', 'john@example.com', '+447123456789', 850.00, 3, 'standard', 'none', '4532', '1985-03-15', 'SW1A 1AA');

INSERT INTO prescriptions (prescription_id, customer_id, product_name, product_category, dosage, prescriber_name, prescription_status, refills_remaining, refill_date, expires_at)
VALUES 
('RX_001', 'CUST_001', 'Finasteride 1mg', 'hair_loss', '1mg daily', 'Dr. Sarah Johnson', 'active', 2, '2025-02-15', '2025-12-31');

INSERT INTO orders (order_id, customer_id, prescription_id, product_name, quantity, order_status, estimated_delivery, tracking_number, order_total)
VALUES 
('ORD_7823', 'CUST_001', 'RX_001', 'Finasteride 1mg', 90, 'in_transit', '2025-01-22', 'TRK789012', 45.00);

INSERT INTO billing (customer_id, card_last4, card_expiry, billing_status, next_billing_date)
VALUES 
('CUST_001', '4532', '08/26', 'active', '2025-02-15');

-- Scenario 2: Subscription customer needing refill
INSERT INTO customers (customer_id, name, email, phone, customer_ltv, order_count, vip_tier, subscription_status, security_last4_digits, date_of_birth, privacy_flag, postcode)
VALUES 
('CUST_002', 'Michael Chen', 'michael@example.com', '+447987654321', 1200.00, 8, 'gold', 'active', '8765', '1978-07-22', 'normal', 'EC1A 1BB');

INSERT INTO prescriptions (prescription_id, customer_id, product_name, product_category, dosage, prescriber_name, prescription_status, refills_remaining, refill_date, expires_at)
VALUES 
('RX_002', 'CUST_002', 'Tadalafil 5mg', 'ed', '5mg daily', 'Dr. Robert Martinez', 'active', 2, '2025-01-28', '2025-11-30');

INSERT INTO orders (order_id, customer_id, prescription_id, product_name, quantity, order_status, estimated_delivery, tracking_number, order_total)
VALUES 
('ORD_8901', 'CUST_002', 'RX_002', 'Tadalafil 5mg', 30, 'processing', '2025-01-24', NULL, 65.00);

INSERT INTO billing (customer_id, card_last4, card_expiry, billing_status, next_billing_date)
VALUES 
('CUST_002', '8765', '02/25', 'active', '2025-01-28');

-- Scenario 3: VIP customer with privacy concern
INSERT INTO customers (customer_id, name, email, phone, customer_ltv, order_count, vip_tier, subscription_status, security_last4_digits, date_of_birth, privacy_flag, discreet_packaging, postcode)
VALUES 
('CUST_003', 'David Miller', 'david@example.com', '+447555123456', 3200.00, 18, 'gold', 'active', '2468', '1982-11-08', 'high', true, 'W1D 3QF');

INSERT INTO prescriptions (prescription_id, customer_id, product_name, product_category, dosage, prescriber_name, prescription_status, refills_remaining, refill_date, expires_at)
VALUES 
('RX_003', 'CUST_003', 'Sildenafil 50mg', 'ed', '50mg as needed', 'Dr. Emily Wong', 'active', 3, '2025-02-10', '2026-01-15');

INSERT INTO orders (order_id, customer_id, prescription_id, product_name, quantity, order_status, estimated_delivery, tracking_number, order_total, delivery_address_type)
VALUES 
('ORD_9012', 'CUST_003', 'RX_003', 'Sildenafil 50mg', 12, 'in_transit', '2025-01-23', 'TRK345678', 85.00, 'office');

INSERT INTO billing (customer_id, card_last4, card_expiry, billing_status, next_billing_date)
VALUES 
('CUST_003', '2468', '05/27', 'active', '2025-02-08');

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify:
-- SELECT * FROM customers;
-- SELECT * FROM prescriptions;
-- SELECT * FROM orders;
-- SELECT * FROM billing;

