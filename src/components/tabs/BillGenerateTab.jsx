import React, { useState, useEffect } from 'react';
import { useBilling } from '../../context/BillingContext';
import PrintableBill from '../PrintableBill';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  FileText,
  User,
  Phone,
  Calendar,
  Hash
} from 'lucide-react';

export default function BillGenerateTab() {
  const {
    settings,
    saveBill,
    generateNextBillNo,
    editingBill,
    cancelEditing,
    triggerPrint,
    setActivePrintBill
  } = useBilling();

  // Form State
  const [billNo, setBillNo] = useState('');
  const [date, setDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [items, setItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState(null);

  // Initialize or populate when editingBill changes
  useEffect(() => {
    if (editingBill) {
      setBillNo(editingBill.billNo);
      setDate(editingBill.date || new Date().toISOString().split('T')[0]);
      setCustomerName(editingBill.customerName || '');
      setCustomerMobile(editingBill.customerMobile || '');
      setItems(
        editingBill.items && editingBill.items.length > 0
          ? editingBill.items
          : [{ id: '1', name: '', qty: 1, price: '', total: 0 }]
      );
    } else {
      resetForm();
    }
  }, [editingBill, settings.billPrefix, settings.nextBillSeq]);

  const resetForm = () => {
    setBillNo(generateNextBillNo());
    setDate(new Date().toISOString().split('T')[0]);
    setCustomerName('');
    setCustomerMobile('');
    setItems([
      { id: 'item-1', name: '', qty: 1, price: '', total: 0 },
      { id: 'item-2', name: '', qty: 1, price: '', total: 0 }
    ]);
  };

  // Handle Item Row changes
  const handleItemChange = (id, field, value) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        const qty = parseFloat(field === 'qty' ? value : updated.qty) || 0;
        const price = parseFloat(field === 'price' ? value : updated.price) || 0;
        updated.total = Math.round(qty * price * 100) / 100;
        return updated;
      })
    );
  };

  // Add Item Row
  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      { id: `item-${Date.now()}`, name: '', qty: 1, price: '', total: 0 }
    ]);
  };

  // Remove Item Row
  const removeItemRow = (id) => {
    if (items.length <= 1) {
      setItems([{ id: `item-${Date.now()}`, name: '', qty: 1, price: '', total: 0 }]);
      return;
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculations
  const grandTotal = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

  // Validate and Prepare bill object
  const prepareBillData = () => {
    const validItems = items.filter(
      item => item.name.trim() !== '' || Number(item.total) > 0
    );

    if (validItems.length === 0) {
      setNotification({
        type: 'error',
        message: 'कृपया कम से कम एक आइटम का नाम और कीमत दर्ज करें।'
      });
      setTimeout(() => setNotification(null), 4000);
      return null;
    }

    return {
      ...(editingBill ? { id: editingBill.id } : {}),
      billNo: billNo || generateNextBillNo(),
      date: date || new Date().toISOString().split('T')[0],
      customerName: customerName.trim().toUpperCase() || 'नकद ग्राहक',
      customerMobile: customerMobile.trim(),
      items: validItems.map(it => ({
        ...it,
        name: typeof it.name === 'string' ? it.name.toUpperCase() : it.name
      })),
      subtotal: grandTotal,
      discount: 0,
      grandTotal: grandTotal
    };
  };

  // Save Bill handler
  const handleSave = (shouldPrint = false) => {
    const billData = prepareBillData();
    if (!billData) return;

    const saved = saveBill(billData);

    setNotification({
      type: 'success',
      message: editingBill
        ? `बिल ${saved.billNo} सफलतापूर्वक अपडेट कर दिया गया!`
        : `बिल ${saved.billNo} सफलतापूर्वक सेव कर लिया गया!`
    });

    if (shouldPrint) {
      triggerPrint(saved);
    }

    if (!editingBill) {
      resetForm();
    }

    setTimeout(() => setNotification(null), 4000);
  };

  const currentBillForPreview = {
    id: editingBill ? editingBill.id : 'preview-id',
    billNo: billNo || generateNextBillNo(),
    date: date || new Date().toISOString().split('T')[0],
    customerName: customerName.trim() || 'नकद ग्राहक (Cash Customer)',
    customerMobile: customerMobile.trim(),
    items: items.map((it, idx) => ({
      ...it,
      name: it.name || `आइटम ${idx + 1}`,
      total: it.total || 0
    })),
    grandTotal: grandTotal
  };

  useEffect(() => {
    setActivePrintBill(currentBillForPreview);
  }, [billNo, date, customerName, customerMobile, items]);

  return (
    <div className="space-y-6">
      {/* Alert / Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between shadow-sm transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-rose-50 text-rose-800 border border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs px-2 py-1 hover:bg-black/5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Editing Notice if in edit mode */}
      {editingBill && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-700 font-bold text-lg">✏️</span>
            <div>
              <p className="font-bold text-amber-900">
                बिल सं. {editingBill.billNo} को संपादित (Edit) किया जा रहा है
              </p>
              <p className="text-xs text-amber-700">
                बदलाव करने के बाद "अपडेट और सेव करें" दबाएं या रद्द करने के लिए Cancel दबाएं।
              </p>
            </div>
          </div>
          <button
            onClick={cancelEditing}
            className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded font-medium text-xs transition-colors"
          >
            एडिट रद्द करें (Cancel)
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              <span>{editingBill ? 'बिल अपडेट करें (Edit Bill)' : 'नया बिल बनाएं (Generate Bill)'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ग्राहक विवरण और सामान दर्ज करें, राशि व बिल लेआउट स्वतः तैयार होगा।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                showPreview 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview ? 'प्रीव्यू छिपाएं' : 'लाइव बिल प्रीव्यू देखें'}</span>
            </button>

            <button
              onClick={resetForm}
              className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1.5 transition-colors"
              title="फॉर्म साफ करके नया बिल शुरू करें"
            >
              <RotateCcw className="w-4 h-4" />
              <span>नया बिल (Reset)</span>
            </button>
          </div>
        </div>

        {/* Customer & Bill Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Bill No (Auto-generated) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-indigo-500" />
              <span>बिल नंबर (S.No / Auto):</span>
            </label>
            <input
              type="text"
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              className="w-full font-mono font-bold text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="INV-1001"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>दिनांक (Date):</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>ग्राहक का नाम (Customer Name):</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="उदा. रमेश कुमार"
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Mobile No */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-indigo-500" />
              <span>मोबाइल नंबर (Mobile No):</span>
            </label>
            <input
              type="tel"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              placeholder="10 अंकों का मोबाइल नंबर"
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Item Entry Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
            <span>📦 सामान / आइटम्स की सूची (Items Table)</span>
            <span className="text-xs font-normal text-slate-500">
              ({items.length} आइटम जोड़े गए)
            </span>
          </h3>

          <button
            onClick={addItemRow}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors border border-indigo-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>नया आइटम जोड़ें (Add Item)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-xs font-bold text-slate-700">
                <th className="py-2.5 px-3 w-12 text-center">क्र.सं.</th>
                <th className="py-2.5 px-3">सामान का नाम (Item Name)</th>
                <th className="py-2.5 px-3 w-28 text-center">मात्रा (Qty)</th>
                <th className="py-2.5 px-3 w-36 text-right">दर / कीमत (Unit Price ₹)</th>
                <th className="py-2.5 px-3 w-36 text-right">कुल कीमत (Total ₹)</th>
                <th className="py-2.5 px-3 w-14 text-center">हटाएं</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Serial Number */}
                  <td className="py-2 px-3 text-center font-bold text-slate-500 text-xs">
                    {index + 1}
                  </td>

                  {/* Item Name */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      placeholder={`आइटम या सर्विस का नाम दर्ज करें`}
                      className="w-full text-sm bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </td>

                  {/* Quantity */}
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={item.qty}
                      onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                      className="w-full text-center text-sm font-semibold bg-white border border-slate-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </td>

                  {/* Unit Price */}
                  <td className="py-2 px-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                        placeholder="0.00"
                        className="w-full text-right font-mono text-sm pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </td>

                  {/* Total Price (Auto-calc) */}
                  <td className="py-2 px-3 text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm px-2 py-1.5 bg-slate-50 rounded border border-slate-200">
                      ₹{Number(item.total || 0).toFixed(2)}
                    </div>
                  </td>

                  {/* Delete button */}
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeItemRow(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors cursor-pointer"
                      title="इस लाइन को हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={addItemRow}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ और आइटम जोड़ें</span>
          </button>

          {/* Grand Total Summary */}
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 mr-2">
              कुल योग राशि (Final Amount):
            </span>
            <span className="font-mono font-extrabold text-xl text-emerald-700">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => handleSave(false)}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{editingBill ? 'अपडेट सेव करें (Save Update)' : 'सिर्फ सेव करें (Save Bill)'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleSave(true)}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{editingBill ? 'अपडेट करें व प्रिंट निकालें' : 'सेव करें और प्रिंट निकालें (Save & Print)'}</span>
        </button>
      </div>

      {/* Live Bill Preview on Screen (Visible when toggled) */}
      {showPreview && (
        <div className="bg-slate-200/90 p-5 rounded-2xl border-2 border-dashed border-slate-300 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>📄 वर्तमान बिल का लाइव प्रिंट प्रीव्यू (Live Print Preview):</span>
            </h3>
            <button
              type="button"
              onClick={() => triggerPrint(currentBillForPreview)}
              className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>तुरंत प्रिंट करें</span>
            </button>
          </div>

          <div className="bg-white p-2 rounded-xl shadow-lg overflow-x-auto">
            <PrintableBill bill={currentBillForPreview} settings={settings} />
          </div>
        </div>
      )}
    </div>
  );
}
