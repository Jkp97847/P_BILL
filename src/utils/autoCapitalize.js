/**
 * Global Auto-Capitalize Utility
 * Automatically transforms all input and textarea values to UPPERCASE across all projects
 * EXCLUDING: Username and Password fields
 */

export function shouldExcludeElement(target) {
  if (!target || !(target instanceof HTMLElement)) return true;

  const tagName = target.tagName ? target.tagName.toUpperCase() : '';
  if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') return true;

  // Explicit opt-out attribute
  if (target.hasAttribute('data-no-uppercase') || target.dataset.noUppercase === 'true') {
    return true;
  }

  const type = (target.getAttribute('type') || (tagName === 'TEXTAREA' ? 'textarea' : 'text')).toLowerCase();

  // Exclude non-textual input types
  const nonTextTypes = [
    'password',
    'email',
    'number',
    'checkbox',
    'radio',
    'file',
    'color',
    'range',
    'date',
    'time',
    'datetime-local',
    'month',
    'week',
    'hidden',
    'submit',
    'reset',
    'button',
    'image'
  ];
  if (nonTextTypes.includes(type)) return true;

  // Check attributes and identifiers for username and password
  const name = (target.getAttribute('name') || '').toLowerCase();
  const id = (target.getAttribute('id') || '').toLowerCase();
  const autocomplete = (target.getAttribute('autocomplete') || '').toLowerCase();
  const placeholder = (target.getAttribute('placeholder') || '').toLowerCase();

  // 1. Password field exclusion
  const isPassword =
    type === 'password' ||
    name.includes('password') ||
    name.includes('pass') ||
    name.includes('pwd') ||
    id.includes('password') ||
    id.includes('pass') ||
    id.includes('pwd') ||
    autocomplete.includes('password') ||
    placeholder.includes('password') ||
    placeholder.includes('पासवर्ड');

  if (isPassword) return true;

  // 2. Username field exclusion
  const isUsername =
    name.includes('username') ||
    name.includes('user_name') ||
    name === 'user' ||
    id.includes('username') ||
    id.includes('user_name') ||
    autocomplete.includes('username') ||
    placeholder.includes('username') ||
    placeholder.includes('यूजरनेम') ||
    placeholder.includes('seller1') ||
    placeholder.includes('superadmin') ||
    placeholder.includes('jkp97847');

  if (isUsername) return true;

  return false;
}

export function applyAutoUppercase(target) {
  if (shouldExcludeElement(target)) return;

  const originalValue = target.value;
  if (typeof originalValue !== 'string' || !originalValue) return;

  const upperValue = originalValue.toUpperCase();
  if (originalValue === upperValue) return;

  const start = target.selectionStart;
  const end = target.selectionEnd;

  // Update native value descriptor for React value tracking
  const proto = target instanceof HTMLInputElement
    ? window.HTMLInputElement.prototype
    : window.HTMLTextAreaElement.prototype;

  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');

  if (descriptor && descriptor.set) {
    descriptor.set.call(target, upperValue);
  } else {
    target.value = upperValue;
  }

  // Restore cursor position smoothly
  try {
    if (typeof target.setSelectionRange === 'function' && start !== null && end !== null) {
      target.setSelectionRange(start, end);
    }
  } catch {}
}

export function initAutoCapitalize() {
  if (typeof window === 'undefined') return;

  // Capture phase listener on window catches all input events before React listeners
  window.addEventListener('input', (e) => {
    applyAutoUppercase(e.target);
  }, true);

  window.addEventListener('change', (e) => {
    applyAutoUppercase(e.target);
  }, true);

  window.addEventListener('compositionend', (e) => {
    applyAutoUppercase(e.target);
  }, true);

  window.addEventListener('paste', (e) => {
    setTimeout(() => {
      applyAutoUppercase(e.target);
    }, 0);
  }, true);
}

// Auto-initialize immediately upon import
initAutoCapitalize();
