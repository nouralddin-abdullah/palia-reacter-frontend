import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import styles from './Auth.module.css';

export default function ForgotPassword() {
  usePageMeta({
    title: 'Reset Password — PaliaVote',
    description: 'Reset your PaliaVote account password. Enter your email and we\'ll send you a recovery link.',
    canonicalPath: '/forgot-password',
  });

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      // TODO: integrate with real forgot-password endpoint when available
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h2>Reset your password</h2>
        <p className={styles.subtitle}>Enter your email and we'll send you a reset link</p>
        {success && (
          <div className={styles.successMsg}>
            If an account exists with this email, a password reset link has been sent.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {error && <div className={styles.error}>{error}</div>}
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading || success}>
            {loading ? 'Sending...' : success ? 'Email Sent' : 'Send Reset Link'}
          </button>
        </form>
        <p className={styles.bottomText}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
