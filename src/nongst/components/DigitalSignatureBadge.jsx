import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function DigitalSignatureBadge({ 
  ownerName = 'राजेश कुमार (प्रोपराइटर)', 
  signatoryText = 'अधिकृत हस्ताक्षरकर्ता / Authorized Signatory',
  date = '',
  firmName = '',
  className = ''
}) {
  const displayDate = date || new Date().toLocaleDateString('en-GB');

  return (
    <div 
      className={`border-2 border-emerald-600 bg-gradient-to-br from-emerald-50/90 to-teal-50/80 rounded-lg p-2.5 text-left shadow-xs print:border-emerald-700 print:bg-emerald-50 ${className}`}
      style={{ minWidth: '220px', maxWidth: '270px' }}
    >
      {/* Top Header with Green Verified Emblem */}
      <div className="flex items-center gap-2 border-b border-emerald-200 pb-1.5 mb-1.5">
        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-emerald-200">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
        </div>
        <div className="leading-tight">
          <div className="text-[11px] font-black text-emerald-800 tracking-wider uppercase flex items-center gap-1">
            <span>DIGITALLY VERIFIED</span>
          </div>
          <div className="text-[9px] font-bold text-emerald-700">
            डिजिटली सत्यापित ई-हस्ताक्षर
          </div>
        </div>
      </div>

      {/* Owner / Signatory Name */}
      <div className="space-y-0.5">
        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide">
          प्रमाणित कर्ता (Verified By):
        </div>
        <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
          {ownerName || firmName || 'दुकानदार / प्रोपराइटर'}
        </div>
        <div className="text-[10px] font-bold text-emerald-800 leading-tight">
          {signatoryText || 'अधिकृत हस्ताक्षरकर्ता'}
        </div>
      </div>

      {/* Verification Date & Stamp Exemption Disclaimer */}
      <div className="mt-1.5 pt-1.5 border-t border-emerald-200 text-[8.5px] leading-tight text-slate-600 space-y-0.5">
        <div className="flex items-center justify-between text-emerald-800 font-semibold">
          <span>दिनांक (Date):</span>
          <span className="font-mono font-bold">{displayDate}</span>
        </div>
        <div className="text-emerald-700 font-medium text-[8px] flex items-center gap-1 pt-0.5">
          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>भौतिक हस्ताक्षर व मोहर की आवश्यकता नहीं</span>
        </div>
        <div className="text-[7.5px] text-slate-500 italic">
          (Computer Generated Digitally Signed Invoice)
        </div>
      </div>
    </div>
  );
}
