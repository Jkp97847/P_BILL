import React, { useMemo } from 'react';
import QRCode from 'qrcode';

export default function UpiQrCode({
  upiId,
  shopName = '',
  amount = 0,
  billNo = '',
  size = 72,
  className = '',
  theme = 'classic'
}) {
  const effectiveUpi = (upiId || '').trim();

  // Synchronously compute NPCI UPI URL and crisp SVG path
  const qrData = useMemo(() => {
    if (!effectiveUpi) return null;

    const cleanPn = (shopName || 'Shop Merchant').trim();
    let upiUrl = `upi://pay?pa=${encodeURIComponent(effectiveUpi)}&pn=${encodeURIComponent(cleanPn)}&cu=INR`;
    
    if (amount && Number(amount) > 0) {
      upiUrl += `&am=${Number(amount).toFixed(2)}`;
    }
    if (billNo) {
      upiUrl += `&tn=${encodeURIComponent('Bill ' + billNo)}`;
    }

    try {
      const qr = QRCode.create(upiUrl, { errorCorrectionLevel: 'M', margin: 1 });
      const numModules = qr.modules.size;
      let path = '';
      for (let r = 0; r < numModules; r++) {
        for (let c = 0; c < numModules; c++) {
          if (qr.modules.get(r, c)) {
            path += 'M' + (c + 1) + ',' + (r + 1) + 'h1v1h-1z ';
          }
        }
      }
      return {
        path,
        viewBox: `0 0 ${numModules + 2} ${numModules + 2}`
      };
    } catch (e) {
      console.error('UPI QR generation error:', e);
      return null;
    }
  }, [effectiveUpi, shopName, amount, billNo]);

  if (!effectiveUpi || !qrData) return null;

  return (
    <div
      className={`flex items-center gap-2.5 p-2 rounded-lg border-2 border-slate-300 bg-white shadow-2xs ${className}`}
      style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
    >
      {/* 1. Razor-sharp Vector SVG QR Code */}
      <div className="shrink-0 bg-white p-1 border border-slate-200 rounded shadow-xs flex items-center justify-center">
        <svg
          viewBox={qrData.viewBox}
          width={size}
          height={size}
          shapeRendering="crispEdges"
          className="block"
          title={`Scan & Pay ₹${amount || ''} via UPI`}
        >
          <rect width="100%" height="100%" fill="#ffffff" />
          <path d={qrData.path} fill="#000000" />
        </svg>
      </div>

      {/* 2. Clear UPI payment details & App badges */}
      <div className="flex flex-col justify-center text-left leading-tight min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-black tracking-tight text-slate-900 uppercase">
            ⚡ स्कैन कर भुगतान करें (Scan & Pay)
          </span>
        </div>

        <div className="text-[8.5px] font-bold text-slate-600 mt-0.5">
          PhonePe • Google Pay • Paytm • BHIM
        </div>

        <div className="text-[9px] font-mono font-extrabold text-indigo-950 mt-0.5 truncate" title={effectiveUpi}>
          UPI ID: <span className="underline decoration-indigo-400">{effectiveUpi}</span>
        </div>

        {amount > 0 && (
          <div className="text-[10px] font-mono font-black text-emerald-800 mt-0.5">
            देय राशि: ₹{Number(amount).toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
