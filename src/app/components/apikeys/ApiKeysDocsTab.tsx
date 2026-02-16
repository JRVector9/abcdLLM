import { Activity, BookOpen, Code, ShieldCheck, Terminal, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const MODELS = [
  { name: 'qwen3:8b', desc: 'Qwen3 8B - fast general purpose' },
  { name: 'qwen2.5:32b', desc: 'Qwen2.5 32B - higher quality' },
  { name: 'gemma2:27b', desc: 'Gemma2 27B - balanced quality/speed' },
  { name: 'exaone3.5:7.8b', desc: 'EXAONE 3.5 - Korean optimized' },
];

export default function ApiKeysDocsTab() {
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
              Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300 space-y-2">
            <p>100 requests/day</p>
            <p>2,000 tokens/day</p>
            <p>5,000 total tokens cap</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a0a2e]/50 to-slate-900/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#ff6d5a]" />
              n8n Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-300">
              OpenAI Chat Model 노드에서 Base URL을
              <code className="text-purple-300"> https://abcdllm-api.brut.bot/v1</code> 로 설정하면 바로 연동됩니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
