import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { SetPasswordPage } from '@/features/auth/SetPasswordPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { IncomePage } from '@/features/income/IncomePage';
import { TransactionsPage } from '@/features/transaction/TransactionsPage';
import { BudgetsPage } from '@/features/budget/BudgetsPage';
import { ReportsPage } from '@/features/report/ReportsPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { useAuthStore } from '@/store/authStore';
import { setAuthTokenGetter } from '@/services/api';
import '@/css/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 detik, setelah itu dianggap stale
      retry: 1,
      refetchOnWindowFocus: true, // refetch saat user kembali ke tab aplikasi
    },
  },
});

function AuthProvider({ children }: { children: React.ReactNode }) {
  const subscribeAuth = useAuthStore((s) => s.subscribeAuth);

  useEffect(() => {
    setAuthTokenGetter(() => useAuthStore.getState().getIdToken());
    const unsubscribe = subscribeAuth();
    return () => unsubscribe();
  }, [subscribeAuth]);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
            <Route path="/set-password" element={<SetPasswordPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/income" element={<IncomePage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
