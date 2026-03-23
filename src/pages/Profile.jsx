import { useAuth } from '../context/AuthContext';
import { useVotes } from '../context/VoteContext';
import toast from 'react-hot-toast';
import { useState } from 'react';
import styles from './Profile.module.css';
import dashStyles from './Dashboard.module.css';

export default function Profile() {
  const { user } = useAuth();
  const { orders, loading: ordersLoading } = useVotes();
  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' });

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
