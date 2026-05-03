import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Button, CheckIcon } from '@components';
import './ContactForm.scss';

const initialState = { email: '', message: '' };

const validate = (data) => {
  const next = {};
  if (!data.email.trim()) {
    next.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    next.email = 'Enter a valid email address.';
  }
  if (!data.message.trim()) {
    next.message = 'A short message helps me reply better.';
  } else if (data.message.trim().length < 10) {
    next.message = 'Tell me a bit more, at least 10 characters.';
  }
  return next;
};

/**
 * Controlled contact form.
 * On submit: validates → sends thank-you email via EmailJS → shows success state.
 *
 * Required env vars (add to .env and GitHub Actions secrets):
 *   VITE_EMAILJS_SERVICE_ID   – your EmailJS service ID
 *   VITE_EMAILJS_TEMPLATE_ID  – your EmailJS template ID
 *   VITE_EMAILJS_PUBLIC_KEY   – your EmailJS public key
 */
export default function ContactForm() {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setStatus('sending');
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: values.email,   // recipient - the person who filled the form
          message: values.message,  // their message (available in template)
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
      setStatus('success');
      setValues(initialState);
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="contact-form contact-form--success" role="status" aria-live="polite">
        <div className="contact-form__success-icon" aria-hidden="true">
          <CheckIcon size={28} />
        </div>
        <h3>Thanks, message received.</h3>
        <p>I'll get back to you as soon as I can. In the meantime, take care.</p>
        <Button variant="ghost" onClick={() => setStatus('idle')}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__field">
        <label htmlFor="contact-email" className="contact-form__label">
          Your email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          className={`contact-form__input ${errors.email ? 'has-error' : ''}`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          autoComplete="email"
        />
        {errors.email && (
          <span id="email-error" className="contact-form__error" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-message" className="contact-form__label">
          Message or feedback
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Tell me what's on your mind…"
          value={values.message}
          onChange={handleChange}
          className={`contact-form__input contact-form__input--textarea ${errors.message ? 'has-error' : ''}`}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <span id="message-error" className="contact-form__error" role="alert">
            {errors.message}
          </span>
        )}
      </div>

      {status === 'error' && (
        <p className="contact-form__error" role="alert">
          Something went wrong. Please try again.
        </p>
      )}

      <Button variant="primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message →'}
      </Button>
    </form>
  );
}
