import { lazy, Suspense, useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiKeyEntry } from '../types';
import { getKeys, createKey, deleteKey as apiDeleteKey, revealKey } from '../services/apiService';

const ApiKeysDocsTab = lazy(() => import('../components/apikeys/ApiKeysDocsTab'));

export default function ApiKeys() {
  const [keys, setKeys] = useState<(ApiKeyEntry & { plainKey?: string })[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('keys');

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

          <TabsContent value="docs" className="space-y-8">
            {activeTab === 'docs' ? (
              <Suspense fallback={<div className="text-center py-12 text-slate-400">문서 로딩 중...</div>}>
                <ApiKeysDocsTab />
              </Suspense>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
