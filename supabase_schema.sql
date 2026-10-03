-- ============================================================================
-- SMART BILLING CLOUD DATABASE SETUP (SUPABASE)
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'seller',
  status TEXT DEFAULT 'approved',
  profile JSONB DEFAULT '{}'::jsonb,
  allowed_modules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. PLATFORM CONFIGURATION
CREATE TABLE IF NOT EXISTS public.platform_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.platform_config DISABLE ROW LEVEL SECURITY;

-- 3. SHOP SETTINGS (For Non-GST, GST, and Recharge modules per seller)
CREATE TABLE IF NOT EXISTS public.shop_settings (
  seller_id TEXT NOT NULL,
  module TEXT NOT NULL,
  settings JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (seller_id, module)
);
ALTER TABLE public.shop_settings DISABLE ROW LEVEL SECURITY;

-- 4. NON-GST BILLS (Tab 2)
CREATE TABLE IF NOT EXISTS public.nongst_bills (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  bill_no TEXT,
  customer_name TEXT,
  customer_mobile TEXT,
  bill_date TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  bill_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_nongst_bills_seller ON public.nongst_bills (seller_id);
ALTER TABLE public.nongst_bills DISABLE ROW LEVEL SECURITY;

-- 5. GST BILLS (Tab 1)
CREATE TABLE IF NOT EXISTS public.gst_bills (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  invoice_no TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  bill_date TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  grand_total NUMERIC DEFAULT 0,
  bill_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gst_bills_seller ON public.gst_bills (seller_id);
ALTER TABLE public.gst_bills DISABLE ROW LEVEL SECURITY;

-- 6. GST INVENTORY (Tab 1)
CREATE TABLE IF NOT EXISTS public.gst_inventory (
  id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  item_name TEXT,
  item_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (seller_id, id)
);
CREATE INDEX IF NOT EXISTS idx_gst_inventory_seller ON public.gst_inventory (seller_id);
ALTER TABLE public.gst_inventory DISABLE ROW LEVEL SECURITY;

-- 7. GST PURCHASES (Tab 1)
CREATE TABLE IF NOT EXISTS public.gst_purchases (
  id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  purchase_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (seller_id, id)
);
CREATE INDEX IF NOT EXISTS idx_gst_purchases_seller ON public.gst_purchases (seller_id);
ALTER TABLE public.gst_purchases DISABLE ROW LEVEL SECURITY;

-- 8. RECHARGE BILLS (Tab 3)
CREATE TABLE IF NOT EXISTS public.recharge_bills (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  operator TEXT,
  mobile_or_account TEXT,
  amount NUMERIC DEFAULT 0,
  bill_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recharge_bills_seller ON public.recharge_bills (seller_id);
ALTER TABLE public.recharge_bills DISABLE ROW LEVEL SECURITY;
