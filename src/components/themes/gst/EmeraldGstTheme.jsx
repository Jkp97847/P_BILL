import React from 'react';
import GaneshLogo from '../../GaneshLogo';
import { numberToHindiWords, numberToIndianWords } from '../../../utils/numberToWords';
import UpiQrCode from '../../common/UpiQrCode';

export default function EmeraldGstTheme({ bill, settings }) {
  if (!bill) return null;

  const currentSettings = settings || {};
  const disp = currentSettings.displayOptions || {};
  const items = bill.items || [];
  const grandTotal = Math.round(Number(bill.grandTotal || 0));

  // Exactly 10 fixed rows
  const FIXED_ROWS = 10;
  const rows = Array.from({ length: FIXED_ROWS }, (_, idx) => items[idx] || null);

  const shouldShowGanesh = disp.showGaneshLogo && currentSettings.showGaneshLogo;

  return (
    <div className="bg-white text-slate-900 border-2 border-emerald-800 rounded-lg p-5 max-w-4xl mx-auto shadow-md text-xs leading-relaxed font-sans">
      {/* 1. EMERALD BANNER HEADER */}
      <div className="border-b-2 border-emerald-800 pb-2 mb-2">
        <div className="flex justify-between items-center text-[10px] text-emerald-800 font-bold mb-1">
          <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200">
            ✓ GST COMPLIANT TAX INVOICE
          </span>
          {shouldShowGanesh && (
            <span className="text-emerald-700">
              {currentSettings.ganeshText || '॥ श्री गणेशाय नमः ॥'}
            </span>
          )}
          <span className="text-slate-600">मूल प्रति (ORIGINAL)</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left mt-1">
          <div className="flex items-center gap-3">
            {disp.showLogo && currentSettings.logo && (
              <img
                src={currentSettings.logo}
                alt="Logo"
                className="w-14 h-14 object-contain rounded border border-emerald-300 p-0.5"
              />
            )}
            <div>
              {disp.showFirmName && (
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-emerald-950">
                  {currentSettings.firmName || 'फर्म का नाम'}
                </h1>
              )}
              {disp.showTagline && currentSettings.tagline && (
                <p className="text-xs text-emerald-700 font-medium">{currentSettings.tagline}</p>
              )}
              {disp.showAddress && currentSettings.address && (
                <p className="text-[11px] text-slate-600 mt-0.5">📍 {currentSettings.address}</p>
              )}
            </div>
          </div>

          <div className="text-right text-xs text-slate-700 space-y-0.5">
            {disp.showMobile && currentSettings.mobile && (
              <div className="font-bold text-emerald-900">📞 {currentSettings.mobile}</div>
            )}
            {disp.showEmail && currentSettings.email && (
              <div className="text-[10px] text-slate-500">{currentSettings.email}</div>
            )}
          </div>
        </div>

        {/* GSTIN / PAN */}
        <div className="flex flex-wrap justify-center gap-4 mt-2 pt-1 border-t border-emerald-200 text-[11px] font-bold">
          {disp.showGstin && currentSettings.gstin && (
            <span className="bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded border border-emerald-300">
              GSTIN: <span className="font-mono">{currentSettings.gstin}</span>
            </span>
          )}
          {disp.showPan && currentSettings.pan && (
            <span className="bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded border border-emerald-300">
              PAN: <span className="font-mono">{currentSettings.pan}</span>
            </span>
          )}
          {disp.showState && (
            <span className="text-slate-700">राज्य: {currentSettings.state || 'Rajasthan'} ({currentSettings.stateCode || '08'})</span>
          )}
        </div>
      </div>

      {/* 2. BUYER & BILL METADATA */}
      <div className="grid grid-cols-2 border border-emerald-300 rounded p-2.5 mb-2.5 bg-emerald-50/30 text-[11px]">
        <div>
          <div className="font-bold text-[10px] text-emerald-900 uppercase">क्रेता का विवरण (Billed To):</div>
          <div className="font-black text-sm text-slate-900">{bill.customerName || 'नकद ग्राहक'}</div>
          {disp.showCustomerDetails && bill.customerMobile && (
            <div>📞 मोबाइल: <span className="font-mono font-bold">{bill.customerMobile}</span></div>
          )}
          {disp.showCustomerDetails && bill.customerGstin && (
            <div className="font-bold">GSTIN: <span className="font-mono">{bill.customerGstin}</span></div>
          )}
          {disp.showCustomerDetails && bill.customerAddress && (
            <div className="text-slate-600 text-[10px]">पता: {bill.customerAddress}</div>
          )}
        </div>

        <div className="text-right space-y-1">
          <div>
            <span className="text-slate-600">इनवॉइस क्रमांक: </span>
            <span className="font-mono font-black text-emerald-950 text-sm">{bill.billNo}</span>
          </div>
          <div>
            <span className="text-slate-600">बिल दिनांक: </span>
            <span className="font-bold">{bill.date}</span>
          </div>
          <div>
            <span className="text-slate-600">भुगतान विधि: </span>
            <span className="font-semibold">{bill.paymentMode || 'Cash / Online'}</span>
          </div>
        </div>
      </div>

      {/* 3. 10-ROW FIXED TABLE */}
      <div className="border border-emerald-800 rounded overflow-hidden mb-2.5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-900 text-white font-bold text-[10px] uppercase text-center">
              <th className="py-1.5 px-1 border-r border-emerald-700 w-8">क्र.</th>
              <th className="py-1.5 px-3 border-r border-emerald-700 text-left">सामान / मॉडल (Item Name)</th>
              {disp.showHsn && <th className="py-1.5 px-1 border-r border-emerald-700 w-14">HSN</th>}
              <th className="py-1.5 px-1 border-r border-emerald-700 w-10">मात्रा</th>
              <th className="py-1.5 px-1 border-r border-emerald-700 w-14 text-right">दर (₹)</th>
              <th className="py-1.5 px-1 border-r border-emerald-700 w-16 text-right">टैक्सेबल</th>
              {disp.showTaxBreakup && (
                <>
                  <th className="py-1.5 px-1 border-r border-emerald-700 w-14 text-right">CGST</th>
                  <th className="py-1.5 px-1 border-r border-emerald-700 w-14 text-right">SGST</th>
                </>
              )}
              <th className="py-1.5 px-2 text-right w-20">कुल राशि (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100">
            {rows.map((item, index) => {
              const isFilled = Boolean(item && (item.name || item.total > 0));
              return (
                <tr
                  key={index}
                  className={`min-h-[26px] h-auto text-[11px] ${
                    index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/20'
                  } ${!isFilled ? 'text-slate-300' : 'text-slate-900'}`}
                >
                  <td className="text-center font-bold border-r border-emerald-100 px-1 py-1.5 align-top text-emerald-900">
                    {index + 1}
                  </td>
                  <td className="border-r border-emerald-100 px-3 py-1.5 font-medium break-words align-top">
                    {isFilled ? (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 break-words">{item.name}</span>
                          {item.itemNo && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-800 font-mono px-1 rounded border border-emerald-200 shrink-0">
                              {item.itemNo}
                            </span>
                          )}
                        </div>
                        {item.serialNo && (
                          <div className="text-[9px] font-mono text-emerald-900 font-semibold mt-0.5 break-words">
                            IMEI/S.N.: <span className="font-bold">{item.serialNo}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-200 select-none">•</span>
                    )}
                  </td>
                  {disp.showHsn && (
                    <td className="text-center font-mono border-r border-emerald-100 px-1 py-1.5 text-[10px] align-top whitespace-nowrap">
                      {isFilled ? item.hsn || '-' : ''}
                    </td>
                  )}
                  <td className="text-center font-bold border-r border-emerald-100 px-1 py-1.5 align-top whitespace-nowrap">
                    {isFilled ? `${item.qty} ${item.unit || 'PCS'}` : ''}
                  </td>
                  <td className="text-right font-mono border-r border-emerald-100 px-1 py-1.5 align-top whitespace-nowrap">
                    {isFilled ? Number(item.rate || 0).toFixed(2) : ''}
                  </td>
                  <td className="text-right font-mono border-r border-emerald-100 px-1 py-1.5 align-top whitespace-nowrap">
                    {isFilled ? Number(item.taxableAmount || item.total || 0).toFixed(2) : ''}
                  </td>
                  {disp.showTaxBreakup && (
                    <>
                      <td className="text-right font-mono border-r border-emerald-100 px-1 py-1.5 text-[10px] align-top whitespace-nowrap">
                        {isFilled && item.cgstAmount ? `${Number(item.cgstAmount).toFixed(2)}` : ''}
                      </td>
                      <td className="text-right font-mono border-r border-emerald-100 px-1 py-1.5 text-[10px] align-top whitespace-nowrap">
                        {isFilled && item.sgstAmount ? `${Number(item.sgstAmount).toFixed(2)}` : ''}
                      </td>
                    </>
                  )}
                  <td className="text-right font-mono font-bold px-2 py-1.5 text-emerald-950 align-top whitespace-nowrap">
                    {isFilled ? Number(item.total || 0).toFixed(2) : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-emerald-100 font-bold border-t border-emerald-800 text-[11px] text-emerald-950 h-auto">
              <td colSpan={disp.showHsn ? 3 : 2} className="py-2 px-3 border-r border-emerald-200 align-top">
                <div className="flex flex-col gap-1">
                  <div className="font-bold">कुल जोड़ (Total):</div>
                  {disp.showWords && (
                    <div className="text-[10px] font-bold text-emerald-950 break-words leading-tight bg-emerald-200/80 p-1 rounded border border-emerald-300">
                      ({numberToHindiWords(grandTotal)})
                    </div>
                  )}
                </div>
              </td>
              <td className="text-center border-r border-emerald-200 font-bold align-top py-2 whitespace-nowrap">
                {items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0)} PCS
              </td>
              <td className="border-r border-emerald-200"></td>
              <td className="text-right font-mono border-r border-emerald-200 px-1 align-top py-2 whitespace-nowrap">
                ₹{Number(bill.taxableTotal || 0).toFixed(2)}
              </td>
              {disp.showTaxBreakup && (
                <>
                  <td className="text-right font-mono border-r border-emerald-200 px-1 text-[10px] align-top py-2 whitespace-nowrap">
                    ₹{Number(bill.cgstTotal || 0).toFixed(2)}
                  </td>
                  <td className="text-right font-mono border-r border-emerald-200 px-1 text-[10px] align-top py-2 whitespace-nowrap">
                    ₹{Number(bill.sgstTotal || 0).toFixed(2)}
                  </td>
                </>
              )}
              <td className="text-right font-mono font-black px-2 text-sm text-emerald-950 align-top py-2 whitespace-nowrap">
                ₹{grandTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 4. EMERALD BANK DETAILS & SCAN & PAY UPI QR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-2">
        {/* Left Side: Bank Details & Prominent UPI QR */}
        <div className="space-y-2 flex flex-col justify-between">
          {disp.showBankDetails && currentSettings.bankName && (
            <div className="border border-emerald-200 rounded p-2.5 bg-emerald-50/20 text-[10px] space-y-0.5">
              <div className="font-bold text-emerald-900 uppercase">🏦 बैंक विवरण (Bank Details):</div>
              <div className="text-[9.5px]">बैंक: <span className="font-semibold">{currentSettings.bankName}</span> | खाता: <span className="font-mono font-bold">{currentSettings.accountNo}</span></div>
              <div className="text-[9.5px]">IFSC: <span className="font-mono font-bold">{currentSettings.ifsc}</span></div>
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
            <div className="border border-dashed border-emerald-200 rounded p-2.5 flex items-center justify-center text-[10px] text-emerald-500 italic bg-emerald-50/10">
              धन्यवाद! पुनः पधारें • Thank You! Visit Again
            </div>
          )}
        </div>

        <div className="border border-emerald-300 rounded p-2.5 bg-emerald-50/40 flex flex-col justify-between">
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-700">
              <span>कर योग्य मूल्य:</span>
              <span className="font-mono font-bold">₹{Number(bill.taxableTotal || 0).toFixed(2)}</span>
            </div>
            {disp.showTaxBreakup && (
              <>
                <div className="flex justify-between text-slate-700">
                  <span>केंद्रीय जीएसटी (CGST):</span>
                  <span className="font-mono">₹{Number(bill.cgstTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>राज्य जीएसटी (SGST):</span>
                  <span className="font-mono">₹{Number(bill.sgstTotal || 0).toFixed(2)}</span>
                </div>
              </>
            )}
            {Number(bill.discount || 0) > 0 && (
              <>
                <div className="flex justify-between text-slate-700 border-t border-emerald-200 pt-0.5">
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

          <div className="mt-2 pt-2 border-t border-emerald-300 flex justify-between items-center bg-emerald-900 text-white p-2 rounded">
            <span className="font-bold text-xs uppercase tracking-wider">कुल देय राशि:</span>
            <span className="font-mono font-black text-xl text-emerald-200">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 5. TERMS & SIGNATURE */}
      <div className="border-t border-emerald-300 pt-2 grid grid-cols-3 gap-2">
        <div className="col-span-2">
          {disp.showTerms && currentSettings.terms && (
            <ol className="list-decimal list-inside text-[9px] text-slate-600 space-y-0.5">
              {currentSettings.terms.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
          )}
        </div>
        <div className="text-center flex flex-col justify-between items-center border border-emerald-200 rounded p-1 bg-emerald-50/20">
          <div className="text-[10px] font-bold text-emerald-950">कृते {currentSettings.firmName}</div>
          <div className="h-8"></div>
          {disp.showSignatory && (
            <div className="border-t border-emerald-300 w-full pt-0.5 text-[9px] font-semibold text-slate-700">
              {currentSettings.signatoryText || 'अधिकृत हस्ताक्षरकर्ता'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
