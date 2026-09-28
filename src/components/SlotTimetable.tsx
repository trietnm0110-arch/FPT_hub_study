import React, { useState } from 'react';
import {
  Subject,
  TaskItem,
  DaySlotAssignment,
  SlotConfig,
} from '../types';
import {
  DAYS_OF_WEEK,
  FPTU_SLOTS,
} from '../utils/storage';
import {
  CheckCircle2,
  Circle,
  Plus,
  Play,
  RotateCcw,
  Clock,
  MapPin,
  Calendar,
  CheckSquare,
  Square,
  Trash2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface SlotTimetableProps {
  subjects: Subject[];
  timetable: DaySlotAssignment[];
  tasks: TaskItem[];
  slotDurationMinutes: number;
  onUpdateTimetableSlot: (
    dayOfWeek: number,
    slotIndex: number,
    subjectId?: string,
    room?: string
  ) => void;
  onToggleSlotStudied: (dayOfWeek: number, slotIndex: number) => void;
  onAddTaskToSlot: (
    title: string,
    dayOfWeek: number,
    slotIndex: number,
    subjectId?: string
  ) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onStartTimerForSubject: (subjectId: string) => void;
}

export const SlotTimetable: React.FC<SlotTimetableProps> = ({
  subjects,
  timetable,
  tasks,
  slotDurationMinutes,
  onUpdateTimetableSlot,
  onToggleSlotStudied,
  onAddTaskToSlot,
  onToggleTask,
  onDeleteTask,
  onStartTimerForSubject,
}) => {
  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const todayDay = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(todayDay === 0 ? 0 : todayDay);
  const [newTaskInputBySlot, setNewTaskInputBySlot] = useState<{ [key: string]: string }>({});
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editRoom, setEditRoom] = useState<string>('');

  const currentDayInfo = DAYS_OF_WEEK.find((d) => d.id === selectedDay) || DAYS_OF_WEEK[0];

  const handleQuickAddTask = (slotIndex: number, subjectId?: string) => {
    const key = `${selectedDay}-${slotIndex}`;
    const text = newTaskInputBySlot[key]?.trim();
    if (!text) return;

    onAddTaskToSlot(text, selectedDay, slotIndex, subjectId);
    setNewTaskInputBySlot((prev) => ({ ...prev, [key]: '' }));
  };

  return (
    <div className="space-y-4">
      {/* Timetable Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Lịch học 6 Slot/ngày & Ghi chú công việc
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-400">
              Chuẩn 1 Slot = {slotDurationMinutes}p
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bấm nhanh đánh dấu hoàn thành 135p theo Slot và gán việc cần làm ngay trong từng khung giờ
          </p>
        </div>

        {/* Day of Week Selector */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {DAYS_OF_WEEK.map((day) => {
            const isToday = day.id === todayDay;
            const isSelected = day.id === selectedDay;
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{day.name}</span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" title="Hôm nay" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6 Slots Grid for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FPTU_SLOTS.map((slotConfig) => {
          const assignment = timetable.find(
            (t) => t.dayOfWeek === selectedDay && t.slotIndex === slotConfig.slot
          );
          const subject = subjects.find((s) => s.id === assignment?.subjectId);
          const slotTasks = tasks.filter(
            (t) => t.dayOfWeek === selectedDay && t.slotIndex === slotConfig.slot
          );
          const inputKey = `${selectedDay}-${slotConfig.slot}`;
          const isStudied = assignment?.isStudied ?? false;

          return (
            <div
              key={slotConfig.slot}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between p-4 shadow-xs ${
                isStudied
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/70 dark:border-emerald-800/50'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Slot Card Header */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 font-mono font-bold text-xs flex items-center justify-center">
                      S{slotConfig.slot}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        Slot {slotConfig.slot}
                        {isStudied && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded">
                            Đã học xong
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {slotConfig.startTime} - {slotConfig.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400">
                    {slotConfig.durationMinutes}p
                  </span>
                </div>

                {/* Subject Selector & Assignment */}
                <div className="py-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Môn học Slot này:
                    </label>
                    {subject && (
                      <button
                        onClick={() => onStartTimerForSubject(subject.id)}
                        title="Bật Pomodoro cho môn này"
                        className="text-[11px] text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Bật Timer
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={assignment?.subjectId || ''}
                      onChange={(e) =>
                        onUpdateTimetableSlot(
                          selectedDay,
                          slotConfig.slot,
                          e.target.value || undefined,
                          assignment?.room
                        )
                      }
                      className="flex-1 py-1.5 px-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden cursor-pointer"
                    >
                      <option value="">-- Trống / Tự do --</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>

                    {assignment?.subjectId && (
                      <input
                        type="text"
                        placeholder="Phòng học"
                        value={assignment?.room || ''}
                        onChange={(e) =>
                          onUpdateTimetableSlot(
                            selectedDay,
                            slotConfig.slot,
                            assignment.subjectId,
                            e.target.value
                          )
                        }
                        className="w-20 py-1.5 px-2 text-[11px] font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
                      />
                    )}
                  </div>

                  {subject && (
                    <div className="mt-2 flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 font-mono font-bold">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span style={{ color: subject.color }}>{subject.code}</span>
                        <span className="text-slate-400 font-normal truncate max-w-[120px]">
                          {subject.name}
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono">
                        {Math.round((subject.spentMinutes / 60) * 10) / 10}h / {subject.weeklyBudgetHours}h
                      </span>
                    </div>
                  )}
                </div>

                {/* Nested Tasks for this slot */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span>Task trong Slot ({slotTasks.length}):</span>
                  </div>

                  {/* Task list inside this slot */}
                  {slotTasks.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {slotTasks.map((t) => (
                        <div
                          key={t.id}
                          className="group flex items-start justify-between gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs"
                        >
                          <button
                            onClick={() => onToggleTask(t.id)}
                            className="mt-0.5 text-slate-400 hover:text-orange-600 shrink-0"
                          >
                            {t.completed ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                          <span
                            className={`flex-1 leading-tight text-[11px] ${
                              t.completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {t.title}
                          </span>
                          <button
                            onClick={() => onDeleteTask(t.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Add Task Input directly inside the Slot card */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="+ Việc cần làm ở slot này (Lab, Slide...)"
                      value={newTaskInputBySlot[inputKey] || ''}
                      onChange={(e) =>
                        setNewTaskInputBySlot((prev) => ({
                          ...prev,
                          [inputKey]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleQuickAddTask(slotConfig.slot, assignment?.subjectId);
                        }
                      }}
                      className="flex-1 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 outline-hidden"
                    />
                    <button
                      onClick={() =>
                        handleQuickAddTask(slotConfig.slot, assignment?.subjectId)
                      }
                      className="p-1.5 text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition"
                      title="Thêm task vào slot"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Slot Completion Action Button */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onToggleSlotStudied(selectedDay, slotConfig.slot)}
                  disabled={!assignment?.subjectId}
                  className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs ${
                    isStudied
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      : assignment?.subjectId
                      ? 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-slate-900/10'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isStudied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Đã học xong (+{slotDurationMinutes}p) · Bấm để hoàn tác
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-orange-400" />
                      {assignment?.subjectId
                        ? `Đã học xong Slot (+${slotDurationMinutes}p)`
                        : 'Chọn môn học để đánh dấu'}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
