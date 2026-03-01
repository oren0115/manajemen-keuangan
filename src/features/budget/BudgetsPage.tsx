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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

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
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-auto min-w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear, currentYear - 1].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">{t('transactions.category')}</label>
              <Select value={categoryId || undefined} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('transactions.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c: { id: string; name: string }) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <Select value={newCategoryType} onValueChange={(v) => setNewCategoryType(v as 'fixed' | 'variable')}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">{t('budgets.fixed')}</SelectItem>
                        <SelectItem value="variable">{t('budgets.variable')}</SelectItem>
                      </SelectContent>
                    </Select>
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
            <div className="space-y-3">
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
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">{t('budgets.month')}</label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">{t('budgets.year')}</label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear, currentYear - 1].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
