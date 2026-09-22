import React, { useState, useEffect } from 'react';
import { useBilling } from '../../context/BillingContext';
import { PlusCircle, X, Check, AlertTriangle, PackagePlus } from 'lucide-react';

export default function QuickPurchaseModal({ isOpen, onClose, initialItemNo = '', onStockAdded }) {
  const { quickAddStock, settings, validateSerial, parseSerials } = useBilling();
  const gstSlabs = settings?.gstSlabs || [0, 5, 12, 18, 28];

  const [formData, setFormData] = useState({
    itemNo: '',
    name: '',
    category: 'Mobile Accessories',
    hsn: '8517',
    costPrice: '',
    salePrice: '',
    gstRate: gstSlabs[0] || 18,
    qty: 1,
    supplierName: 'स्थानीय सप्लायर / Local Supplier',
    serialNo: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        itemNo: initialItemNo || '',
        name: '',
        costPrice: '',
        salePrice: '',
        gstRate: gstSlabs.includes(18) ? 18 : gstSlabs[0] || 18,
        qty: 1,
        serialNo: ''
      }));
      setError('');
    }
  }, [isOpen, initialItemNo, gstSlabs]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemNo.trim()) {
      setError('कृपया आइटम नंबर दर्ज करें।');
      return;
    }
    if (!formData.name.trim()) {
      setError('कृपया आइटम का नाम दर्ज करें।');
      return;
    }
    if (!formData.salePrice || Number(formData.salePrice) <= 0) {
      setError('कृपया वैध बिक्री मूल्य (Sale Price) दर्ज करें।');
      return;
    }
    if (!formData.qty || Number(formData.qty) <= 0) {
      setError('कृपया मात्रा (Quantity) दर्ज करें।');
      return;
    }

    // Validate Serials if entered
    if (formData.serialNo.trim()) {
      const enteredSerials = parseSerials(formData.serialNo);
      const seen = new Set();
      for (const s of enteredSerials) {
        if (seen.has(s)) {
          setError(`सीरियल / IMEI नंबर "${s}" दो बार दर्ज किया गया है! डुप्लीकेट अनुमति नहीं है।`);
          return;
        }
        seen.add(s);
        const valRes = validateSerial(s, { isPurchase: true });
        if (!valRes.valid) {
          setError(valRes.reason);
          return;
        }
      }
    }

    const addedItem = quickAddStock({
      itemNo: formData.itemNo.trim().toUpperCase(),
      name: formData.name.trim(),
      category: formData.category,
      hsn: formData.hsn.trim(),
      costPrice: Number(formData.costPrice) || (Number(formData.salePrice) * 0.8),
      salePrice: Number(formData.salePrice),
      gstRate: Number(formData.gstRate) || (gstSlabs[0] || 18),
      qty: Number(formData.qty) || 1,
      supplierName: formData.supplierName,
      serialNo: formData.serialNo.trim().toUpperCase()
    });

    if (onStockAdded) {
      onStockAdded(addedItem);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-6 h-6 text-amber-200" />
            <div>
              <h2 className="text-base font-bold">त्वरित खरीद एवं स्टॉक जोड़ें (Quick Stock Add)</h2>
              <p className="text-xs text-amber-100">
                बिना परचेज एंट्री वाले आइटम को तुरंत स्टॉक में जोड़कर बिल में लगाएं
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-2.5 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Item No */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                आइटम नंबर / कोड <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.itemNo}
                onChange={(e) => setFormData({ ...formData, itemNo: e.target.value.toUpperCase() })}
                placeholder="उदा. BAT-105, EAR-301"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-hidden"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">कैटेगरी</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  let defaultHsn = '8517';
                  if (cat === 'Battery') defaultHsn = '8506';
                  if (cat === 'Earphone') defaultHsn = '8518';
                  if (cat === 'Charger') defaultHsn = '8504';
                  if (cat === 'Accessories') defaultHsn = '3926';
                  setFormData({ ...formData, category: cat, hsn: defaultHsn });
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white"
              >
                <option value="Mobile">मोबाइल (Mobile Phone)</option>
                <option value="Battery">बैटरी (Battery)</option>
                <option value="Earphone">ईयरफोन / हेडफोन (Earphone)</option>
                <option value="Charger">चार्जर / एडॉप्टर (Charger)</option>
                <option value="Accessories">एसेसरीज / ग्लास / कवर</option>
                <option value="Spare Parts">स्पेयर पार्ट्स (Parts)</option>
                <option value="Other">अन्य (Other)</option>
              </select>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              आइटम / मॉडल का नाम <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="उदा. OnePlus Bullets Z2 ANC या Oppo A59 5G"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Cost Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                खरीद मूल्य (Cost ₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                placeholder="₹ 0"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            {/* Sale Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                बिक्री मूल्य (Sale ₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                placeholder="₹ 0"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden"
                required
              />
            </div>

            {/* GST Rate */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GST दर (%)</label>
              <select
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white font-bold"
              >
                {gstSlabs.map((rate) => (
                  <option key={rate} value={rate}>{rate}%</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                खरीद मात्रा (Qty) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-hidden"
                required
              />
            </div>

            {/* HSN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">HSN कोड</label>
              <input
                type="text"
                value={formData.hsn}
                onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                placeholder="8517"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>
          </div>

          {/* Supplier Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">सप्लायर विवरण</label>
            <input
              type="text"
              value={formData.supplierName}
              onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              placeholder="सप्लायर का नाम या लोकल खरीद"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden text-slate-700"
            />
          </div>

          {/* Serial / IMEI Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                सीरियल / IMEI / Key नं. <span className="text-slate-400 font-normal">(वैकल्पिक)</span>
              </label>
              <span className="text-[10px] text-amber-700 font-medium">डुप्लीकेट स्वतः ब्लॉक होगा</span>
            </div>
            <input
              type="text"
              value={formData.serialNo}
              onChange={(e) => setFormData({ ...formData, serialNo: e.target.value.toUpperCase() })}
              placeholder="उदा. 864920194820199 (एक से अधिक होने पर अल्पविराम ',' लगाएं)"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-amber-500 outline-hidden text-slate-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>स्टॉक जोड़ें व बिल में लगाएं (Save & Insert)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
