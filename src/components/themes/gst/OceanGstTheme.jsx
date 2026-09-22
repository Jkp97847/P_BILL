import React from 'react';
import GaneshLogo from '../../GaneshLogo';
import { numberToHindiWords, numberToIndianWords } from '../../../utils/numberToWords';
import UpiQrCode from '../../common/UpiQrCode';

export default function OceanGstTheme({ bill, settings }) {
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
    <div className="bg-white text-slate-900 border-2 border-sky-900 rounded-lg p-5 max-w-4xl mx-auto shadow-md text-xs leading-relaxed font-sans print:border-sky-900 print:p-4 print:shadow-none">
      {/* 1. OCEAN TECH HEADER */}
      <div className="border-b-2 border-sky-900 pb-2 mb-2">
        <div className="flex justify-between items-center text-[10px] text-sky-900 font-bold mb-1">
          <span className="bg-sky-100 text-sky-950 px-2.5 py-0.5 rounded font-bold border border-sky-200">
            ⚡ OCEAN TECH DIGITAL INVOICE / जीएसटी बिल
          </span>
          {shouldShowGanesh && (
            <span className="text-sky-800 font-bold">
              {currentSettings.ganeshText || '॥ श्री गणेशाय नमः ॥'}
            </span>
          )}
          <span className="text-slate-600 font-semibold">मूल प्रति (ORIGINAL FOR RECIPIENT)</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left mt-1">
          <div className="flex items-center gap-3">
            {disp.showLogo && currentSettings.logo && (
              <img
                src={currentSettings.logo}
                alt="Logo"
                className="w-14 h-14 object-contain rounded border-2 border-sky-300 p-0.5 shadow-xs"
              />
            )}
            <div>
              {disp.showFirmName && (
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-sky-950">
                  {currentSettings.firmName || 'फर्म का नाम'}
                </h1>
              )}
              {disp.showTagline && currentSettings.tagline && (
                <p className="text-xs text-sky-700 font-medium">{currentSettings.tagline}</p>
              )}
              {disp.showAddress && currentSettings.address && (
                <p className="text-[11px] text-slate-600 mt-0.5">📍 {currentSettings.address}</p>
              )}
            </div>
          </div>

          <div className="text-right text-xs text-slate-700 space-y-0.5">
            {disp.showMobile && currentSettings.mobile && (
              <div className="font-bold text-sky-950 font-mono">📞 {currentSettings.mobile}</div>
            )}
            {disp.showAlternateMobile && currentSettings.alternateMobile && (
              <div className="text-slate-600 font-mono">अतिरिक्त: {currentSettings.alternateMobile}</div>
            )}
            {disp.showEmail && currentSettings.email && (
              <div className="text-[10px] text-slate-500 font-mono">✉️ {currentSettings.email}</div>
            )}
          </div>
        </div>

        {/* GSTIN & State bar */}
        <div className="flex flex-wrap justify-center gap-4 mt-2 pt-1.5 border-t border-sky-200 text-[11px] font-bold">
          {disp.showGstin && currentSettings.gstin && (
            <span className="bg-sky-50 text-sky-950 px-2 py-0.5 rounded border border-sky-200">
              GSTIN: <span className="font-mono">{currentSettings.gstin}</span>
            </span>
          )}
          {disp.showPan && currentSettings.pan && (
            <span className="bg-sky-50 text-sky-950 px-2 py-0.5 rounded border border-sky-200">
              PAN: <span className="font-mono">{currentSettings.pan}</span>
            </span>
          )}
          {disp.showState && (
            <span className="text-slate-700">
              राज्य: {currentSettings.state || 'Rajasthan'} ({currentSettings.stateCode || '08'})
            </span>
          )}
        </div>
      </div>

      {/* 2. CUSTOMER & INVOICE DETAILS */}
      <div className="grid grid-cols-2 border border-sky-300 rounded-lg p-2.5 mb-2.5 bg-sky-50/40 text-[11px]">
        <div>
          <div className="font-bold text-[10px] text-sky-900 uppercase">ग्राहक का विवरण (Billed To):</div>
          <div className="font-black text-sm text-slate-900">{bill.customerName || 'Cash Customer'}</div>
          {disp.showCustomerDetails && bill.customerMobile && (
            <div>📞 मोबाइल: <span className="font-mono font-bold">{bill.customerMobile}</span></div>
          )}
          {disp.showCustomerDetails && bill.customerGstin && (
            <div className="font-bold text-sky-900">GSTIN: <span className="font-mono">{bill.customerGstin}</span></div>
          )}
          {disp.showCustomerDetails && bill.customerAddress && (
            <div className="text-slate-600 text-[10px]">पता: {bill.customerAddress}</div>
          )}
        </div>

        <div className="text-right space-y-0.5">
          <div>
            बिल क्र. / Inv No:{' '}
            <span className="font-mono font-black text-sm text-sky-950 bg-sky-100 px-1.5 py-0.5 rounded border border-sky-300">
              {bill.billNo || '---'}
            </span>
          </div>
          <div>
            दिनांक / Date: <span className="font-mono font-bold">{bill.date || '---'}</span>
          </div>
          {bill.time && (
            <div className="text-[10px] text-slate-500">
              समय / Time: <span className="font-mono">{bill.time}</span>
            </div>
          )}
          <div>
            भुगतान माध्यम / Mode:{' '}
            <span className="font-bold uppercase text-sky-800 bg-sky-100/80 px-1 rounded">
              {bill.paymentMode || 'CASH'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ITEMS TABLE - EXACTLY 10 ROWS */}
      <div className="border border-sky-900 rounded-lg overflow-hidden mb-2">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-sky-900 text-white text-center font-bold">
              <th className="p-1.5 border-r border-sky-800 w-8">क्र.</th>
              <th className="p-1.5 border-r border-sky-800 text-left">सामान / विवरण (Description of Goods)</th>
              <th className="p-1.5 border-r border-sky-800 w-16">HSN</th>
              <th className="p-1.5 border-r border-sky-800 w-10">मात्रा</th>
              <th className="p-1.5 border-r border-sky-800 w-16 text-right">दर (Rate)</th>
              <th className="p-1.5 border-r border-sky-800 w-18 text-right">कर योग्य मूल्य</th>
              <th className="p-1.5 border-r border-sky-800 w-12 text-center">GST%</th>
              <th className="p-1.5 border-r border-sky-800 w-16 text-right">CGST</th>
              <th className="p-1.5 border-r border-sky-800 w-16 text-right">SGST</th>
              <th className="p-1.5 w-20 text-right">कुल रकम (₹)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => {
              const isEven = index % 2 === 0;
              const rowBg = item ? (isEven ? 'bg-white' : 'bg-sky-50/30') : 'bg-white';

              if (!item) {
                return (
                  <tr key={index} className={`border-b border-sky-200 h-6 ${rowBg}`}>
                    <td className="p-1 text-center border-r border-sky-200 text-slate-300 font-mono text-[10px]">
                      {index + 1}
                    </td>
                    <td className="p-1 border-r border-sky-200">&nbsp;</td>
                    <td className="p-1 border-r border-sky-200">&nbsp;</td>
                    <td className="p-1 border-r border-sky-200">&nbsp;</td>
                    <td className="p-1 border-r border-sky-200">&nbsp;</td>
                    <td className="p-1 border-r border-sky-200">&nbsp;</td>
                    <td className="p-1 border-r border-sky-200">&nbsp;</td>
                    <td className="p-1 border-r border-sky-200">&nbsp;</td>
                    <td className="p-1 border-r border-sky-200">&nbsp;</td>
                    <td className="p-1 text-right">&nbsp;</td>
                  </tr>
                );
              }

              const taxable = item.taxableAmount || (item.quantity * item.rate);
              const cgst = item.cgst || (item.taxAmount ? item.taxAmount / 2 : 0);
              const sgst = item.sgst || (item.taxAmount ? item.taxAmount / 2 : 0);

              return (
                <tr key={index} className={`border-b border-sky-200 h-6 ${rowBg}`}>
                  <td className="p-1 text-center font-mono border-r border-sky-200">{index + 1}</td>
                  <td className="p-1 border-r border-sky-200">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono flex flex-wrap gap-2">
                      {item.itemNo && <span>#{item.itemNo}</span>}
                      {item.serialNo && (
                        <span className="text-sky-900 font-semibold bg-sky-50 px-1 rounded border border-sky-200">
                          IMEI/S.N.: {item.serialNo}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-1 text-center font-mono border-r border-sky-200">{item.hsn || '8517'}</td>
                  <td className="p-1 text-center font-mono font-bold border-r border-sky-200">{item.quantity}</td>
                  <td className="p-1 text-right font-mono border-r border-sky-200">{Number(item.rate).toFixed(2)}</td>
                  <td className="p-1 text-right font-mono border-r border-sky-200">{Number(taxable).toFixed(2)}</td>
                  <td className="p-1 text-center font-mono border-r border-sky-200">{item.gstRate}%</td>
                  <td className="p-1 text-right font-mono border-r border-sky-200">{Number(cgst).toFixed(2)}</td>
                  <td className="p-1 text-right font-mono border-r border-sky-200">{Number(sgst).toFixed(2)}</td>
                  <td className="p-1 text-right font-mono font-bold text-sky-950">
                    {Number(item.total).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. TOTALS & WORDS SECTION */}
      <div className="grid grid-cols-12 gap-2 mb-2">
        {/* Words and Hindi Amount */}
        <div className="col-span-7 border border-sky-300 rounded-lg p-2.5 bg-sky-50/30 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-sky-900 uppercase">राशि शब्दों में (Amount in Words):</div>
            <div className="font-bold text-slate-900 mt-0.5 capitalize">
              INR {numberToIndianWords(grandTotal)} Only
            </div>
            <div className="text-[11px] text-sky-800 font-semibold mt-1">
              (अक्षरों में: {numberToHindiWords(grandTotal)})
            </div>
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-sky-200 mt-2">
            कुल वस्तुएं / Total Items:{' '}
            <span className="font-bold text-slate-800">{items.reduce((sum, it) => sum + Number(it.quantity || 1), 0)}</span>
          </div>
        </div>

        {/* Amount Calculations Box */}
        <div className="col-span-5 border border-sky-300 rounded-lg p-2.5 bg-white space-y-1 text-[11px]">
          <div className="flex justify-between text-slate-600">
            <span>कुल कर योग्य मूल्य (Taxable):</span>
            <span className="font-mono font-semibold">₹{Number(bill.taxableAmount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>कुल CGST:</span>
            <span className="font-mono font-semibold">₹{Number(bill.cgstAmount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>कुल SGST:</span>
            <span className="font-mono font-semibold">₹{Number(bill.sgstAmount || 0).toFixed(2)}</span>
          </div>
          {Number(bill.roundOff || 0) !== 0 && (
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>राउंड ऑफ (Round Off):</span>
              <span className="font-mono">{Number(bill.roundOff).toFixed(2)}</span>
            </div>
          )}
          <div className="border-t-2 border-sky-900 pt-1 flex justify-between items-center text-sky-950">
            <span className="font-black text-xs">अंतिम कुल योग (GRAND TOTAL):</span>
            <span className="font-mono font-black text-base text-sky-900">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 5. FOOTER: BANK DETAILS, UPI QR & SIGNATURE */}
      <div className="grid grid-cols-12 gap-2 border-t-2 border-sky-900 pt-2">
        {/* Bank & UPI QR */}
        <div className="col-span-8 flex gap-3 items-start border-r border-sky-200 pr-2">
          {disp.showUpiQr && currentSettings.upiId && (
            <div className="bg-sky-50/50 p-1.5 rounded border border-sky-300 flex flex-col items-center justify-center shrink-0">
              <UpiQrCode
                upiId={currentSettings.upiId}
                payeeName={currentSettings.firmName}
                amount={grandTotal}
                size={80}
              />
              <span className="text-[9px] font-bold text-sky-900 mt-1 uppercase">स्कैन कर भुगतान करें</span>
            </div>
          )}

          <div className="space-y-0.5 text-[10px] text-slate-600">
            {disp.showBankDetails && (
              <>
                <div className="font-bold text-sky-900 text-[11px]">बैंक खाता विवरण (Bank Details):</div>
                {currentSettings.bankName && <div>बैंक: <span className="font-semibold text-slate-900">{currentSettings.bankName}</span></div>}
                {currentSettings.accountNo && <div>खाता सं: <span className="font-mono font-bold text-slate-900">{currentSettings.accountNo}</span></div>}
                {currentSettings.ifsc && <div>IFSC: <span className="font-mono font-bold text-slate-900">{currentSettings.ifsc}</span></div>}
                {currentSettings.upiId && <div>UPI ID: <span className="font-mono font-bold text-slate-900">{currentSettings.upiId}</span></div>}
              </>
            )}

            {disp.showTerms && currentSettings.terms && currentSettings.terms.length > 0 && (
              <div className="pt-1 text-[9px] text-slate-500">
                <span className="font-bold text-slate-700">शर्तें: </span>
                {currentSettings.terms.slice(0, 2).join(' | ')}
              </div>
            )}
          </div>
        </div>

        {/* Signatures */}
        <div className="col-span-4 flex flex-col justify-between text-right pl-2">
          <div className="text-[10px] text-slate-500 italic">
            वास्ते: <span className="font-bold text-slate-800">{currentSettings.firmName || 'प्राधिकृत विक्रेता'}</span>
          </div>

          <div className="pt-8">
            <div className="border-t border-sky-400 font-bold text-[10px] text-sky-950">
              {currentSettings.signatoryText || 'अधिकृत हस्ताक्षरकर्ता (Authorized Signatory)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
