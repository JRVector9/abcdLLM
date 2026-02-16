import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Activity,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Server,
} from 'lucide-react';
import { Link } from 'react-router';
import { UsageStat } from '../types';
import { getDashboard, DashboardData, ollamaHealth } from '../services/apiService';
import { useSWR } from '../hooks/useSWR';

// ─── Inline SVG Area Chart ────────────────────────────────────
const CHART_H = 260;
const CHART_PAD = { top: 20, right: 16, bottom: 32, left: 48 };

function toPath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
}

function AreaChartSVG({ data, dataKey, color }: { data: UsageStat[]; dataKey: string; color: string }) {
  const totalW = 400;
  const innerW = totalW - CHART_PAD.left - CHART_PAD.right;
  const innerH = CHART_H - CHART_PAD.top - CHART_PAD.bottom;
  const values = data.map(d => (d[dataKey as keyof UsageStat] as number) ?? 0);
  const max = Math.max(...values, 1);
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;

  const points = values.map((v, i) => ({
    x: CHART_PAD.left + i * step,
    y: CHART_PAD.top + innerH - (v / max) * innerH,
  }));

  const areaPath = `${toPath(points)} L${points[points.length - 1].x},${CHART_PAD.top + innerH} L${points[0].x},${CHART_PAD.top + innerH} Z`;
  const ticks = [0, Math.round(max / 2), max];

  return (
    <svg viewBox={`0 0 ${totalW} ${CHART_H}`} className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Usage chart">
      {ticks.map(t => {
        const y = CHART_PAD.top + innerH - (t / max) * innerH;
        return (
          <g key={t}>
            <line x1={CHART_PAD.left} y1={y} x2={totalW - CHART_PAD.right} y2={y} stroke="#ffffff10" strokeDasharray="4 4" />
            <text x={CHART_PAD.left - 6} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{t.toLocaleString()}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="grad-dash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#grad-dash)" />
      <path d={toPath(points)} fill="none" stroke={color} strokeWidth={2} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill={color} />
          <text x={p.x} y={CHART_PAD.top + innerH + 16} textAnchor="middle" fill="#94a3b8" fontSize="9">
            {data[i].date}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-[260px] bg-slate-800/30 rounded-lg animate-pulse flex items-end justify-around px-12 pb-8 gap-2">
      {[40, 65, 50, 80, 60, 75, 55].map((h, i) => (
        <div key={i} className="bg-slate-700/40 rounded-t" style={{ width: '10%', height: `${h}%` }} />
      ))}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────
const ProgressBar = ({ label, current, total, colorClass = "bg-blue-500" }: { label: string; current: number; total: number; colorClass?: string }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-200 font-medium">{current.toLocaleString()} / {total.toLocaleString()} ({percentage}%)</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className={`${colorClass} h-full transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────

const dashboardFetcher = () => getDashboard();

export default function Dashboard() {
  const { data, isLoading, isValidating } = useSWR<DashboardData>('dashboard', dashboardFetcher);
  const [ollamaOnline, setOllamaOnline] = useState(false);
  const [resetTime, setResetTime] = useState('');

  const user = data?.user ?? null;
  const recentUsage = data?.recentUsage ?? [];
  const activeModels = data?.activeModels ?? 0;
  const totalRequests = data?.totalRequests ?? 0;
  const uptime = data?.uptime ?? '';

  useEffect(() => {
    ollamaHealth().then(setOllamaOnline);
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setResetTime(`${hours}h ${minutes}m`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const avgResponseTime = useMemo(() => {
    if (recentUsage.length === 0) return 0;
    return Math.round(recentUsage.reduce((sum, u) => sum + u.responseTime, 0) / recentUsage.length);
  }, [recentUsage]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="text-slate-400">Real-time status of your API allocations and usage.</p>
          </div>
          <div className="flex items-center gap-3">
            {isValidating && !isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                갱신 중
              </div>
            )}
            <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-lg border border-white/10 shadow-lg">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Reset in {resetTime}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Daily Tokens Used</CardTitle>
              <Zap className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {(user?.dailyUsage ?? 0).toLocaleString()}
                <span className="text-lg text-slate-500 font-normal"> / {(user?.dailyQuota ?? 0).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total Requests</CardTitle>
              <Activity className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalRequests.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-600/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Account Status</CardTitle>
              <ShieldCheck className="size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white capitalize">{user?.status || 'Active'}</div>
              <p className="text-xs text-slate-400 mt-1">
                {(user?.accessCount ?? 0).toLocaleString()} total calls
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/20 to-orange-600/5 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Average Latency</CardTitle>
              <CheckCircle2 className="size-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{avgResponseTime}ms</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Quota */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Usage History Chart */}
          <Card className="lg:col-span-2 bg-slate-900/50 border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-white">Usage History (Tokens)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? <ChartSkeleton /> : recentUsage.length > 0 ? (
                <AreaChartSVG data={recentUsage} dataKey="tokens" color="#3b82f6" />
              ) : (
                <div className="h-[260px] flex items-center justify-center text-slate-500 text-sm">
                  아직 사용 기록이 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quota Tracking + Endpoint */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quota Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user ? (
                  <>
                    <ProgressBar
                      label="Daily Token Limit"
                      current={user.dailyUsage}
                      total={user.dailyQuota}
                      colorClass={user.dailyUsage > user.dailyQuota * 0.9 ? "bg-red-500" : "bg-blue-500"}
                    />
                    <ProgressBar
                      label="Total Usage Cap"
                      current={user.usage}
                      total={user.totalQuota}
                      colorClass="bg-emerald-500"
                    />
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-sm text-slate-400">Need more?</span>
                      <Link to="/api-application" className="text-blue-400 text-sm font-semibold hover:underline flex items-center gap-1">
                        Upgrade Plan <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </>
                ) : isLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-slate-800/50 rounded" />
                    <div className="h-8 bg-slate-800/50 rounded" />
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Endpoint Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-950/50 p-4 rounded-lg border border-white/10 font-mono text-sm">
                  <span className="text-slate-400">
                    {user?.apiKey ? user.apiKey.replace(/(.{10}).+(.{4})/, '$1••••••••$2') : 'sk-abcd-••••••••'}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">API Endpoint</span>
                    <span className="text-blue-400">abcdllm-api.brut.bot</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Default Model</span>
                    <span className="text-slate-200">qwen3:8b</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Server className="size-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-white">Ollama 서버 상태</CardTitle>
                  <CardDescription>LLM Inference Engine</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${ollamaOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className={`font-medium ${ollamaOnline ? 'text-green-500' : 'text-red-500'}`}>
                    {ollamaOnline ? '연결됨' : '오프라인'}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">실행 중인 모델</p>
                  <p className="text-white font-medium mt-1">{activeModels}개</p>
                </div>
                <div>
                  <p className="text-slate-400">업타임</p>
                  <p className="text-white font-medium mt-1">{uptime || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <Clock className="size-6 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-white">빠른 시작</CardTitle>
                  <CardDescription>자주 사용하는 기능</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/api-keys">
                <Button variant="ghost" className="w-full justify-between text-white hover:bg-white/10">
                  <span>API 키 관리</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/playground">
                <Button variant="ghost" className="w-full justify-between text-white hover:bg-white/10">
                  <span>모델 테스트하기</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/usage">
                <Button variant="ghost" className="w-full justify-between text-white hover:bg-white/10">
                  <span>사용량 통계 보기</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
