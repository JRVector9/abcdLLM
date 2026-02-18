import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import {
  Send,
  Bot,
  User,
  Trash2,
  Settings,
  Sparkles,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Message, ModelInfo } from '../types';
import { MOCK_MODELS } from '../constants';
import { chatStream as apiChatStream, listModels as apiListModels, ollamaHealth as apiHealthCheck } from '../services/apiService';

type PlaygroundMessage = Message & { timestamp?: Date; isStreaming?: boolean };

export default function Playground() {
  const [messages, setMessages] = useState<PlaygroundMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('qwen3:8b');
  const [temperature, setTemperature] = useState([0.7]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>(MOCK_MODELS);
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    Promise.all([apiHealthCheck(), apiListModels()])
      .then(([healthy, fetched]) => {
        setOllamaOnline(healthy);
        if (fetched.length > 0) {
          setModels(fetched);
          const hasDefault = fetched.some(m => m.name === 'qwen3:8b');
          if (!hasDefault) setSelectedModel(fetched[0].name);
        }
      })
      .catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: PlaygroundMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // 스트리밍 응답을 받을 빈 assistant 메시지를 먼저 추가
    const assistantPlaceholder: PlaygroundMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantPlaceholder]);

    try {
      const chatMessages: Message[] = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // 쓰로틀링: 16ms(~60fps)마다 한 번씩만 렌더
      let pendingText = '';
      let rafScheduled = false;
      const flushText = () => {
        const t = pendingText;
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: t, isStreaming: true };
          }
          return updated;
        });
        rafScheduled = false;
      };

      await apiChatStream(
        selectedModel,
        chatMessages,
        { temperature: temperature[0] },
        (text) => {
          pendingText = text;
          if (!rafScheduled) {
            rafScheduled = true;
            requestAnimationFrame(flushText);
          }
        },
      );

      // 스트리밍 완료 → 커서 제거
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = { ...last, isStreaming: false };
        }
        return updated;
      });
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = {
            ...last,
            content: 'Error: 모델 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
            isStreaming: false,
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-12rem)] flex gap-6">
        {/* Settings Sidebar */}
        <div className={`${showSettings ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <Card className="bg-slate-900/50 border-white/10 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="size-5" />
                설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-200">모델 선택</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {models.map(model => (
                      <SelectItem key={model.name} value={model.name}>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-slate-400">{model.size}{model.parameterCount ? ` - ${model.parameterCount}` : ''}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-200">Temperature</Label>
                  <span className="text-sm text-slate-400">{temperature[0]}</span>
                </div>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-slate-400">
                  낮을수록 일관성 있고, 높을수록 창의적인 응답
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-slate-200 mb-3">Ollama 상태</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">연결:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        ollamaOnline === true ? 'bg-green-500' :
                        ollamaOnline === false ? 'bg-red-500' :
                        'bg-yellow-500 animate-pulse'
                      }`} />
                      <span className={
                        ollamaOnline === true ? 'text-green-500' :
                        ollamaOnline === false ? 'text-red-500' :
                        'text-yellow-500'
                      }>
                        {ollamaOnline === true ? '연결됨' : ollamaOnline === false ? '오프라인' : '확인 중...'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">현재 모델:</span>
                    <span className="text-white">{selectedModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">사용 가능:</span>
                    <span className="text-white">{models.length}개</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="bg-slate-900/50 border-white/10 flex-1 flex flex-col">
            {/* Header */}
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="size-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Model Playground</CardTitle>
                    <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                      <span>{selectedModel}로 대화 중</span>
                      <div className={`w-2 h-2 rounded-full ${ollamaOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <Settings className="size-4 mr-2" />
                    {showSettings ? '설정 닫기' : '설정'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChat}
                    className="text-red-400 border-red-400/20 hover:bg-red-500/10"
                  >
                    <Trash2 className="size-4 mr-2" />
                    초기화
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto">
                      <Bot className="size-8 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">
                        대화를 시작해보세요
                      </h3>
                      <p className="text-slate-400">
                        아래 입력창에 메시지를 입력하면 Ollama가 응답합니다
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    // content가 없는 streaming 플레이스홀더는 bounce dots에 위임
                    if (message.isStreaming && !message.content) return null;
                    return (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="size-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-slate-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                          {message.isStreaming && message.content && (
                            <span className="inline-block w-0.5 h-4 bg-slate-300 ml-0.5 animate-pulse align-middle" />
                          )}
                        </p>
                        {message.timestamp && !message.isStreaming && (
                          <p className="text-xs opacity-50 mt-1">
                            {message.timestamp.toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="size-4 text-white" />
                        </div>
                      )}
                    </div>
                    );
                  })}
                  {isLoading && messages[messages.length - 1]?.content === '' && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="size-4 text-white" />
                      </div>
                      <div className="bg-white/5 rounded-2xl px-4 py-3">
                        <div className="flex gap-1 items-center">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                  placeholder={`Message ${selectedModel}... (Shift+Enter로 줄바꿈)`}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
