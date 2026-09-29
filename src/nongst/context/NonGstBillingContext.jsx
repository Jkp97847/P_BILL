import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const BillingContext = createContext();

const DEFAULT_SETTINGS = {
  firmName: 'श्री गणेश ट्रेडर्स',
  tagline: 'होलसेल एवं रिटेल जनरल मर्चेंट',
  address: 'मेन मार्केट, रेलवे स्टेशन के पास, भारत',
  mobile: '9876543210',
  alternateMobile: '9123456789',
  email: 'shreeganesh@example.com',
  bankName: 'भारतीय स्टेट बैंक (SBI)',
  accountNo: '38920192847',
  ifsc: 'SBIN0031245',
  branch: 'स्टेशन रोड शाखा',
  upiId: 'shreeganesh@upi',
  logo: '',
  showGaneshLogo: true,
  ganeshText: '॥ श्री गणेशाय नमः ॥',
  terms: [
    'बिका हुआ माल चेक करके लें।',
    'गारंटी / वारंटी के लिए कंपनी से संपर्क करें।',
    'भूल चूक लेनी देनी होगी (E. & O.E.)।'
  ],
  signatoryText: 'अधिकृत हस्ताक्षरकर्ता / Authorized Signatory',
  ownerName: 'राजेश कुमार (प्रोपराइटर)',
  billPrefix: 'INV-',
  nextBillSeq: 1005,
  selectedTheme: 'classic', // 10 themes: classic | modern | compact | royal | emerald | minimal | crimson | ocean | amber | slate
  // Custom display visibility controls for seller & bill details
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
    id: 'bill-1001',
    billNo: 'INV-1001',
    date: '2026-09-24',
    customerName: 'रमेश कुमार शर्मा',
    customerMobile: '9829012345',
    customerAddress: 'स्टेशन रोड, सीकर (राज.)',
    paymentMode: 'Cash / UPI',
    items: [
      { id: '1', name: 'बासमती चावल (Basmati Rice 10kg)', qty: 2, price: 950, total: 1900 },
      { id: '2', name: 'फॉर्च्यून सोयाबीन तेल (Soyabean Oil 1L)', qty: 5, price: 130, total: 650 },
      { id: '3', name: 'टाटा नमक (Tata Salt 1kg)', qty: 3, price: 28, total: 84 }
    ],
    subtotal: 2634,
    discount: 0,
    grandTotal: 2634,
    createdAt: '2026-09-24T10:15:00.000Z'
  },
  {
    id: 'bill-1002',
    billNo: 'INV-1002',
    date: '2026-09-25',
    customerName: 'सुरेश कुमार जांगिड़',
    customerMobile: '9829554433',
    customerAddress: 'नवलगढ़ रोड, सीकर (राज.)',
    paymentMode: 'Cash / UPI',
    items: [
      { id: '1', name: 'आशीर्वाद शुद्ध चक्की आटा (Aashirvaad Atta 10kg)', qty: 2, price: 420, total: 840 },
      { id: '2', name: 'पतंजलि गाय का देसी घी (Desi Ghee 1L)', qty: 2, price: 620, total: 1240 },
      { id: '3', name: 'राजधानी बेसन (Rajdhani Besan 1kg)', qty: 3, price: 95, total: 285 },
      { id: '4', name: 'ताज महल चायपत्ती (Taj Mahal Tea 500g)', qty: 2, price: 340, total: 680 },
      { id: '5', name: 'डाबर शहद (Dabur Honey 500g)', qty: 1, price: 210, total: 210 }
    ],
    subtotal: 3255,
    discount: 55,
    grandTotal: 3200,
    createdAt: '2026-09-25T12:30:00.000Z'
  },
  {
    id: 'bill-1003',
    billNo: 'INV-1003',
    date: '2026-09-26',
    customerName: 'विकास शर्मा',
    customerMobile: '9414012345',
    customerAddress: 'बजाज रोड, सीकर (राज.)',
    paymentMode: 'Cash / UPI',
    items: [
      { id: '1', name: 'सर्फ एक्सेल मैटिक पाउडर (Surf Excel 2kg)', qty: 2, price: 380, total: 760 },
      { id: '2', name: 'डेटॉल एंटीसेप्टिक लिक्विड (Dettol 500ml)', qty: 2, price: 195, total: 390 },
      { id: '3', name: 'कोलगेट मैक्सफ्रेश पेस्ट (Colgate MaxFresh 150g)', qty: 3, price: 110, total: 330 },
      { id: '4', name: 'विम बार डिशवॉश पैक (Vim Bar 4-in-1)', qty: 4, price: 45, total: 180 }
    ],
    subtotal: 1660,
    discount: 0,
    grandTotal: 1660,
    createdAt: '2026-09-26T14:45:00.000Z'
  },
  {
    id: 'bill-1004',
    billNo: 'INV-1004',
    date: '2026-09-27',
    customerName: 'दिनेश कुमावत',
    customerMobile: '9828112233',
    customerAddress: 'पिपराली रोड, सीकर (राज.)',
    paymentMode: 'Cash / UPI',
    items: [
      { id: '1', name: 'फॉर्च्यून कच्ची घानी सरसों तेल (Mustard Oil 5L)', qty: 1, price: 750, total: 750 },
      { id: '2', name: 'शक्कर / चीनी (Sugar Premium 5kg)', qty: 2, price: 225, total: 450 },
      { id: '3', name: 'चना दाल प्रीमियम (Chana Dal 2kg)', qty: 2, price: 160, total: 320 },
      { id: '4', name: 'हल्दीराम भुजिया (Haldiram Bhujia 1kg)', qty: 2, price: 260, total: 520 },
      { id: '5', name: 'एवरेस्ट गरम मसाला (Everest Garam Masala 100g)', qty: 3, price: 85, total: 255 }
    ],
    subtotal: 2295,
    discount: 45,
    grandTotal: 2250,
    createdAt: '2026-09-27T16:20:00.000Z'
  }
];

