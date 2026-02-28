import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
