import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { WeatherWidget, PomodoroWidget, CountdownWidget, QuickLinksWidget } from '../../components/widgets';
import { useTasksStore } from '../../store/tasksStore';
import { useNotesStore } from '../../store/notesStore';

export function HomePage() {
  const tasks = useTasksStore((state) => state.tasks);
  const notes = useNotesStore((state) => state.notes);

  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          欢迎回来 👋
        </h2>
        <p className="text-[var(--text-secondary)]">
          今天是 {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <CardTitle>📋 待办任务</CardTitle>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--accent)]">{pendingTasks}</div>
            <p className="text-sm text-[var(--text-secondary)]">待完成</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardTitle>✅ 已完成</CardTitle>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{completedTasks}</div>
            <p className="text-sm text-[var(--text-secondary)]">已完成任务</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardTitle>📝 笔记数量</CardTitle>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{notes.length}</div>
            <p className="text-sm text-[var(--text-secondary)]">条笔记</p>
          </CardContent>
        </Card>
      </div>

      {/* 小组件区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <WeatherWidget />
        <PomodoroWidget />
        <CountdownWidget />
        <QuickLinksWidget />
      </div>
    </div>
  );
}

