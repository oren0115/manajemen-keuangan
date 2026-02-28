import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function AuthLayout() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div
        className="hidden md:flex md:w-1/2 items-center justify-center p-12 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: 'url(/auth-logo.jpg)' }}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px]" aria-hidden />
        <div className="text-center space-y-4 relative z-10">
          <h2 className="text-2xl font-bold">{t('common.financeHub')}</h2>
          <p className="text-muted-foreground max-w-sm">
            {t('authLayout.tagline')}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center p-6 bg-background relative">
          <div className="absolute top-4 right-4">
            <LanguageSwitcher />
          </div>
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
