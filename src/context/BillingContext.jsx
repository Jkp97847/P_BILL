import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchShopSettingsFromCloud,
  saveShopSettingsToCloud,
  fetchGstBillsFromCloud,
  saveGstBillToCloud,
  deleteGstBillFromCloud,
  bulkSyncGstBillsToCloud,
  fetchGstInventoryFromCloud,
  deleteGstInventoryFromCloud,
  bulkSyncGstInventoryToCloud,
  fetchGstPurchasesFromCloud,
  deleteGstPurchaseFromCloud,
  bulkSyncGstPurchasesToCloud
} from '../lib/supabaseSync.js';
import {
  INITIAL_SETTINGS,
  INITIAL_INVENTORY,
  INITIAL_PURCHASES,
  INITIAL_GST_BILLS
} from '../data/sampleData';

const BillingContext = createContext();

// Helper to parse comma/newline/space separated serial numbers
export const parseSerials = (str) => {
  if (!str) return [];
  if (Array.isArray(str)) return str.map(s => String(s).trim().toUpperCase()).filter(Boolean);
  return String(str)
    .split(/[\n,;]+/)
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);
};

// Data Loaders for Per-Seller Isolation
const loadSellerSettings = (id, sellerObj) => {
  const isDemo = id === 'seller_demo' || id === 'seller1' || sellerObj?.username === 'seller1';
  try {
    const key = `mobile_billing_settings_${id}`;
    let saved = localStorage.getItem(key);
    if (!saved && id === 'seller_demo') {
      saved = localStorage.getItem('mobile_billing_settings');
    }
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_SETTINGS,
        ...parsed,
        isConfigured: parsed.isConfigured !== undefined 
          ? Boolean(parsed.isConfigured) 
          : (isDemo || Boolean(parsed.firmName && parsed.gstin && parsed.bankName)),
        gstSlabs: parsed.gstSlabs && Array.isArray(parsed.gstSlabs) && parsed.gstSlabs.length > 0 
          ? parsed.gstSlabs 
          : INITIAL_SETTINGS.gstSlabs,
        itemGstRules: parsed.itemGstRules && Array.isArray(parsed.itemGstRules) && parsed.itemGstRules.length > 0
          ? parsed.itemGstRules
          : INITIAL_SETTINGS.itemGstRules,
        defaultCustomerAddress: parsed.defaultCustomerAddress || INITIAL_SETTINGS.defaultCustomerAddress,
        displayOptions: {
          ...INITIAL_SETTINGS.displayOptions,
          ...(parsed.displayOptions || {})
        }
      };
    }
  } catch (err) {
    console.error('Error loading seller settings:', err);
  }

  // Demo user defaults
  if (isDemo) {
    return {
      ...INITIAL_SETTINGS,
      isConfigured: true
    };
  }

  // Fresh newly registered user: unconfigured until first-time filling
  return {
    ...INITIAL_SETTINGS,
    firmName: '',
    ownerName: '',
    mobile: sellerObj?.profile?.mobile || '',
    alternateMobile: '',
    email: '',
    address: '',
    state: 'Rajasthan',
    stateCode: '08',
    pincode: '',
    gstin: '',
    pan: '',
    bankName: '',
    accountNo: '',
    ifsc: '',
    upiId: '',
    isConfigured: false
  };
};

const loadSellerInventory = (id) => {
  try {
    const key = `mobile_billing_inventory_${id}`;
    let saved = localStorage.getItem(key);
    if (!saved && id === 'seller_demo') {
      saved = localStorage.getItem('mobile_billing_inventory');
    }
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading inventory:', err);
  }
  return id === 'seller_demo' ? INITIAL_INVENTORY : [];
};

const loadSellerPurchases = (id) => {
  try {
    const key = `mobile_billing_purchases_${id}`;
    let saved = localStorage.getItem(key);
    if (!saved && id === 'seller_demo') {
      saved = localStorage.getItem('mobile_billing_purchases');
    }
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading purchases:', err);
  }
  return id === 'seller_demo' ? INITIAL_PURCHASES : [];
};

const loadSellerBills = (id) => {
  try {
    const key = `mobile_billing_gst_bills_${id}`;
    let saved = localStorage.getItem(key);
    if (!saved && id === 'seller_demo') {
      saved = localStorage.getItem('mobile_billing_gst_bills');
    }
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading bills:', err);
  }
  return id === 'seller_demo' ? INITIAL_GST_BILLS : [];
};

