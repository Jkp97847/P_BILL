// Realistic sample data for Mobile & Electronics Shop

export const INITIAL_SETTINGS = {
  firmName: 'श्री श्याम मोबाइल & इलेक्ट्रॉनिक्स',
  tagline: 'ऑल ब्रांड्स मोबाइल, बैटरी, ईयरफोन व एसेसरीज के थोक एवं खुदरा विक्रेता',
  address: 'दुकान नं. 15, न्यू मोबाइल मार्केट, स्टेशन रोड, सीकर (राजस्थान)',
  mobile: '9829012345',
  alternateMobile: '9414012345',
  email: 'shreeshyammobile@gmail.com',
  gstin: '08ABCDE1234F1Z5',
  pan: 'ABCDE1234F',
  state: 'Rajasthan',
  stateCode: '08',
  logo: '',
  showGaneshLogo: true,
  ganeshText: '॥ श्री गणेशाय नमः ॥',
  bankName: 'भारतीय स्टेट बैंक (SBI)',
  accountNo: '38920192847',
  ifsc: 'SBIN0031245',
  branch: 'स्टेशन रोड शाखा, सीकर',
  upiId: 'shreeshyam@sbi',
  qrCodeImage: '',
  selectedTheme: 'classic', // 10 themes: classic | modern | compact | royal | emerald | minimal | crimson | ocean | amber | slate
  gstSlabs: [0, 5, 12, 18, 28],
  itemGstRules: [
    { id: 'rule-1', itemName: 'Mobile', gstRate: 18, hsn: '8517' },
    { id: 'rule-2', itemName: 'Battery', gstRate: 18, hsn: '8506' },
    { id: 'rule-3', itemName: 'Charger', gstRate: 18, hsn: '8504' },
    { id: 'rule-4', itemName: 'Earphone', gstRate: 18, hsn: '8518' },
    { id: 'rule-5', itemName: 'Headphone', gstRate: 18, hsn: '8518' },
    { id: 'rule-6', itemName: 'Glass', gstRate: 18, hsn: '7007' },
    { id: 'rule-7', itemName: 'Cover', gstRate: 18, hsn: '3926' },
    { id: 'rule-8', itemName: 'Cable', gstRate: 18, hsn: '8544' },
    { id: 'rule-9', itemName: 'Smart Watch', gstRate: 18, hsn: '8517' },
    { id: 'rule-10', itemName: 'Bluetooth', gstRate: 18, hsn: '8518' },
    { id: 'rule-11', itemName: 'Speaker', gstRate: 18, hsn: '8518' },
    { id: 'rule-12', itemName: 'Power Bank', gstRate: 18, hsn: '8504' },
    { id: 'rule-13', itemName: 'Memory Card', gstRate: 18, hsn: '8523' },
    { id: 'rule-14', itemName: 'SIM Card', gstRate: 18, hsn: '8523' },
    { id: 'rule-15', itemName: 'Repairing', gstRate: 18, hsn: '9987' }
  ],
  defaultCustomerAddress: 'स्थानीय / सीकर (राजस्थान)',
  billPrefix: 'GST-2026-',
  nextBillSeq: 102,
  terms: [
    'बिका हुआ माल 7 दिनों में ओरिजिनल बिल एवं पैकिंग के साथ ही बदला जाएगा।',
    'मोबाइल, बैटरी एवं ईयरफोन की वारंटी कंपनी के अधिकृत सर्विस सेंटर से ही मान्य होगी।',
    'फिजिकल डैमेज, टूटने या पानी में गिरने पर वारंटी शून्य होगी।',
    'भूल-चूक लेनी-देनी (E. & O.E.)। सभी विवाद केवल स्थानीय न्यायालय के अधीन हैं।'
  ],
  signatoryText: 'अधिकृत हस्ताक्षरकर्ता / Authorized Signatory',
  displayOptions: {
    showFirmName: true,
    showTagline: true,
    showLogo: true,
    showGaneshLogo: true,
    showAddress: true,
    showMobile: true,
    showAlternateMobile: true,
    showEmail: true,
    showGstin: true,
    showPan: true,
    showState: true,
    showBankDetails: true,
    showUpiQr: true,
    showCustomerDetails: true,
    showHsn: true,
    showTaxBreakup: true,
    showTerms: true,
    showSignatory: true,
    showWords: true
  }
};

