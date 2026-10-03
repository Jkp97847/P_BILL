import React, { useState, useEffect, useMemo } from 'react';
import { useBilling } from '../../context/BillingContext';
import PrintableBill from '../PrintableBill';
import QuickPurchaseModal from '../modals/QuickPurchaseModal';
import { 
  Printer, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  PackagePlus,
  Search,
  User,
  Phone,
  Calendar,
  Hash,
  Sparkles,
  CreditCard,
  AlertTriangle,
  Lock,
  MapPin
} from 'lucide-react';
import {
  formatMobileInput,
  validateMobile,
  formatGstinInput,
  validateGstin
} from '../../utils/validation';

const FIXED_ROW_COUNT = 10;

const createEmptyRow = (index, defaultGst = 18) => ({
  id: `row-${index + 1}`,
  itemNo: '',
  serialNo: '', // Serial Number / IMEI / Key
  name: '',
  hsn: '',
  qty: '',
  unit: 'PCS',
  salePriceIncGst: '',
  rate: '', // Taxable rate
  taxableAmount: 0,
  gstRate: defaultGst,
  cgstAmount: 0,
  sgstAmount: 0,
  total: 0
});

export default function BillGenerateTab() {
  const {
    settings,
    inventory,
    saveSaleBill,
    generateNextBillNo,
    editingBill,
    cancelEditingBill,
    triggerPrint,
    setActivePrintBill,
    validateSerial,
    isSerialSold,
    parseSerials,
    generateNextItemCode,
    getItemGstRate
  } = useBilling();

  const gstSlabs = useMemo(() => {
    return settings.gstSlabs && Array.isArray(settings.gstSlabs) && settings.gstSlabs.length > 0
      ? settings.gstSlabs
      : [0, 5, 12, 18, 28];
  }, [settings.gstSlabs]);

  // Header & Buyer States
  const [billNo, setBillNo] = useState('');
  const [date, setDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash / UPI');
  const [discount, setDiscount] = useState(0);

  // Fixed 10 Rows State
  const [rows, setRows] = useState(() => 
    Array.from({ length: FIXED_ROW_COUNT }, (_, i) => createEmptyRow(i, gstSlabs[0] || 18))
  );

  // UI States
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingBillData, setPendingBillData] = useState(null);
  const [shouldPrintAfterSave, setShouldPrintAfterSave] = useState(false);
  const [quickPurchaseRowIndex, setQuickPurchaseRowIndex] = useState(null);
  const [quickPurchaseItemNo, setQuickPurchaseItemNo] = useState('');
  const [activeSuggestionRow, setActiveSuggestionRow] = useState(null);
  const [activeNameSuggestionRow, setActiveNameSuggestionRow] = useState(null);
  const [activeSerialSuggestionRow, setActiveSerialSuggestionRow] = useState(null);
  const tableContainerRef = React.useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (tableContainerRef.current && !tableContainerRef.current.contains(e.target)) {
        setActiveSuggestionRow(null);
        setActiveNameSuggestionRow(null);
        setActiveSerialSuggestionRow(null);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  // Initialize or populate when editingBill or settings change
  useEffect(() => {
    if (editingBill) {
      setBillNo(editingBill.billNo);
      setDate(editingBill.date || new Date().toISOString().split('T')[0]);
      setCustomerName((editingBill.customerName || '').toUpperCase().slice(0, 100));
      setCustomerMobile((editingBill.customerMobile || '').replace(/\D/g, '').slice(0, 10));
      setCustomerGstin(editingBill.customerGstin || '');
      setCustomerAddress(editingBill.customerAddress || settings.defaultCustomerAddress || settings.address || '');
      setPaymentMode(editingBill.paymentMode || 'Cash / UPI');
      setDiscount(editingBill.discount || 0);

      const existingItems = (editingBill.items || []).slice(0, FIXED_ROW_COUNT);
      const newRows = Array.from({ length: FIXED_ROW_COUNT }, (_, i) => {
        if (existingItems[i]) {
          const it = existingItems[i];
          const qty = Number(it.qty) || 1;
          const total = Number(it.total) || 0;
          return {
            id: `row-${i + 1}`,
            itemNo: it.itemNo || '',
            serialNo: it.serialNo || '',
            name: it.name || '',
            hsn: it.hsn || '',
            qty: qty,
            unit: it.unit || 'PCS',
            salePriceIncGst: total && qty ? (total / qty).toFixed(2) : '',
            rate: it.rate || (total && qty ? (total / qty / (1 + (it.gstRate || 18) / 100)).toFixed(2) : ''),
            taxableAmount: it.taxableAmount || 0,
            gstRate: it.gstRate || 18,
            cgstAmount: it.cgstAmount || 0,
            sgstAmount: it.sgstAmount || 0,
            total: total
          };
        }
        return createEmptyRow(i, gstSlabs[0] || 18);
      });
      setRows(newRows);
    } else {
      resetForm();
    }
  }, [editingBill, settings.billPrefix, settings.nextBillSeq, settings.defaultCustomerAddress, settings.selectedTheme]);

  const resetForm = () => {
    setBillNo(generateNextBillNo());
    setDate(new Date().toISOString().split('T')[0]);
    setCustomerName('');
    setCustomerMobile('');
    setCustomerGstin('');
    setCustomerAddress(settings.defaultCustomerAddress || settings.address || 'स्थानीय / लोकल');
    setPaymentMode('Cash / UPI');
    setDiscount(0);
    setRows(Array.from({ length: FIXED_ROW_COUNT }, (_, i) => createEmptyRow(i, gstSlabs[0] || 18)));
  };

  // --------------------------------------------------------------------------
  // INPUT VALIDATIONS & PASTE HANDLERS
  // --------------------------------------------------------------------------
  const handleCustomerNameChange = (e) => {
    const upper = e.target.value.toUpperCase().slice(0, 100);
    setCustomerName(upper);
  };

  const handleCustomerNamePaste = (e) => {
    e.preventDefault();
    const pasteText = e.clipboardData.getData('text') || '';
    const upper = pasteText.toUpperCase();
    if (upper.length > 100) {
      setNotification({
        type: 'warning',
        message: 'ग्राहक का नाम 100 अक्षरों से अधिक था, केवल पहले 100 अक्षर लिए गए हैं।'
      });
      setTimeout(() => setNotification(null), 4000);
    }
    setCustomerName(upper.slice(0, 100));
  };

  const handleCustomerMobileChange = (e) => {
    const formatted = formatMobileInput(e.target.value);
    setCustomerMobile(formatted);
  };

  const handleCustomerMobilePaste = (e) => {
    e.preventDefault();
    const pasteText = e.clipboardData.getData('text') || '';
    const digits = pasteText.replace(/\D/g, '');

    if (digits.length === 0) {
      setNotification({
        type: 'error',
        message: 'पेस्ट किए गए टेक्स्ट में कोई अंक नहीं मिला! केवल 10 अंकों का मोबाइल नंबर मान्य है।'
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    if (pasteText.length !== digits.length) {
      setNotification({
        type: 'warning',
        message: 'मोबाइल नंबर में से अक्षर व चिन्ह हटाकर केवल अंक लिए गए हैं।'
      });
      setTimeout(() => setNotification(null), 4000);
    }

    if (digits.length > 10) {
      setNotification({
        type: 'warning',
        message: `मोबाइल नंबर ${digits.length} अंकों का था! केवल पहले 10 अंक (${digits.slice(0, 10)}) लिए गए हैं।`
      });
      setTimeout(() => setNotification(null), 4000);
    }

    setCustomerMobile(formatMobileInput(digits));
  };

  // Helper to calculate available unsold stock for an item considering other rows in current bill
  const getAvailableStockForItem = (item, currentRowIndex = -1, currentRows = rows) => {
    if (!item) return 0;
    const baseStock = Number(item.stockQty) || 0;
    if (baseStock <= 0) return 0;

    // Collect serials & quantities used in other rows of the current bill
    const usedSerialsInOtherRows = new Set();
    let qtyUsedInOtherRows = 0;
    const checkItemNo = String(item.itemNo || '').trim().toUpperCase();

    (currentRows || []).forEach((r, idx) => {
      if (idx !== currentRowIndex && r) {
        if (String(r.itemNo || '').trim().toUpperCase() === checkItemNo) {
          qtyUsedInOtherRows += Number(r.qty) || 1;
        }
        if (r.serialNo) {
          parseSerials(r.serialNo).forEach(s => usedSerialsInOtherRows.add(s.toUpperCase()));
        }
      }
    });

    if (Array.isArray(item.serialNumbers) && item.serialNumbers.length > 0) {
      const unsoldUnusedSerials = item.serialNumbers.filter(s => {
        const up = String(s).trim().toUpperCase();
        return !isSerialSold(up, editingBill?.id) && !usedSerialsInOtherRows.has(up);
      });
      return unsoldUnusedSerials.length;
    }

    return Math.max(0, baseStock - qtyUsedInOtherRows);
  };

  // Helper to auto-fill attached serial number / key for an item (Strict 1:1)
  const getAutoSerialsForItem = (item, qty = 1, currentRows = rows, currentRowIndex = -1) => {
    if (!item) return '';

    // Collect serials used in other rows of the current bill
    const usedSerialsInOtherRows = new Set();
    (currentRows || []).forEach((r, idx) => {
      if (idx !== currentRowIndex && r && r.serialNo) {
        parseSerials(r.serialNo).forEach(s => usedSerialsInOtherRows.add(s.toUpperCase()));
      }
    });

    if (item.serialNo && typeof item.serialNo === 'string' && item.serialNo.trim()) {
      const up = item.serialNo.trim().toUpperCase();
      if (!usedSerialsInOtherRows.has(up) && !isSerialSold(up, editingBill?.id)) {
        return item.serialNo.trim();
      }
      return '';
    }

    if (Array.isArray(item.serialNumbers) && item.serialNumbers.length > 0) {
      const available = item.serialNumbers.filter(s => {
        const up = String(s).trim().toUpperCase();
        return !usedSerialsInOtherRows.has(up) && !isSerialSold(up, editingBill?.id);
      });

      if (available.length > 0) {
        return String(available[0]).trim();
      }
      return '';
    }

    return '';
  };

  // --------------------------------------------------------------------------
  // AUTO-FILL ON ITEM NUMBER SELECTION / INPUT (With Duplicate & Sold Out Prevention)
  // --------------------------------------------------------------------------
  const handleItemNoChange = (index, enteredCode) => {
    const code = enteredCode.toUpperCase();
    const cleanCode = code.trim();

    // Prevent duplicate item code across other rows of the current bill
    if (cleanCode) {
      const isAlreadyInOtherRow = rows.some((r, rIdx) => 
        rIdx !== index && String(r.itemNo || '').trim().toUpperCase() === cleanCode
      );
      if (isAlreadyInOtherRow) {
        setNotification({
          type: 'error',
          message: `⚠️ आइटम कोड "${code}" इस बिल में पहले से दर्ज है! डुप्लीकेट एंट्री वर्जित है। कृपया उसी पंक्ति में मात्रा (Qty) बढ़ाएं।`
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }
    
    // Normalize code for flexible matching (e.g. MOB001 matching MOB-001)
    const norm = (s) => String(s || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const cleanNorm = norm(cleanCode);

    // Check if matched in inventory (by itemNo exact, normalized, or barcode/IMEI)
    const matched = inventory.find(it => {
      const itCode = String(it.itemNo || '').trim().toUpperCase();
      if (itCode === cleanCode) return true;
      if (cleanNorm && norm(itCode) === cleanNorm) return true;
      // Also match if user scans IMEI / serial number directly into Item Code box
      if (Array.isArray(it.serialNumbers) && it.serialNumbers.some(s => String(s).trim().toUpperCase() === cleanCode || (cleanNorm && norm(s) === cleanNorm))) {
        return true;
      }
      if (it.serialNo && (String(it.serialNo).trim().toUpperCase() === cleanCode || (cleanNorm && norm(it.serialNo) === cleanNorm))) {
        return true;
      }
      return false;
    });

    if (matched) {
      const availableStock = getAvailableStockForItem(matched, index, rows);
      if (availableStock <= 0) {
        setNotification({
          type: 'error',
          message: `⚠️ आइटम "${matched.name}" (कोड: ${matched.itemNo}) का स्टॉक समाप्त हो चुका है (उपलब्ध स्टॉक: 0)! बिना स्टॉक के सेल नहीं किया जा सकता। कृपया पहले परचेज दर्ज करें।`
        });
        setTimeout(() => setNotification(null), 6000);
        setRows(prevRows => {
          const updated = [...prevRows];
          updated[index] = createEmptyRow(index, gstSlabs[0] || 18);
          return updated;
        });
        return;
      }

      setRows(prevRows => {
        const updated = [...prevRows];
        const target = { ...updated[index], itemNo: matched.itemNo };
        const qty = Number(target.qty) > 0 ? Number(target.qty) : 1;
        const salePrice = Number(matched.salePrice) || 0;
        const gstRule = getItemGstRate ? getItemGstRate(matched.name) : null;
        const gstRate = Number(matched.gstRate) || (gstRule ? gstRule.gstRate : (gstSlabs.includes(18) ? 18 : gstSlabs[0]));
        const hsn = matched.hsn || (gstRule ? gstRule.hsn : '8517');
        
        const taxableUnit = Math.round((salePrice / (1 + gstRate / 100)) * 100) / 100;
        const taxableAmount = Math.round(taxableUnit * qty * 100) / 100;
        const totalTax = Math.round((salePrice * qty - taxableAmount) * 100) / 100;
        const halfTax = Math.round((totalTax / 2) * 100) / 100;
        const lineTotal = Math.round(salePrice * qty * 100) / 100;

        // If scanned IMEI was an exact match for one of the serials, use that serial!
        let chosenSerial = '';
        if (Array.isArray(matched.serialNumbers) && matched.serialNumbers.some(s => String(s).trim().toUpperCase() === cleanCode)) {
          chosenSerial = cleanCode;
        } else {
          chosenSerial = getAutoSerialsForItem(matched, 1, prevRows, index);
        }

        const isSerialized = Boolean(chosenSerial || matched.serialNo || (Array.isArray(matched.serialNumbers) && matched.serialNumbers.length > 0));
        const finalQty = isSerialized ? 1 : qty;

        target.name = matched.name;
        target.serialNo = chosenSerial;
        target.hsn = hsn;
        target.qty = finalQty;
        target.unit = matched.unit || 'PCS';
        target.salePriceIncGst = salePrice;
        target.rate = taxableUnit;
        target.taxableAmount = Math.round(taxableUnit * finalQty * 100) / 100;
        target.gstRate = gstRate;
        target.cgstAmount = Math.round((halfTax * finalQty / qty) * 100) / 100;
        target.sgstAmount = Math.round((halfTax * finalQty / qty) * 100) / 100;
        target.total = Math.round(salePrice * finalQty * 100) / 100;

        updated[index] = target;
        return updated;
      });
      return;
    }

    setRows(prevRows => {
      const updated = [...prevRows];
      updated[index] = { ...updated[index], itemNo: code };
      return updated;
    });
  };

  // Blur Handler on Item Code Input (Auto-complete if matching inventory item)
  const handleItemNoBlur = (index) => {
    setTimeout(() => setActiveSuggestionRow(null), 250);
    const row = rows[index];
    if (!row || !row.itemNo || !row.itemNo.trim()) return;

    const code = row.itemNo.trim().toUpperCase();
    const norm = (s) => String(s || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const cleanNorm = norm(code);

    const matched = inventory.find(it => {
      const itNo = String(it.itemNo || '').trim().toUpperCase();
      if (itNo === code) return true;
      if (cleanNorm && norm(itNo) === cleanNorm) return true;
      return false;
    });

    if (!matched) {
      setNotification({
        type: 'error',
        message: `⚠️ आइटम कोड "${code}" परचेज लिस्ट में नहीं मिला! बिना परचेज (Purchase Entry) के कोई भी सामान सेल नहीं किया जा सकता। कृपया पहले सप्लायर से परचेज दर्ज करें।`
      });
      setTimeout(() => setNotification(null), 6000);
      setRows(prevRows => {
        const updated = [...prevRows];
        updated[index] = createEmptyRow(index, gstSlabs[0] || 18);
        return updated;
      });
      return;
    }

    if (matched) {
      selectInventoryItem(index, matched);
    }
  };

  // Direct Selection from Autocomplete Dropdown
  const selectInventoryItem = (index, item) => {
    const cleanCode = String(item.itemNo || '').trim().toUpperCase();

    // Prevent duplicate item code across other rows
    const isAlreadyInOtherRow = rows.some((r, rIdx) => 
      rIdx !== index && String(r.itemNo || '').trim().toUpperCase() === cleanCode
    );
    if (isAlreadyInOtherRow) {
      setNotification({
        type: 'error',
        message: `⚠️ आइटम "${item.itemNo}" (${item.name}) इस बिल में पहले से दर्ज है! डुप्लीकेट एंट्री वर्जित है।`
      });
      setTimeout(() => setNotification(null), 5000);
      setActiveSuggestionRow(null);
      return;
    }

    const availableStock = getAvailableStockForItem(item, index, rows);
    if (availableStock <= 0) {
      setNotification({
        type: 'error',
        message: `⚠️ आइटम "${item.name}" (कोड: ${item.itemNo}) का स्टॉक समाप्त हो चुका है (उपलब्ध स्टॉक: 0)! कृपया पहले सप्लायर से परचेज (Purchase Entry) दर्ज करें।`
      });
      setTimeout(() => setNotification(null), 6000);
      setActiveSuggestionRow(null);
      setRows(prevRows => {
        const updated = [...prevRows];
        updated[index] = createEmptyRow(index, gstSlabs[0] || 18);
        return updated;
      });
      return;
    }

    const autoSerial = getAutoSerialsForItem(item, 1, rows, index);
    const isSerialized = Boolean(autoSerial || item.serialNo || (Array.isArray(item.serialNumbers) && item.serialNumbers.length > 0));
    const qty = isSerialized ? 1 : (Number(rows[index].qty) > 0 ? Number(rows[index].qty) : 1);
    const salePrice = Number(item.salePrice) || 0;
    const gstRule = getItemGstRate ? getItemGstRate(item.name) : null;
    const gstRate = Number(item.gstRate) || (gstRule ? gstRule.gstRate : (gstSlabs.includes(18) ? 18 : gstSlabs[0]));
    const hsn = item.hsn || (gstRule ? gstRule.hsn : '8517');

    const taxableUnit = Math.round((salePrice / (1 + gstRate / 100)) * 100) / 100;
    const taxableAmount = Math.round(taxableUnit * qty * 100) / 100;
    const totalTax = Math.round((salePrice * qty - taxableAmount) * 100) / 100;
    const halfTax = Math.round((totalTax / 2) * 100) / 100;
    const lineTotal = Math.round(salePrice * qty * 100) / 100;

    setRows(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        itemNo: item.itemNo,
        serialNo: autoSerial,
        name: item.name,
        hsn: hsn,
        qty: qty,
        unit: item.unit || 'PCS',
        salePriceIncGst: salePrice,
        rate: taxableUnit,
        taxableAmount: taxableAmount,
        gstRate: gstRate,
        cgstAmount: halfTax,
        sgstAmount: halfTax,
        total: lineTotal
      };
      return updated;
    });

    setActiveSuggestionRow(null);
    setActiveNameSuggestionRow(null);
  };

  // Handle Qty, Price, or Name Manual Edits (with Auto-fill GST on Name)
  const handleCellChange = (index, field, value) => {
    setRows(prev => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };

      const qty = Math.max(1, parseFloat(field === 'qty' ? value : target.qty) || 1);
      const gstRate = parseFloat(field === 'gstRate' ? value : target.gstRate) || 0;

      // Auto-fill GST Rate based on Item Name
      if (field === 'name' && value && value.trim()) {
        const gstRule = getItemGstRate ? getItemGstRate(value) : null;
        if (gstRule && gstRule.gstRate !== undefined) {
          target.gstRate = gstRule.gstRate;
          if (gstRule.hsn && (!target.hsn || target.hsn === '8517')) {
            target.hsn = gstRule.hsn;
          }
        }
      }

      // If item quantity is changed, validate against available stock
      if (field === 'qty') {
        const cleanItemNo = String(target.itemNo || '').trim().toUpperCase();
        const invMatch = inventory.find(it => String(it.itemNo || '').trim().toUpperCase() === cleanItemNo);
        if (invMatch) {
          const avail = getAvailableStockForItem(invMatch, index, prev);
          if (avail <= 0) {
            setNotification({
              type: 'error',
              message: `⚠️ आइटम "${invMatch.name}" स्टॉक में उपलब्ध नहीं है (उपलब्ध: 0)!`
            });
            setTimeout(() => setNotification(null), 5000);
            target.qty = 0;
          } else if (parseFloat(value) > avail) {
            setNotification({
              type: 'error',
              message: `⚠️ आइटम "${invMatch.name}" का उपलब्ध स्टॉक केवल ${avail} है! आप ${value} मात्रा नहीं बेच सकते।`
            });
            setTimeout(() => setNotification(null), 5000);
            target.qty = avail;
          }
        }
        if ((target.serialNo && target.serialNo.trim()) || (invMatch && (invMatch.serialNo || (invMatch.serialNumbers && invMatch.serialNumbers.length > 0)))) {
          target.qty = 1;
        }
      }

      if (field === 'salePriceIncGst' || field === 'qty' || field === 'gstRate' || field === 'name') {
        const salePrice = parseFloat(field === 'salePriceIncGst' ? value : target.salePriceIncGst) || 0;
        const total = Math.round(salePrice * qty * 100) / 100;
        const taxableTotal = Math.round((total / (1 + gstRate / 100)) * 100) / 100;
        const totalGst = Math.round((total - taxableTotal) * 100) / 100;
        const halfGst = Math.round((totalGst / 2) * 100) / 100;

        target.rate = qty > 0 ? (taxableTotal / qty).toFixed(2) : 0;
        target.taxableAmount = taxableTotal;
        target.cgstAmount = halfGst;
        target.sgstAmount = halfGst;
        target.total = total;
      } else if (field === 'rate') {
        const rate = parseFloat(value) || 0;
        const taxableAmount = Math.round(rate * qty * 100) / 100;
        const totalGst = Math.round((taxableAmount * gstRate / 100) * 100) / 100;
        const halfGst = Math.round((totalGst / 2) * 100) / 100;
        target.taxableAmount = taxableAmount;
        target.cgstAmount = halfGst;
        target.sgstAmount = halfGst;
        target.total = Math.round((taxableAmount + totalGst) * 100) / 100;
        target.salePriceIncGst = qty > 0 ? (target.total / qty).toFixed(2) : 0;
      }

      updated[index] = target;
      return updated;
    });
  };

  const clearRow = (index) => {
    setRows(prev => {
      const updated = [...prev];
      updated[index] = createEmptyRow(index, gstSlabs[0] || 18);
      return updated;
    });
  };

  const triggerQuickPurchase = (index, currentCode) => {
    setQuickPurchaseRowIndex(index);
    setQuickPurchaseItemNo(currentCode || '');
  };

  const handleStockAdded = (addedItem) => {
    if (quickPurchaseRowIndex !== null && addedItem) {
      selectInventoryItem(quickPurchaseRowIndex, addedItem);
      setNotification({
        type: 'success',
        message: `आइटम ${addedItem.itemNo} का स्टॉक जुड़ गया और बिल में लग गया!`
      });
      setTimeout(() => setNotification(null), 4000);
    }
    setQuickPurchaseRowIndex(null);
  };

  // Check if a row has any user input
  const isRowActive = (r) => {
    if (!r) return false;
    return Boolean(
      (r.itemNo && r.itemNo.trim() !== '') ||
      (r.name && r.name.trim() !== '') ||
      (r.serialNo && r.serialNo.trim() !== '') ||
      (r.qty !== '' && Number(r.qty) !== 0) ||
      (r.salePriceIncGst !== '' && Number(r.salePriceIncGst) !== 0) ||
      (r.rate !== '' && Number(r.rate) !== 0)
    );
  };

  const handleNameBlur = (index) => {
    setTimeout(() => setActiveNameSuggestionRow(null), 250);
    setRows(prev => {
      const cur = prev[index];
      if (cur && cur.name && cur.name.trim() !== '') {
        const updated = [...prev];
        const target = { ...cur };

        // Ensure GST rate rule is applied on blur
        if (getItemGstRate) {
          const gstRule = getItemGstRate(target.name);
          if (gstRule && gstRule.gstRate !== undefined) {
            target.gstRate = gstRule.gstRate;
            if (gstRule.hsn && (!target.hsn || target.hsn === '8517')) {
              target.hsn = gstRule.hsn;
            }
            const qty = parseFloat(target.qty) || 0;
            const salePrice = parseFloat(target.salePriceIncGst) || 0;
            if (qty > 0 && salePrice > 0) {
              const total = Math.round(salePrice * qty * 100) / 100;
              const taxableTotal = Math.round((total / (1 + target.gstRate / 100)) * 100) / 100;
              const totalGst = Math.round((total - taxableTotal) * 100) / 100;
              const halfGst = Math.round((totalGst / 2) * 100) / 100;
              target.rate = (taxableTotal / qty).toFixed(2);
              target.taxableAmount = taxableTotal;
              target.cgstAmount = halfGst;
              target.sgstAmount = halfGst;
              target.total = total;
            }
          }
        }

        if (!target.itemNo || !target.itemNo.trim()) {
          const otherRows = prev.filter((_, i) => i !== index);
          const autoCode = generateNextItemCode ? generateNextItemCode(target.name, 'Mobile', otherRows, false) : `ITM-${100 + index + 1}`;
          target.itemNo = autoCode;
        }

        updated[index] = target;
        return updated;
      }
      return prev;
    });
  };

  // Financial Calculations with Discount
  const calculatedTotals = useMemo(() => {
    const validRows = rows.filter(r => 
      (r.itemNo || '').trim() !== '' && 
      (r.name || '').trim() !== '' && 
      Number(r.qty) >= 1 && 
      Number(r.total) > 0
    );
    const taxableTotal = validRows.reduce((sum, r) => sum + (Number(r.taxableAmount) || 0), 0);
    const cgstTotal = validRows.reduce((sum, r) => sum + (Number(r.cgstAmount) || 0), 0);
    const sgstTotal = validRows.reduce((sum, r) => sum + (Number(r.sgstAmount) || 0), 0);
    const totalGst = cgstTotal + sgstTotal;
    const subTotal = taxableTotal + totalGst;
    const discountVal = Math.max(0, Math.min(Number(discount) || 0, subTotal));
    const rawGrandTotal = Math.max(0, subTotal - discountVal);
    const roundedGrandTotal = Math.round(rawGrandTotal);
    const roundOff = Math.round((roundedGrandTotal - rawGrandTotal) * 100) / 100;

    return {
      taxableTotal: Math.round(taxableTotal * 100) / 100,
      cgstTotal: Math.round(cgstTotal * 100) / 100,
      sgstTotal: Math.round(sgstTotal * 100) / 100,
      totalGst: Math.round(totalGst * 100) / 100,
      subTotal: Math.round(subTotal * 100) / 100,
      discount: discountVal,
      roundOff,
      grandTotal: roundedGrandTotal,
      itemCount: validRows.length,
      totalQty: validRows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0)
    };
  }, [rows, discount]);

  // Validation and Preparation of Bill
  const prepareBillData = () => {
    // 1. Customer Name Check (COMPULSORY)
    if (!customerName || !customerName.trim()) {
      setNotification({
        type: 'error',
        message: 'कृपया ग्राहक का नाम (Customer Name) अनिवार्य रूप से भरें!'
      });
      setTimeout(() => setNotification(null), 4500);
      document.getElementById('customer-name-input')?.focus();
      return null;
    }
    const finalCustomerName = customerName.trim().toUpperCase().slice(0, 100);

    // 1b. Bill Date Check (COMPULSORY)
    if (!date || !date.trim()) {
      setNotification({
        type: 'error',
        message: 'कृपया बिल दिनांक (Bill Date) दर्ज करें!'
      });
      setTimeout(() => setNotification(null), 4500);
      return null;
    }

    // 2. Customer Mobile (Optional, but if entered must be valid 10-digit number)
    let cleanMobile = '';
    if (customerMobile && customerMobile.trim()) {
      const mobRes = validateMobile(customerMobile, false, 'ग्राहक का मोबाइल नंबर');
      if (!mobRes.isValid) {
        setNotification({
          type: 'error',
          message: mobRes.error
        });
        setTimeout(() => setNotification(null), 4500);
        document.getElementById('customer-mobile-input')?.focus();
        return null;
      }
      cleanMobile = mobRes.mobile || customerMobile.trim();
    }

    // 2b. Customer GSTIN (Optional, but if entered must be valid 15-char format)
    if (customerGstin && customerGstin.trim()) {
      const gstRes = validateGstin(customerGstin, false);
      if (!gstRes.isValid) {
        setNotification({
          type: 'error',
          message: `ग्राहक GSTIN त्रुटि: ${gstRes.error}`
        });
        setTimeout(() => setNotification(null), 5000);
        return null;
      }
    }

    // 3. Item Validations: Must have at least 1 active row with a name and price
    const activeRowsWithIndex = rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => isRowActive(row));

    if (activeRowsWithIndex.length === 0) {
      setNotification({
        type: 'error',
        message: 'बिल में कम से कम 1 सामान (आइटम) दर्ज करना अनिवार्य है! (आइटम कोड, विवरण और दर भरें)'
      });
      setTimeout(() => setNotification(null), 5000);
      return null;
    }

    const validRows = [];
    for (const { row, index } of activeRowsWithIndex) {
      const rowNum = index + 1;
      const r = { ...row };

      // Description / Name check
      if (!r.name || !r.name.trim()) {
        const invMatch = inventory.find(it => String(it.itemNo || '').trim().toUpperCase() === String(r.itemNo || '').trim().toUpperCase());
        if (invMatch && invMatch.name) {
          r.name = invMatch.name;
        } else {
          setNotification({
            type: 'error',
            message: `आइटम पंक्ति #${rowNum}: सामान का विवरण / नाम (Item Description) दर्ज करना अनिवार्य है!`
          });
          setTimeout(() => setNotification(null), 5000);
          return null;
        }
      }

      // Quantity check (must be >= 1)
      const qtyNum = Number(r.qty);
      if (!r.qty || isNaN(qtyNum) || qtyNum < 1) {
        r.qty = 1;
      }

      // Rate / Price check (must be > 0)
      const priceNum = Number(r.salePriceIncGst);
      const rateNum = Number(r.rate);
      if ((isNaN(priceNum) || priceNum <= 0) && (isNaN(rateNum) || rateNum <= 0)) {
        setNotification({
          type: 'error',
          message: `आइटम पंक्ति #${rowNum} (${r.name}): बिक्री दर / रेट (Rate ₹) दर्ज करना अनिवार्य है!`
        });
        setTimeout(() => setNotification(null), 5000);
        return null;
      }

      const cleanCode = String(r.itemNo || '').trim().toUpperCase();
      if (!cleanCode) {
        setNotification({
          type: 'error',
          message: `⚠️ पंक्ति #${rowNum}: आइटम कोड दर्ज करना अनिवार्य है! बिना परचेज किए गए आइटम की बिक्री नहीं की जा सकती।`
        });
        setTimeout(() => setNotification(null), 5000);
        return null;
      }

      // 1. Purchase Check: Must exist in inventory
      const invMatch = inventory.find(it => String(it.itemNo || '').trim().toUpperCase() === cleanCode);
      if (!invMatch) {
        setNotification({
          type: 'error',
          message: `⚠️ पंक्ति #${rowNum}: आइटम कोड "${cleanCode}" (${r.name || 'अज्ञात'}) परचेज लिस्ट में नहीं मिला! बिना परचेज (Purchase Entry) के कोई भी सामान सेल नहीं किया जा सकता। कृपया पहले परचेज दर्ज करें।`
        });
        setTimeout(() => setNotification(null), 6000);
        return null;
      }

      // 2. Stock Quantity Check: Must have available stock > 0
      let origQty = 0;
      if (editingBill && editingBill.items) {
        const orig = editingBill.items.find(it => String(it.itemNo || '').trim().toUpperCase() === cleanCode);
        if (orig) origQty = Number(orig.qty) || 0;
      }
      const availableStock = getAvailableStockForItem(invMatch, index, rows) + origQty;

      if (availableStock <= 0) {
        setNotification({
          type: 'error',
          message: `⚠️ पंक्ति #${rowNum}: आइटम "${invMatch.name}" (${invMatch.itemNo}) का स्टॉक समाप्त है (उपलब्ध: 0)! कृपया पहले इसे परचेज करें।`
        });
        setTimeout(() => setNotification(null), 6000);
        return null;
      }

      if (Number(r.qty) > availableStock) {
        setNotification({
          type: 'error',
          message: `⚠️ पंक्ति #${rowNum}: आइटम "${invMatch.name}" का उपलब्ध स्टॉक केवल ${availableStock} है! आप ${r.qty} मात्रा नहीं बेच सकते।`
        });
        setTimeout(() => setNotification(null), 6000);
        return null;
      }

      // Auto-assign Serial No / Key if present in inventory
      if (!r.serialNo || !r.serialNo.trim()) {
        r.serialNo = getAutoSerialsForItem(invMatch, 1, rows, index) || '';
      }

      // Enforce 1:1 rule: if item has a serial key, its quantity is strictly 1
      if (r.serialNo && r.serialNo.trim()) {
        r.qty = 1;
      }

      validRows.push(r);
    }

    // 4a. Duplicate Item Code Validation
    const seenItemCodes = new Set();
    for (let r = 0; r < validRows.length; r++) {
      const code = String(validRows[r].itemNo || '').trim().toUpperCase();
      if (code) {
        if (seenItemCodes.has(code)) {
          setNotification({
            type: 'error',
            message: `डुप्लीकेट आइटम कोड "${code}" बिल में दोबारा दर्ज है! कृपया एक ही पंक्ति में मात्रा (Qty) बढ़ाएं।`
          });
          setTimeout(() => setNotification(null), 5000);
          return null;
        }
        seenItemCodes.add(code);
      }
    }

    // 4b. Duplicate Serial Number and Already Sold Validation
    const seenSerials = new Set();
    for (let r = 0; r < validRows.length; r++) {
      const it = validRows[r];
      const serials = parseSerials(it.serialNo);
      for (const s of serials) {
        if (seenSerials.has(s)) {
          setNotification({
            type: 'error',
            message: `डुप्लीकेट सीरियल/IMEI: "${s}" इस बिल में दो अलग पंक्तियों में दर्ज है!`
          });
          setTimeout(() => setNotification(null), 5000);
          return null;
        }
        seenSerials.add(s);

        const soldInfo = isSerialSold(s, editingBill?.id);
        if (soldInfo) {
          setNotification({
            type: 'error',
            message: `सीरियल/की "${s}" पहले ही बिल #${soldInfo.billNo} (${soldInfo.customerName}) में बेचा जा चुका है! एक बार बिका हुआ आइटम दोबारा नहीं बेचा जा सकता।`
          });
          setTimeout(() => setNotification(null), 5000);
          return null;
        }
      }
    }

    // 4c. Stock Quantity Validation
    for (let r = 0; r < validRows.length; r++) {
      const it = validRows[r];
      const invMatch = inventory.find(i => String(i.itemNo || '').trim().toUpperCase() === String(it.itemNo || '').trim().toUpperCase());
      if (invMatch) {
        const available = Number(invMatch.stockQty) || 0;
        const requestedQty = Number(it.qty) || 1;
        if (available < requestedQty && !editingBill) {
          setNotification({
            type: 'error',
            message: `आइटम "${it.itemNo}" (${it.name}) की मात्रा (${requestedQty}) उपलब्ध स्टॉक (${available}) से अधिक है!`
          });
          setTimeout(() => setNotification(null), 5000);
          return null;
        }
      }
    }

    return {
      ...(editingBill ? { id: editingBill.id } : {}),
      billNo: editingBill ? editingBill.billNo : generateNextBillNo(),
      date,
      customerName: finalCustomerName,
      customerMobile: cleanMobile,
      customerGstin: customerGstin.trim().toUpperCase(),
      customerAddress: customerAddress.trim(),
      paymentMode,
      theme: settings.selectedTheme || 'classic',
      items: validRows.map(it => ({
        ...it,
        serialNo: it.serialNo ? parseSerials(it.serialNo).join(', ') : ''
      })),
      subTotal: calculatedTotals.subTotal,
      discount: calculatedTotals.discount,
      taxableTotal: calculatedTotals.taxableTotal,
      cgstTotal: calculatedTotals.cgstTotal,
      sgstTotal: calculatedTotals.sgstTotal,
      igstTotal: 0,
      totalGst: calculatedTotals.totalGst,
      roundOff: calculatedTotals.roundOff,
      grandTotal: calculatedTotals.grandTotal
    };
  };

  // Trigger Confirmation Modal for Save Bill
  const handleSave = () => {
    const billData = prepareBillData();
    if (!billData) return;
    setPendingBillData(billData);
    setShouldPrintAfterSave(false);
    setShowConfirmModal(true);
  };

  // Trigger Confirmation Modal for Save and Print
  const handleSaveAndPrint = () => {
    const billData = prepareBillData();
    if (!billData) return;
    setPendingBillData(billData);
    setShouldPrintAfterSave(true);
    setShowConfirmModal(true);
  };

  // Final Confirmed Execution
  const confirmAndExecuteSave = () => {
    if (!pendingBillData) return;
    try {
      const saved = saveSaleBill(pendingBillData);
      setShowConfirmModal(false);
      const isPrinted = shouldPrintAfterSave;
      setPendingBillData(null);

      if (isPrinted) {
        triggerPrint(saved);
        setNotification({
          type: 'success',
          message: `जीएसटी बिल #${saved.billNo} सफलतापूर्वक जनरेट हो गया! (कुल राशि: ₹${saved.grandTotal}) प्रिंट विंडो खुल रही है...`
        });
      } else {
        setNotification({
          type: 'success',
          message: `जीएसटी बिल #${saved.billNo} सफलतापूर्वक जनरेट हो गया! (कुल राशि: ₹${saved.grandTotal})`
        });
      }
      setTimeout(() => setNotification(null), 5000);
      resetForm();
    } catch (err) {
      console.error('Save bill error:', err);
      setShowConfirmModal(false);
      setNotification({
        type: 'error',
        message: `बिल सेव करने में त्रुटि: ${err?.message || 'अज्ञात त्रुटि'}`
      });
      setTimeout(() => setNotification(null), 6000);
    }
  };

  // Live preview bill
  const previewBill = useMemo(() => {
    const validRows = rows.filter(r => r.name.trim() !== '');
    return {
      billNo: billNo || generateNextBillNo(),
      date: date || new Date().toISOString().split('T')[0],
      customerName: customerName || 'ग्राहक का नाम',
      customerMobile,
      customerGstin,
      customerAddress,
      paymentMode,
      theme: settings.selectedTheme || 'classic',
      items: validRows,
      subTotal: calculatedTotals.subTotal,
      discount: calculatedTotals.discount,
      taxableTotal: calculatedTotals.taxableTotal,
      cgstTotal: calculatedTotals.cgstTotal,
      sgstTotal: calculatedTotals.sgstTotal,
      igstTotal: 0,
      totalGst: calculatedTotals.totalGst,
      roundOff: calculatedTotals.roundOff,
      grandTotal: calculatedTotals.grandTotal
    };
  }, [billNo, date, customerName, customerMobile, customerGstin, customerAddress, paymentMode, settings.selectedTheme, rows, calculatedTotals]);

  // Get active theme name in Hindi
  const activeThemeLabel = useMemo(() => {
    const map = {
      classic: 'Theme 1: Classic Tax Invoice (मानक सरकारी)',
      modern: 'Theme 2: Modern Corporate (टेक-ब्लू)',
      compact: 'Theme 3: Compact Retail (सिंगल पेज)',
      royal: 'Theme 4: Royal Showroom (प्रीमियम पर्पल)',
      emerald: 'Theme 5: Emerald Business (एमराल्ड ग्रीन)',
      minimal: 'Theme 6: Minimalist Monochrome (इंक सेवर B&W)',
      crimson: 'Theme 7: Ruby Crimson Elite (रूबी लक्जरी)',
      ocean: 'Theme 8: Ocean Tech Navy (टेक नेवी)',
      amber: 'Theme 9: Golden Amber Luxury (गोल्डन एम्बर)',
      slate: 'Theme 10: Titanium Slate Precision (टाइटैनियम स्लेट)'
    };
    return map[settings.selectedTheme] || 'Theme 1: Classic Tax Invoice';
  }, [settings.selectedTheme]);

  return (
    <div className="space-y-6">
      {/* 1. Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 shadow-md animate-in slide-in-from-top duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-500 text-white'
              : notification.type === 'warning'
              ? 'bg-amber-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      {/* 2. Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-xs border border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wide">
              GST Sale Billing
            </span>
            <h2 className="text-xl font-black text-slate-900">
              {editingBill ? `बिल एडिट मोड: ${editingBill.billNo}` : 'नया जीएसटी सेल बिल बनाएं'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
            <span>ऑटो इनवॉइस सं. • 10-रो फिक्स टेबल • ग्राहक नाम व 10-अंक मोबाइल अनिवार्य</span>
            <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
              🎨 डिफ़ॉल्ट प्रिंट थीम: {activeThemeLabel}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              showPreview
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showPreview ? 'प्रीव्यू छिपाएं' : 'लाइव प्रीव्यू देखें'}</span>
          </button>

          {editingBill && (
            <button
              type="button"
              onClick={cancelEditingBill}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              एडिट रद्द करें
            </button>
          )}

          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>रीसेट</span>
          </button>
        </div>
      </div>

      {/* 3. Customer & Bill Info Card */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bill No: NON-EDITABLE AUTO GENERATED */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                <span>इनवॉइस नंबर (Invoice No)</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> ऑटो (Non-Editable)
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={billNo}
                readOnly
                title="इनवॉइस नंबर सॉफ्टवेयर द्वारा स्वतः क्रम से उत्पन्न होता है और इसे बदला नहीं जा सकता।"
                className="w-full px-3 py-2 bg-slate-100 text-xs font-mono font-black text-indigo-900 border border-slate-300 rounded-lg outline-hidden cursor-not-allowed select-none shadow-inner"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">प्रत्येक बिल के बाद स्वतः अगला नंबर सेट होगा</p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>बिल दिनांक</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Customer Name: COMPULSORY, MAX 100 CHARS, CAPITAL LETTERS */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>ग्राहक का नाम (Customer Name)</span>
                <span className="text-red-500 font-black">*</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {customerName.length}/100 [CAPITAL]
              </span>
            </label>
            <input
              id="customer-name-input"
              type="text"
              maxLength={100}
              value={customerName}
              onChange={handleCustomerNameChange}
              onPaste={handleCustomerNamePaste}
              placeholder="ग्राहक का नाम (CAPITAL अक्षरों में)"
              className="w-full px-3 py-2 text-xs font-bold uppercase text-slate-900 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              required
            />
            <p className="text-[10px] text-slate-400 mt-0.5">अनिवार्य • अधिकतम 100 अक्षर (स्वतः CAPITAL)</p>
          </div>

          {/* Customer Mobile: COMPULSORY, EXACTLY 10 DIGITS, ONLY NUMERIC */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>मोबाइल नंबर (10 अंक)</span>
                <span className="text-red-500 font-black">*</span>
              </span>
              <span className={`text-[10px] font-bold ${customerMobile.length === 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {customerMobile.length}/10 अंक
              </span>
            </label>
            <input
              id="customer-mobile-input"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={customerMobile}
              onKeyDown={(e) => {
                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                  e.preventDefault();
                }
              }}
              onChange={handleCustomerMobileChange}
              onPaste={handleCustomerMobilePaste}
              placeholder="10 अंकों का मोबाइल नंबर"
              className={`w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 border rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white ${
                customerMobile.length === 10
                  ? 'border-emerald-400 ring-1 ring-emerald-300'
                  : 'border-slate-300'
              }`}
              required
            />
            <p className="text-[10px] text-slate-400 mt-0.5">अनिवार्य • केवल 10 अंक मान्य (टेक्स्ट व अक्षर वर्जित)</p>
          </div>

          {/* Customer Address: DEFAULTS TO SELLER SETTING */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>ग्राहक का पता (Customer Address)</span>
              </span>
              <span className="text-[10px] text-slate-400">डिफ़ॉल्ट पता</span>
            </label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="दुकानदार का स्थानीय पता"
              className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Customer GSTIN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ग्राहक GSTIN (यदि लागू हो)
            </label>
            <input
              type="text"
              maxLength={15}
              value={customerGstin}
              onChange={(e) => setCustomerGstin(formatGstinInput(e.target.value))}
              placeholder="08AAAAA0000A1Z5"
              className="w-full px-3 py-2 text-xs font-mono font-medium text-slate-900 border border-slate-300 rounded-lg uppercase outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span>भुगतान माध्यम (Payment Mode)</span>
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Cash / नकदी">नकदी (Cash)</option>
              <option value="UPI / PhonePe / Paytm">UPI / PhonePe / GPay</option>
              <option value="Credit Card / Debit Card">कार्ड (Credit / Debit Card)</option>
              <option value="Bank Transfer (NEFT/RTGS)">बैंक ट्रांसफर (Bank Transfer)</option>
              <option value="उधार (Credit / Khata)">उधार (Credit / Khata)</option>
            </select>
          </div>

          {/* Theme Display Notice (Theme dropdown removed as requested, auto uses seller default) */}
          <div className="flex flex-col justify-end">
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs">
              <span className="text-[10px] text-slate-500 font-bold block mb-0.5">लागू प्रिंट थीम (सेटिंग्स से स्वतः)</span>
              <span className="font-bold text-indigo-900 block truncate">{activeThemeLabel}</span>
              <span className="text-[10px] text-slate-400">थीम बदलने हेतु 'थीम व सेटिंग्स' टैब में जाएं</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FIXED 10-ITEM BILLING TABLE */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden" ref={tableContainerRef}>
        <div className="px-4 py-3 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
              10 ROWS TABLE
            </span>
            <h3 className="font-bold text-sm">बिल आइटम तालिका (आइटम नंबर से खोजें व ऑटो-फिल)</h3>
          </div>
          <span className="text-xs text-slate-300">
            कम से कम 1 आइटम जोड़ना अनिवार्य है (कोड, विवरण, मात्रा, दर <span className="text-rose-400 font-bold">*</span>) • उपलब्ध GST दरें: <code className="text-amber-300 font-mono">{gstSlabs.map(s => `${s}%`).join(', ')}</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase border-b border-slate-200 text-center">
                <th className="py-2.5 px-2 w-10">क्र.</th>
                <th className="py-2.5 px-2 text-left w-36">
                  आइटम कोड <span className="text-rose-600 font-bold">*</span>
                </th>
                <th className="py-2.5 px-3 text-left">
                  सामान / विवरण (Auto Fill पुष्टि)
                </th>
                <th className="py-2.5 px-2 w-48 text-left">सीरियल / IMEI (Auto Fill)</th>
                <th className="py-2.5 px-2 w-16">HSN</th>
                <th className="py-2.5 px-2 w-16">
                  मात्रा <span className="text-rose-600 font-bold">*</span>
                </th>
                <th className="py-2.5 px-2 w-24 text-right">
                  बिक्री दर (₹) <span className="text-rose-600 font-bold">*</span>
                </th>
                <th className="py-2.5 px-2 w-20">GST %</th>
                <th className="py-2.5 px-2 w-24 text-right">टैक्सेबल (₹)</th>
                <th className="py-2.5 px-3 w-28 text-right">कुल राशि (₹)</th>
                <th className="py-2.5 px-2 w-12 text-center">हटाएं</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rows.map((row, index) => {
                const invItem = inventory.find(
                  i => row.itemNo && i.itemNo.toUpperCase() === row.itemNo.toUpperCase()
                );
                const isOutOfStock = invItem ? invItem.stockQty <= 0 : false;
                const isNotFound = row.itemNo.trim() !== '' && !invItem;

                const active = isRowActive(row);
                const isMissingCode = active && !row.itemNo.trim();
                const isMissingName = active && !row.name.trim();
                const isMissingQty = active && (!row.qty || Number(row.qty) < 1);
                const isMissingRate = active && ((!row.salePriceIncGst && !row.rate) || (Number(row.salePriceIncGst) <= 0 && Number(row.rate) <= 0));

                // Live Serial Validation Check
                const rowSerials = parseSerials(row.serialNo);
                let hasRowSerialError = null;
                for (const s of rowSerials) {
                  const countInBill = rows.filter((r, rIdx) => rIdx !== index && parseSerials(r.serialNo).includes(s.toUpperCase())).length;
                  if (countInBill > 0) {
                    hasRowSerialError = `डुप्लीकेट: "${s}" इस बिल में दोबारा दर्ज है!`;
                    break;
                  }
                  const soldInfo = isSerialSold(s, editingBill?.id);
                  if (soldInfo) {
                    hasRowSerialError = `पूर्व में बिका हुआ: बिल #${soldInfo.billNo} (${soldInfo.customerName})`;
                    break;
                  }
                }

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      hasRowSerialError ? 'bg-rose-50/40' : (isMissingCode || isMissingName || isMissingQty || isMissingRate) ? 'bg-amber-50/20' : row.name ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/30'
                    }`}
                  >
                    {/* Row Index */}
                    <td className="py-2 px-2 text-center font-bold text-slate-500">
                      {index + 1}
                    </td>

                    {/* Item Number input with Auto-Suggest */}
                    <td className="py-2 px-2 relative">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={row.itemNo}
                          onChange={(e) => handleItemNoChange(index, e.target.value)}
                          onFocus={() => setActiveSuggestionRow(index)}
                          onBlur={() => handleItemNoBlur(index)}
                          placeholder="कोड *"
                          className={`w-full px-2 py-1.5 font-mono text-xs font-bold uppercase border rounded focus:ring-2 focus:ring-indigo-500 outline-hidden ${
                            isMissingCode ? 'border-rose-400 bg-rose-50/50 text-rose-900 ring-1 ring-rose-300' : 'border-slate-300 bg-white'
                          }`}
                        />
                      </div>

                      {/* Live Stock or Missing Stock Badge */}
                      <div className="mt-1 flex items-center justify-between">
                        {invItem && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              invItem.stockQty > 5
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : invItem.stockQty > 0
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            स्टॉक: {invItem.stockQty} {invItem.unit || 'PCS'}
                          </span>
                        )}

                        {/* Quick Purchase Trigger if not found or out of stock */}
                        {(isNotFound || isOutOfStock) && (
                          <button
                            type="button"
                            onClick={() => triggerQuickPurchase(index, row.itemNo)}
                            className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 cursor-pointer shadow-2xs"
                            title="क्विक परचेस: तुरंत खरीद व स्टॉक दर्ज करें"
                          >
                            <PackagePlus className="w-3 h-3" />
                            <span>+ स्टॉक जोड़ें</span>
                          </button>
                        )}
                      </div>

                      {/* Autocomplete Suggestion Dropdown (With Out of Stock Warning on Click) */}
                      {activeSuggestionRow === index && (
                        <div className="absolute left-0 top-full mt-1 z-30 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-1 max-h-56 overflow-y-auto">
                          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 flex justify-between bg-slate-50">
                            <span>उपलब्ध सामान लिस्ट (स्टॉक स्थिति सहित)</span>
                            <button
                              type="button"
                              onClick={() => setActiveSuggestionRow(null)}
                              className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                          {inventory
                            .filter(item => {
                              if (!row.itemNo) return true;
                              const q = row.itemNo.toLowerCase().trim();
                              return item.itemNo.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
                            })
                            .slice(0, 15)
                            .map((item) => {
                              const avail = getAvailableStockForItem(item, index, rows);
                              const isOutOfStock = avail <= 0;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    if (isOutOfStock) {
                                      setNotification({
                                        type: 'error',
                                        message: `⚠️ आइटम "${item.name}" (कोड: ${item.itemNo}) स्टॉक में उपलब्ध नहीं है (उपलब्ध: 0)! कृपया पहले सप्लायर से परचेज (Purchase Entry) दर्ज करें।`
                                      });
                                      setTimeout(() => setNotification(null), 6000);
                                      setActiveSuggestionRow(null);
                                      return;
                                    }
                                    selectInventoryItem(index, item);
                                    setActiveSuggestionRow(null);
                                  }}
                                  className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs border-b border-slate-50 last:border-0 cursor-pointer ${
                                    isOutOfStock 
                                      ? 'bg-rose-50/50 hover:bg-rose-100/70 text-slate-600' 
                                      : 'hover:bg-indigo-50 text-slate-800'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`font-mono font-bold ${isOutOfStock ? 'text-rose-700' : 'text-indigo-700'}`}>
                                        {item.itemNo}
                                      </span>
                                      {isOutOfStock && (
                                        <span className="text-[9px] bg-rose-100 text-rose-800 font-extrabold px-1.5 py-0.2 rounded border border-rose-200">
                                          आउट ऑफ स्टॉक (0)
                                        </span>
                                      )}
                                    </div>
                                    <span className={`text-xs font-medium block truncate max-w-[170px] ${isOutOfStock ? 'text-slate-500' : 'text-slate-800'}`}>
                                      {item.name}
                                    </span>
                                  </div>
                                  <div className="text-right shrink-0 ml-2">
                                    <div className="font-mono font-bold text-slate-900">₹{item.salePrice}</div>
                                    <span className={`text-[10px] font-bold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                                      {isOutOfStock ? 'स्टॉक: 0' : `उपलब्ध: ${avail}`}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          {inventory.filter(item => (!row.itemNo || item.itemNo.toLowerCase().includes(row.itemNo.toLowerCase()) || item.name.toLowerCase().includes(row.itemNo.toLowerCase()))).length === 0 && (
                            <div className="p-3 text-center text-xs text-slate-400">
                              कोई सामान नहीं मिला
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Item Name / Description (Disabled / Read-only for Confirmation) */}
                    <td className="py-2 px-3 relative">
                      <input
                        type="text"
                        readOnly
                        disabled
                        tabIndex={-1}
                        value={row.name || ''}
                        placeholder="कोड डालते ही नाम स्वतः आएगा (Auto)"
                        title="पुष्टि: सामान का विवरण आइटम कोड के अनुसार स्वतः भरता है (Disabled)"
                        className="w-full px-2 py-1.5 text-xs font-semibold border border-slate-300 rounded bg-slate-100 text-slate-800 cursor-not-allowed outline-hidden select-none"
                      />
                    </td>

                    {/* DEDICATED SERIAL / IMEI / KEY COLUMN (Disabled / Read-only for Confirmation) */}
                    <td className="py-2 px-2 relative">
                      <div>
                        <input
                          type="text"
                          readOnly
                          disabled
                          tabIndex={-1}
                          value={row.serialNo || ''}
                          placeholder="सीरियल की स्वतः आएगी (Auto)"
                          title="पुष्टि: सीरियल / IMEI की आइटम कोड के अनुसार स्वतः भरती है (Disabled)"
                          className={`w-full px-2 py-1.5 font-mono text-xs uppercase border rounded outline-hidden select-none cursor-not-allowed ${
                            hasRowSerialError ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold' : 'border-slate-300 bg-slate-100 text-slate-800'
                          }`}
                        />
                        {/* Live Error warning badge */}
                        {hasRowSerialError && (
                          <div className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5 mt-0.5 leading-tight">
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{hasRowSerialError}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* HSN */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={row.hsn}
                        onChange={(e) => handleCellChange(index, 'hsn', e.target.value)}
                        placeholder="8517"
                        className="w-full px-1.5 py-1.5 text-center font-mono text-xs border border-slate-300 rounded outline-hidden bg-white"
                      />
                    </td>

                    {/* Qty (Locked to 1 if serialized item) */}
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="1"
                        readOnly={Boolean(row.serialNo && row.serialNo.trim())}
                        disabled={Boolean(row.serialNo && row.serialNo.trim())}
                        value={row.serialNo && row.serialNo.trim() ? 1 : row.qty}
                        onChange={(e) => handleCellChange(index, 'qty', e.target.value)}
                        placeholder="1 *"
                        title={row.serialNo && row.serialNo.trim() ? 'सीरियल वाले सामान का 1 कोड = 1 पीस (मात्रा 1 फिक्स)' : 'मात्रा दर्ज करें'}
                        className={`w-full px-1.5 py-1.5 text-center font-mono font-bold text-xs border rounded outline-hidden ${
                          row.serialNo && row.serialNo.trim()
                            ? 'bg-slate-100 text-slate-700 border-slate-300 cursor-not-allowed select-none'
                            : isMissingQty ? 'border-rose-400 bg-rose-50/50 text-rose-900 ring-1 ring-rose-300' : 'border-slate-300 bg-white'
                        }`}
                      />
                    </td>

                    {/* Sale Price Inclusive of GST */}
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.salePriceIncGst}
                        onChange={(e) => handleCellChange(index, 'salePriceIncGst', e.target.value)}
                        placeholder="0.00 *"
                        className={`w-full px-2 py-1.5 text-right font-mono font-bold text-xs border rounded focus:ring-2 focus:ring-indigo-500 outline-hidden text-emerald-900 ${
                          isMissingRate ? 'border-rose-400 bg-rose-50/50 text-rose-900 ring-1 ring-rose-300' : 'border-slate-300 bg-white'
                        }`}
                      />
                    </td>

                    {/* GST Slab Selector */}
                    <td className="py-2 px-2">
                      <select
                        value={row.gstRate}
                        onChange={(e) => handleCellChange(index, 'gstRate', Number(e.target.value))}
                        className="w-full px-1 py-1.5 text-center font-bold text-xs border border-slate-300 rounded outline-hidden bg-white"
                      >
                        {gstSlabs.map(slab => (
                          <option key={slab} value={slab}>{slab}%</option>
                        ))}
                      </select>
                    </td>

                    {/* Taxable Amount */}
                    <td className="py-2 px-2 text-right font-mono text-xs text-slate-600 bg-slate-50/50">
                      ₹{Number(row.taxableAmount || 0).toFixed(2)}
                    </td>

                    {/* Total */}
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                      ₹{Number(row.total || 0).toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-2 text-center">
                      {row.name && (
                        <button
                          type="button"
                          onClick={() => clearRow(index)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                          title="रो खाली करें"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer */}
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-xs">
                <td colSpan={5} className="py-2.5 px-3 text-right text-slate-600">
                  कुल आइटम: <span className="text-slate-900">{calculatedTotals.itemCount}</span> (कुल मात्रा: <span className="text-slate-900">{calculatedTotals.totalQty}</span>)
                </td>
                <td colSpan={3} className="py-2.5 px-2 text-right text-slate-700">
                  टैक्सेबल: ₹{calculatedTotals.taxableTotal.toFixed(2)} | GST: ₹{calculatedTotals.totalGst.toFixed(2)}
                </td>
                <td colSpan={2} className="py-2.5 px-3 text-right font-mono font-black text-indigo-900 text-base">
                  ₹{calculatedTotals.grandTotal.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5. Financial Summary & Actions Card */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Summary highlights with Discount */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 w-full lg:w-auto">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">उप-कुल (Sub Total)</span>
              <span className="text-sm font-mono font-bold text-slate-800">
                ₹{calculatedTotals.subTotal.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                (टैक्सेबल: ₹{calculatedTotals.taxableTotal.toFixed(2)})
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">कुल जीएसटी (GST)</span>
              <span className="text-sm font-mono font-bold text-slate-800">
                ₹{calculatedTotals.totalGst.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                (C: ₹{calculatedTotals.cgstTotal.toFixed(1)} | S: ₹{calculatedTotals.sgstTotal.toFixed(1)})
              </span>
            </div>

            {/* Discount Input Field */}
            <div className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-300">
              <label className="text-[10px] text-amber-900 font-black block mb-0.5 flex items-center justify-between">
                <span>विशेष छूट (Discount ₹)</span>
                {calculatedTotals.discount > 0 && (
                  <span className="text-[9px] text-emerald-700 font-bold">लागू ✓</span>
                )}
              </label>
              <div className="relative mt-1">
                <span className="absolute left-2 top-1 text-xs font-bold text-amber-700">₹</span>
                <input
                  type="number"
                  min="0"
                  max={calculatedTotals.subTotal}
                  step="any"
                  value={discount === 0 ? '' : discount}
                  onKeyDown={(e) => {
                    if (!/[0-9.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9.]/g, '');
                    setDiscount(clean === '' ? 0 : parseFloat(clean) || 0);
                  }}
                  placeholder="0.00"
                  className="w-full pl-5 pr-2 py-0.5 text-xs font-mono font-black text-amber-950 border border-amber-400 rounded bg-white outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <span className="text-[9px] text-amber-700 block mt-0.5">बिल पर सीधे प्रिंट होगी</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">राउंड ऑफ (Round Off)</span>
              <span className="text-sm font-mono font-bold text-slate-700">
                {calculatedTotals.roundOff >= 0 ? `+₹${calculatedTotals.roundOff.toFixed(2)}` : `-₹${Math.abs(calculatedTotals.roundOff).toFixed(2)}`}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">स्वतः निकटतम पूर्णांक</span>
            </div>

            <div className="bg-indigo-50 p-2.5 rounded-lg border-2 border-indigo-300 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-indigo-700 font-black block">कुल देय (Grand Total)</span>
              <span className="text-base font-mono font-black text-indigo-950">
                ₹{calculatedTotals.grandTotal.toLocaleString('en-IN')}
              </span>
              {calculatedTotals.discount > 0 && (
                <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                  (₹{calculatedTotals.discount.toFixed(2)} छूट के बाद)
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {notification && (
              <div
                className={`w-full p-2.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all shadow-xs ${
                  notification.type === 'success'
                    ? 'bg-emerald-600 text-white'
                    : notification.type === 'warning'
                    ? 'bg-amber-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {notification.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-indigo-700 border-2 border-indigo-600 text-sm font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{editingBill ? 'अपडेट करें (Update)' : 'बिल सेव करें (Save Bill)'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndPrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>सेव एवं प्रिंट करें (Save & Print)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Live Bill Preview Section */}
      {showPreview && (
        <div className="bg-slate-100 p-4 sm:p-6 rounded-2xl border-2 border-dashed border-indigo-300 shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-base text-slate-900">
                लाइव बिल प्रीव्यू (डिफ़ॉल्ट प्रिंट थीम: <span className="capitalize text-indigo-700 font-mono">{settings.selectedTheme || 'classic'}</span>)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => triggerPrint(previewBill)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट प्रीव्यू (Print)</span>
            </button>
          </div>

          <div className="bg-white p-2 rounded-xl shadow-lg">
            <PrintableBill bill={previewBill} settings={settings} />
          </div>
        </div>
      )}

      {/* 7. Modal: Bill Generation Confirmation */}
      {showConfirmModal && pendingBillData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-200" />
                <h3 className="font-extrabold text-base">बिल जनरेशन की पुष्टि (Confirm Bill)</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingBillData(null);
                }}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm font-semibold text-slate-800">
                क्या आप वाकई यह बिल सुरक्षित {shouldPrintAfterSave ? 'एवं प्रिंट' : ''} करना चाहते हैं?
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">बिल नंबर (Invoice No):</span>
                  <span className="font-mono font-black text-indigo-700">{pendingBillData.billNo}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">दिनांक (Date):</span>
                  <span className="font-mono text-slate-800">{pendingBillData.date}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">ग्राहक (Customer):</span>
                  <span className="font-bold text-slate-900">{pendingBillData.customerName}</span>
                </div>
                {pendingBillData.customerMobile && (
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                    <span className="text-slate-500 font-bold">मोबाइल नं.:</span>
                    <span className="font-mono text-slate-800">{pendingBillData.customerMobile}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">कुल सामान (Items Count):</span>
                  <span className="font-bold text-slate-800">{pendingBillData.items.length} आइटम्स</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-sm font-black">
                  <span className="text-indigo-900">कुल देय राशि (Grand Total):</span>
                  <span className="font-mono text-emerald-700 text-base">₹{Number(pendingBillData.grandTotal || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>बिल बनते ही स्टॉक से सामान स्वतः घट जाएगा और सीरियल नंबर सोल्ड मार्क हो जाएगा।</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingBillData(null);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={confirmAndExecuteSave}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>हाँ, बिल बनाएं (Yes, Generate)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Quick Purchase Modal */}
      <QuickPurchaseModal
        isOpen={quickPurchaseRowIndex !== null}
        onClose={() => setQuickPurchaseRowIndex(null)}
        initialItemNo={quickPurchaseItemNo}
        onStockAdded={handleStockAdded}
      />
    </div>
  );
}
