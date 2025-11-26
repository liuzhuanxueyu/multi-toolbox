import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { sendAIPrompt, testAIConnection } from '../../api/ai';
import { useAIDraftStore, type AIDraft } from '../../store/aiDraftStore';
import { useNotesStore } from '../../store/notesStore';
import { useSettingsStore } from '../../store/settingsStore';
import { formatDate } from '../../utils/date';

// 常用模型列表
const MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', icon: '⚡', desc: '快速经济' },
  { id: 'gpt-4o', name: 'GPT-4o', icon: '🧠', desc: '强大智能' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', icon: '🚀', desc: '高性能' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5', icon: '🎭', desc: '创意写作' },
  { id: 'deepseek-chat', name: 'DeepSeek', icon: '🔮', desc: '中文优化' },
];

/**
 * AI 草稿页面
 * - 支持 AiHubMix API 接入
 * - 多模型选择
 * - 历史记录
 * - 保存到笔记
 */
export function AIDraftPage() {
  const { drafts, addDraft, deleteDraft, clearDrafts } = useAIDraftStore();
  const { addNote } = useNotesStore();
  const { aiConfig, setAIConfig } = useSettingsStore();

  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(aiConfig.model || 'gpt-4o-mini');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 配置弹窗
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(aiConfig.apiKey);
  const [tempApiBase, setTempApiBase] = useState(aiConfig.apiBase);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // 保存到笔记弹窗
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState<AIDraft | null>(null);
  const [noteTitle, setNoteTitle] = useState('');

  // 发送请求
  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await sendAIPrompt(
        { prompt, model: selectedModel },
        aiConfig
      );
      addDraft({
        prompt,
        response: response.content,
        model: selectedModel,
      });
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 请求失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试 API 连接
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testAIConnection({
      apiKey: tempApiKey,
      apiBase: tempApiBase,
      model: selectedModel,
    });
    setTestResult(result);
    setTesting(false);
  };

  // 保存配置
  const handleSaveConfig = () => {
    setAIConfig({
      apiKey: tempApiKey,
      apiBase: tempApiBase,
    });
    setConfigModalOpen(false);
  };

  // 打开保存弹窗
  const handleOpenSaveModal = (draft: AIDraft) => {
    setSavingDraft(draft);
    setNoteTitle(`AI 草稿 - ${draft.prompt.slice(0, 30)}...`);
    setSaveModalOpen(true);
  };

  // 保存到笔记
  const handleSaveToNotes = () => {
    if (!savingDraft || !noteTitle.trim()) return;

    const content = `# ${noteTitle}

## 提示词
${savingDraft.prompt}

## AI 响应 (${savingDraft.model})
${savingDraft.response}

---
*生成于 ${formatDate(savingDraft.createdAt)}*
`;

    addNote({
      title: noteTitle,
      content,
      tags: ['ai-draft', savingDraft.model.split('-')[0]],
    });

    setSaveModalOpen(false);
    setSavingDraft(null);
  };

  // 清空历史确认
  const handleClearHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？')) {
      clearDrafts();
    }
  };

  const isConfigured = !!aiConfig.apiKey;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">AI 草稿</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {isConfigured ? (
              <span className="text-green-500">✓ 已连接 AiHubMix API</span>
            ) : (
              <span className="text-yellow-500">⚠ 模拟模式 - 请配置 API Key</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => {
            setTempApiKey(aiConfig.apiKey);
            setTempApiBase(aiConfig.apiBase);
            setTestResult(null);
            setConfigModalOpen(true);
          }}>
            ⚙️ API 配置
          </Button>
          {drafts.length > 0 && (
            <Button variant="ghost" onClick={handleClearHistory}>
              清空历史
            </Button>
          )}
        </div>
      </div>

      {/* 模型选择 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            className={`p-3 rounded-xl border-2 transition-all text-left ${
              selectedModel === model.id
                ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                : 'border-[var(--border-color)] hover:border-[var(--accent)]/50'
            }`}
          >
            <div className="text-xl mb-1">{model.icon}</div>
            <div className="font-medium text-sm text-[var(--text-primary)] truncate">{model.name}</div>
            <div className="text-xs text-[var(--text-secondary)]">{model.desc}</div>
          </button>
        ))}
      </div>

      {/* 输入区域 */}
      <Card variant="bordered">
        <CardContent>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSubmit();
              }
            }}
            placeholder="输入您的提示词... (Ctrl+Enter 发送)"
            className="w-full h-36 p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-base leading-relaxed"
          />
          
          {/* 错误提示 */}
          {error && (
            <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
              ❌ {error}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span>{prompt.length} 字符</span>
              <span>·</span>
              <span>模型: {selectedModel}</span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading || !prompt.trim()}
              className="min-w-[100px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  生成中
                </span>
              ) : (
                '发送'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 历史记录 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          历史记录 ({drafts.length})
        </h3>

        {drafts.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-secondary)]">
            <p className="text-5xl mb-4">💭</p>
            <p className="text-lg">还没有生成过内容</p>
            <p className="text-sm mt-1">输入提示词，让 AI 帮你创作</p>
            {!isConfigured && (
              <Button
                className="mt-4"
                variant="secondary"
                onClick={() => setConfigModalOpen(true)}
              >
                配置 API Key
              </Button>
            )}
          </div>
        ) : (
          drafts.map((draft) => (
            <Card key={draft.id} variant="bordered" className="overflow-hidden">
              {/* 头部 */}
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {MODELS.find((m) => m.id === draft.model)?.icon || '🤖'}
                  </span>
                  <span className="font-medium text-[var(--text-primary)] text-sm">
                    {draft.model}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {formatDate(draft.createdAt, 'relative')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenSaveModal(draft)}
                    title="保存到笔记"
                  >
                    📥
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(draft.response)}
                    title="复制内容"
                  >
                    📋
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteDraft(draft.id)}
                    title="删除"
                  >
                    🗑️
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                {/* 提示词 */}
                <div className="mb-4 p-3 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                  <p className="text-xs text-[var(--accent)] font-medium mb-1">提示词</p>
                  <p className="text-[var(--text-primary)]">{draft.prompt}</p>
                </div>

                {/* 响应内容 */}
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-primary)] prose-a:text-[var(--accent)]">
                  <ReactMarkdown>{draft.response}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* API 配置弹窗 */}
      <Modal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        title="API 配置"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm">
            <p className="font-medium text-blue-500 mb-1">💡 获取 API Key</p>
            <p className="text-[var(--text-secondary)]">
              访问 <a href="https://aihubmix.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline">AiHubMix.com</a> 注册账号并获取 API Key
            </p>
          </div>

          <Input
            label="API Key"
            type="password"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder="sk-xxxxxxxxxxxxxxxx"
          />

          <Input
            label="API 地址"
            value={tempApiBase}
            onChange={(e) => setTempApiBase(e.target.value)}
            placeholder="https://aihubmix.com/v1"
          />

          {/* 测试结果 */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-sm ${
                testResult.success
                  ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                  : 'bg-red-500/10 border border-red-500/30 text-red-500'
              }`}
            >
              {testResult.success ? '✓' : '✗'} {testResult.message}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button
              variant="secondary"
              onClick={handleTestConnection}
              disabled={testing || !tempApiKey}
            >
              {testing ? '测试中...' : '测试连接'}
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setConfigModalOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveConfig}>
                保存配置
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 保存到笔记弹窗 */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="保存到笔记"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="笔记标题"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="输入笔记标题..."
          />
          <p className="text-sm text-[var(--text-secondary)]">
            将自动添加标签：#ai-draft #{savingDraft?.model.split('-')[0]}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSaveModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveToNotes} disabled={!noteTitle.trim()}>
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
