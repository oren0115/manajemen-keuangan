import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

export function ReportsPage() {
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const { data: monthlyRes, isLoading: monthlyLoading } = useQuery({
    queryKey: ['reports', 'monthly', month, year],
    queryFn: () => reportsApi.monthly(month, year),
  });

  const { data: healthRes, isLoading: healthLoading } = useQuery({
    queryKey: ['reports', 'health', month, year],
    queryFn: () => reportsApi.healthScore(month, year),
  });

  const summary = monthlyRes?.data;
  const health = healthRes?.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Monthly summary</CardTitle>
            <CardDescription>Income, expenses, savings for selected month</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : summary ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total income</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total expenses</span>
                  <span className="font-medium text-destructive">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.totalExpenses)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total savings</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.totalSavings)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-2">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.remainingBalance)}
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-muted-foreground mb-2 text-sm">Percentage breakdown</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Expenses</span>
                      <span>{summary.percentageBreakdown.expenses}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Savings</span>
                      <span>{summary.percentageBreakdown.savings}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining</span>
                      <span>{summary.percentageBreakdown.remaining}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No data.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Financial health score</CardTitle>
            <CardDescription>Score 0–100 and suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : health ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Progress value={health.score} className="h-3 flex-1" />
                  <span className="text-2xl font-bold">{health.score}</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Status: <span className="font-medium text-foreground">{health.status}</span>
                </p>
                <div className="text-muted-foreground space-y-1 text-sm">
                  <p>Savings rate: {health.metrics.savingsRate}%</p>
                  <p>Expense ratio: {health.metrics.expenseRatio}%</p>
                </div>
                {health.suggestions.length > 0 && (
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                    <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <AlertCircle className="size-4" />
                      Suggestions
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {health.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
