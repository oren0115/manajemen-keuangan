import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const sendPasswordResetEmail = useAuthStore((s) => s.sendPasswordResetEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="size-5" />
          </div>
          <CardTitle className="text-2xl">{t('auth.forgotPasswordTitle')}</CardTitle>
        </div>
        <CardDescription>{t('auth.forgotPasswordDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sent ? (
          <>
            <div
              className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2.5 text-sm text-green-700 dark:text-green-400"
              role="status"
            >
              {t('auth.checkEmail')}
            </div>
            <p className="text-sm text-muted-foreground">{t('auth.resetEmailSent')}</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">{t('auth.backToLogin')}</Link>
            </Button>
          </>
        ) : (
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
            <div className="space-y-3">
              <label className="text-sm font-medium" htmlFor="forgot-email">
                {t('auth.email')}
              </label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-background"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.sending') : t('auth.sendResetLink')}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/login">{t('auth.backToLogin')}</Link>
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
