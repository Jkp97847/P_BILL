// Test script to verify uppercase behavior
function shouldExcludeElement(target) {
  if (!target) return true;
  const tagName = (target.tagName || '').toUpperCase();
  if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') return true;

  if (target.hasAttribute && (target.hasAttribute('data-no-uppercase') || target.getAttribute('data-no-uppercase') === 'true')) {
    return true;
  }

  const type = (target.type || 'text').toLowerCase();
  const nonTextTypes = [
    'password', 'number', 'checkbox', 'radio', 'file', 'color', 
    'range', 'date', 'time', 'datetime-local', 'month', 'week', 
    'hidden', 'submit', 'reset', 'button', 'image'
  ];
  if (nonTextTypes.includes(type)) return true;

  const name = (target.name || '').toLowerCase();
  const id = (target.id || '').toLowerCase();
  const autocomplete = (target.autocomplete || '').toLowerCase();
  const placeholder = (target.placeholder || '').toLowerCase();

  const isPassword = 
    type === 'password' || 
    name.includes('password') || 
    name.includes('pass') || 
    id.includes('password') || 
    id.includes('pass') || 
    autocomplete.includes('password') ||
    placeholder.includes('password') ||
    placeholder.includes('पासवर्ड');

  if (isPassword) return true;

  const isUsername = 
    name.includes('username') || 
    name.includes('user_name') || 
    id.includes('username') || 
    id.includes('user_name') || 
    autocomplete.includes('username') ||
    placeholder.includes('username') ||
    placeholder.includes('यूजरनेम') ||
    placeholder.includes('seller1');

  if (isUsername) return true;

  return false;
}

// Test cases
const tests = [
  { el: { tagName: 'INPUT', type: 'text', name: 'customerName', placeholder: 'ग्राहक का नाम' }, expected: false, desc: 'Customer name input should uppercase' },
  { el: { tagName: 'INPUT', type: 'text', name: 'itemName', placeholder: 'आइटम का नाम' }, expected: false, desc: 'Item name input should uppercase' },
  { el: { tagName: 'INPUT', type: 'text', name: 'gstin', placeholder: 'GSTIN' }, expected: false, desc: 'GSTIN input should uppercase' },
  { el: { tagName: 'INPUT', type: 'text', name: 'address', placeholder: 'पता' }, expected: false, desc: 'Address input should uppercase' },
  { el: { tagName: 'TEXTAREA', name: 'notes' }, expected: false, desc: 'Textarea should uppercase' },
  { el: { tagName: 'INPUT', type: 'password', name: 'password' }, expected: true, desc: 'Password input should NOT uppercase' },
  { el: { tagName: 'INPUT', type: 'text', name: 'password', placeholder: 'अपना पासवर्ड दर्ज करें' }, expected: true, desc: 'Text password input should NOT uppercase' },
  { el: { tagName: 'INPUT', type: 'text', name: 'username', placeholder: 'उदा. seller1' }, expected: true, desc: 'Username input should NOT uppercase' },
  { el: { tagName: 'INPUT', type: 'text', id: 'login-username', placeholder: 'यूजरनेम' }, expected: true, desc: 'Username input with id should NOT uppercase' },
  { el: { tagName: 'INPUT', type: 'text', placeholder: 'उदा. seller1' }, expected: true, desc: 'Username input with placeholder seller1 should NOT uppercase' },
  { el: { tagName: 'INPUT', type: 'number', name: 'qty' }, expected: true, desc: 'Number input should NOT uppercase' },
];

let allPassed = true;
tests.forEach((t, i) => {
  const result = shouldExcludeElement({
    ...t.el,
    hasAttribute: (attr) => attr in t.el,
    getAttribute: (attr) => t.el[attr] || ''
  });
  if (result !== t.expected) {
    console.error(`FAILED test ${i + 1}: ${t.desc} (got ${result}, expected ${t.expected})`);
    allPassed = false;
  } else {
    console.log(`PASSED test ${i + 1}: ${t.desc}`);
  }
});

console.log(allPassed ? '\nALL TESTS PASSED!' : '\nSOME TESTS FAILED!');
