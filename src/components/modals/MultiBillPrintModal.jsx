import React, { useState } from 'react';
import { 
  Printer, 
  Copy, 
  CheckSquare, 
  Square, 
  FileText, 
  X, 
  Layers, 
  Check, 
  AlertCircle 
} from 'lucide-react';

/**
 * MultiBillPrintModal - Universal Multi-Copy and Multi-Bill Bulk Print Modal
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - bill: single bill object (for single bill multi-copy mode)
 * - bills: array of bill objects (for bulk multi-bill mode)
 * - isPurchase: boolean (adjusts labels for purchase vouchers)
 * - onPrintCopies: function(bill, selectedCopiesArray)
 * - onPrintBulk: function(selectedBillsArray, copiesPerBill, selectedCopiesArray)
 */
export default function MultiBillPrintModal({
  isOpen,
  onClose,
  bill = null,
  bills = [],
  isPurchase = false,
  onPrintCopies,
  onPrintBulk
}) {
  if (!isOpen) return null;

  const isBulkMode = Array.isArray(bills) && bills.length > 0;
  
  // Single Bill: Checkboxes for copies (1: Original, 2: Duplicate, 3: Triplicate, 4: Office Copy)
  const [selectedCopies, setSelectedCopies] = useState([1, 2]);

  // Bulk Mode: Selection of which bills from the array, and how many copies each
  const [selectedBillIds, setSelectedBillIds] = useState(() => 
    isBulkMode ? bills.map(b => b.id || b.billNo || b.purchaseNo) : []
  );
  const [copiesPerBill, setCopiesPerBill] = useState(1);
  const [bulkSelectedCopyTypes, setBulkSelectedCopyTypes] = useState([1]);

  const GST_COPY_DEFINITIONS = [
    { id: 1, title: 'मूल प्रति / ORIGINAL', desc: isPurchase ? 'सप्लायर / मूल खरीद प्रति' : 'क्रेता / ग्राहक प्रति (Original for Recipient)' },
    { id: 2, title: 'द्वितीय प्रति / DUPLICATE', desc: isPurchase ? 'स्टोर एवं गोदाम प्रति (Store & Warehouse)' : 'ट्रांसपोर्टर / विक्रेता प्रति (Duplicate for Transporter)' },
    { id: 3, title: 'तृतीय प्रति / TRIPLICATE', desc: isPurchase ? 'लेखा एवं ऑडिट प्रति (Accounts & Audit)' : 'आपूर्तिकर्ता / लेखा प्रति (Triplicate for Supplier)' },
    { id: 4, title: 'कार्यालय प्रति / EXTRA COPY', desc: 'दुकान / कार्यालय रिकॉर्ड प्रति (Office / Record Copy)' }
  ];

  const toggleCopy = (id) => {
    setSelectedCopies(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one copy
        return prev.filter(c => c !== id).sort();
      } else {
        return [...prev, id].sort();
      }
    });
  };

  const setPreset = (num) => {
    if (num === 1) setSelectedCopies([1]);
    else if (num === 2) setSelectedCopies([1, 2]);
    else if (num === 3) setSelectedCopies([1, 2, 3]);
    else if (num === 4) setSelectedCopies([1, 2, 3, 4]);
  };

  const toggleBillInBulk = (id) => {
    setSelectedBillIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllBills = () => {
    if (selectedBillIds.length === bills.length) {
      setSelectedBillIds([]);
    } else {
      setSelectedBillIds(bills.map(b => b.id || b.billNo || b.purchaseNo));
    }
  };

  const handlePrintSubmit = () => {
    if (isBulkMode) {
      const activeBills = bills.filter(b => selectedBillIds.includes(b.id || b.billNo || b.purchaseNo));
      if (activeBills.length === 0) return;
      if (onPrintBulk) {
        onPrintBulk(activeBills, copiesPerBill, bulkSelectedCopyTypes);
      }
    } else if (bill) {
      if (onPrintCopies) {
        onPrintCopies(bill, selectedCopies);
      }
    }
    onClose();
  };

  const targetBill = bill || (bills && bills[0]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shadow-inner">
              <Printer className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>{isBulkMode ? 'मल्टी बिल थोक प्रिंट (Bulk Print)' : 'मल्टी कॉपी बिल प्रिंट (Multi-Copy Print)'}</span>
                <span className="text-[10px] font-bold bg-indigo-500/50 text-indigo-100 px-2 py-0.5 rounded-full border border-indigo-400/30 uppercase">
                  {isPurchase ? 'Purchase Voucher' : 'Tax Invoice'}
                </span>
              </h3>
              <p className="text-xs text-indigo-100/90 font-medium">
                {isBulkMode 
                  ? 'चयनित बिलों को एक साथ क्रमबद्ध A4 प्रिंट निकालें' 
                  : 'एक ही क्लिक में मूल, द्वितीय व तृतीय प्रतियां प्रिंट करें'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Mode 1: Single Bill Multi-Copy Mode */}
          {!isBulkMode && targetBill && (
            <div className="space-y-4">
              {/* Bill Details Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">
                    {isPurchase ? 'खरीद वाउचर नंबर' : 'इनवॉइस नंबर (Invoice No)'}
                  </span>
                  <span className="font-mono font-black text-sm text-indigo-900">
                    {targetBill.billNo || targetBill.purchaseNo || 'INV-DRAFT'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">
                    {isPurchase ? 'सप्लायर / फर्म' : 'ग्राहक का नाम (Customer)'}
                  </span>
                  <span className="font-bold text-slate-800">
                    {targetBill.customerName || targetBill.supplierName || 'ग्राहक'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">दिनांक (Date)</span>
                  <span className="font-medium text-slate-700">{targetBill.date || '-'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-bold block">कुल राशि (Amount)</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    ₹{Number(targetBill.grandTotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  त्वरित प्रति चयन (Quick Presets):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreset(1)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedCopies.length === 1 && selectedCopies.includes(1)
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs ring-1 ring-indigo-400'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>1 प्रति (मूल प्रति)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset(2)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedCopies.length === 2 && selectedCopies.includes(1) && selectedCopies.includes(2)
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs ring-1 ring-indigo-400'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>2 प्रतियां (मूल + द्वितीय)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset(3)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedCopies.length === 3
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs ring-1 ring-indigo-400'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>3 प्रतियां (सभी 3)</span>
                  </button>
                </div>
              </div>

              {/* Copy Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  कौन-कौन सी प्रतियां प्रिंट करनी हैं (Select Copies to Print):
                </label>
                <div className="space-y-2">
                  {GST_COPY_DEFINITIONS.map(item => {
                    const isChecked = selectedCopies.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleCopy(item.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked 
                            ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-300' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {item.desc}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isChecked ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          पेज #{selectedCopies.indexOf(item.id) + 1 || '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Print Summary Info */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-900">
                <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  कुल <strong>{selectedCopies.length}</strong> प्रतियां अलग-अलग A4 पेज पर स्वतः प्रिंट होंगी (प्रत्येक प्रति पर उसका आधिकारिक शीर्षक अंकित रहेगा)।
                </span>
              </div>
            </div>
          )}

          {/* Mode 2: Bulk Multi-Bill Mode */}
          {isBulkMode && (
            <div className="space-y-4">
              {/* Selection Overview Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] font-bold block">कुल चयनित बिल:</span>
                  <span className="font-black text-lg text-indigo-900">
                    {selectedBillIds.length} <span className="text-xs font-normal text-slate-500">/ {bills.length} बिल</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAllBills}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors text-xs cursor-pointer"
                  >
                    {selectedBillIds.length === bills.length ? 'सभी हटाएं (Deselect All)' : 'सभी चुनें (Select All)'}
                  </button>
                </div>
              </div>

              {/* Copies per bill selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  प्रत्येक बिल की कितनी प्रतियां निकालनी हैं (Copies per Bill):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setCopiesPerBill(1); setBulkSelectedCopyTypes([1]); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                      copiesPerBill === 1
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs ring-1 ring-indigo-400'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>1 प्रति / बिल</span>
                    <span className="text-[10px] font-normal text-slate-500">केवल मूल प्रति (Original)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCopiesPerBill(2); setBulkSelectedCopyTypes([1, 2]); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                      copiesPerBill === 2
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs ring-1 ring-indigo-400'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>2 प्रतियां / बिल</span>
                    <span className="text-[10px] font-normal text-slate-500">मूल + द्वितीय प्रति</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCopiesPerBill(3); setBulkSelectedCopyTypes([1, 2, 3]); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                      copiesPerBill === 3
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs ring-1 ring-indigo-400'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>3 प्रतियां / बिल</span>
                    <span className="text-[10px] font-normal text-slate-500">मूल + द्वितीय + तृतीय</span>
                  </button>
                </div>
              </div>

              {/* Scrollable list of selected bills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  प्रिंट होने वाले बिलों की सूची (Click to exclude any bill):
                </label>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {bills.map((bItem, idx) => {
                    const bKey = bItem.id || bItem.billNo || bItem.purchaseNo;
                    const isSelected = selectedBillIds.includes(bKey);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleBillInBulk(bKey)}
                        className={`p-2.5 flex items-center justify-between transition-colors cursor-pointer select-none ${
                          isSelected ? 'bg-white hover:bg-slate-50' : 'bg-slate-100 text-slate-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${
                            isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-900 mr-2">
                              {bItem.billNo || bItem.purchaseNo}
                            </span>
                            <span className="font-semibold text-slate-700">
                              {bItem.customerName || bItem.supplierName || 'अज्ञात'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <span className="text-[11px] text-slate-500">{bItem.date}</span>
                          <span className="font-mono font-black text-slate-900">
                            ₹{Number(bItem.grandTotal || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Sheet Info */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-950 font-bold">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>कुल प्रिंट शीट / A4 पेज:</span>
                </div>
                <span className="font-mono text-base font-black text-indigo-700">
                  {selectedBillIds.length * copiesPerBill} पेज
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            रद्द करें (Cancel)
          </button>

          <button
            type="button"
            onClick={handlePrintSubmit}
            disabled={isBulkMode ? selectedBillIds.length === 0 : selectedCopies.length === 0}
            className={`px-5 py-2.5 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              (isBulkMode ? selectedBillIds.length === 0 : selectedCopies.length === 0)
                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>
              {isBulkMode 
                ? `सभी ${selectedBillIds.length} बिल प्रिंट निकालें (${selectedBillIds.length * copiesPerBill} पेज)` 
                : `प्रिंट निकालें (${selectedCopies.length} प्रतियां)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
