import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  Users,
  Shield,
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle,
  Server,
  Clock,
  Bell,
  Settings,
  Search,
  Download,
  Cpu,
  HardDrive,
  Gauge,
  Database,
  Zap,
  Flame,
  XCircle,
  Terminal,
  Trash2,
  ArrowDownToLine,
  Globe,
  Mail,
  BarChart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  MOCK_MODELS,
  MOCK_USAGE
} from '../constants';
import {
  adminGetUsers,
  adminGetMetrics,
  adminGetSecurityEvents,
  adminGetModelPerformance,
  adminGetInsights,
  listModels,
  adminGetOllamaSettings,
  adminUpdateOllamaSettings,
} from '../services/apiService';
import { User, ModelInfo, SystemMetrics, SecurityEvent, ModelPerformance } from '../types';

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [insights, setInsights] = useState<string>('Analyzing system patterns...');
  const [liveModels, setLiveModels] = useState<ModelInfo[]>(MOCK_MODELS);
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({ cpu: 0, memory: 0, disk: 0, uptime: '-', activeRequests: 0, errorRate: 0, avgResponseTime: 0 });
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([]);
  const [ollamaUrl, setOllamaUrl] = useState<string>('');
  const [ollamaUrlInput, setOllamaUrlInput] = useState<string>('');
  const [isUpdatingOllamaUrl, setIsUpdatingOllamaUrl] = useState(false);

  useEffect(() => {
    adminGetUsers().then(setUsers).catch(() => {});
    adminGetMetrics().then(setMetrics).catch(() => {});
    adminGetSecurityEvents().then(setSecurityEvents).catch(() => {});
    adminGetModelPerformance().then(setModelPerformance).catch(() => {});

    adminGetInsights({ status: 'requesting analysis' }).then(setInsights).catch(() => {});

    listModels()
      .then((fetched) => {
        if (fetched.length > 0) setLiveModels(fetched);
      })
      .catch(() => {});

    adminGetOllamaSettings()
      .then((data) => {
        setOllamaUrl(data.ollamaBaseUrl);
        setOllamaUrlInput(data.ollamaBaseUrl);
      })
      .catch(() => {});
  }, []);

  const handleUpdateOllamaUrl = async () => {
    if (!ollamaUrlInput.trim()) return;
    setIsUpdatingOllamaUrl(true);
    try {
      const data = await adminUpdateOllamaSettings(ollamaUrlInput);
      setOllamaUrl(data.ollamaBaseUrl);
      alert('Ollama URL 업데이트 완료!');
    } catch (error) {
      alert('Ollama URL 업데이트 실패: ' + (error as Error).message);
    } finally {
      setIsUpdatingOllamaUrl(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Administration Command Center</h1>
            <p className="text-slate-400">Total system control, security orchestration, and model management.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="size-4 mr-2" />
            보고서 다운로드
          </Button>
        </div>

        {/* AI Advisory */}
        <div className="bg-blue-950/20 border border-blue-500/20 p-5 rounded-2xl flex gap-5 items-start">
          <div className="bg-blue-600/20 p-3 rounded-xl shrink-0">
            <Zap className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-blue-300 font-bold mb-1">AI System Advisor</h3>
            <div className="text-slate-400 text-sm italic leading-relaxed whitespace-pre-wrap">
              {insights}
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="monitor" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-white/10 flex-wrap">
            <TabsTrigger value="monitor" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Users & Quota
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Security Center
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Database className="w-4 h-4 mr-2" />
              Ollama Models
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Monitor */}
          <TabsContent value="monitor" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-orange-600/20 to-orange-600/5 border-orange-500/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Active Requests</CardTitle>
                  <Flame className="size-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{metrics.activeRequests}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-600/20 to-green-600/5 border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Avg Response</CardTitle>
                  <Clock className="size-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{metrics.avgResponseTime}ms</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-600/20 to-red-600/5 border-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Error Rate</CardTitle>
                  <XCircle className="size-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{metrics.errorRate}%</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Active Users</CardTitle>
                  <Users className="size-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{users.length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 bg-slate-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-blue-400" />
                    Inference Latency History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={MOCK_USAGE}>
                      <defs>
                        <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                      <Area type="monotone" dataKey="responseTime" stroke="#10b981" fillOpacity={1} fill="url(#latencyGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Resource Snapshots</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: 'CPU Load', value: metrics.cpu, color: 'bg-blue-500' },
                    { label: 'Memory Usage', value: metrics.memory, color: 'bg-purple-500' },
                    { label: 'Disk IOPS', value: metrics.disk, color: 'bg-amber-500' },
                  ].map(res => (
                    <div key={res.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{res.label}</span>
                        <span className="text-white font-bold">{res.value}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className={`${res.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${res.value}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Users & Quota */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Auditing & Access Control</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        placeholder="사용자 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white w-64"
                      />
                    </div>
                    <Button variant="outline" className="text-white border-white/20">Export Logs</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                        <th className="px-6 py-4">User Info</th>
                        <th className="px-6 py-4">Security Context</th>
                        <th className="px-6 py-4">Quota Utilization</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-lg text-white">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-white">{u.name}</div>
                                <div className="text-slate-500 text-xs">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <div className="text-xs font-mono text-slate-400">IP: {u.ip}</div>
                              <div className="text-xs font-bold text-blue-400">{u.accessCount} total calls</div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="w-full max-w-[120px] space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                <span>DAILY</span>
                                <span>{Math.round((u.dailyUsage / u.dailyQuota) * 100)}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (u.dailyUsage / u.dailyQuota) * 100)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <Badge className={u.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                              {u.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-400 ml-1">
                              Block
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Security Center */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-slate-900/50 border-white/10">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-rose-500" />
                        Security Activity Log
                      </CardTitle>
                      <span className="text-xs font-bold text-slate-500 uppercase">Live Audit</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {securityEvents.map(event => (
                      <div key={event.id} className={`p-4 rounded-xl border flex gap-4 ${
                        event.severity === 'critical' ? 'bg-red-950/20 border-red-500/30' :
                        event.severity === 'medium' ? 'bg-amber-950/20 border-amber-500/30' :
                        'bg-white/5 border-white/10'
                      }`}>
                        <div className="mt-1">
                          {event.severity === 'critical'
                            ? <Flame className="w-5 h-5 text-rose-500" />
                            : <AlertTriangle className="w-5 h-5 text-amber-500" />
                          }
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{event.type.replace('_', ' ')}</span>
                            <span className="text-[10px] font-mono text-slate-600">{event.timestamp}</span>
                          </div>
                          <p className="text-sm text-slate-200 font-medium mb-2">{event.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-400">Source: {event.ip}</span>
                            <button className="text-[10px] font-bold text-blue-400 uppercase hover:underline">Mitigate & Resolve</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-slate-900/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-emerald-400" />
                      Global Traffic Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Whitelist Mode</span>
                      <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">DDOS Auto-Mitigation</span>
                      <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Quick Blacklist IP</label>
                      <div className="flex gap-2">
                        <Input placeholder="1.2.3.4" className="bg-white/5 border-white/10 text-white" />
                        <Button className="bg-red-600 hover:bg-red-500 text-white">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-gradient-to-br from-amber-600/10 to-rose-600/10 border border-amber-500/20 p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Threat Prediction
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "Our ML heuristics predict a 15% increase in bot activity from known proxy exit nodes within the next 4 hours. Recommend increasing IP-rate limiting globally."
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: Ollama Models */}
          <TabsContent value="models" className="space-y-8">
            {/* Ollama URL Configuration */}
            <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="w-6 h-6 text-blue-400" />
                  Ollama 서버 설정
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Ollama 서버 연결 URL을 관리합니다. 변경 후 즉시 적용됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                      Ollama Base URL
                    </label>
                    <Input
                      type="text"
                      value={ollamaUrlInput}
                      onChange={(e) => setOllamaUrlInput(e.target.value)}
                      placeholder="http://192.168.139.3:11434"
                      className="bg-white/5 border-white/10 text-white font-mono"
                    />
                  </div>
                  <div className="pt-6">
                    <Button
                      onClick={handleUpdateOllamaUrl}
                      disabled={isUpdatingOllamaUrl || ollamaUrlInput === ollamaUrl}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      {isUpdatingOllamaUrl ? '업데이트 중...' : '적용'}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400">
                    현재 연결: <span className="text-white font-mono">{ollamaUrl || '로딩 중...'}</span>
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modelPerformance.map(perf => (
                <Card key={perf.name} className="bg-slate-900/50 border-white/10 hover:border-blue-500/50 transition-all group">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-white/5 p-2 rounded-lg group-hover:bg-blue-600 transition-colors">
                        <Terminal className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">ONLINE</span>
                    </div>
                    <h4 className="font-bold text-white mb-1">{perf.name}</h4>
                    <div className="grid grid-cols-2 gap-4 mt-4 border-t border-white/10 pt-4">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Speed</div>
                        <div className="text-sm font-bold text-blue-400">{perf.tokensPerSec} t/s</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">VRAM</div>
                        <div className="text-sm font-bold text-slate-300">{perf.memoryUsage}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white flex items-center gap-2">
                    <HardDrive className="w-6 h-6 text-blue-400" />
                    Ollama Infrastructure Manager
                  </CardTitle>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <ArrowDownToLine className="w-5 h-5 mr-2" />
                    Pull New Model
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {liveModels.map(model => (
                  <div key={model.name} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-blue-400">
                        AI
                      </div>
                      <div>
                        <div className="font-bold text-lg text-white">{model.name}</div>
                        <div className="flex gap-3 text-xs text-slate-500 mt-1">
                          <span>Size: {model.size}</span>
                          <span>{model.modified}</span>
                          {model.parameterCount && <span>{model.parameterCount} params</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase font-bold">Inference Cost</div>
                        <div className="text-emerald-400 font-bold">Low Impact</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-slate-300 border-white/20 hover:bg-white/10">
                          <BarChart className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-rose-500 border-white/20 hover:bg-rose-900/40">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Integrations */}
          <TabsContent value="integrations" className="space-y-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-6 h-6 text-amber-500" />
                    External Integrations & Webhooks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {[
                    { title: 'Slack Notifications', desc: 'Send security and downtime alerts to a Slack channel.', icon: Mail, color: 'text-[#E01E5A]' },
                    { title: 'Discord Webhooks', desc: 'Rich model performance summaries via Discord.', icon: Activity, color: 'text-[#5865F2]' },
                    { title: 'Email Relay', desc: 'Digest reports for system usage statistics.', icon: Mail, color: 'text-blue-400' },
                  ].map(service => (
                    <div key={service.title} className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <div className={`p-3 bg-white/5 rounded-xl ${service.color}`}>
                          <service.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{service.title}</h4>
                          <p className="text-sm text-slate-500">{service.desc}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 text-xs font-bold uppercase">
                        Configure
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                    Alert Thresholds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Error Rate Limit (%)</label>
                      <input type="range" className="w-full accent-rose-500 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer" defaultValue="5" />
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>1%</span>
                        <span className="text-rose-400 font-bold">5% (Current)</span>
                        <span>25%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">CPU Usage Trigger (%)</label>
                      <input type="range" className="w-full accent-amber-500 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer" defaultValue="85" />
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>50%</span>
                        <span className="text-amber-400 font-bold">85% (Current)</span>
                        <span>95%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
