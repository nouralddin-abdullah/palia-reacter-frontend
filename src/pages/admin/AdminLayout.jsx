import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Admin.module.css';

const TABS = [
  { to: '/admin/gift', label: 'Gift Votes' },
  { to: '/admin/codes', label: 'Redeem Codes' },
  { to: '/admin/history', label: 'History' },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className={styles.admin}>
      <div className={styles.header}>
        <h1>Moderator Dashboard</h1>
        <span className={`${styles.roleBadge} ${isAdmin ? styles.roleAdmin : ''}`}>
          {user?.role}
        </span>
      </div>

      <nav className={styles.tabs}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `${styles.tab} ${isActive ? styles.tabActive : ''}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
