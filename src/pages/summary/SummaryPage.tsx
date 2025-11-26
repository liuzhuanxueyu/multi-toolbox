import { useMemo, useState } from 'react';
import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useTasksStore } from '../../store/tasksStore';
import { useNotesStore } from '../../store/notesStore';
import { getWeekRange, formatDate, isToday } from '../../utils/date';

/**
 * 数据总结页面
 * - 今日/本周任务统计
 * - 笔记关键词标签云
 * - AI 生成总结（模拟）
 * - 导出 Markdown
 * - 保存到笔记
 */
export function SummaryPage() {
  const tasks = useTasksStore((state) => state.tasks);
  const { notes, addNote } = useNotesStore();

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [exportContent, setExportContent] = useState('');

  const { start, end } = getWeekRange();

  // 统计数据计算
  const stats = useMemo(() => {
    // 今日任务
    const todayTasks = tasks.filter((t) => isToday(t.createdAt));
    const todayCompleted = todayTasks.filter((t) => t.completed).length;

    // 本周任务
    const weekTasks = tasks.filter((t) => {
      const created = new Date(t.createdAt);
      return created >= start && created <= end;
    });
    const weekCompleted = weekTasks.filter((t) => t.completed).length;
    const weekPending = weekTasks.filter((t) => !t.completed).length;

    // 本周笔记
    const weekNotes = notes.filter((n) => {
      const created = new Date(n.createdAt);
      return created >= start && created <= end;
    });

    // 优先级分布
    const priorityDist = {
      high: tasks.filter((t) => t.priority === 'high' && !t.completed).length,
      medium: tasks.filter((t) => t.priority === 'medium' && !t.completed).length,
      low: tasks.filter((t) => t.priority === 'low' && !t.completed).length,
    };

    return {
      today: { total: todayTasks.length, completed: todayCompleted },
      week: { total: weekTasks.length, completed: weekCompleted, pending: weekPending },
      weekNotes: weekNotes.length,
      totalTasks: tasks.length,
      totalNotes: notes.length,
      priorityDist,
    };
  }, [tasks, notes, start, end]);

  // 笔记关键词统计（简单词频统计）
  const tagCloud = useMemo(() => {
    const wordCount: Record<string, number> = {};

    // 统计标签频率
    notes.forEach((note) => {
      note.tags.forEach((tag) => {
        wordCount[tag] = (wordCount[tag] || 0) + 3; // 标签权重更高
      });
    });

    // 统计标题关键词
    notes.forEach((note) => {
      const words = note.title
        .toLowerCase()
        .split(/[\s,，、。.!！?？]+/)
        .filter((w) => w.length > 1 && w.length < 10);
      words.forEach((word) => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
    });

    // 排序并取前 20 个
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));
  }, [notes]);

  // 生成 Markdown 总结
  const generateMarkdownSummary = () => {
    const today = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    const completionRate = stats.week.total > 0
      ? Math.round((stats.week.completed / stats.week.total) * 100)
      : 0;

    return `# 周总结报告

> 生成时间：${today}
> 统计周期：${formatDate(start)} - ${formatDate(end)}

## 📊 数据概览

### 任务完成情况
- **本周新增任务**：${stats.week.total} 个
- **已完成**：${stats.week.completed} 个
- **待完成**：${stats.week.pending} 个
- **完成率**：${completionRate}%

### 优先级分布
- 🔴 高优先级待办：${stats.priorityDist.high} 个
- 🟡 中优先级待办：${stats.priorityDist.medium} 个
- 🟢 低优先级待办：${stats.priorityDist.low} 个

### 笔记产出
- **本周新增笔记**：${stats.weekNotes} 篇
- **笔记总数**：${stats.totalNotes} 篇

## 🏷️ 热门标签
${tagCloud.slice(0, 10).map((t) => `- #${t.word} (${t.count})`).join('\n')}

## 📝 本周任务列表

### 已完成
${tasks
  .filter((t) => t.completed && new Date(t.createdAt) >= start)
  .map((t) => `- [x] ${t.title}`)
  .join('\n') || '- 暂无'}

### 待完成
${tasks
  .filter((t) => !t.completed && new Date(t.createdAt) >= start)
  .map((t) => `- [ ] ${t.title} (${t.priority === 'high' ? '高' : t.priority === 'medium' ? '中' : '低'}优先级)`)
  .join('\n') || '- 暂无'}

---
*由 Multi-Toolbox 自动生成*
`;
  };

  // 导出 Markdown 文件
  const handleExport = () => {
    const content = generateMarkdownSummary();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `周总结-${formatDate(new Date())}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 打开保存弹窗
  const handleOpenSaveModal = () => {
    setExportContent(generateMarkdownSummary());
    setNoteTitle(`周总结 - ${formatDate(new Date())}`);
    setSaveModalOpen(true);
  };

  // 保存到笔记
  const handleSaveToNotes = () => {
    if (!noteTitle.trim()) return;

    addNote({
      title: noteTitle,
      content: exportContent,
      tags: ['周总结', 'summary'],
    });

    setSaveModalOpen(false);
  };

  // 计算进度条宽度
  const getProgressWidth = (value: number, max: number) => {
    if (max === 0) return 0;
    return Math.round((value / max) * 100);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">数据总结</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {formatDate(start)} - {formatDate(end)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport}>
            📥 导出 Markdown
          </Button>
          <Button onClick={handleOpenSaveModal}>
            💾 保存到笔记
          </Button>
        </div>
      </div>

      {/* 今日卡片 */}
      <Card variant="bordered" className="bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📅</span>
          今日总结
        </CardTitle>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--text-primary)]">
                {stats.today.total}
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">新增任务</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500">
                {stats.today.completed}
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">
                {stats.today.total - stats.today.completed}
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">待完成</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--accent)]">
                {stats.today.total > 0
                  ? Math.round((stats.today.completed / stats.today.total) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">完成率</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 本周统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 任务统计 */}
        <Card variant="bordered">
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            本周任务
          </CardTitle>
          <CardContent className="space-y-4">
            {/* 完成进度 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--text-secondary)]">完成进度</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {stats.week.completed} / {stats.week.total}
                </span>
              </div>
              <div className="h-3 bg-[var(--border-color)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--accent)] to-green-500 transition-all duration-500"
                  style={{ width: `${getProgressWidth(stats.week.completed, stats.week.total)}%` }}
                />
              </div>
            </div>

            {/* 优先级分布 */}
            <div className="space-y-2">
              <p className="text-sm text-[var(--text-secondary)]">待办优先级分布</p>
              <div className="flex items-center gap-2">
                <span className="text-xs w-16">🔴 高</span>
                <div className="flex-1 h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{
                      width: `${getProgressWidth(
                        stats.priorityDist.high,
                        stats.priorityDist.high + stats.priorityDist.medium + stats.priorityDist.low
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-xs w-8 text-right">{stats.priorityDist.high}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs w-16">🟡 中</span>
                <div className="flex-1 h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all"
                    style={{
                      width: `${getProgressWidth(
                        stats.priorityDist.medium,
                        stats.priorityDist.high + stats.priorityDist.medium + stats.priorityDist.low
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-xs w-8 text-right">{stats.priorityDist.medium}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs w-16">🟢 低</span>
                <div className="flex-1 h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${getProgressWidth(
                        stats.priorityDist.low,
                        stats.priorityDist.high + stats.priorityDist.medium + stats.priorityDist.low
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-xs w-8 text-right">{stats.priorityDist.low}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 标签云 */}
        <Card variant="bordered">
          <CardTitle className="flex items-center gap-2">
            <span>🏷️</span>
            热门标签
          </CardTitle>
          <CardContent>
            {tagCloud.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm">暂无标签数据</p>
                <p className="text-xs mt-1">在笔记中添加标签后这里会显示统计</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tagCloud.map(({ word, count }) => {
                  // 根据频率计算大小
                  const maxCount = tagCloud[0]?.count || 1;
                  const size = 0.75 + (count / maxCount) * 0.75; // 0.75rem - 1.5rem

                  return (
                    <span
                      key={word}
                      className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors cursor-default"
                      style={{ fontSize: `${size}rem` }}
                      title={`出现 ${count} 次`}
                    >
                      #{word}
                    </span>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 最近活动 */}
      <Card variant="bordered">
        <CardTitle className="flex items-center gap-2">
          <span>🕐</span>
          最近活动
        </CardTitle>
        <CardContent>
          <div className="space-y-2">
            {tasks.length === 0 && notes.length === 0 ? (
              <p className="text-center text-[var(--text-secondary)] py-8">暂无活动记录</p>
            ) : (
              [...tasks.map((t) => ({ type: 'task' as const, item: t, time: t.createdAt })),
               ...notes.map((n) => ({ type: 'note' as const, item: n, time: n.createdAt }))]
                .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                .slice(0, 8)
                .map((activity) => (
                  <div
                    key={`${activity.type}-${activity.item.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--border-color)]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {activity.type === 'task'
                          ? (activity.item as typeof tasks[0]).completed
                            ? '✅'
                            : '📋'
                          : '📝'}
                      </span>
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">
                          {activity.type === 'task'
                            ? (activity.item as typeof tasks[0]).title
                            : (activity.item as typeof notes[0]).title}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {activity.type === 'task' ? '任务' : '笔记'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {formatDate(activity.time, 'relative')}
                    </span>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

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
          <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] max-h-48 overflow-auto">
            <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap">
              {exportContent.slice(0, 500)}...
            </pre>
          </div>
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
