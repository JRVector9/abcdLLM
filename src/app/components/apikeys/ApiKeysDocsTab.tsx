import { Activity, BookOpen, Code, ShieldCheck, Terminal, Workflow, Globe, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ApiKeyEntry } from '../../types';

const MODELS = [
  { name: 'qwen3:8b', desc: 'Alibaba Qwen3 8B', detail: '빠른 추론, 코딩/수학 강점, 다국어 지원', vision: false },
  { name: 'qwen2.5:32b', desc: 'Alibaba Qwen2.5 32B', detail: '고품질 텍스트 생성, 복잡한 추론에 최적', vision: false },
  { name: 'gemma3:27b', desc: 'Google Gemma3 27B', detail: '균형잡힌 성능, 이미지+텍스트 멀티모달 지원', vision: true },
  { name: 'exaone3.5:7.8b', desc: 'LG EXAONE 3.5 7.8B', detail: '한국어 특화, 한/영 이중언어 최적화', vision: false },
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
    <div className="space-y-8">
      {/* Top row: Endpoints + My Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
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
        </div>

        <div className="space-y-6">
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
        </div>
      </div>

      {/* Integration Guide - Full width */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-blue-400" />
            Integration Guide
          </CardTitle>
          <CardDescription>다양한 방법으로 abcdLLM API를 연동할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-slate-200 font-bold">Authentication Header</h4>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm text-slate-300">
                Authorization: Bearer sk-abcd-YOUR_KEY
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-slate-200 font-bold">cURL</h4>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                <pre className="text-blue-400">{`curl https://abcdllm-api.brut.bot/v1/chat/completions \\
  -H "Authorization: Bearer sk-abcd-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"qwen3:8b","messages":[{"role":"user","content":"Hello!"}]}'`}</pre>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-slate-200 font-bold">Python (OpenAI SDK)</h4>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                <pre className="text-emerald-400">{`from openai import OpenAI

client = OpenAI(
    api_key="sk-abcd-YOUR_KEY",
    base_url="https://abcdllm-api.brut.bot/v1",
)

resp = client.chat.completions.create(
    model="qwen3:8b",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(resp.choices[0].message.content)`}</pre>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-slate-200 font-bold">Python (requests)</h4>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                <pre className="text-amber-400">{`import requests

resp = requests.post(
    "https://abcdllm-api.brut.bot/v1/chat/completions",
    headers={"Authorization": "Bearer sk-abcd-YOUR_KEY"},
    json={
        "model": "qwen3:8b",
        "messages": [{"role": "user", "content": "Hello!"}],
    },
)
print(resp.json()["choices"][0]["message"]["content"])`}</pre>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-slate-200 font-bold">JavaScript / TypeScript (fetch)</h4>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                <pre className="text-cyan-400">{`const res = await fetch(
  "https://abcdllm-api.brut.bot/v1/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer sk-abcd-YOUR_KEY",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen3:8b",
      messages: [{ role: "user", content: "Hello!" }],
    }),
  }
);
const data = await res.json();
console.log(data.choices[0].message.content);`}</pre>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-slate-200 font-bold">LangChain (Python)</h4>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                <pre className="text-rose-400">{`from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="qwen3:8b",
    api_key="sk-abcd-YOUR_KEY",
    base_url="https://abcdllm-api.brut.bot/v1",
)

response = llm.invoke("Hello!")
print(response.content)`}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* n8n Guide - Full width main section */}
      <Card className="bg-gradient-to-br from-[#1a0a2e]/50 to-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Workflow className="w-6 h-6 text-[#ff6d5a]" />
            n8n 연동 가이드
          </CardTitle>
          <CardDescription>n8n 워크플로우에서 abcdLLM을 AI 노드로 사용하는 방법</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 bg-slate-950/30 p-5 rounded-xl border border-white/10">
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 font-bold">1</div>
              <h4 className="text-slate-200 font-semibold">Credentials 생성</h4>
              <div className="text-xs text-slate-400 space-y-1.5">
                <p>Settings &rarr; Credentials &rarr; Add Credential</p>
                <p>Type: <code className="text-purple-300">OpenAi API</code></p>
                <p>API Key: <code className="text-purple-300">sk-abcd-YOUR_KEY</code></p>
                <p>Base URL: <code className="text-purple-300">https://abcdllm-api.brut.bot/v1</code></p>
              </div>
            </div>
            <div className="space-y-3 bg-slate-950/30 p-5 rounded-xl border border-white/10">
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 font-bold">2</div>
              <h4 className="text-slate-200 font-semibold">노드 설정</h4>
              <div className="text-xs text-slate-400 space-y-1.5">
                <p><code className="text-purple-300">OpenAI Chat Model</code> 노드 추가</p>
                <p>또는 <code className="text-purple-300">AI Agent</code> 노드의 LLM으로 연결</p>
                <p>Model: <code className="text-purple-300">qwen3:8b</code> 등 직접 입력</p>
                <p>Credential: 위에서 만든 것 선택</p>
              </div>
            </div>
            <div className="space-y-3 bg-slate-950/30 p-5 rounded-xl border border-white/10">
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 font-bold">3</div>
              <h4 className="text-slate-200 font-semibold">HTTP Request 방식</h4>
              <div className="text-xs text-slate-400 space-y-1.5">
                <p>OpenAI 노드 대신 <code className="text-purple-300">HTTP Request</code> 노드 사용 가능</p>
                <p>Method: POST</p>
                <p>URL: <code className="text-purple-300">https://abcdllm-api.brut.bot/v1/chat/completions</code></p>
                <p>Header: <code className="text-purple-300">Authorization: Bearer sk-abcd-...</code></p>
                <p>Body: OpenAI 형식 JSON</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl">
            <p className="text-xs text-amber-300">
              <strong>주의:</strong> streaming은 지원되지 않습니다. 모델명은 Available Models 목록을 참고하세요.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available Models - Full width */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Available Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {MODELS.map((model) => (
              <div key={model.name} className="bg-slate-950/50 p-4 rounded-lg border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-blue-400 font-mono font-bold">{model.name}</code>
                  {model.vision && (
                    <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20">
                      <Image className="w-3 h-3" />
                      Vision
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 font-medium">{model.desc}</p>
                <p className="text-[11px] text-slate-500">{model.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
