import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import EVENTS from '../constants/events';
import styles from './EventsBanner.module.css';

const MegaphoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 18-5v12L3 13v-2z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function EventsBanner() {
  const [dismissed, setDismissed] = useState([]);

  // Filter out expired events and dismissed events
  const activeEvents = useMemo(() => {
    const now = new Date();
    return EVENTS.filter((event, i) => {
      if (dismissed.includes(i)) return false;
      if (event.endsAt && new Date(event.endsAt) < now) return false;
      return true;
    });
  }, [dismissed]);

  if (activeEvents.length === 0) return null;

  const isExternalLink = (link) => link && (link.startsWith('http://') || link.startsWith('https://'));

  return (
    <div className={styles.bannerContainer}>
      {activeEvents.map((event, i) => {
        const originalIndex = EVENTS.indexOf(event);
        return (
          <div key={originalIndex} className={styles.banner}>
            <div className={styles.bannerContent}>
              <MegaphoneIcon />
              {event.tag && <span className={styles.tag}>{event.tag}</span>}
              <span className={styles.title}>{event.title}</span>
              <span className={styles.separator}>—</span>
              <span className={styles.description}>{event.description}</span>
              {event.link && (
                isExternalLink(event.link) ? (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {event.linkText || 'Learn More'}
                  </a>
                ) : (
                  <Link to={event.link} className={styles.link}>
                    {event.linkText || 'Learn More'}
                  </Link>
                )
              )}
            </div>
            <button
              className={styles.dismiss}
              onClick={() => setDismissed((prev) => [...prev, originalIndex])}
              aria-label="Dismiss event"
            >
              <CloseIcon />
            </button>
          </div>
        );
      })}
    </div>
  );
}
