import { Message, ModelInfo } from '../types';

const OLLAMA_BASE_URL = 'http://localhost:11434';

export async function ollamaChat(
  model: string,
  messages: Message[],
  options?: { temperature?: number }
): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: false,
      options: options ? { temperature: options.temperature } : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama chat failed: ${response.status}`);
  }

  const data = await response.json();
  return data.message?.content || 'No response from model.';
}

export async function ollamaListModels(): Promise<ModelInfo[]> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);

  if (!response.ok) {
    throw new Error(`Ollama list models failed: ${response.status}`);
  }

  const data = await response.json();
  return (data.models || []).map((m: any) => ({
    name: m.name,
    size: formatBytes(m.size),
    modified: formatRelativeTime(m.modified_at),
    parameterCount: m.details?.parameter_size || undefined,
  }));
}

export async function ollamaShowModel(name: string): Promise<any> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/show`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(`Ollama show model failed: ${response.status}`);
  }

  return response.json();
}

export async function getAdminInsights(stats: any): Promise<string> {
  try {
    const response = await ollamaChat(
      'llama3:8b',
      [
        {
          role: 'system',
          content: 'You are a senior DevOps engineer and security analyst. Provide concise, actionable insights for an LLM gateway service. Reply with 3 bullet points.',
        },
        {
          role: 'user',
          content: `Analyze these system statistics and provide 3 key management recommendations: ${JSON.stringify(stats)}`,
        },
      ]
    );
    return response;
  } catch {
    return 'Unable to generate insights. Ensure Ollama is running on localhost:11434.';
  }
}

export async function ollamaHealthCheck(): Promise<boolean> {
  try {
    const response = await fetch(OLLAMA_BASE_URL, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

function formatBytes(bytes: number): string {
  if (!bytes) return 'Unknown';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
