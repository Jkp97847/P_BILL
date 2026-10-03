import { supabase } from './supabaseClient.js';

/**
 * Universal safe wrapper for Supabase calls to ensure the app never crashes
 * even if offline or if network blinks.
 */
const safeCall = async (fn, fallback = null) => {
  try {
    return await fn();
  } catch (err) {
    console.warn('[Supabase Sync Warn]:', err?.message || err);
    return fallback;
  }
};

const getSellerIdList = (sellerId) => {
  const s = String(sellerId || '').trim();
  if (s === 'seller_demo' || s === 'seller1') {
    return ['seller_demo', 'seller1'];
  }
  return [s];
};

// ============================================================================
// 1. USERS & PLATFORM CONFIG
// ============================================================================

export async function fetchUsersFromCloud() {
  return safeCall(async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return data.map(u => ({
      id: u.id,
      username: u.username,
      password: u.password,
      role: u.role,
      status: u.status,
      createdAt: u.created_at,
      allowedModules: u.allowed_modules || {},
      profile: u.profile || {}
    }));
  }, null);
}

export async function saveUserToCloud(user) {
  if (!user || !user.id || !user.username) return;
  return safeCall(async () => {
    const payload = {
      id: String(user.id),
      username: String(user.username).trim().toLowerCase(),
      password: user.password,
      role: user.role || 'seller',
      status: user.status || 'approved',
      profile: user.profile || {},
      allowed_modules: user.allowedModules || {},
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  });
}

export async function deleteUserFromCloud(userId) {
  if (!userId) return;
  return safeCall(async () => {
    const { error } = await supabase.from('users').delete().eq('id', String(userId));
    if (error) throw error;
  });
}

export async function bulkSyncUsersToCloud(usersList) {
  if (!Array.isArray(usersList) || usersList.length === 0) return;
  return safeCall(async () => {
    const rows = usersList.map(u => ({
      id: String(u.id),
      username: String(u.username).trim().toLowerCase(),
      password: u.password,
      role: u.role || 'seller',
      status: u.status || 'approved',
      profile: u.profile || {},
      allowed_modules: u.allowedModules || {},
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('users').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  });
}

export async function fetchPlatformConfigFromCloud() {
  return safeCall(async () => {
    const { data, error } = await supabase.from('platform_config').select('value').eq('key', 'main').single();
    if (error) return null;
    return data?.value || null;
  }, null);
}

export async function savePlatformConfigToCloud(config) {
  return safeCall(async () => {
    const { error } = await supabase.from('platform_config').upsert({
      key: 'main',
      value: config,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });
    if (error) throw error;
  });
}

// ============================================================================
// 2. SHOP SETTINGS (Per Seller & Per Module)
// ============================================================================

export async function fetchShopSettingsFromCloud(sellerId, module) {
  if (!sellerId || !module) return null;
  return safeCall(async () => {
    const ids = getSellerIdList(sellerId);
    const { data, error } = await supabase
      .from('shop_settings')
      .select('settings')
      .in('seller_id', ids)
      .eq('module', String(module))
      .order('updated_at', { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return data[0]?.settings || null;
  }, null);
}

export async function saveShopSettingsToCloud(sellerId, module, settings) {
  if (!sellerId || !module || !settings) return;
  return safeCall(async () => {
    const ids = getSellerIdList(sellerId);
    const rows = ids.map(sId => ({
      seller_id: sId,
      module: String(module),
      settings: settings,
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('shop_settings').upsert(rows, { onConflict: 'seller_id,module' });
    if (error) throw error;
  });
}

// ============================================================================
// 3. NON-GST BILLS (Tab 2)
// ============================================================================

export async function fetchNonGstBillsFromCloud(sellerId) {
  if (!sellerId) return null;
  return safeCall(async () => {
    const ids = getSellerIdList(sellerId);
    const { data, error } = await supabase
      .from('nongst_bills')
      .select('*')
      .in('seller_id', ids)
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data) return null;

    const seen = new Set();
    const uniqueBills = [];
    for (const row of data) {
      const key = String(row.bill_no || row.id).trim();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueBills.push({
          ...(row.bill_data || {}),
          id: row.id,
          billNo: row.bill_no || row.bill_data?.billNo,
          customerName: row.customer_name || row.bill_data?.customerName,
          customerMobile: row.customer_mobile || row.bill_data?.customerMobile,
          date: row.bill_date || row.bill_data?.date,
          items: row.items || row.bill_data?.items || [],
          subtotal: Number(row.subtotal) || row.bill_data?.subtotal || 0,
          discount: Number(row.discount) || row.bill_data?.discount || 0,
          grandTotal: Number(row.grand_total) || row.bill_data?.grandTotal || 0,
          createdAt: row.created_at || row.bill_data?.createdAt
        });
      }
    }
    return uniqueBills;
  }, null);
}

export async function saveNonGstBillToCloud(sellerId, bill) {
  if (!sellerId || !bill || !bill.id) return;
  return safeCall(async () => {
    const primaryId = getSellerIdList(sellerId)[0];
    const row = {
      id: String(bill.id),
      seller_id: primaryId,
      bill_no: bill.billNo || '',
      customer_name: bill.customerName || '',
      customer_mobile: bill.customerMobile || '',
      bill_date: bill.date || '',
      items: bill.items || [],
      subtotal: Number(bill.subtotal) || 0,
      discount: Number(bill.discount) || 0,
      grand_total: Number(bill.grandTotal) || 0,
      bill_data: bill,
      created_at: bill.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('nongst_bills').upsert(row, { onConflict: 'id' });
    if (error) throw error;
  });
}

export async function deleteNonGstBillFromCloud(billId) {
  if (!billId) return;
  return safeCall(async () => {
    const { error } = await supabase.from('nongst_bills').delete().eq('id', String(billId));
    if (error) throw error;
  });
}

export async function bulkSyncNonGstBillsToCloud(sellerId, billsList) {
  if (!sellerId || !Array.isArray(billsList) || billsList.length === 0) return;
  return safeCall(async () => {
    const primaryId = getSellerIdList(sellerId)[0];
    const rows = billsList.map(b => ({
      id: String(b.id || `bill-${Date.now()}-${Math.random()}`),
      seller_id: primaryId,
      bill_no: b.billNo || '',
      customer_name: b.customerName || '',
      customer_mobile: b.customerMobile || '',
      bill_date: b.date || '',
      items: b.items || [],
      subtotal: Number(b.subtotal) || 0,
      discount: Number(b.discount) || 0,
      grand_total: Number(b.grandTotal) || 0,
      bill_data: b,
      created_at: b.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('nongst_bills').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  });
}

// ============================================================================
// 4. GST BILLS (Tab 1)
// ============================================================================

export async function fetchGstBillsFromCloud(sellerId) {
  if (!sellerId) return null;
  return safeCall(async () => {
    const ids = getSellerIdList(sellerId);
    const { data, error } = await supabase
      .from('gst_bills')
      .select('*')
      .in('seller_id', ids)
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data) return null;

    const seen = new Set();
    const uniqueBills = [];
    for (const row of data) {
      const key = String(row.invoice_no || row.id).trim();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueBills.push({
          ...(row.bill_data || {}),
          id: row.id,
          invoiceNo: row.invoice_no || row.bill_data?.invoiceNo,
          customerName: row.customer_name || row.bill_data?.customerName,
          customerPhone: row.customer_phone || row.bill_data?.customerPhone,
          date: row.bill_date || row.bill_data?.date,
          items: row.items || row.bill_data?.items || [],
          grandTotal: Number(row.grand_total) || row.bill_data?.grandTotal || 0,
          createdAt: row.created_at || row.bill_data?.createdAt
        });
      }
    }
    return uniqueBills;
  }, null);
}

export async function saveGstBillToCloud(sellerId, bill) {
  if (!sellerId || !bill || !bill.id) return;
  return safeCall(async () => {
    const primaryId = getSellerIdList(sellerId)[0];
    const row = {
      id: String(bill.id),
      seller_id: primaryId,
      invoice_no: bill.invoiceNo || bill.billNo || '',
      customer_name: bill.customerName || '',
      customer_phone: bill.customerPhone || bill.customerMobile || '',
      bill_date: bill.date || '',
      items: bill.items || [],
      grand_total: Number(bill.grandTotal) || 0,
      bill_data: bill,
      created_at: bill.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('gst_bills').upsert(row, { onConflict: 'id' });
    if (error) throw error;
  });
}

export async function deleteGstBillFromCloud(billId) {
  if (!billId) return;
  return safeCall(async () => {
    const { error } = await supabase.from('gst_bills').delete().eq('id', String(billId));
    if (error) throw error;
  });
}

export async function bulkSyncGstBillsToCloud(sellerId, billsList) {
  if (!sellerId || !Array.isArray(billsList) || billsList.length === 0) return;
  return safeCall(async () => {
    const primaryId = getSellerIdList(sellerId)[0];
    const rows = billsList.map(b => ({
      id: String(b.id || `gst-${Date.now()}-${Math.random()}`),
      seller_id: primaryId,
      invoice_no: b.invoiceNo || b.billNo || '',
      customer_name: b.customerName || '',
      customer_phone: b.customerPhone || b.customerMobile || '',
      bill_date: b.date || '',
      items: b.items || [],
      grand_total: Number(b.grandTotal) || 0,
      bill_data: b,
      created_at: b.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('gst_bills').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  });
}

// ============================================================================
// 5. GST INVENTORY & PURCHASES (Tab 1)
// ============================================================================

export async function fetchGstInventoryFromCloud(sellerId) {
  if (!sellerId) return null;
  return safeCall(async () => {
    const ids = getSellerIdList(sellerId);
    const { data, error } = await supabase
      .from('gst_inventory')
      .select('*')
      .in('seller_id', ids);
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return data.map(r => r.item_data || r);
  }, null);
}

export async function bulkSyncGstInventoryToCloud(sellerId, itemsList) {
  if (!sellerId || !Array.isArray(itemsList)) return;
  return safeCall(async () => {
    if (itemsList.length === 0) return;
    const primaryId = getSellerIdList(sellerId)[0];
    const rows = itemsList.map(item => ({
      id: String(item.id || item.code || Math.random()),
      seller_id: primaryId,
      item_name: item.name || '',
      item_data: item,
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('gst_inventory').upsert(rows, { onConflict: 'seller_id,id' });
    if (error) throw error;
  });
}

export async function fetchGstPurchasesFromCloud(sellerId) {
  if (!sellerId) return null;
  return safeCall(async () => {
    const ids = getSellerIdList(sellerId);
    const { data, error } = await supabase
      .from('gst_purchases')
      .select('*')
      .in('seller_id', ids);
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return data.map(r => r.purchase_data || r);
  }, null);
}

export async function bulkSyncGstPurchasesToCloud(sellerId, purchasesList) {
  if (!sellerId || !Array.isArray(purchasesList)) return;
  return safeCall(async () => {
    if (purchasesList.length === 0) return;
    const primaryId = getSellerIdList(sellerId)[0];
    const rows = purchasesList.map(p => ({
      id: String(p.id || Math.random()),
      seller_id: primaryId,
      purchase_data: p,
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('gst_purchases').upsert(rows, { onConflict: 'seller_id,id' });
    if (error) throw error;
  });
}

// ============================================================================
// 6. RECHARGE & UTILITY BILLS (Tab 3)
// ============================================================================

export async function fetchRechargeBillsFromCloud(sellerId) {
  if (!sellerId) return null;
  return safeCall(async () => {
    const ids = getSellerIdList(sellerId);
    const { data, error } = await supabase
      .from('recharge_bills')
      .select('*')
      .in('seller_id', ids)
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return data.map(row => ({
      ...(row.bill_data || {}),
      id: row.id,
      operator: row.operator || row.bill_data?.operator,
      mobileOrAccount: row.mobile_or_account || row.bill_data?.mobileOrAccount,
      amount: Number(row.amount) || row.bill_data?.amount || 0,
      createdAt: row.created_at || row.bill_data?.createdAt
    }));
  }, null);
}

export async function saveRechargeBillToCloud(sellerId, bill) {
  if (!sellerId || !bill || !bill.id) return;
  return safeCall(async () => {
    const primaryId = getSellerIdList(sellerId)[0];
    const row = {
      id: String(bill.id),
      seller_id: primaryId,
      operator: bill.operator || bill.serviceName || '',
      mobile_or_account: bill.mobile || bill.consumerNumber || bill.policyNumber || '',
      amount: Number(bill.amount) || 0,
      bill_data: bill,
      created_at: bill.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('recharge_bills').upsert(row, { onConflict: 'id' });
    if (error) throw error;
  });
}

export async function deleteRechargeBillFromCloud(billId) {
  if (!billId) return;
  return safeCall(async () => {
    const { error } = await supabase.from('recharge_bills').delete().eq('id', String(billId));
    if (error) throw error;
  });
}

export async function bulkSyncRechargeBillsToCloud(sellerId, billsList) {
  if (!sellerId || !Array.isArray(billsList) || billsList.length === 0) return;
  return safeCall(async () => {
    const primaryId = getSellerIdList(sellerId)[0];
    const rows = billsList.map(b => ({
      id: String(b.id || `rec-${Date.now()}-${Math.random()}`),
      seller_id: primaryId,
      operator: b.operator || b.serviceName || '',
      mobile_or_account: b.mobile || b.consumerNumber || b.policyNumber || '',
      amount: Number(b.amount) || 0,
      bill_data: b,
      created_at: b.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('recharge_bills').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  });
}
