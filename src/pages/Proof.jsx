import Footer from '../components/Footer';
import { getProofs } from '../services/api';
import { useState, useEffect } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import toast from 'react-hot-toast';
import styles from './Proof.module.css';

export default function Proof() {
  usePageMeta({
    title: 'Proof of Delivery — PaliaVote',
    description: 'See real proof of vote delivery from verified PaliaVote orders. Transparent results you can trust.',
    canonicalPath: '/proof',
  });
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProofs() {
      try {
        const data = await getProofs();
        setProofs(data || []);
      } catch (err) {
        toast.error('Failed to load proofs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProofs();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <div className={styles.proofPage}>
        <h1>Proof of Delivery</h1>
        <p className={styles.subtitle}>Real results from real orders.</p>
        
        {loading ? (
          <div className={styles.gallery}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.proofCard} style={{ opacity: 0.5 }}>
                <div className={styles.proofImage}>Loading...</div>
                <div className={styles.proofMeta}>
                  <div style={{ width: 60, height: 16, background: 'var(--border)', borderRadius: 4 }} />
                  <div style={{ width: 80, height: 16, background: 'var(--border)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : proofs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            No proofs of delivery yet. Check back later!
          </div>
        ) : (
          <div className={styles.gallery}>
            {proofs.map((item) => (
              <div key={item.id} className={styles.proofCard}>
                <div className={styles.proofImage}>
                  <img src={item.image_url} alt={`Proof #${item.id}`} loading="lazy" />
                </div>
                <div className={styles.proofMeta}>
                  <span>{item.vote_count.toLocaleString()} votes</span>
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
