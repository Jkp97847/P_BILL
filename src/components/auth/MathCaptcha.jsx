import React, { useState, useEffect } from 'react';
import { RotateCw, ShieldCheck } from 'lucide-react';

export default function MathCaptcha({ 
  value, 
  onChange, 
  onRefresh,
  label = "गणितीय सुरक्षा कैप्चा (Math Security Captcha): *" 
}) {
  const [captcha, setCaptcha] = useState({ num1: 7, num2: 5, operator: '+', answer: 12 });

  const generateCaptcha = () => {
    const isAdd = Math.random() > 0.3; // 70% addition, 30% subtraction
    let n1 = Math.floor(Math.random() * 20) + 5;
    let n2 = Math.floor(Math.random() * 12) + 2;
    
    if (!isAdd) {
      if (n1 < n2) {
        const temp = n1;
        n1 = n2;
        n2 = temp;
      }
      const ans = n1 - n2;
      const newCap = { num1: n1, num2: n2, operator: '-', answer: ans };
      setCaptcha(newCap);
      if (onRefresh) onRefresh(ans);
    } else {
      const ans = n1 + n2;
      const newCap = { num1: n1, num2: n2, operator: '+', answer: ans };
      setCaptcha(newCap);
      if (onRefresh) onRefresh(ans);
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] text-slate-400 font-medium">बॉट व स्पैम रोकथाम</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Math Question Visual Box */}
        <div className="flex items-center justify-center gap-1.5 bg-indigo-50 border-2 border-indigo-200 text-indigo-950 px-3 py-1.5 rounded-lg select-none font-mono font-black text-sm tracking-wider shadow-xs min-w-[130px]">
          <span>{captcha.num1}</span>
          <span className="text-indigo-600 font-bold">{captcha.operator}</span>
          <span>{captcha.num2}</span>
          <span className="text-slate-400 font-bold">=</span>
          <span className="text-indigo-700 font-bold">?</span>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={generateCaptcha}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-slate-200 transition-all cursor-pointer shadow-2xs"
          title="नया कैप्चा सवाल लाएं (Refresh Captcha)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Answer Input */}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          required
          value={value}
          onChange={onChange}
          placeholder="उत्तर लिखें"
          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
        />
      </div>
    </div>
  );
}
