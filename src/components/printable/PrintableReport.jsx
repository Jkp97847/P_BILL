import React from 'react';
import { numberToHindiWords } from '../../utils/numberToWords';

export default function PrintableReport({ 
  reportType = 'sales', 
  items = [], 
  filterDate = '', 
  searchTerm = '', 
  stats = {}, 
  settings = {},
  financialYear = '',
  isYearly = false 
}) {
  const isSales = reportType === 'sales';
  const isNonGst = reportType === 'nongst_sales';
  const isPurchases = reportType === 'purchases';

  const now = new Date();
  const printTimestamp = `${now.toLocaleDateString('hi-IN')} ${now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}`;

  const totalCount = items.length;
  const totalTaxable = items.reduce((sum, it) => sum + Number(it.totalTaxable || (it.taxableTotal) || 0), 0);
  const totalGst = items.reduce((sum, it) => sum + Number(it.totalGst || 0), 0);
  const grandTotal = items.reduce((sum, it) => sum + Number(it.grandTotal || 0), 0);

  // Determine report title
  let reportHeading = '📋 जीएसटी बिक्री इनवॉइस रिपोर्ट रजिस्टर (GST Sales Register)';
  if (isPurchases) {
    reportHeading = '📦 माल खरीद वाउचर रिपोर्ट रजिस्टर (Purchase Inward Register)';
  } else if (isNonGst) {
    reportHeading = '📋 नॉन-जीएसटी खुदरा बिक्री रिपोर्ट रजिस्टर (Retail Sales Register)';
  }

  const periodLabel = filterDate || (financialYear ? `वित्तीय वर्ष: ${financialYear}` : 'समस्त रिकॉर्ड (All Records)');

  return (
    <div id="printable-report-container" className="p-4 bg-white text-slate-900 font-sans text-xs">
      {/* 1. SHOP HEADER */}
      <div className="border-b-2 border-slate-900 pb-3 mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-slate-950 uppercase tracking-wide">
              {settings.shopName || settings.firmName || 'स्मार्ट बिलिंग सॉफ्टवेयर'}
            </h1>
            {settings.tagline && (
              <p className="text-[11px] font-semibold text-slate-600 italic mt-0.5">{settings.tagline}</p>
            )}
            <p className="text-[11px] text-slate-700 mt-1">
              📍 {settings.address || 'मुख्य बाजार'}, {settings.city || 'जयपुर'}, {settings.state || 'राजस्थान'}
            </p>
            <p className="text-[11px] text-slate-700">
              📞 फोन: <span className="font-bold">{settings.phone || settings.mobile || '9876543210'}</span>
              {settings.email && ` | ✉️ ${settings.email}`}
            </p>
          </div>
          <div className="text-right">
            {(settings.gstin && settings.gstin !== '08AAAAA0000A1Z5') && (
              <div className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                GSTIN: {settings.gstin}
              </div>
            )}
            <p className="text-[10px] text-slate-500 mt-2 font-mono">
              प्रिंट समय: {printTimestamp}
            </p>
          </div>
        </div>
      </div>

      {/* 2. REPORT TITLE & FILTER INFO */}
      <div className="bg-slate-100 p-2.5 rounded border border-slate-300 mb-3 flex flex-wrap justify-between items-center">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase">
            {reportHeading}
          </h2>
          <div className="text-[10px] text-slate-600 mt-0.5 flex flex-wrap gap-3 items-center">
            <span>
              <strong>अवधि / वित्तीय वर्ष:</strong> <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">{periodLabel}</span>
            </span>
            {searchTerm && (
              <span>
                <strong>फ़िल्टर शब्द:</strong> "{searchTerm}"
              </span>
            )}
          </div>
        </div>
        <div className="text-right text-xs">
          <span className="font-bold text-slate-700">कुल प्रविष्टियां (Entries): </span>
          <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
            {totalCount}
          </span>
        </div>
      </div>

      {/* 3. SUMMARY HIGHLIGHT METRICS */}
      <div className="grid grid-cols-4 gap-2 mb-3 text-center">
        <div className="border border-slate-300 rounded p-1.5 bg-slate-50">
          <span className="text-[10px] text-slate-500 block font-bold">कुल वाउचर संख्या</span>
          <span className="text-sm font-black text-slate-900">{totalCount}</span>
        </div>
        <div className="border border-slate-300 rounded p-1.5 bg-slate-50">
          <span className="text-[10px] text-slate-500 block font-bold">कुल टैक्सेबल राशि</span>
          <span className="text-sm font-black text-slate-900 font-mono">₹{totalTaxable.toFixed(2)}</span>
        </div>
        <div className="border border-slate-300 rounded p-1.5 bg-slate-50">
          <span className="text-[10px] text-slate-500 block font-bold">कुल GST कर</span>
          <span className="text-sm font-black text-indigo-900 font-mono">₹{totalGst.toFixed(2)}</span>
        </div>
        <div className="border border-slate-300 rounded p-1.5 bg-slate-50">
          <span className="text-[10px] text-slate-500 block font-bold">कुल जोड़ (Grand Total)</span>
          <span className="text-sm font-black text-emerald-900 font-mono">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* 4. FULL REPORT TABLE */}
      <table className="w-full border-collapse border border-slate-400 text-[10px] mb-4">
        <thead>
          <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-400">
            <th className="border border-slate-400 py-1.5 px-1 text-center w-8">#</th>
            <th className="border border-slate-400 py-1.5 px-2 text-left w-24">
              {isSales ? 'बिल नंबर' : 'वाउचर नंबर'}
            </th>
            <th className="border border-slate-400 py-1.5 px-2 text-center w-20">दिनांक</th>
            <th className="border border-slate-400 py-1.5 px-2 text-left w-44">
              {isSales ? 'ग्राहक का नाम व संपर्क' : 'सप्लायर का नाम व बिल नं.'}
            </th>
            <th className="border border-slate-400 py-1.5 px-2 text-left">
              सामग्री एवं सीरियल / IMEI नं.
            </th>
            <th className="border border-slate-400 py-1.5 px-2 text-right w-20">टैक्सेबल (₹)</th>
            <th className="border border-slate-400 py-1.5 px-2 text-right w-16">GST (₹)</th>
            <th className="border border-slate-400 py-1.5 px-2 text-right w-24">कुल राशि (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} className="border border-slate-400 py-6 text-center text-slate-400 font-medium">
                कोई रिकॉर्ड उपलब्ध नहीं है।
              </td>
            </tr>
          ) : (
            items.map((row, idx) => {
              const rowTaxable = Number(row.totalTaxable || row.taxableTotal || 0);
              const rowGst = Number(row.totalGst || 0);
              const rowGrand = Number(row.grandTotal || 0);

              return (
                <tr key={row.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-slate-300 py-1 px-1 text-center font-bold text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {isSales ? row.billNo : row.purchaseNo}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 text-center whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="border border-slate-300 py-1 px-2">
                    {isSales ? (
                      <div>
                        <div className="font-bold text-slate-900">{row.customerName}</div>
                        {row.customerMobile && (
                          <div className="text-[9px] text-slate-500 font-mono">📞 {row.customerMobile}</div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-slate-900">{row.supplierName}</div>
                        <div className="text-[9px] text-slate-500 font-mono">
                          {row.supplierInvoiceNo && `Inv: #${row.supplierInvoiceNo}`}
                          {row.supplierMobile && ` | 📞 ${row.supplierMobile}`}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="border border-slate-300 py-1 px-2">
                    {row.items && row.items.length > 0 ? (
                      <div className="space-y-0.5">
                        {row.items.map((item, itIdx) => (
                          <div key={itIdx} className="leading-tight">
                            <span className="font-medium text-slate-800">
                              {item.name} ({item.qty} {item.unit || 'PCS'})
                            </span>
                            {item.serialNo && (
                              <span className="ml-1 text-[9px] font-mono text-indigo-900 font-bold bg-indigo-50 px-1 rounded border border-indigo-100 inline-block">
                                S/N: {item.serialNo}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 text-right font-mono">
                    {rowTaxable.toFixed(2)}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 text-right font-mono">
                    {rowGst.toFixed(2)}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 text-right font-mono font-bold text-slate-950">
                    {rowGrand.toFixed(2)}
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
                <span className="font-black text-xs">महायोग (Grand Total Sum):</span>
                <span className="text-[9px] font-semibold text-slate-700 italic">
                  ({numberToHindiWords(grandTotal)})
                </span>
              </div>
            </td>
            <td className="border border-slate-400 py-1.5 px-2 text-right font-mono font-black text-xs">
              ₹{totalTaxable.toFixed(2)}
            </td>
            <td className="border border-slate-400 py-1.5 px-2 text-right font-mono font-black text-xs">
              ₹{totalGst.toFixed(2)}
            </td>
            <td className="border border-slate-400 py-1.5 px-2 text-right font-mono font-black text-xs">
              ₹{grandTotal.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 5. FOOTER & SIGNATURE */}
      <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-[10px] text-slate-600">
        <div>
          <p>• यह एक कम्प्यूटरीकृत लेखा रिपोर्ट है एवं रिकॉर्ड हेतु मान्य है।</p>
          <p className="font-mono">सॉफ्टवेयर: Mobile & Electronics GST Billing System</p>
        </div>
        <div className="text-center w-48 border-t border-slate-800 pt-1">
          <p className="font-bold text-slate-900">अधिकृत हस्ताक्षर (Authorized Signatory)</p>
          <p className="text-[9px] text-slate-500">कृते: {settings.shopName || 'मोबाइल शॉप'}</p>
        </div>
      </div>
    </div>
  );
}
