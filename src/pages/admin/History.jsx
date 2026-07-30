import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getVoteHistory, getAuditLog } from '../../services/api';
import { REACTION_TYPES } from '../../constants/packages';
import styles from './Admin.module.css';

const TABS = [
  { id: 'votes', label: 'Vote Sends' },
  { id: 'audit', label: 'Staff Audit' },
];

const AUDIT_ACTIONS = [
  { id: '', label: 'All actions' },
  { id: 'gift', label: 'Gift' },
  { id: 'code_create', label: 'Code created' },
  { id: 'code_delete', label: 'Code deleted' },
  { id: 'role_change', label: 'Role change' },
];

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageBtn}
        onClick={() => onChange(pagination.page - 1)}
        disabled={pagination.page <= 1}
      >
        Previous
      </button>
      <span className={styles.pageInfo}>
        Page {pagination.page} of {pagination.pages} · {pagination.total.toLocaleString()} total
      </span>
      <button
        className={styles.pageBtn}
        onClick={() => onChange(pagination.page + 1)}
        disabled={pagination.page >= pagination.pages}
      >
        Next
      </button>
    </div>
  );
}

function VoteSends() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reactionType, setReactionType] = useState('');

  const load = useCallback(
    async (page, signal) => {
      setLoading(true);
      try {
        const res = await getVoteHistory({ search, reactionType, page, limit: 20 });
        if (signal?.cancelled) return;
        setRows(res.history);
        setPagination(res.pagination);
      } catch (err) {
        if (!signal?.cancelled) toast.error(err.message || 'Failed to load vote history');
      } finally {
        if (!signal?.cancelled) setLoading(false);
      }
    },
    [search, reactionType],
  );

  // Debounced: filter changes reset to page 1
  useEffect(() => {
    const signal = { cancelled: false };
    const timer = setTimeout(() => load(1, signal), 300);
    return () => {
      signal.cancelled = true;
      clearTimeout(timer);
    };
  }, [load]);

  const reactionImage = (type) => REACTION_TYPES.find((r) => r.id === type)?.image || '';

  return (
    <div className={styles.section}>
      <h2>Vote Send History</h2>
      <p className={styles.sectionHint}>Every vote-sending request across all users.</p>

      <div className={styles.form} style={{ marginBottom: 18 }}>
        <div className={styles.field} style={{ flex: 2 }}>
          <label htmlFor="vote-search">Search</label>
          <input
            id="vote-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sending user or target character"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="vote-reaction">Reaction</label>
          <select
            id="vote-reaction"
            value={reactionType}
            onChange={(e) => setReactionType(e.target.value)}
          >
            <option value="">All reactions</option>
            {REACTION_TYPES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className={styles.empty}>No vote sends match these filters.</p>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sender</th>
                  <th>Target</th>
                  <th>Reaction</th>
                  <th>Votes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDateTime(row.created_at)}</td>
                    <td>
                      <span className={styles.mono}>{row.username}</span>
                      {row.discord_username && (
                        <div className={styles.resultMeta}>{row.discord_username}</div>
                      )}
                    </td>
                    <td>{row.target_name || '—'}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {reactionImage(row.reaction_type) && (
                          <img
                            src={reactionImage(row.reaction_type)}
                            alt={row.reaction_type}
                            style={{ width: 18, height: 18 }}
                          />
                        )}
                        <span style={{ textTransform: 'capitalize' }}>{row.reaction_type}</span>
                      </span>
                    </td>
                    <td>{Number(row.votes).toLocaleString()}</td>
                    <td style={{ textTransform: 'capitalize' }}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onChange={(page) => load(page)} />
        </>
      )}
    </div>
  );
}

function describeAudit(row) {
  switch (row.action) {
    case 'gift':
      return `Gifted ${Number(row.amount || 0).toLocaleString()} votes to ${row.target_username || 'unknown'}`;
    case 'code_create':
      return `Created code ${row.details?.code} worth ${Number(row.amount || 0).toLocaleString()} votes (${row.details?.max_uses} use(s))`;
    case 'code_delete':
      return `Deleted code ${row.details?.code} after ${row.details?.uses ?? 0} use(s)`;
    case 'role_change':
      return `Changed ${row.target_username || 'unknown'} from ${row.details?.from} to ${row.details?.to}`;
    default:
      return row.action;
  }
}

function AuditLog() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');

  const load = useCallback(
    async (page, signal) => {
      setLoading(true);
      try {
        const res = await getAuditLog({ action, actor, page, limit: 20 });
        if (signal?.cancelled) return;
        setRows(res.actions);
        setPagination(res.pagination);
      } catch (err) {
        if (!signal?.cancelled) toast.error(err.message || 'Failed to load audit log');
      } finally {
        if (!signal?.cancelled) setLoading(false);
      }
    },
    [action, actor],
  );

  useEffect(() => {
    const signal = { cancelled: false };
    const timer = setTimeout(() => load(1, signal), 300);
    return () => {
      signal.cancelled = true;
      clearTimeout(timer);
    };
  }, [load]);

  return (
    <div className={styles.section}>
      <h2>Staff Audit Log</h2>
      <p className={styles.sectionHint}>
        Every gift, code, and role change made by staff. Entries are permanent.
      </p>

      <div className={styles.form} style={{ marginBottom: 18 }}>
        <div className={styles.field} style={{ flex: 2 }}>
          <label htmlFor="audit-actor">Staff member</label>
          <input
            id="audit-actor"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="Filter by username"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="audit-action">Action</label>
          <select id="audit-action" value={action} onChange={(e) => setAction(e.target.value)}>
            {AUDIT_ACTIONS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className={styles.empty}>No staff actions match these filters.</p>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Staff</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDateTime(row.created_at)}</td>
                    <td>
                      <span className={styles.mono}>{row.actor_username}</span>
                      <div className={styles.resultMeta}>{row.actor_role}</div>
                    </td>
                    <td>
                      <span className={styles.pill}>{row.action.replace('_', ' ')}</span>
                    </td>
                    <td>
                      {describeAudit(row)}
                      {row.details?.note && (
                        <div className={styles.resultMeta}>“{row.details.note}”</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onChange={(page) => load(page)} />
        </>
      )}
    </div>
  );
}

export default function History() {
  const [tab, setTab] = useState('votes');

  return (
    <>
      <div className={styles.tabs} style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            style={{ background: tab === t.id ? undefined : 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'votes' ? <VoteSends /> : <AuditLog />}
    </>
  );
}
