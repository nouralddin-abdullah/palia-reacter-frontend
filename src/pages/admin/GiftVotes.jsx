import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { searchUsers, giftVotes } from '../../services/api';
import styles from './Admin.module.css';

export default function GiftVotes() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [giftCap, setGiftCap] = useState(null);
  const [searching, setSearching] = useState(true);
  const [selected, setSelected] = useState(null);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Debounce so typing a username doesn't fire a request per keystroke
  useEffect(() => {
    let cancelled = false;
    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers({ search, limit: 8 });
        if (cancelled) return;
        setUsers(res.users);
        setGiftCap(res.gift_cap ?? null);
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Failed to search users');
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  const handleGiftClick = () => {
    setError('');
    if (!selected) {
      setError('Pick a user to gift to');
      return;
    }
    const num = parseInt(amount, 10);
    if (!num || num < 1) {
      setError('Enter a valid number of votes');
      return;
    }
    if (giftCap && num > giftCap) {
      setError(`Moderators can gift at most ${giftCap.toLocaleString()} votes per action`);
      return;
    }
    setShowConfirm(true);
  };

  const confirmGift = async () => {
    setSubmitting(true);
    try {
      const res = await giftVotes({
        userId: selected.id,
        amount: parseInt(amount, 10),
        note: note.trim() || undefined,
      });
      toast.success(res.message, { duration: 5000 });

      // Reflect the new balance in the picker without a refetch
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selected.id ? { ...u, vote_balance: res.user.new_balance } : u,
        ),
      );
      setAmount('');
      setNote('');
      setShowConfirm(false);
      setSelected(null);
    } catch (err) {
      setShowConfirm(false);
      setError(err.message || 'Failed to gift votes');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.section}>
      <h2>Gift Votes</h2>
      <p className={styles.sectionHint}>
        Credits votes straight to a user&apos;s balance and records the gift in the audit log.
        {giftCap
          ? ` You can gift up to ${giftCap.toLocaleString()} votes per action.`
          : ' Admins have no per-gift limit.'}
      </p>

      <div className={styles.field} style={{ marginBottom: 4 }}>
        <label htmlFor="user-search">Find a user</label>
        <input
          id="user-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username, email, or Discord name"
          autoComplete="off"
        />
      </div>

      <div className={styles.results}>
        {searching ? (
          <div style={{ padding: '14px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className={styles.empty}>No users match that search.</p>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              role="button"
              tabIndex={0}
              className={`${styles.resultRow} ${selected?.id === u.id ? styles.resultRowSelected : ''}`}
              onClick={() => setSelected(u)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected(u);
                }
              }}
            >
              <div>
                <p className={styles.resultName}>
                  {u.username}
                  {u.role !== 'user' && (
                    <span className={styles.pill} style={{ marginLeft: 8 }}>{u.role}</span>
                  )}
                </p>
                <p className={styles.resultMeta}>
                  {u.email}
                  {u.discord_username ? ` · ${u.discord_username}` : ''}
                </p>
              </div>
              <span className={styles.resultBalance}>
                {(u.vote_balance || 0).toLocaleString()} votes
              </span>
            </div>
          ))
        )}
      </div>

      <div className={styles.form} style={{ marginTop: 20 }}>
        <div className={styles.field}>
          <label htmlFor="gift-amount">Votes to gift</label>
          <input
            id="gift-amount"
            type="number"
            min="1"
            max={giftCap || undefined}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100"
          />
        </div>
        <div className={styles.field} style={{ flex: 2 }}>
          <label htmlFor="gift-note">Note (optional)</label>
          <input
            id="gift-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Giveaway winner"
          />
        </div>
        <button
          className={styles.btn}
          onClick={handleGiftClick}
          disabled={!selected || !amount || submitting}
        >
          Gift Votes
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </div>

      {showConfirm && (
        <Modal
          title="Confirm Gift"
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmGift}
          confirmText="Gift Votes"
          loading={submitting}
        >
          <p>
            Gift <strong>{parseInt(amount, 10).toLocaleString()} votes</strong> to{' '}
            <strong>{selected?.username}</strong>?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Their balance goes from {(selected?.vote_balance || 0).toLocaleString()} to{' '}
            {((selected?.vote_balance || 0) + parseInt(amount, 10)).toLocaleString()}. This is
            recorded in the audit log under your name.
          </p>
        </Modal>
      )}
    </div>
  );
}
