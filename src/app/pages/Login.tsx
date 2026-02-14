import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Bot, Mail, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_USERS } from '../constants';
import { User, UserRole } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const found = MOCK_USERS.find(u => u.email === loginEmail);
      let user: User;

      if (found) {
        user = found;
      } else {
        user = {
          id: Math.random().toString(36).substr(2, 9),
          email: loginEmail,
          name: loginEmail.split('@')[0],
          role: UserRole.USER,
          apiKey: 'sk-new-' + Math.floor(Math.random() * 10000),
          usage: 150,
          dailyUsage: 50,
          dailyQuota: 5000,
          totalQuota: 50000,
          lastActive: 'Just now',
          ip: '127.0.0.1',
          status: 'active',
          accessCount: 1
        };
      }

      localStorage.setItem('user', JSON.stringify(user));
      toast.success('로그인 성공!');
      navigate('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: 'newuser@example.com',
        name: 'New User',
        role: UserRole.USER,
        apiKey: 'sk-new-' + Math.floor(Math.random() * 10000),
        usage: 0,
        dailyUsage: 0,
        dailyQuota: 5000,
        totalQuota: 50000,
        lastActive: 'Just now',
        ip: '127.0.0.1',
        status: 'active',
        accessCount: 0
      };
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('회원가입 성공!');
      navigate('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]"></div>

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Bot className="size-10 text-blue-500" />
          <span className="text-3xl font-bold text-white">abcdLLM</span>
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-8">
              <TabsTrigger value="login" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                로그인
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                회원가입
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    이메일
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    관리자 계정: admin@abcdllm.com
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">
                    비밀번호
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" className="rounded border-white/20" />
                    <span>로그인 상태 유지</span>
                  </label>
                  <a href="#" className="text-blue-400 hover:text-blue-300">
                    비밀번호 찾기
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-slate-200">
                    이름
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="홍길동"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-200">
                    이메일
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-200">
                    비밀번호
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="text-slate-200">
                    비밀번호 확인
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-slate-300">
                  <input type="checkbox" className="mt-1 rounded border-white/20" required />
                  <span>
                    <a href="#" className="text-blue-400 hover:text-blue-300">이용약관</a> 및{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300">개인정보처리방침</a>에 동의합니다.
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? '가입 중...' : '회원가입'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-slate-400 hover:text-slate-300 text-sm">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
