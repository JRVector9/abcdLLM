import { User, UserRole, ModelInfo, UsageStat, SystemMetrics, ApiRequest, SecurityEvent, ModelPerformance } from './types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@abcdllm.com',
    name: 'Main Admin',
    role: UserRole.ADMIN,
    apiKey: 'sk-abcd-admin-key-777',
    usage: 125000,
    dailyUsage: 4500,
    dailyQuota: 50000,
    totalQuota: 1000000,
    lastActive: '2023-11-20 10:45',
    ip: '192.168.1.10',
    status: 'active',
    accessCount: 1540
  },
  {
    id: '2',
    email: 'dev@example.com',
    name: 'Developer Jane',
    role: UserRole.USER,
    apiKey: 'sk-abcd-user-8821',
    usage: 45000,
    dailyUsage: 12000,
    dailyQuota: 20000,
    totalQuota: 200000,
    lastActive: '2023-11-20 09:12',
    ip: '112.23.45.67',
    status: 'active',
    accessCount: 890
  },
  {
    id: '3',
    email: 'sus@hacker.com',
    name: 'Suspicious User',
    role: UserRole.USER,
    apiKey: 'sk-abcd-blocked-991',
    usage: 89000,
    dailyUsage: 89000,
    dailyQuota: 5000,
    totalQuota: 100000,
    lastActive: '2023-11-19 23:00',
    ip: '45.12.33.21',
    status: 'blocked',
    accessCount: 12450
  }
];

export const MOCK_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'sec-1',
    type: 'ddos_attempt',
    severity: 'critical',
    description: 'Rapid request burst (3k req/sec) from single range detected.',
    ip: '185.2.44.xx',
    timestamp: '2023-11-20 11:20'
  },
  {
    id: 'sec-2',
    type: 'failed_login',
    severity: 'medium',
    description: '10+ failed login attempts within 1 minute.',
    ip: '45.12.33.21',
    timestamp: '2023-11-20 10:45'
  },
  {
    id: 'sec-3',
    type: 'unusual_traffic',
    severity: 'low',
    description: 'Unusual output token length spike detected.',
    ip: '112.23.45.67',
    timestamp: '2023-11-20 09:12'
  }
];

export const MOCK_MODEL_PERFORMANCE: ModelPerformance[] = [
  { name: 'qwen3:8b', tokensPerSec: 65, avgLatency: 120, memoryUsage: '4.8GB', errorRate: 0.2 },
  { name: 'qwen2.5:32b', tokensPerSec: 35, avgLatency: 280, memoryUsage: '18GB', errorRate: 0.3 },
  { name: 'gemma2:27b', tokensPerSec: 38, avgLatency: 250, memoryUsage: '16GB', errorRate: 0.2 },
  { name: 'exaone3.5:7.8b', tokensPerSec: 70, avgLatency: 110, memoryUsage: '4.5GB', errorRate: 0.1 },
  { name: 'llama3.1:8b', tokensPerSec: 68, avgLatency: 115, memoryUsage: '4.7GB', errorRate: 0.2 },
  { name: 'llama3.1:70b', tokensPerSec: 18, avgLatency: 450, memoryUsage: '40GB', errorRate: 0.5 }
];

export const MOCK_API_REQUESTS: ApiRequest[] = [
  {
    id: 'req-1',
    userId: '2',
    userName: 'Developer Jane',
    projectName: 'Customer Support Bot',
    useCase: 'Production chatbot for high-traffic commerce site.',
    requestedQuota: 500000,
    status: 'pending',
    createdAt: '2023-11-20 08:30'
  }
];

export const MOCK_MODELS: ModelInfo[] = [
  { name: 'qwen3:8b', size: '4.9 GB', modified: 'recently', parameterCount: '8B' },
  { name: 'qwen2.5:32b', size: '19 GB', modified: 'recently', parameterCount: '32B' },
  { name: 'gemma2:27b', size: '16 GB', modified: 'recently', parameterCount: '27B' },
  { name: 'exaone3.5:7.8b', size: '4.5 GB', modified: 'recently', parameterCount: '7.8B' },
  { name: 'llama3.1:8b', size: '4.7 GB', modified: 'recently', parameterCount: '8B' },
  { name: 'llama3.1:70b', size: '40 GB', modified: 'recently', parameterCount: '70B' }
];

export const MOCK_USAGE: UsageStat[] = [
  { date: '2023-11-14', requests: 450, tokens: 250000, responseTime: 120 },
  { date: '2023-11-15', requests: 520, tokens: 310000, responseTime: 145 },
  { date: '2023-11-16', requests: 380, tokens: 190000, responseTime: 110 },
  { date: '2023-11-17', requests: 780, tokens: 560000, responseTime: 210 },
  { date: '2023-11-18', requests: 920, tokens: 620000, responseTime: 235 },
  { date: '2023-11-19', requests: 1100, tokens: 850000, responseTime: 280 },
  { date: '2023-11-20', requests: 640, tokens: 420000, responseTime: 180 },
];

export const MOCK_METRICS: SystemMetrics = {
  cpu: 45,
  memory: 62,
  disk: 78,
  uptime: '14 days, 5 hours',
  activeRequests: 12,
  errorRate: 0.4,
  avgResponseTime: 184
};
