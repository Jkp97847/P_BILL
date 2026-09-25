// Test session-only auth and power-cut / browser-close protection logic
import assert from 'node:assert';

// Mock storage
class StorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, val) {
    this.store[key] = String(val);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockLocalStorage = new StorageMock();
const mockSessionStorage = new StorageMock();

function isCleanReload(sessionStore, mockNavType) {
  if (mockNavType === 'reload') return true;
  const reloadFlag = sessionStore.getItem('mobile_billing_page_reloading');
  if (reloadFlag && Date.now() - parseInt(reloadFlag, 10) < 8000) {
    return true;
  }
  return false;
}

function getInitialSessionUser(localStore, sessionStore, mockNavType) {
  localStore.removeItem('mobile_billing_current_session');
  localStore.removeItem('mobile_billing_impersonated_seller');
  localStore.removeItem('mobile_billing_selected_module');

  const saved = sessionStore.getItem('mobile_billing_current_session');
  if (!saved) return null;

  const lastHeartbeat = sessionStore.getItem('mobile_billing_session_heartbeat');
  const heartbeatAge = lastHeartbeat ? Date.now() - parseInt(lastHeartbeat, 10) : Infinity;
  const reloaded = isCleanReload(sessionStore, mockNavType);

  if (!reloaded && heartbeatAge > 8000) {
    sessionStore.removeItem('mobile_billing_current_session');
    sessionStore.removeItem('mobile_billing_impersonated_seller');
    sessionStore.removeItem('mobile_billing_selected_module');
    sessionStore.removeItem('mobile_billing_session_heartbeat');
    sessionStore.removeItem('mobile_billing_page_reloading');
    return null;
  }

  return JSON.parse(saved);
}

// Test 1: Fresh open / new tab -> null session (Login page shown)
mockLocalStorage.clear();
mockSessionStorage.clear();
const test1 = getInitialSessionUser(mockLocalStorage, mockSessionStorage, 'navigate');
assert.strictEqual(test1, null, 'Test 1 Failed: Fresh open must return null (Login page)');
console.log('✓ Test 1 Passed: Fresh open returns null (Shows Login page)');

// Test 2: User was logged in in localStorage (legacy) -> must be purged and return null
mockLocalStorage.setItem('mobile_billing_current_session', JSON.stringify({ username: 'jkp97847' }));
const test2 = getInitialSessionUser(mockLocalStorage, mockSessionStorage, 'navigate');
assert.strictEqual(test2, null, 'Test 2 Failed: Legacy localStorage session must be purged');
assert.strictEqual(mockLocalStorage.getItem('mobile_billing_current_session'), null, 'Test 2 Failed: Key must be removed from localStorage');
console.log('✓ Test 2 Passed: Legacy persistent localStorage session is wiped immediately');

// Test 3: Tab reload (F5) with active session -> session retained
const user = { username: 'jkp97847', role: 'superadmin' };
mockSessionStorage.setItem('mobile_billing_current_session', JSON.stringify(user));
mockSessionStorage.setItem('mobile_billing_session_heartbeat', Date.now().toString());
mockSessionStorage.setItem('mobile_billing_page_reloading', Date.now().toString());

const test3 = getInitialSessionUser(mockLocalStorage, mockSessionStorage, 'reload');
assert.deepStrictEqual(test3, user, 'Test 3 Failed: In-tab page reload (F5) must keep user logged in');
console.log('✓ Test 3 Passed: In-tab page reload (F5) retains session without losing bill work');

// Test 4: Power cut / abrupt browser crash recovery (Light cut simulation):
// Computer died suddenly. Chrome restored crashed tab 1 minute later.
// Heartbeat is stale (60 seconds old), no reload flag.
mockSessionStorage.setItem('mobile_billing_current_session', JSON.stringify(user));
mockSessionStorage.setItem('mobile_billing_session_heartbeat', (Date.now() - 60000).toString());
mockSessionStorage.removeItem('mobile_billing_page_reloading');

const test4 = getInitialSessionUser(mockLocalStorage, mockSessionStorage, 'navigate');
assert.strictEqual(test4, null, 'Test 4 Failed: Stale session from power cut must be wiped');
assert.strictEqual(mockSessionStorage.getItem('mobile_billing_current_session'), null, 'Test 4 Failed: Session must be cleared from sessionStorage');
console.log('✓ Test 4 Passed: Power cut / unexpected closure automatically invalidates session and forces Login page');

console.log('\nAll 4 tests passed successfully!');
