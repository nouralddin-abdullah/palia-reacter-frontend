import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { getRedeemCodes, createRedeemCode, deleteRedeemCode } from '../../services/api';
import styles from './Admin.module.css';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function RedeemCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState('');
  const [votes, setVotes] = useState('');
  const [maxUses, setMaxUses] = useState('1');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setCodes(await getRedeemCodes());
    } catch (err) {
      toast.error(err.message || 'Failed to load redeem codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    setError('');
    const num = parseInt(votes, 10);
    if (!num || num < 1) {
      setError('Enter a valid number of votes');
      return;
    }

    setCreating(true);
    try {
      const created = await createRedeemCode({
        code: code.trim() || undefined,
        votes: num,
        maxUses: parseInt(maxUses, 10) || 1,
        // datetime-local gives a local wall-clock string; send it as an ISO instant
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      toast.success(`Created code ${created.code}`, { duration: 5000 });
      setCode('');
      setVotes('');
      setMaxUses('1');
      setExpiresAt('');
      setCodes((prev) => [created, ...prev]);
    } catch (err) {
      setError(err.message || 'Failed to create code');
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteRedeemCode(pendingDelete.id);
      toast.success(`Deleted code ${pendingDelete.code}`);
      setCodes((prev) => prev.filter((c) => c.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete code');
    } finally {
      setDeleting(false);
    }
  };

  const isExhausted = (c) => c.uses >= c.max_uses;
  const isExpired = (c) => c.expires_at && new Date(c.expires_at) < new Date();

  return (
    <>
      <div className={styles.section}>
        <h2>Create a Redeem Code</h2>
        <p className={styles.sectionHint}>
          Leave the code blank to generate one automatically. Each user (and each IP) can
          redeem a given code only once.
        </p>

        <div className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="code-value">Code</label>
            <input
              id="code-value"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Auto-generated"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="code-votes">Votes</label>
            <input
              id="code-votes"
              type="number"
              min="1"
              value={votes}
              onChange={(e) => setVotes(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="code-uses">Max uses</label>
            <input
              id="code-uses"
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="code-expires">Expires (optional)</label>
            <input
              id="code-expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          <button className={styles.btn} onClick={handleCreate} disabled={!votes || creating}>
            {creating ? 'Creating...' : 'Create Code'}
          </button>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>

      <div className={styles.section}>
        <h2>Active Codes</h2>
        <p className={styles.sectionHint}>{codes.length} code(s) total.</p>

        {loading ? (
          <div>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : codes.length === 0 ? (
          <p className={styles.empty}>No redeem codes yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Votes</th>
                  <th>Uses</th>
                  <th>Expires</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.id}>
                    <td className={styles.mono}>{c.code}</td>
                    <td>{c.votes.toLocaleString()}</td>
                    <td>
                      {c.uses} / {c.max_uses}
                    </td>
                    <td>{formatDate(c.expires_at)}</td>
                    <td>{formatDate(c.created_at)}</td>
                    <td>
                      {isExpired(c) ? (
                        <span className={styles.muted}>Expired</span>
                      ) : isExhausted(c) ? (
                        <span className={styles.muted}>Used up</span>
                      ) : (
                        <span className={styles.positive}>Active</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={styles.btnDanger}
                        onClick={() => setPendingDelete(c)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pendingDelete && (
        <Modal
          title="Delete Redeem Code"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          confirmText="Delete"
          loading={deleting}
        >
          <p>
            Delete code <strong>{pendingDelete.code}</strong> ({pendingDelete.votes} votes)?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
            It has been redeemed {pendingDelete.uses} time(s). Votes already granted are not
            taken back.
          </p>
        </Modal>
      )}
    </>
  );
}
