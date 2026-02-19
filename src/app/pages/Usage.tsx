import { useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Activity, Clock, Zap } from 'lucide-react';
import { getDashboard, DashboardData } from '../services/apiService';
import { useSWR } from '../hooks/useSWR';

// ─── Lightweight inline SVG chart components ────────────────────

const CHART_H = 160;
const CHART_PAD = { top: 16, right: 16, bottom: 28, left: 48 };

// "2024-11-14" → "11/14"
const fmtDate = (d: string) => d.length >= 10 ? `${d.slice(5, 7)}/${d.slice(8, 10)}` : d;

function toPath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
}

const CHART_W = 500;

function AreaChartSVG({ data, dataKey, color, label }: { data: any[]; dataKey: string; color: string; label: string }) {
  const innerW = CHART_W - CHART_PAD.left - CHART_PAD.right;
  const innerH = CHART_H - CHART_PAD.top - CHART_PAD.bottom;
  const values = data.map(d => (d[dataKey] as number) ?? 0);
  const max = Math.max(...values, 1);
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;

  const points = values.map((v, i) => ({
    x: CHART_PAD.left + i * step,
    y: CHART_PAD.top + innerH - (v / max) * innerH,
  }));

  if (points.length === 0) {
    return (
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" role="img" aria-label={label}>
        <text x={CHART_W / 2} y={CHART_H / 2} textAnchor="middle" fill="#94a3b8" fontSize="13">데이터 없음</text>
      </svg>
    );
  }

  const areaPath = `${toPath(points)} L${points[points.length - 1].x},${CHART_PAD.top + innerH} L${points[0].x},${CHART_PAD.top + innerH} Z`;
  const ticks = [0, Math.round(max / 2), max];

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}>
      {ticks.map(t => {
        const y = CHART_PAD.top + innerH - (t / max) * innerH;
        return (
          <g key={t}>
            <line x1={CHART_PAD.left} y1={y} x2={CHART_W - CHART_PAD.right} y2={y} stroke="#ffffff10" strokeDasharray="4 4" />
            <text x={CHART_PAD.left - 6} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{t.toLocaleString()}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${dataKey})`} />
      <path d={toPath(points)} fill="none" stroke={color} strokeWidth={2} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill={color} />
          <text x={p.x} y={CHART_PAD.top + innerH + 16} textAnchor="middle" fill="#94a3b8" fontSize="10">
            {fmtDate(data[i].date)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function BarChartSVG({ data, dataKey, color, label }: { data: any[]; dataKey: string; color: string; label: string }) {
  const innerW = CHART_W - CHART_PAD.left - CHART_PAD.right;
  const innerH = CHART_H - CHART_PAD.top - CHART_PAD.bottom;
  const values = data.map(d => (d[dataKey] as number) ?? 0);
  const max = Math.max(...values, 1);
  const gap = data.length > 0 ? innerW / data.length : 20;
  const barW = gap * 0.6;
  const ticks = [0, Math.round(max / 2), max];

  if (data.length === 0) {
    return (
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" role="img" aria-label={label}>
        <text x={CHART_W / 2} y={CHART_H / 2} textAnchor="middle" fill="#94a3b8" fontSize="13">데이터 없음</text>
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}>
      {ticks.map(t => {
        const y = CHART_PAD.top + innerH - (t / max) * innerH;
        return (
          <g key={t}>
            <line x1={CHART_PAD.left} y1={y} x2={CHART_W - CHART_PAD.right} y2={y} stroke="#ffffff10" strokeDasharray="4 4" />
            <text x={CHART_PAD.left - 6} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{t.toLocaleString()}</text>
          </g>
        );
      })}
      {values.map((v, i) => {
        const h = (v / max) * innerH;
        const x = CHART_PAD.left + i * gap + (gap - barW) / 2;
        const y = CHART_PAD.top + innerH - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={3} fill={color} opacity={0.85} />
            <text x={x + barW / 2} y={CHART_PAD.top + innerH + 16} textAnchor="middle" fill="#94a3b8" fontSize="10">
              {fmtDate(data[i].date)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChartSVG({ data, dataKey, color, label }: { data: any[]; dataKey: string; color: string; label: string }) {
  const innerW = CHART_W - CHART_PAD.left - CHART_PAD.right;
  const innerH = CHART_H - CHART_PAD.top - CHART_PAD.bottom;
  const values = data.map(d => (d[dataKey] as number) ?? 0);
  const max = Math.max(...values, 1);
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;

  const points = values.map((v, i) => ({
    x: CHART_PAD.left + i * step,
    y: CHART_PAD.top + innerH - (v / max) * innerH,
  }));

  const ticks = [0, Math.round(max / 2), max];

  if (points.length === 0) {
    return (
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" role="img" aria-label={label}>
        <text x={CHART_W / 2} y={CHART_H / 2} textAnchor="middle" fill="#94a3b8" fontSize="13">데이터 없음</text>
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}>
      {ticks.map(t => {
        const y = CHART_PAD.top + innerH - (t / max) * innerH;
        return (
          <g key={t}>
            <line x1={CHART_PAD.left} y1={y} x2={CHART_W - CHART_PAD.right} y2={y} stroke="#ffffff10" strokeDasharray="4 4" />
            <text x={CHART_PAD.left - 6} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{t.toLocaleString()}</text>
          </g>
        );
      })}
      <path d={toPath(points)} fill="none" stroke={color} strokeWidth={2} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill={color} />
          <text x={p.x} y={CHART_PAD.top + innerH + 16} textAnchor="middle" fill="#94a3b8" fontSize="10">
            {fmtDate(data[i].date)}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="h-[160px] bg-slate-800/30 rounded-lg animate-pulse flex items-end justify-around px-12 pb-8 gap-2">
      {[40, 65, 50, 80, 60, 75, 55].map((h, i) => (
        <div key={i} className="bg-slate-700/40 rounded-t" style={{ width: '10%', height: `${h}%` }} />
      ))}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────

const dashboardFetcher = () => getDashboard();

export default function Usage() {
  const { data, isLoading, isValidating } = useSWR<DashboardData>('dashboard', dashboardFetcher);

  const dailyData = data?.recentUsage ?? [];
  const totalRequests = data?.totalRequests ?? 0;

  const todayRequests = dailyData.length > 0 ? dailyData[dailyData.length - 1]?.requests || 0 : 0;
  const todayTokens = dailyData.length > 0 ? dailyData[dailyData.length - 1]?.tokens || 0 : 0;
  const avgResponseTime = useMemo(() => {
    if (dailyData.length === 0) return 0;
    return Math.round(dailyData.reduce((sum, d) => sum + d.responseTime, 0) / dailyData.length);
  }, [dailyData]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">사용량 통계</h1>
            <p className="text-slate-400">API 사용량과 성능 지표를 분석하세요</p>
          </div>
          {isValidating && !isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              갱신 중
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">오늘 요청 수</CardTitle>
              <Activity className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{todayRequests.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">오늘</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">평균 응답 시간</CardTitle>
              <Clock className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{avgResponseTime}ms</div>
              <p className="text-xs text-slate-500 mt-1">최근 7일 평균</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-600/20 to-green-600/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">총 토큰 사용량</CardTitle>
              <Zap className="size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{todayTokens > 1000 ? `${(todayTokens / 1000).toFixed(1)}K` : todayTokens}</div>
              <p className="text-xs text-slate-500 mt-1">오늘</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-600/20 to-orange-600/5 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">총 요청 수</CardTitle>
              <Activity className="size-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalRequests.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">누적</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">전체 현황</TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">성능 분석</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">일별 API 요청 추이</CardTitle>
                <CardDescription>최근 7일간의 요청 수</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? <ChartSkeleton /> : (
                  <AreaChartSVG data={dailyData} dataKey="requests" color="#3b82f6" label="일별 API 요청" />
                )}
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">토큰 사용량 추이</CardTitle>
                <CardDescription>일별 토큰 소비 현황</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? <ChartSkeleton /> : (
                  <BarChartSVG data={dailyData} dataKey="tokens" color="#8b5cf6" label="토큰 사용량" />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">응답 시간 추이</CardTitle>
                <CardDescription>일별 평균 응답 시간 (밀리초)</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? <ChartSkeleton /> : (
                  <LineChartSVG data={dailyData} dataKey="responseTime" color="#f59e0b" label="응답 시간" />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
