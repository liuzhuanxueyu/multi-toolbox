import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { useTasksStore } from '../../store/tasksStore';
import { useNotesStore } from '../../store/notesStore';
import { getWeekRange, formatDate, isToday } from '../../utils/date';

export function SummaryPage() {
  const tasks = useTasksStore((state) => state.tasks);
  const notes = useNotesStore((state) => state.notes);

  const { start, end } = getWeekRange();

  // 本周统计
  const weekTasks = tasks.filter((t) => {
    const created = new Date(t.createdAt);
    return created >= start && created <= end;
  });

  const todayTasks = tasks.filter((t) => isToday(t.createdAt));
  const todayCompleted = todayTasks.filter((t) => t.completed).length;

  const weekCompleted = weekTasks.filter((t) => t.completed).length;
  const weekPending = weekTasks.filter((t) => !t.completed).length;

  const weekNotes = notes.filter((n) => {
    const created = new Date(n.createdAt);
    return created >= start && created <= end;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">数据总结</h2>
      </div>

      {/* 今日卡片 */}
      <Card variant="bordered" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardTitle>📅 今日总结</CardTitle>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--text-primary)]">
                {todayTasks.length}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">新增任务</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{todayCompleted}</div>
              <div className="text-sm text-[var(--text-secondary)]">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">
                {todayTasks.length - todayCompleted}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">待完成</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">
                {todayTasks.length > 0
                  ? Math.round((todayCompleted / todayTasks.length) * 100)
                  : 0}
                %
              </div>
              <div className="text-sm text-[var(--text-secondary)]">完成率</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 本周卡片 */}
      <Card variant="bordered">
        <CardTitle>
          📊 本周总结 ({formatDate(start)} - {formatDate(end)})
        </CardTitle>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 任务统计 */}
            <div className="space-y-3">
              <h4 className="font-medium text-[var(--text-primary)]">任务</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">新增</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {weekTasks.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">已完成</span>
                  <span className="font-medium text-green-500">{weekCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">待完成</span>
                  <span className="font-medium text-orange-500">{weekPending}</span>
                </div>
              </div>
            </div>

            {/* 笔记统计 */}
            <div className="space-y-3">
              <h4 className="font-medium text-[var(--text-primary)]">笔记</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">新增</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {weekNotes.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">总计</span>
                  <span className="font-medium text-purple-500">{notes.length}</span>
                </div>
              </div>
            </div>

            {/* 完成率 */}
            <div className="space-y-3">
              <h4 className="font-medium text-[var(--text-primary)]">效率</h4>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">周完成率</span>
                  <span className="text-xs font-semibold text-[var(--accent)]">
                    {weekTasks.length > 0
                      ? Math.round((weekCompleted / weekTasks.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-[var(--border-color)]">
                  <div
                    style={{
                      width: `${
                        weekTasks.length > 0
                          ? Math.round((weekCompleted / weekTasks.length) * 100)
                          : 0
                      }%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[var(--accent)] transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近活动 */}
      <Card variant="bordered">
        <CardTitle>🕐 最近活动</CardTitle>
        <CardContent>
          <div className="space-y-3">
            {[...tasks]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-primary)]"
                >
                  <div className="flex items-center gap-2">
                    <span>{task.completed ? '✅' : '📋'}</span>
                    <span className="text-[var(--text-primary)]">{task.title}</span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {formatDate(task.createdAt, 'relative')}
                  </span>
                </div>
              ))}
            {tasks.length === 0 && (
              <p className="text-center text-[var(--text-secondary)] py-4">暂无活动记录</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

