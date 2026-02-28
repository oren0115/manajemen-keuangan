import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import i18n, { supportedLanguages, type SupportedLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

function FlagIndonesia({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={cn('rounded-sm', className)} aria-hidden>
      <rect width="24" height="8" y="0" fill="#E70011" />
      <rect width="24" height="8" y="8" fill="#FFFFFF" />
    </svg>
  );
}

function FlagUnitedStates({ className }: { className?: string }) {
  const h = 16 / 13;
  return (
    <svg viewBox="0 0 24 16" className={cn('rounded-sm', className)} aria-hidden>
      {/* 13 stripes: red, white, red, white... */}
      {Array.from({ length: 13 }).map((_, i) => (
        <rect key={i} width="24" height={h} y={i * h} fill={i % 2 === 0 ? '#B22234' : '#FFFFFF'} />
      ))}
      {/* Canton */}
      <rect width="9.23" height={h * 7} fill="#3C3B6E" />
      {/* Stars (simplified grid) */}
      <g fill="#FFFFFF">
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4].map((col) => (
            <circle key={`${row}-${col}`} cx={1.2 + col * 2.1} cy={0.9 + row * 1.2} r="0.4" />
          ))
        )}
      </g>
    </svg>
  );
}

const flagByLocale: Record<SupportedLocale, React.ComponentType<{ className?: string }>> = {
  id: FlagIndonesia,
  en: FlagUnitedStates,
};

export function LanguageSwitcher() {
  const { t } = useTranslation('common');
  const current = (i18n.language?.slice(0, 2) ?? 'id') as SupportedLocale;
  const effective = supportedLanguages.includes(current) ? current : 'id';
  const CurrentFlag = flagByLocale[effective];

  const label: Record<SupportedLocale, string> = {
    en: t('english'),
    id: t('indonesian'),
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild >
        <Button className="cursor=pointer" variant="ghost" size="icon" aria-label={t('language')} title={t('language')}>
          <CurrentFlag className="size-5"  />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((lang) => {
          const FlagIcon = flagByLocale[lang];
          return (
            <DropdownMenuItem
              key={lang}
                onClick={() => i18n.changeLanguage(lang)}
                className={`cursor-pointer ${
              effective === lang ? "bg-accent" : ""
              }`}
            >
            <FlagIcon className="mr-2 size-5 shrink-0" />
            {label[lang]}
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuContent>
  </DropdownMenu>
  );
}
