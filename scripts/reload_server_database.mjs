import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_SETTINGS,
  INITIAL_INVENTORY,
  INITIAL_PURCHASES,
  INITIAL_GST_BILLS
} from '../src/data/sampleData.js';

const SUPABASE_URL = 'https://emcbpoliqbxoqeojobxg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FMyRHwB5zheKYJHOolcW1w_9pyqLm9T';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DEFAULT_SELLER1_NON_GST_SETTINGS = {
  firmName: 'SHREE HARIPRIY COMPUTER SALE AND SERVICE',
  tagline: 'हमारे पास सभी प्रकार के कंप्यूटर, प्रिंटर और सीसीटीवी कैमरा उपलब्ध हैं',
  address: 'मेन मार्केट,मोमासर,बीकानेर (राज.)',
  mobile: '9784730824',
  alternateMobile: '8005809671',
  email: 'shreeharipriy@gmail.com',
  bankName: 'भारतीय स्टेट बैंक (SBI)',
  accountNo: '61098663856',
  ifsc: 'SBIN0031338',
  branch: 'MOMASAR',
  upiId: '9784730824229@PTSBI',
  logo: '',
  showGaneshLogo: true,
  ganeshText: '॥ श्री गणेशाय नमः ॥',
  terms: [
    'बिका हुआ माल चेक करके लें।',
    'गारंटी / वारंटी के लिए कंपनी से संपर्क करें।',
    'भूल चूक लेनी देनी होगी (E. & O.E.)।'
  ],
  signatoryText: 'अधिकृत हस्ताक्षरकर्ता / Authorized Signatory',
  ownerName: 'JAGDISH PRAJAPAT(PRO)',
  billPrefix: 'INV-',
  nextBillSeq: 485,
  selectedTheme: 'classic',
  displayOptions: {
    showFirmName: true,
    showTagline: true,
    showLogo: true,
    showAddress: true,
    showMobile: true,
    showAlternateMobile: true,
    showEmail: true,
    showBankDetails: true,
    showUpiQr: true,
    showGaneshLogo: true,
    showTerms: true,
    showSignatory: true,
    showWords: true
  }
};

const DEFAULT_SELLER1_NON_GST_BILLS = [
  {
    id: "bill-1790565924035",
    billNo: "INV-484",
    date: "2026-09-28",
    customerName: "MAHAVEER SUTHAR",
    customerMobile: "8769765998",
    items: [
      { id: "item-1", name: "CAMERA INSTALLATION", qty: 6, price: 400, total: 2400 },
      { id: "item-2", name: "CAMERA POWER SUPPY", qty: 1, price: 750, total: 750 },
      { id: "item-1790565878771", name: "HIKVISION CAMERA DUAL LIGHT", qty: 1, price: 1805, total: 1805 }
    ],
    subtotal: 4955,
    discount: 0,
    grandTotal: 4955,
    createdAt: "2026-09-28T03:25:24.035Z"
  },
  {
    id: "bill-1790565779427",
    billNo: "INV-483",
    date: "2026-09-28",
    customerName: "SURESH JI FARHOUSE",
    customerMobile: "9413673370",
    items: [
      { id: "item-1", name: "CAMERA SERVICE", qty: 5, price: 200, total: 1000 },
      { id: "item-2", name: "CAMERA INSTALLATION", qty: 1, price: 400, total: 400 },
      { id: "item-1790565745163", name: "CAMERA POWER SUPPLY", qty: 1, price: 750, total: 750 },
      { id: "item-1790565768691", name: "DVR CMOS BATTERY", qty: 1, price: 150, total: 150 }
    ],
    subtotal: 2300,
    discount: 0,
    grandTotal: 2300,
    createdAt: "2026-09-28T03:25:48.315Z"
  },
  {
    id: "bill-1790565539595",
    billNo: "INV-482",
    date: "2026-09-28",
    customerName: "SURESH JI HOME",
    customerMobile: "9413673370",
    items: [
      { id: "item-1", name: "CAMERA SERVICE", qty: 2, price: 200, total: 400 },
      { id: "item-2", name: "CAMERA INSTALLATION", qty: 1, price: 400, total: 400 },
      { id: "item-1790565494427", name: "CAMERA CHARGER", qty: 1, price: 400, total: 400 },
      { id: "item-1790565510643", name: "DVR CMOS BATTERY", qty: 1, price: 150, total: 150 }
    ],
    subtotal: 1350,
    discount: 0,
    grandTotal: 1350,
    createdAt: "2026-09-28T03:18:59.595Z"
  },
  {
    id: "bill-1790565414067",
    billNo: "INV-481",
    date: "2026-09-28",
    customerName: "SHREE BHOMIYA JI GOU SHALA MOAMSAR",
    customerMobile: "9413673370",
    items: [
      { id: "item-1", name: "HARD DIST 4 TB CONSISTENT VIDEO RECORD", qty: 1, price: 13500, total: 13500 },
      { id: "item-2", name: "CAMERA INSTALLATION", qty: 4, price: 400, total: 1600 },
      { id: "item-1790565378587", name: "CAMERA SERVICE", qty: 2, price: 200, total: 400 },
      { id: "item-1790565673715", name: "DVR CMOS BATTERY", qty: 1, price: 150, total: 150 },
      { id: "item-1790565960435", name: "CAMERA POWER SUPPLY", qty: 1, price: 750, total: 750 }
    ],
    subtotal: 16400,
    discount: 0,
    grandTotal: 16400,
    createdAt: "2026-09-28T03:26:05.091Z"
  },
  {
    id: "bill-1790565247027",
    billNo: "INV-480",
    date: "2026-07-13",
    customerName: "GOVT SEN SEC SCHOOL DANIYASAR",
    customerMobile: "9828417414",
    items: [
      { id: "item-1", name: "PRINT STAR EASY REFILL CARTRIDGE", qty: 2, price: 650, total: 1300 }
    ],
    subtotal: 1300,
    discount: 0,
    grandTotal: 1300,
    createdAt: "2026-09-28T03:14:07.027Z"
  },
  {
    id: "bill-1790565178811",
    billNo: "INV-479",
    date: "2026-07-13",
    customerName: "GOVT SEN SEC SCHOOL DANIYASAR",
    customerMobile: "9828417414",
    items: [
      { id: "item-1", name: "PRINT STAR EXTRA DARK GOLD CARTRIDGE POWDER", qty: 12, price: 160, total: 1920 }
    ],
    subtotal: 1920,
    discount: 0,
    grandTotal: 1920,
    createdAt: "2026-09-28T03:12:58.811Z"
  }
];

