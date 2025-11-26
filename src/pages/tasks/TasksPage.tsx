import { useState } from 'react';
import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTasksStore, type Task } from '../../store/tasksStore';

export function TasksPage() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasksStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle,
      completed: false,
      priority: 'medium',
    });
    setNewTaskTitle('');
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const renderTask = (task: Task) => (
    <div
      key={task.id}
      className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]"
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleTask(task.id)}
        className="w-5 h-5 rounded border-[var(--border-color)] accent-[var(--accent)]"
      />
      <span
        className={`flex-1 ${
          task.completed ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'
        }`}
      >
        {task.title}
      </span>
      <span
        className={`px-2 py-0.5 rounded text-xs ${
          task.priority === 'high'
            ? 'bg-red-100 text-red-600'
            : task.priority === 'medium'
            ? 'bg-yellow-100 text-yellow-600'
            : 'bg-green-100 text-green-600'
        }`}
      >
        {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
      </span>
      <Button size="sm" variant="ghost" onClick={() => deleteTask(task.id)}>
        🗑️
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">任务管理</h2>
      </div>

      {/* 添加任务 */}
      <Card variant="bordered">
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="输入新任务..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button onClick={handleAddTask}>添加</Button>
          </div>
        </CardContent>
      </Card>

      {/* 待完成任务 */}
      <Card variant="bordered">
        <CardTitle>📋 待完成 ({pendingTasks.length})</CardTitle>
        <CardContent>
          <div className="space-y-2">
            {pendingTasks.length === 0 ? (
              <p className="text-[var(--text-secondary)] text-center py-4">暂无待办任务</p>
            ) : (
              pendingTasks.map(renderTask)
            )}
          </div>
        </CardContent>
      </Card>

      {/* 已完成任务 */}
      {completedTasks.length > 0 && (
        <Card variant="bordered">
          <CardTitle>✅ 已完成 ({completedTasks.length})</CardTitle>
          <CardContent>
            <div className="space-y-2">{completedTasks.map(renderTask)}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

