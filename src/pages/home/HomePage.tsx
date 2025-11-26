import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  WeatherWidget,
  PomodoroWidget,
  CountdownWidget,
  QuickLinksWidget,
  ChartWidget,
} from '../../components/widgets';
import { useTasksStore } from '../../store/tasksStore';
import { useNotesStore } from '../../store/notesStore';
import { formatDate } from '../../utils/date';

/**
 * 首页仪表盘
 * - 今日任务概览
 * - 最近笔记
 * - 数据图表
 * - 小组件区
 */
export function HomePage() {
  const tasks = useTasksStore((state) => state.tasks);
  const notes = useNotesStore((state) => state.notes);

  // 总体统计
  const totalStats = useMemo(() => ({
    pendingTasks: tasks.filter((t) => !t.completed).length,
    completedTasks: tasks.filter((t) => t.completed).length,
    totalNotes: notes.length,
    highPriority: tasks.filter((t) => t.priority === 'high' && !t.completed).length,
  }), [tasks, notes]);

  // 最近 7 天任务完成趋势
  const weeklyTrend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTasks = tasks.filter((t) => {
        const created = new Date(t.createdAt);
        return created >= date && created < nextDate;
      });

      days.push({
        label: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        value: dayTasks.filter((t) => t.completed).length,
      });
    }
    return days;
  }, [tasks]);

  // 优先级分布
  const priorityData = useMemo(() => [
    { label: '高', value: tasks.filter((t) => t.priority === 'high' && !t.completed).length, color: '#ef4444' },
    { label: '中', value: tasks.filter((t) => t.priority === 'medium' && !t.completed).length, color: '#eab308' },
    { label: '低', value: tasks.filter((t) => t.priority === 'low' && !t.completed).length, color: '#22c55e' },
  ], [tasks]);

  // 最近 3 条笔记
  const recentNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [notes]);

  // 待办任务（优先级排序）
  const urgentTasks = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return tasks
      .filter((t) => !t.completed)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 5);
  }, [tasks]);

  // 问候语
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  }, []);

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">
            {greeting} 👋
          </h2>
          <p className="text-[var(--text-secondary)] mt-1">
            {new Date().toLocaleDateString('zh-CN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/tasks">
            <Button>➕ 新建任务</Button>
          </Link>
          <Link to="/notes">
            <Button variant="secondary">📝 写笔记</Button>
          </Link>
        </div>
      </div>

      {/* 今日概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="bordered" className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="text-center py-6">
            <div className="text-4xl font-bold text-blue-500">{totalStats.pendingTasks}</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">待办任务</div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="text-center py-6">
            <div className="text-4xl font-bold text-green-500">{totalStats.completedTasks}</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">已完成</div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="text-center py-6">
            <div className="text-4xl font-bold text-purple-500">{totalStats.totalNotes}</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">笔记数量</div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="bg-gradient-to-br from-red-500/10 to-red-500/5">
          <CardContent className="text-center py-6">
            <div className="text-4xl font-bold text-red-500">{totalStats.highPriority}</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">高优先级</div>
          </CardContent>
        </Card>
      </div>

      {/* 图表和待办 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 本周完成趋势 */}
        <ChartWidget title="📈 本周完成趋势" data={weeklyTrend} type="line" height={180} />

        {/* 优先级分布 */}
        <ChartWidget title="📊 待办优先级分布" data={priorityData} type="bar" height={180} />
      </div>

      {/* 待办任务和最近笔记 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 待办任务 */}
        <Card variant="bordered">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
            <CardTitle className="mb-0">📋 待办任务</CardTitle>
            <Link to="/tasks">
              <Button variant="ghost" size="sm">查看全部</Button>
            </Link>
          </div>
          <CardContent>
            {urgentTasks.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <p className="text-3xl mb-2">🎉</p>
                <p>暂无待办任务</p>
              </div>
            ) : (
              <div className="space-y-2">
                {urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--border-color)]/50 transition-colors"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        task.priority === 'high'
                          ? 'bg-red-500'
                          : task.priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                    <span className="flex-1 text-[var(--text-primary)] truncate">
                      {task.title}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {formatDate(task.createdAt, 'relative')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近笔记 */}
        <Card variant="bordered">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
            <CardTitle className="mb-0">📝 最近笔记</CardTitle>
            <Link to="/notes">
              <Button variant="ghost" size="sm">查看全部</Button>
            </Link>
          </div>
          <CardContent>
            {recentNotes.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <p className="text-3xl mb-2">📭</p>
                <p>暂无笔记</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentNotes.map((note) => (
                  <Link
                    key={note.id}
                    to="/notes"
                    className="block p-3 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--border-color)]/50 transition-colors"
                  >
                    <div className="font-medium text-[var(--text-primary)] truncate">
                      {note.title}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] truncate mt-1">
                      {note.content.replace(/^#+ /, '').slice(0, 60)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {formatDate(note.updatedAt, 'relative')}
                      </span>
                      {note.tags.length > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--border-color)]">
                          #{note.tags[0]}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 小组件区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <WeatherWidget />
        <PomodoroWidget />
        <CountdownWidget />
        <QuickLinksWidget />
      </div>
    </div>
  );
}
