import { useRef, useEffect, useState } from 'react';
import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useSettingsStore } from '../../store/settingsStore';
import { useTasksStore } from '../../store/tasksStore';
import { useNotesStore } from '../../store/notesStore';
import { useAIDraftStore } from '../../store/aiDraftStore';
import { testAIConnection } from '../../api/ai';
import { testWeatherConnection } from '../../api/weather';

/**
 * 设置页面
 * - 主题切换（浅色/深色/跟随系统）
 * - 字体大小调整
 * - AI API 配置
 * - 天气 API 配置
 * - 数据导出（JSON）
 * - 数据导入
 * - 数据清空
 */
export function SettingsPage() {
  const { theme, setTheme, fontSize, setFontSize, aiConfig, setAIConfig, weatherConfig, setWeatherConfig } = useSettingsStore();
  const tasksStore = useTasksStore();
  const notesStore = useNotesStore();
  const aiDraftStore = useAIDraftStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 应用字体大小
  useEffect(() => {
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[fontSize];
  }, [fontSize]);

  // 导出数据
  const handleExportData = () => {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tasks: tasksStore.tasks,
      notes: notesStore.notes,
      aiDrafts: aiDraftStore.drafts,
      settings: {
        theme,
        fontSize,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multi-toolbox-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入数据
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // 验证数据格式
        if (!data.version || !data.exportedAt) {
          throw new Error('无效的备份文件格式');
        }

        // 确认导入
        const confirmMsg = `确定要导入备份数据吗？\n\n备份时间: ${new Date(data.exportedAt).toLocaleString('zh-CN')}\n任务: ${data.tasks?.length || 0} 条\n笔记: ${data.notes?.length || 0} 条\n\n注意：这将覆盖当前所有数据！`;
        
        if (!window.confirm(confirmMsg)) return;

        // 导入任务
        if (data.tasks) {
          localStorage.setItem('tasks-storage', JSON.stringify({ state: { tasks: data.tasks } }));
        }
        
        // 导入笔记
        if (data.notes) {
          localStorage.setItem('notes-storage', JSON.stringify({ state: { notes: data.notes } }));
        }
        
        // 导入 AI 草稿
        if (data.aiDrafts) {
          localStorage.setItem('ai-draft-storage', JSON.stringify({ state: { drafts: data.aiDrafts } }));
        }

        // 导入设置
        if (data.settings) {
          setTheme(data.settings.theme || 'system');
          setFontSize(data.settings.fontSize || 'medium');
        }

        alert('数据导入成功！页面将自动刷新。');
        window.location.reload();
      } catch (error) {
        alert('导入失败：' + (error instanceof Error ? error.message : '文件格式错误'));
      }
    };
    reader.readAsText(file);
    
    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 清除数据
  const handleClearData = () => {
    const confirmMsg = '⚠️ 确定要清除所有数据吗？\n\n这将删除：\n- 所有任务\n- 所有笔记\n- 所有 AI 草稿\n- 所有设置\n\n此操作不可恢复！';
    
    if (window.confirm(confirmMsg)) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // 统计数据
  const stats = {
    tasks: tasksStore.tasks.length,
    notes: notesStore.notes.length,
    aiDrafts: aiDraftStore.drafts.length,
    storageUsed: (() => {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length * 2; // UTF-16 编码
        }
      }
      return (total / 1024).toFixed(2);
    })(),
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">设置</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">自定义应用外观和管理数据</p>
      </div>

      {/* 外观设置 */}
      <Card variant="bordered">
        <CardTitle className="flex items-center gap-2">
          <span>🎨</span>
          外观设置
        </CardTitle>
        <CardContent className="space-y-6">
          {/* 主题模式 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
              主题模式
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: '浅色', icon: '☀️', desc: '明亮清爽' },
                { id: 'dark', label: '深色', icon: '🌙', desc: '护眼舒适' },
                { id: 'system', label: '跟随系统', icon: '🖥️', desc: '自动切换' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id as 'light' | 'dark' | 'system')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    theme === option.id
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-[var(--border-color)] hover:border-[var(--accent)]/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="font-medium text-[var(--text-primary)]">{option.label}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 字体大小 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
              字体大小
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'small', label: '小', sample: 'Aa', size: '14px' },
                { id: 'medium', label: '中', sample: 'Aa', size: '16px' },
                { id: 'large', label: '大', sample: 'Aa', size: '18px' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFontSize(option.id as 'small' | 'medium' | 'large')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    fontSize === option.id
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-[var(--border-color)] hover:border-[var(--accent)]/50'
                  }`}
                >
                  <div
                    className="font-bold text-[var(--text-primary)] mb-1"
                    style={{ fontSize: option.size }}
                  >
                    {option.sample}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI API 配置 */}
      <AIConfigCard aiConfig={aiConfig} setAIConfig={setAIConfig} />

      {/* 天气 API 配置 */}
      <WeatherConfigCard weatherConfig={weatherConfig} setWeatherConfig={setWeatherConfig} />

      {/* 数据管理 */}
      <Card variant="bordered">
        <CardTitle className="flex items-center gap-2">
          <span>💾</span>
          数据管理
        </CardTitle>
        <CardContent className="space-y-4">
          {/* 数据统计 */}
          <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-[var(--bg-primary)]">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.tasks}</div>
              <div className="text-xs text-[var(--text-secondary)]">任务</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.notes}</div>
              <div className="text-xs text-[var(--text-secondary)]">笔记</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.aiDrafts}</div>
              <div className="text-xs text-[var(--text-secondary)]">AI草稿</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.storageUsed}</div>
              <div className="text-xs text-[var(--text-secondary)]">KB 已用</div>
            </div>
          </div>

          {/* 导出数据 */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-color)]">
            <div>
              <p className="font-medium text-[var(--text-primary)]">导出数据</p>
              <p className="text-sm text-[var(--text-secondary)]">
                将所有数据导出为 JSON 文件备份
              </p>
            </div>
            <Button variant="secondary" onClick={handleExportData}>
              📤 导出
            </Button>
          </div>

          {/* 导入数据 */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-color)]">
            <div>
              <p className="font-medium text-[var(--text-primary)]">导入数据</p>
              <p className="text-sm text-[var(--text-secondary)]">
                从 JSON 备份文件恢复数据
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-file"
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                📥 导入
              </Button>
            </div>
          </div>

          {/* 清除数据 */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5">
            <div>
              <p className="font-medium text-[var(--text-primary)]">清除所有数据</p>
              <p className="text-sm text-red-500">
                ⚠️ 此操作不可恢复，请先导出备份
              </p>
            </div>
            <Button variant="danger" onClick={handleClearData}>
              🗑️ 清除
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 关于 */}
      <Card variant="bordered">
        <CardTitle className="flex items-center gap-2">
          <span>ℹ️</span>
          关于
        </CardTitle>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">应用名称</span>
              <span className="font-medium text-[var(--text-primary)]">Multi-Toolbox</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">版本</span>
              <span className="font-medium text-[var(--text-primary)]">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">技术栈</span>
              <span className="font-medium text-[var(--text-primary)]">
                React + TypeScript + Vite
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">UI 框架</span>
              <span className="font-medium text-[var(--text-primary)]">TailwindCSS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">状态管理</span>
              <span className="font-medium text-[var(--text-primary)]">Zustand</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * AI API 配置卡片组件
 */
