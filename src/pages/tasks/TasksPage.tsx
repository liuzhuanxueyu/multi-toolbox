import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useTasksStore, type Task } from '../../store/tasksStore';
import { TaskModal } from './TaskModal';
import { TaskItem } from './TaskItem';

type FilterPriority = 'all' | 'high' | 'medium' | 'low';
type FilterStatus = 'all' | 'pending' | 'completed';

const priorityFilterOptions = [
  { value: 'all', label: '全部优先级' },
  { value: 'high', label: '🔴 高优先级' },
  { value: 'medium', label: '🟡 中优先级' },
  { value: 'low', label: '🟢 低优先级' },
];

const statusFilterOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '📋 待完成' },
  { value: 'completed', label: '✅ 已完成' },
];

/**
 * 任务管理页面
 * - 支持新建、编辑、删除任务
 * - 支持拖拽排序
 * - 支持按优先级和状态筛选
 */
export function TasksPage() {
  const { tasks, addTask, updateTask, toggleTask, deleteTask, reorderTasks } = useTasksStore();
  
  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // 筛选状态
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 拖动 8px 后才激活
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 根据筛选条件过滤任务
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // 优先级筛选
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
          return false;
        }
        // 状态筛选
        if (statusFilter === 'pending' && task.completed) {
          return false;
        }
        if (statusFilter === 'completed' && !task.completed) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [tasks, priorityFilter, statusFilter]);

  // 分离待完成和已完成任务
  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  // 拖拽结束处理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);

      const newTasks = arrayMove(tasks, oldIndex, newIndex).map((task, index) => ({
        ...task,
        order: index,
      }));

      reorderTasks(newTasks);
    }
  };

  // 打开新建弹窗
  const handleCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  // 保存任务（新建或编辑）
  const handleSave = (taskData: Omit<Task, 'id' | 'createdAt' | 'order'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  // 删除任务（带确认）
  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      deleteTask(id);
    }
  };

  // 统计数据
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    highPriority: tasks.filter((t) => t.priority === 'high' && !t.completed).length,
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和统计 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">任务管理</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            共 {stats.total} 个任务 · {stats.pending} 待完成 · {stats.completed} 已完成
            {stats.highPriority > 0 && (
              <span className="text-red-500"> · {stats.highPriority} 个高优先级</span>
            )}
          </p>
        </div>
        <Button onClick={handleCreate}>
          ➕ 新建任务
        </Button>
      </div>

      {/* 筛选工具栏 */}
      <Card variant="bordered">
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-40">
              <Select
                options={priorityFilterOptions}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as FilterPriority)}
              />
            </div>
            <div className="w-40">
              <Select
                options={statusFilterOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              />
            </div>
            {(priorityFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPriorityFilter('all');
                  setStatusFilter('all');
                }}
              >
                清除筛选
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 拖拽上下文 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* 待完成任务 */}
        <Card variant="bordered">
          <CardTitle className="flex items-center gap-2">
            <span>📋</span>
            待完成
            <span className="ml-auto text-sm font-normal text-[var(--text-secondary)]">
              {pendingTasks.length} 项
            </span>
          </CardTitle>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-secondary)]">
                <p className="text-4xl mb-2">🎉</p>
                <p>暂无待办任务</p>
                <Button className="mt-4" onClick={handleCreate}>
                  创建第一个任务
                </Button>
              </div>
            ) : (
              <SortableContext
                items={pendingTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </CardContent>
        </Card>

        {/* 已完成任务 */}
        {completedTasks.length > 0 && (
          <Card variant="bordered">
            <CardTitle className="flex items-center gap-2">
              <span>✅</span>
              已完成
              <span className="ml-auto text-sm font-normal text-[var(--text-secondary)]">
                {completedTasks.length} 项
              </span>
            </CardTitle>
            <CardContent>
              <SortableContext
                items={completedTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </CardContent>
          </Card>
        )}
      </DndContext>

      {/* 任务编辑弹窗 */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        task={editingTask}
      />
    </div>
  );
}
