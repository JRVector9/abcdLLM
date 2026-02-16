import { Activity, BookOpen, Code, ShieldCheck, Terminal, Zap, Workflow } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ApiKeyEntry } from '../../types';

const MODELS = [
  { name: 'qwen3:8b', desc: 'Qwen3 8B - 빠른 범용 모델' },
  { name: 'qwen2.5:32b', desc: 'Qwen2.5 32B - 고품질 응답' },
  { name: 'gemma3:27b', desc: 'Gemma3 27B - 균형잡힌 성능' },
  { name: 'exaone3.5:7.8b', desc: 'EXAONE 3.5 - 한국어 특화' },
];

interface Props {
  keys: ApiKeyEntry[];
}

export default function ApiKeysDocsTab({ keys }: Props) {
  const totalDailyReq = keys.reduce((s, k) => s + k.dailyRequests, 0);
  const usedReq = keys.reduce((s, k) => s + (k.usedRequests ?? 0), 0);
  const totalDailyTokens = keys.reduce((s, k) => s + k.dailyTokens, 0);
  const usedTokens = keys.reduce((s, k) => s + (k.usedTokens ?? 0), 0);
  const totalTokensCap = keys.reduce((s, k) => s + k.totalTokens, 0);
  const totalUsed = keys.reduce((s, k) => s + (k.totalUsedTokens ?? 0), 0);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-400" />
              API Endpoints
            </CardTitle>
            <CardDescription>OpenAI-compatible endpoints for SDK and tools.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10">
              <code className="text-sm text-white font-mono">POST /v1/chat/completions</code>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10">
              <code className="text-sm text-white font-mono">GET /v1/models</code>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10">
              <code className="text-sm text-white font-mono">GET /api/v1/health</code>
            </div>
            <div className="mt-4 p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-blue-300">
                <strong>Base URL:</strong>{' '}
                <code className="bg-slate-950 px-1.5 py-0.5 rounded text-blue-200">https://abcdllm-api.brut.bot</code>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Terminal className="w-6 h-6 text-blue-400" />
              Integration Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-slate-200 font-bold mb-3">Authentication Header</h4>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm text-slate-300">
                Authorization: Bearer sk-abcd-YOUR_KEY
              </div>
            </div>
            <div>
              <h4 className="text-slate-200 font-bold mb-3">cURL Example</h4>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                <pre className="text-blue-400">{`curl https://abcdllm-api.brut.bot/v1/chat/completions \\
  -H "Authorization: Bearer sk-abcd-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"qwen3:8b","messages":[{"role":"user","content":"Hello!"}]}'`}</pre>
              </div>
            </div>
            <div>
              <h4 className="text-slate-200 font-bold mb-3">Python (OpenAI SDK)</h4>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                <pre className="text-emerald-400">{`from openai import OpenAI

client = OpenAI(
    api_key="sk-abcd-YOUR_KEY",
    base_url="https://abcdllm-api.brut.bot/v1",
)

response = client.chat.completions.create(
    model="qwen3:8b",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-400" />
              Available Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {MODELS.map((model) => (
                <div key={model.name} className="bg-slate-950/50 p-3 rounded-lg border border-white/10">
                  <code className="text-xs text-blue-400 font-mono">{model.name}</code>
                  <p className="text-[10px] text-slate-500 mt-1">{model.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-blue-950/20 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              Error Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex justify-between items-start">
              <span className="font-mono text-blue-400 shrink-0 w-12">401</span>
              <span className="text-slate-400 text-right">Invalid API key.</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-mono text-rose-400 shrink-0 w-12">429</span>
              <span className="text-slate-400 text-right">Rate limit reached.</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-mono text-orange-400 shrink-0 w-12">502</span>
              <span className="text-slate-400 text-right">Ollama server unavailable.</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              My Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Daily Requests</span>
              <span className="text-white font-semibold">{usedReq.toLocaleString()} / {totalDailyReq.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Daily Tokens</span>
              <span className="text-white font-semibold">{usedTokens.toLocaleString()} / {totalDailyTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Cap</span>
              <span className="text-emerald-400 font-semibold">{totalUsed.toLocaleString()} / {totalTokensCap.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a0a2e]/50 to-slate-900/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Workflow className="w-5 h-5 text-[#ff6d5a]" />
              n8n 연동 가이드
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-300">
            <div className="space-y-2">
              <p className="text-slate-200 font-semibold">1. Credentials 생성</p>
              <p>Credentials &rarr; <code className="text-purple-300">OpenAi API</code> 선택</p>
              <p>API Key: <code className="text-purple-300">sk-abcd-YOUR_KEY</code></p>
              <p>Base URL: <code className="text-purple-300">https://abcdllm-api.brut.bot/v1</code></p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-200 font-semibold">2. 노드 설정</p>
              <p><code className="text-purple-300">OpenAI Chat Model</code> 또는 <code className="text-purple-300">AI Agent</code> 노드 추가</p>
              <p>Model: <code className="text-purple-300">qwen3:8b</code> 등 입력</p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-200 font-semibold">3. 주의사항</p>
              <p>- 모델명은 Available Models 목록 참고</p>
              <p>- streaming은 지원되지 않습니다</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