const INITIAL_USERS = [
  {
    id: 'superadmin_1',
    username: 'jkp97847',
    password: 'Jkp@97847',
    role: 'superadmin',
    status: 'approved',
    created_at: '2026-09-01T10:00:00.000Z',
    allowed_modules: {
      gst_billing: true,
      nongst_billing: true,
      receipt_billing: true,
      pos_billing: true
    },
    profile: {
      shopName: 'स्मार्ट बिलिंग एडमिन मुख्यालय',
      ownerName: 'चीफ एडमिनिस्ट्रेटर',
      mobile: '9829097847',
      alternateMobile: '',
      email: 'admin@smartbilling.in',
      address: 'सेंट्रल कंट्रोल रूम, जयपुर (राज.)',
      state: 'Rajasthan',
      stateCode: '08',
      pincode: '302001',
      gstin: '08AAACA0000A1Z5',
      pan: 'AAACA0000A',
      bankName: 'State Bank of India',
      accountNo: '10000000001',
      ifsc: 'SBIN0001000',
      upiId: 'jkp97847@sbi'
    }
  },
  {
    id: 'seller_demo',
    username: 'seller1',
    password: 'Seller@123456',
    role: 'seller',
    status: 'approved',
    created_at: '2026-09-10T12:00:00.000Z',
    allowed_modules: {
      gst_billing: true,
      nongst_billing: true,
      receipt_billing: true,
      pos_billing: true
    },
    profile: {
      shopName: 'श्री श्याम मोबाइल & इलेक्ट्रॉनिक्स',
      ownerName: 'रमेश कुमार शर्मा',
      mobile: '9829012345',
      alternateMobile: '9829054321',
      email: 'shyam.mobile@example.com',
      address: 'स्टेशन रोड, सीकर (राज.)',
      state: 'Rajasthan',
      stateCode: '08',
      pincode: '332001',
      gstin: '08AABCR1234F1Z1',
      pan: 'AABCR1234F',
      bankName: 'State Bank of India (SBI)',
      accountNo: '30495867201',
      ifsc: 'SBIN0031245',
      upiId: 'shyam.mobile@oksbi'
    }
  }
];

