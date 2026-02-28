import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const linkEmailPassword = useAuthStore((s) => s.linkEmailPassword);
  const hasEmailPasswordProvider = useAuthStore((s) => s.hasEmailPasswordProvider);
  const hasEmailPassword = hasEmailPasswordProvider();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseUser) {
      navigate('/login', { replace: true });
      return;
    }
    if (hasEmailPassword) {
      navigate('/', { replace: true });
    }
  }, [firebaseUser, hasEmailPassword, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError(t('auth.passwordMinLength'));
      return;
    }
    if (password !== passwordConfirm) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }
    setLoading(true);
    try {
      await linkEmailPassword(password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.failedToSetPassword'));
    } finally {
      setLoading(false);
    }
  };

  if (!firebaseUser || hasEmailPassword) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="size-5" />
            </div>
            <div>
              <CardTitle className="text-xl">{t('auth.setPassword')}</CardTitle>
              <CardDescription>
                {t('auth.setPasswordDescription')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className={cn(
                  'rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive'
                )}
                role="alert"
              >
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="set-password" className="text-sm font-medium leading-none">
                {t('auth.password')}
              </label>
              <Input
                id="set-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="set-password-confirm" className="text-sm font-medium leading-none">
                {t('auth.confirmPassword')}
              </label>
              <Input
                id="set-password-confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Repeat password"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.setting') : t('auth.setPasswordAndContinue')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
