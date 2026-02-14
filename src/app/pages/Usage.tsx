import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Zap,
  Calendar
} from 'lucide-react';
import { UsageStat } from '../types';
import { getDashboard } from '../services/apiService';

export default function Usage() {
  const [dailyData, setDailyData] = useState<UsageStat[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    getDashboard()
      .then((data) => {
        setDailyData(data.recentUsage);
        setTotalRequests(data.totalRequests);
      })
      .catch(() => {});
  }, []);

  const todayRequests = dailyData.length > 0 ? dailyData[dailyData.length - 1]?.requests || 0 : 0;
  const todayTokens = dailyData.length > 0 ? dailyData[dailyData.length - 1]?.tokens || 0 : 0;
  const avgResponseTime = dailyData.length > 0
    ? Math.round(dailyData.reduce((sum, d) => sum + d.responseTime, 0) / dailyData.length)
    : 0;

  const hourlyData: { hour: string; requests: number; responseTime: number }[] = [];
  const endpointData: { endpoint: string; requests: number; avgTime: number }[] = [];
  const modelData: { name: string; value: number; color: string }[] = [];
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">사용량 통계</h1>
          <p className="text-slate-400">API 사용량과 성능 지표를 분석하세요</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                오늘 요청 수
              </CardTitle>
              <Activity className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{todayRequests.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingUp className="size-3" />
                <span>+18.2% 어제 대비</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                평균 응답 시간
              </CardTitle>
              <Clock className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{avgResponseTime}ms</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingDown className="size-3" />
                <span>-5.3% 어제 대비</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-600/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                총 토큰 사용량
              </CardTitle>
              <Zap className="size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{todayTokens > 1000 ? `${(todayTokens / 1000).toFixed(1)}K` : todayTokens}</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingUp className="size-3" />
                <span>+23.1% 어제 대비</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/20 to-orange-600/5 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                에러율
              </CardTitle>
              <Activity className="size-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">0.27%</div>
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <TrendingUp className="size-3" />
                <span>+0.05% 어제 대비</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              전체 현황
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              성능 분석
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              모델별 통계
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Daily Requests Chart */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">일별 API 요청 추이</CardTitle>
                <CardDescription>최근 7일간의 요청 수와 에러 발생 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="requests" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorRequests)" 
                      name="요청 수"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="errors" 
                      stroke="#ef4444" 
                      fillOpacity={1} 
                      fill="url(#colorErrors)" 
                      name="에러 수"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Token Usage Chart */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">토큰 사용량 추이</CardTitle>
                <CardDescription>일별 토큰 소비 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="tokens" fill="#8b5cf6" name="토큰" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Hourly Requests */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">시간대별 요청 분포</CardTitle>
                <CardDescription>오늘의 시간대별 API 요청 패턴</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="hour" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="requests" fill="#10b981" name="요청 수" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">시간대별 응답 시간</CardTitle>
                <CardDescription>평균 응답 시간 추이 (밀리초)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="hour" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="응답 시간"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Endpoint Stats */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">엔드포인트별 통계</CardTitle>
                <CardDescription>각 API 엔드포인트의 사용 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpointData.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium">{endpoint.endpoint}</p>
                        <p className="text-sm text-slate-400">평균 {endpoint.avgTime}ms</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">{endpoint.requests.toLocaleString()}</p>
                        <p className="text-sm text-slate-400">요청</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Model Distribution */}
              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">모델별 사용 비율</CardTitle>
                  <CardDescription>각 모델의 요청 비율</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={modelData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {modelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Model Details */}
              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">모델별 상세 통계</CardTitle>
                  <CardDescription>요청 수 및 비율</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modelData.map((model, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: model.color }}
                            ></div>
                            <span className="text-white font-medium">{model.name}</span>
                          </div>
                          <span className="text-white font-bold">{model.value.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all" 
                            style={{ 
                              width: `${(model.value / modelData.reduce((sum, m) => sum + m.value, 0)) * 100}%`,
                              backgroundColor: model.color
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
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
