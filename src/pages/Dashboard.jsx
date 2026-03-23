import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVotes } from '../context/VoteContext';
import { getTransactions } from '../services/api';
import { REACTION_TYPES } from '../constants/packages';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { balance, stats, loading, send, redeem } = useVotes();
  
  // Send form state
  const [targetName, setTargetName] = useState('');
  const [amount, setAmount] = useState('');
  const [reactionType, setReactionType] = useState('cool');
  const [sendError, setSendError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  // Redeem Code state
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState('');

  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [txnLoading, setTxnLoading] = useState(true);

  const fetchTransactions = async (page) => {
    setTxnLoading(true);
    try {
      const res = await getTransactions(page, 10);
      setTransactions(res.transactions);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('Failed to load transaction history');
    } finally {
      setTxnLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, []);

  const handleSendClick = () => {
    setSendError('');
    if (!targetName.trim()) { setSendError('Character name is required'); return; }
    const num = parseInt(amount, 10);
    if (!num || num <= 0) { setSendError('Enter a valid number of votes'); return; }
    if (num > balance) { setSendError('Insufficient vote balance'); return; }
    setShowConfirm(true);
  };

  const confirmSend = async () => {
    setSending(true);
    try {
      const res = await send(targetName.trim(), parseInt(amount, 10), reactionType);
      const imgSrc = getReactionImage(reactionType);
      
      let msgText = `Sent ${res.total} votes to ${res.target_name}`;
      if (res.failed > 0) {
        msgText += ` (${res.succeeded} succeeded, ${res.failed} failed/refunded)`;
      } else {
        msgText += ' successfully!';
      }
      
      toast.success(
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {imgSrc && <img src={imgSrc} alt="reaction" style={{ width: 20, height: 20 }} />}
          <span>{msgText}</span>
        </div>,
        { duration: 5000 }
      );

      setTargetName('');
      setAmount('');
      setReactionType('cool');
      setShowConfirm(false);
      // Refresh transactions after sending
      fetchTransactions(1);
    } catch (err) {
      toast.error(err.message || 'Failed to send votes');
    } finally {
      setSending(false);
    }
  };

  const handleRedeemClick = async () => {
    setRedeemError('');
    if (!redeemCodeInput.trim()) {
      setRedeemError('Please enter a code');
      return;
    }
    setRedeeming(true);
    try {
      const res = await redeem(redeemCodeInput.trim());
      toast.success(res.message || `Successfully redeemed ${res.votes_awarded} votes!`, { duration: 5000 });
      setRedeemCodeInput('');
      fetchTransactions(1);
    } catch (err) {
      setRedeemError(err.message || 'Failed to redeem code');
    } finally {
      setRedeeming(false);
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
      case 'confirmed': return styles.purchase;
      case 'failed':
      case 'rejected': return styles.sent;
      case 'pending': return styles.pending || '';
      default: return '';
    }
  };

  const getReactionEmoji = (type) => {
    return REACTION_TYPES.find(r => r.id === type)?.emoji || '';
  };

  const getReactionImage = (type) => {
    return REACTION_TYPES.find(r => r.id === type)?.image || '';
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <h1>Dashboard</h1>
        <div className={styles.balanceCard}>
          <div>
            <p className={styles.balanceLabel}>Your Vote Balance</p>
            <div className={styles.skeleton} style={{ width: 180, height: 36 }} />
          </div>
        </div>
        <div className={styles.statsRow}>
          {[1, 2, 3].map((i) => (
            <div className={styles.statCard} key={i}>
              <div className={styles.skeleton} style={{ width: 100, height: 16, marginBottom: 8 }} />
              <div className={styles.skeleton} style={{ width: 60, height: 24 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>

      {/* Balance */}
      <div className={styles.balanceCard}>
        <div>
          <p className={styles.balanceLabel}>Your Vote Balance</p>
          <p className={styles.balanceValue}>
            {balance.toLocaleString()}<span>votes</span>
          </p>
        </div>
        {import.meta.env.VITE_APP_MODE !== 'trial' && (
          <Link to="/pricing" className={styles.buyMoreBtn}>Buy More Votes</Link>
        )}
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Purchased</p>
          <p className={styles.statValue}>{(stats.total_purchased || 0).toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Sent</p>
          <p className={styles.statValue}>{(stats.total_sent || 0).toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Gifted</p>
          <p className={styles.statValue}>{(stats.total_gifted || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Send Votes */}
      <div className={styles.section}>
        <h2>Send Votes</h2>
        <div className={styles.sendForm}>
          <div className={styles.sendGroup}>
            <label>Character Name</label>
            <input
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className={styles.sendGroup}>
            <label>Number of Votes</label>
            <input
              type="number"
              min="1"
              max={balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>
          <div className={styles.sendGroup}>
            <label>Reaction Type</label>
            <select
              value={reactionType}
              onChange={(e) => setReactionType(e.target.value)}
              className={styles.selectInput}
            >
              {REACTION_TYPES.map(r => (
                <option key={r.id} value={r.id}>{r.emoji} {r.label}</option>
              ))}
            </select>
          </div>
          <button className={styles.sendBtn} onClick={handleSendClick} disabled={!targetName || !amount}>
            Send Votes
          </button>
          {sendError && <div className={styles.sendError}>{sendError}</div>}
        </div>
      </div>

      {/* Redeem Code */}
      <div className={styles.section}>
        <h2>Redeem Code</h2>
        <div className={styles.sendForm}>
          <div className={styles.sendGroup}>
            <label>Activation Code</label>
            <input
              value={redeemCodeInput}
              onChange={(e) => setRedeemCodeInput(e.target.value)}
              placeholder="e.g. XQE_SFR"
            />
          </div>
          <button className={styles.sendBtn} onClick={handleRedeemClick} disabled={!redeemCodeInput || redeeming}>
            {redeeming ? 'Redeeming...' : 'Redeem'}
          </button>
        </div>
        {redeemError && <div className={styles.sendError} style={{ marginTop: 12 }}>{redeemError}</div>}
      </div>

      {/* Transaction History */}
      <div className={styles.section}>
        <h2>Transaction History</h2>
        {txnLoading ? (
          <div>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.skeleton} style={{ height: 18, marginBottom: 10 }} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className={styles.emptyTable}>No transactions found.</p>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Recipient / Details</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.created_at)}</td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>{tx.type.replace('_', ' ')}</span>
                      </td>
                      <td style={{ color: tx.amount > 0 && tx.status !== 'pending' ? 'var(--positive, #4ade80)' : 'inherit' }}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                      </td>
                      <td>
                        {tx.type === 'vote_sent' && tx.recipient_username ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <img src={getReactionImage(tx.reaction_type)} alt={tx.reaction_type} style={{ width: 20, height: 20 }} />
                            <span>sent to {tx.recipient_username}</span>
                          </span>
                        ) : (
                          <span>{tx.note || '—'}</span>
                        )}
                      </td>
                      <td className={getStatusClass(tx.status)}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                <button
                  onClick={() => fetchTransactions(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--bg-lighter)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: pagination.page <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => fetchTransactions(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--bg-lighter)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: pagination.page >= pagination.pages ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Send Confirmation Modal */}
      {showConfirm && (
        <Modal
          title="Confirm Vote Transfer"
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmSend}
          confirmText="Send Votes"
          loading={sending}
        >
          <p>
            Send <strong>{parseInt(amount, 10).toLocaleString()} votes</strong> to{' '}
            <strong>{targetName.trim()}</strong> with{' '}
            <img src={getReactionImage(reactionType)} alt={reactionType} style={{ width: 20, height: 20, verticalAlign: 'middle', margin: '0 4px' }} />{' '}
            <strong>{REACTION_TYPES.find(r => r.id === reactionType)?.label}</strong> reaction?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Failed votes are automatically refunded to your balance.
          </p>
        </Modal>
      )}
    </div>
  );
}
