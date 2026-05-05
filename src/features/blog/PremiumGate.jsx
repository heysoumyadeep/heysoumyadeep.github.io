// Premium gate
import { useState, useEffect } from 'react';
import './PremiumGate.scss';
import { triggerSnackbar } from '@/site-container/support-snackbar/SupportSnackbar';

const BMC_URL = 'https://buymeacoffee.com/heysoumyadeep';

const VALID_CODES = (() => {
  const raw = import.meta.env.VITE_PREMIUM_CODES || '';
  return raw.split(',').map(c => c.trim()).filter(c => c.length === 8 && /^\d+$/.test(c));
})();

const STORAGE_KEY    = 'premium_unlocked_posts';
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

// XOR cipher helpers
function encrypt(text) {
  try {
    return btoa(
      String.fromCharCode(
        ...text.split('').map((char, i) =>
          char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
        )
      )
    );
  } catch { return text; }
}

function decrypt(encrypted) {
  try {
    return atob(encrypted)
      .split('')
      .map((char, i) =>
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      )
      .join('');
  } catch { return encrypted; }
}

function isUnlocked(slug) {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return false;
    return JSON.parse(decrypt(encrypted))[slug] === true;
  } catch { return false; }
}

function markUnlocked(slug) {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    let unlocked = {};
    if (encrypted) unlocked = JSON.parse(decrypt(encrypted));
    unlocked[slug] = true;
    localStorage.setItem(STORAGE_KEY, encrypt(JSON.stringify(unlocked)));
  } catch { /* localStorage unavailable */ }
}

function isValidCode(code) {
  return VALID_CODES.includes(code);
}

function PasscodeModal({ onClose, onSuccess }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '', '', '']);
  const [error, setError]   = useState('');
  const inputRefs = Array(8).fill(null).map(() => ({ current: null }));

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    setError('');
    if (value && index < 7) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    if (pasted.length > 0) inputRefs[Math.min(pasted.length, 7)].current?.focus();
  };

  const handleSubmit = () => {
    const entered = digits.join('');
    if (entered.length !== 8) { setError('Please enter all 8 digits'); return; }
    if (isValidCode(entered)) {
      onSuccess();
    } else {
      setError('Invalid code. Please try again.');
      setDigits(['', '', '', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  useEffect(() => { inputRefs[0].current?.focus(); }, []);

  return (
    <div
      className="passcode-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="passcode-modal">
        <h2 className="passcode-modal__title">Enter Access Code</h2>
        <p className="passcode-modal__subtitle">Enter the 8-digit code you received via mail</p>

        <div className="passcode-modal__inputs" onPaste={handlePaste}>
          {digits.map((digit, i) => (
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

        <button type="button" className="passcode-modal__submit" onClick={handleSubmit}>
          Continue
        </button>
        <button type="button" className="passcode-modal__cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function PremiumGate({ children, slug, tags = [] }) {
  const [unlocked, setUnlocked]       = useState(() => isUnlocked(slug));
  const [showPasscode, setShowPasscode] = useState(false);

  const handleUnlock = () => {
    const bmcButton = document.querySelector('#bmc-wbtn');
    if (bmcButton) {
      const prev = bmcButton.style.display;
      bmcButton.style.display = '';
      bmcButton.click();
      bmcButton.style.display = prev || 'none';
      triggerSnackbar();
    } else {
      window.open(BMC_URL, '_blank', 'noreferrer,noopener');
    }
  };

  const handlePasscodeSuccess = () => {
    markUnlocked(slug);
    setUnlocked(true);
    setShowPasscode(false);
  };

  if (unlocked) {
    return (
      <>
        {children}
        {tags.length > 0 && (
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

  return (
    <div className="premium-gate">
      <div className="premium-gate__preview">{children}</div>

      <div className="premium-gate__blurred" aria-hidden="true">
        <div className="premium-gate__blurred-text">
          <p>This content is locked. Support my work to continue reading.</p>
          <p>Your support helps me write more in-depth articles like this.</p>
          <p>Thank you for considering!</p>
        </div>
      </div>

      <div className="premium-gate__divider">
        <button type="button" className="premium-gate__unlock-btn" onClick={handleUnlock}>
          🔒 Unlock now
        </button>
      </div>

      <div className="premium-gate__footer">
        <button
          type="button"
          className="premium-gate__passcode-link"
          onClick={() => setShowPasscode(true)}
        >
          Already bought a coffee?
        </button>
      </div>

      {showPasscode && (
        <PasscodeModal
          onClose={() => setShowPasscode(false)}
          onSuccess={handlePasscodeSuccess}
        />
      )}
    </div>
  );
}
