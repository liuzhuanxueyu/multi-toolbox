import { useState } from 'react';
import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { sendAIPrompt, type AIResponse } from '../../api/ai';

type AIModel = 'claude' | 'gpt' | 'sora';

export function AIDraftPage() {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude');

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const response = await sendAIPrompt({ prompt, model: selectedModel });
      setResponses((prev) => [response, ...prev]);
      setPrompt('');
    } catch (error) {
      console.error('AI request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const models: { id: AIModel; name: string; icon: string }[] = [
    { id: 'claude', name: 'Claude', icon: '🧠' },
    { id: 'gpt', name: 'GPT', icon: '🤖' },
    { id: 'sora', name: 'Sora', icon: '🎬' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">AI 草稿</h2>
      </div>

      {/* 模型选择 */}
      <div className="flex gap-2">
        {models.map((model) => (
          <Button
            key={model.id}
            variant={selectedModel === model.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedModel(model.id)}
          >
            {model.icon} {model.name}
          </Button>
        ))}
      </div>

      {/* 输入区域 */}
      <Card variant="bordered">
        <CardContent>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入您的提示词..."
            className="w-full h-32 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <div className="flex justify-end mt-3">
            <Button onClick={handleSubmit} disabled={loading || !prompt.trim()}>
              {loading ? '生成中...' : '发送'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 响应列表 */}
      <div className="space-y-4">
        {responses.map((response) => (
          <Card key={response.id} variant="bordered">
            <CardTitle className="flex items-center gap-2">
              {response.model === 'claude' && '🧠'}
              {response.model === 'gpt' && '🤖'}
              {response.model === 'sora' && '🎬'}
              {response.model.toUpperCase()} 响应
            </CardTitle>
            <CardContent>
              <pre className="whitespace-pre-wrap text-[var(--text-primary)] font-sans">
                {response.content}
              </pre>
              <p className="text-xs text-[var(--text-secondary)] mt-3">
                {new Date(response.createdAt).toLocaleString('zh-CN')}
              </p>
            </CardContent>
          </Card>
        ))}

        {responses.length === 0 && (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            输入提示词开始与 AI 对话
          </div>
        )}
      </div>
    </div>
  );
}

