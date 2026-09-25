import React, { useState, useMemo } from 'react';
import { useBilling } from '../../context/BillingContext';
import PrintableBill from '../PrintableBill';
import { 
  Search, 
  Printer, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  FileText, 
  Calendar, 
  Eye, 
  TrendingUp, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Receipt,
  Truck,
  Layers,
  ArrowUpDown
} from 'lucide-react';

import { 
  getAvailableFinancialYears, 
  getCurrentFinancialYear, 
  isDateInFinancialYear 
} from '../../utils/financialYear';

export default function ReportTab() {
  const {
    gstBills,
    purchases,
    settings,
    deleteSaleBill,
    startEditingBill,
    deletePurchase,
    startEditingPurchase,
    triggerPrint,
    triggerPrintReport,
    triggerPrintPurchase,
    exportData,
    importData
  } = useBilling();

  // Active Report View: 'sales' | 'purchases'
  const [reportType, setReportType] = useState('sales');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  
  // Financial Year Filter State ('ALL' | e.g. '2026' for FY 2026-27: 1 Apr 2026 - 31 Mar 2027)
  const currentFY = useMemo(() => getCurrentFinancialYear(), []);
  const [selectedFY, setSelectedFY] = useState('ALL');

  const [previewBill, setPreviewBill] = useState(null);
  const [previewPurchase, setPreviewPurchase] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'bill' | 'purchase', id: string, label: string }
  const [notification, setNotification] = useState(null);

  // Available Financial Years calculated dynamically from bill and purchase dates
  const allDates = useMemo(() => {
    const bDates = (gstBills || []).map(b => b.date).filter(Boolean);
    const pDates = (purchases || []).map(p => p.date).filter(Boolean);
    return [...bDates, ...pDates];
  }, [gstBills, purchases]);

  const availableFYs = useMemo(() => {
    return getAvailableFinancialYears(allDates);
  }, [allDates]);

  // Sales Statistics
  const salesStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalCount = gstBills.length;
    const totalRevenue = gstBills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
    const totalGst = gstBills.reduce((sum, b) => sum + Number(b.totalGst || 0), 0);
    const todayBills = gstBills.filter(b => b.date === todayStr);
    const todayRevenue = todayBills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);

    return {
      totalCount,
      totalRevenue,
      totalGst,
      todayCount: todayBills.length,
      todayRevenue
    };
  }, [gstBills]);

  // Purchases Statistics
  const purchaseStats = useMemo(() => {
    const totalCount = purchases.length;
    const totalCost = purchases.reduce((sum, p) => sum + Number(p.grandTotal || 0), 0);
    const totalGst = purchases.reduce((sum, p) => sum + Number(p.totalGst || 0), 0);

    return {
      totalCount,
      totalCost,
      totalGst
    };
  }, [purchases]);

  // Filtered Sales Bills
  const filteredBills = useMemo(() => {
    return gstBills.filter(bill => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (bill.billNo && bill.billNo.toLowerCase().includes(q)) ||
        (bill.customerName && bill.customerName.toLowerCase().includes(q)) ||
        (bill.customerMobile && bill.customerMobile.includes(q)) ||
        (bill.items && bill.items.some(it => 
          (it.name && it.name.toLowerCase().includes(q)) ||
          (it.itemNo && it.itemNo.toLowerCase().includes(q)) ||
          (it.serialNo && it.serialNo.toLowerCase().includes(q))
        ));

      const matchDate = !selectedDateFilter || bill.date === selectedDateFilter;
      const matchFY = !selectedFY || selectedFY === 'ALL' || isDateInFinancialYear(bill.date, selectedFY);

      return matchSearch && matchDate && matchFY;
    });
  }, [gstBills, searchTerm, selectedDateFilter, selectedFY]);

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter(pur => {
      const q = searchTerm.toLowerCase().trim();
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

      const matchDate = !selectedDateFilter || pur.date === selectedDateFilter;
      const matchFY = !selectedFY || selectedFY === 'ALL' || isDateInFinancialYear(pur.date, selectedFY);

      return matchSearch && matchDate && matchFY;
    });
  }, [purchases, searchTerm, selectedDateFilter, selectedFY]);

  // Active Filtered Stats (Reflects Financial Year or Single Date Selection)
  const activeStats = useMemo(() => {
    if (reportType === 'sales') {
      const totalCount = filteredBills.length;
      const totalRevenue = filteredBills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
      const totalGst = filteredBills.reduce((sum, b) => sum + Number(b.totalGst || 0), 0);
      return { totalCount, totalRevenue, totalGst };
    } else {
      const totalCount = filteredPurchases.length;
      const totalCost = filteredPurchases.reduce((sum, p) => sum + Number(p.grandTotal || 0), 0);
      const totalGst = filteredPurchases.reduce((sum, p) => sum + Number(p.totalGst || 0), 0);
      return { totalCount, totalCost, totalGst };
    }
  }, [reportType, filteredBills, filteredPurchases]);

  // Helper to get active period label for print
  const getActiveFilterLabel = () => {
    if (selectedDateFilter) {
      return `दिनांक: ${selectedDateFilter}`;
    }
    if (selectedFY && selectedFY !== 'ALL') {
      const fyObj = availableFYs.find(f => f.key === selectedFY);
      return fyObj ? fyObj.displayTitle : `वित्तीय वर्ष: ${selectedFY}`;
    }
    return 'समस्त वित्तीय वर्ष एवं रिकॉर्ड (All Records)';
  };

  // Print current filtered list
  const handlePrintCurrentReport = () => {
    const items = reportType === 'sales' ? filteredBills : filteredPurchases;
    const stats = reportType === 'sales' ? salesStats : purchaseStats;
    triggerPrintReport({
      reportType,
      items,
      filterDate: getActiveFilterLabel(),
      searchTerm,
      stats,
      isYearly: selectedFY !== 'ALL'
    });
  };

  // Print full Yearly Report for specific or selected FY (1 April to 31 March)
  const handlePrintYearlyReport = (fyStartYear = selectedFY !== 'ALL' ? selectedFY : currentFY.key) => {
    const fyObj = availableFYs.find(f => f.key === String(fyStartYear)) || currentFY;
    const sourceItems = reportType === 'sales' ? gstBills : purchases;
    const fyItems = sourceItems.filter(it => isDateInFinancialYear(it.date, fyObj.startYear));

    triggerPrintReport({
      reportType,
      items: fyItems,
      filterDate: fyObj.displayTitle,
      searchTerm: '',
      isYearly: true
    });
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'bill') {
      deleteSaleBill(deleteConfirm.id);
      setNotification(`बिल ${deleteConfirm.label} हटा दिया गया और बेचा गया स्टॉक इन्वेंट्री में वापस जुड़ गया!`);
    } else if (deleteConfirm.type === 'purchase') {
      deletePurchase(deleteConfirm.id);
      setNotification(`खरीद वाउचर ${deleteConfirm.label} हटा दिया गया और खरीदा गया स्टॉक इन्वेंट्री से घटा दिया गया!`);
    }

    setDeleteConfirm(null);
    setTimeout(() => setNotification(null), 4000);
  };

  // Import Handler
  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const res = importData(json);
        if (res.success) {
          setNotification('बैकअप सफलतापूर्वक लोड हो गया!');
        } else {
          setNotification('डेटा लोड करने में त्रुटि: ' + res.error);
        }
      } catch {
        setNotification('अमान्य JSON फ़ाइल प्रारूप!');
      }
      setTimeout(() => setNotification(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* 1. Notification */}
      {notification && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl flex items-center gap-2 shadow-md">
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold text-sm">{notification}</span>
        </div>
      )}

      {/* 2. Top Header & Backup Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-xs border border-slate-200 gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            रिपोर्ट एवं हिस्ट्री (Sales & Purchase Reports)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            सभी पुराने जीएसटी सेल बिल एवं खरीद प्रविष्टियां देखें, सर्च करें, एडिट करें या प्रिंट करें
          </p>
        </div>

        {/* Data Backup Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
            title="पूरा डेटा कंप्यूटर में बैकअप डाउनलोड करें"
          >
            <Download className="w-4 h-4" />
            <span>डेटा बैकअप (Export JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>बैकअप लोड (Import)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 3. Sub-Tabs: Sales Report vs Purchase Report */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => { setReportType('sales'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            reportType === 'sales'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>GST बिक्री रिपोर्ट (Sales Bills: {gstBills.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setReportType('purchases'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            reportType === 'purchases'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>खरीद रिपोर्ट (Purchase Invoices: {purchases.length})</span>
        </button>
      </div>

      {/* 4. Statistics Cards */}
      {reportType === 'sales' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">कुल जीएसटी बिल</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{salesStats.totalCount}</span>
            <span className="text-[11px] text-indigo-600 font-medium">आज के बिल: {salesStats.todayCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">कुल बिक्री राजस्व</span>
            <span className="text-2xl font-black text-emerald-900 mt-1 block">
              ₹{salesStats.totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-500">सभी बिलों का कुल योग</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">एकत्रित GST (कर)</span>
            <span className="text-2xl font-black text-indigo-900 mt-1 block">
              ₹{Math.round(salesStats.totalGst).toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-500">CGST + SGST</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">आज की बिक्री (Today's Sale)</span>
            <span className="text-2xl font-black text-amber-900 mt-1 block">
              ₹{salesStats.todayRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-500">आज की तारीख का कुल योग</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">कुल खरीद प्रविष्टियां</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{purchaseStats.totalCount}</span>
            <span className="text-[11px] text-amber-700 font-medium">सप्लायर वाउचर्स</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">कुल माल खरीद मूल्य (Cost)</span>
            <span className="text-2xl font-black text-amber-900 mt-1 block">
              ₹{purchaseStats.totalCost.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-500">स्टॉक में आया कुल माल</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">इनपुट GST क्रेडिट (Tax)</span>
            <span className="text-2xl font-black text-indigo-900 mt-1 block">
              ₹{Math.round(purchaseStats.totalGst).toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-500">सप्लायर को चुकाया गया कर</span>
          </div>
        </div>
      )}

      {/* 5. Search, Financial Year & Date Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              reportType === 'sales'
                ? 'बिल नं, ग्राहक नाम, मोबाइल, आइटम...'
                : 'वाउचर नं, सप्लायर नाम, आइटम...'
            }
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filters Group: Financial Year (April - March) + Single Date */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Financial Year Filter (April to March) */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-indigo-950 shrink-0">वित्तीय वर्ष:</span>
            <select
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer pr-1"
              title="वित्तीय वर्ष (1 अप्रैल से 31 मार्च) अनुसार फ़िल्टर करें"
            >
              <option value="ALL">सभी वित्तीय वर्ष (All Years)</option>
              {availableFYs.map(fy => (
                <option key={fy.key} value={fy.key}>
                  {fy.hindiLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Single Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-lg">
            <span className="text-xs font-bold text-slate-600 shrink-0">तारीख:</span>
            <input
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="text-xs text-slate-800 outline-none bg-transparent cursor-pointer"
              title="विशिष्ट दिन का रिकॉर्ड देखें"
            />
          </div>

          {/* Reset Filters */}
          {(selectedDateFilter || selectedFY !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSelectedDateFilter('');
                setSelectedFY('ALL');
              }}
              className="text-xs text-rose-600 font-bold px-2 py-1 hover:bg-rose-50 rounded border border-rose-200 transition-colors cursor-pointer"
              title="सभी फ़िल्टर हटाएं"
            >
              ✕ हटाएं
            </button>
          )}
        </div>

        {/* Print Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Yearly Report Print (April - March) */}
          <button
            type="button"
            onClick={() => handlePrintYearlyReport(selectedFY !== 'ALL' ? selectedFY : currentFY.key)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-black rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
            title="चयनित वित्तीय वर्ष (1 अप्रैल से 31 मार्च) की वार्षिक रिपोर्ट A4 साइज में प्रिंट करें"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ वार्षिक रिपोर्ट प्रिंट (April-March)</span>
          </button>

          {/* 2. Full Current List Print */}
          <button
            type="button"
            onClick={handlePrintCurrentReport}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap ${
              reportType === 'sales' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-600 hover:bg-amber-700'
            }`}
            title="वर्तमान स्क्रीन पर प्रदर्शित सूची को A4 प्रिंट प्रारूप में निकालें"
          >
            <Printer className="w-4 h-4" />
            <span>वर्तमान लिस्ट प्रिंट ({reportType === 'sales' ? filteredBills.length : filteredPurchases.length})</span>
          </button>
        </div>
      </div>

      {/* Active Financial Year Banner Info */}
      {selectedFY !== 'ALL' && (
        <div className="bg-gradient-to-r from-indigo-50 via-indigo-100/70 to-emerald-50 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-indigo-950 block">
                {availableFYs.find(f => f.key === selectedFY)?.displayTitle || `वित्तीय वर्ष ${selectedFY}`}
              </span>
              <span className="text-[11px] text-slate-600">
                1 अप्रैल से 31 मार्च तक का वार्षिक ऑडिट व टैक्स इनवॉइस डेटा फ़िल्टर किया गया है
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1 rounded-lg border border-indigo-200 font-bold text-slate-800">
              कुल प्रविष्टियां: <span className="text-indigo-600 font-black">{reportType === 'sales' ? filteredBills.length : filteredPurchases.length}</span>
            </div>
            <div className="bg-white px-3 py-1 rounded-lg border border-emerald-200 font-bold text-slate-800">
              कुल राशि: <span className="text-emerald-700 font-black">₹{Math.round(activeStats.totalRevenue || activeStats.totalCost || 0).toLocaleString('en-IN')}</span>
            </div>
            <button
              type="button"
              onClick={() => handlePrintYearlyReport(selectedFY)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>यह वार्षिक रिपोर्ट प्रिंट करें</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. TABLE: SALES OR PURCHASES */}
      {reportType === 'sales' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3 w-32">इनवॉइस नंबर</th>
                  <th className="py-3 px-3 w-24">दिनांक</th>
                  <th className="py-3 px-4">ग्राहक विवरण (Buyer)</th>
                  <th className="py-3 px-3">आइटम्स / विवरण</th>
                  <th className="py-3 px-3 w-24 text-right">टैक्सेबल (₹)</th>
                  <th className="py-3 px-3 w-20 text-right">GST (₹)</th>
                  <th className="py-3 px-4 w-28 text-right">कुल बिल (₹)</th>
                  <th className="py-3 px-4 w-36 text-center">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      कोई जीएसटी बिल रिकॉर्ड नहीं मिला।
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill, index) => (
                    <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-900">
                        {bill.billNo}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {bill.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{bill.customerName}</div>
                        {bill.customerMobile && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            📞 {bill.customerMobile}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">
                          {bill.items?.map(it => it.name).join(', ')}
                        </div>
                        {bill.items?.some(it => it.serialNo) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bill.items.filter(it => it.serialNo).map((it, sIdx) => (
                              <span key={sIdx} className="text-[10px] bg-indigo-50 text-indigo-800 font-mono px-1 rounded border border-indigo-100">
                                S/N: {it.serialNo}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {bill.items?.length || 0} आइटम्स • थीम: {bill.theme || 'classic'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ₹{Number(bill.taxableTotal || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-indigo-800">
                        ₹{Number(bill.totalGst || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm">
                        ₹{Number(bill.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Preview */}
                          <button
                            type="button"
                            onClick={() => setPreviewBill(bill)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                            title="बिल देखें (Preview)"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Print */}
                          <button
                            type="button"
                            onClick={() => triggerPrint(bill)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                            title="प्रिंट निकालें (Print)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => startEditingBill(bill)}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                            title="एडिट करें (Edit)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ type: 'bill', id: bill.id, label: bill.billNo })}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="डिलीट करें (Delete & Restore Stock)"
                          >
                            <Trash2 className="w-4 h-4" />
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
      ) : (
        /* Purchases Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3 w-32">खरीद वाउचर सं.</th>
                  <th className="py-3 px-3 w-24">दिनांक</th>
                  <th className="py-3 px-4">सप्लायर / डिस्ट्रीब्यूटर</th>
                  <th className="py-3 px-3">खरीदे गए सामान</th>
                  <th className="py-3 px-3 w-24 text-right">टैक्सेबल (₹)</th>
                  <th className="py-3 px-3 w-20 text-right">GST (₹)</th>
                  <th className="py-3 px-4 w-28 text-right">कुल लागत (₹)</th>
                  <th className="py-3 px-4 w-28 text-center">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      कोई खरीद रिकॉर्ड नहीं मिला।
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((pur, index) => (
                    <tr key={pur.id} className="hover:bg-slate-50/80 transition-colors">
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
                        {pur.supplierInvoiceNo && (
                          <div className="text-[10px] text-slate-500">
                            बिल सं: <span className="font-mono">{pur.supplierInvoiceNo}</span>
                          </div>
                        )}
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
                          {pur.items?.length || 0} प्रकार के आइटम्स
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ₹{Number(pur.totalTaxable || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-indigo-800">
                        ₹{Number(pur.totalGst || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-amber-950 text-sm">
                        ₹{Number(pur.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => setPreviewPurchase(pur)}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                            title="खरीद विवरण प्रीव्यू देखें"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Print Single Purchase */}
                          <button
                            type="button"
                            onClick={() => triggerPrintPurchase(pur)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            title="खरीद वाउचर सीधे प्रिंट करें"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => startEditingPurchase(pur)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                            title="खरीद एडिट करें"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ type: 'purchase', id: pur.id, label: pur.purchaseNo })}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="खरीद हटाएं (स्टॉक कम होगा)"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* 7. Modal: Sale Bill Preview & Print */}
      {previewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-4 my-8 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                जीएसटी बिल प्रीव्यू: {previewBill.billNo}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerPrint(previewBill)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>प्रिंट करें</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBill(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[75vh]">
              <PrintableBill bill={previewBill} settings={settings} />
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal: Purchase Details Preview */}
      {previewPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>खरीद वाउचर विवरण:</span>
                  <span className="font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded">{previewPurchase.purchaseNo}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  सप्लायर: <b>{previewPurchase.supplierName}</b> {previewPurchase.supplierMobile && `(📞 ${previewPurchase.supplierMobile})`} • दिनांक: {previewPurchase.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerPrintPurchase(previewPurchase)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>वाउचर प्रिंट करें</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPurchase(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-amber-50 text-amber-900 font-bold border-b border-amber-200">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-2">कोड</th>
                    <th className="py-2 px-3">आइटम का नाम</th>
                    <th className="py-2 px-2 text-right">खरीद दर</th>
                    <th className="py-2 px-2 text-center">मात्रा</th>
                    <th className="py-2 px-2 text-center">GST %</th>
                    <th className="py-2 px-3 text-right">कुल लागत</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewPurchase.items?.map((it, i) => (
                    <tr key={i}>
                      <td className="py-2 px-2 text-slate-400">{i + 1}</td>
                      <td className="py-2 px-2 font-mono font-bold text-amber-900">{it.itemNo}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{it.name}</td>
                      <td className="py-2 px-2 text-right font-mono">₹{it.costPrice}</td>
                      <td className="py-2 px-2 text-center font-bold">{it.qty} {it.unit || 'PCS'}</td>
                      <td className="py-2 px-2 text-center">{it.gstRate}%</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">₹{it.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td colSpan={6} className="py-2 px-3 text-right">कुल लागत (Grand Total):</td>
                    <td className="py-2 px-3 text-right font-mono font-black text-amber-950 text-sm">
                      ₹{previewPurchase.grandTotal}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: Confirmation for Delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {deleteConfirm.type === 'bill' ? 'जीएसटी बिल डिलीट करें?' : 'खरीद प्रविष्टि डिलीट करें?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {deleteConfirm.type === 'bill'
                  ? `बिल #${deleteConfirm.label} हटाने पर इसमें बेचे गए सभी आइटम्स का स्टॉक इन्वेंट्री में अपने-आप वापस जुड़ जाएगा।`
                  : `खरीद वाउचर #${deleteConfirm.label} हटाने पर इसमें खरीदा गया स्टॉक इन्वेंट्री से अपने-आप कम हो जाएगा।`}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
              >
                हां, हटाएं (Delete & Adjust Stock)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