const SAMPLE_BILLS = DEFAULT_SELLER1_NON_GST_BILLS;

export function BillingProvider({ children }) {
  const { currentUser, impersonatedSeller, activeSeller, users, restoreAllUsers } = useAuth();
  const effectiveUser = impersonatedSeller || activeSeller || (currentUser?.role === 'seller' ? currentUser : null);
  const activeUserId = effectiveUser ? effectiveUser.id : (currentUser ? currentUser.id : 'guest');

  // Helper: create initial settings for a user
  const getInitialSettingsForUser = (userId, userObj) => {
    const isDemo = userId === 'seller_demo' || userId === 'seller1' || userObj?.username === 'seller1';
    try {
      const scopedKey = `billing_app_settings_${userId}`;
      const keysToCheck = [
        scopedKey,
        ...(isDemo ? [
          'billing_app_settings_seller_demo',
          'billing_app_settings_seller1',
          'billing_app_settings_admin_master',
          'billing_app_settings'
        ] : [])
      ];

      for (const k of keysToCheck) {
        const saved = localStorage.getItem(k);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            nextBillSeq: parsed.nextBillSeq || DEFAULT_SETTINGS.nextBillSeq,
            isConfigured: parsed.isConfigured !== undefined 
              ? Boolean(parsed.isConfigured) 
              : (isDemo || Boolean(parsed.firmName && parsed.ownerName)),
            ownerName: parsed.ownerName || (isDemo ? DEFAULT_SETTINGS.ownerName : ''),
            firmName: parsed.firmName || (isDemo ? DEFAULT_SETTINGS.firmName : ''),
            selectedTheme: parsed.selectedTheme || DEFAULT_SETTINGS.selectedTheme,
            displayOptions: {
              ...DEFAULT_SETTINGS.displayOptions,
              ...(parsed.displayOptions || {})
            }
          };
        }
      }

      // Default settings for demo user
      if (isDemo) {
        return {
          ...DEFAULT_SETTINGS,
          isConfigured: true
        };
      }

      // Fresh settings for non-demo new user: unconfigured until first-time modal completion
      return {
        ...DEFAULT_SETTINGS,
        firmName: '',
        tagline: 'होलसेल एवं रिटेल जनरल मर्चेंट',
        ownerName: '',
        mobile: userObj?.profile?.mobile || '',
        alternateMobile: '',
        address: '',
        email: '',
        bankName: '',
        accountNo: '',
        ifsc: '',
        upiId: '',
        selectedTheme: 'classic',
        isConfigured: false
      };
    } catch {
      return {
        ...DEFAULT_SETTINGS,
        isConfigured: isDemo
      };
    }
  };

  // Helper: get initial bills for a user with cross-key recovery and fallback
  const getInitialBillsForUser = (userId, userObj) => {
    try {
      const isDemo = userId === 'seller_demo' || userId === 'seller1' || userObj?.username === 'seller1';
      
      const keysToCheck = [
        `billing_app_bills_${userId}`,
        ...(isDemo ? [
          'billing_app_bills_seller_demo',
          'billing_app_bills_seller1',
          'billing_app_bills_admin_master',
          'billing_app_bills',
          'mobile_billing_nongst_bills_seller_demo',
          'mobile_billing_nongst_bills_seller1',
          'mobile_billing_nongst_bills'
        ] : [])
      ];

      const collectedBills = [];
      const seenBillKeys = new Set();

      for (const k of keysToCheck) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              for (const bill of parsed) {
                if (bill && (bill.id || bill.billNo)) {
                  const billKey = String(bill.billNo || bill.id).trim();
                  if (!seenBillKeys.has(billKey)) {
                    seenBillKeys.add(billKey);
                    collectedBills.push(bill);
                  }
                }
              }
            }
          } catch (e) {
            console.error('Error parsing bills from', k, e);
          }
        }
      }

      if (collectedBills.length > 0) {
        return collectedBills;
      }

      // If demo seller seller1 and no bills found anywhere in storage, return full default sample bills
      if (isDemo) {
        return DEFAULT_SELLER1_NON_GST_BILLS;
      }

      // Any other regular user starts with an empty clean slate!
      return [];
    } catch {
      return (userId === 'seller_demo' || userId === 'seller1' || userObj?.username === 'seller1') 
        ? DEFAULT_SELLER1_NON_GST_BILLS 
        : [];
    }
  };

  // Active user's scoped states
  const [settings, setSettings] = useState(() => getInitialSettingsForUser(activeUserId, effectiveUser || currentUser));
  const [bills, setBills] = useState(() => getInitialBillsForUser(activeUserId, effectiveUser || currentUser));

  // Current bill being edited (null = new bill mode)
  const [editingBill, setEditingBill] = useState(null);

  // Active navigation tab: 'generate', 'report', 'format'
  const [activeTab, setActiveTab] = useState('generate');

  // Currently active bill specifically assigned for printing (renders at root level)
  const [activePrintBill, setActivePrintBill] = useState(null);

  // Sync state whenever the active user logs in, out, or switches accounts!
  useEffect(() => {
    const userSettings = getInitialSettingsForUser(activeUserId, effectiveUser || currentUser);
    const userBills = getInitialBillsForUser(activeUserId, effectiveUser || currentUser);
    setSettings(userSettings);
    setBills(userBills);
    setEditingBill(null);
    if (userBills.length > 0) {
      setActivePrintBill(userBills[0]);
    } else {
      setActivePrintBill(null);
    }
  }, [activeUserId]);

  // Save Settings to scoped LocalStorage with cross-sync for seller1
  useEffect(() => {
    if (!activeUserId) return;
    try {
      localStorage.setItem(`billing_app_settings_${activeUserId}`, JSON.stringify(settings));
      if (activeUserId === 'seller_demo' || activeUserId === 'seller1' || effectiveUser?.username === 'seller1') {
        localStorage.setItem('billing_app_settings_seller_demo', JSON.stringify(settings));
        localStorage.setItem('billing_app_settings_seller1', JSON.stringify(settings));
        localStorage.setItem('billing_app_settings', JSON.stringify(settings));
      }
    } catch (e) {
      console.error('Failed to save scoped settings to localStorage', e);
    }
  }, [settings, activeUserId, effectiveUser]);

  // Save Bills to scoped LocalStorage with cross-sync for seller1
  useEffect(() => {
    if (!activeUserId) return;
    try {
      localStorage.setItem(`billing_app_bills_${activeUserId}`, JSON.stringify(bills));
      if (activeUserId === 'seller_demo' || activeUserId === 'seller1' || effectiveUser?.username === 'seller1') {
        localStorage.setItem('billing_app_bills_seller_demo', JSON.stringify(bills));
        localStorage.setItem('billing_app_bills_seller1', JSON.stringify(bills));
        localStorage.setItem('billing_app_bills', JSON.stringify(bills));
      }
    } catch (e) {
      console.error('Failed to save scoped bills to localStorage', e);
    }
  }, [bills, activeUserId, effectiveUser]);

  // Update Settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      isConfigured: newSettings.isConfigured !== undefined ? Boolean(newSettings.isConfigured) : prev.isConfigured,
      displayOptions: {
        ...prev.displayOptions,
        ...(newSettings.displayOptions || {})
      }
    }));
  };

  // Change Active Theme
  const setTheme = (themeId) => {
    updateSettings({ selectedTheme: themeId });
  };

  // Reset Settings to Defaults
  const resetSettings = () => {
    const targetUser = effectiveUser || currentUser;
    if (targetUser?.profile) {
      setSettings({
        ...DEFAULT_SETTINGS,
        firmName: targetUser.profile.shopName || DEFAULT_SETTINGS.firmName,
        ownerName: targetUser.profile.ownerName || targetUser.profile.name || DEFAULT_SETTINGS.ownerName,
        mobile: targetUser.profile.mobile || DEFAULT_SETTINGS.mobile,
        address: targetUser.profile.address || DEFAULT_SETTINGS.address,
        email: targetUser.profile.email || DEFAULT_SETTINGS.email
      });
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  // Generate Next Bill Number
  const generateNextBillNo = () => {
    const prefix = settings.billPrefix || 'INV-';
    const seq = settings.nextBillSeq || 1001;
    return `${prefix}${seq}`;
  };

  // Save Bill (Create New or Update Existing)
  const saveBill = (billData) => {
    const isEdit = !!billData.id;
    let finalBill;

    if (isEdit) {
      finalBill = {
        ...billData,
        updatedAt: new Date().toISOString()
      };
      setBills(prev => prev.map(b => (b.id === finalBill.id ? finalBill : b)));
      setEditingBill(null);
    } else {
      const newBillNo = billData.billNo || generateNextBillNo();
      finalBill = {
        ...billData,
        id: `bill-${Date.now()}`,
        billNo: newBillNo,
        createdAt: new Date().toISOString()
      };

      setBills(prev => [finalBill, ...prev]);

      // Increment sequence number automatically
      setSettings(prev => ({
        ...prev,
        nextBillSeq: (prev.nextBillSeq || 1001) + 1
      }));
    }

    return finalBill;
  };

  // Delete Bill
  const deleteBill = (id) => {
    setBills(prev => prev.filter(b => b.id !== id));
    if (editingBill && editingBill.id === id) {
      setEditingBill(null);
    }
  };

  // Start editing an existing bill
  const startEditingBill = (bill) => {
    setEditingBill(bill);
    setActiveTab('generate');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingBill(null);
  };

  const [printDocument, setPrintDocument] = useState(null);

  // Trigger Print for a Bill
  const triggerPrint = (bill) => {
    setActivePrintBill(bill);
    setPrintDocument({ type: 'bill', bill });
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Trigger Print for Report (All bills or Financial Year)
  const triggerPrintReport = ({ items, filterDate, searchTerm, stats, isYearly = false }) => {
    setActivePrintBill(null);
    setPrintDocument({
      type: 'report',
      items,
      filterDate,
      searchTerm,
      stats,
      isYearly
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // --------------------------------------------------------------------------
  // 1. USER PERSONAL DATA BACKUP (Export & Import for Current Logged-in User)
  // --------------------------------------------------------------------------
  const exportUserData = () => {
    const exportPayload = {
      backupType: 'user_personal_backup',
      version: '1.0',
      userId: activeUserId,
      userShop: settings.firmName,
      ownerName: settings.ownerName,
      exportedAt: new Date().toISOString(),
      settings: settings,
      bills: bills
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `billing_backup_${settings.firmName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return true;
  };

  const importUserData = (jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      // Reject master backup on regular user import
      if (parsed.backupType === 'master_database_backup') {
        throw new Error('यह मास्टर डेटाबेस बैकअप है। इसे केवल सुपर एडमिन पोर्टल से रीस्टोर किया जा सकता है।');
      }

      if (parsed.settings) {
        setSettings(prev => ({
          ...DEFAULT_SETTINGS,
          ...parsed.settings
        }));
      }

      if (Array.isArray(parsed.bills)) {
        setBills(parsed.bills);
      }

      return { success: true, message: 'आपका व्यक्तिगत डेटा सफलतापूर्वक रीस्टोर कर लिया गया है!' };
    } catch (err) {
      return { success: false, message: err.message || 'अमान्य बैकअप फाइल।' };
    }
  };

  // --------------------------------------------------------------------------
  // 2. SUPER ADMIN MASTER DATABASE BACKUP (Full Project Master Export & Import)
  // --------------------------------------------------------------------------
  const exportMasterDatabase = () => {
    const allUsersData = {};

    // Collect bills and settings for every user registered in the system
    (users || []).forEach(u => {
      const uSettings = getInitialSettingsForUser(u.id, u);
      const uBills = getInitialBillsForUser(u.id);
      allUsersData[u.id] = {
        userProfile: u.profile,
        username: u.username,
        role: u.role,
        status: u.status,
        permissions: u.permissions,
        settings: uSettings,
        bills: uBills
      };
    });

    const masterPayload = {
      backupType: 'master_database_backup',
      version: '2.0',
      exportedBy: 'superadmin',
      exportedAt: new Date().toISOString(),
      totalUsers: users.length,
      users: users,
      allUsersData: allUsersData
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(masterPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `SMART_BILLING_MASTER_BACKUP_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return true;
  };

  const importMasterDatabase = (jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      if (parsed.backupType !== 'master_database_backup' && !parsed.allUsersData) {
        throw new Error('अमान्य मास्टर बैकअप फाइल। कृपया सही संपूर्ण मास्टर बैकअप JSON चुनें।');
      }

      // 1. Restore Users in AuthContext
      if (Array.isArray(parsed.users) && parsed.users.length > 0) {
        restoreAllUsers(parsed.users);
      }

      // 2. Restore scoped storage for every user
      if (parsed.allUsersData) {
        Object.entries(parsed.allUsersData).forEach(([uId, uData]) => {
          if (uData.settings) {
            localStorage.setItem(`billing_app_settings_${uId}`, JSON.stringify(uData.settings));
          }
          if (Array.isArray(uData.bills)) {
            localStorage.setItem(`billing_app_bills_${uId}`, JSON.stringify(uData.bills));
          }
        });
      }

      // Refresh current user's active view
      setSettings(getInitialSettingsForUser(activeUserId, currentUser));
      setBills(getInitialBillsForUser(activeUserId));

      return { success: true, message: 'संपूर्ण प्रोजेक्ट का मास्टर डेटाबेस सफलतापूर्वक रीस्टोर हो गया है!' };
    } catch (err) {
      return { success: false, message: err.message || 'मास्टर डेटाबेस रीस्टोर विफल रहा।' };
    }
  };

  // --------------------------------------------------------------------------
  // 3. SUPER ADMIN INSPECTION HELPERS (View any user's bills & stats)
  // --------------------------------------------------------------------------
  const getUserBills = (targetUserId) => {
    return getInitialBillsForUser(targetUserId);
  };

  const getUserStats = (targetUserId) => {
    const userBills = getInitialBillsForUser(targetUserId);
    const count = userBills.length;
    const totalSales = userBills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
    return { count, totalSales };
  };

  return (
    <BillingContext.Provider
      value={{
        settings,
        updateSettings,
        setTheme,
        resetSettings,
        bills,
        saveBill,
        deleteBill,
        editingBill,
        startEditingBill,
        cancelEditing,
        activeTab,
        setActiveTab,
        activePrintBill,
        setActivePrintBill,
        printDocument,
        setPrintDocument,
        generateNextBillNo,
        triggerPrint,
        triggerPrintReport,
        exportUserData,
        importUserData,
        exportData: exportUserData,
        importData: importUserData,
        exportMasterDatabase,
        importMasterDatabase,
        getUserBills,
        getUserStats
      }}
    >
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}

export const NonGstBillingProvider = BillingProvider;
export const useNonGstBilling = useBilling;
