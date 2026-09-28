import React from 'react';
import GaneshLogo from '../../GaneshLogo';
import { numberToHindiWords, numberToIndianWords } from '../../../utils/numberToWords';
import UpiQrCode from '../../common/UpiQrCode';

export default function ModernGstTheme({ bill, settings }) {
  if (!bill) return null;

  const currentSettings = settings || {};
  const disp = currentSettings.displayOptions || {};
  const items = bill.items || [];
  const grandTotal = Math.round(Number(bill.grandTotal || 0));

  // Dynamic rows: exactly 10 rows for A4 single-page fit; expands to page 2 if items > 10
  const rowCount = Math.max(10, items.length);
  const rows = Array.from({ length: rowCount }, (_, idx) => items[idx] || null);

  const shouldShowGanesh = disp.showGaneshLogo && currentSettings.showGaneshLogo;

  return (
    <div id="printable-bill" className="bg-white text-slate-900 border border-indigo-200 rounded-xl p-4 sm:p-5 max-w-4xl mx-auto shadow-md text-xs leading-relaxed font-sans">
      {/* 1. TOP HEADER WITH INDIGO ACCENT */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-4 rounded-lg mb-3 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            {disp.showLogo && currentSettings.logo && (
              <img
                src={currentSettings.logo}
                alt="Logo"
                className="w-14 h-14 object-contain rounded-lg bg-white p-1"
              />
            )}
            <div>
              {shouldShowGanesh && (
                <div className="text-[11px] text-indigo-200 font-bold mb-0.5 tracking-wider">
                  {currentSettings.ganeshText || '॥ श्री गणेशाय नमः ॥'}
                </div>
              )}
              {disp.showFirmName && (
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  {currentSettings.firmName || 'फर्म का नाम'}
                </h1>
              )}
              {disp.showTagline && currentSettings.tagline && (
                <p className="text-xs text-indigo-100 font-medium">
                  {currentSettings.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Invoice Badge & Contact */}
          <div className="text-right sm:text-right w-full sm:w-auto">
            <span className="inline-block bg-indigo-500/40 border border-indigo-300/40 text-white font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-wider backdrop-blur-xs">
              TAX INVOICE
            </span>
            <div className="text-xs text-indigo-100 font-medium mt-1 space-y-0.5">
              {disp.showMobile && currentSettings.mobile && (
                <div>📞 {currentSettings.mobile}</div>
              )}
              {disp.showEmail && currentSettings.email && (
                <div className="text-[10px] text-indigo-200">{currentSettings.email}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB-BAR: ADDRESS, GSTIN, PAN */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-[11px] font-semibold text-slate-700 mb-3">
        {disp.showAddress && currentSettings.address && (
          <div className="text-slate-800">📍 {currentSettings.address}</div>
        )}
        <div className="flex items-center gap-3">
          {disp.showGstin && currentSettings.gstin && (
            <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-950">
              GSTIN: <span className="font-mono font-bold">{currentSettings.gstin}</span>
            </span>
          )}
          {disp.showPan && currentSettings.pan && (
            <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 text-slate-800">
              PAN: <span className="font-mono font-bold">{currentSettings.pan}</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. CARDS GRID: BUYER INFO & INVOICE META */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Customer Card */}
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
          <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">
            बिल प्राप्तकर्ता (Billed To):
          </div>
          <div className="font-black text-sm text-slate-900">
            {bill.customerName || 'नकद ग्राहक (Cash Customer)'}
          </div>
          {disp.showCustomerDetails && bill.customerMobile && (
            <div className="text-[11px] text-slate-700 mt-0.5 font-medium">
              📞 फोन: <span className="font-mono font-bold">{bill.customerMobile}</span>
            </div>
          )}
          {disp.showCustomerDetails && bill.customerGstin && (
            <div className="text-[11px] font-bold text-indigo-900 mt-0.5">
              GSTIN: <span className="font-mono">{bill.customerGstin}</span>
            </div>
          )}
          {disp.showCustomerDetails && bill.customerAddress && (
            <div className="text-[10px] text-slate-600 mt-0.5">
              📍 {bill.customerAddress}
            </div>
          )}
        </div>

        {/* Invoice Info Card */}
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">इनवॉइस संख्या</span>
              <span className="font-mono font-black text-indigo-900 text-sm">{bill.billNo}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">बिल दिनांक</span>
              <span className="font-bold text-slate-900">{bill.date}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">पेमेंट मोड</span>
              <span className="font-semibold text-slate-800">{bill.paymentMode || 'Cash / Online'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">सप्लाई राज्य</span>
              <span className="font-semibold text-slate-800">{currentSettings.state || 'Rajasthan (08)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 10-ROW FIXED TABLE */}
      <div className="rounded-lg border border-slate-200 overflow-hidden mb-3 shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-900 text-white font-bold text-[10px] uppercase text-center">
              <th className="py-2 px-1 w-8">#</th>
              <th className="py-2 px-3 text-left">विवरण (Item Description)</th>
              {disp.showHsn && <th className="py-2 px-1 w-14">HSN</th>}
              <th className="py-2 px-1 w-10">मात्रा</th>
              <th className="py-2 px-2 w-16 text-right">दर (₹)</th>
              <th className="py-2 px-2 w-16 text-right">टैक्सेबल</th>
              {disp.showTaxBreakup && (
                <>
                  <th className="py-2 px-1 w-14 text-right">CGST</th>
                  <th className="py-2 px-1 w-14 text-right">SGST</th>
                </>
              )}
              <th className="py-2 px-3 text-right w-20">कुल राशि</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((item, index) => {
              const isFilled = Boolean(item && (item.name || item.total > 0));
              return (
                <tr
                  key={index}
                  className={`min-h-[26px] h-auto text-[11px] ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  } ${!isFilled ? 'text-slate-300' : 'text-slate-900'}`}
                >
                  <td className="text-center font-bold text-slate-400 px-1 py-1.5 align-top">
                    {index + 1}
                  </td>
                  <td className="px-3 py-1.5 font-medium break-words align-top">
                    {isFilled ? (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 break-words">{item.name}</span>
                          {item.itemNo && (
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 font-mono px-1.5 py-0.2 rounded border border-indigo-100 shrink-0">
                              {item.itemNo}
                            </span>
                          )}
                        </div>
                        {item.serialNo && (
                          <div className="text-[9px] font-mono text-indigo-900 font-semibold mt-0.5 break-words">
                            IMEI/S.N.: <span className="font-bold">{item.serialNo}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-200 select-none">•</span>
                    )}
                  </td>
                  {disp.showHsn && (
                    <td className="text-center font-mono px-1 py-1.5 text-[10px] text-slate-600 align-top whitespace-nowrap">
                      {isFilled ? item.hsn || '-' : ''}
                    </td>
                  )}
                  <td className="text-center font-bold px-1 py-1.5 align-top whitespace-nowrap">
                    {isFilled ? `${item.qty} ${item.unit || 'PCS'}` : ''}
                  </td>
                  <td className="text-right font-mono px-2 py-1.5 text-slate-700 align-top whitespace-nowrap">
                    {isFilled ? Number(item.rate || 0).toFixed(2) : ''}
                  </td>
                  <td className="text-right font-mono px-2 py-1.5 text-slate-800 align-top whitespace-nowrap">
                    {isFilled ? Number(item.taxableAmount || item.total || 0).toFixed(2) : ''}
                  </td>
                  {disp.showTaxBreakup && (
                    <>
                      <td className="text-right font-mono px-1 py-1.5 text-[10px] text-slate-600 align-top whitespace-nowrap">
                        {isFilled && item.cgstAmount ? `${Number(item.cgstAmount).toFixed(2)}` : ''}
                      </td>
                      <td className="text-right font-mono px-1 py-1.5 text-[10px] text-slate-600 align-top whitespace-nowrap">
                        {isFilled && item.sgstAmount ? `${Number(item.sgstAmount).toFixed(2)}` : ''}
                      </td>
                    </>
                  )}
                  <td className="text-right font-mono font-bold px-3 py-1.5 text-indigo-950 align-top whitespace-nowrap">
                    {isFilled ? Number(item.total || 0).toFixed(2) : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-indigo-50 font-bold text-[11px] text-indigo-950 border-t border-indigo-200 h-auto">
              <td colSpan={disp.showHsn ? 3 : 2} className="py-2 px-3 align-top">
                <div className="flex flex-col gap-1">
                  <div className="font-black text-indigo-950">कुल योग (Total):</div>
                  {disp.showWords && (
                    <div className="text-[10px] font-bold text-indigo-900 break-words leading-tight bg-indigo-100/70 p-1 rounded border border-indigo-200">
                      ({numberToHindiWords(grandTotal)})
                    </div>
                  )}
                </div>
              </td>
              <td className="text-center font-bold align-top py-2 whitespace-nowrap">
                {items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0)} PCS
              </td>
              <td></td>
              <td className="text-right font-mono px-2 align-top py-2 whitespace-nowrap">
                ₹{Number(bill.taxableTotal || 0).toFixed(2)}
              </td>
              {disp.showTaxBreakup && (
                <>
                  <td className="text-right font-mono px-1 text-[10px] align-top py-2 whitespace-nowrap">
                    ₹{Number(bill.cgstTotal || 0).toFixed(2)}
                  </td>
                  <td className="text-right font-mono px-1 text-[10px] align-top py-2 whitespace-nowrap">
                    ₹{Number(bill.sgstTotal || 0).toFixed(2)}
                  </td>
                </>
              )}
              <td className="text-right font-mono font-black px-3 text-sm text-indigo-900 align-top py-2 whitespace-nowrap">
                ₹{grandTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 5. BANK DETAILS & SCAN & PAY UPI QR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Left Side: Bank Details & Prominent UPI QR */}
        <div className="space-y-2 flex flex-col justify-between">
          {disp.showBankDetails && currentSettings.bankName && (
            <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/40 text-[10px] space-y-0.5">
              <div className="font-bold text-indigo-950 uppercase">🏦 बैंक खाता विवरण (Bank Transfer):</div>
              <div className="text-[9.5px]">बैंक: <span className="font-semibold">{currentSettings.bankName}</span> | खाता: <span className="font-mono font-bold">{currentSettings.accountNo}</span></div>
              <div className="text-[9.5px]">IFSC: <span className="font-mono font-bold">{currentSettings.ifsc}</span> {currentSettings.branch ? `| शाखा: ${currentSettings.branch}` : ''}</div>
            </div>
          )}

          {disp.showUpiQr !== false && (
            <UpiQrCode
              upiId={currentSettings.upiId || (currentSettings.mobile ? `${currentSettings.mobile}@upi` : 'shreeshyam@sbi')}
              shopName={currentSettings.firmName || currentSettings.shopName}
              amount={grandTotal}
              billNo={bill.billNo}
              size={68}
            />
          )}

          {!disp.showBankDetails && disp.showUpiQr === false && (
            <div className="p-3 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400 italic bg-slate-50/40">
              धन्यवाद! पुनः पधारें • Thank You! Visit Again
            </div>
          )}
        </div>

        {/* Right Side: Total Card */}
        <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/40 flex flex-col justify-between">
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-700">
              <span>टैक्सेबल मूल्य (Taxable Value):</span>
              <span className="font-mono font-semibold">₹{Number(bill.taxableTotal || 0).toFixed(2)}</span>
            </div>
            {disp.showTaxBreakup && (
              <>
                <div className="flex justify-between text-slate-700">
                  <span>केंद्रीय जीएसटी (CGST):</span>
                  <span className="font-mono font-semibold">₹{Number(bill.cgstTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>राज्य जीएसटी (SGST):</span>
                  <span className="font-mono font-semibold">₹{Number(bill.sgstTotal || 0).toFixed(2)}</span>
                </div>
              </>
            )}
            {Number(bill.discount || 0) > 0 && (
              <>
                <div className="flex justify-between text-slate-700 border-t border-indigo-200/60 pt-0.5">
                  <span>उप-कुल (Sub Total):</span>
                  <span className="font-mono font-semibold">
                    ₹{Number(bill.subTotal || (Number(bill.taxableTotal || 0) + Number(bill.totalGst || 0))).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>विशेष छूट (Discount):</span>
                  <span className="font-mono">-₹{Number(bill.discount).toFixed(2)}</span>
                </div>
              </>
            )}
            {Number(bill.roundOff || 0) !== 0 && (
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>राउंड ऑफ (Round Off):</span>
                <span className="font-mono">{Number(bill.roundOff).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-indigo-200 flex justify-between items-center bg-gradient-to-r from-indigo-800 to-blue-800 text-white p-2.5 rounded-lg shadow-xs">
            <span className="font-bold text-xs uppercase tracking-wider">कुल राशि (Grand Total):</span>
            <span className="font-mono font-black text-xl">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 6. TERMS & SIGNATURE */}
      <div className="border-t border-slate-200 pt-2 grid grid-cols-3 gap-3">
        <div className="col-span-2">
          {disp.showTerms && currentSettings.terms && currentSettings.terms.length > 0 && (
            <div>
              <div className="font-bold text-[10px] text-slate-600 uppercase mb-0.5">नियम एवं शर्तें:</div>
              <ul className="list-disc list-inside text-[9px] text-slate-600 space-y-0.5">
                {currentSettings.terms.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="text-center flex flex-col justify-between items-center border border-slate-200 rounded-lg p-2 bg-slate-50/50">
          <div className="text-[10px] font-bold text-indigo-950">
            {currentSettings.firmName}
          </div>
          <div className="h-8"></div>
          {disp.showSignatory && (
            <div className="border-t border-slate-300 w-full pt-1 text-[9px] font-semibold text-slate-700">
              {currentSettings.signatoryText || 'अधिकृत हस्ताक्षरकर्ता'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
