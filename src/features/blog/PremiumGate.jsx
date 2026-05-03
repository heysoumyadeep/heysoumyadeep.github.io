/**
 * PremiumGate.jsx
 *
 * Premium content gate with:
 * - Gradual blur above divider, full blur below
 * - Centered "Unlock now" button on divider line
 * - Passcode entry modal for users who already bought coffee
 * - Content NOT rendered in DOM until unlocked (prevents inspect element bypass)
 * - Supports multiple unlock codes
 * - Encrypts unlock status in localStorage
 */

import { useState, useEffect } from 'react';
import './PremiumGate.scss';
import { triggerSnackbar } from '@/site-container/support-snackbar/SupportSnackbar';

const BMC_URL = 'https://buymeacoffee.com/heysoumyadeep';

const VALID_CODES = (() => {
  const codesString = import.meta.env.VITE_PREMIUM_CODES || '';
  return codesString
    .split(',')
    .map(code => code.trim())
    .filter(code => code.length === 8 && /^\d+$/.test(code));
})();

const STORAGE_KEY = 'premium_unlocked_posts';
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

// Simple encryption/decryption functions using XOR cipher
function encrypt(text) {
  try {
    // XOR cipher with base64 encoding
    const encrypted = btoa(
      String.fromCharCode(
        ...text.split('').map((char, i) => 
          char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
        )
      )
    );
    return encrypted;
  } catch {
    return text;
  }
}

function decrypt(encrypted) {
  try {
    const decrypted = atob(encrypted)
      .split('')
      .map((char, i) => 
        String.fromCharCode(
          char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
        )
      )
      .join('');
    return decrypted;
  } catch {
    return encrypted;
  }
}

// Check if this post is already unlocked
function isUnlocked(slug) {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return false;
    
    const decrypted = decrypt(encrypted);
    const unlocked = JSON.parse(decrypted);
    return unlocked[slug] === true;
  } catch {
    return false;
  }
}

// Mark post as unlocked
function markUnlocked(slug) {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    let unlocked = {};
    
    if (encrypted) {
      const decrypted = decrypt(encrypted);
      unlocked = JSON.parse(decrypted);
    }
    
    unlocked[slug] = true;
    const encryptedData = encrypt(JSON.stringify(unlocked));
    localStorage.setItem(STORAGE_KEY, encryptedData);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

// Validate if entered code is valid
function isValidCode(code) {
  return VALID_CODES.includes(code);
}

function PasscodeModal({ onClose, onSuccess }) {
  const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = [
    ...Array(8).fill(null).map(() => ({ current: null }))
  ];

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newCode = [...code];
    newCode[index] = value.slice(-1); // take last char only
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 7) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    if (pasted.length > 0) {
      const focusIndex = Math.min(pasted.length, 7);
      inputRefs[focusIndex].current?.focus();
    }
  };

  const handleSubmit = () => {
    const entered = code.join('');
    if (entered.length !== 8) {
      setError('Please enter all 8 digits');
      return;
    }
    if (isValidCode(entered)) {
      onSuccess();
    } else {
      setError('Invalid code. Please try again.');
      setCode(['', '', '', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  return (
    <div
      className="passcode-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="passcode-modal">
        <h2 className="passcode-modal__title">Enter Access Code</h2>
        <p className="passcode-modal__subtitle">
          Enter the 8-digit code you received via mail
        </p>

        <div className="passcode-modal__inputs" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs[i].current = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="passcode-modal__input"
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {error && <p className="passcode-modal__error">{error}</p>}

        <button
          type="button"
          className="passcode-modal__submit"
          onClick={handleSubmit}
        >
          Continue
        </button>

        <button
          type="button"
          className="passcode-modal__cancel"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function PremiumGate({ children, slug, tags = [] }) {
  const [unlocked, setUnlocked] = useState(() => isUnlocked(slug));
  const [showPasscode, setShowPasscode] = useState(false);

  const handleUnlock = () => {
    // Trigger the BMC widget button click
    const bmcButton = document.querySelector('#bmc-wbtn');
    if (bmcButton) {
      bmcButton.click();
      // Show snackbar on desktop only (>768px)
      triggerSnackbar();
    } else {
      // Fallback: open in new tab if widget not found
      window.open(BMC_URL, '_blank', 'noreferrer,noopener');
    }
  };

  const handlePasscodeSuccess = () => {
    markUnlocked(slug);
    setUnlocked(true);
    setShowPasscode(false);
  };

  // If unlocked, render full content
  if (unlocked) {
    return (
      <>
        {children}
        {/* Tags - shown only when unlocked */}
        {tags && tags.length > 0 && (
          <div className="premium-gate__tags">
            <span className="premium-gate__tags-label">Tags used here:</span>
            <ul className="premium-gate__tags-list" aria-label="Post tags">
              {tags.map((tag) => (
                <li key={tag} className="premium-gate__tag"><span>{tag}</span></li>
              ))}
            </ul>
          </div>
        )}
      </>
    );
  }

  // Otherwise show preview + gate
  return (
    <div className="premium-gate">
      {/* Preview with gradual blur */}
      <div className="premium-gate__preview">
        {children}
      </div>

      {/* Fully blurred continuation */}
      <div className="premium-gate__blurred" aria-hidden="true">
        <div className="premium-gate__blurred-text">
          <p>This content is locked. Support my work to continue reading.</p>
          <p>Your support helps me write more in-depth articles like this.</p>
          <p>Thank you for considering!</p>
        </div>
      </div>

      {/* Divider with centered button */}
      <div className="premium-gate__divider">
        <button
          type="button"
          className="premium-gate__unlock-btn"
          onClick={handleUnlock}
        >
          🔒 Unlock now
        </button>
      </div>

      {/* Already bought link */}
      <div className="premium-gate__footer">
        <button
          type="button"
          className="premium-gate__passcode-link"
          onClick={() => setShowPasscode(true)}
        >
          Already bought a coffee?
        </button>
      </div>

      {/* Passcode modal */}
      {showPasscode && (
        <PasscodeModal
          onClose={() => setShowPasscode(false)}
          onSuccess={handlePasscodeSuccess}
        />
      )}
    </div>
  );
}
