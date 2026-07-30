import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STAFF_ROLES = ['admin', 'moderator'];

/**
 * Gate for the moderator dashboard. This only hides the UI — every
 * /admin endpoint re-checks the caller's role against the database.
 */
export default function StaffRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!STAFF_ROLES.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
