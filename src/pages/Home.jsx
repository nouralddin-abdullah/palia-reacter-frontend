import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import styles from './Home.module.css';

const FAQ_DATA = [
  { q: 'How do vote packages work?', a: 'When you purchase a vote package, the votes are added to your account balance. You can then distribute them to any user, in any amount you choose.' },
  { q: 'Can I split votes across multiple users?', a: 'Yes! Votes work like a wallet balance. Buy 1,000 votes and send 200 to one person, 300 to another — it\'s entirely up to you.' },
  { q: 'How quickly are votes delivered?', a: 'Votes are delivered instantly after you send them to a recipient.' },
  { q: 'Is there a minimum order?', a: 'Our smallest package is 50 votes for $2.00. There\'s no minimum when sending votes — you can send as few as 1 vote at a time.' },
  { q: 'Can I get a refund?', a: 'Unused votes remain in your balance indefinitely. Contact support for refund inquiries on recent purchases.' },
];

const IconBolt = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconTarget = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function Home() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        {import.meta.env.VITE_APP_MODE === 'trial' ? (
          <>
            <h1>Distribute Votes Your Way</h1>
            <p>
              Send votes to anyone, in any amount. Fast, simple, and flexible.
            </p>
            {user ? (
              <Link to="/dashboard" className={styles.heroCta}>Dashboard</Link>
            ) : (
              <Link to="/login" className={styles.heroCta}>Login</Link>
            )}
          </>
        ) : (
          <>
            <h1>Buy Votes &amp; Distribute Them Your Way</h1>
            <p>
              Purchase vote packages and send them to anyone, in any amount. Fast, simple, and flexible.
            </p>
            <Link to="/pricing" className={styles.heroCta}>View Packages</Link>
          </>
        )}
      </section>

      {/* Feature Cards */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}><IconBolt /></div>
          <h3>Instant Delivery</h3>
          <p>Votes are delivered to recipients instantly after sending.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}><IconTarget /></div>
          <h3>Flexible Distribution</h3>
          <p>Split your votes however you want across multiple users.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}><IconShield /></div>
          <h3>Secure &amp; Reliable</h3>
          <p>Your votes are stored safely until you're ready to use them.</p>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2>Ready to get started?</h2>
        <p>Create an account and start distributing votes in minutes.</p>
        <div className={styles.ctaButtons}>
          {import.meta.env.VITE_APP_MODE === 'trial' ? (
            user ? (
              <Link to="/dashboard" className={styles.heroCta}>Dashboard</Link>
            ) : (
              <Link to="/login" className={styles.heroCta}>Login</Link>
            )
          ) : (
            <Link to="/pricing" className={styles.heroCta}>See Pricing</Link>
          )}
          {!user && <Link to="/signup" className={styles.ctaSecondary}>Create Account</Link>}
        </div>
      </section>

      {/* FAQ */}
      {import.meta.env.VITE_APP_MODE !== 'trial' && (
        <section className={styles.faq}>
          <h2>Frequently Asked Questions</h2>
          {FAQ_DATA.map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <button className={styles.faqQuestion} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {item.q}
                <span>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <p className={styles.faqAnswer}>{item.a}</p>}
            </div>
          ))}
        </section>
      )}

      <Footer />
    </>
  );
}
