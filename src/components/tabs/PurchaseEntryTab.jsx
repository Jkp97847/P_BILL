import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useBilling, parseSerials } from '../../context/BillingContext';
import { 
  PackagePlus, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Hash,
  Calendar,
  Building,
  Phone,
  Layers,
  Search,
  Check,
  X,
  Smartphone,
  AlertTriangle,
  Lock,
  ShieldCheck,
  Printer,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import {
  formatMobileInput,
  validateMobile,
  formatGstinInput,
  validateGstin
} from '../../utils/validation';

const createEmptyPurchaseRow = () => ({
  id: `pur-row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  itemNo: '',
  serialNo: '', // Serial Number / IMEI / Key
  name: '',
  category: 'Mobile',
  hsn: '8517',
  costPrice: '',
  salePrice: '',
  gstRate: 18,
  qty: 1,
  total: 0
});

export default function PurchaseEntryTab() {
  const {
    settings,
    inventory,
    savePurchase,
    generateNextPurchaseNo,
    generateNextItemCode,
    editingPurchase,
    cancelEditingPurchase,
    setActiveTab,
    uniqueSuppliers,
    validateSerial,
    isSerialPurchased
  } = useBilling();

  // Helper to build a new empty row with Category and pre-filled Item Code
  const buildEmptyRow = (cat = 'Mobile', currentRows = []) => ({
    id: `pur-row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    category: cat,
    itemNo: generateNextItemCode('', cat, currentRows, true),
    name: '', // Model No / Name (Compulsory)
    serialNo: '', // Serial Number / IMEI / Key
    hsn: cat === 'Battery' ? '8506' : cat === 'Earphone' ? '8518' : cat === 'Charger' ? '8504' : cat === 'Accessories' ? '3926' : '8517',
    costPrice: '',
    salePrice: '',
    gstRate: 18,
    qty: 1,
    total: 0
  });

  const [purchaseNo, setPurchaseNo] = useState('');
  const [date, setDate] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierMobile, setSupplierMobile] = useState('');
  const [supplierGstin, setSupplierGstin] = useState('');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState([]);
  const [notification, setNotification] = useState(null);

  // Supplier Autocomplete dropdown state
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierDropdownRef = useRef(null);

  // Item Autocomplete dropdown state
  const [activeItemSuggestionRow, setActiveItemSuggestionRow] = useState(null);
  const itemDropdownRef = useRef(null);

  // Verification Modal & Post-Save Summary Modal states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [savedPurchaseDetails, setSavedPurchaseDetails] = useState(null);

  // Multi-serial entry modal state
  const [multiSerialModalRowIndex, setMultiSerialModalRowIndex] = useState(null);
  const [multiSerialInputText, setMultiSerialInputText] = useState('');

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(e.target)) {
        setShowSupplierDropdown(false);
      }
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(e.target)) {
        setActiveItemSuggestionRow(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filtered suppliers based on user typing
  const filteredSuppliers = useMemo(() => {
    const q = (supplierName || '').toLowerCase().trim();
    if (!q) return uniqueSuppliers;
    return uniqueSuppliers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.mobile && s.mobile.includes(q)) ||
      (s.gstin && s.gstin.toLowerCase().includes(q))
    );
  }, [uniqueSuppliers, supplierName]);

  const selectSupplier = (supplier) => {
    setSupplierName(supplier.name);
    if (supplier.mobile) setSupplierMobile(supplier.mobile.replace(/\D/g, '').slice(0, 10));
    if (supplier.gstin) setSupplierGstin(supplier.gstin);
    setShowSupplierDropdown(false);
  };

  const handleSupplierMobileChange = (val) => {
    setSupplierMobile(formatMobileInput(val));
  };

  const handleSupplierMobilePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text') || '';
    setSupplierMobile(formatMobileInput(paste));
  };

  // Filter inventory items for suggestion dropdown
  const filteredInventoryForSearch = (query) => {
    const q = (query || '').toLowerCase().trim();
    if (!q) return inventory.slice(0, 15);
    return inventory.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.itemNo && i.itemNo.toLowerCase().includes(q)) ||
      (i.category && i.category.toLowerCase().includes(q))
    ).slice(0, 15);
  };

  useEffect(() => {
    if (editingPurchase) {
      setPurchaseNo(editingPurchase.purchaseNo);
      setDate(editingPurchase.date || new Date().toISOString().split('T')[0]);
      setSupplierName(editingPurchase.supplierName || '');
      setSupplierMobile(editingPurchase.supplierMobile ? editingPurchase.supplierMobile.replace(/\D/g, '').slice(0, 10) : '');
      setSupplierGstin(editingPurchase.supplierGstin || '');
      setSupplierInvoiceNo(editingPurchase.supplierInvoiceNo || '');
      setDiscount(editingPurchase.discount || 0);
      setItems(
        editingPurchase.items && editingPurchase.items.length > 0
          ? editingPurchase.items.map(it => ({
              ...it,
              id: `pur-row-${Math.random()}`,
              category: it.category || 'Mobile',
              serialNo: it.serialNo || ''
            }))
          : [buildEmptyRow('Mobile', [])]
      );
    } else {
      resetForm();
    }
  }, [editingPurchase]);

  const resetForm = () => {
    setPurchaseNo(generateNextPurchaseNo());
    setDate(new Date().toISOString().split('T')[0]);
    setSupplierName('');
    setSupplierMobile('');
    setSupplierGstin('');
    setSupplierInvoiceNo('');
    setDiscount(0);
    setItems([buildEmptyRow('Mobile', [])]);
    setShowSupplierDropdown(false);
    setActiveItemSuggestionRow(null);
  };

  // When an existing item is selected from suggestion dropdown
  const handleSelectExistingItem = (index, invItem) => {
    setItems(prev => {
      const updated = [...prev];
      const otherRows = updated.filter((_, i) => i !== index);
      const chosenCat = invItem.category || updated[index].category || 'Mobile';
      const autoCode = generateNextItemCode(invItem.name, chosenCat, otherRows, true);

      const target = {
        ...updated[index],
        category: chosenCat,
        itemNo: autoCode,
        name: invItem.name,
        hsn: invItem.hsn || (chosenCat === 'Battery' ? '8506' : chosenCat === 'Earphone' ? '8518' : chosenCat === 'Charger' ? '8504' : '8517'),
        costPrice: invItem.costPrice || '',
        salePrice: invItem.salePrice || '',
        gstRate: invItem.gstRate !== undefined ? invItem.gstRate : 18,
      };

      const qty = Number(target.qty) || 1;
      const cost = Number(target.costPrice) || 0;
      const gst = Number(target.gstRate) || 18;
      const taxable = cost * qty;
      target.total = Math.round(taxable * (1 + gst / 100) * 100) / 100;

      updated[index] = target;
      return updated;
    });
    setActiveItemSuggestionRow(null);
  };

  // Item name change (Model No / Item Name)
  const handleItemNameChange = (index, value) => {
    setItems(prev => {
      const updated = [...prev];
      const otherRows = updated.filter((_, i) => i !== index);
      const curRow = updated[index];
      
      let code = curRow.itemNo;
      if (!code) {
        code = generateNextItemCode(value, curRow.category, otherRows, true);
      }

      updated[index] = {
        ...curRow,
        name: value,
        itemNo: code
      };
      return updated;
    });
  };

  // Field change - Category change immediately updates Item Code!
  const handleCellChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      const otherRows = updated.filter((_, i) => i !== index);
      const target = { ...updated[index], [field]: value };

      if (field === 'category') {
        let defaultHsn = '8517';
        if (value === 'Battery') defaultHsn = '8506';
        if (value === 'Earphone') defaultHsn = '8518';
        if (value === 'Charger') defaultHsn = '8504';
        if (value === 'Accessories') defaultHsn = '3926';
        target.hsn = defaultHsn;

        // Auto-update Item Code immediately according to Category!
        target.itemNo = generateNextItemCode(target.name, value, otherRows, true);
      }

      const qty = Number(field === 'qty' ? value : target.qty) || 0;
      const cost = Number(field === 'costPrice' ? value : target.costPrice) || 0;
      const gst = Number(field === 'gstRate' ? value : target.gstRate) || 18;

      const taxable = cost * qty;
      target.total = Math.round(taxable * (1 + gst / 100) * 100) / 100;

      updated[index] = target;
      return updated;
    });
  };

  const addRow = () => {
    setItems(prev => [...prev, buildEmptyRow('Mobile', prev)]);
  };

  const removeRow = (index) => {
    if (items.length <= 1) {
      setItems([buildEmptyRow('Mobile', [])]);
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Multi Serial Modal Open / Save
  const openMultiSerialModal = (index) => {
    const currentSerials = parseSerials(items[index].serialNo);
    setMultiSerialModalRowIndex(index);
    setMultiSerialInputText(currentSerials.join('\n'));
  };

  const saveMultiSerialModal = () => {
    if (multiSerialModalRowIndex === null) return;
    const parsed = parseSerials(multiSerialInputText);
    const joined = parsed.join(', ');
    handleCellChange(multiSerialModalRowIndex, 'serialNo', joined);
    setMultiSerialModalRowIndex(null);
  };

  // Extract all current serials across rows for duplicate checking
  const allCurrentPurchaseSerials = useMemo(() => {
    const list = [];
    items.forEach(it => {
      parseSerials(it.serialNo).forEach(s => list.push(s));
    });
    return list;
  }, [items]);

  // Financial Calculations with Discount
  const validItems = useMemo(() => {
    return items.filter(it => (it.name && it.name.trim() !== '') || (it.itemNo && it.itemNo.trim() !== ''));
  }, [items]);

  const totalTaxable = items.reduce((sum, it) => sum + ((Number(it.costPrice) || 0) * (Number(it.qty) || 0)), 0);
  const totalGst = items.reduce((sum, it) => {
    const tax = ((Number(it.costPrice) || 0) * (Number(it.qty) || 0));
    return sum + (tax * (Number(it.gstRate) || 0) / 100);
  }, 0);
  const subTotal = Math.round((totalTaxable + totalGst) * 100) / 100;
  const discountVal = Math.max(0, Math.min(Number(discount) || 0, subTotal));
  const grandTotal = Math.max(0, Math.round((subTotal - discountVal) * 100) / 100);

  // Pre-Save Validation: Triggered before opening Verification Modal (STRICT COMPULSORY CHECKS)
  const handleSave = (e) => {
    if (e) e.preventDefault();

    // 1. Check Supplier Name (COMPULSORY)
    if (!supplierName || !supplierName.trim()) {
      setNotification({
        type: 'error',
        message: 'सप्लायर का नाम (Supplier Name) दर्ज करना अनिवार्य है!'
      });
      setTimeout(() => setNotification(null), 4500);
      return;
    }

    // 2. Check Supplier Mobile (COMPULSORY: 10 DIGITS, ONLY NUMERIC, STARTS 6-9)
    const mobRes = validateMobile(supplierMobile, true, 'सप्लायर का मोबाइल नंबर');
    if (!mobRes.isValid) {
      setNotification({
        type: 'error',
        message: mobRes.error
      });
      setTimeout(() => setNotification(null), 4500);
      return;
    }

    // 2b. Check Supplier GSTIN (Optional, but if entered must be valid 15-char format)
    if (supplierGstin && supplierGstin.trim()) {
      const gstRes = validateGstin(supplierGstin, false);
      if (!gstRes.isValid) {
        setNotification({
          type: 'error',
          message: `सप्लायर GSTIN त्रुटि: ${gstRes.error}`
        });
        setTimeout(() => setNotification(null), 4500);
        return;
      }
    }

    // 3. Check Purchase Date (COMPULSORY)
    if (!date || !date.trim()) {
      setNotification({
        type: 'error',
        message: 'खरीद दिनांक (Purchase Date) चुनना अनिवार्य है!'
      });
      setTimeout(() => setNotification(null), 4500);
      return;
    }

    // 4. Check Items List
    if (items.length === 0) {
      setNotification({
        type: 'error',
        message: 'कृपया कम से कम एक आइटम दर्ज करें।'
      });
      setTimeout(() => setNotification(null), 4500);
      return;
    }

    // 5. Check each row for Category, Item Code, and Model No / Name (ALL COMPULSORY)
    for (let i = 0; i < items.length; i++) {
      const row = items[i];

      // A. Category Check
      if (!row.category || !row.category.trim()) {
        setNotification({
          type: 'error',
          message: `पंक्ति #${i + 1}: कृपया कैटेगरी (Category) का चयन करें!`
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      // B. Model No / Item Name Check
      if (!row.name || !row.name.trim()) {
        setNotification({
          type: 'error',
          message: `पंक्ति #${i + 1} (${row.category}): सामान / मॉडल नंबर (Model No / Item Name) दर्ज करना अनिवार्य है!`
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      // C. Item Code Check
      if (!row.itemNo || !row.itemNo.trim()) {
        const otherRows = items.filter((_, idx) => idx !== i);
        row.itemNo = generateNextItemCode(row.name, row.category, otherRows, true);
      }

      // D. Cost Price Check
      if (Number(row.costPrice) <= 0) {
        setNotification({
          type: 'error',
          message: `पंक्ति #${i + 1} (${row.name}): कृपया खरीद दर (Cost Price ₹) दर्ज करें!`
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      // E. Qty Check
      if (Number(row.qty) < 1) {
        setNotification({
          type: 'error',
          message: `पंक्ति #${i + 1} (${row.name}): न्यूनतम मात्रा 1 होनी चाहिए!`
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    // 6. Strict Serial Duplicate Validation
    const seenSerials = new Set();
    for (let r = 0; r < items.length; r++) {
      const it = items[r];
      const serials = parseSerials(it.serialNo);
      for (const s of serials) {
        if (seenSerials.has(s)) {
          setNotification({
            type: 'error',
            message: `डुप्लीकेट सीरियल/IMEI: "${s}" इस खरीद प्रविष्टि में दो बार दर्ज है!`
          });
          setTimeout(() => setNotification(null), 5000);
          return;
        }
        seenSerials.add(s);

        const purInfo = isSerialPurchased(s, editingPurchase?.id);
        if (purInfo) {
          setNotification({
            type: 'error',
            message: `सीरियल/IMEI "${s}" पहले ही खरीद #${purInfo.purchaseNo} में दर्ज है! डुप्लीकेट खरीद वर्जित है।`
          });
          setTimeout(() => setNotification(null), 5000);
          return;
        }

        const inStock = inventory.some(inv => (inv.serialNumbers || []).some(sn => sn.toUpperCase() === s));
        if (inStock && !editingPurchase) {
          setNotification({
            type: 'error',
            message: `सीरियल/IMEI "${s}" पहले से दुकान के एक्टिव स्टॉक में मौजूद है!`
          });
          setTimeout(() => setNotification(null), 5000);
          return;
        }
      }
    }

    // All compulsory checks passed -> Open Verification Modal
    setShowVerifyModal(true);
  };

  // Final Confirmation: Save to Context, update stock & inventory, and show Post-Save Modal
  const confirmAndFinalSave = () => {
    const currentValid = items.filter(it => it.itemNo.trim() !== '' || it.name.trim() !== '');
    const purchaseData = {
      ...(editingPurchase ? { id: editingPurchase.id } : {}),
      purchaseNo: purchaseNo || generateNextPurchaseNo(),
      date,
      supplierName: supplierName.trim() || 'सामान्य सप्लायर / Cash Purchase',
      supplierMobile: supplierMobile.trim(),
      supplierGstin: supplierGstin.trim().toUpperCase(),
      supplierInvoiceNo: supplierInvoiceNo.trim(),
      items: currentValid.map(it => ({
        itemNo: (it.itemNo || generateNextItemCode(it.name, it.category)).toUpperCase(),
        serialNo: parseSerials(it.serialNo).join(', '),
        name: it.name,
        category: it.category,
        hsn: it.hsn,
        costPrice: Number(it.costPrice) || 0,
        salePrice: Number(it.salePrice) || 0,
        gstRate: Number(it.gstRate) || 18,
        qty: Number(it.qty) || 1,
        total: Number(it.total) || 0
      })),
      totalTaxable: Math.round(totalTaxable * 100) / 100,
      totalGst: Math.round(totalGst * 100) / 100,
      subTotal: Math.round(subTotal * 100) / 100,
      discount: discountVal,
      grandTotal
    };

    const saved = savePurchase(purchaseData);
    setShowVerifyModal(false);
    setSavedPurchaseDetails(saved);
    setNotification({
      type: 'success',
      message: `सप्लायर खरीद प्रविष्टि #${saved.purchaseNo} सफलतापूर्वक सुरक्षित हो गई! स्टॉक में सभी आइटम्स जोड़ दिए गए।`
    });
    setTimeout(() => setNotification(null), 5000);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* 1. Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 shadow-md animate-in slide-in-from-top duration-200 ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      {/* 2. Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-xs border border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wide">
              Stock Inward / Purchase
            </span>
            <h2 className="text-xl font-black text-slate-900">
              {editingPurchase ? `खरीद एडिट: ${editingPurchase.purchaseNo}` : 'सप्लायर खरीद प्रविष्टि (Purchase Entry)'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            सप्लायर से माल खरीदने पर एंट्री दर्ज करें — स्टॉक इन्वेंट्री में तुरंत स्वतः जुड़ जाएगा
          </p>
        </div>

        <div className="flex items-center gap-2">
          {editingPurchase && (
            <button
              type="button"
              onClick={cancelEditingPurchase}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              रद्द करें
            </button>
          )}
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>रीसेट</span>
          </button>
        </div>
      </div>

      {/* 3. Supplier Form Details */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-amber-600" />
              <span>खरीद वाउचर सं. (Purchase No)</span>
            </label>
            <input
              type="text"
              value={purchaseNo}
              onChange={(e) => setPurchaseNo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>खरीद दिनांक <span className="text-rose-600 font-bold">*</span> (Date)</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div ref={supplierDropdownRef} className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-amber-600" />
                <span>सप्लायर / डिस्ट्रीब्यूटर नाम <span className="text-rose-600 font-bold">*</span></span>
              </span>
              <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                क्लिक करें ▾
              </span>
            </label>
            <input
              type="text"
              required
              value={supplierName}
              onFocus={() => setShowSupplierDropdown(true)}
              onClick={() => setShowSupplierDropdown(true)}
              onChange={(e) => {
                setSupplierName(e.target.value);
                setShowSupplierDropdown(true);
              }}
              placeholder="क्लिक कर चुनें या नाम टाइप करें..."
              className="w-full px-3 py-2 text-xs font-medium text-slate-900 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
            />
            {/* Dropdown list of past suppliers with real-time filter */}
            {showSupplierDropdown && (
              <div className="absolute left-0 top-full mt-1 z-40 w-full min-w-[280px] bg-white rounded-lg shadow-xl border border-slate-200 py-1 max-h-56 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
                  <span>पूर्व सप्लायर्स सूची ({filteredSuppliers.length})</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSupplierDropdown(false);
                    }}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    ✕ बंद करें
                  </button>
                </div>
                {filteredSuppliers.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-slate-400 text-center italic">
                    कोई मिलता-जुलता सप्लायर नहीं मिला (नया नाम टाइप करें)
                  </div>
                ) : (
                  filteredSuppliers.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={() => selectSupplier(s)}
                      className="w-full text-left px-3 py-2 hover:bg-amber-50 flex flex-col border-b border-slate-50 last:border-0 cursor-pointer transition-colors"
                    >
                      <span className="font-bold text-xs text-slate-900">{s.name}</span>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5 font-mono">
                        {s.mobile && <span>📞 {s.mobile}</span>}
                        {s.gstin && <span>GST: {s.gstin}</span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>सप्लायर फोन नंबर <span className="text-rose-600 font-bold">*</span></span>
              <span className="text-[10px] text-slate-400 font-normal">(10 अंक)</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              required
              maxLength={10}
              value={supplierMobile}
              onKeyDown={(e) => {
                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                  e.preventDefault();
                }
              }}
              onChange={(e) => handleSupplierMobileChange(e.target.value)}
              onPaste={handleSupplierMobilePaste}
              placeholder="10 अंकों का मोबाइल नंबर"
              className="w-full px-3 py-2 text-xs font-mono text-slate-900 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              सप्लायर GSTIN (यदि हो)
            </label>
            <input
              type="text"
              maxLength={15}
              value={supplierGstin}
              onChange={(e) => setSupplierGstin(formatGstinInput(e.target.value))}
              placeholder="08AABCB9876C1Z1"
              className="w-full px-3 py-2 text-xs font-mono font-medium text-slate-900 border border-slate-300 rounded-lg uppercase outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              सप्लायर का बिल नंबर (Supplier Invoice #)
            </label>
            <input
              type="text"
              value={supplierInvoiceNo}
              onChange={(e) => setSupplierInvoiceNo(e.target.value)}
              placeholder="उदा. INV-8841"
              className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 4. Purchased Items Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-amber-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm">खरीदे गए सामान की सूची (Purchase Items Table)</h3>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>नया आइटम रो जोड़ें</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase border-b border-slate-200 text-center">
                <th className="py-2.5 px-2 w-10">#</th>
                <th className="py-2.5 px-2 text-left w-32">कैटेगरी <span className="text-rose-600 font-bold">*</span></th>
                <th className="py-2.5 px-2 text-left w-32">आइटम कोड <span className="text-rose-600 font-bold">*</span></th>
                <th className="py-2.5 px-3 text-left">सामान / मॉडल का नाम <span className="text-rose-600 font-bold">*</span></th>
                <th className="py-2.5 px-2 w-48 text-left">सीरियल / IMEI / Key नं.</th>
                <th className="py-2.5 px-2 w-16">HSN</th>
                <th className="py-2.5 px-2 w-20 text-right">खरीद दर (₹) <span className="text-rose-600 font-bold">*</span></th>
                <th className="py-2.5 px-2 w-20 text-right">बिक्री दर (₹)</th>
                <th className="py-2.5 px-2 w-16">GST %</th>
                <th className="py-2.5 px-2 w-16">मात्रा <span className="text-rose-600 font-bold">*</span></th>
                <th className="py-2.5 px-3 w-24 text-right">कुल लागत (₹)</th>
                <th className="py-2.5 px-2 w-10 text-center">हटाएं</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {items.map((row, index) => {
                const rowSerials = parseSerials(row.serialNo);
                // Check each serial in row for errors
                let hasRowSerialError = null;
                for (const s of rowSerials) {
                  const countInDoc = allCurrentPurchaseSerials.filter(x => x === s).length;
                  if (countInDoc > 1) {
                    hasRowSerialError = `डुप्लीकेट: "${s}" दो बार दर्ज है!`;
                    break;
                  }
                  const check = validateSerial(s, {
                    context: 'purchase',
                    currentDocId: editingPurchase?.id,
                    allCurrentSerials: allCurrentPurchaseSerials
                  });
                  if (!check.isValid) {
                    hasRowSerialError = check.error;
                    break;
                  }
                }

                return (
                  <tr key={row.id} className={`hover:bg-amber-50/20 ${hasRowSerialError ? 'bg-rose-50/30' : ''}`}>
                    <td className="py-2 px-2 text-center font-bold text-slate-400">
                      {index + 1}
                    </td>
                    {/* 1. FIRST COLUMN: CATEGORY (Pre-selected & editable) */}
                    <td className="py-2 px-2">
                      <select
                        value={row.category}
                        onChange={(e) => handleCellChange(index, 'category', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs font-semibold text-slate-800 border border-slate-300 rounded outline-hidden bg-white focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Mobile">मोबाइल (Mobile)</option>
                        <option value="Battery">बैटरी (Battery)</option>
                        <option value="Earphone">ईयरफोन (Earphone)</option>
                        <option value="Charger">चार्जर (Charger)</option>
                        <option value="Accessories">एसेसरीज / ग्लास</option>
                        <option value="Other">अन्य (Other)</option>
                      </select>
                    </td>

                    {/* 2. SECOND COLUMN: ITEM CODE (Auto-generated & locked based on Category) */}
                    <td className="py-2 px-2">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          readOnly
                          value={row.itemNo || 'AUTO'}
                          title="कैटेगरी अनुसार आइटम कोड स्वतः जनरेट होता है (अपरिवर्तनीय)"
                          placeholder="AUTO"
                          className="w-full pl-6 pr-2 py-1.5 font-mono text-xs font-black uppercase bg-slate-100 text-amber-950 border border-slate-300 rounded cursor-not-allowed select-none outline-hidden"
                        />
                        <Lock className="w-3.5 h-3.5 text-amber-700/70 absolute left-1.5 pointer-events-none" />
                      </div>
                    </td>

                    {/* 3. THIRD COLUMN: MODEL NO / ITEM NAME */}
                    <td className="py-2 px-3 relative" ref={activeItemSuggestionRow === index ? itemDropdownRef : null}>
                      <div className="relative">
                        <input
                          type="text"
                          value={row.name}
                          onFocus={() => setActiveItemSuggestionRow(index)}
                          onChange={(e) => {
                            handleItemNameChange(index, e.target.value);
                            setActiveItemSuggestionRow(index);
                          }}
                          placeholder="सामान / मॉडल का नाम (उदा. OnePlus Nord / Battery)"
                          className="w-full px-2 py-1.5 text-xs font-medium border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 outline-hidden bg-white"
                        />
                        {activeItemSuggestionRow === index && (
                          <div className="absolute left-0 top-full mt-1 w-80 bg-white border border-slate-300 rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                            <div className="p-2 bg-amber-50 text-[11px] font-bold text-amber-800 flex items-center justify-between border-b border-amber-200">
                              <span>मौजूदा सामान चुनें (Auto-Fill & Code)</span>
                              <span className="text-[10px] text-amber-600 font-normal">क्लिक करें</span>
                            </div>
                            {filteredInventoryForSearch(row.name).map((invItem) => (
                              <button
                                key={invItem.id || invItem.itemNo}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectExistingItem(index, invItem);
                                }}
                                className="w-full text-left p-2 hover:bg-amber-100/70 transition-colors flex items-center justify-between group cursor-pointer"
                              >
                                <div>
                                  <div className="font-bold text-xs text-slate-800 group-hover:text-amber-900 flex items-center gap-1.5">
                                    <span>{invItem.name}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-mono font-semibold">
                                      {invItem.category}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    HSN: {invItem.hsn || '-'} | स्टॉक: {invItem.stockQty || 0}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-mono font-bold text-emerald-700 block">
                                    ₹{invItem.costPrice || 0}
                                  </span>
                                  <span className="text-[10px] text-slate-400">लागत दर</span>
                                </div>
                              </button>
                            ))}
                            {filteredInventoryForSearch(row.name).length === 0 && (
                              <div className="p-3 text-center text-xs text-slate-500">
                                कोई पूर्व आइटम नहीं मिला। नया नाम टाइप करें, कोड स्वतः बन जाएगा।
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* DEDICATED SERIAL / IMEI / KEY COLUMN */}
                    <td className="py-2 px-2">
                      <div>
                        <input
                          type="text"
                          value={row.serialNo || ''}
                          onChange={(e) => handleCellChange(index, 'serialNo', e.target.value.toUpperCase())}
                          placeholder="864920... / SN-001"
                          className={`w-full px-2 py-1.5 font-mono text-xs border rounded outline-hidden uppercase ${
                            hasRowSerialError ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold' : 'border-slate-300 bg-white'
                          }`}
                          title="बारकोड स्कैनर से स्कैन करें या टाइप करें (अनेक होने पर कॉमा लगाएं)"
                        />
                        {/* Multi-serial button if Qty > 1 */}
                        {Number(row.qty) > 1 && (
                          <button
                            type="button"
                            onClick={() => openMultiSerialModal(index)}
                            className="mt-1 text-[10px] text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-1.5 py-0.5 rounded flex items-center justify-between gap-1 font-bold cursor-pointer w-full transition-colors"
                          >
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-2.5 h-2.5" />
                              <span>+ {row.qty} IMEI/सीरियल भरें</span>
                            </span>
                            <span className={`px-1 py-0.2 rounded text-[9px] ${
                              rowSerials.length === Number(row.qty) ? 'bg-emerald-600 text-white' : 'bg-amber-700 text-white'
                            }`}>
                              {rowSerials.length}/{row.qty}
                            </span>
                          </button>
                        )}
                        {/* Live Error warning badge */}
                        {hasRowSerialError && (
                          <div className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5 mt-0.5 leading-tight">
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{hasRowSerialError}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={row.hsn}
                        onChange={(e) => handleCellChange(index, 'hsn', e.target.value)}
                        placeholder="8517"
                        className="w-full px-1.5 py-1.5 text-center font-mono text-xs border border-slate-300 rounded outline-hidden"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.costPrice}
                        onChange={(e) => handleCellChange(index, 'costPrice', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 text-right font-mono font-bold text-xs border border-slate-300 rounded outline-hidden text-amber-900"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.salePrice}
                        onChange={(e) => handleCellChange(index, 'salePrice', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 text-right font-mono font-bold text-xs border border-slate-300 rounded outline-hidden text-emerald-800"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={row.gstRate}
                        onChange={(e) => handleCellChange(index, 'gstRate', Number(e.target.value))}
                        className="w-full px-1 py-1.5 text-center font-bold text-xs border border-slate-300 rounded outline-hidden bg-white"
                      >
                        {(settings?.gstSlabs || [0, 5, 12, 18, 28]).map(slab => (
                          <option key={slab} value={slab}>{slab}%</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) => handleCellChange(index, 'qty', e.target.value)}
                        className="w-full px-1.5 py-1.5 text-center font-mono font-bold text-xs border border-slate-300 rounded outline-hidden"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                      ₹{Number(row.total || 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-amber-50/50 font-bold border-t-2 border-slate-300 text-xs">
                <td colSpan={6} className="py-2.5 px-3">
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-1 text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ और आइटम जोड़ें</span>
                  </button>
                </td>
                <td colSpan={4} className="py-2.5 px-2 text-right text-slate-700">
                  कुल खरीद कर योग्य: ₹{totalTaxable.toFixed(2)} | कुल GST: ₹{totalGst.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-black text-amber-950 text-base">
                  ₹{grandTotal.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5. Purchase Financial Summary & Actions Card */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Summary highlights with Discount */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">उप-कुल (Sub Total)</span>
              <span className="text-sm font-mono font-bold text-slate-800">
                ₹{subTotal.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                (टैक्सेबल: ₹{totalTaxable.toFixed(2)})
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">कुल जीएसटी (GST)</span>
              <span className="text-sm font-mono font-bold text-slate-800">
                ₹{totalGst.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                (खरीद इनपुट क्रेडिट)
              </span>
            </div>

            {/* Discount Input Field */}
            <div className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-300">
              <label className="text-[10px] text-amber-900 font-black block mb-0.5 flex items-center justify-between">
                <span>सप्लायर छूट (Discount ₹)</span>
                {discountVal > 0 && (
                  <span className="text-[9px] text-emerald-700 font-bold">लागू ✓</span>
                )}
              </label>
              <div className="relative mt-1">
                <span className="absolute left-2 top-1 text-xs font-bold text-amber-700">₹</span>
                <input
                  type="number"
                  min="0"
                  max={subTotal}
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
              <span className="text-[9px] text-amber-700 block mt-0.5">सप्लायर से मिली विशेष छूट</span>
            </div>

            <div className="bg-amber-100/60 p-2.5 rounded-lg border-2 border-amber-400 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-amber-900 font-black block">कुल खरीद देय (Grand Total)</span>
              <span className="text-base font-mono font-black text-amber-950">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
              {discountVal > 0 && (
                <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                  (₹{discountVal.toFixed(2)} छूट के बाद)
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1.5 px-4 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl transition-all cursor-pointer text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>फॉर्म रीसेट करें</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-lg shadow-amber-200 transition-all cursor-pointer text-sm"
            >
              <Save className="w-5 h-5" />
              <span>{editingPurchase ? 'खरीद अपडेट करें' : 'खरीद प्रविष्टि सेव करें (Save Purchase & Add Stock)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Multi-Serial Modal Dialog */}
      {multiSerialModalRowIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-200" />
                <div>
                  <h3 className="font-bold text-sm">सीरियल / IMEI नंबर दर्ज करें</h3>
                  <p className="text-[11px] text-amber-100">
                    आइटम: {items[multiSerialModalRowIndex]?.name || items[multiSerialModalRowIndex]?.itemNo} (मात्रा: {items[multiSerialModalRowIndex]?.qty})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMultiSerialModalRowIndex(null)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex justify-between">
                  <span>प्रत्येक सीरियल / IMEI अलग पंक्ति या कॉमा से दर्ज करें:</span>
                  <span className="font-mono text-amber-700 font-bold">
                    {parseSerials(multiSerialInputText).length} / {items[multiSerialModalRowIndex]?.qty} दर्ज
                  </span>
                </label>
                <textarea
                  rows={6}
                  value={multiSerialInputText}
                  onChange={(e) => setMultiSerialInputText(e.target.value.toUpperCase())}
                  placeholder="उदा.&#10;864920194820101&#10;864920194820102&#10;864920194820103"
                  className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500 uppercase leading-relaxed"
                  autoFocus
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 टिप: बारकोड स्कैनर से स्कैन करने पर यह स्वतः अगली लाइन में भरता जाएगा।
                </p>
              </div>

              {/* Duplicate check in modal */}
              {(() => {
                const parsed = parseSerials(multiSerialInputText);
                const dups = parsed.filter((item, index) => parsed.indexOf(item) !== index);
                if (dups.length > 0) {
                  return (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>डुप्लीकेट सीरियल मिला: {dups.join(', ')}</span>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMultiSerialModalRowIndex(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={saveMultiSerialModal}
                  className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>लागू करें (Apply)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 7. PRE-SAVE VERIFICATION MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-600/50 rounded-xl border border-amber-400/30">
                  <ShieldCheck className="w-6 h-6 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    खरीद प्रविष्टि सत्यापन (Verify Purchase Details)
                  </h3>
                  <p className="text-xs text-amber-100 mt-0.5">
                    कृपया खरीद सेव करने और स्टॉक में जोड़ने से पहले सभी विवरण व आइटम कोड जांच लें:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Supplier & Voucher Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">खरीद वाउचर सं.:</span>
                  <span className="font-mono font-black text-amber-900 text-sm">{purchaseNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">खरीद दिनांक:</span>
                  <span className="font-bold text-slate-800">{date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">सप्लायर नाम:</span>
                  <span className="font-bold text-slate-900 truncate block" title={supplierName}>
                    {supplierName || 'सामान्य सप्लायर'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">सप्लायर बिल #:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {supplierInvoiceNo || '-'}
                  </span>
                </div>
              </div>

              {/* Items Verification Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-amber-700" />
                    <span>सत्यापन सूची ({validItems.length} आइटम्स)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-normal">
                    सभी आइटम कोड ऑटो-जनरेट किए गए हैं 🔒
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-center">
                        <th className="py-2 px-2 w-8">#</th>
                        <th className="py-2 px-2 text-left w-24">कैटेगरी</th>
                        <th className="py-2 px-2 text-left w-28">आइटम कोड</th>
                        <th className="py-2 px-3 text-left">सामान / मॉडल नं.</th>
                        <th className="py-2 px-2 text-left">सीरियल / IMEI</th>
                        <th className="py-2 px-2 w-14 text-center">HSN</th>
                        <th className="py-2 px-2 text-right">खरीद दर (₹)</th>
                        <th className="py-2 px-2 text-right">बिक्री दर (₹)</th>
                        <th className="py-2 px-2 text-center">GST</th>
                        <th className="py-2 px-2 text-center">मात्रा</th>
                        <th className="py-2 px-3 text-right">कुल राशि (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validItems.map((it, idx) => {
                        const serials = parseSerials(it.serialNo);
                        return (
                          <tr key={idx} className="hover:bg-amber-50/30">
                            <td className="py-2 px-2 text-center font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-2 font-semibold text-slate-700">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-200">
                                {it.category}
                              </span>
                            </td>
                            <td className="py-2 px-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-extrabold text-[11px] border border-amber-300">
                                <Lock className="w-2.5 h-2.5 text-amber-700" />
                                {it.itemNo}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900">
                              {it.name}
                            </td>
                            <td className="py-2 px-2 text-slate-700">
                              {serials.length > 0 ? (
                                <div>
                                  <span className="font-mono text-[10px] font-semibold text-indigo-900">
                                    {serials.slice(0, 2).join(', ')}
                                    {serials.length > 2 && ` (+${serials.length - 2} और)`}
                                  </span>
                                  <span className="block text-[9px] text-slate-400 font-bold">
                                    ({serials.length} सीरियल दर्ज)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px] italic">सीरियल नहीं</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center font-mono text-slate-500">
                              {it.hsn || '-'}
                            </td>
                            <td className="py-2 px-2 text-right font-mono font-bold text-amber-900">
                              ₹{Number(it.costPrice || 0).toFixed(2)}
                            </td>
                            <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700">
                              ₹{Number(it.salePrice || 0).toFixed(2)}
                            </td>
                            <td className="py-2 px-2 text-center font-semibold text-slate-700">
                              {it.gstRate}%
                            </td>
                            <td className="py-2 px-2 text-center font-mono font-extrabold text-slate-900">
                              {it.qty}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-extrabold text-slate-900">
                              ₹{Number(it.total || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      {discountVal > 0 && (
                        <tr className="bg-amber-50/80 font-bold border-t-2 border-amber-300 text-xs text-slate-700">
                          <td colSpan={9} className="py-1.5 px-3 text-right">
                            उप-कुल (Sub Total): ₹{subTotal.toFixed(2)} | विशेष छूट (Discount):
                          </td>
                          <td colSpan={2} className="py-1.5 px-3 text-right font-mono font-bold text-emerald-800">
                            -₹{discountVal.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-amber-100/70 font-black border-t border-amber-300 text-xs">
                        <td colSpan={9} className="py-2.5 px-3 text-right text-slate-800">
                          कुल कर योग्य मूल्य: ₹{totalTaxable.toFixed(2)} | कुल GST: ₹{totalGst.toFixed(2)} | कुल देय:
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-amber-900">
                          {validItems.reduce((s, it) => s + (Number(it.qty) || 0), 0)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-amber-950 text-sm">
                          ₹{grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>वापस जाएं / सुधारें (Back & Edit)</span>
              </button>

              <button
                type="button"
                onClick={confirmAndFinalSave}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all text-xs cursor-pointer flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>पुष्टि करें और अंतिम सेव करें (Confirm & Final Save)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. POST-SAVE ITEM CODES SUMMARY MODAL (Printed / Barcode List) */}
      {savedPurchaseDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/50 rounded-xl border border-emerald-300/30">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    खरीद प्रविष्टि सफलतापूर्वक सेव हो गई!
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    दुकान के स्टॉक में सभी आइटम्स जुड़ चुके हैं। नीचे प्रत्येक सामान का जनरेटेड 'आइटम कोड' देखें:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSavedPurchaseDetails(null)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto print:max-h-none" id="saved-item-codes-slip">
              {/* Meta bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">खरीद वाउचर #: </span>
                  <span className="font-mono font-black text-slate-900">{savedPurchaseDetails.purchaseNo}</span>
                </div>
                <div>
                  <span className="text-slate-500">सप्लायर: </span>
                  <span className="font-bold text-slate-900">{savedPurchaseDetails.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-500">दिनांक: </span>
                  <span className="font-semibold text-slate-800">{savedPurchaseDetails.date}</span>
                </div>
                {Number(savedPurchaseDetails.discount || 0) > 0 && (
                  <div>
                    <span className="text-slate-500">छूट: </span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">-₹{savedPurchaseDetails.discount}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">कुल राशि: </span>
                  <span className="font-mono font-black text-emerald-800 text-sm">₹{savedPurchaseDetails.grandTotal}</span>
                </div>
              </div>

              {/* Informative Tip */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <ClipboardList className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">लेबलिंग व बारकोड निर्देश:</div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    इन आइटम कोड्स को सामान के बॉक्स या डिब्बे पर लेबल चिपका दें। बिक्री (Sales Billing) करते समय बिल में यह आइटम कोड या सामान का नाम टाइप करते ही विवरण स्वतः भर जाएगा।
                  </div>
                </div>
              </div>

              {/* Item Codes Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-center">
                      <th className="py-2.5 px-2 w-10">#</th>
                      <th className="py-2.5 px-2 text-left w-28">कैटेगरी</th>
                      <th className="py-2.5 px-3 text-left w-36">आइटम कोड (Item Code)</th>
                      <th className="py-2.5 px-3 text-left">सामान / मॉडल का नाम</th>
                      <th className="py-2.5 px-2 text-left">सीरियल / IMEI नं.</th>
                      <th className="py-2.5 px-2 text-center">मात्रा</th>
                      <th className="py-2.5 px-2 text-right">खरीद दर (₹)</th>
                      <th className="py-2.5 px-3 text-right">बिक्री दर (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(savedPurchaseDetails.items || []).map((it, idx) => {
                      const serials = parseSerials(it.serialNo);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-200">
                              {it.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 font-mono font-black text-xs border border-emerald-300 shadow-2xs">
                              <Lock className="w-3 h-3 text-emerald-700" />
                              <span>{it.itemNo}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {it.name}
                          </td>
                          <td className="py-2.5 px-2 text-slate-700">
                            {serials.length > 0 ? (
                              <div className="font-mono text-[10px]">
                                {serials.join(', ')}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                            {it.qty}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-semibold text-slate-700">
                            ₹{Number(it.costPrice || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                            ₹{Number(it.salePrice || 0).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>प्रिंट लिस्ट / बारकोड स्लिप</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSavedPurchaseDetails(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors text-xs cursor-pointer"
                >
                  नई खरीद प्रविष्टि (New Purchase)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSavedPurchaseDetails(null);
                    setActiveTab('generate');
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-colors text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>बिक्री बिलिंग पर जाएं (Go to Sales)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
