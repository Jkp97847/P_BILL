import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const NavigationHistoryContext = createContext();

// Parse URL hash into structured route object
export function parseHash(hash = window.location.hash) {
  if (!hash || hash === '#' || hash === '#/') {
    return { module: 'hub', tab: null, authTab: 'login', isModal: false };
  }
  const clean = hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = clean.split('?');
  const params = new URLSearchParams(queryPart || '');
  const tab = params.get('tab') || null;

  if (pathPart === 'hub') {
    return { module: 'hub', tab: null, authTab: null };
  }
  if (pathPart === 'gst_billing' || pathPart === 'gst-billing') {
    return { module: 'gst_billing', tab: tab || 'generate', authTab: null };
  }
  if (pathPart === 'nongst_billing' || pathPart === 'nongst-billing') {
    return { module: 'nongst_billing', tab: tab || 'generate', authTab: null };
  }
  if (pathPart === 'receipt_billing' || pathPart === 'recharge') {
    return { module: 'receipt_billing', tab: tab || 'generate', authTab: null };
  }
  if (pathPart === 'superadmin') {
    return { module: 'superadmin', tab: tab || 'sellers', authTab: null };
  }
  if (pathPart === 'auth') {
    return { module: 'auth', tab: null, authTab: tab || 'login' };
  }
  return { module: 'hub', tab: null, authTab: null };
}

// Build URL hash from route object
export function buildHash({ module, tab, authTab }) {
  if (module === 'hub') return '#/hub';
  if (module === 'gst_billing') return tab ? `#/gst_billing?tab=${tab}` : '#/gst_billing?tab=generate';
  if (module === 'nongst_billing') return tab ? `#/nongst_billing?tab=${tab}` : '#/nongst_billing?tab=generate';
  if (module === 'receipt_billing') return tab ? `#/receipt_billing?tab=${tab}` : '#/receipt_billing?tab=generate';
  if (module === 'superadmin') return tab ? `#/superadmin?tab=${tab}` : '#/superadmin?tab=sellers';
  if (module === 'auth') return authTab ? `#/auth?tab=${authTab}` : '#/auth?tab=login';
  return '#/hub';
}

