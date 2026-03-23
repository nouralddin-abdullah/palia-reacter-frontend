import styles from './Modal.module.css';

export default function Modal({ title, children, onCancel, onConfirm, confirmText = 'Confirm', loading = false }) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {title && <h3>{title}</h3>}
        <div>{children}</div>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel} disabled={loading}>Cancel</button>
          <button className={styles.btnConfirm} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
