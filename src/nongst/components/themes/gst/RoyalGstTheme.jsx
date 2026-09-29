import React from 'react';
import GaneshLogo from '../../GaneshLogo';
import DigitalSignatureBadge from '../../DigitalSignatureBadge';
import { numberToHindiWords, numberToIndianWords } from '../../../utils/numberToWords';
import UpiQrCode from '../../common/UpiQrCode';

export default function RoyalGstTheme({ bill, settings }) {
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
    <div id="printable-bill" className="bg-white text-slate-900 border-2 border-purple-900 rounded-lg p-4 sm:p-5 max-w-4xl mx-auto shadow-md text-xs leading-relaxed font-serif">
      {/* 1. ROYAL TOP HEADER */}
      <div className="grid grid-cols-12 items-center border-b-2 border-purple-900 pb-2 mb-2 min-h-[56px] gap-2">
        <div className="col-span-3 flex items-center justify-start">
          {disp.showLogo && currentSettings.logo ? (
            <img
              src={currentSettings.logo}
              alt="Logo"
              className="w-16 h-16 object-contain rounded border-2 border-purple-200 p-0.5"
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

        <div className="col-span-3 text-right flex flex-col items-end justify-center font-sans text-xs text-slate-700 space-y-0.5">
          {disp.showMobile && currentSettings.mobile && (
            <div className="font-bold text-purple-950 font-mono">📞 {currentSettings.mobile}</div>
          )}
          {disp.showAlternateMobile && currentSettings.alternateMobile && (
            <div className="font-mono text-purple-900 text-[11px]">📞 {currentSettings.alternateMobile}</div>
          )}
          {disp.showEmail && currentSettings.email && (
            <div className="text-[10px] text-slate-500 font-mono">✉️ {currentSettings.email}</div>
          )}
        </div>
      </div>

      {/* Invoice Banner */}
      <div className="text-center my-1">
        <span className="inline-block bg-purple-900 text-amber-300 font-sans font-bold px-6 py-1 rounded-full text-xs uppercase tracking-wider shadow-xs">
          INVOICE
        </span>
      </div>

      {/* Firm Info */}
      <div className="text-center border-b-2 border-purple-200 pb-2 mb-2.5 bg-purple-50/40 rounded p-2">
        {disp.showFirmName && (
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-purple-950 font-serif">
            {currentSettings.firmName || 'फर्म का नाम'}
          </h1>
        )}
        {disp.showTagline && currentSettings.tagline && (
          <p className="text-xs text-purple-700 italic font-sans">{currentSettings.tagline}</p>
        )}
        {disp.showAddress && currentSettings.address && (
          <p className="text-[11px] text-slate-600 font-sans mt-0.5">📍 {currentSettings.address}</p>
        )}
      </div>

      {/* 2. CUSTOMER & INVOICE DETAILS */}
      <div className="grid grid-cols-2 border border-purple-300 rounded p-2.5 mb-2.5 bg-purple-50/40 font-sans text-[11px]">
        <div>
          <div className="font-bold text-[10px] text-purple-900 uppercase">ग्राहक का विवरण (Customer):</div>
          <div className="font-black text-sm text-slate-900">{bill.customerName || 'Cash Customer'}</div>
          {disp.showCustomerDetails && bill.customerMobile && (
            <div>📞 मोबाइल: <span className="font-mono font-bold">{bill.customerMobile}</span></div>
          )}
          {disp.showCustomerDetails && bill.customerAddress && (
            <div className="text-slate-600 text-[10px]">पता: {bill.customerAddress}</div>
          )}
        </div>

        <div className="text-right space-y-1">
          <div>
            <span className="text-slate-600">इनवॉइस नं.: </span>
            <span className="font-mono font-black text-purple-950 text-sm">{bill.billNo}</span>
          </div>
          <div>
            <span className="text-slate-600">दिनांक: </span>
            <span className="font-bold">{bill.date}</span>
          </div>
          <div>
            <span className="text-slate-600">भुगतान: </span>
            <span className="font-semibold">{bill.paymentMode || 'Cash / UPI'}</span>
          </div>
        </div>
      </div>

      {/* 3. 10-ROW FIXED TABLE */}
      <div className="border border-purple-900 rounded overflow-hidden mb-2.5 font-sans">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-purple-950 text-white font-bold text-[10px] uppercase text-center">
              <th className="py-1.5 px-1 border-r border-purple-800 w-8">क्र.</th>
              <th className="py-1.5 px-3 border-r border-purple-800 text-left">सामान / मॉडल विवरण</th>
              {disp.showHsn && <th className="py-1.5 px-1 border-r border-purple-800 w-14">HSN</th>}
              <th className="py-1.5 px-1 border-r border-purple-800 w-12">मात्रा</th>
              <th className="py-1.5 px-1 border-r border-purple-800 w-16 text-right">दर / रेट (₹)</th>
              <th className="py-1.5 px-2 text-right w-24">कुल रकम (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100">
            {rows.map((item, index) => {
              const isFilled = Boolean(item && (item.name || item.total > 0));
              return (
                <tr
                  key={index}
                  className={`min-h-[26px] h-auto text-[11px] ${
                    index % 2 === 0 ? 'bg-white' : 'bg-purple-50/20'
                  } ${!isFilled ? 'text-slate-300' : 'text-slate-900'}`}
                >
                  <td className="text-center font-bold border-r border-purple-100 px-1 py-1.5 align-top text-purple-900">
                    {index + 1}
                  </td>
                  <td className="border-r border-purple-100 px-3 py-1.5 font-medium break-words align-top">
                    {isFilled ? (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 break-words">{item.name}</span>
                          {item.itemNo && (
                            <span className="text-[9px] bg-purple-100 text-purple-900 font-mono px-1 rounded shrink-0">
                              {item.itemNo}
                            </span>
                          )}
                        </div>
                        {item.serialNo && (
                          <div className="text-[9px] font-mono text-purple-900 font-semibold mt-0.5 break-words">
                            IMEI/S.N.: <span className="font-bold">{item.serialNo}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-200 select-none">•</span>
                    )}
                  </td>
                  {disp.showHsn && (
                    <td className="text-center font-mono border-r border-purple-100 px-1 py-1.5 text-[10px] align-top whitespace-nowrap">
                      {isFilled ? item.hsn || '-' : ''}
                    </td>
                  )}
                  <td className="text-center font-bold border-r border-purple-100 px-1 py-1.5 align-top whitespace-nowrap">
                    {isFilled ? `${item.qty} ${item.unit || 'PCS'}` : ''}
                  </td>
                  <td className="text-right font-mono border-r border-purple-100 px-1 py-1.5 align-top whitespace-nowrap">
                    {isFilled ? Number(item.rate || item.price || 0).toFixed(2) : ''}
                  </td>
                  <td className="text-right font-mono font-bold px-2 py-1.5 text-purple-950 align-top whitespace-nowrap">
                    {isFilled ? Number(item.total || 0).toFixed(2) : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-purple-100 font-bold border-t border-purple-900 text-[11px] text-purple-950 h-auto">
              <td colSpan={disp.showHsn ? 3 : 2} className="py-2 px-3 border-r border-purple-200 align-top">
                <div className="flex flex-col gap-1">
                  <div className="font-bold">कुल जोड़ (Total):</div>
                  {disp.showWords && (
                    <div className="text-[10px] font-bold text-purple-950 break-words leading-tight bg-purple-200/80 p-1 rounded border border-purple-300">
                      ({numberToHindiWords(grandTotal)})
                    </div>
                  )}
                </div>
              </td>
              <td className="text-center border-r border-purple-200 font-bold align-top py-2 whitespace-nowrap">
                {items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0)} PCS
              </td>
              <td className="text-right px-2 py-2 font-bold text-purple-950 uppercase">
                कुल राशि:
              </td>
              <td className="text-right font-mono font-black px-2 text-sm text-purple-950 align-top py-2 whitespace-nowrap">
                ₹{grandTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 4. ROYAL BANK DETAILS & SCAN & PAY UPI QR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-2 font-sans">
        {/* Left Side: Bank Details & Prominent UPI QR */}
        <div className="space-y-2 flex flex-col justify-between">
          {disp.showBankDetails && currentSettings.bankName && (
            <div className="border border-purple-200 rounded p-2.5 bg-purple-50/30 text-[10px] space-y-0.5">
              <div className="font-bold text-purple-900 uppercase">🏦 बैंक विवरण (Bank Details):</div>
              <div className="text-[9.5px]">बैंक: <span className="font-semibold">{currentSettings.bankName}</span> | खाता सं: <span className="font-mono font-bold">{currentSettings.accountNo}</span></div>
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
            <div className="border border-dashed border-purple-200 rounded p-2.5 flex items-center justify-center text-[10px] text-purple-400 italic bg-purple-50/20">
              धन्यवाद! शुभ यात्रा • Thank You! Visit Again
            </div>
          )}
        </div>

        <div className="border-2 border-purple-900 rounded p-2.5 bg-gradient-to-br from-purple-50 to-amber-50/40 flex flex-col justify-between">
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-700">
              <span>कुल आइटम (Items):</span>
              <span className="font-mono font-bold text-slate-900">{items.length} आइटम</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>कुल मात्रा (Total Qty):</span>
              <span className="font-mono font-bold text-slate-900">{items.reduce((s, it) => s + (Number(it.qty) || 0), 0)} PCS</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>भुगतान माध्यम:</span>
              <span className="font-semibold text-purple-900">{bill.paymentMode || 'Cash / UPI'}</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-purple-300 flex justify-between items-center bg-purple-950 text-white p-2 rounded">
            <span className="font-bold text-xs uppercase tracking-wider">कुल देय राशि:</span>
            <span className="font-mono font-black text-xl text-amber-300">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 5. TERMS & SIGNATURE */}
      <div className="border-t border-purple-300 pt-2 grid grid-cols-3 gap-2 font-sans">
        <div className="col-span-2">
          {disp.showTerms && currentSettings.terms && (
            <ol className="list-decimal list-inside text-[9px] text-slate-600 space-y-0.5">
              {currentSettings.terms.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
          )}
        </div>
        {disp.showSignatory && (
          <div className="flex flex-col justify-end items-end p-1">
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
  );
}
