import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

export function IncomePage() {
  const { t } = useTranslation();
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['incomes', month, year],
    queryFn: () => incomesApi.list({ month, year }),
  });

  const list = (data?.data ?? []) as Array<{ id: string; amount: number; month: number; year: number; note?: string }>;

  const filterMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => ({
    value: String(m),
    label: new Date(2000, m - 1).toLocaleString('default', { month: 'long' }),
  }));
  const filterYears = [currentYear, currentYear - 1, currentYear - 2].map((y) => ({
    value: String(y),
    label: String(y),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="flex gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[180px] cursor-pointer">
              <SelectValue placeholder={t('budgets.month')} />
            </SelectTrigger>
            <SelectContent>
              {filterMonths.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="cursor-pointer">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[100px] cursor-pointer">
              <SelectValue placeholder={t('budgets.year')} />
            </SelectTrigger>
            <SelectContent>
              {filterYears.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="cursor-pointer">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AddIncomeForm
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['incomes'] });
          queryClient.invalidateQueries({ queryKey: ['reports'] });
        }}
      />

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('income.title')}</CardTitle>
          <CardDescription>{t('income.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : list.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('income.noIncome')}</p>
          ) : (
            <ScrollArea className="h-[min(400px,60vh)] w-full pr-3">
              <ul className="space-y-2">
                {list.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                  >
                    <div>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.amount)}
                      </span>
                      {item.note && (
                        <p className="text-muted-foreground text-sm">{item.note}</p>
                      )}
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {item.month}/{item.year}
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddIncomeForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (body: { amount: number; month: number; year: number; note?: string }) =>
      incomesApi.create(body),
    onSuccess: () => {
      setAmount('');
      setNote('');
      onSuccess();
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) {
      setError(t('transactions.enterValidAmount'));
      return;
    }
    mutation.mutate({ amount: num, month, year, note: note || undefined });
  };

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => ({
    value: String(m),
    label: new Date(2000, m - 1).toLocaleString('default', { month: 'long' }),
  }));
  const years = [currentYear, currentYear - 1, currentYear - 2].map((y) => ({
    value: String(y),
    label: String(y),
  }));

  return (
    <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl">{t('income.addIncome')}</CardTitle>
            <CardDescription>{t('income.addIncomeDescription')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-3">
              <label htmlFor="income-amount" className="text-sm font-medium leading-none">
                {t('income.amount')}
              </label>
              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  Rp
                </span>
                <Input
                  id="income-amount"
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="1"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <label htmlFor="income-note" className="text-sm font-medium leading-none">
                {t('income.note')}
              </label>
              <Input
                id="income-note"
                placeholder="e.g. Salary"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">{t('budgets.month')}</label>
              <Select
                value={String(month)}
                onValueChange={(v) => setMonth(Number(v))}
              >
                <SelectTrigger id="income-month" className="w-full cursor-pointer">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(({ value, label }) => (
                    <SelectItem key={value} value={value} className='cursor-pointer'>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">{t('budgets.year')}</label>
              <Select
                value={String(year)}
                onValueChange={(v) => setYear(Number(v))}
              >
                <SelectTrigger id="income-year" className="w-full cursor-pointer">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(({ value, label }) => (
                    <SelectItem key={value} value={value} className='cursor-pointer'>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full sm:w-auto cursor-pointer"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('profile.saving') : t('income.addIncome')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
