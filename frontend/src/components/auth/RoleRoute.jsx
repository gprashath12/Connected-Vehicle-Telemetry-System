import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}
