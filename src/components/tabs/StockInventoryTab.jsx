import React, { useState, useMemo } from 'react';
import { useBilling } from '../../context/BillingContext';
import { 
  Boxes, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  TrendingUp, 
  DollarSign, 
  X, 
  Save, 
  Filter, 
  Printer,
  Eye,
  Truck,
  FileText,
  Calendar,
  Building,
  Phone,
  Layers,
  CheckCircle,
  Hash,
  Tag
} from 'lucide-react';

import { 
  getAvailableFinancialYears, 
  getCurrentFinancialYear, 
  isDateInFinancialYear 
} from '../../utils/financialYear';

export default function StockInventoryTab() {
  const { 
    inventory, 
    purchases,
    saveInventoryItem, 
    deleteInventoryItem, 
    settings, 
    triggerPrintStock, 
    triggerPrintPurchase,
    triggerPrintReport,
    startEditingPurchase,
    setActiveTab,
    parseSerials, 
    validateSerial,
    isItemCodeSold,
    isSerialSold
  } = useBilling();

  const gstSlabs = settings?.gstSlabs || [0, 5, 12, 18, 28];

  // Active View: 'inventory' (Current Stock) | 'purchases' (Purchase Inward Invoices)
  const [activeStockView, setActiveStockView] = useState('inventory');

  // Inventory Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, LOW, OUT

  // Purchase Inward Filters
  const [purchaseSearchTerm, setPurchaseSearchTerm] = useState('');
  const [selectedPurchaseDate, setSelectedPurchaseDate] = useState('');
  
  // Financial Year Filter State for Purchases (1 April to 31 March)
  const currentFY = useMemo(() => getCurrentFinancialYear(), []);
  const [selectedPurchaseFY, setSelectedPurchaseFY] = useState('ALL');

  const availablePurchaseFYs = useMemo(() => {
    const dates = purchases.map(p => p.date).filter(Boolean);
    return getAvailableFinancialYears(dates);
  }, [purchases]);

  // Modals & Preview States
  const [editingItem, setEditingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewPurchase, setPreviewPurchase] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form State for Add / Edit Item
  const [itemForm, setItemForm] = useState({
    itemNo: '',
    name: '',
    category: 'Mobile',
    hsn: '8517',
    costPrice: '',
    salePrice: '',
    gstRate: 18,
    stockQty: '',
    minAlertQty: 3,
    unit: 'PCS',
    serialNumbersText: ''
  });

  // Calculate Inventory Stats
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce((sum, it) => sum + (Number(it.stockQty) || 0), 0);
    const totalCostValue = inventory.reduce((sum, it) => sum + ((Number(it.costPrice) || 0) * (Number(it.stockQty) || 0)), 0);
    const totalSaleValue = inventory.reduce((sum, it) => sum + ((Number(it.salePrice) || 0) * (Number(it.stockQty) || 0)), 0);
    const lowStockCount = inventory.filter(it => (Number(it.stockQty) || 0) <= (Number(it.minAlertQty) || 3) && (Number(it.stockQty) || 0) > 0).length;
    const outOfStockCount = inventory.filter(it => (Number(it.stockQty) || 0) <= 0).length;

    return {
      totalItems,
      totalQuantity,
      totalCostValue: Math.round(totalCostValue),
      totalSaleValue: Math.round(totalSaleValue),
      lowStockCount,
      outOfStockCount
    };
  }, [inventory]);

  // Calculate Purchases Inward Stats
  const purchaseStats = useMemo(() => {
    const totalCount = purchases.length;
    const totalCost = purchases.reduce((sum, p) => sum + Number(p.grandTotal || 0), 0);
    const totalGst = purchases.reduce((sum, p) => sum + Number(p.totalGst || 0), 0);
    const totalQtyInward = purchases.reduce((sum, p) => {
      return sum + (p.items || []).reduce((iSum, it) => iSum + (Number(it.qty) || 0), 0);
    }, 0);

    return {
      totalCount,
      totalCost,
      totalGst,
      totalQtyInward
    };
  }, [purchases]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(inventory.map(it => it.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [inventory]);

  // Filtered Inventory Items
  const filteredItems = useMemo(() => {
    return inventory.filter(it => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (it.itemNo && it.itemNo.toLowerCase().includes(q)) ||
        (it.name && it.name.toLowerCase().includes(q)) ||
        (it.category && it.category.toLowerCase().includes(q)) ||
        (it.serialNumbers && it.serialNumbers.some(s => s.toLowerCase().includes(q)));

      const matchCat = selectedCategory === 'ALL' || it.category === selectedCategory;

      let matchStock = true;
      const qty = Number(it.stockQty) || 0;
      const minAlert = Number(it.minAlertQty) || 3;
      if (stockFilter === 'LOW') matchStock = qty <= minAlert && qty > 0;
      if (stockFilter === 'OUT') matchStock = qty <= 0;

      return matchSearch && matchCat && matchStock;
    });
  }, [inventory, searchTerm, selectedCategory, stockFilter]);

  // Filtered Purchases Inward List
  const filteredPurchases = useMemo(() => {
    return purchases.filter(pur => {
      const q = purchaseSearchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (pur.purchaseNo && pur.purchaseNo.toLowerCase().includes(q)) ||
        (pur.supplierName && pur.supplierName.toLowerCase().includes(q)) ||
        (pur.supplierMobile && pur.supplierMobile.includes(q)) ||
        (pur.supplierInvoiceNo && pur.supplierInvoiceNo.toLowerCase().includes(q)) ||
        (pur.items && pur.items.some(it => 
          (it.name && it.name.toLowerCase().includes(q)) ||
          (it.itemNo && it.itemNo.toLowerCase().includes(q)) ||
          (it.serialNo && it.serialNo.toLowerCase().includes(q))
        ));

      const matchDate = !selectedPurchaseDate || pur.date === selectedPurchaseDate;
      const matchFY = !selectedPurchaseFY || selectedPurchaseFY === 'ALL' || isDateInFinancialYear(pur.date, selectedPurchaseFY);

      return matchSearch && matchDate && matchFY;
    });
  }, [purchases, purchaseSearchTerm, selectedPurchaseDate, selectedPurchaseFY]);

  // Active Filtered Purchases Statistics
  const activePurchaseStats = useMemo(() => {
    const totalCount = filteredPurchases.length;
    const totalCost = filteredPurchases.reduce((sum, p) => sum + Number(p.grandTotal || 0), 0);
    const totalGst = filteredPurchases.reduce((sum, p) => sum + Number(p.totalGst || 0), 0);
    const totalQtyInward = filteredPurchases.reduce((sum, p) => {
      return sum + (p.items || []).reduce((iSum, it) => iSum + (Number(it.qty) || 0), 0);
    }, 0);

    return {
      totalCount,
      totalCost,
      totalGst,
      totalQtyInward
    };
  }, [filteredPurchases]);

  // Print current purchase list
  const handlePrintCurrentPurchases = () => {
    let dateLabel = 'समस्त खरीद रिकॉर्ड';
    if (selectedPurchaseDate) {
      dateLabel = `दिनांक: ${selectedPurchaseDate}`;
    } else if (selectedPurchaseFY && selectedPurchaseFY !== 'ALL') {
      const fy = availablePurchaseFYs.find(f => f.key === selectedPurchaseFY);
      dateLabel = fy ? fy.displayTitle : `वित्तीय वर्ष: ${selectedPurchaseFY}`;
    }

    triggerPrintReport({
      reportType: 'purchases',
      items: filteredPurchases,
      filterDate: dateLabel,
      searchTerm: purchaseSearchTerm,
      stats: activePurchaseStats,
      isYearly: selectedPurchaseFY !== 'ALL'
    });
  };

  // Print full Yearly Purchases Report for FY (1 April to 31 March)
  const handlePrintYearlyPurchases = (targetFY = selectedPurchaseFY !== 'ALL' ? selectedPurchaseFY : currentFY.key) => {
    const fyObj = availablePurchaseFYs.find(f => f.key === String(targetFY)) || currentFY;
    const fyItems = purchases.filter(p => isDateInFinancialYear(p.date, fyObj.startYear));

    triggerPrintReport({
      reportType: 'purchases',
      items: fyItems,
      filterDate: fyObj.displayTitle,
      searchTerm: '',
      isYearly: true
    });
  };

  // Helper to find purchase record for an inventory item
  const findPurchaseForItem = (item) => {
    if (!item) return null;
    const cleanNo = (item.itemNo || '').toUpperCase().trim();
    const cleanName = (item.name || '').toLowerCase().trim();

    return purchases.find(pur => 
      (pur.items || []).some(it => {
        if (cleanNo && it.itemNo && it.itemNo.toUpperCase().trim() === cleanNo) return true;
        if (cleanName && it.name && it.name.toLowerCase().trim() === cleanName) return true;
        if (item.serialNumbers && item.serialNumbers.length > 0 && it.serialNo) {
          const pSerials = parseSerials(it.serialNo);
          if (item.serialNumbers.some(sn => pSerials.includes(sn.toUpperCase()))) return true;
        }
        return false;
      })
    ) || null;
  };

  // View purchase modal from inventory row
  const handleViewItemPurchase = (item) => {
    const matchedPurchase = findPurchaseForItem(item);
    if (matchedPurchase) {
      setPreviewPurchase(matchedPurchase);
    } else {
      setNotification({
        type: 'info',
        message: `आइटम '${item.name}' (${item.itemNo}) का कोई सीधा सप्लायर खरीद वाउचर नहीं मिला (यह प्रारंभिक स्टॉक हो सकता है)।`
      });
      setTimeout(() => setNotification(null), 4500);
    }
  };

  const openAddModal = () => {
    setItemForm({
      itemNo: '',
      name: '',
      category: 'Mobile',
      hsn: '8517',
      costPrice: '',
      salePrice: '',
      gstRate: 18,
      stockQty: 1,
      minAlertQty: 3,
      unit: 'PCS',
      serialNumbersText: ''
    });
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (item) => {
    setItemForm({
      ...item,
      serialNumbersText: (item.serialNumbers || []).join(', ')
    });
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!itemForm.itemNo.trim() || !itemForm.name.trim() || !itemForm.salePrice) {
      setNotification({
        type: 'error',
        message: 'कृपया आइटम नंबर, नाम और बिक्री मूल्य अनिवार्य रूप से भरें!'
      });
      setTimeout(() => setNotification(null), 4500);
      return;
    }

    let parsedSerials = [];
    if (itemForm.serialNumbersText && itemForm.serialNumbersText.trim()) {
      parsedSerials = parseSerials(itemForm.serialNumbersText);
      const seen = new Set();
      for (const s of parsedSerials) {
        if (seen.has(s)) {
          setNotification({
            type: 'error',
            message: `सीरियल / IMEI "${s}" दो बार लिखा गया है!`
          });
          setTimeout(() => setNotification(null), 4500);
          return;
        }
        seen.add(s);
        const valRes = validateSerial(s, { isPurchase: false });
        if (!valRes.valid) {
          const wasInSelf = editingItem?.serialNumbers?.some(es => es.toUpperCase() === s.toUpperCase());
          if (!wasInSelf) {
            setNotification({
              type: 'error',
              message: `त्रुटि: ${valRes.reason}`
            });
            setTimeout(() => setNotification(null), 5000);
            return;
          }
        }
      }
    }

    saveInventoryItem({
      ...(editingItem ? { id: editingItem.id } : {}),
      itemNo: itemForm.itemNo.toUpperCase().trim(),
      name: itemForm.name.trim(),
      category: itemForm.category,
      hsn: itemForm.hsn.trim(),
      costPrice: Number(itemForm.costPrice) || 0,
      salePrice: Number(itemForm.salePrice) || 0,
      gstRate: Number(itemForm.gstRate) || 18,
      stockQty: Number(itemForm.stockQty) || 0,
      minAlertQty: Number(itemForm.minAlertQty) || 3,
      unit: itemForm.unit || 'PCS',
      serialNumbers: parsedSerials
    });

    setNotification({
      type: 'success',
      message: editingItem ? 'आइटम सफलतापूर्वक अपडेट हुआ!' : 'नया आइटम इन्वेंट्री में जुड़ गया!'
    });
    setTimeout(() => setNotification(null), 4000);
    setIsAddModalOpen(false);
  };

  const handleDelete = (id, name) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      const soldCode = isItemCodeSold(item.itemNo);
      if (soldCode) {
        setNotification({
          type: 'error',
          message: `आइटम '${name}' (कोड: ${item.itemNo}) हटाया नहीं जा सकता क्योंकि यह बिक्री बिल #${soldCode.billNo} में बेचा जा चुका है!`
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }
      const serials = Array.isArray(item.serialNumbers) ? item.serialNumbers : parseSerials(item.serialNo);
      for (const s of serials) {
        const soldSerial = isSerialSold(s);
        if (soldSerial) {
          setNotification({
            type: 'error',
            message: `आइटम '${name}' (सीरियल: ${s}) हटाया नहीं जा सकता क्योंकि यह बिक्री बिल #${soldSerial.billNo} में बेचा जा चुका है!`
          });
          setTimeout(() => setNotification(null), 5000);
          return;
        }
      }
    }

    if (window.confirm(`क्या आप सचमुच '${name}' को इन्वेंट्री से हटाना चाहते हैं?`)) {
      try {
        deleteInventoryItem(id);
        setNotification({
          type: 'success',
          message: `स्टॉक आइटम '${name}' सफलतापूर्वक हटा दिया गया!`
        });
      } catch (err) {
        setNotification({
          type: 'error',
          message: err.message
        });
      }
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Notification */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-2 shadow-md animate-in fade-in ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' : notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">{notification.message || notification}</span>
        </div>
      )}

      {/* 2. Top Header with Sub-View Switcher */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-600" />
            <span>दुकान स्टॉक एवं खरीद रिपोर्ट (Stock & Purchase Report)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            उपलब्ध दुकान स्टॉक रजिस्टर देखें, या प्रत्येक खरीद वाउचर की ऑन-क्लिक रिपोर्ट देखें व प्रिंट करें।
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveStockView('inventory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeStockView === 'inventory'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>📦 दुकान स्टॉक रजिस्टर ({inventory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStockView('purchases')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeStockView === 'purchases'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>🚚 खरीद वाउचर रिपोर्ट ({purchases.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: CURRENT STOCK INVENTORY REGISTER */}
      {/* ========================================================================= */}
      {activeStockView === 'inventory' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">कुल उत्पाद प्रकार</span>
                <Boxes className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">{stats.totalItems}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">कुल मात्रा: {stats.totalQuantity} PCS</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">स्टॉक खरीद लागत (Cost)</span>
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-amber-900">₹{stats.totalCostValue.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">लागत मूल्य पर</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">अपेक्षित बिक्री मूल्य</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-900">₹{stats.totalSaleValue.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">MRP / रिटेल मूल्य पर</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">कम / खत्म स्टॉक अलर्ट</span>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-rose-600">
                {stats.lowStockCount + stats.outOfStockCount}
              </div>
              <div className="text-[11px] text-rose-500 mt-0.5">
                {stats.outOfStockCount} समाप्त, {stats.lowStockCount} कम हैं
              </div>
            </div>
          </div>

          {/* Search, Filters & Action Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="आइटम कोड या नाम खोजें..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg outline-hidden bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'ALL' ? 'सभी श्रेणियां (All Categories)' : cat}</option>
                ))}
              </select>

              {/* Stock Level Filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg outline-hidden bg-white"
              >
                <option value="ALL">सभी स्टॉक</option>
                <option value="LOW">⚠️ कम स्टॉक (&le; 3)</option>
                <option value="OUT">❌ आउट ऑफ स्टॉक (0)</option>
              </select>
            </div>

            {/* Buttons: Print Register & Add Item */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Print Full Stock Register Button */}
              <button
                type="button"
                onClick={() => {
                  triggerPrintStock({
                    items: filteredItems,
                    stats,
                    selectedCategory,
                    stockFilter,
                    searchTerm
                  });
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                title="पूरा स्टॉक रजिस्टर A4 प्रिंट प्रारूप में निकालें"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ पूरा स्टॉक रजिस्टर प्रिंट करें ({filteredItems.length})</span>
              </button>

              {/* Add Item Button */}
              <button
                type="button"
                onClick={openAddModal}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>+ नया आइटम जोड़ें (Add Item)</span>
              </button>
            </div>
          </div>

          {/* Inventory Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[950px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3 w-32">आइटम कोड / No</th>
                    <th className="py-3 px-3">आइटम का नाम (Item Name)</th>
                    <th className="py-3 px-3 w-28">कैटेगरी</th>
                    <th className="py-3 px-2 w-16 text-center">HSN</th>
                    <th className="py-3 px-3 w-24 text-right">खरीद दर (Cost ₹)</th>
                    <th className="py-3 px-3 w-24 text-right">बिक्री दर (Sale ₹)</th>
                    <th className="py-3 px-2 w-16 text-center">GST %</th>
                    <th className="py-3 px-3 w-28 text-center">उपलब्ध स्टॉक</th>
                    <th className="py-3 px-4 w-36 text-center">कार्रवाई & खरीद वाउचर</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        कोई आइटम नहीं मिला।
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => {
                      const qty = Number(item.stockQty) || 0;
                      const minAlert = Number(item.minAlertQty) || 3;
                      const isOut = qty <= 0;
                      const isLow = qty > 0 && qty <= minAlert;
                      const matchedPur = findPurchaseForItem(item);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-900">
                            {item.itemNo}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            {item.serialNumbers && item.serialNumbers.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                <span className="text-[10px] text-indigo-700 font-bold">IMEI ({item.serialNumbers.length}):</span>
                                {item.serialNumbers.slice(0, 3).map((s, sIdx) => (
                                  <span key={sIdx} className="text-[10px] font-mono bg-indigo-50 text-indigo-800 px-1 rounded border border-indigo-100">
                                    {s}
                                  </span>
                                ))}
                                {item.serialNumbers.length > 3 && (
                                  <span className="text-[10px] text-slate-500 font-medium">+{item.serialNumbers.length - 3} और</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                            {item.hsn || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            ₹{Number(item.costPrice || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                            ₹{Number(item.salePrice || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                            {item.gstRate}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block font-mono font-bold px-2.5 py-1 rounded-full text-[11px] ${
                                isOut
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {qty} {item.unit || 'PCS'}
                              {isOut && ' (खत्म)'}
                              {isLow && ' (कम)'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* On-Click Purchase Report Preview & Print */}
                              <button
                                type="button"
                                onClick={() => handleViewItemPurchase(item)}
                                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                  matchedPur
                                    ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
                                    : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                                }`}
                                title={matchedPur ? `खरीद वाउचर #${matchedPur.purchaseNo} प्रीव्यू व प्रिंट करें` : 'सीधा स्टॉक / खरीद वाउचर लिंक'}
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-700" />
                                <span className="text-[10px]">खरीद</span>
                              </button>

                              {/* If matched, direct 1-click print button */}
                              {matchedPur && (
                                <button
                                  type="button"
                                  onClick={() => triggerPrintPurchase(matchedPur)}
                                  className="p-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer"
                                  title={`खरीद वाउचर #${matchedPur.purchaseNo} तुरंत 1-क्लिक प्रिंट करें`}
                                >
                                  <Printer className="w-3.5 h-3.5 text-emerald-700" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                                title="स्टॉक आइटम एडिट करें"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id, item.name)}
                                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="स्टॉक से हटाएं"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: PURCHASES INWARD INVOICES & REPORT */}
      {/* ========================================================================= */}
      {activeStockView === 'purchases' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Purchase Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">कुल खरीद वाउचर्स</span>
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">{purchaseStats.totalCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">सप्लायर इनवर्ड प्रविष्टियां</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">कुल माल आवक मात्रा</span>
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-indigo-950 font-mono">{purchaseStats.totalQtyInward} PCS</div>
              <div className="text-[11px] text-slate-500 mt-0.5">दुकान में आया नया स्टॉक</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">कुल खरीद लागत मूल्य</span>
                <TrendingUp className="w-5 h-5 text-amber-700" />
              </div>
              <div className="mt-2 text-2xl font-black text-amber-900 font-mono">
                ₹{Math.round(purchaseStats.totalCost).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">सप्लायर कुल भुगतान</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">कुल जीएसटी इनपुट (ITC)</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-900 font-mono">
                ₹{Math.round(purchaseStats.totalGst).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">दावा योग्य इनपुट टैक्स क्रेडिट</div>
            </div>
          </div>

          {/* Search, Financial Year & Date Filters & Print Actions */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={purchaseSearchTerm}
                onChange={(e) => setPurchaseSearchTerm(e.target.value)}
                placeholder="वाउचर सं, सप्लायर नाम, फोन, आइटम..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Filter Group: Financial Year + Single Date */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Financial Year Filter (April to March) */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-amber-300/80 px-2.5 py-1 rounded-lg">
                <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs font-bold text-amber-950 shrink-0">वित्तीय वर्ष:</span>
                <select
                  value={selectedPurchaseFY}
                  onChange={(e) => setSelectedPurchaseFY(e.target.value)}
                  className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer pr-1"
                  title="वित्तीय वर्ष (1 अप्रैल से 31 मार्च) अनुसार खरीद फ़िल्टर करें"
                >
                  <option value="ALL">सभी वित्तीय वर्ष (All Years)</option>
                  {availablePurchaseFYs.map(fy => (
                    <option key={fy.key} value={fy.key}>
                      {fy.hindiLabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Single Date Filter */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-lg">
                <span className="text-xs font-bold text-slate-600 shrink-0">तारीख:</span>
                <input
                  type="date"
                  value={selectedPurchaseDate}
                  onChange={(e) => setSelectedPurchaseDate(e.target.value)}
                  className="text-xs text-slate-800 outline-none bg-transparent cursor-pointer"
                  title="विशिष्ट दिन की खरीद देखें"
                />
              </div>

              {/* Reset Filter Button */}
              {(selectedPurchaseDate || selectedPurchaseFY !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPurchaseDate('');
                    setSelectedPurchaseFY('ALL');
                  }}
                  className="text-xs text-rose-600 font-bold px-2 py-1 hover:bg-rose-50 rounded border border-rose-200 transition-colors cursor-pointer"
                  title="फ़िल्टर हटाएं"
                >
                  ✕ हटाएं
                </button>
              )}
            </div>

            {/* Print Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Yearly Purchases Report Print (April - March) */}
              <button
                type="button"
                onClick={() => handlePrintYearlyPurchases(selectedPurchaseFY !== 'ALL' ? selectedPurchaseFY : currentFY.key)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                title="चयनित वित्तीय वर्ष (1 अप्रैल से 31 मार्च) की वार्षिक खरीद रिपोर्ट A4 साइज में प्रिंट करें"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ वार्षिक खरीद रिपोर्ट प्रिंट (April-March)</span>
              </button>

              {/* 2. Print Current Filtered List */}
              <button
                type="button"
                onClick={handlePrintCurrentPurchases}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                title="वर्तमान स्क्रीन पर प्रदर्शित खरीद सूची को प्रिंट करें"
              >
                <Printer className="w-4 h-4" />
                <span>वर्तमान लिस्ट प्रिंट ({filteredPurchases.length})</span>
              </button>
            </div>
          </div>

          {/* Active Financial Year Banner Info */}
          {selectedPurchaseFY !== 'ALL' && (
            <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-emerald-50 border border-amber-300 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-amber-950 block">
                    {availablePurchaseFYs.find(f => f.key === selectedPurchaseFY)?.displayTitle || `वित्तीय वर्ष ${selectedPurchaseFY}`}
                  </span>
                  <span className="text-[11px] text-slate-600">
                    1 अप्रैल से 31 मार्च तक का वार्षिक माल आवक व ITC इनपुट टैक्स क्रेडिट फ़िल्टर सक्रिय है
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white px-3 py-1 rounded-lg border border-amber-200 font-bold text-slate-800">
                  कुल खरीद वाउचर: <span className="text-amber-700 font-black">{filteredPurchases.length}</span>
                </div>
                <div className="bg-white px-3 py-1 rounded-lg border border-emerald-200 font-bold text-slate-800">
                  कुल खरीद लागत: <span className="text-emerald-700 font-black">₹{Math.round(activePurchaseStats.totalCost || 0).toLocaleString('en-IN')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrintYearlyPurchases(selectedPurchaseFY)}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>यह वार्षिक खरीद रिपोर्ट प्रिंट करें</span>
                </button>
              </div>
            </div>
          )}

          {/* Purchases Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
                <thead>
                  <tr className="bg-amber-50/70 text-amber-950 font-bold uppercase border-b border-amber-200">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3 w-32">वाउचर सं.</th>
                    <th className="py-3 px-3 w-28">दिनांक</th>
                    <th className="py-3 px-4">सप्लायर विवरण (Supplier)</th>
                    <th className="py-3 px-3">खरीदा गया माल (Items & S/N)</th>
                    <th className="py-3 px-3 w-24 text-right">कर योग्य (₹)</th>
                    <th className="py-3 px-3 w-20 text-right">GST (₹)</th>
                    <th className="py-3 px-3 w-20 text-right">छूट (₹)</th>
                    <th className="py-3 px-4 w-28 text-right">कुल लागत (₹)</th>
                    <th className="py-3 px-4 w-32 text-center">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        कोई खरीद रिकॉर्ड नहीं मिला।
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((pur, index) => (
                      <tr key={pur.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-900">
                          {pur.purchaseNo}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {pur.date}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{pur.supplierName}</div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            {pur.supplierMobile && <span className="font-mono">📞 {pur.supplierMobile}</span>}
                            {pur.supplierInvoiceNo && (
                              <span>बिल #: <b className="font-mono">{pur.supplierInvoiceNo}</b></span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-800 font-medium">
                            {pur.items?.map(it => `${it.name} (${it.qty} ${it.unit || 'PCS'})`).join(', ')}
                          </div>
                          {pur.items?.some(it => it.serialNo) && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {pur.items.filter(it => it.serialNo).map((it, sIdx) => (
                                <span key={sIdx} className="text-[10px] bg-amber-50 text-amber-900 font-mono px-1 rounded border border-amber-200">
                                  S/N: {it.serialNo}
                                </span>
                              ))}
                            </div>
                          )}
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {pur.items?.length || 0} प्रकार के उत्पाद
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          ₹{Number(pur.totalTaxable || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-indigo-800">
                          ₹{Number(pur.totalGst || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-800">
                          {Number(pur.discount || 0) > 0 ? `-₹${Number(pur.discount).toFixed(2)}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-amber-950 text-sm">
                          ₹{Number(pur.grandTotal || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* On-Click Preview */}
                            <button
                              type="button"
                              onClick={() => setPreviewPurchase(pur)}
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                              title="खरीद वाउचर प्रीव्यू देखें"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* On-Click Print Single Purchase Report */}
                            <button
                              type="button"
                              onClick={() => triggerPrintPurchase(pur)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                              title="यह खरीद वाउचर तुरंत प्रिंट करें"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Edit Purchase in PURCHAGE tab */}
                            <button
                              type="button"
                              onClick={() => {
                                startEditingPurchase(pur);
                                setActiveTab('purchase');
                              }}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                              title="खरीद एडिट करें"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: FULL PURCHASE VOUCHER PREVIEW & PRINT */}
      {/* ========================================================================= */}
      {previewPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 relative animate-in zoom-in-95 duration-150 my-6">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 mb-4 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-900 font-mono font-bold text-xs px-2 py-0.5 rounded border border-amber-300">
                    #{previewPurchase.purchaseNo}
                  </span>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    खरीद वाउचर विवरण (Purchase Inward Voucher)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  सप्लायर: <strong className="text-slate-800">{previewPurchase.supplierName}</strong> {previewPurchase.supplierMobile && `(📞 ${previewPurchase.supplierMobile})`} • दिनांक: <strong className="text-slate-800">{previewPurchase.date}</strong>
                </p>
              </div>

              {/* Action Buttons: 1-Click Print & Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerPrintPurchase(previewPurchase)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  title="A4 साइज में वाउचर प्रिंट करें"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ वाउचर प्रिंट करें</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewPurchase(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Voucher Meta details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs mb-4">
              <div>
                <span className="text-slate-500 block text-[10px]">सप्लायर बिल #:</span>
                <span className="font-mono font-bold text-slate-800">{previewPurchase.supplierInvoiceNo || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">सप्लायर GSTIN:</span>
                <span className="font-mono font-bold text-slate-800 uppercase">{previewPurchase.supplierGstin || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">कुल आइटम प्रकार:</span>
                <span className="font-bold text-slate-800">{previewPurchase.items?.length || 0}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">अंतिम भुगतान राशि:</span>
                <span className="font-mono font-black text-amber-950 text-sm">₹{previewPurchase.grandTotal}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-xl mb-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-2 text-center w-8">#</th>
                    <th className="py-2.5 px-2 w-24">कोड</th>
                    <th className="py-2.5 px-3">आइटम का नाम / मॉडल</th>
                    <th className="py-2.5 px-2 text-center w-14">HSN</th>
                    <th className="py-2.5 px-2 text-right w-20">खरीद दर (₹)</th>
                    <th className="py-2.5 px-2 text-center w-16">मात्रा</th>
                    <th className="py-2.5 px-2 text-center w-14">GST %</th>
                    <th className="py-2.5 px-3 text-right w-24">कुल लागत (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewPurchase.items?.map((it, i) => {
                    const serials = parseSerials(it.serialNo);
                    return (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2 px-2 text-center font-bold text-slate-400">{i + 1}</td>
                        <td className="py-2 px-2 font-mono font-bold text-amber-900">{it.itemNo}</td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900">{it.name}</div>
                          {serials.length > 0 && (
                            <div className="text-[10px] font-mono text-indigo-900 mt-0.5">
                              IMEI/S.N.: <span className="font-semibold">{serials.join(', ')}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-500">{it.hsn || '-'}</td>
                        <td className="py-2 px-2 text-right font-mono text-slate-700">₹{it.costPrice}</td>
                        <td className="py-2 px-2 text-center font-bold text-slate-900">{it.qty} {it.unit || 'PCS'}</td>
                        <td className="py-2 px-2 text-center">{it.gstRate}%</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{it.total}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  {Number(previewPurchase.discount || 0) > 0 && (
                    <tr className="bg-slate-50 border-t border-slate-200 text-xs font-bold">
                      <td colSpan={6} className="py-2 px-3 text-right text-slate-600">
                        उप-कुल (Sub Total): ₹{Number(previewPurchase.subTotal || (Number(previewPurchase.totalTaxable || 0) + Number(previewPurchase.totalGst || 0))).toFixed(2)} | विशेष छूट:
                      </td>
                      <td colSpan={2} className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                        -₹{Number(previewPurchase.discount).toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-amber-100/70 font-black border-t border-amber-300 text-xs">
                    <td colSpan={6} className="py-2.5 px-3 text-right text-slate-800">
                      कुल कर योग्य: ₹{Number(previewPurchase.totalTaxable || 0).toFixed(2)} | कुल GST: ₹{Number(previewPurchase.totalGst || 0).toFixed(2)} | कुल देय:
                    </td>
                    <td colSpan={2} className="py-2.5 px-3 text-right font-mono font-black text-amber-950 text-sm">
                      ₹{previewPurchase.grandTotal}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setPreviewPurchase(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-xs cursor-pointer"
              >
                बंद करें (Close)
              </button>

              <button
                type="button"
                onClick={() => triggerPrintPurchase(previewPurchase)}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all text-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>वाउचर प्रिंट निकालें (Print Purchase Invoice)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: ADD / EDIT INVENTORY ITEM */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-indigo-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingItem ? 'आइटम विवरण अपडेट करें' : 'नया इन्वेंट्री आइटम जोड़ें'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    आइटम नंबर / कोड <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={itemForm.itemNo}
                    onChange={(e) => setItemForm({ ...itemForm, itemNo: e.target.value.toUpperCase() })}
                    placeholder="उदा. BAT-105"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase font-mono font-bold outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">कैटेगरी</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden bg-white"
                  >
                    <option value="Mobile">मोबाइल (Mobile Phone)</option>
                    <option value="Battery">बैटरी (Battery)</option>
                    <option value="Earphone">ईयरफोन (Earphone)</option>
                    <option value="Charger">चार्जर (Charger)</option>
                    <option value="Accessories">एसेसरीज / ग्लास / कवर</option>
                    <option value="Spare Parts">स्पेयर पार्ट्स</option>
                    <option value="Other">अन्य</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  सामान / मॉडल का नाम <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="उदा. Redmi Note 13 Pro 5G"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">खरीद लागत (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={itemForm.costPrice}
                    onChange={(e) => setItemForm({ ...itemForm, costPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    बिक्री मूल्य (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={itemForm.salePrice}
                    onChange={(e) => setItemForm({ ...itemForm, salePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-800 outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST %</label>
                  <select
                    value={itemForm.gstRate}
                    onChange={(e) => setItemForm({ ...itemForm, gstRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden bg-white"
                  >
                    {gstSlabs.map(slab => (
                      <option key={slab} value={slab}>{slab}%</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">प्रारंभिक स्टॉक मात्रा</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.stockQty}
                    onChange={(e) => setItemForm({ ...itemForm, stockQty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">इकाई (Unit)</label>
                  <select
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden bg-white"
                  >
                    <option value="PCS">PCS (पीस)</option>
                    <option value="BOX">BOX (बॉक्स)</option>
                    <option value="SET">SET (सेट)</option>
                    <option value="PKT">PKT (पैकेट)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">कम स्टॉक अलर्ट सीमा</label>
                  <input
                    type="number"
                    min="1"
                    value={itemForm.minAlertQty}
                    onChange={(e) => setItemForm({ ...itemForm, minAlertQty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex justify-between">
                  <span>सीरियल / IMEI / Key नंबर्स (वैकल्पिक)</span>
                  <span className="text-[11px] text-slate-400">कॉमा या नई लाइन से अलग करें</span>
                </label>
                <textarea
                  rows={3}
                  value={itemForm.serialNumbersText}
                  onChange={(e) => setItemForm({ ...itemForm, serialNumbersText: e.target.value.toUpperCase() })}
                  placeholder="उदा. 864920194820101, 864920194820102"
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono uppercase text-xs outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingItem ? 'अपडेट सुरक्षित करें' : 'इन्वेंट्री में सेव करें'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
