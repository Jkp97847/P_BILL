import React from 'react';
import GaneshLogo from '../../GaneshLogo';
import DigitalSignatureBadge from '../../DigitalSignatureBadge';
import { numberToHindiWords, numberToIndianWords } from '../../../utils/numberToWords';
import UpiQrCode from '../../common/UpiQrCode';

export default function CompactGstTheme({ bill, settings }) {
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
    <div id="printable-bill" className="bg-white text-slate-900 border border-slate-700 p-3 sm:p-4 rounded max-w-4xl mx-auto shadow-xs text-xs leading-tight font-sans">
      {/* 1. TOP HEADER: Logo (Left), Ganesh (Center), Contacts (Right) */}
      <div className="grid grid-cols-12 items-center border-b border-slate-400 pb-1.5 mb-1.5 min-h-[48px] gap-2">
        <div className="col-span-3 flex items-center justify-start">
          {disp.showLogo && currentSettings.logo ? (
            <img
              src={currentSettings.logo}
              alt="Logo"
              className="w-14 h-14 object-contain rounded border border-slate-300 p-0.5 bg-white"
            />
          ) : (
            <div className="w-14 h-14 hidden sm:block"></div>
          )}
        </div>

        <div className="col-span-6 text-center flex flex-col items-center justify-center">
          {shouldShowGanesh && (
            <GaneshLogo
              showLogo={true}
              text={currentSettings.ganeshText || '॥ श्री गणेशाय नमः ॥'}
              size="sm"
            />
          )}
        </div>

        <div className="col-span-3 text-right flex flex-col items-end justify-center text-[11px] font-semibold text-slate-800 space-y-0.5">
          {disp.showMobile && currentSettings.mobile && (
            <div>📞 {currentSettings.mobile}</div>
          )}
          {disp.showAlternateMobile && currentSettings.alternateMobile && (
            <div className="text-[10px] text-slate-600">📞 {currentSettings.alternateMobile}</div>
          )}
          {disp.showEmail && currentSettings.email && (
            <div className="text-[10px] text-slate-600">✉️ {currentSettings.email}</div>
          )}
        </div>
      </div>

      {/* 2. COMPACT TITLE & FIRM */}
      <div className="text-center border-b border-slate-300 pb-1.5 mb-2">
        <span className="inline-block border border-slate-800 font-extrabold px-4 py-0.2 text-[11px] uppercase bg-slate-100 tracking-wider rounded-xs mb-1">
          INVOICE
        </span>
        {disp.showFirmName && (
          <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 leading-tight">
            {currentSettings.firmName || 'फर्म का नाम'}
          </h1>
        )}
        {disp.showTagline && currentSettings.tagline && (
          <p className="text-[11px] font-medium text-slate-600">{currentSettings.tagline}</p>
        )}
        {disp.showAddress && currentSettings.address && (
          <p className="text-[10px] text-slate-600">📍 {currentSettings.address}</p>
        )}
      </div>

      {/* 3. CUSTOMER BAR */}
      <div className="border border-slate-400 rounded bg-slate-50/60 p-2 mb-2 grid grid-cols-12 gap-1 text-[11px]">
        <div className="col-span-8 space-y-0.5">
          <div><strong className="text-slate-700">ग्राहक:</strong> <span className="font-bold text-slate-900">{bill.customerName || 'नकद ग्राहक'}</span></div>
          <div><strong className="text-slate-700">मोबाइल:</strong> <span className="font-mono">{bill.customerMobile || '-'}</span></div>
        </div>
        <div className="col-span-4 text-right border-l border-slate-300 pl-2 space-y-0.5">
          <div><strong className="text-slate-700">बिल नं.:</strong> <span className="font-mono font-bold text-slate-900">{bill.billNo || 'INV-001'}</span></div>
          <div><strong className="text-slate-700">दिनांक:</strong> <span className="font-mono">{bill.date || new Date().toLocaleDateString('en-GB')}</span></div>
        </div>
      </div>

      {/* 4. COMPACT 10-ROW TABLE */}
      <table className="w-full border-collapse border border-slate-800 text-[11px] mb-2">
        <thead>
          <tr className="bg-slate-800 text-white font-semibold text-center">
            <th className="border border-slate-600 px-1 py-1 w-10">क्र.</th>
            <th className="border border-slate-600 px-2 py-1 text-left">सामान / विवरण</th>
            <th className="border border-slate-600 px-1 py-1 w-14 text-center">मात्रा</th>
            <th className="border border-slate-600 px-2 py-1 w-20 text-right">रेट (₹)</th>
            <th className="border border-slate-600 px-2 py-1 w-24 text-right">कुल (₹)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, idx) => {
            const sNo = idx + 1;
            if (item) {
              return (
                <tr key={item.id || idx} className="h-6 hover:bg-slate-50">
                  <td className="border border-slate-300 px-1 py-0.2 text-center font-bold">{sNo}</td>
                  <td className="border border-slate-300 px-2 py-0.2 font-medium">{item.name || '—'}</td>
                  <td className="border border-slate-300 px-1 py-0.2 text-center">{item.qty}</td>
                  <td className="border border-slate-300 px-2 py-0.2 text-right font-mono">₹{Number(item.price || 0).toFixed(2)}</td>
                  <td className="border border-slate-300 px-2 py-0.2 text-right font-mono font-bold">₹{Number(item.total || 0).toFixed(2)}</td>
                </tr>
              );
            }
            return (
              <tr key={`empty-${idx}`} className="h-6">
                <td className="border border-slate-200 px-1 py-0.2 text-center text-slate-400">{sNo}</td>
                <td className="border border-slate-200 px-2 py-0.2">&nbsp;</td>
                <td className="border border-slate-200 px-1 py-0.2 text-center">&nbsp;</td>
                <td className="border border-slate-200 px-2 py-0.2 text-right">&nbsp;</td>
                <td className="border border-slate-200 px-2 py-0.2 text-right">&nbsp;</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-bold border-t border-slate-800">
            <td colSpan="4" className="border border-slate-300 px-2 py-1 text-right text-slate-800">
              कुल योग (Total):
            </td>
            <td className="border border-slate-300 px-2 py-1 text-right text-sm font-mono text-emerald-800 bg-emerald-50">
              ₹{grandTotal.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 5. WORDS */}
      {disp.showWords && (
        <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1 mb-2 text-[10px] flex items-center justify-between">
          <div><strong className="text-slate-800">शब्दों में: </strong><span>{numberToHindiWords(grandTotal)}</span></div>
          <div className="text-slate-500 italic">({numberToIndianWords(grandTotal)})</div>
        </div>
      )}

      {/* 5.5 BANK DETAILS & UPI QR CODE */}
      {((disp.showBankDetails !== false && currentSettings.bankName) || (disp.showUpiQr !== false && (currentSettings.upiId || currentSettings.mobile))) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 items-center border border-slate-300 rounded p-1.5 bg-slate-50/60">
          {disp.showBankDetails !== false && currentSettings.bankName ? (
            <div className="text-[9px] space-y-0.5">
              <div className="font-bold text-slate-900 uppercase">🏦 बैंक खाता विवरण (Bank Details):</div>
              <div>बैंक: <span className="font-semibold text-slate-900">{currentSettings.bankName}</span></div>
              <div>खाता नं.: <span className="font-mono font-bold text-slate-900">{currentSettings.accountNo}</span></div>
              <div>IFSC: <span className="font-mono font-bold text-slate-900">{currentSettings.ifsc}</span> {currentSettings.branch ? `| ${currentSettings.branch}` : ''}</div>
            </div>
          ) : <div />}

          {disp.showUpiQr !== false && (currentSettings.upiId || currentSettings.mobile) && (
            <div className="flex justify-end">
              <UpiQrCode
                upiId={currentSettings.upiId || (currentSettings.mobile ? `${currentSettings.mobile}@upi` : '')}
                shopName={currentSettings.firmName}
                amount={grandTotal}
                billNo={bill.billNo}
                size={58}
              />
            </div>
          )}
        </div>
      )}

      {/* 6. TERMS & GREEN DIGITAL SIGNATURE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-1 border-t border-slate-400 items-end">
        <div className={`${disp.showSignatory ? 'md:col-span-7' : 'md:col-span-12'} text-[10px] text-slate-600`}>
          {disp.showTerms && currentSettings.terms && (
            <div>
              <span className="font-bold text-slate-800">शर्तें: </span>
              {currentSettings.terms.slice(0, 3).join(' • ')}
            </div>
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
    </div>
  );
}
