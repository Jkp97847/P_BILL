import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NavigationHistoryContext = createContext();

// Parse URL hash into structured route object
export function parseHash(hash = window.location.hash) {
  if (!hash || hash === '#' || hash === '#/') {
    return { module: 'auth', tab: null, authTab: 'login' };
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
  return { module: 'auth', tab: null, authTab: 'login' };
}

// Build clean URL hash from route object
export function buildHash({ module, tab, authTab }) {
  if (module === 'hub') return '#/hub';
  if (module === 'gst_billing') return tab ? `#/gst_billing?tab=${tab}` : '#/gst_billing?tab=generate';
  if (module === 'nongst_billing') return tab ? `#/nongst_billing?tab=${tab}` : '#/nongst_billing?tab=generate';
  if (module === 'receipt_billing') return tab ? `#/receipt_billing?tab=${tab}` : '#/receipt_billing?tab=generate';
  if (module === 'superadmin') return tab ? `#/superadmin?tab=${tab}` : '#/superadmin?tab=sellers';
  if (module === 'auth') return authTab ? `#/auth?tab=${authTab}` : '#/auth?tab=login';
  return '#/auth?tab=login';
}

export function NavigationHistoryProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState(() => parseHash());

  // Programmatic navigation triggered ONLY by explicit user clicks (cards, buttons, tabs)
  const navigate = useCallback((target) => {
    setCurrentRoute(prev => {
      const targetModule = target.module !== undefined ? target.module : prev.module;
      let targetTab = target.tab !== undefined ? target.tab : (target.module && target.module !== prev.module ? 'generate' : prev.tab);
      if (targetModule === 'hub') {
        targetTab = null;
      }

      const nextRoute = {
        module: targetModule,
        tab: targetTab,
        authTab: target.authTab !== undefined ? target.authTab : prev.authTab
      };

      const newHash = buildHash(nextRoute);
      if (window.location.hash !== newHash) {
        window.history.pushState(nextRoute, '', newHash);
      }
      return nextRoute;
    });
  }, []);

  // Replace navigation without adding history entry
  const replace = useCallback((target) => {
    setCurrentRoute(prev => {
      const targetModule = target.module !== undefined ? target.module : prev.module;
      let targetTab = target.tab !== undefined ? target.tab : (target.module && target.module !== prev.module ? 'generate' : prev.tab);
      if (targetModule === 'hub') {
        targetTab = null;
      }

      const nextRoute = {
        module: targetModule,
        tab: targetTab,
        authTab: target.authTab !== undefined ? target.authTab : prev.authTab
      };

      const newHash = buildHash(nextRoute);
      window.history.replaceState(nextRoute, '', newHash);
      return nextRoute;
    });
  }, []);

  // Listen to browser Back / Forward events (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const newRoute = parseHash(window.location.hash);
      setCurrentRoute(newRoute);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <NavigationHistoryContext.Provider
      value={{
        currentRoute,
        navigate,
        replace
      }}
    >
      {children}
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
