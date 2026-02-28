import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfilePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user: storeUser, setUser, hasEmailPasswordProvider, changePassword } = useAuthStore();
  const [name, setName] = useState(storeUser?.name ?? '');
  const [error, setError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const canChangePassword = hasEmailPasswordProvider();

  const { data, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const res = await authApi.me();
      return res.data;
    },
  });

  const user = data ?? storeUser;

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const mutation = useMutation({
    mutationFn: (body: { name: string }) => authApi.updateProfile(body),
    onSuccess: (res) => {
      const updated = res.data;
      setUser(updated);
      queryClient.setQueryData(['profile', 'me'], updated);
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError(t('profile.nameMinLength'));
      return;
    }
    mutation.mutate({ name: trimmed });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 8) {
      setPasswordError(t('auth.passwordMinLength'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError(t('auth.passwordsDoNotMatch'));
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordSuccess(t('profile.changePasswordSuccess'));
    } catch {
      setPasswordError(t('profile.changePasswordError'));
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-xl">
      <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="size-5" />
            </div>
            <div>
              <CardTitle className="text-xl">{t('profile.title')}</CardTitle>
              <CardDescription>{t('profile.yourAccountInfo')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('auth.email')}</label>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('profile.role')}</label>
              <p className="text-sm font-medium capitalize">{user?.role}</p>
            </div>
          </div>

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
              <label htmlFor="profile-name" className="text-sm font-medium leading-none">
                {t('auth.name')}
              </label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                minLength={2}
                maxLength={100}
              />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t('profile.saving') : t('profile.saveChanges')}
            </Button>
          </form>

          {canChangePassword && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Lock className="size-4" />
                  </div>
                  <h3 className="text-sm font-semibold">{t('profile.changePassword')}</h3>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <div
                      className={cn(
                        'rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive'
                      )}
                      role="alert"
                    >
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div
                      className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2.5 text-sm text-green-700 dark:text-green-400"
                      role="status"
                    >
                      {passwordSuccess}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="current-password" className="text-sm font-medium leading-none">
                      {t('profile.currentPassword')}
                    </label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="new-password" className="text-sm font-medium leading-none">
                      {t('profile.newPassword')}
                    </label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirm-new-password" className="text-sm font-medium leading-none">
                      {t('profile.confirmNewPassword')}
                    </label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" variant="secondary" disabled={passwordLoading}>
                    {passwordLoading ? t('profile.saving') : t('profile.changePassword')}
                  </Button>
                </form>
              </div>
            </>
          )}

          {!canChangePassword && (
            <>
              <Separator className="my-6" />
              <p className="text-sm text-muted-foreground">{t('profile.noEmailPasswordProvider')}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