export const INITIAL_INVENTORY = [
  {
    id: 'itm-1',
    itemNo: 'MOB-001',
    name: 'Redmi Note 13 Pro 5G (8GB/256GB)',
    category: 'Mobile',
    hsn: '8517',
    costPrice: 15500,
    salePrice: 17999,
    gstRate: 18,
    stockQty: 8,
    minAlertQty: 3,
    unit: 'PCS',
    serialNumbers: [
      '864920194820101',
      '864920194820102',
      '864920194820103',
      '864920194820104',
      '864920194820105',
      '864920194820106',
      '864920194820107',
      '864920194820108'
    ]
  },
  {
    id: 'itm-2',
    itemNo: 'MOB-002',
    name: 'Realme Narzo 70 Turbo (6GB/128GB)',
    category: 'Mobile',
    hsn: '8517',
    costPrice: 11200,
    salePrice: 13499,
    gstRate: 18,
    stockQty: 5,
    minAlertQty: 2,
    unit: 'PCS',
    serialNumbers: [
      '869201938201201',
      '869201938201202',
      '869201938201203',
      '869201938201204',
      '869201938201205'
    ]
  },
  {
    id: 'itm-3',
    itemNo: 'BAT-101',
    name: 'Samsung M31 / F41 6000mAh Battery (Original)',
    category: 'Battery',
    hsn: '8506',
    costPrice: 420,
    salePrice: 850,
    gstRate: 18,
    stockQty: 18,
    minAlertQty: 5,
    unit: 'PCS',
    serialNumbers: [
      'SN-BAT-M31-01',
      'SN-BAT-M31-02',
      'SN-BAT-M31-03',
      'SN-BAT-M31-04'
    ]
  },
  {
    id: 'itm-4',
    itemNo: 'BAT-102',
    name: 'Redmi Note 9 / 10 Pro BN53 Battery',
    category: 'Battery',
    hsn: '8506',
    costPrice: 380,
    salePrice: 750,
    gstRate: 18,
    stockQty: 14,
    minAlertQty: 5,
    unit: 'PCS',
    serialNumbers: [
      'SN-BAT-BN53-01',
      'SN-BAT-BN53-02'
    ]
  },
  {
    id: 'itm-5',
    itemNo: 'EAR-201',
    name: 'boAt Rockerz 255 Pro+ Bluetooth Earphone',
    category: 'Earphone',
    hsn: '8518',
    costPrice: 650,
    salePrice: 1199,
    gstRate: 18,
    stockQty: 22,
    minAlertQty: 5,
    unit: 'PCS',
    serialNumbers: [
      'SN-BOAT-255-01',
      'SN-BOAT-255-02',
      'SN-BOAT-255-03'
    ]
  },
  {
    id: 'itm-6',
    itemNo: 'EAR-202',
    name: 'OnePlus Bullets Wireless Z2 ANC Earphone',
    category: 'Earphone',
    hsn: '8518',
    costPrice: 1350,
    salePrice: 1999,
    gstRate: 18,
    stockQty: 9,
    minAlertQty: 3,
    unit: 'PCS',
    serialNumbers: [
      'SN-OP-Z2-01',
      'SN-OP-Z2-02'
    ]
  },
  {
    id: 'itm-7',
    itemNo: 'CHG-301',
    name: '65W SuperVOOC / Dart Fast Charger with Cable',
    category: 'Charger',
    hsn: '8504',
    costPrice: 380,
    salePrice: 799,
    gstRate: 18,
    stockQty: 16,
    minAlertQty: 4,
    unit: 'PCS',
    serialNumbers: []
  },
  {
    id: 'itm-8',
    itemNo: 'ACC-401',
    name: '11D Super Curved Tempered Glass Guard',
    category: 'Accessories',
    hsn: '3926',
    costPrice: 20,
    salePrice: 99,
    gstRate: 18,
    stockQty: 60,
    minAlertQty: 10,
    unit: 'PCS',
    serialNumbers: []
  }
];

