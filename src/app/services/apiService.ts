import { User, ApiKeyEntry, SecurityEvent, ModelPerformance, ModelInfo, UsageStat, SystemMetrics, Message, ApiRequest } from '../types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// ─── Auth helpers ──────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ─── Fetch wrapper ─────────────────────────────────────────────

async function authFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`/api${path}`, { ...opts, headers });

  // 502: DB 일시적 장애 → 1회 재시도 (재시도 결과는 그대로 반환, 리다이렉트 안 함)
  if (res.status === 502) {
    await new Promise(r => setTimeout(r, 1000));
    return fetch(`/api${path}`, { ...opts, headers });
  }

  // 401: 실제 인증 실패 → 세션 삭제
  if (res.status === 401) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return res;
}

// ─── Auth ──────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  const data = await res.json();
  setAuth(data.token, data.user);
  return data;
}

export async function signup(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, passwordConfirm: password, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Signup failed');
  }
  const data = await res.json();
  setAuth(data.token, data.user);
  return data;
}

export async function getMe(): Promise<User> {
  const res = await authFetch('/auth/me');
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

// ─── Dashboard ─────────────────────────────────────────────────

export interface DashboardData {
  user: User;
  recentUsage: UsageStat[];
  activeModels: number;
  totalRequests: number;
}

export async function getDashboard(): Promise<DashboardData> {
  const res = await authFetch('/user/dashboard');
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

export interface QuotaData {
  dailyUsage: number;
  dailyQuota: number;
  totalUsage: number;
  totalQuota: number;
  resetTime: string;
}

export async function getQuota(): Promise<QuotaData> {
  const res = await authFetch('/user/quota');
  if (!res.ok) throw new Error('Failed to fetch quota');
  return res.json();
}

// ─── API Keys ──────────────────────────────────────────────────

export async function getKeys(): Promise<ApiKeyEntry[]> {
  const res = await authFetch('/keys');
  if (!res.ok) throw new Error('Failed to fetch keys');
  return res.json();
}

export async function createKey(data: { name: string; dailyRequests: number; dailyTokens: number; totalTokens: number }): Promise<ApiKeyEntry & { plainKey?: string }> {
  const res = await authFetch('/keys', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create key');
  return res.json();
}

export async function deleteKey(id: string): Promise<void> {
  const res = await authFetch(`/keys/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete key');
}

export async function regenerateKey(id: string): Promise<{ plainKey: string }> {
  const res = await authFetch(`/keys/${id}/regenerate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to regenerate key');
  return res.json();
}

export async function revealKey(id: string): Promise<{ key: string }> {
  const res = await authFetch(`/keys/${id}/reveal`);
  if (!res.ok) throw new Error('Failed to reveal key');
  return res.json();
}

// ─── Ollama Proxy ──────────────────────────────────────────────

export async function chat(model: string, messages: Message[], options?: { temperature?: number }): Promise<string> {
  const res = await authFetch('/v1/chat', {
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      options: options ? { temperature: options.temperature } : undefined,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Chat failed: ${res.status}`);
  }
  const data = await res.json();
  return data.message?.content || 'No response from model.';
}

export async function listModels(): Promise<ModelInfo[]> {
  const res = await authFetch('/v1/models');
  if (!res.ok) throw new Error('Failed to fetch models');
  return res.json();
}

export async function showModel(name: string): Promise<any> {
  const res = await authFetch('/v1/models/show', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to show model');
  return res.json();
}

export async function ollamaHealth(): Promise<boolean> {
  try {
    const res = await authFetch('/v1/health');
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

// ─── Applications ──────────────────────────────────────────────

export async function createApplication(data: {
  projectName: string;
  useCase: string;
  requestedQuota: number;
  targetModel?: string;
}): Promise<ApiRequest> {
  const res = await authFetch('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create application');
  return res.json();
}

export async function getApplications(): Promise<ApiRequest[]> {
  const res = await authFetch('/applications');
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

// ─── Settings ──────────────────────────────────────────────────

export interface SettingsData {
  autoModelUpdate: boolean;
  detailedLogging: boolean;
  ipWhitelist: string;
  emailSecurityAlerts: boolean;
  usageThresholdAlert: boolean;
  user: User;
}

export async function getSettings(): Promise<SettingsData> {
  const res = await authFetch('/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(data: Partial<Omit<SettingsData, 'user'>>): Promise<void> {
  const res = await authFetch('/settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update settings');
}

export async function refreshApiKey(): Promise<{ apiKey: string }> {
  const res = await authFetch('/settings/api-key/refresh', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to refresh API key');
  return res.json();
}

export async function updateWhitelist(ipWhitelist: string): Promise<void> {
  const res = await authFetch('/settings/whitelist', {
    method: 'PATCH',
    body: JSON.stringify({ ipWhitelist }),
  });
  if (!res.ok) throw new Error('Failed to update whitelist');
}

// ─── Admin ─────────────────────────────────────────────────────

export async function adminGetUsers(): Promise<User[]> {
  const res = await authFetch('/admin/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function adminUpdateUser(userId: string, data: Partial<User>): Promise<User> {
  const res = await authFetch(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

export async function adminGetSecurityEvents(): Promise<SecurityEvent[]> {
  const res = await authFetch('/admin/security-events');
  if (!res.ok) throw new Error('Failed to fetch security events');
  return res.json();
}

export async function adminGetMetrics(): Promise<SystemMetrics> {
  const res = await authFetch('/admin/metrics');
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function adminGetModelPerformance(): Promise<ModelPerformance[]> {
  const res = await authFetch('/admin/models/performance');
  if (!res.ok) throw new Error('Failed to fetch model performance');
  return res.json();
}

export async function adminGetInsights(stats: any): Promise<string> {
  const res = await authFetch('/admin/insights', {
    method: 'POST',
    body: JSON.stringify({ stats }),
  });
  if (!res.ok) return 'Unable to generate insights.';
  const data = await res.json();
  return data.insights;
}

export async function adminGetApplications(): Promise<ApiRequest[]> {
  const res = await authFetch('/admin/applications');
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function adminUpdateApplication(appId: string, data: { status: string; adminNote?: string }): Promise<ApiRequest> {
  const res = await authFetch(`/admin/applications/${appId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update application');
  return res.json();
}

export interface OllamaSettings {
  ollamaBaseUrl: string;
}

export async function adminGetOllamaSettings(): Promise<OllamaSettings> {
  const res = await authFetch('/admin/ollama-settings');
  if (!res.ok) throw new Error('Failed to fetch Ollama settings');
  return res.json();
}

export async function adminUpdateOllamaSettings(ollamaBaseUrl: string): Promise<OllamaSettings> {
  const res = await authFetch('/admin/ollama-settings', {
    method: 'PATCH',
    body: JSON.stringify({ ollamaBaseUrl }),
  });
  if (!res.ok) throw new Error('Failed to update Ollama settings');
  return res.json();
}
