import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegisterLink, setShowRegisterLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const hasEmailPasswordProvider = useAuthStore((s) => s.hasEmailPasswordProvider);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowRegisterLink(false);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
      // Email tidak terdaftar (Firebase bisa pakai user-not-found atau invalid-credential)
      if (code === 'auth/user-not-found') {
        setError(t('auth.accountNotFound'));
        setShowRegisterLink(true);
        return;
      }
      // Salah password atau email tidak terdaftar (Firebase gabungkan jadi invalid-credential)
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setError(t('auth.invalidCredential'));
        setShowRegisterLink(true);
        return;
      }
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      if (!hasEmailPasswordProvider()) navigate('/set-password');
      else navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t('auth.signIn')}</CardTitle>
        <CardDescription>{t('auth.useGoogleOrEmail')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
            {showRegisterLink && (
              <p className="mt-2">
                <Link to="/register" state={{ email }} className="text-primary underline-offset-4 hover:underline">
                  {t('auth.registerWithThisEmail')}
                </Link>
              </p>
            )}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleClick}
          disabled={loading || googleLoading}
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? t('auth.signingIn') : t('auth.continueWithGoogle')}
        </Button>

        <div className="relative">
          <Separator />
          <span className="bg-card text-muted-foreground absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">or</span>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">{t('auth.email')}</label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="bg-background" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="password">{t('auth.password')}</label>
              <Link to="/forgot-password" className="text-xs text-primary underline-offset-4 hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="bg-background" />
          </div>
          <Button type="submit" className="w-full" disabled={loading || googleLoading}>
            {loading ? t('auth.signingIn') : t('auth.signInWithEmail')}
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-sm">
          {t('auth.dontHaveAccount')} <Link to="/register" className="text-primary underline-offset-4 hover:underline">{t('auth.signUp')}</Link>
        </p>
      </CardContent>
    </Card>
  );
}
