import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import {
  Bot,
  LayoutDashboard,
  Key,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  User as UserIcon,
  Menu,
  Shield,
  KeyRound,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { User, UserRole } from '../types';
import { clearAuth, getStoredUser, getMe } from '../services/apiService';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(getStoredUser());

  useEffect(() => {
    // Only verify auth on mount, not on every route change
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    getMe()
      .then((u) => {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
      })
      .catch(() => {
        // authFetch already handles real 401 (clears auth + hard redirect).
        // If we land here it's a non-auth error (502 / network).
        // Keep the stored user and don't log out.
      });
  }, []); // Empty dependency array - only run on mount

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === ('admin' as any);

  const handleLogout = () => {
    clearAuth();
    toast.success('로그아웃되었습니다');
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
    { path: '/api-keys', icon: Key, label: 'API 키 관리' },
    { path: '/playground', icon: MessageSquare, label: '모델 테스트' },
    { path: '/usage', icon: BarChart3, label: '사용량 통계' },
    { path: '/api-application', icon: KeyRound, label: 'API 신청' },
    { path: '/settings', icon: Settings, label: '설정' },
  ];

  const adminItems = [
    { path: '/admin', icon: Shield, label: '관리자' },
  ];

  const dailyPercentage = user ? Math.min(100, Math.round((user.dailyUsage / user.dailyQuota) * 100)) : 0;
  const totalPercentage = user ? Math.min(100, Math.round((user.usage / user.totalQuota) * 100)) : 0;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 border-r border-white/10 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <Bot className="size-8 text-blue-500 flex-shrink-0" />
            {isSidebarOpen && <span className="text-xl font-bold text-white">abcdLLM</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
            {isSidebarOpen ? 'Menu' : ''}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}>
                  <Icon className="size-5 flex-shrink-0" />
                  {isSidebarOpen && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                {isSidebarOpen ? 'Administration' : ''}
              </div>
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}>
                      <Icon className="size-5 flex-shrink-0" />
                      {isSidebarOpen && <span>{item.label}</span>}
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Live Quota Widget */}
        {user && isSidebarOpen && (
          <div className="mx-4 mb-4 p-4 bg-slate-950/50 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Quota</span>
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Daily Tokens</span>
                <span className={dailyPercentage > 80 ? 'text-rose-400' : 'text-slate-200'}>
                  {user.dailyUsage.toLocaleString()} / {user.dailyQuota.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${dailyPercentage > 80 ? 'bg-rose-500' : 'bg-blue-500'}`}
                  style={{ width: `${dailyPercentage}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Total Cap</span>
                <span className="text-slate-200">
                  {user.usage.toLocaleString()} / {user.totalQuota.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${totalPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Collapsed quota indicator */}
        {user && !isSidebarOpen && (
          <div className="mx-3 mb-4 flex flex-col items-center gap-1">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <div className="w-2 h-8 bg-slate-950 rounded-full overflow-hidden">
              <div
                className={`w-full transition-all duration-500 ${dailyPercentage > 80 ? 'bg-rose-500' : 'bg-blue-500'}`}
                style={{ height: `${dailyPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || <UserIcon className="size-5 text-white" />}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={`w-full text-slate-400 hover:text-white hover:bg-white/5 ${!isSidebarOpen && 'px-0 justify-center'}`}
          >
            <LogOut className="size-5" />
            {isSidebarOpen && <span className="ml-2">로그아웃</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-white"
          >
            <Menu className="size-5" />
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
