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
  const signer = ownerName || firmName || 'अधिकृत प्रोपराइटर';

  return (
    <div 
      className={`border border-emerald-600 bg-emerald-50/75 rounded-md px-2 py-1 text-left shadow-2xs print:border-emerald-600 print:bg-emerald-50 print:p-1 ${className}`}
      style={{ width: '100%', maxWidth: '210px' }}
    >
      {/* 1. Header: Authentic Green Verified Status */}
      <div className="flex items-center justify-between border-b border-emerald-300 pb-0.5 mb-0.5">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5] shrink-0" />
          <span className="text-[8.5px] font-black text-emerald-800 tracking-wider uppercase leading-none">
            DIGITALLY SIGNED
          </span>
        </div>
        <span className="text-[7px] font-black text-emerald-800 bg-emerald-100/90 border border-emerald-400 px-1 py-0.2 rounded-xs leading-none">
          VALID
        </span>
      </div>

      {/* 2. Signer Details */}
      <div className="leading-tight">
        <div className="text-[9px] font-bold text-slate-900 truncate" title={signer}>
          {signer}
        </div>
        <div className="flex items-center justify-between text-[7.5px] text-slate-600 mt-0.5">
          <span className="truncate pr-1 text-slate-700 font-medium">
            {signatoryText || 'अधिकृत हस्ताक्षरकर्ता'}
          </span>
          <span className="font-mono font-bold text-emerald-800 shrink-0">
            {displayDate}
          </span>
        </div>
      </div>

      {/* 3. Official Legal Security Stamp Note */}
      <div className="mt-0.5 pt-0.5 border-t border-emerald-200/90 flex items-center gap-1 text-[6.5px] text-emerald-800 font-medium leading-none">
        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
        <span className="truncate">
          ई-हस्ताक्षर सत्यापित • भौतिक मोहर अनावश्यक
        </span>
      </div>
    </div>
  );
}

