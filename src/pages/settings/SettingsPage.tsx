import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettingsStore } from '../../store/settingsStore';
import { useTasksStore } from '../../store/tasksStore';
import { useNotesStore } from '../../store/notesStore';

export function SettingsPage() {
  const { theme, setTheme } = useSettingsStore();
  const tasksStore = useTasksStore();
  const notesStore = useNotesStore();

  const handleExportData = () => {
    const data = {
      tasks: tasksStore.tasks,
      notes: notesStore.notes,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multi-toolbox-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">设置</h2>
      </div>

      {/* 外观设置 */}
      <Card variant="bordered">
        <CardTitle>🎨 外观</CardTitle>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                主题模式
              </label>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  ☀️ 浅色
                </Button>
                <Button
                  variant={theme === 'dark' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  🌙 深色
                </Button>
                <Button
                  variant={theme === 'system' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme('system')}
                >
                  🖥️ 跟随系统
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据管理 */}
      <Card variant="bordered">
        <CardTitle>💾 数据管理</CardTitle>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--text-primary)]">导出数据</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  将所有任务和笔记导出为 JSON 文件
                </p>
              </div>
              <Button variant="secondary" onClick={handleExportData}>
                导出
              </Button>
            </div>

            <div className="border-t border-[var(--border-color)] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">清除数据</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    删除所有本地存储的数据
                  </p>
                </div>
                <Button variant="danger" onClick={handleClearData}>
                  清除
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 关于 */}
      <Card variant="bordered">
        <CardTitle>ℹ️ 关于</CardTitle>
        <CardContent>
          <div className="space-y-2 text-[var(--text-secondary)]">
            <p>
              <strong className="text-[var(--text-primary)]">Multi-Toolbox</strong> - 个人助理工具箱
            </p>
            <p>版本：1.0.0</p>
            <p>
              技术栈：React + TypeScript + Vite + TailwindCSS + Zustand
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

