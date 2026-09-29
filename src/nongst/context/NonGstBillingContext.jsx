import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const BillingContext = createContext();

const DEFAULT_SETTINGS = {
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
