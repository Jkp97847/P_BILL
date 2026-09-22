import React from 'react';
import GaneshLogo from '../../GaneshLogo';
import { numberToHindiWords, numberToIndianWords } from '../../../utils/numberToWords';
import UpiQrCode from '../../common/UpiQrCode';

export default function MinimalistGstTheme({ bill, settings }) {
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
    <div className="bg-white text-black border-2 border-black p-5 max-w-4xl mx-auto shadow-sm text-xs leading-relaxed font-sans print:border-black print:p-4 print:shadow-none">
      {/* 1. TOP HEADER - MINIMALIST HIGH CONTRAST */}
      <div className="border-b-2 border-black pb-3 mb-2">
        <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider pb-1 mb-1 border-b border-black">
          <span>TAX INVOICE / जीएसटी बिल</span>
          {shouldShowGanesh && (
            <span className="font-sans font-bold text-black">
              {currentSettings.ganeshText || '॥ श्री गणेशाय नमः ॥'}
            </span>
          )}
          <span>मूल प्रति / ORIGINAL FOR RECIPIENT</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
          <div className="flex items-center gap-3">
            {disp.showLogo && currentSettings.logo && (
              <img
                src={currentSettings.logo}
                alt="Logo"
                className="w-14 h-14 object-contain border border-black p-0.5"
              />
            )}
            <div>
              {disp.showFirmName && (
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                  {currentSettings.firmName || 'फर्म का नाम'}
                </h1>
              )}
              {disp.showTagline && currentSettings.tagline && (
                <p className="text-xs font-medium text-black/80">{currentSettings.tagline}</p>
              )}
              {disp.showAddress && currentSettings.address && (
                <p className="text-[11px] text-black font-normal mt-0.5">📍 {currentSettings.address}</p>
              )}
            </div>
          </div>

          <div className="text-right text-xs space-y-0.5">
            {disp.showMobile && currentSettings.mobile && (
              <div className="font-mono font-bold text-black">📞 {currentSettings.mobile}</div>
            )}
            {disp.showAlternateMobile && currentSettings.alternateMobile && (
              <div className="font-mono text-black/80">फोन 2: {currentSettings.alternateMobile}</div>
            )}
            {disp.showEmail && currentSettings.email && (
              <div className="text-[10px] font-mono text-black/80">{currentSettings.email}</div>
            )}
          </div>
        </div>

        {/* GSTIN & PAN bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2 pt-1.5 border-t border-black text-[11px] font-bold">
          {disp.showGstin && currentSettings.gstin && (
            <span className="border border-black px-2 py-0.5 font-mono">
              GSTIN: {currentSettings.gstin}
            </span>
          )}
          {disp.showPan && currentSettings.pan && (
            <span className="border border-black px-2 py-0.5 font-mono">
              PAN: {currentSettings.pan}
            </span>
          )}
          {disp.showState && currentSettings.state && (
            <span>
              राज्य: {currentSettings.state} ({currentSettings.stateCode || '08'})
            </span>
          )}
        </div>
      </div>

      {/* 2. BUYER & INVOICE META */}
      <div className="grid grid-cols-2 border border-black mb-2 divide-x border-collapse text-[11px]">
        <div className="p-2 space-y-1">
          <div className="font-bold text-[10px] uppercase border-b border-black pb-0.5">
            ग्राहक का विवरण (Buyer Details):
          </div>
          <div className="font-black text-sm text-black">
            {bill.customerName || 'नकद ग्राहक (Cash Customer)'}
          </div>
          {disp.showCustomerDetails && bill.customerMobile && (
            <div>📞 मोबाइल: <span className="font-mono font-bold">{bill.customerMobile}</span></div>
          )}
          {disp.showCustomerDetails && bill.customerGstin && (
            <div className="font-bold">GSTIN: <span className="font-mono">{bill.customerGstin}</span></div>
          )}
          {disp.showCustomerDetails && bill.customerAddress && (
            <div className="text-black/80">पता: {bill.customerAddress}</div>
          )}
        </div>

        <div className="p-2 space-y-1 bg-neutral-50/50">
          <div className="flex justify-between">
            <span className="font-bold text-black/70">बिल नंबर (Invoice #):</span>
            <span className="font-mono font-black text-black">{bill.billNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-black/70">दिनांक (Date):</span>
            <span className="font-mono font-bold">{bill.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-black/70">भुगतान माध्यम:</span>
            <span className="font-bold">{bill.paymentMode || 'Cash / UPI'}</span>
          </div>
        </div>
      </div>

      {/* 3. 10-ROW TABLE */}
      <div className="border border-black mb-2 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white font-bold text-[10px] uppercase text-center">
              <th className="py-1 px-1 border-r border-white/30 w-8">#</th>
              <th className="py-1 px-2 border-r border-white/30 text-left">सामान / विवरण (Description)</th>
              {disp.showHsn && <th className="py-1 px-1 border-r border-white/30 w-14">HSN</th>}
              <th className="py-1 px-1 border-r border-white/30 w-10">मात्रा</th>
              <th className="py-1 px-1 border-r border-white/30 w-14 text-right">दर (₹)</th>
              <th className="py-1 px-1 border-r border-white/30 w-16 text-right">टैक्सेबल</th>
              {disp.showTaxBreakup && (
                <>
                  <th className="py-1 px-1 border-r border-white/30 w-14 text-right">CGST</th>
                  <th className="py-1 px-1 border-r border-white/30 w-14 text-right">SGST</th>
                </>
              )}
              <th className="py-1 px-2 text-right w-20">कुल (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/20 text-[11px]">
            {rows.map((item, index) => {
              const isFilled = Boolean(item && (item.name || item.total > 0));
              return (
                <tr key={index} className={`min-h-[26px] ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/40'}`}>
                  <td className="text-center font-bold border-r border-black/20 px-1 py-1.5 align-top">
                    {index + 1}
                  </td>
                  <td className="border-r border-black/20 px-2 py-1.5 font-medium align-top break-words">
                    {isFilled ? (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-black">{item.name}</span>
                          {item.itemNo && (
                            <span className="text-[9px] font-mono border border-black/40 px-1 py-0.2 rounded font-bold">
                              #{item.itemNo}
                            </span>
                          )}
                        </div>
                        {item.serialNo && (
                          <div className="text-[9px] font-mono text-black/90 font-semibold mt-0.5">
                            IMEI/S.N.: <span className="font-bold">{item.serialNo}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-200 select-none">•</span>
                    )}
                  </td>
                  {disp.showHsn && (
                    <td className="text-center font-mono border-r border-black/20 px-1 py-1.5 text-[10px] align-top">
                      {isFilled ? item.hsn || '-' : ''}
                    </td>
                  )}
                  <td className="text-center font-bold border-r border-black/20 px-1 py-1.5 align-top">
                    {isFilled ? `${item.qty} ${item.unit || 'PCS'}` : ''}
                  </td>
                  <td className="text-right font-mono border-r border-black/20 px-1 py-1.5 align-top">
                    {isFilled ? Number(item.rate || 0).toFixed(2) : ''}
                  </td>
                  <td className="text-right font-mono border-r border-black/20 px-1 py-1.5 align-top">
                    {isFilled ? Number(item.taxableAmount || item.total || 0).toFixed(2) : ''}
                  </td>
                  {disp.showTaxBreakup && (
                    <>
                      <td className="text-right font-mono border-r border-black/20 px-1 py-1.5 text-[10px] align-top">
                        {isFilled ? (
                          <div>
                            <div>₹{Number(item.cgstAmount || 0).toFixed(2)}</div>
                            <div className="text-[9px] text-black/60">@{Number(item.gstRate || 0) / 2}%</div>
                          </div>
                        ) : ''}
                      </td>
                      <td className="text-right font-mono border-r border-black/20 px-1 py-1.5 text-[10px] align-top">
                        {isFilled ? (
                          <div>
                            <div>₹{Number(item.sgstAmount || 0).toFixed(2)}</div>
                            <div className="text-[9px] text-black/60">@{Number(item.gstRate || 0) / 2}%</div>
                          </div>
                        ) : ''}
                      </td>
                    </>
                  )}
                  <td className="text-right font-mono font-bold px-2 py-1.5 align-top">
                    {isFilled ? Number(item.total || 0).toFixed(2) : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black bg-neutral-100 font-bold text-[11px]">
              <td colSpan={disp.showHsn ? 3 : 2} className="px-2 py-2 text-left">
                {disp.showWords && (
                  <span className="font-semibold text-black">
                    (अक्षरों में: {numberToHindiWords(grandTotal)})
                  </span>
                )}
              </td>
              <td className="text-center font-bold px-1 py-2 font-mono">
                {items.reduce((s, it) => s + (Number(it.qty) || 0), 0)}
              </td>
              <td className="text-right px-1 py-2 font-mono text-[10px] text-black/60">योग:</td>
              <td className="text-right font-mono px-1 py-2">
                ₹{Number(bill.taxableTotal || 0).toFixed(2)}
              </td>
              {disp.showTaxBreakup && (
                <>
                  <td className="text-right font-mono px-1 py-2 text-[10px]">
                    ₹{Number(bill.cgstTotal || 0).toFixed(2)}
                  </td>
                  <td className="text-right font-mono px-1 py-2 text-[10px]">
                    ₹{Number(bill.sgstTotal || 0).toFixed(2)}
                  </td>
                </>
              )}
              <td className="text-right font-mono font-black text-sm px-2 py-2">
                ₹{grandTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 4. FOOTER: BANK, TERMS, QR, SIGNATURE */}
      <div className="grid grid-cols-12 gap-2 border border-black p-2.5 text-[11px]">
        {/* Bank & Terms */}
        <div className="col-span-8 space-y-2">
          {disp.showBankDetails && currentSettings.bankName && (
            <div className="border-b border-black/20 pb-1.5">
              <span className="font-bold text-black uppercase text-[10px] block">बैंक विवरण:</span>
              <div className="font-mono text-[10px] space-x-2">
                <span>बैंक: <b>{currentSettings.bankName}</b></span>
                <span>A/C: <b>{currentSettings.accountNo}</b></span>
                <span>IFSC: <b>{currentSettings.ifsc}</b></span>
              </div>
            </div>
          )}

          {disp.showTerms && currentSettings.terms && currentSettings.terms.length > 0 && (
            <div>
              <span className="font-bold text-black uppercase text-[10px] block mb-0.5">नियम एवं शर्तें:</span>
              <ul className="list-decimal list-inside space-y-0.5 text-[10px] text-black/90">
                {currentSettings.terms.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* UPI QR & Signature */}
        <div className="col-span-4 flex flex-col justify-between items-center text-center border-l border-black pl-2">
          {disp.showUpiQr && (
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold uppercase mb-0.5">UPI स्कैन & पे</span>
              <UpiQrCode
                upiId={currentSettings.upiId || `${currentSettings.mobile}@upi`}
                payeeName={currentSettings.firmName}
                amount={grandTotal}
                billNo={bill.billNo}
                size={85}
              />
              <span className="text-[9px] font-mono font-bold mt-0.5">
                {currentSettings.upiId || `${currentSettings.mobile}@upi`}
              </span>
            </div>
          )}

          {disp.showSignatory && (
            <div className="w-full pt-4 mt-auto border-t border-dashed border-black/40">
              <div className="text-[10px] font-bold uppercase">{currentSettings.firmName}</div>
              <div className="text-[9px] text-black/70 mt-1">
                {currentSettings.signatoryText || 'अधिकृत हस्ताक्षरकर्ता'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
