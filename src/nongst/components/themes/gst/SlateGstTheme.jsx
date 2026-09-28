import React from 'react';
import GaneshLogo from '../../GaneshLogo';
import DigitalSignatureBadge from '../../DigitalSignatureBadge';
import UpiQrCode from '../../common/UpiQrCode';
import { numberToHindiWords, numberToIndianWords } from '../../../utils/numberToWords';

export default function SlateGstTheme({ bill, settings }) {
  if (!bill) return null;

  const currentSettings = settings || {};
  const disp = currentSettings.displayOptions || {};
  const items = bill.items || [];
  const grandTotal = Math.round(Number(bill.grandTotal || 0));

  const rowCount = Math.max(10, items.length);
  const rows = Array.from({ length: rowCount }, (_, idx) => items[idx] || null);
  const shouldShowGanesh = disp.showGaneshLogo && currentSettings.showGaneshLogo;

  return (
    <div id="printable-bill" className="bg-white text-slate-900 border-2 border-slate-800 rounded-xl p-4 sm:p-5 max-w-4xl mx-auto shadow-md text-xs leading-relaxed font-sans">
      {/* 1. TOP HEADER */}
      <div className="grid grid-cols-12 items-center border-b-2 border-slate-800 pb-2 mb-2 min-h-[56px] gap-2">
        <div className="col-span-3 flex items-center justify-start">
          {disp.showLogo && currentSettings.logo ? (
            <img
              src={currentSettings.logo}
              alt="Logo"
              className="w-16 h-16 object-contain rounded-lg border border-slate-300 p-0.5 bg-white shadow-2xs"
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
            <div className="text-[11px] font-mono text-slate-700">📞 {currentSettings.alternateMobile}</div>
          )}
          {disp.showEmail && currentSettings.email && (
            <div className="text-[11px] text-slate-600 font-medium">✉️ {currentSettings.email}</div>
          )}
        </div>
      </div>

      {/* 2. TITLE */}
      <div className="text-center my-1.5">
        <span className="inline-block bg-slate-900 text-white font-extrabold px-6 py-1 rounded-full text-xs uppercase tracking-widest shadow-xs">
          ◼ SLATE CORPORATE RETAIL MEMO ◼
        </span>
      </div>

      {/* 3. FIRM */}
      <div className="text-center border-b-2 border-slate-300 pb-2 mb-3 bg-slate-100/60 rounded-lg p-2">
        {disp.showFirmName && (
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 leading-tight">
            {currentSettings.firmName || 'फर्म का नाम'}
          </h1>
        )}
        {disp.showTagline && currentSettings.tagline && (
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">{currentSettings.tagline}</p>
        )}
        {disp.showAddress && currentSettings.address && (
          <p className="text-xs text-slate-700 mt-1 max-w-xl mx-auto">📍 {currentSettings.address}</p>
        )}
      </div>

      {/* 4. CUSTOMER */}
      <div className="border border-slate-300 rounded-lg bg-slate-50 p-2.5 mb-3 grid grid-cols-12 gap-2 text-xs">
        <div className="col-span-8 sm:col-span-9 space-y-1 pr-2">
          <div><strong className="text-slate-900">ग्राहक:</strong> <span className="font-extrabold text-slate-900 text-sm ml-1">{bill.customerName || 'नकद ग्राहक'}</span></div>
          <div><strong className="text-slate-600">मोबाइल:</strong> <span className="font-mono font-semibold ml-1">{bill.customerMobile || '-'}</span></div>
        </div>
        <div className="col-span-4 sm:col-span-3 space-y-1 pl-2 border-l border-slate-300 text-right">
          <div><strong className="text-slate-600">बिल नं.:</strong> <span className="font-mono font-bold text-xs bg-white px-1.5 py-0.5 border border-slate-300 rounded ml-1">{bill.billNo || 'INV-001'}</span></div>
          <div><strong className="text-slate-600">दिनांक:</strong> <span className="font-mono font-semibold text-[11px] ml-1">{bill.date || new Date().toLocaleDateString('en-GB')}</span></div>
        </div>
      </div>

      {/* 5. TABLE */}
      <div className="mb-3 overflow-x-auto">
        <table className="w-full border-collapse border-2 border-slate-800 text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold text-center">
              <th className="border border-slate-700 px-2 py-1.5 w-12">क्र.सं.</th>
              <th className="border border-slate-700 px-3 py-1.5 text-left">सामान / विवरण (Description)</th>
              <th className="border border-slate-700 px-2 py-1.5 w-16 text-center">मात्रा</th>
              <th className="border border-slate-700 px-2 py-1.5 w-24 text-right">दर / रेट (₹)</th>
              <th className="border border-slate-700 px-3 py-1.5 w-28 text-right">कुल कीमत (₹)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, idx) => {
              const sNo = idx + 1;
              if (item) {
                return (
                  <tr key={item.id || idx} className="h-7 hover:bg-slate-100/50">
                    <td className="border border-slate-300 px-2 py-0.5 text-center font-bold text-slate-900">{sNo}</td>
                    <td className="border border-slate-300 px-3 py-0.5 font-medium">{item.name || '—'}</td>
                    <td className="border border-slate-300 px-2 py-0.5 text-center font-semibold">{item.qty}</td>
                    <td className="border border-slate-300 px-2 py-0.5 text-right font-mono">₹{Number(item.price || 0).toFixed(2)}</td>
                    <td className="border border-slate-300 px-3 py-0.5 text-right font-mono font-bold text-slate-900">₹{Number(item.total || 0).toFixed(2)}</td>
                  </tr>
                );
              }
              return (
                <tr key={`empty-${idx}`} className="h-7">
                  <td className="border border-slate-200 px-2 py-0.5 text-center text-slate-400">{sNo}</td>
                  <td className="border border-slate-200 px-3 py-0.5">&nbsp;</td>
                  <td className="border border-slate-200 px-2 py-0.5 text-center">&nbsp;</td>
                  <td className="border border-slate-200 px-2 py-0.5 text-right">&nbsp;</td>
                  <td className="border border-slate-200 px-3 py-0.5 text-right">&nbsp;</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-800">
              <td colSpan="4" className="border border-slate-300 px-3 py-1.5 text-right text-slate-900">
                फाइनल कुल राशि (Grand Total):
              </td>
              <td className="border border-slate-300 px-3 py-1.5 text-right text-sm md:text-base font-mono text-emerald-800 bg-emerald-50 font-black">
                ₹{grandTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 6. WORDS */}
      {disp.showWords && (
        <div className="bg-slate-50 border border-slate-300 rounded p-2 mb-3 text-xs flex items-center justify-between">
          <div><strong className="text-slate-900">शब्दों में: </strong><span>{numberToHindiWords(grandTotal)}</span></div>
          <div className="text-slate-600 text-[11px] italic">({numberToIndianWords(grandTotal)})</div>
        </div>
      )}

      {/* 6.5 BANK DETAILS & UPI QR CODE */}
      {((disp.showBankDetails !== false && currentSettings.bankName) || (disp.showUpiQr !== false && (currentSettings.upiId || currentSettings.mobile))) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 items-center border border-slate-300 rounded-lg p-2.5 bg-slate-50">
          {disp.showBankDetails !== false && currentSettings.bankName ? (
            <div className="text-[10px] space-y-0.5">
              <div className="font-bold text-slate-900 uppercase">🏦 बैंक खाता विवरण (Bank Details):</div>
              <div className="text-[9.5px]">
                बैंक: <span className="font-semibold text-slate-900">{currentSettings.bankName}</span>
              </div>
              <div className="text-[9.5px]">
                खाता संख्या: <span className="font-mono font-bold text-slate-900">{currentSettings.accountNo}</span>
              </div>
              <div className="text-[9.5px]">
                IFSC: <span className="font-mono font-bold text-slate-900">{currentSettings.ifsc}</span> {currentSettings.branch ? `| शाखा: ${currentSettings.branch}` : ''}
              </div>
            </div>
          ) : <div />}

          {disp.showUpiQr !== false && (currentSettings.upiId || currentSettings.mobile) && (
            <div className="flex justify-end">
              <UpiQrCode
                upiId={currentSettings.upiId || (currentSettings.mobile ? `${currentSettings.mobile}@upi` : '')}
                shopName={currentSettings.firmName}
                amount={grandTotal}
                billNo={bill.billNo}
                size={66}
              />
            </div>
          )}
        </div>
      )}

      {/* 7. TERMS & SIGNATURE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1.5 border-t-2 border-slate-800 items-end">
        <div className={`${disp.showSignatory ? 'md:col-span-7' : 'md:col-span-12'} bg-slate-50 border border-slate-300 rounded p-2 text-[11px]`}>
          {disp.showTerms && currentSettings.terms && (
            <div>
              <p className="font-bold text-slate-900 mb-1">📌 नियम व शर्तें:</p>
              <ul className="space-y-0.5 pl-0 list-none">
                {currentSettings.terms.map((t, i) => (
                  <li key={i} className="text-slate-700">{i + 1}. {t}</li>
                ))}
              </ul>
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
