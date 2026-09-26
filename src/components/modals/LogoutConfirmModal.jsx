import React, { useEffect } from 'react';
import { LogOut, AlertTriangle, ShieldCheck, ArrowRight, X } from 'lucide-react';

export default function LogoutConfirmModal({ user, onConfirm, onCancel }) {
  // Allow Esc key to cancel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const displayName = user?.profile?.shopName || user?.profile?.ownerName || user?.username || 'यूजर';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl shadow-rose-950/20 relative space-y-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="रद्द करें (Cancel)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-600/30">
            <LogOut className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white tracking-tight">
              सॉफ्टवेयर से लॉगआउट करें?
            </h3>
            <p className="text-xs text-rose-400 font-semibold mt-1">
              Logout Confirmation
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
          <p className="leading-relaxed">
            आप मुख्य 4-टैब पोर्टल से पीछे (Back) आ चुके हैं। क्या आप <strong>{displayName}</strong> के खाते से लॉगआउट करके लॉगिन पेज पर जाना चाहते हैं?
          </p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-700/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>लॉगआउट करने के बाद दोबारा लॉगिन करने पर आपका सभी डेटा सुरक्षित मिलेगा।</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
          >
            नहीं, हब पर रहें
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>हाँ, लॉगआउट करें</span>
          </button>
        </div>
      </div>
    </div>
  );
}