async function reloadServerDatabase() {
  console.log('🔄 Starting clean reload of server database from local dataset...');

  // 1. Clear existing server tables
  console.log('🗑️ Clearing server data from tables...');
  await supabase.from('gst_bills').delete().neq('id', '___NEVER_MATCH___');
  await supabase.from('gst_inventory').delete().neq('id', '___NEVER_MATCH___');
  await supabase.from('gst_purchases').delete().neq('id', '___NEVER_MATCH___');
  await supabase.from('nongst_bills').delete().neq('id', '___NEVER_MATCH___');
  await supabase.from('recharge_bills').delete().neq('id', '___NEVER_MATCH___');
  await supabase.from('shop_settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '___NEVER_MATCH___');

  // 2. Insert Users
  console.log('👤 Inserting initial authenticated users (jkp97847, seller1)...');
  const { error: userErr } = await supabase.from('users').upsert(INITIAL_USERS, { onConflict: 'id' });
  if (userErr) console.error('Error inserting users:', userErr);

  // 3. Insert Platform Config
  console.log('⚙️ Inserting platform config...');
  await supabase.from('platform_config').upsert({
    key: 'main',
    value: {
      enableRegistration: true,
      maintenanceMode: false,
      bannerMessage: '',
      updatedAt: new Date().toISOString()
    }
  }, { onConflict: 'key' });

  // 4. Insert Shop Settings (for seller1 and seller_demo)
  console.log('🏪 Inserting shop settings (GST: श्री श्याम मोबाइल, Non-GST: SHREE HARIPRIY COMPUTER)...');
  const shopRows = [
    {
      seller_id: 'seller1',
      module: 'gst',
      settings: INITIAL_SETTINGS
    },
    {
      seller_id: 'seller_demo',
      module: 'gst',
      settings: INITIAL_SETTINGS
    },
    {
      seller_id: 'seller1',
      module: 'nongst',
      settings: DEFAULT_SELLER1_NON_GST_SETTINGS
    },
    {
      seller_id: 'seller_demo',
      module: 'nongst',
      settings: DEFAULT_SELLER1_NON_GST_SETTINGS
    }
  ];
  const { error: shopErr } = await supabase.from('shop_settings').upsert(shopRows, { onConflict: 'seller_id,module' });
  if (shopErr) console.error('Error inserting shop_settings:', shopErr);

  // 5. Insert Non-GST Bills (INV-479 to INV-484)
  console.log('📄 Inserting Non-GST bills (INV-479 to INV-484)...');
  const nongstRows = [];
  for (const sId of ['seller1', 'seller_demo']) {
    for (const b of DEFAULT_SELLER1_NON_GST_BILLS) {
      nongstRows.push({
        id: `${sId}_${b.id}`,
        seller_id: sId,
        bill_no: b.billNo,
        customer_name: b.customerName,
        customer_mobile: b.customerMobile,
        bill_date: b.date,
        items: b.items,
        subtotal: b.subtotal,
        discount: b.discount,
        grand_total: b.grandTotal,
        bill_data: b,
        created_at: b.createdAt
      });
    }
  }
  const { error: nongstErr } = await supabase.from('nongst_bills').upsert(nongstRows, { onConflict: 'id' });
  if (nongstErr) console.error('Error inserting nongst_bills:', nongstErr);

  // 6. Insert GST Inventory
  console.log(`📦 Inserting ${INITIAL_INVENTORY.length} GST inventory items...`);
  const invRows = [];
  for (const sId of ['seller1', 'seller_demo']) {
    for (const item of INITIAL_INVENTORY) {
      invRows.push({
        id: item.id,
        seller_id: sId,
        item_name: item.name,
        item_data: item
      });
    }
  }
  const { error: invErr } = await supabase.from('gst_inventory').upsert(invRows, { onConflict: 'seller_id,id' });
  if (invErr) console.error('Error inserting gst_inventory:', invErr);

  // 7. Insert GST Purchases
  console.log(`🛒 Inserting ${INITIAL_PURCHASES.length} GST purchase records...`);
  const purRows = [];
  for (const sId of ['seller1', 'seller_demo']) {
    for (const p of INITIAL_PURCHASES) {
      purRows.push({
        id: p.id,
        seller_id: sId,
        purchase_data: p
      });
    }
  }
  const { error: purErr } = await supabase.from('gst_purchases').upsert(purRows, { onConflict: 'seller_id,id' });
  if (purErr) console.error('Error inserting gst_purchases:', purErr);

  // 8. Insert Initial GST Bill
  console.log(`🧾 Inserting clean initial GST bill (GST-2026-101)...`);
  const gstBillRows = [];
  for (const sId of ['seller1', 'seller_demo']) {
    for (const b of INITIAL_GST_BILLS) {
      gstBillRows.push({
        id: `${sId}_${b.id}`,
        seller_id: sId,
        invoice_no: b.billNo || b.invoiceNo,
        customer_name: b.customerName,
        customer_phone: b.customerMobile,
        bill_date: b.date,
        items: b.items,
        grand_total: b.grandTotal,
        bill_data: b,
        created_at: b.createdAt
      });
    }
  }
  const { error: gstErr } = await supabase.from('gst_bills').upsert(gstBillRows, { onConflict: 'id' });
  if (gstErr) console.error('Error inserting gst_bills:', gstErr);

  console.log('✅ Clean server database reload completed successfully!');
}

reloadServerDatabase();
