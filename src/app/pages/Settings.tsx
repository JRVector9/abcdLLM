import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import {
  Copy,
  RefreshCw,
  Shield,
  Globe,
  Bell,
  User as UserIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { User } from '../types';

export default function Settings() {
  const stored = localStorage.getItem('user');
  const user: User | null = stored ? JSON.parse(stored) : null;

  const [copied, setCopied] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [detailedLogging, setDetailedLogging] = useState(false);

  const copyKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopied(true);
      toast.success('API 키가 복사되었습니다');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-slate-400">Manage your profile, security, and API configuration.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* API Security */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  API Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Active API Key</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-slate-300">
                      {user?.apiKey || 'No key available'}
                    </div>
                    <Button
                      onClick={copyKey}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 min-w-[3rem]"
                    >
                      {copied ? <span className="text-xs text-green-400">Copied!</span> : <Copy className="w-5 h-5" />}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-red-900/40 hover:text-red-400"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Allowed Domains / IP Whitelist</label>
                  <Textarea
                    rows={2}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="e.g. 192.168.1.1, *.example.com"
                  />
                  <p className="mt-2 text-xs text-slate-500 italic">Leave empty to allow access from any origin (not recommended).</p>
                </div>
              </CardContent>
            </Card>

            {/* General Preferences */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  General Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-white">Automatic Model Updates</div>
                    <div className="text-xs text-slate-500">Keep models updated to the latest available version</div>
                  </div>
                  <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-white">Detailed Request Logging</div>
                    <div className="text-xs text-slate-500">Log all prompt and completion metadata (increases storage)</div>
                  </div>
                  <Switch checked={detailedLogging} onCheckedChange={setDetailedLogging} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Info Sidebar */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-white/10 text-center">
              <CardContent className="pt-6">
                <div className="w-24 h-24 rounded-full bg-blue-600 mx-auto flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-xl shadow-blue-600/20">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <h4 className="text-xl font-bold text-white">{user?.name || 'User'}</h4>
                <p className="text-slate-500 text-sm mb-6">{user?.email || ''}</p>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 space-y-4 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Plan</span>
                    <span className="text-blue-400 font-bold uppercase">Pro Tier</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Member Since</span>
                    <span className="text-slate-300">Oct 2023</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Billing Cycle</span>
                    <span className="text-slate-300">Monthly</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-white">
                    <input type="checkbox" className="mt-1 rounded border-white/20 bg-slate-700 text-blue-600" defaultChecked />
                    <span>Security alerts via email</span>
                  </li>
                  <li className="flex gap-3 text-sm text-white">
                    <input type="checkbox" className="mt-1 rounded border-white/20 bg-slate-700 text-blue-600" defaultChecked />
                    <span>Usage threshold warnings (80%)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
