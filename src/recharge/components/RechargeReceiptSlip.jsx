import React from 'react';
import { numberToIndianWords } from '../../utils/numberToWords';
import UpiQrCode from '../../components/common/UpiQrCode';

export default function RechargeReceiptSlip({ bill, settings, isPrintMode = false }) {
  if (!bill) return null;

  const shopName = bill.sellerShop || settings?.shopName || 'स्मार्ट बिलिंग ई-मित्र केंद्र';
  const shopPhone = settings?.shopPhone || '9784730824';
  const paperSize = settings?.paperSize || 'thermal80';

  // Format Date DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleDateString('en-GB');
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return new Date(dateStr).toLocaleDateString('en-GB');
    } catch {
      return dateStr;
    }
  };

  // Determine Service Heading
  const getServiceHeading = () => {
    switch (bill.serviceType) {
      case 'electricity':
        return 'बिजली बिल भुगतान रसीद (DISCOM)';
      case 'mobile':
        return 'मोबाइल रिचार्ज रसीद (Prepaid/Postpaid)';
      case 'landline':
        return 'लैंडलाइन व ब्रॉडबैंड बिल रसीद';
      case 'insurance':
        return 'बीमा प्रीमियम भुगतान रसीद (Life/Health)';
      default:
        return 'डिजिटल बिल भुगतान रसीद';
    }
  };

  const getConsumerLabel = () => {
    switch (bill.serviceType) {
      case 'electricity':
        return 'K-नंबर (K-No / CA No):';
      case 'mobile':
        return 'मोबाइल नंबर (Mobile No):';
      case 'landline':
        return 'फोन / लैंडलाइन नंबर:';
      case 'insurance':
        return 'पॉलिसी नंबर (Policy No):';
      default:
        return 'उपभोक्ता नंबर / ID:';
    }
  };

  const billAmt = parseFloat(bill.billAmount) || 0;
  const conveFee = parseFloat(bill.conveFee) || 0;
  const totalAmt = parseFloat(bill.totalAmount) || (billAmt + conveFee);
  const words = numberToIndianWords(totalAmt);

  return (
    <div 
      className={`recharge-slip-wrapper relative bg-white text-slate-900 border-2 border-slate-900 rounded-lg p-5 shadow-sm transition-all overflow-hidden ${
        paperSize === 'thermal58' ? 'max-w-[280px] text-xs' : paperSize === 'thermal80' ? 'max-w-[380px] text-sm' : 'max-w-[540px] text-base'
      } mx-auto`}
      style={{
        backgroundImage: bill.operatorLogo ? `url(${bill.operatorLogo})` : 'none',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center 48%',
        backgroundSize: paperSize === 'thermal58' ? '180px' : '240px',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Light Overlay to ensure sharp readability over watermark */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] -z-0 pointer-events-none" />

      <div className="relative z-10">
        {/* Top Header Bar: Pvt Ltd Logo + Slip Tag */}
        <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3">
          <div className="flex items-center gap-1.5">
            <img 
              src="/recharge_assets/pvt_ltd_logo.svg" 
              alt="Pvt Ltd Authorized" 
              className="h-7 w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="text-[10px] font-black tracking-wider text-indigo-950 uppercase">
              PAYMENT HUB
            </span>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
            OFFICIAL RECEIPT
          </span>
        </div>

        {/* Shop Name & Contact */}
        <div className="text-center border-b-2 border-dashed border-slate-900 pb-2.5 mb-2.5">
          <div className="text-lg font-black text-slate-950 uppercase tracking-tight flex items-center justify-center gap-1">
            <span className="text-blue-800 text-xs font-black uppercase">Pay By:</span>
            <span>{shopName}</span>
          </div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">
            मोबाईल / Phone: {shopPhone}
          </div>
          {settings?.address && (
            <div className="text-[11px] text-slate-600 mt-0.5 font-medium line-clamp-1">
              {settings.address}
            </div>
          )}
          <div className="inline-block bg-blue-900 text-white font-black text-[11px] px-3 py-1 rounded-full mt-2 tracking-wide shadow-sm">
            {getServiceHeading()}
          </div>
        </div>

        {/* Transaction Successful Stamp Badge */}
        <div className="text-center my-2.5">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border-2 border-emerald-600 text-emerald-800 px-3 py-1 rounded-full shadow-sm">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
              ✓
            </span>
            <div className="text-left leading-tight">
              <div className="text-xs font-black tracking-wide">TRANSACTION SUCCESSFUL</div>
              <div className="text-[9px] font-bold text-emerald-700">भुगतान सफल • DIGITALLY VERIFIED</div>
            </div>
          </div>
        </div>

        {/* Meta Bar: Receipt No & Date */}
        <div className="flex justify-between items-center text-xs border-b border-slate-300 pb-1.5 mb-2 font-mono">
          <div>
            रसीद संख्या: <strong className="text-slate-950 font-bold">{bill.id || 'PREVIEW'}</strong>
          </div>
          <div className="text-right">
            दिनांक: <strong className="text-slate-950 font-bold">{formatDate(bill.billDate)}</strong>
          </div>
        </div>

        {/* Transaction Details Table */}
        <table className="w-full text-xs mb-2 border-collapse">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-1 text-slate-600 font-bold">कंपनी / ऑपरेटर:</td>
              <td className="py-1 text-right font-black text-slate-950 flex items-center justify-end gap-1.5">
                {bill.operatorLogo && (
                  <img 
                    src={bill.operatorLogo} 
                    alt="" 
                    className="w-4 h-4 object-contain inline-block"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <span>{bill.operatorName}</span>
              </td>
            </tr>

            <tr className="border-b border-slate-100">
              <td className="py-1 text-slate-600 font-bold">{getConsumerLabel()}</td>
              <td className="py-1 text-right font-mono font-black text-slate-950">
                {bill.consumerNo || '—'}
              </td>
            </tr>

            <tr className="border-b border-slate-100">
              <td className="py-1 text-slate-600 font-bold">उपभोक्ता का नाम:</td>
              <td className="py-1 text-right font-bold text-slate-950">
                {bill.customerName || bill.consumerNo || 'उपभोक्ता'}
              </td>
            </tr>

            {bill.subDivision && (
              <tr className="border-b border-slate-100">
                <td className="py-1 text-slate-600 font-bold">उप-खंड / विवरण:</td>
                <td className="py-1 text-right font-medium text-slate-800">
                  {bill.subDivision}
                </td>
              </tr>
            )}

            <tr className="border-b border-slate-100">
              <td className="py-1 text-slate-600 font-bold">मूल बिल राशि (Bill Amount):</td>
              <td className="py-1 text-right font-mono font-bold text-slate-950">
                ₹{billAmt.toFixed(2)}
              </td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="py-1 text-emerald-800 font-bold">
                कन्वीनियंस शुल्क (Conve. Fee):
              </td>
              <td className="py-1 text-right font-mono font-black text-emerald-700">
                + ₹{conveFee.toFixed(2)}
              </td>
            </tr>

            {/* Highlighted Total Row */}
            <tr className="border-t-2 border-b-2 border-slate-950 bg-slate-50/70">
              <td className="py-2 text-sm font-black text-slate-950 uppercase">
                कुल भुगतान राशि (Total Paid):
              </td>
              <td className="py-2 text-right font-mono text-base font-black text-blue-900">
                ₹{totalAmt.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="bg-slate-100/90 border border-slate-200 rounded p-1.5 text-[11px] text-slate-700 italic mb-2.5">
          शब्दों में: <strong className="not-italic text-slate-950 font-bold">{words || 'Zero Rupees Only'}</strong>
        </div>

        {/* Shop Bank Details & UPI QR Box (if enabled) */}
        {((settings?.showBankOnSlip !== false && (settings?.bankName || settings?.accountNumber)) || (settings?.showQrCodeOnSlip !== false && (settings?.upiId || shopPhone))) && (
          <div className="bg-slate-50 border border-slate-300 rounded p-2.5 mb-2.5 text-[11px]">
            <div className="flex justify-between items-center font-bold text-blue-900 mb-1.5 border-b border-slate-200 pb-1">
              <span>दुकानदार अधिकृत बैंक खाता & UPI भुगता‍न:</span>
              <span className="text-emerald-700 text-[10px]">✔ Verified Merchant</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              {settings?.showBankOnSlip !== false && (settings?.bankName || settings?.accountNumber) ? (
                <div className="space-y-0.5 text-slate-700 text-[10px] w-full">
                  <div>बैंक: <strong className="text-slate-900">{settings.bankName || 'SBI'}</strong></div>
                  <div>खाता संख्या: <strong className="font-mono text-slate-900">{settings.accountNumber || '—'}</strong></div>
                  <div>IFSC: <strong className="font-mono text-slate-900">{settings.ifscCode || '—'}</strong></div>
                  {settings.upiId && <div>UPI ID: <strong className="font-mono text-slate-900">{settings.upiId}</strong></div>}
                </div>
              ) : <div />}

              {settings?.showQrCodeOnSlip !== false && (settings?.upiId || shopPhone) && (
                <div className="shrink-0 flex justify-end">
                  <UpiQrCode
                    upiId={settings.upiId || (shopPhone ? `${shopPhone}@upi` : '')}
                    shopName={shopName}
                    amount={totalAmt}
                    billNo={bill.id}
                    size={64}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer: Disclaimer & Green Digital Stamp */}
        <div className="flex justify-between items-end gap-2 border-t border-dashed border-slate-400 pt-2 text-[10px] text-slate-600">
          <div className="leading-snug max-w-[55%]">
            <p className="font-semibold text-slate-700">* यह एक कंप्यूटरीकृत सत्यापित रसीद है।</p>
            <p>लेन-देन सफलतापूर्वक संपन्न हुआ। किसी भी समस्या हेतु ऊपर दिए मोबाइल पर संपर्क करें।</p>
          </div>

          {/* Green Digital Stamp (मुहर) */}
          {settings?.showStampOnSlip !== false && (
            <div className="inline-flex items-center gap-1.5 border-2 border-emerald-600 bg-emerald-50/90 px-2 py-1 rounded shadow-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                ✔
              </span>
              <div className="text-[9px] text-emerald-950 leading-tight">
                <div className="font-black text-emerald-800 tracking-wider">DIGITALLY VERIFIED</div>
                <div className="font-bold text-slate-900 truncate max-w-[120px]">{shopName}</div>
                <div className="text-[8px] text-emerald-700 font-semibold">{formatDate(bill.billDate)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
