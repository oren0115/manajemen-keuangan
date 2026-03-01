import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, categoriesApi } from '@/services/api';
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

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

export function TransactionsPage() {
  const { t } = useTranslation();
  const [month, setMonth] = useState<number | undefined>(currentMonth);
  const [year, setYear] = useState<number | undefined>(currentYear);
  const [typeFilter, setTypeFilter] = useState<'expense' | 'saving' | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', month, year, typeFilter],
    queryFn: () => transactionsApi.list({ month, year, type: typeFilter, limit: 50 }),
  });

  const list = (data?.data ?? []) as Array<{ id: string; amount: number; type: string; date: string; note?: string; category?: { name: string } }>;

  const filterMonths = [
    { value: 'all', label: t('transactions.allMonths') },
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => ({
      value: String(m),
      label: new Date(2000, m - 1).toLocaleString('default', { month: 'long' }),
    })),
  ];
  const filterYears = [
    { value: 'all', label: t('transactions.allYears') },
    ...[currentYear, currentYear - 1, currentYear - 2].map((y) => ({
      value: String(y),
      label: String(y),
    })),
  ];
  const filterTypes = [
    { value: 'all', label: t('transactions.allTypes') },
    { value: 'expense', label: t('transactions.expense') },
    { value: 'saving', label: t('transactions.saving') },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="flex flex-wrap gap-2">
          <Select
            value={month !== undefined ? String(month) : 'all'}
            onValueChange={(v) => setMonth(v === 'all' ? undefined : Number(v))}
          >
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
          <Select
            value={year !== undefined ? String(year) : 'all'}
            onValueChange={(v) => setYear(v === 'all' ? undefined : Number(v))}
          >
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
          <Select
            value={typeFilter ?? 'all'}
            onValueChange={(v) => setTypeFilter(v === 'all' ? undefined : (v as 'expense' | 'saving'))}
          >
            <SelectTrigger className="w-[140px] cursor-pointer">
              <SelectValue placeholder={t('transactions.allTypes')} />
            </SelectTrigger>
            <SelectContent>
              {filterTypes.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="cursor-pointer">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AddTransactionForm
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['transactions-list'] });
          queryClient.invalidateQueries({ queryKey: ['reports'] });
        }}
      />

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
        <CardTitle>{t('transactions.transactionList')}</CardTitle>
        <CardDescription>{data?.total ?? 0} {t('dashboard.transactions')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : list.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('transactions.noTransactions')}</p>
          ) : (
            <ScrollArea className="h-[min(400px,60vh)] w-full pr-3">
              <div className="space-y-2">
                {list.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                  >
                    <div>
                      <span className="font-medium">{t.category?.name ?? '—'}</span>
                      {t.note && (
                        <p className="text-muted-foreground text-sm">{t.note}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={t.type === 'expense' ? 'text-destructive' : 'text-green-600 dark:text-green-400'}>
                        {t.type === 'expense' ? '-' : '+'}
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(t.amount)}
                      </span>
                      <p className="text-muted-foreground text-sm">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddTransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'saving'>('expense');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'fixed' | 'variable' | 'saving'>('variable');

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });
  const categories = categoriesData?.data ?? [];

  const createCategoryMutation = useMutation({
    mutationFn: (body: { name: string; type: 'fixed' | 'variable' | 'saving' }) =>
      categoriesApi.create(body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCategoryId(res.data.id);
      setNewCategoryName('');
      setShowAddCategory(false);
    },
    onError: (err: Error) => setError(err.message),
  });

  const mutation = useMutation({
    mutationFn: (body: { categoryId: string; amount: number; type: 'expense' | 'saving'; date: string; note?: string }) =>
      transactionsApi.create(body),
    onSuccess: () => {
      setAmount('');
      setNote('');
      setCategoryId('');
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
    if (!categoryId) {
      setError(t('transactions.selectCategoryError'));
      return;
    }
    mutation.mutate({ categoryId, amount: num, type, date, note: note || undefined });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      setError(t('transactions.enterCategoryName'));
      return;
    }
    setError('');
    const categoryType = type === 'saving' ? 'saving' : newCategoryType;
    createCategoryMutation.mutate({ name, type: categoryType });
  };

  const filteredCategories = type === 'expense'
    ? categories.filter((c: { type: string }) => c.type === 'fixed' || c.type === 'variable')
    : categories.filter((c: { type: string }) => c.type === 'saving');

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('transactions.addTransaction')}</CardTitle>
        <CardDescription>{t('transactions.recordExpenseOrSaving')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-medium">{t('transactions.type')}</label>
              <Select value={type} onValueChange={(v) => setType(v as 'expense' | 'saving')}>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder={t('transactions.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense" className="cursor-pointer">
                    {t('transactions.expense')}
                  </SelectItem>
                  <SelectItem value="saving" className="cursor-pointer">
                    {t('transactions.saving')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium">{t('transactions.category')}</label>
              <Select
                value={categoryId || '__none__'}
                onValueChange={(v) => setCategoryId(v === '__none__' ? '' : v)}
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder={t('transactions.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" className="cursor-pointer">
                    {t('transactions.selectCategory')}
                  </SelectItem>
                  {filteredCategories.map((c: { id: string; name: string }) => (
                    <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => setShowAddCategory((v) => !v)}
                className="text-muted-foreground text-xs cursor-pointer underline-offset-4 hover:underline"
              >
                {showAddCategory ? t('transactions.cancel') : t('transactions.categoryNotFoundAdd')}
              </button>
              {showAddCategory && (
                <div className="mt-2 flex flex-wrap items-end gap-2 rounded-lg border border-border/50 bg-muted/30 p-3">
                  <Input
                    placeholder={t('transactions.categoryNamePlaceholder')}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="max-w-[180px]"
                  />
                  {type === 'expense' && (
                    <Select
                      value={newCategoryType}
                      onValueChange={(v) => setNewCategoryType(v as 'fixed' | 'variable')}
                    >
                      <SelectTrigger className="w-[130px] cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed" className="cursor-pointer">
                          {t('budgets.fixed')}
                        </SelectItem>
                        <SelectItem value="variable" className="cursor-pointer">
                          {t('budgets.variable')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCategory}
                    disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                  >
                    {createCategoryMutation.isPending ? t('transactions.adding') : t('transactions.add')}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-medium">{t('transactions.amount')}</label>
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium">{t('transactions.date')}</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('transactions.note')}</label>
            <Input placeholder={t('common.optional')} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button type="submit" className='cursor-pointer' disabled={mutation.isPending}>
            {mutation.isPending ? t('transactions.savingButton') : t('transactions.addTransactionButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
