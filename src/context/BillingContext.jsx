import React, { createContext, useContext, useState, useEffect } from 'react';

const BillingContext = createContext();

const DEFAULT_SETTINGS = {
  firmName: 'श्री गणेश ट्रेडर्स',
  tagline: 'होलसेल एवं रिटेल जनरल मर्चेंट',
  address: 'मेन मार्केट, रेलवे स्टेशन के पास, भारत',
  mobile: '9876543210',
  alternateMobile: '9123456789',
  email: 'shreeganesh@example.com',
  gstin: '08AAAAA0000A1Z5',
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
  nextBillSeq: 1001,
  // Custom display visibility controls for seller & bill details
  displayOptions: {
    showFirmName: true,
    showTagline: true,
    showLogo: true,
    showAddress: true,
    showMobile: true,
    showAlternateMobile: true,
    showEmail: true,
    showGstin: true,
    showGaneshLogo: true,
    showTerms: true,
    showSignatory: true,
    showWords: true
  }
};

const SAMPLE_BILLS = [
  {
    id: 'bill-1001',
    billNo: 'INV-1001',
    date: new Date().toISOString().split('T')[0],
    customerName: 'रमेश कुमार शर्मा',
    customerMobile: '9829012345',
    items: [
      { id: '1', name: 'बासमती चावल (Basmati Rice 10kg)', qty: 2, price: 950, total: 1900 },
      { id: '2', name: 'फॉर्च्यून सोयाबीन तेल (Soyabean Oil 1L)', qty: 5, price: 130, total: 650 },
      { id: '3', name: 'टाटा नमक (Tata Salt 1kg)', qty: 3, price: 28, total: 84 }
    ],
    subtotal: 2634,
    discount: 0,
    grandTotal: 2634,
    createdAt: new Date().toISOString()
  }
];

export function BillingProvider({ children }) {
  // Load Settings from LocalStorage or default
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('billing_app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          ownerName: parsed.ownerName || DEFAULT_SETTINGS.ownerName,
          signatoryText: parsed.signatoryText || DEFAULT_SETTINGS.signatoryText,
          displayOptions: {
            ...DEFAULT_SETTINGS.displayOptions,
            ...(parsed.displayOptions || {})
          }
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Load Bills from LocalStorage or sample bills
  const [bills, setBills] = useState(() => {
    try {
      const saved = localStorage.getItem('billing_app_bills');
      return saved ? JSON.parse(saved) : SAMPLE_BILLS;
    } catch {
      return SAMPLE_BILLS;
    }
  });

  // Current bill being edited (null = new bill mode)
  const [editingBill, setEditingBill] = useState(null);

  // Active navigation tab: 'generate', 'report', 'format'
  const [activeTab, setActiveTab] = useState('generate');

  // Currently active bill specifically assigned for printing (renders at root level)
  const [activePrintBill, setActivePrintBill] = useState(SAMPLE_BILLS[0]);

  // Save Settings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('billing_app_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Save Bills to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('billing_app_bills', JSON.stringify(bills));
    } catch (e) {
      console.error('Failed to save bills to localStorage', e);
    }
  }, [bills]);

  // Generate Next Bill Number
  const generateNextBillNo = () => {
    return `${settings.billPrefix}${settings.nextBillSeq}`;
  };

  // Trigger Print reliably for any bill
  const triggerPrint = (billData) => {
    if (!billData) return;
    setActivePrintBill(billData);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Save or Update Bill
  const saveBill = (billData) => {
    const isEdit = Boolean(billData.id && bills.some(b => b.id === billData.id));
    let savedRecord;

    if (isEdit) {
      savedRecord = {
        ...billData,
        updatedAt: new Date().toISOString()
      };
      setBills(prev => prev.map(b => (b.id === billData.id ? savedRecord : b)));
    } else {
      const newId = `bill-${Date.now()}`;
      savedRecord = {
        ...billData,
        id: newId,
        billNo: billData.billNo || generateNextBillNo(),
        createdAt: new Date().toISOString()
      };
      setBills(prev => [savedRecord, ...prev]);

      // Increment sequence number
      setSettings(prev => ({
        ...prev,
        nextBillSeq: Number(prev.nextBillSeq) + 1
      }));
    }

    setEditingBill(null);
    return savedRecord;
  };

  // Delete Bill
  const deleteBill = (id) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  // Start editing a bill
  const startEditingBill = (bill) => {
    setEditingBill(bill);
    setActiveTab('generate');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingBill(null);
  };

  // Update Settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      displayOptions: {
        ...prev.displayOptions,
        ...(newSettings.displayOptions || {})
      }
    }));
  };

  // Reset Settings to Defaults
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // Export Data to JSON file
  const exportData = () => {
    const backup = {
      settings,
      bills,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `billing_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import Data from JSON file
  const importData = (jsonData) => {
    try {
      if (jsonData.settings) setSettings(jsonData.settings);
      if (jsonData.bills && Array.isArray(jsonData.bills)) setBills(jsonData.bills);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <BillingContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        bills,
        saveBill,
        deleteBill,
        editingBill,
        startEditingBill,
        cancelEditing,
        generateNextBillNo,
        activeTab,
        setActiveTab,
        activePrintBill,
        setActivePrintBill,
        triggerPrint,
        exportData,
        importData
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
