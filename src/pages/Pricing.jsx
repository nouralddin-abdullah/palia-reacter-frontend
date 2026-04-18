import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBestValueId, MOST_POPULAR_ID } from '../constants/packages';
import { getPackages, createOrder } from '../services/api';
import usePageMeta from '../hooks/usePageMeta';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import styles from './Pricing.module.css';

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  usePageMeta({
    title: 'Vote Packages & Pricing — PaliaVote',
    description: 'Browse PaliaVote vote packages with bulk discounts. Choose the right package and start distributing votes instantly.',
    canonicalPath: '/pricing',
  });

  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [discordUsername, setDiscordUsername] = useState('');

  useEffect(() => {
    getPackages()
      .then(setPackages)
      .catch(() => toast.error('Failed to load packages'))
      .finally(() => setPackagesLoading(false));
  }, []);

  const bestValueId = getBestValueId(packages);

  const handleBuy = (pkg) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedPkg(pkg);
    setDiscordUsername('');
  };

  const confirmPurchase = async () => {
    if (!selectedPkg) return;
    setPurchasing(true);
    try {
      const res = await createOrder(selectedPkg.id, discordUsername || null);
      setSelectedPkg(null);
      setDiscordUsername('');
      toast.success(
        `Order created! Your order number is ${res.order.order_number}. Contact admin on Discord to confirm payment.`,
        { duration: 8000 }
      );
    } catch (err) {
      toast.error(err.message || 'Failed to create order');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <>
      <div className={styles.pricingPage}>
        <h1>Vote Packages</h1>
        <p className={styles.subtitle}>Choose the package that fits your needs. Bulk discounts available.</p>

        {packagesLoading ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.card} style={{ minHeight: 180, opacity: 0.4 }}>
                <div style={{ height: 20, background: 'var(--border)', borderRadius: 4, marginBottom: 12, width: '60%' }} />
                <div style={{ height: 28, background: 'var(--border)', borderRadius: 4, marginBottom: 8, width: '40%' }} />
                <div style={{ height: 14, background: 'var(--border)', borderRadius: 4, width: '50%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {packages.map((pkg) => {
              const isBestValue = pkg.id === bestValueId;
              const isPopular = pkg.id === MOST_POPULAR_ID;
              return (
                <div key={pkg.id} className={`${styles.card} ${isBestValue || isPopular ? styles.highlighted : ''}`}>
                  {isBestValue && <span className={styles.badge}>Best Value</span>}
                  {isPopular && !isBestValue && <span className={styles.badge}>Most Popular</span>}
                  <div className={styles.cardVotes}>
                    {pkg.votes.toLocaleString()} <span>votes</span>
                  </div>
                  <div className={styles.cardPrice}>
                    {pkg.has_discount ? (
                      <>
                        <span className={styles.originalPrice}>${Number(pkg.original_price).toFixed(2)}</span>
                        ${Number(pkg.price).toFixed(2)}
                        {pkg.discount_type === 'percentage' && (
                          <span className={styles.discountBadge}>{pkg.discount_value}% OFF</span>
                        )}
                        {pkg.discount_type === 'fixed' && (
                          <span className={styles.discountBadge}>${pkg.discount_value} OFF</span>
                        )}
                      </>
                    ) : (
                      <>${Number(pkg.price).toFixed(2)}</>
                    )}
                  </div>
                  <div className={styles.cardRate}>${Number(pkg.price_per_vote).toFixed(4)} per vote</div>
                  <button className={styles.cardBtn} onClick={() => handleBuy(pkg)}>
                    Buy Now
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedPkg && (
        <Modal
          title="Confirm Your Order"
          onCancel={() => { setSelectedPkg(null); setDiscordUsername(''); }}
          onConfirm={confirmPurchase}
          confirmText="Place Order"
          loading={purchasing}
        >
          <div className={styles.orderSummary}>
            <div className={styles.orderRow}>
              <span>Package</span>
              <strong>{selectedPkg.votes.toLocaleString()} votes</strong>
            </div>
            <div className={styles.orderRow}>
              <span>Price</span>
              <strong className={styles.orderPrice}>${Number(selectedPkg.price).toFixed(2)}</strong>
            </div>
          </div>

          <div className={styles.orderSteps}>
            <div className={styles.stepTitle}>How it works</div>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <span>Place your order to receive a unique order number</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <span>Message <strong>yasta1</strong> on Discord with your order number</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <span>Complete payment and receive your votes instantly</span>
            </div>
          </div>

          <div className={styles.discordField}>
            <label htmlFor="discord-username">
              Discord Username <span className={styles.optionalTag}>optional</span>
            </label>
            <div className={styles.discordInputWrap}>
              <svg className={styles.discordIcon} viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <input
                id="discord-username"
                type="text"
                placeholder="e.g. username"
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                maxLength={50}
                autoComplete="off"
              />
            </div>
            <span className={styles.discordHint}>
              Share your Discord username so we can reach out to you if needed
            </span>
          </div>
        </Modal>
      )}

      <Footer />
    </>
  );
}
