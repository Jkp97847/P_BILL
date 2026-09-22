import React from 'react';
import GaneshLogo from '../../GaneshLogo';
import { numberToHindiWords, numberToIndianWords } from '../../../utils/numberToWords';
import UpiQrCode from '../../common/UpiQrCode';

export default function CompactGstTheme({ bill, settings }) {
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
    <div className="bg-white text-slate-900 border border-slate-400 p-3 sm:p-4 rounded max-w-4xl mx-auto shadow-xs text-[11px] leading-tight font-mono">
      {/* 1. COMPACT DENSE HEADER */}
      <div className="border-b border-slate-400 pb-1 mb-1 text-center font-sans">
        {shouldShowGanesh && (
          <div className="mb-0.5">
            <GaneshLogo
              showLogo={false}
              text={currentSettings.ganeshText || '॥ श्री गणेशाय नमः ॥'}
              size="sm"
            />
          </div>
        )}

        <div className="flex justify-between items-center px-1">
          <div className="text-left text-[10px] text-slate-700">
            {disp.showMobile && currentSettings.mobile && <div>मो.: {currentSettings.mobile}</div>}
            {disp.showEmail && currentSettings.email && <div>ईमेल: {currentSettings.email}</div>}
          </div>

          <div className="text-center">
            {disp.showFirmName && (
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                {currentSettings.firmName || 'फर्म का नाम'}
              </h1>
            )}
            {disp.showTagline && currentSettings.tagline && (
              <p className="text-[10px] text-slate-600 italic">{currentSettings.tagline}</p>
            )}
            {disp.showAddress && currentSettings.address && (
              <p className="text-[10px] text-slate-700">{currentSettings.address}</p>
            )}
          </div>

          <div className="text-right text-[10px]">
            <span className="border border-slate-900 px-1 py-0.5 font-bold uppercase">
              GST INVOICE
            </span>
          </div>
        </div>

        {/* GSTIN / PAN Bar */}
        <div className="flex justify-center gap-3 mt-1 pt-0.5 border-t border-dotted border-slate-300 text-[10px] font-bold">
          {disp.showGstin && currentSettings.gstin && (
            <span>GSTIN: <span className="font-mono">{currentSettings.gstin}</span></span>
          )}
          {disp.showPan && currentSettings.pan && (
            <span>PAN: <span className="font-mono">{currentSettings.pan}</span></span>
          )}
          {disp.showState && (
            <span>राज्य: {currentSettings.state || 'Rajasthan'} ({currentSettings.stateCode || '08'})</span>
          )}
        </div>
      </div>

      {/* 2. CUSTOMER & INVOICE METADATA */}
      <div className="grid grid-cols-2 border border-slate-400 p-1 mb-1 gap-2 font-sans text-[10px]">
        <div>
          <span className="font-bold text-slate-600">ग्राहक (Buyer): </span>
          <span className="font-bold text-slate-900 text-[11px]">{bill.customerName || 'Cash Customer'}</span>
          {disp.showCustomerDetails && bill.customerMobile && (
            <span className="ml-2">| मो.: <span className="font-mono">{bill.customerMobile}</span></span>
          )}
          {disp.showCustomerDetails && bill.customerGstin && (
            <div>GSTIN: <span className="font-mono font-bold">{bill.customerGstin}</span></div>
          )}
        </div>
        <div className="text-right">
          <span className="font-bold text-slate-600">बिल सं.: </span>
          <span className="font-mono font-bold text-slate-900 text-[11px] mr-3">{bill.billNo}</span>
          <span className="font-bold text-slate-600">दिनांक: </span>
          <span className="font-bold">{bill.date}</span>
        </div>
      </div>

      {/* 3. 10-ROW FIXED TABLE */}
      <table className="w-full text-left border border-slate-400 border-collapse mb-1 font-sans text-[10px]">
        <thead>
          <tr className="bg-slate-200 border-b border-slate-400 font-bold uppercase text-center">
            <th className="py-1 px-1 border-r border-slate-300 w-6">#</th>
            <th className="py-1 px-2 border-r border-slate-300 text-left">सामान / मॉडल (Item Name)</th>
            {disp.showHsn && <th className="py-1 px-1 border-r border-slate-300 w-12">HSN</th>}
            <th className="py-1 px-1 border-r border-slate-300 w-8">मात्रा</th>
            <th className="py-1 px-1 border-r border-slate-300 w-12 text-right">दर (₹)</th>
            <th className="py-1 px-1 border-r border-slate-300 w-14 text-right">टैक्सेबल</th>
            {disp.showTaxBreakup && (
              <>
                <th className="py-1 px-1 border-r border-slate-300 w-12 text-right">CGST</th>
                <th className="py-1 px-1 border-r border-slate-300 w-12 text-right">SGST</th>
              </>
            )}
            <th className="py-1 px-2 text-right w-16">कुल (₹)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, index) => {
            const isFilled = Boolean(item && (item.name || item.total > 0));
            return (
              <tr
                key={index}
                className={`min-h-[24px] h-auto border-b border-slate-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                }`}
              >
                <td className="text-center font-mono border-r border-slate-300 px-1 py-1 text-slate-500 align-top">
                  {index + 1}
                </td>
                <td className="border-r border-slate-300 px-2 py-1 font-medium break-words align-top">
                  {isFilled ? (
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 break-words">{item.name}</span>
                        {item.itemNo && (
                          <span className="text-[8px] bg-slate-100 font-mono px-1 rounded text-slate-600 shrink-0">
                            {item.itemNo}
                          </span>
                        )}
                      </div>
                      {item.serialNo && (
                        <div className="text-[8px] font-mono text-indigo-900 font-semibold mt-0.5 break-words">
                          IMEI/S.N.: <span className="font-bold">{item.serialNo}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-200">-</span>
                  )}
                </td>
                {disp.showHsn && (
                  <td className="text-center font-mono border-r border-slate-300 px-1 py-1 text-[9px] align-top whitespace-nowrap">
                    {isFilled ? item.hsn || '-' : ''}
                  </td>
                )}
                <td className="text-center font-bold border-r border-slate-300 px-1 py-1 align-top whitespace-nowrap">
                  {isFilled ? item.qty : ''}
                </td>
                <td className="text-right font-mono border-r border-slate-300 px-1 py-1 align-top whitespace-nowrap">
                  {isFilled ? Number(item.rate || 0).toFixed(2) : ''}
                </td>
                <td className="text-right font-mono border-r border-slate-300 px-1 py-1 align-top whitespace-nowrap">
                  {isFilled ? Number(item.taxableAmount || item.total || 0).toFixed(2) : ''}
                </td>
                {disp.showTaxBreakup && (
                  <>
                    <td className="text-right font-mono border-r border-slate-300 px-1 py-1 text-[9px] align-top whitespace-nowrap">
                      {isFilled && item.cgstAmount ? `${Number(item.cgstAmount).toFixed(2)}` : ''}
                    </td>
                    <td className="text-right font-mono border-r border-slate-300 px-1 py-1 text-[9px] align-top whitespace-nowrap">
                      {isFilled && item.sgstAmount ? `${Number(item.sgstAmount).toFixed(2)}` : ''}
                    </td>
                  </>
                )}
                <td className="text-right font-mono font-bold px-2 py-1 text-slate-900 align-top whitespace-nowrap">
                  {isFilled ? Number(item.total || 0).toFixed(2) : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-slate-200 font-bold border-t border-slate-400 text-[10px] h-auto">
            <td colSpan={disp.showHsn ? 3 : 2} className="py-1.5 px-2 border-r border-slate-300 align-top">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold">योग (Total):</span>
                {disp.showWords && (
                  <span className="text-[9px] font-semibold text-slate-800 break-words leading-tight">
                    ({numberToHindiWords(grandTotal)})
                  </span>
                )}
              </div>
            </td>
            <td className="text-center border-r border-slate-300 align-top py-1.5 whitespace-nowrap">
              {items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0)}
            </td>
            <td className="border-r border-slate-300"></td>
            <td className="text-right font-mono border-r border-slate-300 px-1 align-top py-1.5 whitespace-nowrap">
              ₹{Number(bill.taxableTotal || 0).toFixed(2)}
            </td>
            {disp.showTaxBreakup && (
              <>
                <td className="text-right font-mono border-r border-slate-300 px-1 text-[9px] align-top py-1.5 whitespace-nowrap">
                  ₹{Number(bill.cgstTotal || 0).toFixed(2)}
                </td>
                <td className="text-right font-mono border-r border-slate-300 px-1 text-[9px] align-top py-1.5 whitespace-nowrap">
                  ₹{Number(bill.sgstTotal || 0).toFixed(2)}
                </td>
              </>
            )}
            <td className="text-right font-mono font-black px-2 text-xs text-slate-900 align-top py-1.5 whitespace-nowrap">
              ₹{grandTotal.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 4. COMPACT SUMMARY & SIGNATURE (With Scannable UPI QR Code) */}
      <div className="grid grid-cols-2 border border-slate-400 p-1.5 gap-2 font-sans text-[10px]">
        <div className="space-y-1">
          {disp.showBankDetails && currentSettings.bankName && (
            <div className="text-[9px] text-slate-700">
              बैंक: <span className="font-semibold">{currentSettings.bankName}</span> | खाता: <span className="font-mono font-bold">{currentSettings.accountNo}</span> | IFSC: <span className="font-mono font-bold">{currentSettings.ifsc}</span>
            </div>
          )}
          {disp.showUpiQr !== false && (
            <div className="pt-0.5">
              <UpiQrCode
                upiId={currentSettings.upiId || (currentSettings.mobile ? `${currentSettings.mobile}@upi` : 'shreeshyam@sbi')}
                shopName={currentSettings.firmName || currentSettings.shopName}
                amount={grandTotal}
                billNo={bill.billNo}
                size={60}
              />
            </div>
          )}
          {disp.showTerms && currentSettings.terms?.[0] && (
            <div className="text-[9px] text-slate-500 italic">
              * {currentSettings.terms[0]}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end justify-between">
          <div className="text-right font-mono text-xs">
            <span className="font-bold font-sans mr-2">देय कुल रकम:</span>
            <span className="font-black text-sm bg-slate-900 text-white px-2 py-0.5 rounded">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
          {disp.showSignatory && (
            <div className="text-right pt-4 text-[9px] font-semibold text-slate-700">
              कृते: {currentSettings.firmName} (हस्ताक्षर)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
