import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

// Google reCAPTCHA v2 official standard test sitekey (works on any domain, localhost, etc.)
// Can be customized via VITE_RECAPTCHA_SITE_KEY in .env or Render environment variables
const DEFAULT_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

let scriptLoadingPromise = null;

function loadRecaptchaScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if (window.grecaptcha && window.grecaptcha.render) {
    return Promise.resolve(window.grecaptcha);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Google reCAPTCHA script failed to load'));
      document.head.appendChild(script);
    }

    const start = Date.now();
    const interval = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.render) {
        clearInterval(interval);
        resolve(window.grecaptcha);
      } else if (Date.now() - start > 10000) {
        clearInterval(interval);
        reject(new Error('Google reCAPTCHA script load timeout'));
      }
    }, 100);
  });

  return scriptLoadingPromise;
}

const GoogleRecaptcha = forwardRef(function GoogleRecaptcha(
  {
    onVerify,
    onExpired,
    sitekey = DEFAULT_SITE_KEY,
    theme = 'light',
    title = 'Google reCAPTCHA सुरक्षा सत्यापन'
  },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'verified' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [fallbackChecked, setFallbackChecked] = useState(false);

  // Expose imperative methods: reset, getResponse, and isVerified
  useImperativeHandle(ref, () => ({
    reset: () => {
      setFallbackChecked(false);
      setStatus('ready');
      if (window.grecaptcha && widgetIdRef.current !== null) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (err) {
          console.warn('grecaptcha.reset error:', err);
        }
      }
    },
    getResponse: () => {
      if (window.grecaptcha && widgetIdRef.current !== null) {
        try {
          const resp = window.grecaptcha.getResponse(widgetIdRef.current);
          if (resp) return resp;
        } catch (err) {
          console.warn('grecaptcha.getResponse(widgetId) error:', err);
        }
      }
      if (window.grecaptcha && typeof window.grecaptcha.getResponse === 'function') {
        try {
          const resp = window.grecaptcha.getResponse();
          if (resp) return resp;
        } catch {}
      }
      return fallbackChecked ? 'fallback_verified' : '';
    },
    isVerified: () => {
      if (fallbackChecked) return true;
      if (status === 'verified') return true;
      if (window.grecaptcha && widgetIdRef.current !== null) {
        try {
          return Boolean(window.grecaptcha.getResponse(widgetIdRef.current));
        } catch {}
      }
      if (window.grecaptcha && typeof window.grecaptcha.getResponse === 'function') {
        try {
          return Boolean(window.grecaptcha.getResponse());
        } catch {}
      }
      return false;
    }
  }));

  useEffect(() => {
    let unmounted = false;

    loadRecaptchaScript()
      .then((grecaptcha) => {
        if (unmounted || !containerRef.current) return;

        grecaptcha.ready(() => {
          if (unmounted || !containerRef.current) return;

          // If widget is already created in this container, just mark ready
          if (widgetIdRef.current !== null) {
            setStatus('ready');
            return;
          }

          try {
            // Clean container to avoid duplicate iframes
            containerRef.current.innerHTML = '';

            const id = grecaptcha.render(containerRef.current, {
              sitekey: sitekey,
              theme: theme,
              callback: (token) => {
                setStatus('verified');
                if (onVerifyRef.current) {
                  onVerifyRef.current(token);
                }
              },
              'expired-callback': () => {
                setStatus('ready');
                if (onExpiredRef.current) {
                  onExpiredRef.current();
                }
              },
              'error-callback': () => {
                setStatus('error');
                setErrorMessage('Google reCAPTCHA सत्यापन में त्रुटि हुई।');
              }
            });

            widgetIdRef.current = id;
            setStatus('ready');
          } catch (err) {
            console.warn('grecaptcha.render error:', err);
            if (!unmounted) {
              if (String(err?.message || '').includes('already been rendered')) {
                setStatus('ready');
              } else {
                setStatus('error');
                setErrorMessage(err.message || 'reCAPTCHA लोड नहीं हो सका');
              }
            }
          }
        });
      })
      .catch((err) => {
        if (!unmounted) {
          console.warn('reCAPTCHA load error:', err);
          setStatus('error');
          setErrorMessage('Google reCAPTCHA लोड नहीं हो सका (ऑफ़लाइन या नेटवर्क प्रतिबंध)।');
        }
      });

    return () => {
      unmounted = true;
    };
  }, [sitekey, theme]);

  // Fallback handler if Google servers are blocked/offline
  const handleFallbackVerify = () => {
    const next = !fallbackChecked;
    setFallbackChecked(next);
    if (next) {
      setStatus('verified');
      if (onVerifyRef.current) onVerifyRef.current('fallback_verified_offline_token');
    } else {
      setStatus('ready');
      if (onExpiredRef.current) onExpiredRef.current();
    }
  };

  return (
    <div className="w-full my-2 select-none">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5 px-0.5">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{title}</span>
        </span>
        <span className="text-[10px] font-mono text-slate-400">Google reCAPTCHA v2</span>
      </div>

      <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[90px] overflow-hidden">
        {/* Loading placeholder */}
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 py-3">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Google reCAPTCHA लोड हो रहा है...</span>
          </div>
        )}

        {/* The Google reCAPTCHA widget container */}
        <div 
          ref={containerRef}
          className={`flex items-center justify-center transform scale-95 sm:scale-100 origin-center transition-all ${
            status === 'error' ? 'hidden' : 'block'
          }`}
        />

        {/* Offline / Network Fallback */}
        {status === 'error' && (
          <div className="w-full text-center p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-800 font-bold mb-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={handleFallbackVerify}
              className={`w-full py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                fallbackChecked
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {fallbackChecked ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>सत्यापित: मैं रोबोट नहीं हूँ (Verified Human)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>ऑफ़लाइन सुरक्षा टिक करें (I am not a robot)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default GoogleRecaptcha;
