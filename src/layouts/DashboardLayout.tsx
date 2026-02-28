import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Footer } from '@/components/Footer';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  Target,
  BarChart3,
  LogOut,
  Moon,
  Sun,
  User,
} from 'lucide-react';

export function DashboardLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggle } = useTheme();

  const nav = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/income', label: t('nav.income'), icon: Wallet },
    { to: '/transactions', label: t('nav.transactions'), icon: ArrowLeftRight },
    { to: '/budgets', label: t('nav.budgets'), icon: Target },
    { to: '/reports', label: t('nav.reports'), icon: BarChart3 },
    { to: '/profile', label: t('nav.profile'), icon: User },
  ];

  const pathToTitle: Record<string, string> = {
    '/': t('nav.dashboard'),
    '/income': t('nav.income'),
    '/transactions': t('nav.transactions'),
    '/budgets': t('nav.budgets'),
    '/reports': t('nav.reports'),
    '/profile': t('nav.profile'),
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-2 px-2 py-2 font-semibold text-sidebar-foreground"
          >
            <PiggyBank className="size-6 shrink-0 text-primary" />
            <span className="group-data-[collapsible=icon]:hidden">{t('common.financeHub')}</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === to}
                      tooltip={label}
                    >
                      <Link to={to}>
                        <Icon className="size-4 shrink-0" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-0">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1 cursor-pointer" />
          <h1 className="text-lg font-semibold tracking-tight">
            {pathToTitle[location.pathname] ?? t('nav.dashboard')}
          </h1>
          <div className="flex flex-1 items-center justify-end gap-2">
            {/* <span className="max-w-[180px] truncate text-sm text-muted-foreground" title={user?.email}>
              {user?.email}
            </span> */}
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              className='cursor-pointer'
              onClick={toggle}
              aria-label={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
              title={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
              onClick={handleLogout}
              title={t('common.logout')}
            >
              <LogOut className="size-4 shrink-0" />
            </Button>
          </div>
        </header>
        <main className="flex-1 min-h-0 p-4 md:p-6">
          <Outlet />
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
