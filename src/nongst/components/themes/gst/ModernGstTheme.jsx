import React from 'react';
import GaneshLogo from '../../GaneshLogo';
import DigitalSignatureBadge from '../../DigitalSignatureBadge';
import { numberToHindiWords, numberToIndianWords } from '../../../utils/numberToWords';

export default function ModernGstTheme({ bill, settings }) {
  if (!bill) return null;

  const currentSettings = settings || {};
  const disp = currentSettings.displayOptions || {};
  const items = bill.items || [];
  const grandTotal = Math.round(Number(bill.grandTotal || 0));

  const FIXED_ROWS = 10;
  const rows = Array.from({ length: FIXED_ROWS }, (_, idx) => items[idx] || null);
  const shouldShowGanesh = disp.showGaneshLogo && currentSettings.showGaneshLogo;

  return (
    <div id="printable-bill" className="bg-white text-slate-900 border-2 border-indigo-600 rounded-xl p-4 sm:p-5 max-w-4xl mx-auto shadow-md text-xs leading-relaxed font-sans">
      {/* 1. TOP HEADER: Logo (Left), Ganesh (Center), Contacts (Right) */}
      <div className="grid grid-cols-12 items-center border-b-2 border-indigo-200 pb-2 mb-2 min-h-[56px] gap-2">
        <div className="col-span-3 flex items-center justify-start">
          {disp.showLogo && currentSettings.logo ? (
            <img
              src={currentSettings.logo}
              alt="Logo"
              className="w-16 h-16 object-contain rounded-lg border border-indigo-200 p-0.5 shadow-2xs bg-white"
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

      {/* 2. MODERN TITLE */}
      <div className="text-center my-1.5">
        <span className="inline-block bg-gradient-to-r from-indigo-700 to-blue-700 text-white font-extrabold px-6 py-1 rounded-full text-xs uppercase tracking-widest shadow-xs">
          ★ MODERN TAX INVOICE ★
        </span>
      </div>

      {/* 3. FIRM DETAILS */}
      <div className="text-center border-b-2 border-indigo-100 pb-2 mb-3 bg-indigo-50/40 rounded-lg p-2">
        {disp.showFirmName && (
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-indigo-950 leading-tight">
            {currentSettings.firmName || 'फर्म का नाम'}
          </h1>
        )}
        {disp.showTagline && currentSettings.tagline && (
          <p className="text-xs sm:text-sm font-semibold text-indigo-700 mt-0.5">
            {currentSettings.tagline}
          </p>
        )}
        {disp.showAddress && currentSettings.address && (
          <p className="text-xs text-slate-700 mt-1 max-w-xl mx-auto">
            <span className="font-semibold text-slate-800">पता:</span> {currentSettings.address}
          </p>
        )}
        {disp.showGstin && currentSettings.gstin && (
          <div className="mt-1">
            <span className="inline-block text-[10px] font-mono font-bold bg-white text-indigo-900 px-2.5 py-0.5 rounded border border-indigo-300 shadow-2xs">
              GSTIN: {currentSettings.gstin}
            </span>
          </div>
        )}
      </div>

      {/* 4. CUSTOMER DETAILS */}
      <div className="border border-indigo-200 rounded-lg bg-indigo-50/20 p-2.5 mb-3 grid grid-cols-12 gap-2 text-xs">
        <div className="col-span-8 sm:col-span-9 space-y-1 pr-2">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-indigo-900 whitespace-nowrap">ग्राहक का नाम:</span>
            <span className="font-extrabold text-slate-900 text-sm break-words">
              {bill.customerName || 'नकद ग्राहक'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 whitespace-nowrap">मोबाइल नं.:</span>
            <span className="font-semibold text-slate-900 font-mono">
              {bill.customerMobile || '-'}
            </span>
          </div>
        </div>

        <div className="col-span-4 sm:col-span-3 space-y-1 pl-2 border-l border-indigo-200 text-right">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600 text-[11px]">बिल नं.:</span>
            <span className="font-mono font-bold text-xs text-indigo-900 bg-white px-1.5 py-0.5 border border-indigo-200 rounded">
              {bill.billNo || 'INV-001'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600 text-[11px]">दिनांक:</span>
            <span className="font-semibold text-slate-900 font-mono text-[11px]">
              {bill.date || new Date().toLocaleDateString('en-GB')}
            </span>
          </div>
        </div>
      </div>

      {/* 5. TABLE */}
      <div className="mb-3 overflow-x-auto">
        <table className="w-full border-collapse border border-indigo-300 text-xs">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-800 to-blue-800 text-white font-semibold text-center">
              <th className="border border-indigo-700 px-2 py-1.5 w-12">क्र.सं.</th>
              <th className="border border-indigo-700 px-3 py-1.5 text-left">सामान / विवरण (Description)</th>
              <th className="border border-indigo-700 px-2 py-1.5 w-16 text-center">मात्रा</th>
              <th className="border border-indigo-700 px-2 py-1.5 w-24 text-right">दर / रेट (₹)</th>
              <th className="border border-indigo-700 px-3 py-1.5 w-28 text-right">कुल कीमत (₹)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, idx) => {
              const sNo = idx + 1;
              if (item) {
                return (
                  <tr key={item.id || idx} className="h-7 hover:bg-indigo-50/40 transition-colors">
                    <td className="border border-indigo-200 px-2 py-0.5 text-center font-bold text-indigo-950">{sNo}</td>
                    <td className="border border-indigo-200 px-3 py-0.5 font-medium text-slate-900">{item.name || '—'}</td>
                    <td className="border border-indigo-200 px-2 py-0.5 text-center font-semibold">{item.qty}</td>
                    <td className="border border-indigo-200 px-2 py-0.5 text-right font-mono">₹{Number(item.price || 0).toFixed(2)}</td>
                    <td className="border border-indigo-200 px-3 py-0.5 text-right font-mono font-semibold text-indigo-900">₹{Number(item.total || 0).toFixed(2)}</td>
                  </tr>
                );
              }
              return (
                <tr key={`empty-${idx}`} className="h-7">
                  <td className="border border-indigo-100 px-2 py-0.5 text-center font-semibold text-slate-400">{sNo}</td>
                  <td className="border border-indigo-100 px-3 py-0.5">&nbsp;</td>
                  <td className="border border-indigo-100 px-2 py-0.5 text-center">&nbsp;</td>
                  <td className="border border-indigo-100 px-2 py-0.5 text-right">&nbsp;</td>
                  <td className="border border-indigo-100 px-3 py-0.5 text-right">&nbsp;</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-indigo-50 font-bold border-t-2 border-indigo-400">
              <td colSpan="4" className="border border-indigo-300 px-3 py-1.5 text-right text-indigo-950">
                कुल राशि (Grand Total):
              </td>
              <td className="border border-indigo-300 px-3 py-1.5 text-right text-sm md:text-base font-mono text-emerald-800 bg-emerald-50/90 font-black">
                ₹{grandTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 6. WORDS */}
      {disp.showWords && (
        <div className="bg-indigo-50/60 border border-indigo-200 rounded p-2 mb-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <span className="font-bold text-indigo-900">शब्दों में: </span>
            <span className="font-semibold text-slate-800">{numberToHindiWords(grandTotal)}</span>
          </div>
          <div className="text-slate-600 text-[11px] italic">({numberToIndianWords(grandTotal)})</div>
        </div>
      )}

      {/* 7. TERMS & GREEN DIGITAL SIGNATURE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1.5 border-t-2 border-indigo-200 items-end">
        <div className={`${disp.showSignatory ? 'md:col-span-7' : 'md:col-span-12'} bg-slate-50 border border-slate-200 rounded p-2 text-[11px] text-slate-700`}>
          {disp.showTerms && (
            <>
              <p className="font-bold text-indigo-950 mb-1 uppercase tracking-wide flex items-center gap-1">
                <span>📌</span> नियम व शर्तें (Terms & Conditions):
              </p>
              <ul className="space-y-0.5 list-none pl-0">
                {currentSettings.terms && currentSettings.terms.length > 0 ? (
                  currentSettings.terms.map((term, idx) => (
                    <li key={idx} className="flex items-start gap-1 font-medium text-slate-800">
                      <span className="text-indigo-600 font-bold">{idx + 1}.</span>
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

      <div className="text-center text-[10px] text-slate-500 mt-2 pt-1 border-t border-dotted border-slate-200">
        धन्यवाद! आपका दिन शुभ हो। फिर पधारें! (Thank you, Visit Again!)
      </div>
    </div>
  );
}
