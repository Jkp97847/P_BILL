import React, { useState, useMemo } from 'react';
import { useRecharge } from '../../context/RechargeContext';
import { 
  FileText, 
  Search, 
  Download, 
  Trash2, 
  Printer, 
  Calendar, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Layers 
} from 'lucide-react';
import { isDateInFinancialYear, getCurrentFinancialYear } from '../../../utils/financialYear';

export default function RechargeReportTab() {
  const { transactions, deleteTransaction, clearAllTransactions, printSlip } = useRecharge();

  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | 'month' | 'fy'
  const currentFY = getCurrentFinancialYear();

  // Filter transactions
  const filteredList = useMemo(() => {
    return transactions.filter(t => {
      // 1. Service Filter
      if (serviceFilter !== 'all' && t.serviceType !== serviceFilter) return false;

      // 2. Date Filter
      if (t.billDate) {
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
        const matchId = t.id && t.id.toLowerCase().includes(q);
        const matchName = t.customerName && t.customerName.toLowerCase().includes(q);
        const matchNo = t.consumerNo && t.consumerNo.toLowerCase().includes(q);
        const matchOp = t.operatorName && t.operatorName.toLowerCase().includes(q);
        const matchSub = t.subDivision && t.subDivision.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchNo && !matchOp && !matchSub) return false;
      }

      return true;
    });
  }, [transactions, serviceFilter, dateFilter, searchTerm, currentFY]);

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
    if (filteredList.length === 0) {
      alert('डाउनलोड हेतु कोई रिकॉर्ड उपलब्ध नहीं है!');
      return;
    }

    const headers = ['Sl No', 'Date', 'Receipt ID', 'Service', 'Operator', 'Consumer / Mobile / Policy', 'Customer Name', 'Bill Amount', 'Convenience Fee', 'Total Paid', 'Sub Division / Notes'];
    const rows = filteredList.map((t, idx) => [
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

  const handleClearAll = () => {
    if (transactions.length === 0) return;
    if (window.confirm('⚠️ क्या आप वाकई सभी रिचार्ज व बिल रिकॉर्ड हटाना चाहते हैं?')) {
      clearAllTransactions();
    }
  };

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto">
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

          {/* Date Filter */}
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

          {/* Clear All */}
          {transactions.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="सभी रिकॉर्ड साफ करें"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>हटाएं</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">क्र.</th>
                <th className="py-3 px-4">दिनांक व ID</th>
                <th className="py-3 px-4">सेवा / ऑपरेटर</th>
                <th className="py-3 px-4">उपभोक्ता विवरण</th>
                <th className="py-3 px-4 text-right">मूल बिल</th>
                <th className="py-3 px-4 text-right">सुविधा शुल्क</th>
                <th className="py-3 px-4 text-right">कुल भुगतान</th>
                <th className="py-3 px-4 text-center">एक्शन</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-slate-500">कोई रिकॉर्ड नहीं मिला</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">नया बिल जनरेट करने पर यहाँ सूची दिखेगी।</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((t, index) => {
                  const billAmt = parseFloat(t.billAmount) || 0;
                  const feeAmt = parseFloat(t.conveFee) || 0;
                  const totAmt = parseFloat(t.totalAmount) || (billAmt + feeAmt);

                  return (
                    <tr key={t.id || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-500 font-mono">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.billDate}</div>
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

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`रसीद #${t.id} हटाना चाहते हैं?`)) {
                                deleteTransaction(t.id);
                              }
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="हटाएं"
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
  );
}
