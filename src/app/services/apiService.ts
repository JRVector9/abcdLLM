import { User, ApiKeyEntry, SecurityEvent, ModelPerformance, ModelInfo, UsageStat, SystemMetrics, Message, ApiRequest } from '../types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
let meCache: User | null = null;
let meRequest: Promise<User> | null = null;

const API_BASE = import.meta.env.VITE_API_BASE || '';

// ─── Auth helpers ──────────────────────────────────────────────

export function getToken(): string | null {
  // localStorage(로그인 유지) 또는 sessionStorage(세션 유지) 순으로 확인
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

/** remember=true: localStorage(브라우저 닫아도 유지) / false: sessionStorage(탭 닫으면 만료) */
export function setAuth(token: string, user: User, remember = true) {
  const store = remember ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));
  meCache = user;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  meCache = null;
  meRequest = null;
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** 채팅 완료 후 meCache 무효화 — 다음 getMe() 호출 시 서버에서 신선한 데이터 fetch */
export function clearMeCache(): void {
  meCache = null;
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
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
  const res = await fetch(`${API_BASE}/api${path}`, { ...opts, headers });

  // 502 또는 401: 1회 재시도 (일시적 라우팅/DB 장애 대응)
  if (res.status === 502 || res.status === 401) {
    await new Promise(r => setTimeout(r, 500));
    const retry = await fetch(`${API_BASE}/api${path}`, { ...opts, headers });
    // 재시도도 401이면 진짜 인증 실패 → 세션 삭제
    if (retry.status === 401) {
      clearAuth();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    return retry;
  }
  return res;
}

// ─── Auth ──────────────────────────────────────────────────────

export async function login(email: string, password: string, remember = true): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  const data = await res.json();
  setAuth(data.token, data.user, remember);
  return data;
}

export async function signup(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
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
  if (meCache) return meCache;

  const stored = getStoredUser();
  if (stored) {
    meCache = stored;
    return stored;
  }

  if (meRequest) {
    return meRequest;
  }

  meRequest = (async () => {
    const res = await authFetch('/auth/me');
    if (!res.ok) throw new Error('Failed to fetch user');
    const user = await res.json();
    meCache = user;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  })();

  try {
    return await meRequest;
  } finally {
    meRequest = null;
  }
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

// chatStream: 스트리밍 지원 시 실시간 토큰, 아니면 시뮬레이션 타이핑
export async function chatStream(
  model: string,
  messages: Message[],
  options?: { temperature?: number },
  onToken: (text: string) => void = () => {},
): Promise<string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      options: options ? { temperature: options.temperature } : undefined,
      stream: true,
      think: false,  // thinking 모드 비활성화 — 응답속도 최적화
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Chat failed: ${res.status}`);
  }

  const contentType = res.headers.get('content-type') || '';
  // 백엔드가 SSE / NDJSON 스트리밍을 지원하는 경우
  if (res.body && (contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson'))) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const raw = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed;
        if (raw === '[DONE]') return fullText;
        try {
          const json = JSON.parse(raw);
          const content =
            json.choices?.[0]?.delta?.content ?? // OpenAI SSE
            json.message?.content ??             // Ollama native
            json.response ??                     // Ollama /generate
            '';
          if (content) { fullText += content; onToken(fullText); }
          if (json.done === true) return fullText;
        } catch { /* 파싱 실패 청크 무시 */ }
      }
    }
    return fullText;
  }

  // 비스트리밍 fallback: 전체 응답 받은 후 타이핑 시뮬레이션
  const data = await res.json();
  const fullText: string = data.message?.content || 'No response from model.';
  const charsPerFrame = Math.max(1, Math.ceil(fullText.length / 120)); // ~120 프레임
  let i = 0;
  await new Promise<void>((resolve) => {
    const timer = setInterval(() => {
      i += charsPerFrame;
      onToken(fullText.slice(0, Math.min(i, fullText.length)));
      if (i >= fullText.length) { clearInterval(timer); resolve(); }
    }, 16); // ~60fps
  });
  return fullText;
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
