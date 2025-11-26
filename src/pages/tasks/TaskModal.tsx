import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import type { Task } from '../../store/tasksStore';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => void;
  task?: Task | null; // 编辑模式时传入
}

const priorityOptions = [
  { value: 'low', label: '🟢 低优先级' },
  { value: 'medium', label: '🟡 中优先级' },
  { value: 'high', label: '🔴 高优先级' },
];

/**
 * 任务新建/编辑弹窗
 */
export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');

  const isEditing = !!task;

  // 编辑模式时填充数据
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
    } else {
      // 新建模式重置表单
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      completed: task?.completed ?? false,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? '编辑任务' : '新建任务'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 标题 */}
        <Input
          label="任务标题"
          placeholder="输入任务标题..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />

        {/* 描述 */}
        <Textarea
          label="任务描述（可选）"
          placeholder="添加任务详细描述..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {/* 优先级 */}
        <Select
          label="优先级"
          options={priorityOptions}
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
        />

        {/* 截止日期 */}
        <Input
          label="截止日期（可选）"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            {isEditing ? '保存修改' : '创建任务'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