export function NavigationHistoryProvider({ children }) {
  // Current route state parsed from initial hash or default to hub
  const [currentRoute, setCurrentRoute] = useState(() => parseHash());

  // Flag to know when state change is triggered by browser's popstate (Back/Forward)
  const isPopStateRef = useRef(false);

  // Stack of active modal handlers for Back button closing
  const modalStackRef = useRef([]);

  // Toast alert state for accidental exit prevention
  const [exitToast, setExitToast] = useState({ show: false, message: '' });
  const exitToastTimerRef = useRef(null);

  // Show exit alert toast
  const triggerExitAlert = useCallback((msg) => {
    if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
    setExitToast({
      show: true,
      message: msg || 'ℹ️ आप मुख्य पृष्ठ पर हैं। वेबसाइट से बाहर निकलने हेतु ब्राउज़र टैब बंद करें अथवा लॉगआउट करें।'
    });
    exitToastTimerRef.current = setTimeout(() => {
      setExitToast({ show: false, message: '' });
    }, 3500);
  }, []);

  // Programmatic navigation (User clicks a button, card, tab, etc.)
  const navigate = useCallback((target) => {
    if (isPopStateRef.current) return;

    setCurrentRoute(prev => {
      const targetModule = target.module !== undefined ? target.module : prev.module;
      let targetTab = target.tab !== undefined ? target.tab : prev.tab;

      if (target.module !== undefined && target.module !== prev.module) {
        if (targetModule === 'hub') {
          targetTab = null;
        } else if (target.tab === undefined) {
          targetTab = 'generate';
        }
      }

      const nextRoute = {
        module: targetModule,
        tab: targetTab,
        authTab: target.authTab !== undefined ? target.authTab : prev.authTab
      };

      const newHash = buildHash(nextRoute);
      const currentHash = window.location.hash;

      if (currentHash !== newHash) {
        window.history.pushState(
          { ...nextRoute, hasTrap: true, timestamp: Date.now() },
          '',
          newHash
        );
      }

      return nextRoute;
    });
  }, []);

  // Replace navigation without pushing a new entry
  const replace = useCallback((target) => {
    setCurrentRoute(prev => {
      const targetModule = target.module !== undefined ? target.module : prev.module;
      let targetTab = target.tab !== undefined ? target.tab : prev.tab;

      if (target.module !== undefined && target.module !== prev.module) {
        if (targetModule === 'hub') {
          targetTab = null;
        } else if (target.tab === undefined) {
          targetTab = 'generate';
        }
      }

      const nextRoute = {
        module: targetModule,
        tab: targetTab,
        authTab: target.authTab !== undefined ? target.authTab : prev.authTab
      };

      const newHash = buildHash(nextRoute);
      window.history.replaceState(
        { ...nextRoute, hasTrap: true, timestamp: Date.now() },
        '',
        newHash
      );
      return nextRoute;
    });
  }, []);

  // Register a modal to be closed first on Browser Back
  const registerModal = useCallback((modalId, closeFn) => {
    modalStackRef.current = modalStackRef.current.filter(m => m.id !== modalId);
    modalStackRef.current.push({ id: modalId, closeFn });
  }, []);

  // Unregister modal if closed by UI button
  const unregisterModal = useCallback((modalId) => {
    modalStackRef.current = modalStackRef.current.filter(m => m.id !== modalId);
  }, []);

  // Browser Back / Forward (popstate event listener with Exit Trap)
  useEffect(() => {
    const initialRoute = parseHash();
    const initialHash = buildHash(initialRoute);

    // Initial history seeding with Exit Trap at the bottom of the history stack
    if (!window.history.state || (!window.history.state.isExitTrap && !window.history.state.hasTrap)) {
      // 1. Base trap entry
      window.history.replaceState({ isExitTrap: true }, '', initialHash);

      // 2. If user opens a subpage directly (e.g. gst_billing), insert Hub beneath it
      if (initialRoute.module !== 'hub' && initialRoute.module !== 'auth') {
        window.history.pushState({ module: 'hub', tab: null, hasTrap: true }, '', '#/hub');
      }

      // 3. Active view
      window.history.pushState({ ...initialRoute, hasTrap: true, timestamp: Date.now() }, '', initialHash);
    }

    const handlePopState = (event) => {
      // 1. If any modal is currently open, close the modal first!
      if (modalStackRef.current.length > 0) {
        const topModal = modalStackRef.current.pop();
        if (topModal && typeof topModal.closeFn === 'function') {
          topModal.closeFn();
          // Restore previous state hash to prevent page shift
          window.history.pushState(
            { ...parseHash(), hasTrap: true, timestamp: Date.now() },
            '',
            window.location.hash
          );
          return;
        }
      }

      // 2. Accidental Exit Trap:
      // If user hit Browser Back from the main Hub or login and landed on the exit trap
      if (event.state?.isExitTrap) {
        const isAuth = window.location.hash.startsWith('#/auth');
        const safeRoute = isAuth 
          ? { module: 'auth', authTab: 'login', hasTrap: true } 
          : { module: 'hub', tab: null, hasTrap: true };
        const safeHash = isAuth ? '#/auth?tab=login' : '#/hub';

        // Re-push safe root state
        window.history.pushState(safeRoute, '', safeHash);
        isPopStateRef.current = true;
        setCurrentRoute(safeRoute);
        setTimeout(() => {
          isPopStateRef.current = false;
        }, 50);

        triggerExitAlert(
          isAuth 
            ? 'ℹ️ आप लॉगिन पृष्ठ पर हैं। वेबसाइट बंद करने हेतु ब्राउज़र टैब बंद करें।' 
            : 'ℹ️ आप मुख्य पृष्ठ पर हैं। सॉफ्टवेयर से बाहर निकलने हेतु लॉगआउट करें या टैब बंद करें।'
        );
        return;
      }

      // 3. Normal Back / Forward navigation within the application:
      const newRoute = parseHash(window.location.hash);
      isPopStateRef.current = true;
      setCurrentRoute(newRoute);

      setTimeout(() => {
        isPopStateRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [triggerExitAlert]);

  return (
    <NavigationHistoryContext.Provider
      value={{
        currentRoute,
        navigate,
        replace,
        registerModal,
        unregisterModal,
        triggerExitAlert
      }}
    >
      {children}

      {/* Floating Exit Prevention Alert Toast */}
      {exitToast.show && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-indigo-400 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200 select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
          <span>{exitToast.message}</span>
        </div>
      )}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory() {
  const context = useContext(NavigationHistoryContext);
  if (!context) {
    throw new Error('useNavigationHistory must be used within a NavigationHistoryProvider');
  }
  return context;
}
