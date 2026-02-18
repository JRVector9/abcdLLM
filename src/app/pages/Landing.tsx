import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Bot, Zap, Shield, Code, ArrowRight, Check } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="size-7 sm:size-8 text-blue-500" />
            <span className="text-xl sm:text-2xl font-bold text-white">abcdLLM</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:text-blue-400 text-sm sm:text-base px-3 sm:px-4">
                로그인
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-3 sm:px-4">
                시작하기
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          <div className="inline-block px-3 sm:px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="text-blue-400 text-xs sm:text-sm">로컬 Ollama를 외부 API로 연결</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
            오픈소스 LLM
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              편하게 이용하세요
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 px-2">
            Ollama 모델을 안전하고 빠르게 외부 API로 연결하고,
            <br className="hidden sm:block" />
            여러 LLM 모델을 쉽게 테스트할 수 있습니다.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-6 sm:px-8">
                무료로 시작하기 <ArrowRight className="ml-2 size-4 sm:size-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          <div className="p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="size-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">빠른 연결</h3>
            <p className="text-slate-400">
              로컬 Ollama 서버를 외부 API로 즉시 연결하고 어디서나 접근할 수 있습니다.
            </p>
          </div>

          <div className="p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="size-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">안전한 관리</h3>
            <p className="text-slate-400">
              개인 API 키로 보안을 유지하고 사용량을 실시간으로 모니터링할 수 있습니다.
            </p>
          </div>

          <div className="p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="size-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">쉬운 테스트</h3>
            <p className="text-slate-400">
              채팅 UI로 여러 LLM 모델을 간편하게 테스트하고 비교할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1737505599159-5ffc1dcbc08f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwbmV1cmFsJTIwbmV0d29ya3xlbnwxfHx8fDE3NzEwMTIzNzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="AI Neural Network"
            className="w-full h-48 sm:h-72 md:h-96 object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            왜 abcdLLM을 선택해야 할까요?
          </h2>
          <p className="text-base sm:text-xl text-slate-400">
            개발자를 위한 최고의 LLM API 솔루션
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          <div className="space-y-4">
            {[
              '무제한 API 요청',
              '실시간 사용량 모니터링',
              '다양한 Ollama 모델 지원',
              '빠른 응답 속도',
              '안전한 API 키 관리',
              '상세한 사용량 통계',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="size-4 text-green-500" />
                </div>
                <span className="text-slate-200">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              지금 바로 시작하세요
            </h3>
            <p className="text-slate-300 mb-6">
              회원가입 후 즉시 API 키를 발급받고,
              로컬 Ollama를 외부에서 사용할 수 있습니다.
            </p>
            <Link to="/login">
              <Button className="w-full bg-white text-blue-900 hover:bg-slate-100 font-bold text-lg py-6">
                무료로 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-lg mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="size-6 text-blue-500" />
              <span className="text-lg font-bold text-white">abcdLLM</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2026 abcdLLM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
