export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  apiKey: string;
  usage: number;
  dailyUsage: number;
  dailyQuota: number;
  totalQuota: number;
  lastActive: string;
  ip: string;
  status: 'active' | 'blocked';
  accessCount: number;
}

export interface ApiKeyEntry {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  // Limits
  dailyRequests: number;
  dailyTokens: number;
  totalTokens: number;
  // Actual usage
  usedRequests: number;
  usedTokens: number;
  totalUsedTokens: number;
  lastResetDate: string;
}

export interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'unusual_traffic' | 'brute_force' | 'ddos_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip: string;
  timestamp: string;
}

export interface ModelPerformance {
  name: string;
  tokensPerSec: number;
  avgLatency: number;
  memoryUsage: string;
  errorRate: number;
}

export interface ApiRequest {
  id: string;
  userId: string;
  userName: string;
  projectName: string;
  useCase: string;
  requestedQuota: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ModelInfo {
  name: string;
  size: string;
  modified: string;
  parameterCount?: string;
}

export interface UsageStat {
  date: string;
  requests: number;
  tokens: number;
  responseTime: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  activeRequests: number;
  errorRate: number;
  avgResponseTime: number;
}
