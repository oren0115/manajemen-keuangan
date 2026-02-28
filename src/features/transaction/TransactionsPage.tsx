import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, categoriesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="flex flex-wrap gap-2">
          <select
            value={month ?? ''}
            onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('transactions.allMonths')}</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={year ?? ''}
            onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('transactions.allYears')}</option>
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={typeFilter ?? ''}
            onChange={(e) => setTypeFilter((e.target.value as 'expense' | 'saving') || undefined)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('transactions.allTypes')}</option>
            <option value="expense">{t('transactions.expense')}</option>
            <option value="saving">{t('transactions.saving')}</option>
          </select>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('transactions.type')}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'expense' | 'saving')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="expense">{t('transactions.expense')}</option>
                <option value="saving">{t('transactions.saving')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('transactions.category')}</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">{t('transactions.selectCategory')}</option>
                {filteredCategories.map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddCategory((v) => !v)}
                className="text-muted-foreground text-xs underline-offset-4 hover:underline"
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
                    <select
                      value={newCategoryType}
                      onChange={(e) => setNewCategoryType(e.target.value as 'fixed' | 'variable')}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="fixed">{t('budgets.fixed')}</option>
                      <option value="variable">{t('budgets.variable')}</option>
                    </select>
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
            <div className="space-y-2">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('transactions.date')}</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('transactions.note')}</label>
            <Input placeholder={t('common.optional')} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t('transactions.savingButton') : t('transactions.addTransactionButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
