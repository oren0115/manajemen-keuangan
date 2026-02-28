import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi, categoriesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

const selectInputClass =
  'h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-foreground';

export function BudgetsPage() {
  const { t } = useTranslation();
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => budgetsApi.list({ month, year }),
  });

  const list = (data?.data ?? []) as Array<{ id: string; limitAmount: number; category?: { name: string }; month: number; year: number }>;

  return (
    <div className="space-y-8">
      <AddBudgetForm
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['budgets'] });
          queryClient.invalidateQueries({ queryKey: ['reports'] });
        }}
      />

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t('budgets.budgetLimits')}</CardTitle>
            <CardDescription>{t('budgets.categoryLimitsForMonth')}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={`${selectInputClass} w-auto min-w-[120px]`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={`${selectInputClass} w-auto min-w-[80px]`}
            >
              {[currentYear, currentYear - 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : list.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('budgets.noBudgets')}</p>
          ) : (
            <ScrollArea className="h-[min(400px,60vh)] w-full pr-3">
              <ul className="space-y-2">
                {list.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                  >
                    <span className="font-medium">{b.category?.name ?? '—'}</span>
                    <span>
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(b.limitAmount)}
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

function AddBudgetForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [error, setError] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'fixed' | 'variable'>('variable');

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });
  const categories = (categoriesData?.data ?? []).filter((c: { type: string }) => c.type === 'fixed' || c.type === 'variable');

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
    mutationFn: (body: { categoryId: string; limitAmount: number; month: number; year: number }) =>
      budgetsApi.create(body),
    onSuccess: () => {
      setCategoryId('');
      setLimitAmount('');
      onSuccess();
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const num = parseFloat(limitAmount);
    if (Number.isNaN(num) || num <= 0) {
      setError(t('budgets.enterValidLimit'));
      return;
    }
    if (!categoryId) {
      setError(t('transactions.selectCategoryError'));
      return;
    }
    mutation.mutate({ categoryId, limitAmount: num, month, year });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      setError(t('transactions.enterCategoryName'));
      return;
    }
    setError('');
    createCategoryMutation.mutate({ name, type: newCategoryType });
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('budgets.setBudget')}</CardTitle>
        <CardDescription>{t('budgets.setMonthlyLimit')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">{t('transactions.category')}</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={selectInputClass}
                required
              >
                <option value="">{t('transactions.selectCategory')}</option>
                {categories.map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddCategory((v) => !v)}
                className="text-muted-foreground text-xs underline-offset-4 hover:text-foreground hover:underline"
              >
                {showAddCategory ? t('transactions.cancel') : t('transactions.categoryNotFoundAdd')}
              </button>
              {showAddCategory && (
                <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-border/50 bg-muted/30 p-4">
                  <div className="flex-1 min-w-[140px] space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{t('transactions.categoryNamePlaceholder')}</label>
                    <Input
                      placeholder={t('transactions.categoryNamePlaceholder')}
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="w-full min-w-[100px] sm:w-auto space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{t('budgets.fixed')} / {t('budgets.variable')}</label>
                    <select
                      value={newCategoryType}
                      onChange={(e) => setNewCategoryType(e.target.value as 'fixed' | 'variable')}
                      className={selectInputClass}
                    >
                      <option value="fixed">{t('budgets.fixed')}</option>
                      <option value="variable">{t('budgets.variable')}</option>
                    </select>
                  </div>
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
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">{t('budgets.limitAmount')}</label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>Rp</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="1"
                  placeholder="0"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  required
                />
              </InputGroup>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">{t('budgets.month')}</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className={selectInputClass}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">{t('budgets.year')}</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={selectInputClass}
              >
                {[currentYear, currentYear - 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-1">
            <Button type="submit" disabled={mutation.isPending} className="min-w-[140px]">
              {mutation.isPending ? t('profile.saving') : t('budgets.setBudgetButton')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