export const INITIAL_PURCHASES = [
  {
    id: 'pur-101',
    purchaseNo: 'PUR-2026-001',
    date: '2026-09-10',
    supplierName: 'बालाजी टेलीकॉम डिस्ट्रीब्यूटर्स, जयपुर',
    supplierMobile: '9828111222',
    supplierGstin: '08AABCB9876C1Z1',
    supplierInvoiceNo: 'INV-BLJ-8841',
    items: [
      {
        itemNo: 'MOB-001',
        name: 'Redmi Note 13 Pro 5G (8GB/256GB)',
        category: 'Mobile',
        hsn: '8517',
        costPrice: 15500,
        salePrice: 17999,
        gstRate: 18,
        qty: 10,
        serialNo: '864920194820101, 864920194820102, 864920194820103, 864920194820104, 864920194820105, 864920194820106, 864920194820107, 864920194820108, 864920194820109, 864920194820110',
        total: 182900
      },
      {
        itemNo: 'EAR-201',
        name: 'boAt Rockerz 255 Pro+ Bluetooth Earphone',
        category: 'Earphone',
        hsn: '8518',
        costPrice: 650,
        salePrice: 1199,
        gstRate: 18,
        qty: 25,
        serialNo: 'SN-BOAT-255-01, SN-BOAT-255-02, SN-BOAT-255-03',
        total: 19175
      }
    ],
    totalTaxable: 171250,
    totalGst: 30825,
    grandTotal: 202075,
    createdAt: '2026-09-10T10:30:00.000Z'
  },
  {
    id: 'pur-102',
    purchaseNo: 'PUR-2026-002',
    date: '2026-09-12',
    supplierName: 'श्री श्याम मोबाइल एसेसरीज, दिल्ली',
    supplierMobile: '9811223344',
    supplierGstin: '07AAACS1234D1Z8',
    supplierInvoiceNo: 'DL-ACC-402',
    items: [
      {
        itemNo: 'BAT-101',
        name: 'Samsung M31 / F41 6000mAh Battery (Original)',
        category: 'Battery',
        hsn: '8506',
        costPrice: 420,
        salePrice: 850,
        gstRate: 18,
        qty: 20,
        serialNo: 'SN-BAT-M31-01, SN-BAT-M31-02, SN-BAT-M31-03, SN-BAT-M31-04',
        total: 9912
      },
      {
        itemNo: 'CHG-301',
        name: '65W SuperVOOC / Dart Fast Charger with Cable',
        category: 'Charger',
        hsn: '8504',
        costPrice: 380,
        salePrice: 799,
        gstRate: 18,
        qty: 20,
        serialNo: '',
        total: 8968
      }
    ],
    totalTaxable: 16000,
    totalGst: 2880,
    grandTotal: 18880,
    createdAt: '2026-09-12T14:15:00.000Z'
  }
];

export const INITIAL_GST_BILLS = [
  {
    id: 'bill-gst-101',
    billNo: 'GST-2026-101',
    date: '2026-09-15',
    customerName: 'सुरेश कुमार जांगिड़',
    customerMobile: '9829554433',
    customerGstin: '',
    customerAddress: 'वार्ड नं. 5, नवलगढ़ रोड, सीकर',
    state: 'Rajasthan',
    stateCode: '08',
    paymentMode: 'Cash / UPI',
    items: [
      {
        id: 'row-1',
        itemNo: 'MOB-001',
        serialNo: '864920194820100',
        name: 'Redmi Note 13 Pro 5G (8GB/256GB)',
        hsn: '8517',
        qty: 1,
        unit: 'PCS',
        rate: 15253.39,
        taxableAmount: 15253.39,
        gstRate: 18,
        cgstAmount: 1372.81,
        sgstAmount: 1372.81,
        igstAmount: 0,
        total: 17999
      },
      {
        id: 'row-2',
        itemNo: 'ACC-401',
        serialNo: 'SN-GRD-401-99',
        name: '11D Super Curved Tempered Glass Guard',
        hsn: '3926',
        qty: 1,
        unit: 'PCS',
        rate: 83.9,
        taxableAmount: 83.9,
        gstRate: 18,
        cgstAmount: 7.55,
        sgstAmount: 7.55,
        igstAmount: 0,
        total: 99
      }
    ],
    taxableTotal: 15337.29,
    cgstTotal: 1380.36,
    sgstTotal: 1380.36,
    igstTotal: 0,
    totalGst: 2760.72,
    roundOff: 0.01,
    grandTotal: 18098,
    theme: 'classic',
    createdAt: '2026-09-15T11:45:00.000Z'
  }
];
