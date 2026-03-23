import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const initials = user ? user.username.slice(0, 2).toUpperCase() : '';

  return (
    <>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.logo}>
          Palia<span>Vote</span>
        </Link>

        <div className={styles.navLinks}>
          <NavLink to="/" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Home
          </NavLink>
          <NavLink to="/pricing" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Pricing
          </NavLink>
          <NavLink to="/proof" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Proof
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
              Dashboard
            </NavLink>
          )}
        </div>

        <div className={styles.authButtons}>
          {!user ? (
            <>
              <Link to="/login" className={styles.btnLogin}>Log In</Link>
              <Link to="/signup" className={styles.btnSignup}>Sign Up</Link>
            </>
          ) : (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button className={styles.avatar} onClick={() => setDropdownOpen(!dropdownOpen)}>
                {initials}
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <Link to="/profile" className={styles.dropdownLink} onClick={() => setDropdownOpen(false)}>Profile</Link>
                  <Link to="/dashboard" className={styles.dropdownLink} onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                  <button className={styles.dropdownBtn} onClick={handleLogout}>Log Out</button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
        <NavLink to="/" end className={styles.navLink} onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink to="/pricing" className={styles.navLink} onClick={() => setMenuOpen(false)}>Pricing</NavLink>
        <NavLink to="/proof" className={styles.navLink} onClick={() => setMenuOpen(false)}>Proof</NavLink>
        {user && (
          <NavLink to="/dashboard" className={styles.navLink} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
        )}
        <div className={styles.mobileAuthButtons}>
          {!user ? (
            <>
              <Link to="/login" className={styles.btnLogin} onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link to="/signup" className={styles.btnSignup} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/profile" className={styles.navLink} onClick={() => setMenuOpen(false)}>Profile</Link>
              <button className={styles.dropdownBtn} onClick={() => { handleLogout(); setMenuOpen(false); }}>Log Out</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
