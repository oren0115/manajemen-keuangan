import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  variant?: 'dashboard' | 'auth';
  className?: string;
}

export function Footer({ variant = 'dashboard', className }: FooterProps) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'shrink-0 border-t border-border/40 bg-background/80 py-4 text-center text-sm text-muted-foreground',
        variant === 'auth' && 'mt-auto',
        className
      )}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-1 px-4 sm:flex-row sm:justify-between sm:gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-medium text-foreground/90 hover:text-primary"
        >
          <PiggyBank className="size-4 shrink-0" />
          <span>{t('common.financeHub')}</span>
        </Link>
        <span className="hidden sm:inline">{t('footer.tagline')}</span>
        <span>{t('footer.copyright', { year })}</span>
      </div>
    </footer>
  );
}
