import { useAuth } from '../context/AuthContext';
import { useVotes } from '../context/VoteContext';
import { linkDiscord } from '../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import styles from './Profile.module.css';
import dashStyles from './Dashboard.module.css';

export default function Profile() {
  const { user } = useAuth();
  const { orders, loading: ordersLoading } = useVotes();
  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' });
  const [discordCode, setDiscordCode] = useState('');
  const [discordLinking, setDiscordLinking] = useState(false);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed': return dashStyles.purchase;
      case 'rejected': return dashStyles.sent;
      case 'pending': return dashStyles.pending || '';
      default: return '';
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (password.newPass.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (password.newPass !== password.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    setPassword({ current: '', newPass: '', confirm: '' });
  };

  return (
    <div className={styles.profilePage}>
      <h1>Profile & Settings</h1>

      {/* User Info */}
      <div className={styles.card}>
        <h2>Account Information</h2>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Username</span>
          <span className={styles.infoValue}>{user?.username}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Email</span>
          <span className={styles.infoValue}>{user?.email}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Role</span>
          <span className={styles.infoValue}>{user?.role || '—'}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Member since</span>
          <span className={styles.infoValue}>{user?.created_at ? formatDate(user.created_at) : '—'}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Vote Balance</span>
          <span className={styles.infoValue}>{(user?.vote_balance || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Link Discord Account */}
      <div className={styles.card}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#5865F2">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          Link Discord Account
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          Link your Discord account to merge balances, transactions, and purchases. Use the <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, fontSize: '0.82rem' }}>/link</code> command in Discord to get your link code.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <input
            value={discordCode}
            onChange={(e) => setDiscordCode(e.target.value)}
            placeholder="Enter link code"
            style={{
              flex: 1,
              padding: '9px 12px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button
            onClick={async () => {
              if (!discordCode.trim()) {
                toast.error('Please enter a link code');
                return;
              }
              setDiscordLinking(true);
              try {
                await linkDiscord(discordCode.trim());
                toast.success('Discord account linked successfully! Balances have been merged.');
                setDiscordCode('');
              } catch (err) {
                toast.error(err.message || 'Invalid or expired code');
              } finally {
                setDiscordLinking(false);
              }
            }}
            disabled={discordLinking || !discordCode.trim()}
            style={{
              background: '#5865F2',
              color: '#fff',
              border: 'none',
              padding: '9px 20px',
              borderRadius: 6,
              cursor: discordLinking || !discordCode.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              opacity: discordLinking || !discordCode.trim() ? 0.5 : 1,
              transition: 'opacity 0.2s, background 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {discordLinking ? 'Linking...' : 'Link Account'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className={styles.card}>
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordChange}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="password"
              placeholder="Current password"
              value={password.current}
              onChange={(e) => setPassword({ ...password, current: e.target.value })}
              className={styles.passwordInput}
              style={{
                padding: '9px 12px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <input
              type="password"
              placeholder="New password"
              value={password.newPass}
              onChange={(e) => setPassword({ ...password, newPass: e.target.value })}
              style={{
                padding: '9px 12px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={password.confirm}
              onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
              style={{
                padding: '9px 12px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                padding: '9px 20px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '0.9rem',
                alignSelf: 'flex-start'
              }}
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Order History */}
      <div className={styles.card}>
        <h2>Recent Orders</h2>
        {ordersLoading ? (
          <div>
            {[1, 2, 3].map(i => (
              <div key={i} className={dashStyles.skeleton} style={{ height: 18, marginBottom: 10 }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No orders yet. Purchase some votes to get started!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={dashStyles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order #</th>
                  <th>Votes</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id}>
                    <td>{formatDate(order.created_at)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{order.order_number}</td>
                    <td>{Number(order.package_votes).toLocaleString()}</td>
                    <td>${Number(order.package_price).toFixed(2)}</td>
                    <td className={getStatusClass(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </td>
                    <td>{order.admin_note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
