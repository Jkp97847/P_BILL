import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://emcbpoliqbxoqeojobxg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FMyRHwB5zheKYJHOolcW1w_9pyqLm9T';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspect() {
  const tables = ['users', 'platform_config', 'shop_settings', 'nongst_bills', 'gst_bills', 'gst_inventory', 'gst_purchases', 'recharge_bills'];
  for (const t of tables) {
    const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' });
    if (error) {
      console.log(`Table ${t}: Error ->`, error.message);
    } else {
      console.log(`Table ${t}: Count = ${count ?? data?.length}`);
      if (data && data.length > 0 && t === 'shop_settings') {
        console.log('  shop_settings sample:', data.map(d => ({ seller_id: d.seller_id, module: d.module, firmName: d.settings?.firmName })));
      }
      if (data && data.length > 0 && t === 'nongst_bills') {
        console.log('  nongst_bills sample:', data.map(d => ({ bill_no: d.bill_no, customer: d.customer_name })));
      }
      if (data && data.length > 0 && t === 'gst_bills') {
        console.log('  gst_bills sample:', data.map(d => ({ invoice_no: d.invoice_no, customer: d.customer_name })));
      }
    }
  }
}

inspect();
