const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
}

async function getStoredToken(): Promise<string | null> {
  return localStorage.getItem('accessToken');
}

export async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) ?? {}),
  };
  if (!skipAuth) {
    const token = await getStoredToken();
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data as ApiError).message ?? 'Request failed') as Error & { status?: number; code?: string; details?: unknown };
    err.status = res.status;
    err.code = (data as ApiError).code;
    err.details = (data as ApiError).details;
    throw err;
  }
  return data as T;
}

export type RequestOptions = RequestInit & { skipAuth?: boolean };

export const api = {
  get: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { ...init, method: 'GET' }),

  post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { ...init, method: 'DELETE' }),
};

// Auth
export interface AuthResult {
  user: { id: string; name: string; email: string; role: string };
  tokens: { accessToken: string; refreshToken: string; expiresIn: number };
}
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    api.post<{ success: true; data: AuthResult }>('/auth/register', body, { skipAuth: true }),
  login: (body: { email: string; password: string }) =>
    api.post<{ success: true; data: AuthResult }>('/auth/login', body, { skipAuth: true }),
  refresh: (refreshToken: string) =>
    api.post<{ success: true; data: { accessToken: string; refreshToken: string; expiresIn: number } }>(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true }
    ),
};

// Incomes
export const incomesApi = {
  list: (params?: { month?: number; year?: number }) => {
    const q = new URLSearchParams();
    if (params?.month != null) q.set('month', String(params.month));
    if (params?.year != null) q.set('year', String(params.year));
    return api.get<{ success: true; data: Array<Record<string, unknown>> }>(`/incomes?${q}`);
  },
  create: (body: { amount: number; month: number; year: number; note?: string }) =>
    api.post<{ success: true; data: Record<string, unknown> }>('/incomes', body),
};

// Transactions
export const transactionsApi = {
  list: (params?: { month?: number; year?: number; type?: 'expense' | 'saving'; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.month != null) q.set('month', String(params.month));
    if (params?.year != null) q.set('year', String(params.year));
    if (params?.type) q.set('type', params.type);
    if (params?.limit != null) q.set('limit', String(params.limit));
    if (params?.offset != null) q.set('offset', String(params.offset));
    return api.get<{ success: true; data: Array<Record<string, unknown>>; total: number }>(`/transactions?${q}`);
  },
  create: (body: { categoryId: string; amount: number; type: 'expense' | 'saving'; date: string; note?: string }) =>
    api.post<{ success: true; data: Record<string, unknown> }>('/transactions', body),
};

// Categories
export const categoriesApi = {
  list: (type?: string) =>
    api.get<{ success: true; data: Array<{ id: string; name: string; type: string }> }>(
      type ? `/categories?type=${type}` : '/categories'
    ),
};

// Budgets
export const budgetsApi = {
  list: (params?: { month?: number; year?: number }) => {
    const q = new URLSearchParams();
    if (params?.month != null) q.set('month', String(params.month));
    if (params?.year != null) q.set('year', String(params.year));
    return api.get<{ success: true; data: Array<Record<string, unknown>> }>(`/budgets?${q}`);
  },
  create: (body: { categoryId: string; limitAmount: number; month: number; year: number }) =>
    api.post<{ success: true; data: Record<string, unknown> }>('/budgets', body),
};

// Reports
export const reportsApi = {
  monthly: (month: number, year: number) =>
    api.get<{ success: true; data: MonthlySummary }>(`/reports/monthly?month=${month}&year=${year}`),
  healthScore: (month: number, year: number) =>
    api.get<{ success: true; data: HealthScoreResult }>(`/reports/health-score?month=${month}&year=${year}`),
  trend: (month: number, year: number) =>
    api.get<{ success: true; data: TrendPoint[] }>(`/reports/trend?month=${month}&year=${year}`),
  allocation: {
    get: () => api.get<{ success: true; data: { fixed: number; variable: number; saving: number; emergency: number } }>('/reports/allocation'),
    update: (body: { fixedPercent?: number; variablePercent?: number; savingPercent?: number; emergencyPercent?: number }) =>
      api.put<{ success: true; data: Record<string, number> }>('/reports/allocation', body),
  },
};

export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  remainingBalance: number;
  percentageBreakdown: { expenses: number; savings: number; remaining: number };
  expenseByCategory?: Array<{ categoryId: string; categoryName: string; total: number }>;
}

export interface HealthScoreResult {
  score: number;
  status: string;
  suggestions: string[];
  metrics: { savingsRate: number; emergencyFundMonths: number; expenseRatio: number };
}

export interface TrendPoint {
  month: number;
  year: number;
  income: number;
  expenses: number;
  savings: number;
}
