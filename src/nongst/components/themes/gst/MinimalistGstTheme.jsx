import React from 'react';
import GaneshLogo from '../../GaneshLogo';
import DigitalSignatureBadge from '../../DigitalSignatureBadge';
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
    <div id="printable-bill" className="bg-white text-black border-2 border-black p-5 max-w-4xl mx-auto shadow-sm text-xs leading-relaxed font-sans print:border-black print:p-4 print:shadow-none">
      {/* 1. TOP HEADER */}
      <div className="grid grid-cols-12 items-center border-b-2 border-black pb-2 mb-2 min-h-[56px] gap-2">
        <div className="col-span-3 flex items-center justify-start">
          {disp.showLogo && currentSettings.logo ? (
            <img
              src={currentSettings.logo}
              alt="Logo"
              className="w-16 h-16 object-contain border border-black p-0.5"
            />
          ) : (
            <div className="w-16 h-16 hidden sm:block"></div>
          )}
        </div>

        <div className="col-span-6 text-center flex flex-col items-center justify-center">
          {shouldShowGanesh && (
            <GaneshLogo
              showLogo={true}
              text={currentSettings.ganeshText || '॥ श्री गणेशाय नमः ॥'}
              size="md"
            />
          )}
        </div>

        <div className="col-span-3 text-right flex flex-col items-end justify-center text-xs font-semibold text-black space-y-0.5">
          {disp.showMobile && currentSettings.mobile && (
            <div className="flex items-center gap-1 font-bold text-black font-mono">
              <span>📞</span>
              <span>{currentSettings.mobile}</span>
            </div>
          )}
          {disp.showAlternateMobile && currentSettings.alternateMobile && (
            <div className="text-[11px] font-mono text-black/80">📞 {currentSettings.alternateMobile}</div>
          )}
          {disp.showEmail && currentSettings.email && (
            <div className="text-[10px] font-mono text-black/80">✉️ {currentSettings.email}</div>
          )}
        </div>
      </div>

      {/* Invoice Title */}
      <div className="text-center my-1 border-y border-black py-0.5 font-mono text-[11px] font-black tracking-widest uppercase">
        RETAIL CASH MEMO / खुदरा बिल (मूल प्रति / ORIGINAL)
      </div>

      {/* Firm Info */}
      <div className="text-center border-b border-black pb-2 mb-2">
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
              <th className="py-1 px-1 border-r border-white/30 w-12">मात्रा</th>
              <th className="py-1 px-1 border-r border-white/30 w-16 text-right">दर / रेट (₹)</th>
              <th className="py-1 px-2 text-right w-24">कुल रकम (₹)</th>
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
                    {isFilled ? Number(item.rate || item.price || 0).toFixed(2) : ''}
                  </td>
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
                {items.reduce((s, it) => s + (Number(it.qty) || 0), 0)} PCS
              </td>
              <td className="text-right px-2 py-2 font-bold text-black uppercase">
                कुल राशि:
              </td>
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
            <div className="w-full pt-2 mt-auto flex justify-center">
              <DigitalSignatureBadge
                ownerName={currentSettings.ownerName}
                firmName={currentSettings.firmName}
                signatoryText={currentSettings.signatoryText}
                date={bill.date}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
