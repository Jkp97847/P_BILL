import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';

const RechargeContext = createContext();

export function calculateConvenienceFee(amount, settings) {
  const num = parseFloat(amount) || 0;
  if (num <= 0) return 0;
  
  const ruleType = settings?.feeRuleType || 'slab';
  if (ruleType === 'flat') {
    return parseFloat(settings?.flatFeeAmount) || 10;
  }
  if (ruleType === 'percent') {
    const pct = parseFloat(settings?.percentFeeRate) || 1;
    return Math.round((num * pct) / 100);
  }
  // Default tiered slab: ₹5 per ₹1000 (e.g. 1-1000 -> 5, 1001-2000 -> 10)
  const unit = parseFloat(settings?.feeSlabUnit) || 1000;
  const rate = parseFloat(settings?.feePerSlab) || 5;
  return Math.ceil(num / unit) * rate;
}

export function RechargeProvider({ children }) {
  const { currentUser, impersonatedSeller, users } = useAuth();
  const effectiveSeller = impersonatedSeller || currentUser;
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const activeUserId = effectiveSeller?.id || effectiveSeller?.username || 'default_seller';

  // LocalStorage keys scoped to effective seller
  const storageKeyBills = `recharge_bills_${activeUserId}`;
  const storageKeySettings = `recharge_settings_${activeUserId}`;

  // Default initial settings per seller
  const getInitialSettings = () => {
    const isDemo = activeUserId === 'seller_demo' || activeUserId === 'seller1' || effectiveSeller?.username === 'seller1';
    try {
      const saved = localStorage.getItem(storageKeySettings);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isConfigured: parsed.isConfigured !== undefined 
            ? Boolean(parsed.isConfigured) 
            : (isDemo || Boolean(parsed.shopName && parsed.ownerName))
        };
      }
    } catch {
      // ignore
    }

    if (isDemo) {
      return {
        shopName: 'स्मार्ट रिचार्ज & ई-मित्र केंद्र',
        shopPhone: '9784730824',
        ownerName: 'अधिकृत एजेंट',
        address: 'मुख्य बाजार, सीकर (राज.)',
        bankName: 'State Bank of India',
        accountNumber: '61098663856',
        ifscCode: 'SBIN0031338',
        upiId: '9784730824@upi',
        gstin: '',
        feeRuleType: 'slab',     // 'slab' | 'flat' | 'percent'
        feeSlabUnit: 1000,       // ₹1000
        feePerSlab: 5,           // ₹5 per ₹1000
        flatFeeAmount: 10,
        percentFeeRate: 1,
        paperSize: 'thermal80',  // 'thermal80' | 'thermal58' | 'a4'
        showBankOnSlip: true,
        showStampOnSlip: true,
        footerNote: 'यह एक कंप्यूटरीकृत सत्यापित रसीद है। लेन-देन सफलतापूर्वक संपन्न हुआ।',
        isConfigured: true
      };
    }

    return {
      shopName: '',
      shopPhone: effectiveSeller?.profile?.mobile || '',
      ownerName: '',
      address: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
      gstin: '',
      feeRuleType: 'slab',
      feeSlabUnit: 1000,
      feePerSlab: 5,
      flatFeeAmount: 10,
      percentFeeRate: 1,
      paperSize: 'thermal80',
      showBankOnSlip: true,
      showStampOnSlip: true,
      footerNote: 'यह एक कंप्यूटरीकृत सत्यापित रसीद है। लेन-देन सफलतापूर्वक संपन्न हुआ।',
      isConfigured: false
    };
  };

  const [settings, setSettings] = useState(() => getInitialSettings());

  // Reload settings if effective seller changes
  useEffect(() => {
    setSettings(getInitialSettings());
  }, [activeUserId]);

  // Load transactions for effective seller
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKeyBills);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }

    // Default sample transaction if empty
    return [
      {
        id: 'TXN-JVVNL-' + Date.now().toString(36).toUpperCase(),
        serviceType: 'electricity',
        operatorName: 'जयपुर डिस्कॉम (JVVNL)',
        operatorLogo: '/recharge_assets/jaipur_discom.svg',
        consumerNo: '110298471234',
        customerName: 'सुभाष चन्द्र वर्मा',
        billDate: new Date().toISOString().split('T')[0],
        billAmount: 1450,
        conveFee: 10,
        totalAmount: 1460,
        subDivision: 'सीकर ग्रामीण (A-1)',
        notes: 'बिजली बिल भुगतान सफल',
        createdAt: new Date().toISOString(),
        userId: activeUserId,
        sellerShop: effectiveSeller?.profile?.shopName || 'स्मार्ट रिचार्ज & ई-मित्र केंद्र'
      }
    ];
  });

  // Reload transactions when active user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKeyBills);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTransactions(parsed);
          return;
        }
      }
      setTransactions([]);
    } catch {
      setTransactions([]);
    }
  }, [activeUserId]);

  // Save transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKeyBills, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions, storageKeyBills]);

  // Save settings to localStorage
  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        isConfigured: newSettings.isConfigured !== undefined ? Boolean(newSettings.isConfigured) : prev.isConfigured,
        gstin: effectiveSeller?.profile?.gstin || prev.gstin || ''
      };
      try {
        localStorage.setItem(storageKeySettings, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Add new bill/recharge
  const addTransaction = (billData) => {
    const uniqueId = 'TXN-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newBill = {
      ...billData,
      id: billData.id || uniqueId,
      createdAt: billData.createdAt || new Date().toISOString(),
      userId: activeUserId,
      sellerShop: settings.shopName || effectiveSeller?.profile?.shopName
    };

    setTransactions(prev => [newBill, ...prev]);
    return newBill;
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Clear all transactions for active seller
  const clearAllTransactions = () => {
    setTransactions([]);
  };

  // Print slip state
  const [activePrintSlip, setActivePrintSlip] = useState(null);

  const printSlip = (bill) => {
    setActivePrintSlip(bill);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <RechargeContext.Provider
      value={{
        effectiveSeller,
        isSuperAdmin,
        activeUserId,
        settings,
        updateSettings,
        transactions,
        addTransaction,
        deleteTransaction,
        clearAllTransactions,
        activePrintSlip,
        setActivePrintSlip,
        printSlip
      }}
    >
      {children}
    </RechargeContext.Provider>
  );
}

export function useRecharge() {
  const context = useContext(RechargeContext);
  if (!context) {
    throw new Error('useRecharge must be used within a RechargeProvider');
  }
  return context;
}
