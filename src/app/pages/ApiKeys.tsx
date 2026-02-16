import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Calendar,
  Activity,
  Check,
  Info,
  ShieldCheck,
  BookOpen,
  Terminal,
  Code,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiKeyEntry } from '../types';
import { getKeys, createKey, deleteKey as apiDeleteKey, revealKey } from '../services/apiService';

export default function ApiKeys() {
  const [keys, setKeys] = useState<(ApiKeyEntry & { plainKey?: string })[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    dailyRequests: 100,
    dailyTokens: 2000,
    totalTokens: 5000
  });

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const data = await getKeys();
      setKeys(data);
    } catch {
      toast.error('API 키 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyVisibility = async (keyId: string) => {
    const isCurrentlyVisible = showKeys[keyId];

    if (!isCurrentlyVisible) {
      // Showing the key - fetch full key from backend
      try {
        const { key: fullKey } = await revealKey(keyId);
        // Update the key in state with the full key
        setKeys(prevKeys =>
          prevKeys.map(k =>
            k.id === keyId ? { ...k, plainKey: fullKey } : k
          )
        );
        setShowKeys(prev => ({ ...prev, [keyId]: true }));
      } catch (error) {
        toast.error('전체 키를 불러올 수 없습니다');
      }
    } else {
      // Hiding the key - just toggle visibility
      setShowKeys(prev => ({ ...prev, [keyId]: false }));
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createKey({
        name: newKeyForm.name || 'My API Key',
        dailyRequests: newKeyForm.dailyRequests,
        dailyTokens: newKeyForm.dailyTokens,
        totalTokens: newKeyForm.totalTokens,
      });
      setKeys([result, ...keys]);
      setIsCreating(false);
      setNewKeyForm({ name: '', dailyRequests: 100, dailyTokens: 2000, totalTokens: 5000 });
      toast.success('새 API 키가 생성되었습니다');
      if (result.plainKey) {
        toast.info('생성된 키를 안전하게 보관하세요. 다시 확인할 수 없습니다.');
      }
    } catch {
      toast.error('API 키 생성 실패');
    }
  };

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    toast.success('API 키가 클립보드에 복사되었습니다');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteKey = async (id: string) => {
    if (window.confirm('Are you sure you want to revoke this API key?')) {
      try {
        await apiDeleteKey(id);
        setKeys(keys.filter(k => k.id !== id));
        toast.success('API 키가 삭제되었습니다');
      } catch {
        toast.error('API 키 삭제 실패');
      }
    }
  };

  const maskKey = (key: string) => {
    if (key.length < 12) return key;
    return `${key.substring(0, 8)}${'•'.repeat(12)}${key.substring(key.length - 4)}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header with dual view toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">API Key Management</h1>
            <p className="text-slate-400">Generate, configure, and integrate your access keys.</p>
          </div>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-white/10">
            <TabsTrigger value="keys" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Key className="w-4 h-4 mr-2" />
              Active Keys
            </TabsTrigger>
            <TabsTrigger value="docs" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Usage Guide
            </TabsTrigger>
          </TabsList>

          {/* Active Keys Tab */}
          <TabsContent value="keys" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">총 API 키</CardTitle>
                  <Key className="size-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{keys.length}</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">총 API 요청</CardTitle>
                  <Activity className="size-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {keys.reduce((sum, k) => sum + k.dailyRequests, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">가장 최근 사용</CardTitle>
                  <Calendar className="size-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {keys.length > 0 ? keys[0].createdAt : '-'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create button or form */}
            {!isCreating ? (
              <div className="flex justify-end">
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="size-4 mr-2" />
                  Create New Key
                </Button>
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-400" />
                    New API Key Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateKey} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-200">Key Name</Label>
                          <Input
                            required
                            placeholder="e.g. Mobile App Dev"
                            className="bg-white/5 border-white/10 text-white"
                            value={newKeyForm.name}
                            onChange={e => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                          />
                        </div>
                        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex gap-3">
                          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-200/80 leading-relaxed">
                            Default limits: <span className="text-amber-400 font-bold">100 requests</span> and <span className="text-amber-400 font-bold">2,000 tokens</span> per day.
                            Maximum total usage is capped at <span className="text-amber-400 font-bold">5,000 tokens</span>.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <Label className="text-slate-200">Daily Requests</Label>
                            <span className="text-blue-400 font-mono font-bold">{newKeyForm.dailyRequests}</span>
                          </div>
                          <input
                            type="range" min="10" max="100" step="10"
                            className="w-full accent-blue-500 h-1.5 bg-slate-900 rounded-full appearance-none cursor-pointer"
                            value={newKeyForm.dailyRequests}
                            onChange={e => setNewKeyForm({ ...newKeyForm, dailyRequests: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <Label className="text-slate-200">Daily Token Limit</Label>
                            <span className="text-blue-400 font-mono font-bold">{newKeyForm.dailyTokens.toLocaleString()}</span>
                          </div>
                          <input
                            type="range" min="500" max="2000" step="100"
                            className="w-full accent-blue-500 h-1.5 bg-slate-900 rounded-full appearance-none cursor-pointer"
                            value={newKeyForm.dailyTokens}
                            onChange={e => setNewKeyForm({ ...newKeyForm, dailyTokens: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <Label className="text-slate-200">Total Quota (Hard Cap)</Label>
                            <span className="text-emerald-400 font-mono font-bold">{newKeyForm.totalTokens.toLocaleString()}</span>
                          </div>
                          <input
                            type="range" min="1000" max="5000" step="500"
                            className="w-full accent-emerald-500 h-1.5 bg-slate-900 rounded-full appearance-none cursor-pointer"
                            value={newKeyForm.totalTokens}
                            onChange={e => setNewKeyForm({ ...newKeyForm, totalTokens: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Generate Key
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Key List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-slate-400">Loading...</div>
              ) : keys.length === 0 ? (
                <div className="text-center py-12 text-slate-400">API 키가 없습니다. 새 키를 생성하세요.</div>
              ) : (
                keys.map(k => (
                  <Card key={k.id} className="bg-slate-900/50 border-white/10 hover:border-white/20 transition">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                              <Key className="size-5 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-white">{k.name}</h4>
                              <p className="text-xs text-slate-500">Created on {k.createdAt}</p>
                            </div>
                          </div>
                          <div className="bg-slate-950/50 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                              <code className="text-sm text-slate-300 font-mono truncate pr-4">
                                {showKeys[k.id] ? (k.plainKey || k.key) : maskKey(k.plainKey || k.key)}
                              </code>
                              <div className="flex items-center gap-2 shrink-0">
                                <Button size="sm" variant="ghost" onClick={() => toggleKeyVisibility(k.id)} className="text-slate-400 hover:text-white">
                                  {showKeys[k.id] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(k.plainKey || k.key, k.id)} className="text-slate-400 hover:text-white">
                                  {copiedId === k.id ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:items-end justify-between min-w-[180px]">
                          <div className="grid grid-cols-3 md:flex md:flex-col gap-4 text-right">
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Daily Req</div>
                              <div className="text-sm font-bold text-white">{k.dailyRequests}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Daily Tokens</div>
                              <div className="text-sm font-bold text-white">{k.dailyTokens.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total Limit</div>
                              <div className="text-sm font-bold text-emerald-400">{k.totalTokens.toLocaleString()}</div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteKey(k.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-4">
                            <Trash2 className="size-4 mr-2" />
                            삭제
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Usage Guide Tab */}
          <TabsContent value="docs" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Endpoints Reference */}
                <Card className="bg-slate-900/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-6 h-6 text-emerald-400" />
                      API Endpoints
                    </CardTitle>
                    <CardDescription>OpenAI 호환 형식 — 기존 OpenAI SDK, LangChain, n8n 등에서 base_url만 변경하면 사용 가능</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-emerald-600/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">POST</span>
                          <code className="text-sm text-white font-mono">/v1/chat/completions</code>
                        </div>
                        <p className="text-xs text-slate-400">채팅 완성 — OpenAI 호환 응답 형식</p>
                      </div>
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded">GET</span>
                          <code className="text-sm text-white font-mono">/v1/models</code>
                        </div>
                        <p className="text-xs text-slate-400">사용 가능한 모델 목록 조회</p>
                      </div>
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-emerald-600/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">POST</span>
                          <code className="text-sm text-white font-mono">/api/v1/chat</code>
                        </div>
                        <p className="text-xs text-slate-400">채팅 (Ollama 네이티브 응답 형식)</p>
                      </div>
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded">GET</span>
                          <code className="text-sm text-white font-mono">/api/v1/health</code>
                        </div>
                        <p className="text-xs text-slate-400">Ollama 서버 상태 확인</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl">
                      <p className="text-xs text-blue-300">
                        <strong>Base URL:</strong>{' '}
                        <code className="bg-slate-950 px-1.5 py-0.5 rounded text-blue-200">https://abcdllm-api.brut.bot</code>
                      </p>
                    </div>

                    {/* Available Models */}
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Available Models</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: 'qwen3:8b', desc: 'Qwen3 8B — 빠른 추론, 범용' },
                          { name: 'qwen2.5:32b', desc: 'Qwen2.5 32B — 고품질 응답' },
                          { name: 'gemma2:27b', desc: 'Gemma2 27B — Google 오픈모델' },
                          { name: 'exaone3.5:7.8b', desc: 'EXAONE 3.5 — 한국어 특화' },
                          { name: 'llama3.1:8b', desc: 'Llama 3.1 8B — 경량 범용' },
                          { name: 'llama3.1:70b', desc: 'Llama 3.1 70B — 대형 모델' },
                        ].map(m => (
                          <div key={m.name} className="bg-slate-950/50 p-3 rounded-lg border border-white/10">
                            <code className="text-xs text-blue-400 font-mono">{m.name}</code>
                            <p className="text-[10px] text-slate-500 mt-1">{m.desc}</p>
                          </div>
                        ))}
                      </div>
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
                      <h4 className="text-slate-200 font-bold mb-3">Authentication</h4>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        모든 API 요청에 <code className="bg-slate-950 text-blue-300 px-1.5 py-0.5 rounded">Authorization</code> 헤더로 API 키를 포함하세요.
                      </p>
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm text-slate-300">
                        <span className="text-slate-500"># Header format</span><br />
                        Authorization: Bearer sk-abcd-YOUR_KEY_HERE
                      </div>
                    </div>

                    <div>
                      <h4 className="text-slate-200 font-bold mb-3">cURL</h4>
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                        <pre className="text-blue-400">
{`curl https://abcdllm-api.brut.bot/v1/chat/completions \\
  -H "Authorization: Bearer sk-abcd-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen3:8b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-slate-200 font-bold mb-3">Python (OpenAI SDK)</h4>
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                        <pre className="text-emerald-400">
{`from openai import OpenAI

client = OpenAI(
    api_key="sk-abcd-YOUR_KEY",
    base_url="https://abcdllm-api.brut.bot/v1"
)

res = client.chat.completions.create(
    model="qwen3:8b",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(res.choices[0].message.content)`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-slate-200 font-bold mb-3">JavaScript (fetch)</h4>
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                        <pre className="text-amber-400">
{`const res = await fetch(
  "https://abcdllm-api.brut.bot/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer sk-abcd-YOUR_KEY",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen3:8b",
      messages: [{ role: "user", content: "Hello!" }],
    }),
  }
);
const data = await res.json();
console.log(data.choices[0].message.content);`}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* n8n Integration Guide */}
                <Card className="bg-gradient-to-br from-[#1a0a2e]/50 to-slate-900/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-6 h-6 text-[#ff6d5a]" />
                      n8n Integration
                    </CardTitle>
                    <CardDescription>n8n 워크플로우에서 abcdLLM을 사용하는 방법</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-slate-200 font-bold mb-3">방법 1: OpenAI Chat Model 노드 (추천)</h4>
                      <p className="text-slate-400 text-sm mb-3">
                        n8n의 <code className="bg-slate-950 text-purple-300 px-1.5 py-0.5 rounded">OpenAI Chat Model</code> 노드를 그대로 사용할 수 있습니다.
                      </p>
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="bg-purple-600/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded shrink-0">1</span>
                          <div>
                            <p className="text-white font-medium">Credentials 설정</p>
                            <p className="text-slate-400 text-xs mt-1">
                              OpenAI API Credential 생성 → API Key에 <code className="text-purple-300">sk-abcd-YOUR_KEY</code> 입력
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-purple-600/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded shrink-0">2</span>
                          <div>
                            <p className="text-white font-medium">Base URL 변경</p>
                            <p className="text-slate-400 text-xs mt-1">
                              Credential 편집 → <strong>Override Base URL</strong> 체크 →{' '}
                              <code className="text-purple-300">https://abcdllm-api.brut.bot/v1</code> 입력
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-purple-600/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded shrink-0">3</span>
                          <div>
                            <p className="text-white font-medium">모델 지정</p>
                            <p className="text-slate-400 text-xs mt-1">
                              Model 필드에 <code className="text-purple-300">qwen3:8b</code> 등 사용할 모델명 직접 입력
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-slate-200 font-bold mb-3">방법 2: HTTP Request 노드</h4>
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                        <pre className="text-[#ff6d5a]">
{`// HTTP Request 노드 설정
Method: POST
URL: https://abcdllm-api.brut.bot/v1/chat/completions

// Headers
Authorization: Bearer sk-abcd-YOUR_KEY
Content-Type: application/json

// Body (JSON)
{
  "model": "qwen3:8b",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "{{ $json.input }}"
    }
  ]
}

// 응답에서 텍스트 추출
{{ $json.choices[0].message.content }}`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-slate-200 font-bold mb-3">방법 3: Ollama Chat Model 노드</h4>
                      <p className="text-slate-400 text-sm mb-3">
                        n8n의 <code className="bg-slate-950 text-purple-300 px-1.5 py-0.5 rounded">Ollama Chat Model</code> 노드는 API Key 필드가 없으므로,
                        Base URL에 키를 포함하는 방식으로 설정합니다.
                      </p>
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="bg-orange-600/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded shrink-0">1</span>
                          <div>
                            <p className="text-white font-medium">Ollama API Credential 생성</p>
                            <p className="text-slate-400 text-xs mt-1">
                              n8n → Credentials → New → <strong>Ollama API</strong> 선택
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-orange-600/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded shrink-0">2</span>
                          <div>
                            <p className="text-white font-medium">Base URL 설정</p>
                            <p className="text-slate-400 text-xs mt-1">
                              Base URL에 입력:{' '}
                              <code className="text-orange-300">https://abcdllm-api.brut.bot/api/v1</code>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-orange-600/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded shrink-0">3</span>
                          <div>
                            <p className="text-white font-medium">Ollama Chat Model 노드 설정</p>
                            <p className="text-slate-400 text-xs mt-1">
                              Model 필드에 <code className="text-orange-300">qwen3:8b</code> 등 모델명 입력
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-red-950/30 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-300">
                          <strong>주의:</strong> Ollama 노드는 API Key 인증을 지원하지 않습니다.
                          인증이 필요한 경우 <strong>OpenAI Chat Model 노드</strong>(방법 1)를 사용하세요.
                          Ollama 노드는 내부 네트워크 등 인증 없이 접근 가능한 환경에서만 사용할 수 있습니다.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl">
                      <p className="text-xs text-amber-300">
                        <strong>Tip:</strong> AI Agent 노드에서도 OpenAI Chat Model을 Sub-Node로 연결하면 동일하게 사용 가능합니다.
                        Tool 호출, 메모리 등 n8n AI 기능을 모두 활용할 수 있습니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      Rate Limits & Constraints
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Frequency</div>
                        <div className="text-lg font-bold text-white">100 Req / Day</div>
                        <p className="text-[10px] text-slate-500 mt-2 italic">Standard Tier limit per key.</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Throughput</div>
                        <div className="text-lg font-bold text-white">2,000 Tokens</div>
                        <p className="text-[10px] text-slate-500 mt-2 italic">Daily rolling window reset.</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Account Cap</div>
                        <div className="text-lg font-bold text-rose-400">5,000 Tokens</div>
                        <p className="text-[10px] text-slate-500 mt-2 italic">Total lifetime usage cap.</p>
                      </div>
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
                      <span className="text-slate-400 text-right">Invalid API key or authorization header missing.</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-rose-400 shrink-0 w-12">429</span>
                      <span className="text-slate-400 text-right">Daily request or token limit reached. Try again in 24h.</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-amber-400 shrink-0 w-12">403</span>
                      <span className="text-slate-400 text-right">Forbidden. User IP is not whitelisted.</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-orange-400 shrink-0 w-12">502</span>
                      <span className="text-slate-400 text-right">Ollama server is unreachable.</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Response Format */}
                <Card className="bg-slate-900/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Response Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-white/10 font-mono text-[11px] overflow-x-auto">
                      <pre className="text-slate-300">
{`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "qwen3:8b",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "응답 내용"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 19,
    "completion_tokens": 50,
    "total_tokens": 69
  }
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      문의사항은 관리자에게 연락하세요.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
