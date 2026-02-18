import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Send,
  CheckCircle2,
  Info,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { User, ModelInfo } from '../types';
import { createApplication, getStoredUser, listModels } from '../services/apiService';
import { MOCK_MODELS } from '../constants';

export default function ApiApplication() {
  const user: User | null = getStoredUser();

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>(MOCK_MODELS);
  const [formData, setFormData] = useState({
    projectName: '',
    useCase: '',
    estimatedDailyTokens: '50000',
    model: 'qwen3:8b'
  });

  useEffect(() => {
    listModels()
      .then(fetched => { if (fetched.length > 0) setModels(fetched); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createApplication({
        projectName: formData.projectName,
        useCase: formData.useCase,
        requestedQuota: parseInt(formData.estimatedDailyTokens),
        targetModel: formData.model,
      });
      setSubmitted(true);
      toast.success('신청이 완료되었습니다');
    } catch {
      toast.error('신청에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-20 text-center">
          <div className="bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Request Submitted!</h2>
          <p className="text-slate-400 mb-8">
            Our administrative team is reviewing your request for <span className="text-blue-400 font-semibold">{formData.projectName}</span>.
            You will receive an email notification within 24-48 hours.
          </p>
          <Button
            onClick={() => setSubmitted(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Back to Form
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">API Application Center</h1>
          <p className="text-slate-400">Apply for production API keys or request additional token allocations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-white/10">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-200">Project Name</Label>
                      <Input
                        required
                        placeholder="e.g. FinanceGPT"
                        className="bg-white/5 border-white/10 text-white"
                        value={formData.projectName}
                        onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-200">Target Model</Label>
                      <select
                        className="w-full bg-slate-900 border border-white/10 rounded-md px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.model}
                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                      >
                        {models.map(m => (
                          <option key={m.name} value={m.name}>
                            {m.name}{m.parameterCount ? ` (${m.parameterCount})` : ''}{m.size ? ` — ${m.size}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Requested Daily Limit (Tokens)</Label>
                    <input
                      type="range"
                      min="10000"
                      max="1000000"
                      step="10000"
                      className="w-full accent-blue-500 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                      value={formData.estimatedDailyTokens}
                      onChange={e => setFormData({ ...formData, estimatedDailyTokens: e.target.value })}
                    />
                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                      <span>10k</span>
                      <span className="text-blue-400 font-bold text-base">{parseInt(formData.estimatedDailyTokens).toLocaleString()}</span>
                      <span>1M+</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Detailed Use Case</Label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Explain how you will use the API, expected traffic patterns, and any specific safety considerations..."
                      className="bg-white/5 border-white/10 text-white"
                      value={formData.useCase}
                      onChange={e => setFormData({ ...formData, useCase: e.target.value })}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 flex items-center justify-center gap-2"
                  >
                    Submit Application
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-blue-950/20 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Approval Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold">01.</span>
                    Requests under 50k daily tokens are typically auto-approved within 1 hour.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold">02.</span>
                    Production use cases must describe their rate-limiting and safety filter logic.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold">03.</span>
                    Heavy local inference requests may require additional system verification.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-amber-950/20 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-200 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Existing Keys</span>
                    <span className="text-slate-200 font-medium">1 Active</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Available Quota</span>
                    <span className="text-emerald-400 font-medium">425k / Month</span>
                  </div>
                  <div className="pt-3 border-t border-amber-500/20">
                    <p className="text-xs text-amber-200/60 leading-relaxed italic">
                      Note: Requesting a quota above 1M tokens requires a direct interview with the infrastructure team.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
