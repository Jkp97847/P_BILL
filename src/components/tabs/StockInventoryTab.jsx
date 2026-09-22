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
  Printer
} from 'lucide-react';

export default function StockInventoryTab() {
  const { 
    inventory, 
    saveInventoryItem, 
    deleteInventoryItem, 
    settings, 
    triggerPrintStock, 
    parseSerials, 
    validateSerial 
  } = useBilling();
  const gstSlabs = settings?.gstSlabs || [0, 5, 12, 18, 28];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, LOW, OUT
  const [editingItem, setEditingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form State for Add / Edit
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

  // Calculate stats
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

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(inventory.map(it => it.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [inventory]);

  // Filtered Items
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
      alert('कृपया आइटम नंबर, नाम और बिक्री मूल्य अनिवार्य रूप से भरें।');
      return;
    }

    let parsedSerials = [];
    if (itemForm.serialNumbersText && itemForm.serialNumbersText.trim()) {
      parsedSerials = parseSerials(itemForm.serialNumbersText);
      const seen = new Set();
      for (const s of parsedSerials) {
        if (seen.has(s)) {
          alert(`सीरियल / IMEI "${s}" दो बार लिखा गया है!`);
          return;
        }
        seen.add(s);
        const valRes = validateSerial(s, { isPurchase: false });
        if (!valRes.valid) {
          const wasInSelf = editingItem?.serialNumbers?.some(es => es.toUpperCase() === s.toUpperCase());
          if (!wasInSelf) {
            alert(`त्रुटि: ${valRes.reason}`);
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

    setNotification(editingItem ? 'आइटम सफलतापूर्वक अपडेट हुआ!' : 'नया आइटम इन्वेंट्री में जुड़ गया!');
    setTimeout(() => setNotification(null), 3500);
    setIsAddModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`क्या आप सचमुच '${name}' को इन्वेंट्री से हटाना चाहते हैं?`)) {
      deleteInventoryItem(id);
      setNotification('आइटम हटा दिया गया।');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Notification */}
      {notification && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">{notification}</span>
        </div>
      )}

      {/* 2. Top Banner & Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">कुल आइटम</span>
            <Boxes className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats.totalItems}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">कुल मात्रा: {stats.totalQuantity} PCS</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">स्टॉक खरीद मूल्य (Cost)</span>
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

      {/* 3. Search, Filters & Action Bar */}
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

      {/* 4. Inventory Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
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
                <th className="py-3 px-3 w-24 text-center">कार्रवाई</th>
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
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="एडिट करें"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="डिलीट करें"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* 5. Add / Edit Modal */}
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
                className="text-white/80 hover:text-white p-1 rounded"
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
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg outline-hidden bg-white font-bold"
                  >
                    {gstSlabs.map(rate => (
                      <option key={rate} value={rate}>{rate}%</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">मौजूदा स्टॉक मात्रा</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.stockQty}
                    onChange={(e) => setItemForm({ ...itemForm, stockQty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">कम स्टॉक चेतावनी (&le;)</label>
                  <input
                    type="number"
                    min="1"
                    value={itemForm.minAlertQty}
                    onChange={(e) => setItemForm({ ...itemForm, minAlertQty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">HSN कोड</label>
                  <input
                    type="text"
                    value={itemForm.hsn}
                    onChange={(e) => setItemForm({ ...itemForm, hsn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                  />
                </div>
              </div>

              {/* Serial / IMEI Numbers */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    सीरियल / IMEI / Key नंबर <span className="text-slate-400 font-normal">(वैकल्पिक)</span>
                  </label>
                  <span className="text-[11px] text-indigo-700 font-medium">अल्पविराम (,) से अलग करें</span>
                </div>
                <textarea
                  rows={2}
                  value={itemForm.serialNumbersText}
                  onChange={(e) => setItemForm({ ...itemForm, serialNumbersText: e.target.value.toUpperCase() })}
                  placeholder="उदा. 864920194820101, 864920194820102"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono uppercase outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingItem ? 'अपडेट करें' : 'इन्वेंट्री में जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