export function BillingProvider({ children }) {
  const { activeSeller, currentUser } = useAuth();
  const effectiveSeller = activeSeller || (currentUser?.role === 'seller' ? currentUser : null);
  const sellerId = effectiveSeller?.id || 'seller_demo';

  // 1. Settings (Shop details, Theme, display toggles, terms)
  const [settings, setSettings] = useState(() => loadSellerSettings(sellerId, effectiveSeller));

  // 2. Inventory (All Mobile, Battery, Earphone items & stock)
  const [inventory, setInventory] = useState(() => loadSellerInventory(sellerId));

  // 3. Purchases (Supplier invoices and stock additions)
  const [purchases, setPurchases] = useState(() => loadSellerPurchases(sellerId));

  // 4. GST Sales Bills
  const [gstBills, setGstBills] = useState(() => loadSellerBills(sellerId));

  // Navigation & Edit States
  const [activeTab, setActiveTab] = useState('generate'); // generate | purchase | stock | report | format
  const [editingBill, setEditingBill] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [activePrintBill, setActivePrintBill] = useState(INITIAL_GST_BILLS[0]);
  const [printDocument, setPrintDocument] = useState({ type: 'bill', data: INITIAL_GST_BILLS[0] });

  // Reload state when sellerId changes
  useEffect(() => {
    let isMounted = true;
    const loadedSettings = loadSellerSettings(sellerId, effectiveSeller);
    const loadedInventory = loadSellerInventory(sellerId);
    const loadedPurchases = loadSellerPurchases(sellerId);
    const loadedBills = loadSellerBills(sellerId);

    setSettings(loadedSettings);
    setInventory(loadedInventory);
    setPurchases(loadedPurchases);
    setGstBills(loadedBills);
    setActivePrintBill(loadedBills[0] || null);
    setPrintDocument(loadedBills[0] ? { type: 'bill', data: loadedBills[0] } : null);
    setActiveTab('generate');
    setEditingBill(null);
    setEditingPurchase(null);

    // Background fetch from Supabase Cloud
    (async () => {
      try {
        const [cloudSettings, cloudInv, cloudPurchases, cloudBills] = await Promise.all([
          fetchShopSettingsFromCloud(sellerId, 'gst'),
          fetchGstInventoryFromCloud(sellerId),
          fetchGstPurchasesFromCloud(sellerId),
          fetchGstBillsFromCloud(sellerId)
        ]);

        if (!isMounted) return;

        if (cloudSettings) {
          setSettings(prev => ({ ...prev, ...cloudSettings }));
        } else if (loadedSettings && loadedSettings.firmName) {
          saveShopSettingsToCloud(sellerId, 'gst', loadedSettings);
        }

        if (cloudInv && cloudInv.length > 0) {
          setInventory(cloudInv);
        } else if (loadedInventory && loadedInventory.length > 0) {
          bulkSyncGstInventoryToCloud(sellerId, loadedInventory);
        }

        if (cloudPurchases && cloudPurchases.length > 0) {
          setPurchases(cloudPurchases);
        } else if (loadedPurchases && loadedPurchases.length > 0) {
          bulkSyncGstPurchasesToCloud(sellerId, loadedPurchases);
        }

        if (cloudBills && cloudBills.length > 0) {
          setGstBills(cloudBills);
          setActivePrintBill(cloudBills[0]);
        } else if (loadedBills && loadedBills.length > 0) {
          bulkSyncGstBillsToCloud(sellerId, loadedBills);
        }
      } catch (err) {
        console.warn('Supabase GST sync warning:', err);
      }
    })();

    return () => { isMounted = false; };
  }, [sellerId]);

  // Sync to LocalStorage & Supabase Cloud
  useEffect(() => {
    try {
      localStorage.setItem(`mobile_billing_settings_${sellerId}`, JSON.stringify(settings));
      saveShopSettingsToCloud(sellerId, 'gst', settings);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings, sellerId]);

  useEffect(() => {
    try {
      localStorage.setItem(`mobile_billing_inventory_${sellerId}`, JSON.stringify(inventory));
      bulkSyncGstInventoryToCloud(sellerId, inventory);
    } catch (e) {
      console.error('Failed to save inventory:', e);
    }
  }, [inventory, sellerId]);

  useEffect(() => {
    try {
      localStorage.setItem(`mobile_billing_purchases_${sellerId}`, JSON.stringify(purchases));
      bulkSyncGstPurchasesToCloud(sellerId, purchases);
    } catch (e) {
      console.error('Failed to save purchases:', e);
    }
  }, [purchases, sellerId]);

  useEffect(() => {
    try {
      localStorage.setItem(`mobile_billing_gst_bills_${sellerId}`, JSON.stringify(gstBills));
      bulkSyncGstBillsToCloud(sellerId, gstBills);
    } catch (e) {
      console.error('Failed to save bills:', e);
    }
  }, [gstBills, sellerId]);

  // Generate Next GST Bill Number
  const generateNextBillNo = () => {
    return `${settings.billPrefix}${settings.nextBillSeq}`;
  };

  // Generate Next Purchase Number
  const generateNextPurchaseNo = () => {
    const nextSeq = purchases.length + 101;
    return `PUR-2026-${String(nextSeq).padStart(3, '0')}`;
  };

  // Print helper for single bill
  const triggerPrint = (billData) => {
    if (!billData) return;
    setActivePrintBill(billData);
    setPrintDocument({ type: 'bill', data: billData });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Print helper for full report list (sales or purchases)
  const triggerPrintReport = ({ reportType, items, filterDate, searchTerm, stats }) => {
    setActivePrintBill(null);
    setPrintDocument({
      type: 'report',
      reportType,
      items,
      filterDate,
      searchTerm,
      stats
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Print helper for full stock register
  const triggerPrintStock = ({ items, stats, selectedCategory, stockFilter, searchTerm }) => {
    setActivePrintBill(null);
    setPrintDocument({
      type: 'stock',
      items,
      stats,
      selectedCategory,
      stockFilter,
      searchTerm
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Print helper for individual purchase invoice / voucher
  const triggerPrintPurchase = (purchaseData) => {
    if (!purchaseData) return;
    setActivePrintBill(null);
    setPrintDocument({
      type: 'purchase_invoice',
      data: purchaseData
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Find item by code / itemNo
  const findItemByCode = (code) => {
    if (!code) return null;
    const cleanCode = code.trim().toLowerCase();
    return inventory.find(
      it => (it.itemNo && it.itemNo.toLowerCase() === cleanCode) ||
            (it.name && it.name.toLowerCase() === cleanCode)
    ) || null;
  };

  // Unique suppliers list with details for auto-suggest
  const uniqueSuppliers = useMemo(() => {
    const map = new Map();
    const defaults = [
      { name: 'बालाजी टेलीकॉम डिस्ट्रीब्यूटर्स, जयपुर', mobile: '9828111222', gstin: '08AABCB9876C1Z1' },
      { name: 'श्री श्याम मोबाइल एसेसरीज, दिल्ली', mobile: '9811223344', gstin: '07AAACS1234D1Z8' },
      { name: 'अमन इंफोटेक & मोबाइल हब, जोधपुर', mobile: '9414556677', gstin: '08ABCPQ5432E1Z2' },
      { name: 'राजस्थान इलेक्ट्रॉनिक्स सप्लायर्स, सीकर', mobile: '9829001122', gstin: '08BAPRS9988D1Z9' }
    ];
    defaults.forEach(s => map.set(s.name.trim().toLowerCase(), s));

    purchases.forEach(p => {
      if (p.supplierName && p.supplierName.trim()) {
        const key = p.supplierName.trim().toLowerCase();
        map.set(key, {
          name: p.supplierName.trim(),
          mobile: p.supplierMobile || map.get(key)?.mobile || '',
          gstin: p.supplierGstin || map.get(key)?.gstin || ''
        });
      }
    });
    return Array.from(map.values());
  }, [purchases]);

  // Check if serial has already been sold in previous bill
  const isSerialSold = (serialNo, excludeBillId = null) => {
    if (!serialNo || !serialNo.trim()) return null;
    const clean = serialNo.trim().toUpperCase();
    for (const b of gstBills) {
      if (excludeBillId && b.id === excludeBillId) continue;
      for (const it of (b.items || [])) {
        const serials = parseSerials(it.serialNo);
        if (serials.includes(clean)) {
          return {
            isSold: true,
            billNo: b.billNo,
            date: b.date,
            customerName: b.customerName,
            itemName: it.name
          };
        }
      }
    }
    return null;
  };

  // Check if an item code has already been sold
  const isItemCodeSold = (itemNo, excludeBillId = null) => {
    if (!itemNo || !itemNo.trim()) return null;
    const clean = itemNo.trim().toUpperCase();
    const inv = inventory.find(i => String(i.itemNo || '').trim().toUpperCase() === clean);
    if (inv && Number(inv.stockQty) <= 0) {
      for (const b of gstBills) {
        if (excludeBillId && b.id === excludeBillId) continue;
        for (const it of (b.items || [])) {
          if (String(it.itemNo || '').trim().toUpperCase() === clean) {
            return {
              isSold: true,
              billNo: b.billNo,
              date: b.date,
              customerName: b.customerName,
              itemName: it.name
            };
          }
        }
      }
      return {
        isSold: true,
        billNo: 'SOLD',
        date: '-',
        customerName: '-',
        itemName: inv.name
      };
    }
    return null;
  };

  // Check if any item/serial in a purchase has already been sold in a sale bill
  const isPurchaseLockedDueToSale = (purchase) => {
    if (!purchase || !purchase.items) return null;
    for (const it of purchase.items) {
      const serials = parseSerials(it.serialNo);
      for (const s of serials) {
        const soldInfo = isSerialSold(s);
        if (soldInfo) {
          return {
            isLocked: true,
            soldSerial: s,
            itemName: it.name || it.itemNo,
            billNo: soldInfo.billNo,
            customerName: soldInfo.customerName,
            date: soldInfo.date
          };
        }
      }
      if (it.itemNo) {
        const soldCodeInfo = isItemCodeSold(it.itemNo);
        if (soldCodeInfo) {
          return {
            isLocked: true,
            soldSerial: it.serialNo || it.itemNo,
            itemName: it.name || it.itemNo,
            billNo: soldCodeInfo.billNo,
            customerName: soldCodeInfo.customerName,
            date: soldCodeInfo.date
          };
        }
      }
    }
    return null;
  };

  // Check if serial has already been purchased, exists in inventory, or was in bills
  const isSerialPurchased = (serialNo, excludePurchaseId = null) => {
    if (!serialNo || !serialNo.trim()) return null;
    const clean = serialNo.trim().toUpperCase();

    // 1. Check all past purchases
    for (const p of purchases) {
      if (excludePurchaseId && p.id === excludePurchaseId) continue;
      for (const it of (p.items || [])) {
        const serials = parseSerials(it.serialNo);
        if (serials.includes(clean)) {
          return {
            isPurchased: true,
            purchaseNo: p.purchaseNo || p.id,
            date: p.date,
            supplierName: p.supplierName,
            itemName: it.name
          };
        }
      }
    }

    // 2. Check all current inventory items
    for (const inv of inventory) {
      const invSerials = Array.isArray(inv.serialNumbers) ? inv.serialNumbers : parseSerials(inv.serialNo);
      if (invSerials.some(s => String(s).trim().toUpperCase() === clean)) {
        return {
          isPurchased: true,
          purchaseNo: inv.itemNo || 'STOCK',
          date: 'दुकान स्टॉक',
          supplierName: 'स्टॉक इन्वेंटरी',
          itemName: inv.name
        };
      }
    }

    // 3. Check past sales bills so sold items cannot be re-purchased with same serial
    for (const b of gstBills) {
      for (const it of (b.items || [])) {
        const serials = parseSerials(it.serialNo);
        if (serials.includes(clean)) {
          return {
            isPurchased: true,
            purchaseNo: b.invoiceNo || b.billNo || 'BILL',
            date: b.date,
            supplierName: `बिक्री बिल #${b.invoiceNo || b.billNo}`,
            itemName: it.name
          };
        }
      }
    }

    return null;
  };

  // Comprehensive Serial Validation Engine
  const validateSerial = (serialNo, { context = 'sale', currentDocId = null, allCurrentSerials = [], excludeSelf = false } = {}) => {
    if (!serialNo || !serialNo.trim()) return { isValid: true };
    const clean = serialNo.trim().toUpperCase();

    // 1. Check duplicate within current bill/document
    if (allCurrentSerials && allCurrentSerials.length > 0) {
      const occurrences = allCurrentSerials.filter(s => s && s.trim().toUpperCase() === clean);
      const maxAllowed = excludeSelf ? 0 : 1;
      if (occurrences.length > maxAllowed) {
        return {
          isValid: false,
          type: 'duplicate_in_doc',
          error: `डुप्लीकेट: यह सीरियल/IMEI (${clean}) इसी दस्तावेज़ में दोबारा दर्ज है!`
        };
      }
    }

    // 2. Context specific checks (skip while typing very short prefixes < 3 chars)
    if (clean.length < 3) {
      return { isValid: true };
    }

    if (context === 'sale') {
      const soldInfo = isSerialSold(clean, currentDocId);
      if (soldInfo) {
        return {
          isValid: false,
          type: 'already_sold',
          error: `यह सीरियल/IMEI (${clean}) पहले ही बिल #${soldInfo.billNo} (${soldInfo.date}, ग्राहक: ${soldInfo.customerName}) में बेचा जा चुका है!`,
          details: soldInfo
        };
      }
    } else if (context === 'purchase') {
      const purInfo = isSerialPurchased(clean, currentDocId);
      if (purInfo) {
        return {
          isValid: false,
          type: 'already_purchased',
          error: `यह सीरियल/IMEI (${clean}) पहले ही खरीद #${purInfo.purchaseNo} (${purInfo.supplierName || 'स्टॉक'}) में दर्ज है! एक बार खरीदा हुआ सामान दोबारा नहीं खरीदा जा सकता।`,
          details: purInfo
        };
      }
      // Check in stock only if not editing current purchase
      const inStock = inventory.some(inv => (inv.serialNumbers || []).some(s => String(s).toUpperCase() === clean));
      if (inStock && !currentDocId) {
        return {
          isValid: false,
          type: 'already_in_stock',
          error: `यह सीरियल/IMEI (${clean}) पहले से दुकान के स्टॉक में मौजूद है! दोबारा खरीद वर्जित है।`
        };
      }
    }

    return { isValid: true };
  };

  // Auto-generate Item Code: Category prefix + Auto Next Digit (3-digit zero-padded)
  const generateNextItemCode = (name = '', category = 'Mobile', otherRows = [], preferCategory = true) => {
    let prefix = '';
    const catMap = {
      'Mobile': 'MOB',
      'Battery': 'BAT',
      'Earphone': 'EAR',
      'Charger': 'CHG',
      'Accessories': 'ACC',
      'Spare Parts': 'PAR',
      'Other': 'ITM'
    };

    if (preferCategory || !name || !name.trim()) {
      prefix = catMap[category] || 'MOB';
    } else {
      const cleanName = (name || '').trim();
      const engMatches = cleanName.match(/[a-zA-Z]{3,}/);
      if (engMatches && engMatches[0]) {
        prefix = engMatches[0].slice(0, 3).toUpperCase();
      } else {
        prefix = catMap[category] || 'MOB';
      }
    }

    // Collect all existing codes with this prefix
    const existingCodes = new Set();
    inventory.forEach(it => {
      if (it.itemNo) existingCodes.add(it.itemNo.toUpperCase());
    });
    purchases.forEach(pur => {
      (pur.items || []).forEach(it => {
        if (it.itemNo) existingCodes.add(it.itemNo.toUpperCase());
      });
    });
    (otherRows || []).forEach(r => {
      if (r && r.itemNo) existingCodes.add(r.itemNo.toUpperCase());
    });

    const regex = new RegExp(`^${prefix}[-_]?(\\d+)$`, 'i');
    let maxSeq = 0;
    existingCodes.forEach(code => {
      const match = code.match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });

    const nextSeq = maxSeq + 1;
    return `${prefix}-${String(nextSeq).padStart(3, '0')}`;
  };

  // --------------------------------------------------------------------------
  // SALE BILL MANAGEMENT (With Stock Auto-Deduction & Restoration)
  // --------------------------------------------------------------------------
  const saveSaleBill = (billData) => {
    const isEdit = Boolean(billData.id && gstBills.some(b => b.id === billData.id));
    let savedRecord;

    if (isEdit) {
      const oldBill = gstBills.find(b => b.id === billData.id);

      // Revert old bill stock quantities & restore serials
      setInventory(prevInv => {
        let updated = [...prevInv];
        if (oldBill && oldBill.items) {
          oldBill.items.forEach(oldItem => {
            if (!oldItem.itemNo) return;
            const cleanCode = String(oldItem.itemNo).trim().toUpperCase();
            const idx = updated.findIndex(i => String(i.itemNo || '').trim().toUpperCase() === cleanCode);
            if (idx !== -1) {
              const cleanSerial = String(oldItem.serialNo || '').trim().toUpperCase();
              if (cleanSerial) {
                updated[idx] = {
                  ...updated[idx],
                  stockQty: 1,
                  serialNo: cleanSerial,
                  serialNumbers: [cleanSerial]
                };
              } else {
                updated[idx] = {
                  ...updated[idx],
                  stockQty: updated[idx].stockQty + (Number(oldItem.qty) || 0)
                };
              }
            }
          });
        }
        // Deduct new bill stock quantities & mark sold serials
        billData.items.forEach(newItem => {
          if (!newItem.itemNo) return;
          const cleanCode = String(newItem.itemNo).trim().toUpperCase();
          const idx = updated.findIndex(i => String(i.itemNo || '').trim().toUpperCase() === cleanCode);
          if (idx !== -1) {
            const cleanSerial = String(newItem.serialNo || '').trim().toUpperCase();
            if (cleanSerial || (Array.isArray(updated[idx].serialNumbers) && updated[idx].serialNumbers.length > 0)) {
              updated[idx] = {
                ...updated[idx],
                stockQty: 0,
                serialNumbers: []
              };
            } else {
              updated[idx] = {
                ...updated[idx],
                stockQty: Math.max(0, updated[idx].stockQty - (Number(newItem.qty) || 0))
              };
            }
          }
        });
        return updated;
      });

      savedRecord = {
        ...billData,
        updatedAt: new Date().toISOString()
      };
      setGstBills(prev => prev.map(b => (b.id === billData.id ? savedRecord : b)));
    } else {
      // Deduct stock for new bill & mark sold items
      setInventory(prevInv => {
        let updated = [...prevInv];
        billData.items.forEach(item => {
          if (!item.itemNo) return;
          const cleanCode = String(item.itemNo).trim().toUpperCase();
          const idx = updated.findIndex(i => String(i.itemNo || '').trim().toUpperCase() === cleanCode);
          if (idx !== -1) {
            const cleanSerial = String(item.serialNo || '').trim().toUpperCase();
            if (cleanSerial || (Array.isArray(updated[idx].serialNumbers) && updated[idx].serialNumbers.length > 0)) {
              updated[idx] = {
                ...updated[idx],
                stockQty: 0,
                serialNumbers: []
              };
            } else {
              updated[idx] = {
                ...updated[idx],
                stockQty: Math.max(0, updated[idx].stockQty - (Number(item.qty) || 0))
              };
            }
          }
        });
        return updated;
      });

      const newId = `bill-gst-${Date.now()}`;
      savedRecord = {
        ...billData,
        id: newId,
        billNo: billData.billNo || generateNextBillNo(),
        theme: billData.theme || settings.selectedTheme || 'classic',
        createdAt: new Date().toISOString()
      };
      setGstBills(prev => [savedRecord, ...prev]);

      // Increment sequence
      setSettings(prev => ({
        ...prev,
        nextBillSeq: Number(prev.nextBillSeq) + 1
      }));
    }

    // Direct cloud sync to Supabase
    saveGstBillToCloud(sellerId, savedRecord);

    setEditingBill(null);
    return savedRecord;
  };

  const deleteSaleBill = (billId) => {
    const bill = gstBills.find(b => b.id === billId);
    if (!bill) return;

    // Restore stock & restore sold serials
    setInventory(prevInv => {
      let updated = [...prevInv];
      if (bill.items) {
        bill.items.forEach(item => {
          if (!item.itemNo) return;
          const cleanCode = String(item.itemNo).trim().toUpperCase();
          const idx = updated.findIndex(i => String(i.itemNo || '').trim().toUpperCase() === cleanCode);
          if (idx !== -1) {
            const cleanSerial = String(item.serialNo || '').trim().toUpperCase();
            if (cleanSerial) {
              updated[idx] = {
                ...updated[idx],
                stockQty: 1,
                serialNo: cleanSerial,
                serialNumbers: [cleanSerial]
              };
            } else {
              updated[idx] = {
                ...updated[idx],
                stockQty: updated[idx].stockQty + (Number(item.qty) || 0)
              };
            }
          }
        });
      }
      return updated;
    });

    setGstBills(prev => prev.filter(b => b.id !== billId));
    deleteGstBillFromCloud(billId);
  };

  const startEditingBill = (bill) => {
    setEditingBill(bill);
    setActiveTab('generate');
  };

  const cancelEditingBill = () => {
    setEditingBill(null);
  };

  // --------------------------------------------------------------------------
  // PURCHASE ENTRY MANAGEMENT (Strict 1:1 Item Code = 1 Serial Key)
  // --------------------------------------------------------------------------
  const savePurchase = (purchaseData) => {
    const isEdit = Boolean(purchaseData.id && purchases.some(p => p.id === purchaseData.id));
    let savedRecord;

    if (isEdit) {
      const oldPur = purchases.find(p => p.id === purchaseData.id);
      if (oldPur) {
        const lockInfo = isPurchaseLockedDueToSale(oldPur);
        if (lockInfo) {
          throw new Error(`खरीद #${oldPur.purchaseNo} अपडेट नहीं की जा सकती क्योंकि इसमें शामिल सीरियल नंबर/आइटम "${lockInfo.soldSerial}" (${lockInfo.itemName}) पहले ही बिक्री बिल #${lockInfo.billNo} में बेचा जा चुका है!`);
        }
      }

      setInventory(prevInv => {
        let updated = [...prevInv];
        // Revert old purchase quantities
        if (oldPur && oldPur.items) {
          oldPur.items.forEach(oldItem => {
            const cleanCode = String(oldItem.itemNo || '').trim().toUpperCase();
            const idx = updated.findIndex(i => String(i.itemNo || '').trim().toUpperCase() === cleanCode);
            if (idx !== -1) {
              const cleanSerial = String(oldItem.serialNo || '').trim().toUpperCase();
              if (cleanSerial) {
                updated[idx] = {
                  ...updated[idx],
                  stockQty: 0,
                  serialNumbers: []
                };
              } else {
                updated[idx] = {
                  ...updated[idx],
                  stockQty: Math.max(0, updated[idx].stockQty - (Number(oldItem.qty) || 0))
                };
              }
            }
          });
        }
        // Add new purchase quantities (1:1 for serialized)
        purchaseData.items.forEach(newItem => {
          const cleanCode = String(newItem.itemNo || '').trim().toUpperCase();
          const cleanSerial = String(newItem.serialNo || '').trim().toUpperCase();
          const idx = updated.findIndex(i => String(i.itemNo || '').trim().toUpperCase() === cleanCode);

          if (cleanSerial) {
            const itemRecord = {
              id: idx !== -1 ? updated[idx].id : `itm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              itemNo: cleanCode,
              name: newItem.name || (idx !== -1 ? updated[idx].name : ''),
              category: newItem.category || (idx !== -1 ? updated[idx].category : 'Mobile'),
              hsn: newItem.hsn || (idx !== -1 ? updated[idx].hsn : '8517'),
              costPrice: Number(newItem.costPrice) || (idx !== -1 ? updated[idx].costPrice : 0),
              salePrice: Number(newItem.salePrice) || (idx !== -1 ? updated[idx].salePrice : 0),
              gstRate: Number(newItem.gstRate) !== undefined ? Number(newItem.gstRate) : (idx !== -1 ? updated[idx].gstRate : 18),
              stockQty: 1,
              minAlertQty: 1,
              unit: 'PCS',
              serialNo: cleanSerial,
              serialNumbers: [cleanSerial]
            };
            if (idx !== -1) {
              updated[idx] = itemRecord;
            } else {
              updated.push(itemRecord);
            }
          } else {
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                name: newItem.name || updated[idx].name,
                category: newItem.category || updated[idx].category,
                hsn: newItem.hsn || updated[idx].hsn,
                costPrice: Number(newItem.costPrice) || updated[idx].costPrice,
                salePrice: Number(newItem.salePrice) || updated[idx].salePrice,
                gstRate: Number(newItem.gstRate) || updated[idx].gstRate,
                stockQty: updated[idx].stockQty + (Number(newItem.qty) || 0),
                serialNo: '',
                serialNumbers: []
              };
            } else {
              updated.push({
                id: `itm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                itemNo: cleanCode,
                name: newItem.name,
                category: newItem.category || 'General',
                hsn: newItem.hsn || '8517',
                costPrice: Number(newItem.costPrice) || 0,
                salePrice: Number(newItem.salePrice) || 0,
                gstRate: Number(newItem.gstRate) || 18,
                stockQty: Number(newItem.qty) || 0,
                minAlertQty: 3,
                unit: 'PCS',
                serialNo: '',
                serialNumbers: []
              });
            }
          }
        });
        return updated;
      });

      savedRecord = {
        ...purchaseData,
        updatedAt: new Date().toISOString()
      };
      setPurchases(prev => prev.map(p => (p.id === purchaseData.id ? savedRecord : p)));
    } else {
      // New purchase: update/insert inventory items (1:1 for serialized)
      setInventory(prevInv => {
        let updated = [...prevInv];
        purchaseData.items.forEach(newItem => {
          const cleanCode = String(newItem.itemNo || '').trim().toUpperCase();
          const cleanSerial = String(newItem.serialNo || '').trim().toUpperCase();
          const idx = updated.findIndex(i => String(i.itemNo || '').trim().toUpperCase() === cleanCode);

          if (cleanSerial) {
            const itemRecord = {
              id: idx !== -1 ? updated[idx].id : `itm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              itemNo: cleanCode,
              name: newItem.name || (idx !== -1 ? updated[idx].name : ''),
              category: newItem.category || (idx !== -1 ? updated[idx].category : 'Mobile'),
              hsn: newItem.hsn || (idx !== -1 ? updated[idx].hsn : '8517'),
              costPrice: Number(newItem.costPrice) || (idx !== -1 ? updated[idx].costPrice : 0),
              salePrice: Number(newItem.salePrice) || (idx !== -1 ? updated[idx].salePrice : 0),
              gstRate: Number(newItem.gstRate) !== undefined ? Number(newItem.gstRate) : (idx !== -1 ? updated[idx].gstRate : 18),
              stockQty: 1,
              minAlertQty: 1,
              unit: 'PCS',
              serialNo: cleanSerial,
              serialNumbers: [cleanSerial]
            };
            if (idx !== -1) {
              updated[idx] = itemRecord;
            } else {
              updated.push(itemRecord);
            }
          } else {
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                name: newItem.name || updated[idx].name,
                category: newItem.category || updated[idx].category,
                hsn: newItem.hsn || updated[idx].hsn,
                costPrice: Number(newItem.costPrice) || updated[idx].costPrice,
                salePrice: Number(newItem.salePrice) || updated[idx].salePrice,
                gstRate: Number(newItem.gstRate) || updated[idx].gstRate,
                stockQty: updated[idx].stockQty + (Number(newItem.qty) || 0),
                serialNo: '',
                serialNumbers: []
              };
            } else {
              updated.push({
                id: `itm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                itemNo: cleanCode,
                name: newItem.name,
                category: newItem.category || 'General',
                hsn: newItem.hsn || '8517',
                costPrice: Number(newItem.costPrice) || 0,
                salePrice: Number(newItem.salePrice) || 0,
                gstRate: Number(newItem.gstRate) || 18,
                stockQty: Number(newItem.qty) || 0,
                minAlertQty: 3,
                unit: 'PCS',
                serialNo: '',
                serialNumbers: []
              });
            }
          }
        });
        return updated;
      });

      const newId = `pur-${Date.now()}`;
      savedRecord = {
        ...purchaseData,
        id: newId,
        purchaseNo: purchaseData.purchaseNo || generateNextPurchaseNo(),
        createdAt: new Date().toISOString()
      };
      setPurchases(prev => [savedRecord, ...prev]);
    }

    setEditingPurchase(null);
    return savedRecord;
  };

  const deletePurchase = (purchaseId) => {
    const pur = purchases.find(p => p.id === purchaseId || p.purchaseNo === purchaseId);
    if (!pur) return;

    const lockInfo = isPurchaseLockedDueToSale(pur);
    if (lockInfo) {
      throw new Error(`खरीद #${pur.purchaseNo} डिलीट नहीं की जा सकती क्योंकि इसमें शामिल सीरियल नंबर/आइटम "${lockInfo.soldSerial}" (${lockInfo.itemName}) पहले ही बिक्री बिल #${lockInfo.billNo} में बेचा जा चुका है!`);
    }

    // Deduct stock & remove serials
    setInventory(prevInv => {
      let updated = [...prevInv];
      if (pur.items) {
        pur.items.forEach(item => {
          const cleanCode = String(item.itemNo || '').trim().toUpperCase();
          const idx = updated.findIndex(i => String(i.itemNo || '').trim().toUpperCase() === cleanCode);
          if (idx !== -1) {
            const purchasedSerials = parseSerials(item.serialNo);
            const curSerials = updated[idx].serialNumbers || [];
            const remaining = curSerials.filter(s => !purchasedSerials.includes(s.toUpperCase()));
            updated[idx] = {
              ...updated[idx],
              stockQty: Math.max(0, updated[idx].stockQty - (Number(item.qty) || 0)),
              serialNumbers: remaining
            };
          }
        });
      }
      return updated;
    });

    const targetId = pur.id;
    const targetNo = pur.purchaseNo;
    setPurchases(prev => prev.filter(p => p.id !== targetId && p.purchaseNo !== targetNo));
    deleteGstPurchaseFromCloud(sellerId, targetId, targetNo);
  };

  const startEditingPurchase = (purchase) => {
    setEditingPurchase(purchase);
    setActiveTab('purchase');
  };

  const cancelEditingPurchase = () => {
    setEditingPurchase(null);
  };

  // --------------------------------------------------------------------------
  // QUICK ADD STOCK / PURCHASE (Called when missing item in sale)
  // --------------------------------------------------------------------------
  const quickAddStock = ({
    itemNo,
    name,
    category,
    hsn,
    costPrice,
    salePrice,
    gstRate,
    qty,
    supplierName,
    serialNo = ''
  }) => {
    const cleanNo = itemNo.trim().toUpperCase();
    const numQty = Number(qty) || 1;
    const numCost = Number(costPrice) || 0;
    const numSale = Number(salePrice) || 0;
    const numGst = Number(gstRate) || 18;
    const newSerials = parseSerials(serialNo);

    // 1. Update or create item in inventory
    let targetItem;
    setInventory(prevInv => {
      let updated = [...prevInv];
      const idx = updated.findIndex(i => i.itemNo.toUpperCase() === cleanNo);
      if (idx !== -1) {
        const curSerials = updated[idx].serialNumbers || [];
        const merged = Array.from(new Set([...curSerials, ...newSerials]));
        targetItem = {
          ...updated[idx],
          name: name || updated[idx].name,
          category: category || updated[idx].category,
          hsn: hsn || updated[idx].hsn,
          costPrice: numCost || updated[idx].costPrice,
          salePrice: numSale || updated[idx].salePrice,
          gstRate: numGst,
          stockQty: updated[idx].stockQty + numQty,
          serialNumbers: merged
        };
        updated[idx] = targetItem;
      } else {
        targetItem = {
          id: `itm-${Date.now()}`,
          itemNo: cleanNo,
          name: name || 'आइटम ' + cleanNo,
          category: category || 'Mobile Accessories',
          hsn: hsn || '8517',
          costPrice: numCost,
          salePrice: numSale,
          gstRate: numGst,
          stockQty: numQty,
          minAlertQty: 3,
          unit: 'PCS',
          serialNumbers: newSerials
        };
        updated.push(targetItem);
      }
      return updated;
    });

    // 2. Automatically record in purchase history
    const taxableTotal = numCost * numQty;
    const totalGst = Math.round((taxableTotal * numGst) / 100);
    const grandTotal = taxableTotal + totalGst;

    const newPurchase = {
      id: `pur-quick-${Date.now()}`,
      purchaseNo: generateNextPurchaseNo(),
      date: new Date().toISOString().split('T')[0],
      supplierName: supplierName || 'त्वरित खरीद (Counter Purchase)',
      supplierMobile: '',
      supplierGstin: '',
      supplierInvoiceNo: 'QUICK-' + Math.floor(1000 + Math.random() * 9000),
      items: [
        {
          itemNo: cleanNo,
          name: name || 'आइटम ' + cleanNo,
          category: category || 'Mobile Accessories',
          hsn: hsn || '8517',
          costPrice: numCost,
          salePrice: numSale,
          gstRate: numGst,
          qty: numQty,
          serialNo: serialNo.trim(),
          total: grandTotal
        }
      ],
      totalTaxable: taxableTotal,
      totalGst: totalGst,
      grandTotal: grandTotal,
      createdAt: new Date().toISOString()
    };

    setPurchases(prev => [newPurchase, ...prev]);

    return targetItem;
  };

  // Inventory direct edits
  const saveInventoryItem = (itemData) => {
    setInventory(prev => {
      const idx = prev.findIndex(i => i.id === itemData.id || i.itemNo.toLowerCase() === itemData.itemNo.toLowerCase());
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...itemData };
        return updated;
      } else {
        return [
          {
            ...itemData,
            id: itemData.id || `itm-${Date.now()}`,
            itemNo: itemData.itemNo.toUpperCase(),
            stockQty: Number(itemData.stockQty) || 0,
            costPrice: Number(itemData.costPrice) || 0,
            salePrice: Number(itemData.salePrice) || 0,
            gstRate: Number(itemData.gstRate) || 18,
            minAlertQty: Number(itemData.minAlertQty) || 3
          },
          ...prev
        ];
      }
    });
  };

  const deleteInventoryItem = (id) => {
    const item = inventory.find(i => i.id === id || i.itemNo === id);
    if (item) {
      const soldCodeInfo = isItemCodeSold(item.itemNo);
      if (soldCodeInfo) {
        throw new Error(`आइटम "${item.name}" (कोड: ${item.itemNo}) हटाया नहीं जा सकता क्योंकि यह बिक्री बिल #${soldCodeInfo.billNo} में बेचा जा चुका है!`);
      }
      const serials = Array.isArray(item.serialNumbers) ? item.serialNumbers : parseSerials(item.serialNo);
      for (const s of serials) {
        const soldSerialInfo = isSerialSold(s);
        if (soldSerialInfo) {
          throw new Error(`आइटम "${item.name}" (सीरियल: ${s}) हटाया नहीं जा सकता क्योंकि यह बिक्री बिल #${soldSerialInfo.billNo} में बेचा जा चुका है!`);
        }
      }
      deleteGstInventoryFromCloud(sellerId, item.id, item.itemNo);
    }
    setInventory(prev => prev.filter(i => i.id !== id && (!item || i.itemNo !== item.itemNo)));
  };

  // --------------------------------------------------------------------------
  // SETTINGS MANAGEMENT
  // --------------------------------------------------------------------------
  const updateSettings = (newSettings) => {
    setSettings(prev => {
      let gstin = newSettings.gstin !== undefined ? newSettings.gstin : prev.gstin;
      // Protection against removing GSTIN once established:
      // "ek baar user gst no se login kar le uske baad user gst no ko hatakar save n kar sakte ha change jarur kar sakta h"
      const hadGstin = Boolean(
        (prev.gstin && String(prev.gstin).trim().length >= 10) ||
        (effectiveSeller?.profile?.gstin && String(effectiveSeller.profile.gstin).trim().length >= 10)
      );

      if (!gstin || !String(gstin).trim()) {
        // TAB 1 GST BILLING RULE: GSTIN can never be blank! Retain existing GSTIN
        gstin = prev.gstin || effectiveSeller?.profile?.gstin || INITIAL_SETTINGS.gstin;
      }

      return {
        ...prev,
        ...newSettings,
        isConfigured: newSettings.isConfigured !== undefined ? Boolean(newSettings.isConfigured) : prev.isConfigured,
        gstin,
        displayOptions: {
          ...prev.displayOptions,
          ...(newSettings.displayOptions || {})
        }
      };
    });
  };

  const resetSettings = () => {
    setSettings(prev => ({
      ...INITIAL_SETTINGS,
      // Retain seller's GSTIN and identity if existing
      gstin: prev.gstin || effectiveSeller?.profile?.gstin || INITIAL_SETTINGS.gstin,
      firmName: prev.firmName || effectiveSeller?.profile?.shopName || INITIAL_SETTINGS.firmName,
      mobile: prev.mobile || effectiveSeller?.profile?.mobile || INITIAL_SETTINGS.mobile,
    }));
  };

  // Add GST Slab (e.g. 3%, 12%, 18%)
  const addGstSlab = (rate) => {
    const num = parseFloat(rate);
    if (isNaN(num) || num < 0) return false;
    const currentSlabs = settings.gstSlabs || [0, 5, 12, 18, 28];
    if (currentSlabs.includes(num)) return false;
    const newSlabs = [...currentSlabs, num].sort((a, b) => a - b);
    updateSettings({ gstSlabs: newSlabs });
    return true;
  };

  // Remove GST Slab
  const removeGstSlab = (rate) => {
    const num = parseFloat(rate);
    const currentSlabs = settings.gstSlabs || [0, 5, 12, 18, 28];
    if (currentSlabs.length <= 1) return false;
    const newSlabs = currentSlabs.filter(s => s !== num);
    updateSettings({ gstSlabs: newSlabs });
    return true;
  };

  // --------------------------------------------------------------------------
  // ITEM GST RULES: Auto-detect GST rate based on Item Name
  // --------------------------------------------------------------------------
  const getItemGstRate = (name = '') => {
    if (!name || typeof name !== 'string') return null;
    const clean = name.trim().toLowerCase();
    if (!clean) return null;

    const rules = settings.itemGstRules || INITIAL_SETTINGS.itemGstRules || [];

    // 1. Exact match
    const exact = rules.find(r => (r.itemName || '').trim().toLowerCase() === clean);
    if (exact) return exact;

    // 2. Keyword match (e.g. "OnePlus 65W SuperVOOC Charger" contains "charger")
    const keywordMatch = rules.find(r => {
      const keyword = (r.itemName || '').trim().toLowerCase();
      return keyword && clean.includes(keyword);
    });
    if (keywordMatch) return keywordMatch;

    return null;
  };

  const addItemGstRule = ({ itemName, gstRate, hsn }) => {
    if (!itemName || !itemName.trim()) return false;
    const rate = parseFloat(gstRate);
    if (isNaN(rate) || rate < 0) return false;
    const currentRules = settings.itemGstRules || INITIAL_SETTINGS.itemGstRules || [];
    const newRule = {
      id: `rule-${Date.now()}`,
      itemName: itemName.trim(),
      gstRate: rate,
      hsn: (hsn || '').trim()
    };
    updateSettings({ itemGstRules: [newRule, ...currentRules] });
    return true;
  };

  const removeItemGstRule = (ruleId) => {
    const currentRules = settings.itemGstRules || INITIAL_SETTINGS.itemGstRules || [];
    const updated = currentRules.filter(r => r.id !== ruleId);
    updateSettings({ itemGstRules: updated });
  };

  const resetItemGstRules = () => {
    updateSettings({ itemGstRules: INITIAL_SETTINGS.itemGstRules });
  };

  // --------------------------------------------------------------------------
  // BACKUP & RESTORE
  // --------------------------------------------------------------------------
  const exportData = () => {
    const backup = {
      settings,
      inventory,
      purchases,
      gstBills,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mobile_billing_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData) => {
    try {
      if (jsonData.settings) setSettings(jsonData.settings);
      if (jsonData.inventory && Array.isArray(jsonData.inventory)) setInventory(jsonData.inventory);
      if (jsonData.purchases && Array.isArray(jsonData.purchases)) setPurchases(jsonData.purchases);
      if (jsonData.gstBills && Array.isArray(jsonData.gstBills)) setGstBills(jsonData.gstBills);
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
        inventory,
        purchases,
        gstBills,
        activeTab,
        setActiveTab,
        editingBill,
        startEditingBill,
        cancelEditingBill,
        editingPurchase,
        startEditingPurchase,
        cancelEditingPurchase,
        activePrintBill,
        setActivePrintBill,
        printDocument,
        setPrintDocument,
        triggerPrint,
        triggerPrintReport,
        triggerPrintStock,
        triggerPrintPurchase,
        generateNextBillNo,
        generateNextPurchaseNo,
        generateNextItemCode,
        findItemByCode,
        saveSaleBill,
        deleteSaleBill,
        savePurchase,
        deletePurchase,
        quickAddStock,
        saveInventoryItem,
        deleteInventoryItem,
        addGstSlab,
        removeGstSlab,
        getItemGstRate,
        addItemGstRule,
        removeItemGstRule,
        resetItemGstRules,
        uniqueSuppliers,
        validateSerial,
        isSerialSold,
        isItemCodeSold,
        isSerialPurchased,
        isPurchaseLockedDueToSale,
        parseSerials,
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
