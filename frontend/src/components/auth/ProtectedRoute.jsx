import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
        Loading…
      </div>
    );
  }
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
