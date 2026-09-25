import React from 'react';
import { numberToHindiWords } from '../../utils/numberToWords';
import { parseSerials } from '../../context/BillingContext';

export default function PrintablePurchaseInvoice({ purchase, settings = {} }) {
  if (!purchase) return null;

  const now = new Date();
  const printTimestamp = `${now.toLocaleDateString('hi-IN')} ${now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}`;

  const items = purchase.items || [];
  const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  const totalTaxable = Number(purchase.totalTaxable || 0);
  const totalGst = Number(purchase.totalGst || 0);
  const subTotal = Number(purchase.subTotal || (totalTaxable + totalGst));
  const discount = Number(purchase.discount || 0);
  const grandTotal = Number(purchase.grandTotal || (subTotal - discount));

  return (
    <div id="printable-purchase-container" className="p-4 bg-white text-slate-900 font-sans text-xs max-w-4xl mx-auto">
      {/* 1. HEADER: SHOP / BUYER DETAILS */}
      <div className="border-b-2 border-amber-900 pb-3 mb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-800 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                खरीद वाउचर / स्टॉक आवक चालान
              </span>
              <span className="text-[10px] font-bold text-amber-900 font-mono">
                PURCHASE INWARD VOUCHER
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-950 uppercase tracking-wide">
              {settings.firmName || settings.shopName || 'मोबाइल एवं इलेक्ट्रॉनिक्स शॉप'}
            </h1>
            {settings.tagline && (
              <p className="text-[11px] font-semibold text-slate-600 italic mt-0.5">{settings.tagline}</p>
            )}
            <p className="text-[11px] text-slate-700 mt-1">
              📍 {settings.address || 'मुख्य बाजार'}
            </p>
            <p className="text-[11px] text-slate-700">
              📞 फोन: <span className="font-bold font-mono">{settings.mobile || settings.phone || '-'}</span>
              {settings.alternateMobile && <span className="font-mono">, {settings.alternateMobile}</span>}
              {settings.email && <span> | ✉️ {settings.email}</span>}
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
              GSTIN: {settings.gstin || '08ABCDE1234F1Z5'}
            </div>
            {settings.pan && (
              <p className="text-[10px] font-mono text-slate-600">
                PAN: <span className="font-bold">{settings.pan}</span>
              </p>
            )}
            <p className="text-[10px] text-slate-500 font-mono pt-1">
              प्रिंट समय: {printTimestamp}
            </p>
          </div>
        </div>
      </div>

      {/* 2. VOUCHER & SUPPLIER DETAILS BOX */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-xs border border-amber-300 bg-amber-50/40 p-2.5 rounded-lg">
        {/* Left: Supplier Details */}
        <div className="space-y-0.5 border-r border-amber-200 pr-2">
          <span className="text-[10px] font-bold uppercase text-amber-900 block mb-1">
            🏢 सप्लायर विवरण (Supplier Details):
          </span>
          <div className="font-bold text-sm text-slate-900">
            {purchase.supplierName || 'सप्लायर (Supplier)'}
          </div>
          {purchase.supplierMobile && (
            <div className="text-slate-700">
              मोबाइल: <span className="font-mono font-bold text-slate-900">{purchase.supplierMobile}</span>
            </div>
          )}
          {purchase.supplierGstin && (
            <div className="text-slate-700">
              GSTIN: <span className="font-mono font-bold uppercase text-slate-900">{purchase.supplierGstin}</span>
            </div>
          )}
        </div>

        {/* Right: Voucher Meta */}
        <div className="space-y-1 pl-2 text-right flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-900 block mb-0.5">
              खरीद प्रविष्टि संदर्भ (Voucher Info):
            </span>
            <div className="text-xs">
              <span className="text-slate-600">वाउचर संख्या: </span>
              <span className="font-mono font-black text-amber-950 text-sm">#{purchase.purchaseNo}</span>
            </div>
            <div className="text-xs">
              <span className="text-slate-600">खरीद दिनांक: </span>
              <span className="font-mono font-bold text-slate-900">{purchase.date}</span>
            </div>
            {purchase.supplierInvoiceNo && (
              <div className="text-xs">
                <span className="text-slate-600">सप्लायर बिल सं. (Inv #): </span>
                <span className="font-mono font-bold text-slate-900">{purchase.supplierInvoiceNo}</span>
              </div>
            )}
          </div>
          <div className="text-[10px] text-emerald-800 font-bold bg-emerald-100/70 inline-block px-2 py-0.5 rounded self-end border border-emerald-300">
            स्टॉक इनवर्ड दर्ज ✓ (Stock Added)
          </div>
        </div>
      </div>

      {/* 3. ITEMS TABLE */}
      <div className="border border-slate-300 rounded overflow-hidden mb-3">
        <table className="w-full text-left border-collapse text-[10.5px]">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase text-center text-[10px]">
              <th className="py-1.5 px-2 border-r border-slate-700 w-8">#</th>
              <th className="py-1.5 px-2 border-r border-slate-700 w-24 text-left">आइटम कोड</th>
              <th className="py-1.5 px-2.5 border-r border-slate-700 text-left">सामान / मॉडल विवरण</th>
              <th className="py-1.5 px-2 border-r border-slate-700 w-12">HSN</th>
              <th className="py-1.5 px-2 border-r border-slate-700 w-20 text-right">खरीद दर (₹)</th>
              <th className="py-1.5 px-2 border-r border-slate-700 w-12">मात्रा</th>
              <th className="py-1.5 px-2 border-r border-slate-700 w-12">GST %</th>
              <th className="py-1.5 px-2 border-r border-slate-700 w-20 text-right">कर योग्य</th>
              <th className="py-1.5 px-2 text-right w-24">कुल लागत (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((it, idx) => {
              const qty = Number(it.qty) || 1;
              const cost = Number(it.costPrice) || 0;
              const taxable = Math.round(cost * qty * 100) / 100;
              const serials = parseSerials(it.serialNo);

              return (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="py-2 px-2 text-center font-bold text-slate-400 border-r border-slate-200 align-top">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2 font-mono font-black text-amber-950 border-r border-slate-200 align-top">
                    {it.itemNo}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200 align-top">
                    <div className="font-bold text-slate-900">{it.name}</div>
                    {it.category && (
                      <span className="text-[9px] text-slate-500 font-semibold">
                        [{it.category}]
                      </span>
                    )}
                    {serials.length > 0 && (
                      <div className="mt-1 text-[9px] font-mono text-indigo-900 leading-tight bg-indigo-50/70 p-1 rounded border border-indigo-100">
                        <span className="font-bold text-indigo-950">IMEI/S.N. ({serials.length}): </span>
                        <span>{serials.join(', ')}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-200 align-top">
                    {it.hsn || '-'}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-800 border-r border-slate-200 align-top">
                    ₹{cost.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-center font-bold font-mono text-slate-900 border-r border-slate-200 align-top">
                    {qty} {it.unit || 'PCS'}
                  </td>
                  <td className="py-2 px-2 text-center font-semibold text-slate-700 border-r border-slate-200 align-top">
                    {it.gstRate}%
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-700 border-r border-slate-200 align-top">
                    ₹{taxable.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-slate-900 align-top">
                    ₹{Number(it.total || 0).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-[10.5px]">
              <td colSpan={5} className="py-2 px-2.5 text-right text-slate-700">
                कुल जोड़ (Total Items: {items.length})
              </td>
              <td className="py-2 px-2 text-center font-mono font-black text-slate-900">
                {totalQty} PCS
              </td>
              <td className="py-2 px-2"></td>
              <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                ₹{totalTaxable.toFixed(2)}
              </td>
              <td className="py-2 px-2 text-right font-mono font-black text-slate-950">
                ₹{subTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 4. FINANCIAL SUMMARY & WORDS */}
      <div className="grid grid-cols-2 gap-3 mb-3 items-start">
        {/* Words and Verification Note */}
        <div className="border border-slate-300 rounded p-2.5 bg-slate-50 space-y-1.5">
          <div>
            <span className="text-[10px] font-bold text-slate-600 uppercase block">
              कुल राशि शब्दों में (Amount in Words):
            </span>
            <p className="font-bold text-slate-900 text-xs leading-snug mt-0.5">
              {numberToHindiWords(grandTotal)} मात्र
            </p>
          </div>
          <div className="pt-1 border-t border-slate-200 text-[9.5px] text-slate-500 leading-normal">
            📌 यह खरीद वाउचर दुकान के आंतरिक स्टॉक एवं इनपुट टैक्स क्रेडिट (ITC) रिकॉर्ड हेतु मान्य है। सभी आइटम्स दुकान के स्टॉक रजिस्टर में दर्ज कर लिए गए हैं।
          </div>
        </div>

        {/* Totals Breakdown */}
        <div className="border border-slate-300 rounded p-2.5 bg-slate-50 space-y-1 text-xs">
          <div className="flex justify-between text-slate-700">
            <span>कुल कर योग्य मूल्य (Taxable Amount):</span>
            <span className="font-mono font-semibold">₹{totalTaxable.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>कुल जीएसटी इनपुट (GST ITC Total):</span>
            <span className="font-mono font-semibold">₹{totalGst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-700 border-t border-slate-200 pt-0.5">
            <span>उप-कुल (Sub Total):</span>
            <span className="font-mono font-semibold">₹{subTotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-800 font-bold">
              <span>विशेष सप्लायर छूट (Discount):</span>
              <span className="font-mono">-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="mt-1 pt-1.5 border-t-2 border-slate-900 flex justify-between items-center bg-slate-900 text-white p-2 rounded">
            <span className="font-black text-xs uppercase tracking-wide">अंतिम कुल देय (Grand Total):</span>
            <span className="font-mono font-black text-base text-amber-300">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 5. SIGNATORY BOX */}
      <div className="grid grid-cols-2 gap-4 border-t-2 border-slate-900 pt-4 text-center text-xs mt-4">
        <div className="border border-dashed border-slate-300 rounded p-3 flex flex-col justify-between h-20">
          <span className="text-[10px] text-slate-500 font-bold uppercase">
            स्टॉक प्राप्ति एवं भौतिक सत्यापन
          </span>
          <span className="text-[10px] text-slate-700 font-semibold">
            (हस्ताक्षर स्टोर इन-चार्ज / माल प्राप्तकर्ता)
          </span>
        </div>

        <div className="border border-dashed border-slate-300 rounded p-3 flex flex-col justify-between h-20">
          <span className="text-[10px] text-slate-900 font-bold uppercase">
            कृते {settings.firmName || settings.shopName}
          </span>
          <span className="text-[10px] text-slate-700 font-semibold">
            {settings.signatoryText || 'अधिकृत हस्ताक्षरकर्ता (Authorized Signatory)'}
          </span>
        </div>
      </div>
    </div>
  );
}
