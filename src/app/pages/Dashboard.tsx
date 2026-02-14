import { useState, useEffect } from 'react';
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
  Key
} from 'lucide-react';
import { Link } from 'react-router';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, UserRole } from '../types';
import { MOCK_USAGE } from '../constants';

const ProgressBar = ({ label, current, total, colorClass = "bg-blue-500" }: { label: string; current: number; total: number; colorClass?: string }) => {
  const percentage = Math.min(100, Math.round((current / total) * 100));
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

export default function Dashboard() {
  const stored = localStorage.getItem('user');
  const user: User | null = stored ? JSON.parse(stored) : null;

  const [resetTime, setResetTime] = useState('');

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
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-lg border border-white/10 shadow-lg">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Reset in {resetTime}</span>
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
              <div className="text-3xl font-bold text-white">{user?.dailyUsage?.toLocaleString() || '0'}</div>
              <p className="text-xs text-slate-400 mt-1">
                <span className="text-green-500">+12%</span> vs yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Requests (24h)</CardTitle>
              <Activity className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">1,240</div>
              <p className="text-xs text-slate-400 mt-1">
                <span className="text-green-500">+8%</span> vs yesterday
              </p>
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
                {user?.accessCount?.toLocaleString() || '0'} total calls
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/20 to-orange-600/5 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Average Latency</CardTitle>
              <CheckCircle2 className="size-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">184ms</div>
              <p className="text-xs text-slate-400 mt-1">
                <span className="text-green-500">-15%</span> improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Quota */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Usage History Chart */}
          <Card className="lg:col-span-2 bg-slate-900/50 border-white/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-white">Usage History (Tokens)</CardTitle>
                </div>
                <select className="bg-slate-800 border border-white/10 rounded-md px-3 py-1 text-sm text-white outline-none">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={MOCK_USAGE}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="tokens" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTokens)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quota Tracking + Endpoint */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quota Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && (
                  <>
                    <ProgressBar
                      label="Daily Limit"
                      current={user.dailyUsage}
                      total={user.dailyQuota}
                      colorClass={user.dailyUsage > user.dailyQuota * 0.9 ? "bg-red-500" : "bg-blue-500"}
                    />
                    <ProgressBar
                      label="Total Monthly Limit"
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
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Endpoint Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-950/50 p-4 rounded-lg border border-white/10 font-mono text-sm relative group overflow-hidden">
                  <span className="text-slate-400">
                    {user?.apiKey ? user.apiKey.replace(/(.{10}).+(.{4})/, '$1••••••••$2') : 'sk-abcd-••••••••'}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">API Endpoint</span>
                    <span className="text-blue-400">api.abcdllm.com</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Default Model</span>
                    <span className="text-slate-200">llama3:8b</span>
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
                  <CardDescription>localhost:11434</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-500 font-medium">연결됨</span>
                </div>
                <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                  상세 보기
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">실행 중인 모델</p>
                  <p className="text-white font-medium mt-1">5개</p>
                </div>
                <div>
                  <p className="text-slate-400">업타임</p>
                  <p className="text-white font-medium mt-1">5일 12시간</p>
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
                  <span>새 API 키 생성</span>
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
