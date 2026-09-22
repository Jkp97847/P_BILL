import React from 'react';
import { numberToHindiWords } from '../../utils/numberToWords';

export default function PrintableStockRegister({
  items = [],
  stats = {},
  selectedCategory = 'ALL',
  stockFilter = 'ALL',
  searchTerm = '',
  settings = {}
}) {
  const now = new Date();
  const printTimestamp = `${now.toLocaleDateString('hi-IN')} ${now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}`;

  const totalItems = items.length;
  const totalQty = items.reduce((sum, it) => sum + (Number(it.stockQty) || 0), 0);
  const totalCostVal = items.reduce((sum, it) => sum + ((Number(it.costPrice) || 0) * (Number(it.stockQty) || 0)), 0);
  const totalSaleVal = items.reduce((sum, it) => sum + ((Number(it.salePrice) || 0) * (Number(it.stockQty) || 0)), 0);

  return (
    <div id="printable-stock-container" className="p-4 bg-white text-slate-900 font-sans text-xs">
      {/* 1. SHOP HEADER */}
      <div className="border-b-2 border-slate-900 pb-3 mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-slate-950 uppercase tracking-wide">
              {settings.shopName || 'मोबाइल एवं इलेक्ट्रॉनिक्स शॉप'}
            </h1>
            {settings.tagline && (
              <p className="text-[11px] font-semibold text-slate-600 italic mt-0.5">{settings.tagline}</p>
            )}
            <p className="text-[11px] text-slate-700 mt-1">
              📍 {settings.address || 'स्टेशन रोड, मुख्य बाजार'}, {settings.city || 'जयपुर'}, {settings.state || 'राजस्थान'}
            </p>
            <p className="text-[11px] text-slate-700">
              📞 फोन: <span className="font-bold">{settings.phone || '9876543210'}</span>
              {settings.email && ` | ✉️ ${settings.email}`}
            </p>
          </div>
          <div className="text-right">
            <div className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
              GSTIN: {settings.gstin || '08ABCDE1234F1Z5'}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-mono">
              प्रिंट समय: {printTimestamp}
            </p>
          </div>
        </div>
      </div>

      {/* 2. REGISTER TITLE & FILTERS */}
      <div className="bg-slate-100 p-2.5 rounded border border-slate-300 mb-3 flex flex-wrap justify-between items-center">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase">
            📦 पूर्ण स्टॉक इन्वेंट्री एवं मूल्यांकन रजिस्टर (Full Stock Inventory Register)
          </h2>
          <div className="text-[10px] text-slate-600 mt-0.5 flex flex-wrap gap-3">
            <span>
              <strong>श्रेणी (Category):</strong> {selectedCategory === 'ALL' ? 'सभी श्रेणियां (All)' : selectedCategory}
            </span>
            <span>
              <strong>स्टॉक स्थिति:</strong> {stockFilter === 'LOW' ? 'कम स्टॉक (Low)' : stockFilter === 'OUT' ? 'आउट ऑफ स्टॉक' : 'सभी उपलब्ध स्टॉक'}
            </span>
            {searchTerm && (
              <span>
                <strong>खोज फ़िल्टर:</strong> "{searchTerm}"
              </span>
            )}
          </div>
        </div>
        <div className="text-right text-xs">
          <span className="font-bold text-slate-700">कुल उत्पाद प्रकार: </span>
          <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
            {totalItems}
          </span>
        </div>
      </div>

      {/* 3. SUMMARY HIGHLIGHT METRICS */}
      <div className="grid grid-cols-4 gap-2 mb-3 text-center">
        <div className="border border-slate-300 rounded p-1.5 bg-slate-50">
          <span className="text-[10px] text-slate-500 block font-bold">कुल उत्पाद प्रकार</span>
          <span className="text-sm font-black text-slate-900">{totalItems}</span>
        </div>
        <div className="border border-slate-300 rounded p-1.5 bg-slate-50">
          <span className="text-[10px] text-slate-500 block font-bold">कुल स्टॉक मात्रा</span>
          <span className="text-sm font-black text-slate-900 font-mono">{totalQty} PCS</span>
        </div>
        <div className="border border-slate-300 rounded p-1.5 bg-slate-50">
          <span className="text-[10px] text-slate-500 block font-bold">कुल खरीद लागत मूल्य</span>
          <span className="text-sm font-black text-indigo-900 font-mono">₹{Math.round(totalCostVal).toLocaleString('en-IN')}</span>
        </div>
        <div className="border border-slate-300 rounded p-1.5 bg-slate-50">
          <span className="text-[10px] text-slate-500 block font-bold">कुल बिक्री मूल्यांकन</span>
          <span className="text-sm font-black text-emerald-900 font-mono">₹{Math.round(totalSaleVal).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* 4. FULL STOCK TABLE */}
      <table className="w-full border-collapse border border-slate-400 text-[10px] mb-4">
        <thead>
          <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-400">
            <th className="border border-slate-400 py-1.5 px-1 text-center w-7">#</th>
            <th className="border border-slate-400 py-1.5 px-2 text-left w-20">कोड / No</th>
            <th className="border border-slate-400 py-1.5 px-2 text-left">सामग्री / मॉडल का नाम (Item Description)</th>
            <th className="border border-slate-400 py-1.5 px-2 text-center w-24">श्रेणी</th>
            <th className="border border-slate-400 py-1.5 px-1 text-center w-14">HSN</th>
            <th className="border border-slate-400 py-1.5 px-2 text-center w-16">मात्रा (Qty)</th>
            <th className="border border-slate-400 py-1.5 px-2 text-right w-20">खरीद दर (₹)</th>
            <th className="border border-slate-400 py-1.5 px-2 text-right w-24">स्टॉक लागत (₹)</th>
            <th className="border border-slate-400 py-1.5 px-2 text-right w-20">बिक्री दर (₹)</th>
            <th className="border border-slate-400 py-1.5 px-1 text-center w-12">GST %</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={10} className="border border-slate-400 py-6 text-center text-slate-400 font-medium">
                कोई स्टॉक सामग्री उपलब्ध नहीं है।
              </td>
            </tr>
          ) : (
            items.map((it, idx) => {
              const qty = Number(it.stockQty) || 0;
              const cost = Number(it.costPrice) || 0;
              const sale = Number(it.salePrice) || 0;
              const itemTotalCost = cost * qty;
              const serials = it.serialNumbers || [];

              return (
                <tr key={it.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-slate-300 py-1 px-1 text-center font-bold text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {it.itemNo}
                  </td>
                  <td className="border border-slate-300 py-1 px-2">
                    <div className="font-bold text-slate-900">{it.name}</div>
                    {serials.length > 0 && (
                      <div className="text-[9px] text-slate-600 font-mono mt-0.5 break-words">
                        <span className="font-bold text-indigo-900">IMEI/S.N. ({serials.length}):</span>{' '}
                        {serials.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 text-center whitespace-nowrap">
                    {it.category || 'General'}
                  </td>
                  <td className="border border-slate-300 py-1 px-1 text-center font-mono whitespace-nowrap">
                    {it.hsn || '-'}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 text-center font-mono font-bold whitespace-nowrap">
                    {qty} {it.unit || 'PCS'}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 text-right font-mono">
                    ₹{cost.toFixed(2)}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 text-right font-mono font-bold text-slate-900">
                    ₹{itemTotalCost.toFixed(2)}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 text-right font-mono text-emerald-800">
                    ₹{sale.toFixed(2)}
                  </td>
                  <td className="border border-slate-300 py-1 px-1 text-center font-bold">
                    {it.gstRate || 18}%
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        <tfoot>
          <tr className="bg-slate-200 text-slate-950 font-bold border-t-2 border-slate-500">
            <td colSpan={5} className="border border-slate-400 py-1.5 px-2">
              <div className="flex flex-col">
                <span className="font-black text-xs">कुल स्टॉक महायोग (Grand Valuation):</span>
                <span className="text-[9px] font-semibold text-slate-700 italic">
                  ({numberToHindiWords(Math.round(totalCostVal))})
                </span>
              </div>
            </td>
            <td className="border border-slate-400 py-1.5 px-2 text-center font-mono font-black text-xs">
              {totalQty} PCS
            </td>
            <td className="border border-slate-400 py-1.5 px-2"></td>
            <td className="border border-slate-400 py-1.5 px-2 text-right font-mono font-black text-xs">
              ₹{totalCostVal.toFixed(2)}
            </td>
            <td className="border border-slate-400 py-1.5 px-2 text-right font-mono font-black text-xs text-emerald-900">
              ₹{totalSaleVal.toFixed(2)}
            </td>
            <td className="border border-slate-400 py-1.5 px-2"></td>
          </tr>
        </tfoot>
      </table>

      {/* 5. FOOTER & SIGNATURE */}
      <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-[10px] text-slate-600">
        <div>
          <p>• यह एक आधिकारिक कम्प्यूटरीकृत स्टॉक इन्वेंट्री रजिस्टर है।</p>
          <p className="font-mono">सॉफ्टवेयर: Mobile & Electronics GST Billing System</p>
        </div>
        <div className="text-center w-52 border-t border-slate-800 pt-1">
          <p className="font-bold text-slate-900">भौतिक सत्यापन द्वारा प्रमाणित</p>
          <p className="text-[9px] text-slate-500">(Stock In-Charge / Shopkeeper Sign)</p>
        </div>
      </div>
    </div>
  );
}
