/// <reference types="vite/client" />

const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

function getToken(): string | null {
  return localStorage.getItem('hl_token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json.data;
}

export const api = {
  login: (email: string, password: string) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  changePassword: (newPassword: string) =>
    request<{ new_token: string | null; new_refresh_token: string | null }>('/auth/change-password', { method: 'POST', body: JSON.stringify({ newPassword }) }),

  // Customers
  getCustomers: () => request<any[]>('/customers'),
  getCustomer: (id: string) => request<any>(`/customers/${id}`),
  createCustomer: (data: any) => request<any>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: any) => request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: string) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: () => request<any[]>('/products'),
  getProduct: (id: string) => request<any>(`/products/${id}`),
  createProduct: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),

  // Transactions
  createTransaction: (data: any) => request<any>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  getTransaction: (id: string) => request<any>(`/transactions/${id}`),
  settleTransaction: (id: string, tanggal: string) =>
    request<any>(`/transactions/${id}/settle`, { method: 'POST', body: JSON.stringify({ tanggal_pelunasan: tanggal }) }),
  getActivity: (customerId: string, month: number, year: number) =>
    request<any>(`/transactions/customers/${customerId}/activity?month=${month}&year=${year}`),
  settleMonth: (customerId: string, month: number, year: number) =>
    request<any>(`/transactions/customers/${customerId}/settle-month`, { method: 'POST', body: JSON.stringify({ month, year }) }),
  getBonusStatus: (customerId: string) => request<any>(`/transactions/customers/${customerId}/bonus-status`),

  // Reports
  getRecap: (type: string, month: number, year: number) =>
    request<any>(`/reports/recap?type=${type}&month=${month}&year=${year}`),
  getMonthlyChart: () => request<any[]>('/reports/chart'),
  exportPdf: (type: string, month: number, year: number) =>
    fetch(BASE + '/reports/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ type, month, year }),
    }).then(r => r.blob()),

  // AI Assistant
  getAiReminder: (customerId: string, transactionId?: string) =>
    request<{ message: string }>('/ai/reminder', {
      method: 'POST',
      body: JSON.stringify({ customerId, transactionId }),
    }),
  askAiChat: (message: string) =>
    request<{ reply: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // AI Intelligence
  getAiRisk: () => request<any[]>('/ai/risk'),
  getAiPredictions: () => request<any[]>('/ai/predictions'),
  getAiOverdue: (days?: number) => request<any[]>(`/ai/overdue${days ? `?days=${days}` : ''}`),
  getAiAnomalies: () => request<any[]>('/ai/anomalies'),
  getAiDailySummary: () => request<{ summary: string }>('/ai/daily-summary'),
};
