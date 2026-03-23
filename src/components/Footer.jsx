import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLinks}>
          <Link to="/">Home</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/proof">Proof</Link>
          <Link to="/login">Log In</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} PaliaVote. All rights reserved.</p>
      </div>
    </footer>
  );
}
