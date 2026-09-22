import React from 'react';
import GaneshLogo from './GaneshLogo';
import DigitalSignatureBadge from './DigitalSignatureBadge';
import { numberToHindiWords, numberToIndianWords } from '../utils/numberToWords';

export default function PrintableBill({ bill, settings }) {
  if (!bill) return null;

  const currentSettings = settings || {};
  const disp = currentSettings.displayOptions || {
    showFirmName: true,
    showTagline: true,
    showLogo: true,
    showAddress: true,
    showMobile: true,
    showAlternateMobile: true,
    showEmail: true,
    showGstin: true,
    showGaneshLogo: true,
    showTerms: true,
    showSignatory: true,
    showWords: true
  };

  const items = bill.items || [];
  const grandTotal = Number(bill.grandTotal || 0);

  const shouldShowGanesh = disp.showGaneshLogo && currentSettings.showGaneshLogo;

  // Minimum 10 rows required (with S.No 1 to 10 always printed, fits perfectly on A4 single sheet)
  const MIN_TABLE_ROWS = 10;
  const fillerCount = Math.max(0, MIN_TABLE_ROWS - items.length);

  return (
    <div
      id="printable-bill"
      className="bg-white text-slate-900 border-2 border-slate-900 p-4 md:p-6 rounded-lg max-w-4xl mx-auto shadow-sm"
    >
      {/* 1. TOP HEADER: 
          - Left: Shop Logo (Top Left Corner)
          - Center: Shree Ganesh Emblem & Mantra (Top Center)
          - Right: Mobile Number(s) & Email ID (Top Right)
      */}
      <div className="grid grid-cols-12 items-center border-b border-slate-300 pb-2 mb-2 min-h-[56px] gap-2">
        {/* TOP LEFT: Shop Logo */}
        <div className="col-span-3 flex items-center justify-start">
          {disp.showLogo && currentSettings.logo ? (
            <img
              src={currentSettings.logo}
              alt="Firm Logo"
              className="w-16 h-16 sm:w-18 sm:h-18 object-contain rounded border border-slate-200 p-0.5 shadow-2xs bg-white"
            />
          ) : (
            <div className="w-16 h-16 hidden sm:block"></div>
          )}
        </div>

        {/* TOP CENTER: Shree Ganesh */}
        <div className="col-span-6 text-center flex flex-col items-center justify-center">
          {shouldShowGanesh && (
            <GaneshLogo
              showLogo={true}
              text={currentSettings.ganeshText || '॥ श्री गणेशाय नमः ॥'}
              size="md"
            />
          )}
        </div>

        {/* TOP RIGHT: Mobile Number and Email ID */}
        <div className="col-span-3 text-right flex flex-col items-end justify-center text-xs font-semibold text-slate-800 space-y-0.5">
          {disp.showMobile && currentSettings.mobile && (
            <div className="flex items-center gap-1 font-bold text-slate-900">
              <span>📞 मो.:</span>
              <span className="font-mono text-xs">{currentSettings.mobile}</span>
            </div>
          )}
          {disp.showAlternateMobile && currentSettings.alternateMobile && (
            <div className="text-[11px] font-mono text-slate-700">
              📞 {currentSettings.alternateMobile}
            </div>
          )}
          {disp.showEmail && currentSettings.email && (
            <div className="text-[11px] text-slate-600 font-medium">
              ✉️ {currentSettings.email}
            </div>
          )}
        </div>
      </div>

      {/* 2. DIRECTLY BELOW SHREE GANESH: CASH MEMO */}
      <div className="text-center my-1.5">
        <span className="inline-block border-2 border-slate-900 font-extrabold px-4 py-0.5 text-xs md:text-sm rounded bg-slate-100 tracking-wider uppercase">
          ॥ कॅश मेमो / बिल ॥
        </span>
      </div>

      {/* 3. SHOP / FIRM NAME, TAGLINE, ADDRESS & GSTIN */}
      <div className="text-center border-b-2 border-slate-900 pb-2 mb-3">
        {disp.showFirmName && (
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase leading-tight print:text-4xl">
            {currentSettings.firmName || 'फर्म का नाम'}
          </h1>
        )}

        {disp.showTagline && currentSettings.tagline && (
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
            {currentSettings.tagline}
          </p>
        )}

        {disp.showAddress && currentSettings.address && (
          <p className="text-xs text-slate-700 mt-1 max-w-xl mx-auto">
            <span className="font-semibold text-slate-800">पता:</span> {currentSettings.address}
          </p>
        )}

        {disp.showGstin && currentSettings.gstin && (
          <div className="mt-0.5">
            <span className="inline-block text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
              GSTIN: {currentSettings.gstin}
            </span>
          </div>
        )}
      </div>

      {/* 4. CUSTOMER DETAILS & BILL INFO BAR: More space for Customer Name, Less for Date & Bill S.No */}
      <div className="grid grid-cols-12 gap-2 border border-slate-800 rounded bg-slate-50/70 p-2.5 mb-3 text-xs">
        {/* Customer Details: Allocated 8 out of 12 columns (approx 70% space) */}
        <div className="col-span-8 sm:col-span-9 space-y-1 pr-2">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-700 whitespace-nowrap">ग्राहक का नाम:</span>
            <span className="font-extrabold text-slate-900 text-sm sm:text-base break-words">
              {bill.customerName || 'नकद ग्राहक (Cash Customer)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 whitespace-nowrap">मोबाइल नं.:</span>
            <span className="font-semibold text-slate-900 font-mono">
              {bill.customerMobile || '-'}
            </span>
          </div>
        </div>

        {/* Bill No & Date: Allocated 4 out of 12 columns (approx 30% space) */}
        <div className="col-span-4 sm:col-span-3 space-y-1 pl-2 border-l border-slate-300 text-right">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 text-[11px]">बिल नं.:</span>
            <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 bg-white px-1.5 py-0.5 border border-slate-300 rounded">
              {bill.billNo || 'INV-001'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 text-[11px]">दिनांक:</span>
            <span className="font-semibold text-slate-900 font-mono text-[11px]">
              {bill.date || new Date().toLocaleDateString('en-GB')}
            </span>
          </div>
        </div>
      </div>

      {/* 5. ITEMS TABLE (Always 10 Rows with Serial Numbers 1 to 10) */}
      <div className="mb-3 overflow-x-auto">
        <table className="w-full border-collapse border-2 border-slate-900 text-xs">
          <thead>
            <tr className="bg-slate-800 text-white font-semibold text-center">
              <th className="border border-slate-700 px-2 py-1.5 w-12">क्र.सं.</th>
              <th className="border border-slate-700 px-3 py-1.5 text-left">सामान / विवरण (Item Description)</th>
              <th className="border border-slate-700 px-2 py-1.5 w-16 text-center">मात्रा</th>
              <th className="border border-slate-700 px-2 py-1.5 w-24 text-right">दर / रेट (₹)</th>
              <th className="border border-slate-700 px-3 py-1.5 w-28 text-right">कुल कीमत (₹)</th>
            </tr>
          </thead>
          <tbody>
            {/* Filled items */}
            {items.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-slate-50 transition-colors h-7">
                <td className="border border-slate-400 px-2 py-0.5 text-center font-bold text-slate-900">
                  {index + 1}
                </td>
                <td className="border border-slate-400 px-3 py-0.5 font-medium text-slate-900">
                  {item.name || '—'}
                </td>
                <td className="border border-slate-400 px-2 py-0.5 text-center font-semibold">
                  {item.qty}
                </td>
                <td className="border border-slate-400 px-2 py-0.5 text-right font-mono">
                  ₹{Number(item.price || 0).toFixed(2)}
                </td>
                <td className="border border-slate-400 px-3 py-0.5 text-right font-mono font-semibold text-slate-900">
                  ₹{Number(item.total || 0).toFixed(2)}
                </td>
              </tr>
            ))}

            {/* Remaining empty rows up to minimum 10, WITH SERIAL NUMBERS 1 TO 10 ALWAYS VISIBLE */}
            {Array.from({ length: fillerCount }).map((_, i) => {
              const currentSNo = items.length + i + 1;
              return (
                <tr key={`blank-row-${currentSNo}`} className="h-7">
                  <td className="border border-slate-400 px-2 py-0.5 text-center font-semibold text-slate-700">
                    {currentSNo}
                  </td>
                  <td className="border border-slate-400 px-3 py-0.5">&nbsp;</td>
                  <td className="border border-slate-400 px-2 py-0.5 text-center">&nbsp;</td>
                  <td className="border border-slate-400 px-2 py-0.5 text-right">&nbsp;</td>
                  <td className="border border-slate-400 px-3 py-0.5 text-right">&nbsp;</td>
                </tr>
              );
            })}
          </tbody>

          {/* Subtotal & Final Amount Rows */}
          <tfoot>
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
              <td colSpan="4" className="border border-slate-400 px-3 py-1.5 text-right text-slate-800">
                फाइनल कुल राशि (Grand Total):
              </td>
              <td className="border border-slate-400 px-3 py-1.5 text-right text-sm md:text-base font-mono text-emerald-800 bg-emerald-50">
                ₹{grandTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 6. AMOUNT IN WORDS */}
      {disp.showWords && (
        <div className="bg-amber-50/70 border border-amber-300 rounded p-2 mb-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <span className="font-bold text-amber-900">शब्दों में: </span>
            <span className="font-semibold text-slate-800">
              {numberToHindiWords(grandTotal)}
            </span>
          </div>
          <div className="text-slate-600 text-[11px] italic">
            ({numberToIndianWords(grandTotal)})
          </div>
        </div>
      )}

      {/* 7. INFORMATION, TERMS & CONDITIONS AND VERIFIER SIGNATURE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1.5 border-t-2 border-slate-900 items-end">
        {/* Information / Conditions (Left side) */}
        <div className={`${disp.showSignatory ? 'md:col-span-7' : 'md:col-span-12'} bg-slate-50 border border-slate-300 rounded p-2 text-[11px] text-slate-700`}>
          {disp.showTerms && (
            <>
              <p className="font-bold text-slate-900 mb-1 uppercase tracking-wide flex items-center gap-1">
                <span>📌</span> नियम व शर्तें (Terms & Conditions):
              </p>
              <ul className="space-y-0.5 list-none pl-0">
                {currentSettings.terms && currentSettings.terms.length > 0 ? (
                  currentSettings.terms.map((term, idx) => (
                    <li key={idx} className="flex items-start gap-1 font-medium text-slate-800">
                      <span className="text-slate-500 font-bold">{idx + 1}.</span>
                      <span>{term}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="font-medium text-slate-800">1. बिका हुआ माल चेक करके लें।</li>
                    <li className="font-medium text-slate-800">2. गारंटी / वारंटी के लिए कंपनी से संपर्क करें।</li>
                    <li className="font-medium text-slate-800">3. भूल चूक लेनी देनी होगी (E. & O.E.)।</li>
                  </>
                )}
              </ul>
            </>
          )}
        </div>

        {/* Green Digital Verified Signature Box (RIGHT SIDE ALIGNED) */}
        {disp.showSignatory && (
          <div className="md:col-span-5 flex flex-col items-end justify-end text-right p-0.5">
            <DigitalSignatureBadge
              ownerName={currentSettings.ownerName}
              firmName={currentSettings.firmName}
              signatoryText={currentSettings.signatoryText}
              date={bill.date}
            />
          </div>
        )}
      </div>

      {/* Thank you note */}
      <div className="text-center text-[10px] text-slate-500 mt-2 pt-1 border-t border-dotted border-slate-300">
        धन्यवाद! आपका दिन शुभ हो। फिर पधारें! (Thank you, Visit Again!)
      </div>
    </div>
  );
}
