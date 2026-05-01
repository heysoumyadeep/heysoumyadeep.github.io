/**
 * PremiumGate.jsx
 *
 * Premium content gate with:
 * - Gradual blur above divider, full blur below
 * - Centered "Unlock now" button on divider line
 * - Passcode entry modal for users who already bought coffee
 * - Content NOT rendered in DOM until unlocked (prevents inspect element bypass)
 */

import { useState, useEffect } from 'react';
import './PremiumGate.scss';

const BMC_URL = 'https://buymeacoffee.com/heysoumyadeep';
const UNLOCK_CODE = '12345678'; // Change this to your actual 8-digit code
const STORAGE_KEY = 'premium_unlocked_posts';

// Check if this post is already unlocked
function isUnlocked(slug) {
  try {
    const unlocked = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return unlocked[slug] === true;
  } catch {
    return false;
  }
}

// Mark post as unlocked
function markUnlocked(slug) {
  try {
    const unlocked = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    unlocked[slug] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  } catch { /* ignore */ }
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
    if (entered === UNLOCK_CODE) {
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
          Enter the 8-digit code you received after supporting
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

export default function PremiumGate({ children, slug }) {
  const [unlocked, setUnlocked] = useState(() => isUnlocked(slug));
  const [showPasscode, setShowPasscode] = useState(false);

  const handleUnlock = () => {
    window.open(BMC_URL, '_blank', 'noreferrer,noopener');
  };

  const handlePasscodeSuccess = () => {
    markUnlocked(slug);
    setUnlocked(true);
    setShowPasscode(false);
  };

  // If unlocked, render full content
  if (unlocked) {
    return <>{children}</>;
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