function AIConfigCard({
  aiConfig,
  setAIConfig,
}: {
  aiConfig: { apiKey: string; apiBase: string; model: string };
  setAIConfig: (config: Partial<{ apiKey: string; apiBase: string; model: string }>) => void;
}) {
  const [tempApiKey, setTempApiKey] = useState(aiConfig.apiKey);
  const [tempApiBase, setTempApiBase] = useState(aiConfig.apiBase);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testAIConnection({
      apiKey: tempApiKey,
      apiBase: tempApiBase,
      model: aiConfig.model,
    });
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = () => {
    setAIConfig({
      apiKey: tempApiKey,
      apiBase: tempApiBase,
    });
    setIsEditing(false);
    setTestResult(null);
  };

  const handleCancel = () => {
    setTempApiKey(aiConfig.apiKey);
    setTempApiBase(aiConfig.apiBase);
    setIsEditing(false);
    setTestResult(null);
  };

  const isConfigured = !!aiConfig.apiKey;

  return (
    <Card variant="bordered">
      <CardTitle className="flex items-center gap-2">
        <span>🤖</span>
        AI API 配置
        {isConfigured && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
            已配置
          </span>
        )}
      </CardTitle>
      <CardContent className="space-y-4">
        {/* 说明 */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm">
          <p className="font-medium text-blue-500 mb-1">💡 获取 API Key</p>
          <p className="text-[var(--text-secondary)]">
            访问{' '}
            <a
              href="https://aihubmix.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] underline"
            >
              AiHubMix.com
            </a>{' '}
            注册账号并获取 API Key，支持 GPT-4、Claude、DeepSeek 等多种模型。
          </p>
        </div>

        {isEditing ? (
          <>
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

            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={handleTest}
                disabled={testing || !tempApiKey}
              >
                {testing ? '测试中...' : '测试连接'}
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCancel}>
                  取消
                </Button>
                <Button onClick={handleSave}>保存</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-color)]">
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                {isConfigured ? '已配置 API Key' : '未配置 API Key'}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {isConfigured
                  ? `API 地址: ${aiConfig.apiBase}`
                  : '配置后可使用真实 AI 模型'}
              </p>
            </div>
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              {isConfigured ? '修改' : '配置'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 天气 API 配置卡片组件
 */
function WeatherConfigCard({
  weatherConfig,
  setWeatherConfig,
}: {
  weatherConfig: { apiKey: string; apiBase: string };
  setWeatherConfig: (config: Partial<{ apiKey: string; apiBase: string }>) => void;
}) {
  const [tempApiKey, setTempApiKey] = useState(weatherConfig.apiKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testWeatherConnection({
      apiKey: tempApiKey,
      apiBase: weatherConfig.apiBase,
    });
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = () => {
    setWeatherConfig({ apiKey: tempApiKey });
    setIsEditing(false);
    setTestResult(null);
  };

  const handleCancel = () => {
    setTempApiKey(weatherConfig.apiKey);
    setIsEditing(false);
    setTestResult(null);
  };

  const isConfigured = !!weatherConfig.apiKey;

  return (
    <Card variant="bordered">
      <CardTitle className="flex items-center gap-2">
        <span>🌤️</span>
        天气 API 配置
        {isConfigured && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
            已配置
          </span>
        )}
      </CardTitle>
      <CardContent className="space-y-4">
        {/* 说明 */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm">
          <p className="font-medium text-blue-500 mb-1">💡 配置步骤</p>
          <ol className="text-[var(--text-secondary)] list-decimal list-inside space-y-1">
            <li>
              访问{' '}
              <a
                href="https://dev.qweather.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] underline"
              >
                和风天气开发平台
              </a>{' '}
              注册账号
            </li>
            <li>创建项目，选择「Web API」免费订阅</li>
            <li>应用限制选择「网站」并<strong>留空</strong>保存</li>
            <li>复制 API Key 粘贴到下方</li>
          </ol>
        </div>

        <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-600">
          ⚠️ 应用限制请选择「网站」并<strong>留空</strong>保存，即可允许所有网站访问
        </div>

        {isEditing ? (
          <>
            <Input
              label="API Key"
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="输入和风天气 API Key..."
            />

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

            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={handleTest}
                disabled={testing || !tempApiKey}
              >
                {testing ? '测试中...' : '测试连接'}
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCancel}>
                  取消
                </Button>
                <Button onClick={handleSave}>保存</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-color)]">
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                {isConfigured ? '已配置 API Key' : '未配置 API Key'}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {isConfigured
                  ? '使用和风天气实时数据'
                  : '配置后可获取真实天气数据'}
              </p>
            </div>
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              {isConfigured ? '修改' : '配置'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
