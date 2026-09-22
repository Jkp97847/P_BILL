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
  IndianRupee, 
  Eye,
  TrendingUp,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function ReportTab() {
  const {
    bills,
    settings,
    deleteBill,
    startEditingBill,
    triggerPrint,
    exportData,
    importData
  } = useBilling();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [printModalBill, setPrintModalBill] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalBillsCount = bills.length;
    const totalAmount = bills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);

    const todayBills = bills.filter(b => b.date === todayStr);
    const todayAmount = todayBills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);

    return {
      totalBillsCount,
      totalAmount,
      todayCount: todayBills.length,
      todayAmount
    };
  }, [bills]);

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (bill.billNo && bill.billNo.toLowerCase().includes(q)) ||
        (bill.customerName && bill.customerName.toLowerCase().includes(q)) ||
        (bill.customerMobile && bill.customerMobile.includes(q)) ||
        (bill.items && bill.items.some(it => it.name && it.name.toLowerCase().includes(q)));

      const matchDate = !selectedDateFilter || bill.date === selectedDateFilter;

      return matchSearch && matchDate;
    });
  }, [bills, searchTerm, selectedDateFilter]);

  // Handle re-print
  const handleRePrint = (bill) => {
    triggerPrint(bill);
  };

  // Open Preview Modal
  const handleOpenPreviewModal = (bill) => {
    setPrintModalBill(bill);
  };

  // Handle delete
  const confirmDelete = (id) => {
    deleteBill(id);
    setDeleteConfirmId(null);
    setNotification('बिल सफलतापूर्वक हटा दिया गया!');
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle JSON backup import
  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const res = importData(json);
        if (res.success) {
          setNotification('डेटा बैकअप सफलतापूर्वक रिस्टोर हो गया!');
        } else {
          alert('फ़ाइल पढ़ने में त्रुटि: ' + res.error);
        }
      } catch (err) {
        alert('अमान्य JSON फ़ाइल: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bills */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">कुल जारी बिल</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.totalBillsCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Total Turnover */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">कुल बिक्री (Turnover)</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">
              ₹{stats.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Bills */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">आज के बिल</p>
            <p className="text-2xl font-extrabold text-blue-900 mt-1">
              {stats.todayCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">आज की कुल बिक्री</p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">
              ₹{stats.todayAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Search, Filter and Backup Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ग्राहक नाम, मोबाइल या बिल नं. खोजें..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Date Filter */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">तारीख:</span>
          <input
            type="date"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
          />
          {selectedDateFilter && (
            <button
              onClick={() => setSelectedDateFilter('')}
              className="text-xs text-rose-600 hover:underline cursor-pointer"
            >
              साफ करें
            </button>
          )}
        </div>

        {/* Data Backup buttons */}
        <div className="w-full md:w-auto flex items-center gap-2 justify-end">
          <button
            onClick={exportData}
            title="सभी बिलों का बैकअप डाउनलोड करें"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>बैकअप एक्सपोर्ट</span>
          </button>

          <label
            title="पुराना बैकअप रिस्टोर करें"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>बैकअप आयात (Import)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 3. Bills Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>📋 पिछले सभी बिलों का विवरण</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredBills.length} रिकॉर्ड्स
            </span>
          </h3>
        </div>

        {filteredBills.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">कोई बिल नहीं मिला</p>
            <p className="text-xs text-slate-400 mt-1">
              नया बिल बनाने के लिए 'बिल बनाएं' टैब पर जाएं।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-4">बिल नं.</th>
                  <th className="py-3 px-4">दिनांक</th>
                  <th className="py-3 px-4">ग्राहक का नाम</th>
                  <th className="py-3 px-4">मोबाइल नं.</th>
                  <th className="py-3 px-4 text-center">कुल सामान</th>
                  <th className="py-3 px-4 text-right">फाइनल राशि (₹)</th>
                  <th className="py-3 px-4 text-center">एक्शन (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Bill No */}
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {bill.billNo}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-600 text-xs font-medium">
                      {bill.date}
                    </td>

                    {/* Customer Name */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {bill.customerName || 'नकद ग्राहक'}
                    </td>

                    {/* Customer Mobile */}
                    <td className="py-3 px-4 font-mono text-slate-600 text-xs">
                      {bill.customerMobile || '—'}
                    </td>

                    {/* Items count */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                        {bill.items ? bill.items.length : 0} आइटम
                      </span>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-700 text-base">
                      ₹{Number(bill.grandTotal || 0).toFixed(2)}
                    </td>

                    {/* Actions: Re-Print, Preview, Edit, Delete */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Instant Re-Print Button */}
                        <button
                          onClick={() => handleRePrint(bill)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-xs flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                          title="तुरंत दोबारा प्रिंट निकालें (Re-Print)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>प्रिंट</span>
                        </button>

                        {/* View Preview Button */}
                        <button
                          onClick={() => handleOpenPreviewModal(bill)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                          title="बिल का प्रीव्यू देखें"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => startEditingBill(bill)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-bold text-xs flex items-center gap-1 transition-colors border border-blue-200 cursor-pointer"
                          title="बिल में संशोधन करें (Edit)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>एडिट</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmId(bill.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="हटाएं (Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900">क्या आप इस बिल को हटाना चाहते हैं?</h4>
              <p className="text-xs text-slate-500 mt-1">
                यह बिल हमेशा के लिए हट जाएगा और इसे वापस नहीं लाया जा सकेगा।
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer"
              >
                हाँ, हटाएं (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-Print Preview Modal */}
      {printModalBill && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-100 rounded-2xl max-w-4xl w-full p-4 md:p-6 my-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-300 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600" />
                  <span>बिल प्रीव्यू व प्रिंट (Invoice #{printModalBill.billNo})</span>
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerPrint(printModalBill)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>प्रिंट विंडो खोलें</span>
                </button>
                <button
                  onClick={() => setPrintModalBill(null)}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Render Bill Paper inside Screen Modal */}
            <div className="bg-white p-2 rounded-xl shadow-inner max-h-[75vh] overflow-y-auto">
              <PrintableBill bill={printModalBill} settings={settings} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
