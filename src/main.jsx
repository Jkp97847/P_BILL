import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Automatically convert all text and character inputs to UPPERCASE across the entire application
if (typeof window !== 'undefined') {
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (!target) return;
    const isText = (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search')) || target.tagName === 'TEXTAREA';
    const isExcluded = target.classList?.contains('normal-case') || target.classList?.contains('lowercase-input') || target.type === 'password' || target.type === 'email';
    
    if (isText && !isExcluded && typeof target.value === 'string') {
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const upper = target.value.toUpperCase();
      if (target.value !== upper) {
        target.value = upper;
        if (start !== null && end !== null) {
          target.setSelectionRange(start, end);
        }
      }
    }
  }, true);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
