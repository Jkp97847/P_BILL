import React, { useState, useMemo } from 'react';
import { useRecharge } from '../../context/RechargeContext';
import { 
  FileText, 
  Search, 
  Download, 
  Upload,
  Trash2, 
  Printer, 
  Calendar, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Layers,
  AlertCircle,
  CheckCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit3,
  Lock
} from 'lucide-react';
import { isDateInFinancialYear, getCurrentFinancialYear } from '../../../utils/financialYear';

export default function RechargeReportTab() {
  const { 
    transactions, 
    deleteTransaction, 
    printSlip,
    exportUserData,
    importUserData,
    startEditingTransaction
  } = useRecharge();

  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | 'month' | 'fy'
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const currentFY = getCurrentFinancialYear();

  // Filter transactions
  const filteredList = useMemo(() => {
    return (transactions || []).filter(t => {
      if (!t) return false;

      // 1. Service Filter
      if (serviceFilter !== 'all' && t.serviceType !== serviceFilter) return false;

      // 2. Date Filter
      if (t.billDate) {
        if (fromDate && t.billDate < fromDate) return false;
        if (toDate && t.billDate > toDate) return false;

        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (dateFilter === 'today' && t.billDate !== todayStr) return false;
        if (dateFilter === 'yesterday' && t.billDate !== yesterdayStr) return false;
        if (dateFilter === 'month') {
          const currentMonth = todayStr.slice(0, 7);
          if (!t.billDate.startsWith(currentMonth)) return false;
        }
        if (dateFilter === 'fy') {
          if (!isDateInFinancialYear(t.billDate, currentFY.startYear)) return false;
        }
      }

      // 3. Search Term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchId = String(t.id || '').toLowerCase().includes(q);
        const matchName = String(t.customerName || '').toLowerCase().includes(q);
        const matchNo = String(t.consumerNo || '').toLowerCase().includes(q);
        const matchOp = String(t.operatorName || '').toLowerCase().includes(q);
        const matchSub = String(t.subDivision || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchNo && !matchOp && !matchSub) return false;
      }

      return true;
    });
  }, [transactions, serviceFilter, dateFilter, fromDate, toDate, searchTerm, currentFY]);

  // Column Title Sorting (Ascending / Descending)
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 inline ml-1" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-blue-600 inline ml-1 font-black" />
      : <ArrowDown className="w-3.5 h-3.5 text-blue-600 inline ml-1 font-black" />;
  };

  const sortedList = useMemo(() => {
    const list = [...filteredList];
    list.sort((a, b) => {
      let aVal = '';
      let bVal = '';
      switch (sortField) {
        case 'date':
          aVal = a.billDate || '';
          bVal = b.billDate || '';
          break;
        case 'id':
          aVal = a.id || '';
          bVal = b.id || '';
          break;
        case 'service':
          aVal = `${a.serviceType || ''} ${a.operatorName || ''}`.toLowerCase();
          bVal = `${b.serviceType || ''} ${b.operatorName || ''}`.toLowerCase();
          break;
        case 'customer':
          aVal = (a.customerName || a.consumerNo || '').toLowerCase();
          bVal = (b.customerName || b.consumerNo || '').toLowerCase();
          break;
        case 'billAmount':
          aVal = parseFloat(a.billAmount) || 0;
          bVal = parseFloat(b.billAmount) || 0;
          break;
        case 'conveFee':
          aVal = parseFloat(a.conveFee) || 0;
          bVal = parseFloat(b.conveFee) || 0;
          break;
        case 'totalAmount':
          aVal = parseFloat(a.totalAmount) || ((parseFloat(a.billAmount) || 0) + (parseFloat(a.conveFee) || 0));
          bVal = parseFloat(b.totalAmount) || ((parseFloat(b.billAmount) || 0) + (parseFloat(b.conveFee) || 0));
          break;
        default:
          aVal = a.billDate || '';
          bVal = b.billDate || '';
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredList, sortField, sortDirection]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalBills = filteredList.length;
    let totalBillAmt = 0;
    let totalFee = 0;
    let totalPaid = 0;

    filteredList.forEach(t => {
      totalBillAmt += parseFloat(t.billAmount) || 0;
      totalFee += parseFloat(t.conveFee) || 0;
      totalPaid += parseFloat(t.totalAmount) || (parseFloat(t.billAmount) || 0) + (parseFloat(t.conveFee) || 0);
    });

    return { totalBills, totalBillAmt, totalFee, totalPaid };
  }, [filteredList]);

  // Export CSV
  const exportToCSV = () => {
    if (sortedList.length === 0) {
      alert('डाउनलोड हेतु कोई रिकॉर्ड उपलब्ध नहीं है!');
      return;
    }

    const headers = ['Sl No', 'Date', 'Receipt ID', 'Service', 'Operator', 'Consumer / Mobile / Policy', 'Customer Name', 'Bill Amount', 'Convenience Fee', 'Total Paid', 'Sub Division / Notes'];
    const rows = sortedList.map((t, idx) => [
      idx + 1,
      t.billDate || '',
      t.id || '',
      t.serviceType || '',
      `"${(t.operatorName || '').replace(/"/g, '""')}"`,
      `"${t.consumerNo || ''}"`,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      parseFloat(t.billAmount || 0).toFixed(2),
      parseFloat(t.conveFee || 0).toFixed(2),
      parseFloat(t.totalAmount || 0).toFixed(2),
      `"${(t.subDivision || t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recharge_utility_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    try {
      exportUserData();
      setNotification({
        type: 'success',
        message: 'रिचार्ज एवं बिल डेटा बैकअप (.json) सफलतापूर्वक डाउनलोड हो गया!'
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'बैकअप डाउनलोड में त्रुटि: ' + err.message
      });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // Import JSON Backup
  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const res = importUserData(json);
        if (res.success) {
          setNotification({
            type: 'success',
            message: res.message || 'रिचार्ज डेटा बैकअप सफलतापूर्वक रीस्टोर हो गया!'
          });
        } else {
          setNotification({
            type: 'error',
            message: res.message || 'फ़ाइल पढ़ने में त्रुटि!'
          });
        }
      } catch (err) {
        setNotification({
          type: 'error',
          message: 'अमान्य JSON फ़ाइल: ' + err.message
        });
      }
      setTimeout(() => setNotification(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto">
      {/* Notification Banner */}
      {notification && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-md transition-all ${
          notification.type === 'error'
            ? 'bg-rose-50 text-rose-800 border border-rose-300'
            : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
        }`}>
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      {/* 1. Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Bills */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">कुल जारी रसीदें</div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{metrics.totalBills}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">सफल भुगतान रसीदें</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Bill Amount */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">मूल बिल वॉल्यूम</div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">₹{metrics.totalBillAmt.toFixed(2)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">शुद्ध कंपनी बिल राशि</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Fee Profit */}
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-emerald-800 uppercase tracking-wider">कुल सुविधा शुल्क आय (Profit)</div>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">+ ₹{metrics.totalFee.toFixed(2)}</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">दुकानदार कमीशन / लाभ</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">कुल प्राप्त राशि (Grand Total)</div>
            <div className="text-2xl font-black text-blue-900 mt-1 font-mono">₹{metrics.totalPaid.toFixed(2)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">ग्राहकों से कुल नकद / ऑनलाइन</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="नाम, K-नंबर, मोबाइल, पॉलिसी नं. या रसीद ID से खोजें..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Right: Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">सभी सेवाएं (All Services)</option>
            <option value="electricity">⚡ बिजली बिल (Electricity)</option>
            <option value="mobile">📱 मोबाइल रिचार्ज (Mobile)</option>
            <option value="landline">☎️ लैंडलाइन व ब्रॉडबैंड</option>
            <option value="insurance">🛡️ बीमा प्रीमियम (Insurance)</option>
          </select>

          {/* Quick Date Presets */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">सभी दिनांक (All Time)</option>
            <option value="today">आज (Today)</option>
            <option value="yesterday">कल (Yesterday)</option>
            <option value="month">इस महीने (This Month)</option>
            <option value="fy">वित्तीय वर्ष ({currentFY.hindiLabel || currentFY.label})</option>
          </select>

          {/* From Date and To Date Range Pickers */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">दिनांक से:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-xs bg-transparent text-slate-800 outline-none cursor-pointer font-medium"
              title="प्रारंभिक दिनांक (From Date) चुनें"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">तक:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-xs bg-transparent text-slate-800 outline-none cursor-pointer font-medium"
              title="अंतिम दिनांक (To Date) चुनें"
            />
          </div>

          {/* Reset Filters button */}
          {(fromDate || toDate || dateFilter !== 'all' || serviceFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setFromDate('');
                setToDate('');
                setDateFilter('all');
                setServiceFilter('all');
              }}
              className="text-xs text-rose-600 hover:bg-rose-50 font-bold px-2.5 py-1.5 rounded-xl border border-rose-200 transition-colors cursor-pointer"
              title="सभी फ़िल्टर हटाएं"
            >
              ✕ हटाएं
            </button>
          )}

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportToCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="एक्सेल / CSV रिपोर्ट डाउनलोड करें"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>CSV डाउनलोड</span>
          </button>

          {/* Export JSON Backup */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="सभी रिचार्ज रसीदों एवं सेटिंग्स का सुरक्षित JSON बैकअप डाउनलोड करें"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>डेटा बैकअप (Export JSON)</span>
          </button>

          {/* Import JSON Backup */}
          <label
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="पुरानी बैकअप JSON फ़ाइल से डेटा रीस्टोर करें"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
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

      {/* 3. Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider select-none">
                <th className="py-3 px-4 w-12 text-center">क्र.</th>
                <th 
                  onClick={() => handleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="दिनांक व ID अनुसार क्रमबद्ध करें"
                >
                  <span className="flex items-center gap-1">
                    <span>दिनांक व ID</span>
                    {renderSortIcon('date')}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('service')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="सेवा / ऑपरेटर अनुसार क्रमबद्ध करें"
                >
                  <span className="flex items-center gap-1">
                    <span>सेवा / ऑपरेटर</span>
                    {renderSortIcon('service')}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('customer')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="उपभोक्ता विवरण अनुसार क्रमबद्ध करें"
                >
                  <span className="flex items-center gap-1">
                    <span>उपभोक्ता विवरण</span>
                    {renderSortIcon('customer')}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('billAmount')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                  title="मूल बिल अनुसार क्रमबद्ध करें"
                >
                  <span className="flex items-center justify-end gap-1">
                    <span>मूल बिल</span>
                    {renderSortIcon('billAmount')}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('conveFee')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                  title="सुविधा शुल्क अनुसार क्रमबद्ध करें"
                >
                  <span className="flex items-center justify-end gap-1">
                    <span>सुविधा शुल्क</span>
                    {renderSortIcon('conveFee')}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('totalAmount')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                  title="कुल भुगतान अनुसार क्रमबद्ध करें"
                >
                  <span className="flex items-center justify-end gap-1">
                    <span>कुल भुगतान</span>
                    {renderSortIcon('totalAmount')}
                  </span>
                </th>
                <th className="py-3 px-4 text-center">एक्शन</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-slate-500">कोई रिकॉर्ड नहीं मिला</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">नया बिल जनरेट करने पर यहाँ सूची दिखेगी।</p>
                  </td>
                </tr>
              ) : (
                sortedList.map((t, index) => {
                  const billAmt = parseFloat(t.billAmount) || 0;
                  const feeAmt = parseFloat(t.conveFee) || 0;
                  const totAmt = parseFloat(t.totalAmount) || (billAmt + feeAmt);
                  const isLatest = transactions[0]?.id && t.id === transactions[0]?.id;

                  return (
                    <tr key={t.id || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-500 font-mono">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{t.billDate}</span>
                          {isLatest && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black bg-blue-100 text-blue-800 rounded border border-blue-300">
                              अंतिम रसीद
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">{t.id}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {t.operatorLogo && (
                            <img 
                              src={t.operatorLogo} 
                              alt="" 
                              className="w-5 h-5 object-contain rounded bg-white p-0.5 border border-slate-200 shrink-0" 
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{t.operatorName}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{t.serviceType}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.customerName || 'उपभोक्ता'}</div>
                        <div className="font-mono text-[11px] text-blue-900 font-bold">{t.consumerNo}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                        ₹{billAmt.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-600">
                        + ₹{feeAmt.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-blue-950 text-sm">
                        ₹{totAmt.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => printSlip(t)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer"
                            title="रसीद प्रिंट करें"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button - Allowed anytime anywhere */}
                          <button
                            type="button"
                            onClick={() => startEditingTransaction(t)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors cursor-pointer"
                            title="रसीद संपादित करें (Edit Receipt)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button - Stack Order (Latest Only) */}
                          {isLatest ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`⚠️ क्या आप वाकई अंतिम रसीद #${t.id} को हटाना चाहते हैं?`)) {
                                  try {
                                    deleteTransaction(t.id);
                                    setNotification({
                                      type: 'success',
                                      message: `रसीद #${t.id} सफलतापूर्वक हटाई गई!`
                                    });
                                    setTimeout(() => setNotification(null), 3000);
                                  } catch (err) {
                                    setNotification({
                                      type: 'error',
                                      message: err.message
                                    });
                                    setTimeout(() => setNotification(null), 5000);
                                  }
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                              title="अंतिम रसीद हटाएं (Delete Latest Receipt)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="p-1.5 bg-slate-100 text-slate-300 rounded-lg cursor-not-allowed border border-slate-200"
                              title="⚠️ केवल सबसे अंतिम रसीद ही हटाई जा सकती है! स्टैक ऑर्डर के कारण बीच की रसीद हटाना प्रतिबंधित है।"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}
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
  );
}
