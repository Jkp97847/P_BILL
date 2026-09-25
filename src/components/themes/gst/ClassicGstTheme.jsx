import React from 'react';
import GaneshLogo from '../../GaneshLogo';
import { numberToHindiWords, numberToIndianWords } from '../../../utils/numberToWords';
import UpiQrCode from '../../common/UpiQrCode';

export default function ClassicGstTheme({ bill, settings }) {
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
    <div className="bg-white text-slate-900 border-2 border-slate-900 p-4 sm:p-6 rounded max-w-4xl mx-auto shadow-sm text-xs leading-relaxed">
      {/* 1. TOP HEADER: GANESH JI & CONTACT */}
      <div className="relative border-b-2 border-slate-900 pb-2 mb-2 flex items-center justify-between">
        <div className="text-left w-1/3">
          <span className="font-bold text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded tracking-wide uppercase">
            मूल प्रति / ORIGINAL COPY
          </span>
        </div>

        {/* Center: Shree Ganesh */}
        <div className="text-center w-1/3">
          {shouldShowGanesh && (
            <GaneshLogo
              showLogo={true}
              text={currentSettings.ganeshText || '॥ श्री गणेशाय नमः ॥'}
              size="md"
            />
          )}
        </div>

        {/* Right: Contact */}
        <div className="text-right w-1/3 text-[11px] font-semibold text-slate-800 space-y-0.5">
          {disp.showMobile && currentSettings.mobile && (
            <div>📞 {currentSettings.mobile}</div>
          )}
          {disp.showAlternateMobile && currentSettings.alternateMobile && (
            <div>📞 {currentSettings.alternateMobile}</div>
          )}
          {disp.showEmail && currentSettings.email && (
            <div className="text-[10px] text-slate-600 font-normal">{currentSettings.email}</div>
          )}
        </div>
      </div>

      {/* 2. TITLE: TAX INVOICE */}
      <div className="text-center my-1">
        <span className="inline-block border-2 border-slate-900 font-black px-6 py-0.5 text-sm uppercase bg-slate-100 tracking-widest">
          TAX INVOICE / जीएसटी कर इनवॉइस
        </span>
      </div>

      {/* 3. FIRM DETAILS */}
      <div className="text-center border-b-2 border-slate-900 pb-2 mb-2">
        <div className="flex items-center justify-center gap-3">
          {disp.showLogo && currentSettings.logo && (
            <img
              src={currentSettings.logo}
              alt="Logo"
              className="w-14 h-14 object-contain rounded border border-slate-300 p-0.5"
            />
          )}
          <div>
            {disp.showFirmName && (
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
                {currentSettings.firmName || 'फर्म का नाम'}
              </h1>
            )}
            {disp.showTagline && currentSettings.tagline && (
              <p className="text-[11px] font-medium text-slate-600 italic">
                {currentSettings.tagline}
              </p>
            )}
            {disp.showAddress && currentSettings.address && (
              <p className="text-[11px] text-slate-700 font-medium mt-0.5">
                📍 {currentSettings.address}
              </p>
            )}
          </div>
        </div>

        {/* Tax IDs bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2 pt-1 border-t border-dashed border-slate-300 text-[11px] font-bold">
          {disp.showGstin && currentSettings.gstin && (
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              GSTIN: <span className="font-mono text-slate-900">{currentSettings.gstin}</span>
            </span>
          )}
          {disp.showPan && currentSettings.pan && (
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              PAN: <span className="font-mono text-slate-900">{currentSettings.pan}</span>
            </span>
          )}
          {disp.showState && currentSettings.state && (
            <span>
              राज्य: {currentSettings.state} ({currentSettings.stateCode || '08'})
            </span>
          )}
        </div>
      </div>

      {/* 4. BILL INFO & BUYER DETAILS GRID */}
      <div className="grid grid-cols-2 border-2 border-slate-900 mb-2 divide-x-2 divide-slate-900">
        {/* Buyer Info */}
        <div className="p-2 space-y-1">
          <div className="font-bold text-[11px] text-slate-700 uppercase border-b border-slate-200 pb-0.5">
            ग्राहक का विवरण (Buyer / Customer Details):
          </div>
          <div className="font-bold text-sm text-slate-900">
            {bill.customerName || 'नकद ग्राहक (Cash Customer)'}
          </div>
          {disp.showCustomerDetails && bill.customerMobile && (
            <div className="text-[11px]">📞 मोबाइल: <span className="font-mono font-bold">{bill.customerMobile}</span></div>
          )}
          {disp.showCustomerDetails && bill.customerGstin && (
            <div className="text-[11px] font-bold">GSTIN: <span className="font-mono">{bill.customerGstin}</span></div>
          )}
          {disp.showCustomerDetails && bill.customerAddress && (
            <div className="text-[11px] text-slate-600">पता: {bill.customerAddress}</div>
          )}
        </div>

        {/* Invoice Info */}
        <div className="p-2 space-y-1 bg-slate-50/60">
          <div className="flex justify-between">
            <span className="font-bold text-slate-600">इनवॉइस नंबर:</span>
            <span className="font-mono font-black text-slate-900">{bill.billNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-600">दिनांक (Date):</span>
            <span className="font-mono font-bold">{bill.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-600">भुगतान माध्यम:</span>
            <span className="font-semibold">{bill.paymentMode || 'Cash / UPI'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-600">स्थान (Place of Supply):</span>
            <span className="font-semibold">{currentSettings.state || 'Rajasthan (08)'}</span>
          </div>
        </div>
      </div>

      {/* 5. 10-ROW FIXED TABLE */}
      <div className="border-2 border-slate-900 mb-2 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase border-b-2 border-slate-900 text-center">
              <th className="py-1 px-1 border-r border-slate-700 w-8">क्र.</th>
              <th className="py-1 px-2 border-r border-slate-700 text-left">सामान का विवरण (Description of Goods)</th>
              {disp.showHsn && <th className="py-1 px-1 border-r border-slate-700 w-14">HSN</th>}
              <th className="py-1 px-1 border-r border-slate-700 w-10">मात्रा</th>
              <th className="py-1 px-1 border-r border-slate-700 w-14 text-right">दर (Rate)</th>
              <th className="py-1 px-1 border-r border-slate-700 w-16 text-right">कर योग्य मूल्य</th>
              {disp.showTaxBreakup && (
                <>
                  <th className="py-1 px-1 border-r border-slate-700 w-14 text-right">CGST</th>
                  <th className="py-1 px-1 border-r border-slate-700 w-14 text-right">SGST</th>
                </>
              )}
              <th className="py-1 px-2 text-right w-20">कुल (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((item, index) => {
              const isFilled = Boolean(item && (item.name || item.total > 0));
              return (
                <tr
                  key={index}
                  className={`min-h-[26px] h-auto text-[11px] ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                  } ${!isFilled ? 'text-slate-300' : 'text-slate-900'}`}
                >
                  <td className="text-center font-bold border-r border-slate-300 px-1 py-1.5 align-top">
                    {index + 1}
                  </td>
                  <td className="border-r border-slate-300 px-2 py-1.5 font-medium break-words align-top">
                    {isFilled ? (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 break-words">{item.name}</span>
                          {item.itemNo && (
                            <span className="text-[9px] bg-slate-100 font-mono px-1 py-0.2 rounded text-slate-600 border border-slate-200 shrink-0">
                              #{item.itemNo}
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
                    <td className="text-center font-mono border-r border-slate-300 px-1 py-1.5 text-[10px] align-top whitespace-nowrap">
                      {isFilled ? item.hsn || '-' : ''}
                    </td>
                  )}
                  <td className="text-center font-bold border-r border-slate-300 px-1 py-1.5 align-top whitespace-nowrap">
                    {isFilled ? `${item.qty} ${item.unit || 'PCS'}` : ''}
                  </td>
                  <td className="text-right font-mono border-r border-slate-300 px-1 py-1.5 align-top whitespace-nowrap">
                    {isFilled ? Number(item.rate || 0).toFixed(2) : ''}
                  </td>
                  <td className="text-right font-mono border-r border-slate-300 px-1 py-1.5 align-top whitespace-nowrap">
                    {isFilled ? Number(item.taxableAmount || item.total || 0).toFixed(2) : ''}
                  </td>
                  {disp.showTaxBreakup && (
                    <>
                      <td className="text-right font-mono border-r border-slate-300 px-1 py-1.5 text-[10px] align-top whitespace-nowrap">
                        {isFilled && item.cgstAmount ? `${Number(item.cgstAmount).toFixed(2)}` : ''}
                      </td>
                      <td className="text-right font-mono border-r border-slate-300 px-1 py-1.5 text-[10px] align-top whitespace-nowrap">
                        {isFilled && item.sgstAmount ? `${Number(item.sgstAmount).toFixed(2)}` : ''}
                      </td>
                    </>
                  )}
                  <td className="text-right font-mono font-bold px-2 py-1.5 text-slate-900 align-top whitespace-nowrap">
                    {isFilled ? Number(item.total || 0).toFixed(2) : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Table Footer Totals with In-Row Hindi Amount in Parentheses */}
          <tfoot>
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-[11px] h-auto">
              <td colSpan={disp.showHsn ? 3 : 2} className="py-2 px-2 border-r border-slate-300 align-top">
                <div className="flex flex-col gap-1">
                  <div className="font-black text-slate-900">कुल जोड़ (Total):</div>
                  {disp.showWords && (
                    <div className="text-[10px] font-bold text-slate-800 break-words leading-tight bg-slate-200/80 p-1 rounded border border-slate-300">
                      ({numberToHindiWords(grandTotal)})
                    </div>
                  )}
                </div>
              </td>
              <td className="text-center border-r border-slate-300 font-bold align-top py-2 whitespace-nowrap">
                {items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0)} PCS
              </td>
              <td className="border-r border-slate-300"></td>
              <td className="text-right font-mono border-r border-slate-300 px-1 align-top py-2 whitespace-nowrap">
                ₹{Number(bill.taxableTotal || 0).toFixed(2)}
              </td>
              {disp.showTaxBreakup && (
                <>
                  <td className="text-right font-mono border-r border-slate-300 px-1 text-[10px] align-top py-2 whitespace-nowrap">
                    ₹{Number(bill.cgstTotal || 0).toFixed(2)}
                  </td>
                  <td className="text-right font-mono border-r border-slate-300 px-1 text-[10px] align-top py-2 whitespace-nowrap">
                    ₹{Number(bill.sgstTotal || 0).toFixed(2)}
                  </td>
                </>
              )}
              <td className="text-right font-mono font-black px-2 text-sm text-slate-900 align-top py-2 whitespace-nowrap">
                ₹{grandTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 6. BANK DETAILS, UPI SCAN & PAY, AND TAX BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        {/* Left: Bank Details & Prominent UPI QR Code */}
        <div className="space-y-1.5 flex flex-col justify-between">
          {disp.showBankDetails && currentSettings.bankName && (
            <div className="border border-slate-300 p-2 rounded bg-slate-50/70 text-[10px] space-y-0.5">
              <div className="font-bold text-slate-900 uppercase">🏦 बैंक खाता विवरण (Bank Transfer):</div>
              <div className="text-[9.5px]">
                बैंक: <span className="font-semibold">{currentSettings.bankName}</span> | खाता: <span className="font-mono font-bold">{currentSettings.accountNo}</span>
              </div>
              <div className="text-[9.5px]">
                IFSC: <span className="font-mono font-bold">{currentSettings.ifsc}</span> {currentSettings.branch ? `| शाखा: ${currentSettings.branch}` : ''}
              </div>
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
            <div className="border border-dashed border-slate-200 p-2.5 rounded flex items-center justify-center text-[10px] text-slate-400 italic bg-slate-50/30">
              धन्यवाद! पुनः पधारें • Thank You! Visit Again
            </div>
          )}
        </div>

        {/* Right: Tax & Grand Total Summary Box */}
        <div className="border border-slate-300 rounded p-2 bg-slate-50 flex flex-col justify-between">
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-700">
              <span>कुल कर योग्य मूल्य (Taxable Amount):</span>
              <span className="font-mono font-semibold">₹{Number(bill.taxableTotal || 0).toFixed(2)}</span>
            </div>
            {disp.showTaxBreakup && (
              <>
                <div className="flex justify-between text-slate-700">
                  <span>केंद्रीय जीएसटी (CGST Total):</span>
                  <span className="font-mono font-semibold">₹{Number(bill.cgstTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>राज्य जीएसटी (SGST Total):</span>
                  <span className="font-mono font-semibold">₹{Number(bill.sgstTotal || 0).toFixed(2)}</span>
                </div>
              </>
            )}
            {Number(bill.discount || 0) > 0 && (
              <>
                <div className="flex justify-between text-slate-700 border-t border-slate-300 pt-0.5">
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

          <div className="mt-2 pt-2 border-t-2 border-slate-900 flex justify-between items-center bg-slate-900 text-white p-2 rounded">
            <span className="font-extrabold text-xs uppercase tracking-wide">कुल देय राशि (Grand Total):</span>
            <span className="font-mono font-black text-lg">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 7. TERMS & SIGNATORY */}
      <div className="border-t-2 border-slate-900 pt-2 grid grid-cols-3 gap-2">
        {/* Terms */}
        <div className="col-span-2">
          {disp.showTerms && currentSettings.terms && currentSettings.terms.length > 0 && (
            <div>
              <div className="font-bold text-[10px] text-slate-700 uppercase mb-0.5">नियम व शर्तें (Terms & Conditions):</div>
              <ol className="list-decimal list-inside text-[9px] text-slate-600 space-y-0.5">
                {currentSettings.terms.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Signatory Box */}
        <div className="text-center flex flex-col justify-between items-center border border-slate-300 rounded p-1.5 bg-slate-50/50">
          <div className="text-[10px] font-bold text-slate-800">
            कृते {currentSettings.firmName || 'दुकान'}
          </div>
          <div className="h-10"></div>
          {disp.showSignatory && (
            <div className="border-t border-slate-400 w-full pt-1 text-[9px] font-semibold text-slate-700">
              {currentSettings.signatoryText || 'अधिकृत हस्ताक्षरकर्ता'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
