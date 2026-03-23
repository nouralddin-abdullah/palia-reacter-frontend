import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBestValueId, MOST_POPULAR_ID } from '../constants/packages';
import { getPackages, createOrder } from '../services/api';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import styles from './Pricing.module.css';

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

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
  };

  const confirmPurchase = async () => {
    if (!selectedPkg) return;
    setPurchasing(true);
    try {
      const res = await createOrder(selectedPkg.id);
      setSelectedPkg(null);
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
          title="Create Order"
          onCancel={() => setSelectedPkg(null)}
          onConfirm={confirmPurchase}
          confirmText="Create Order"
          loading={purchasing}
        >
          <p>
            You're about to order <strong>{selectedPkg.votes.toLocaleString()} votes</strong> for{' '}
            <strong>${Number(selectedPkg.price).toFixed(2)}</strong>.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
            After creating the order, you'll receive an order number. Contact 'yasta1' on Discord with this number to confirm your payment.
          </p>
        </Modal>
      )}

      <Footer />
    </>
  );
}
