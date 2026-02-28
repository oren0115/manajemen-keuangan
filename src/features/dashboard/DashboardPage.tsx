import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { reportsApi, transactionsApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Wallet, TrendingDown, Percent } from 'lucide-react';
import { useMemo, useState } from 'react';

const now = new Date();
const month = now.getMonth() + 1;
const year = now.getFullYear();

const PIE_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

export function DashboardPage() {
  const { t } = useTranslation();
  const [m, setM] = useState(month);
  const [y, setY] = useState(year);

  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ['reports', 'monthly', m, y],
    queryFn: () => reportsApi.monthly(m, y),
  });

  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ['reports', 'trend', m, y],
    queryFn: () => reportsApi.trend(m, y),
  });


  const summary = monthly?.data;
  const trendData = trend?.data ?? [];
  const pieData = useMemo(() => {
    if (!summary?.expenseByCategory?.length) return [];
    return summary.expenseByCategory.map((c: { categoryName: string; total: number }) => ({
      name: c.categoryName,
      value: c.total,
    }));
  }, [summary]);

  const savingsRate = summary?.totalIncome
    ? Math.round((summary.totalSavings / summary.totalIncome) * 10000) / 100
    : 0;

  if (monthlyLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-32" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="flex gap-2">
          <select
            value={m}
            onChange={(e) => setM(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mo) => (
              <option key={mo} value={mo}>
                {new Date(2000, mo - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {[year, year - 1, year - 2].map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">{t('dashboard.monthlyIncome')}</CardTitle>
            <Wallet className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalIncome != null
                ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.totalIncome)
                : '—'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">{t('dashboard.monthlyExpense')}</CardTitle>
            <TrendingDown className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {summary?.totalExpenses != null
                ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.totalExpenses)
                : '—'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">{t('dashboard.remainingBalance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.remainingBalance != null
                ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.remainingBalance)
                : '—'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">{t('dashboard.savingsRate')}</CardTitle>
            <Percent className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savingsRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{t('dashboard.expenseByCategory')}</CardTitle>
            <CardDescription>{t('dashboard.breakdownForMonth')}</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground py-12 text-center text-sm">{t('dashboard.noExpenseData')}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{t('dashboard.trend6Months')}</CardTitle>
            <CardDescription>{t('dashboard.incomeVsExpenses')}</CardDescription>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : trendData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(mo) => new Date(2000, mo - 1).toLocaleString('default', { month: 'short' })}
                  />
                  <YAxis tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    formatter={(v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)}
                    labelFormatter={(_: unknown, payload: Array<{ payload?: { month?: number; year?: number } }>) =>
                    payload?.[0]?.payload && `${payload[0].payload.month}/${payload[0].payload.year}`}
                  />
                  <Line type="monotone" dataKey="income" stroke="var(--chart-1)" name="Income" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="var(--destructive)" name="Expenses" strokeWidth={2} />
                  <Line type="monotone" dataKey="savings" stroke="var(--chart-2)" name="Savings" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground py-12 text-center text-sm">No trend data.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
          <CardDescription>{t('dashboard.latestActivity')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTransactions month={m} year={y} />
        </CardContent>
      </Card>
    </div>
  );
}

function RecentTransactions({ month, year }: { month: number; year: number }) {
  const { t } = useTranslation();
  const { data: res, isLoading } = useQuery({
    queryKey: ['transactions-list', month, year],
    queryFn: () => transactionsApi.list({ month, year, limit: 10 }),
  });
  const list = (res?.data ?? []) as Array<{ id: string; amount: number; type: string; date: string; category?: { name: string } }>;

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!list.length) return <p className="text-muted-foreground text-sm">{t('dashboard.noTransactionsThisMonth')}</p>;

  return (
    <ScrollArea className="h-[280px] w-full pr-3">
      <div className="space-y-2">
        {list.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-2"
          >
            <div>
              <span className="font-medium">{item.category?.name ?? '—'}</span>
              <span className="text-muted-foreground ml-2 text-sm">
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
            <span className={item.type === 'expense' ? 'text-destructive' : 'text-green-600 dark:text-green-400'}>
              {item.type === 'expense' ? '-' : '+'}
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
