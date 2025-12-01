-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Orders table (mock customer data)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL,
  order_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  tracking_number TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  account_manager TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Call logs (stores complete interactions)
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_sid TEXT UNIQUE NOT NULL,
  customer_name TEXT,
  order_number TEXT,
  call_duration INTEGER DEFAULT 0,
  transcript JSONB DEFAULT '[]'::jsonb,
  resolution TEXT,
  sentiment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Call events (real-time event stream)
CREATE TABLE call_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_sid TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_call_events_call_sid ON call_events(call_sid);
CREATE INDEX idx_call_events_created_at ON call_events(created_at DESC);
CREATE INDEX idx_call_logs_call_sid ON call_logs(call_sid);

-- Enable realtime for call_events (CRITICAL)
ALTER PUBLICATION supabase_realtime ADD TABLE call_events;

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_events ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for demo purposes (allows anon/public access)
-- In a real production app, you would restrict these based on auth.uid()
CREATE POLICY "Enable read access for all users" ON orders FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON call_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON call_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON call_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON call_events FOR SELECT USING (true);

-- Insert mock orders (including Order #417 for demo)
INSERT INTO orders (order_number, customer_name, status, order_date, delivery_date, tracking_number, notes) VALUES
('417', 'Tom', 'Rescheduled', '2025-01-10', '2025-01-17', 'TRK789012', 'Delivery rescheduled due to weather. Customer notified.'),
('418', 'Sarah Johnson', 'Delivered', '2025-01-12', '2025-01-16', 'TRK789013', 'Delivered successfully to front door'),
('419', 'Mike Wilson', 'In Transit', '2025-01-14', '2025-01-18', 'TRK789014', 'Out for delivery'),
('420', 'Emily Brown', 'Processing', '2025-01-15', '2025-01-20', 'TRK789015', 'Order confirmed, preparing shipment'),
('421', 'David Lee', 'Delayed', '2025-01-11', '2025-01-22', 'TRK789016', 'Delayed due to customs clearance'),
('422', 'Lisa Chen', 'Delivered', '2025-01-08', '2025-01-13', 'TRK789017', 'Signed by recipient'),
('423', 'James Taylor', 'Shipped', '2025-01-13', '2025-01-19', 'TRK789018', 'In transit to distribution center'),
('424', 'Anna Martinez', 'Delivered', '2025-01-09', '2025-01-14', 'TRK789019', 'Left with neighbor'),
('425', 'Robert King', 'Processing', '2025-01-16', '2025-01-21', 'TRK789020', 'Awaiting payment confirmation'),
('426', 'Jennifer White', 'In Transit', '2025-01-14', '2025-01-17', 'TRK789021', 'Expected delivery tomorrow'),
('427', 'Michael Brown', 'Delivered', '2025-01-07', '2025-01-12', 'TRK789022', 'Delivery completed'),
('428', 'Jessica Davis', 'Shipped', '2025-01-15', '2025-01-20', 'TRK789023', 'Departed from warehouse'),
('429', 'Christopher Moore', 'Delivered', '2025-01-06', '2025-01-11', 'TRK789024', 'Successful delivery'),
('430', 'Amanda Garcia', 'In Transit', '2025-01-13', '2025-01-18', 'TRK789025', 'On delivery vehicle'),
('431', 'Daniel Rodriguez', 'Processing', '2025-01-16', '2025-01-22', 'TRK789026', 'Order received');

-- Insert mock customers
INSERT INTO customers (name, email, phone, account_manager) VALUES
('Tom', 'tom@example.com', '+44 7700 900001', 'Sarah Chen'),
('Sarah Johnson', 'sarah.j@example.com', '+44 7700 900002', 'Mike Rodriguez'),
('Mike Wilson', 'mike.w@example.com', '+44 7700 900003', 'Sarah Chen'),
('Emily Brown', 'emily.b@example.com', '+44 7700 900004', 'Jennifer Lopez'),
('David Lee', 'david.l@example.com', '+44 7700 900005', 'Mike Rodriguez'),
('Lisa Chen', 'lisa.c@example.com', '+44 7700 900006', 'Sarah Chen'),
('James Taylor', 'james.t@example.com', '+44 7700 900007', 'Jennifer Lopez'),
('Anna Martinez', 'anna.m@example.com', '+44 7700 900008', 'Mike Rodriguez'),
('Robert King', 'robert.k@example.com', '+44 7700 900009', 'Sarah Chen'),
('Jennifer White', 'jennifer.w@example.com', '+44 7700 900010', 'Jennifer Lopez');
