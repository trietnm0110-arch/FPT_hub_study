import React, { useState } from 'react';
import { Subject, TaskItem } from '../types';
import { DAYS_OF_WEEK, FPTU_SLOTS } from '../utils/storage';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Filter,
  CheckCircle,
  Tag,
  AlertCircle,
} from 'lucide-react';

interface TaskManagerProps {
  tasks: TaskItem[];
  subjects: Subject[];
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onClearCompleted: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  subjects,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || '');
  const [newDayOfWeek, setNewDayOfWeek] = useState<number>(1); // Thứ 2
  const [newSlotIndex, setNewSlotIndex] = useState<number>(1); // Slot 1
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [dayFilter, setDayFilter] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const slotObj = FPTU_SLOTS.find((s) => s.slot === newSlotIndex);
    const dayObj = DAYS_OF_WEEK.find((d) => d.id === newDayOfWeek);

    onAddTask({
      title: newTitle.trim(),
      subjectId: newSubjectId || undefined,
      dayOfWeek: newDayOfWeek,
      slotIndex: newSlotIndex,
      targetSlot: `${dayObj?.name || 'Thứ 2'} - Slot ${newSlotIndex} (${slotObj?.startTime} - ${slotObj?.endTime})`,
      dueDate: newDueDate || undefined,
      priority: newPriority,
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'pending' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    if (subjectFilter !== 'all' && t.subjectId !== subjectFilter) return false;
    if (dayFilter !== 'all' && t.dayOfWeek !== parseInt(dayFilter)) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ghi chú & Task theo 6 Slot học
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({completedCount}/{tasks.length} xong)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lập kế hoạch làm Lab, đọc Slide, nộp Assignment gắn trực tiếp vào từng Slot trong ngày
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="text-xs text-slate-400 hover:text-red-500 transition px-2 py-1"
            >
              Dọn việc đã xong
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddForm ? 'Đóng form' : 'Thêm việc cần làm'}
          </button>
        </div>
      </div>

      {/* Add Task Form Collapsible */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3 animate-in fade-in duration-150"
        >
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Nội dung công việc (Lab / Slide / Assignment / Quiz...)
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ví dụ: Làm Workshop 3 Pointer, Nộp Assignment 1, Đọc Chap 4..."
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Gắn môn học
              </label>
              <select
                value={newSubjectId}
                onChange={(e) => setNewSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden cursor-pointer"
              >
                <option value="">-- Không gắn môn --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Ngày trong tuần
              </label>
              <select
                value={newDayOfWeek}
                onChange={(e) => setNewDayOfWeek(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden cursor-pointer"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Gắn vào Slot học
              </label>
              <select
                value={newSlotIndex}
                onChange={(e) => setNewSlotIndex(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden cursor-pointer"
              >
                {FPTU_SLOTS.map((slot) => (
                  <option key={slot.slot} value={slot.slot}>
                    Slot {slot.slot} ({slot.startTime} - {slot.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Mức độ ưu tiên
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden cursor-pointer"
              >
                <option value="high">Cao (Gấp / Deadline)</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp (Thong thả)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition shadow-xs"
            >
              Lưu công việc
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs & Subject Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 font-semibold rounded-lg transition ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Tất cả ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 font-semibold rounded-lg transition ${
              statusFilter === 'pending'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Chưa xong ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 font-semibold rounded-lg transition ${
              statusFilter === 'completed'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Đã xong ({completedCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Day filter */}
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 outline-hidden"
          >
            <option value="all">Mọi ngày</option>
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.id} value={d.id.toString()}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Subject filter */}
          {subjects.length > 0 && (
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 outline-hidden"
            >
              <option value="all">Mọi môn học</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Task List Items */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">
          Không có công việc nào trong danh sách lọc.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const subject = subjects.find((s) => s.id === task.subjectId);
            const dayObj = DAYS_OF_WEEK.find((d) => d.id === task.dayOfWeek);
            const slotObj = FPTU_SLOTS.find((s) => s.slot === task.slotIndex);

            return (
              <div
                key={task.id}
                className={`group flex items-start justify-between gap-3 p-3 rounded-xl border transition ${
                  task.completed
                    ? 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800/50 opacity-75'
                    : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-orange-600 transition"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <p
                      className={`text-xs font-medium leading-snug ${
                        task.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {subject && (
                        <span className="flex items-center gap-1 font-mono font-semibold">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          {subject.code}
                        </span>
                      )}

                      {task.slotIndex && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold font-mono">
                            <Clock className="w-3 h-3 text-orange-500" />
                            {dayObj?.name || 'T2'} - Slot {task.slotIndex} ({slotObj?.startTime})
                          </span>
                        </>
                      )}

                      {task.priority === 'high' && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" />
                            Ưu tiên cao
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  title="Xóa việc này"
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
