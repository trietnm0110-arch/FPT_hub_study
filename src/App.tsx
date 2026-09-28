/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Subject,
  TaskItem,
  StudySession,
  WeeklyReflection,
  AppSettings,
  DaySlotAssignment,
} from './types';
import {
  StorageService,
  FPTU_SAMPLE_SUBJECTS,
  FPTU_SAMPLE_TASKS,
  FPTU_SAMPLE_TIMETABLE,
  DEFAULT_SETTINGS,
  FPTU_SLOTS,
} from './utils/storage';
import { Header } from './components/Header';
import { SubjectManager } from './components/SubjectManager';
import { SubjectModal } from './components/SubjectModal';
import { SlotTimetable } from './components/SlotTimetable';
import { TimerWidget } from './components/TimerWidget';
import { TaskManager } from './components/TaskManager';
import { WeeklyAnalytics } from './components/WeeklyAnalytics';
import { ReflectionModal } from './components/ReflectionModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import {
  CalendarDays,
  BookOpen,
  Timer as TimerIcon,
  CheckSquare,
  BarChart3,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // App State with localStorage persistence
  const [subjects, setSubjects] = useState<Subject[]>(() => StorageService.getSubjects());
  const [timetable, setTimetable] = useState<DaySlotAssignment[]>(() =>
    StorageService.getTimetable()
  );
  const [tasks, setTasks] = useState<TaskItem[]>(() => StorageService.getTasks());
  const [sessions, setSessions] = useState<StudySession[]>(() => StorageService.getSessions());
  const [reflections, setReflections] = useState<WeeklyReflection[]>(() =>
    StorageService.getReflections()
  );
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  // Active view / tabs
  const [activeTab, setActiveTab] = useState<'timetable' | 'subjects' | 'timer' | 'tasks' | 'analytics'>('timetable');

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Selected subject for timer
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Synchronize state changes to localStorage
  useEffect(() => {
    StorageService.saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    StorageService.saveTimetable(timetable);
  }, [timetable]);

  useEffect(() => {
    StorageService.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    StorageService.saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    StorageService.saveReflections(reflections);
  }, [reflections]);

  useEffect(() => {
    StorageService.saveSettings(settings);
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Keep selected subject valid
  useEffect(() => {
    if (subjects.length > 0 && !subjects.find((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  // Timetable Handlers
  const handleUpdateTimetableSlot = (
    dayOfWeek: number,
    slotIndex: number,
    subjectId?: string,
    room?: string
  ) => {
    const existingIndex = timetable.findIndex(
      (t) => t.dayOfWeek === dayOfWeek && t.slotIndex === slotIndex
    );
    if (existingIndex >= 0) {
      setTimetable((prev) =>
        prev.map((t, idx) =>
          idx === existingIndex
            ? { ...t, subjectId, room }
            : t
        )
      );
    } else {
      const newSlot: DaySlotAssignment = {
        id: `${dayOfWeek}-${slotIndex}`,
        dayOfWeek,
        slotIndex,
        subjectId,
        room,
        isStudied: false,
      };
      setTimetable((prev) => [...prev, newSlot]);
    }
    showToast(`Đã cập nhật Slot ${slotIndex}`);
  };

  const handleToggleSlotStudied = (dayOfWeek: number, slotIndex: number) => {
    const slotItem = timetable.find(
      (t) => t.dayOfWeek === dayOfWeek && t.slotIndex === slotIndex
    );
    if (!slotItem || !slotItem.subjectId) {
      showToast('Vui lòng chọn môn học cho slot này trước');
      return;
    }

    const currentStudied = slotItem.isStudied ?? false;
    const duration = settings.slotDurationMinutes;
    const subjectId = slotItem.subjectId;

    // Toggle studied state
    setTimetable((prev) =>
      prev.map((t) =>
        t.dayOfWeek === dayOfWeek && t.slotIndex === slotIndex
          ? { ...t, isStudied: !currentStudied }
          : t
      )
    );

    // Update subject minutes accordingly
    if (!currentStudied) {
      handleAddMinutes(subjectId, duration, `Học Slot ${slotIndex} (${duration}p)`);
      showToast(`✓ Đã đánh dấu hoàn thành Slot ${slotIndex} (+${duration}p)!`);
    } else {
      handleSubtractMinutes(subjectId, duration);
      showToast(`Đã hoàn tác Slot ${slotIndex} (-${duration}p)`);
    }
  };

  const handleAddTaskToSlot = (
    title: string,
    dayOfWeek: number,
    slotIndex: number,
    subjectId?: string
  ) => {
    const slotObj = FPTU_SLOTS.find((s) => s.slot === slotIndex);
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title,
      subjectId,
      dayOfWeek,
      slotIndex,
      targetSlot: `Slot ${slotIndex} (${slotObj?.startTime} - ${slotObj?.endTime})`,
      priority: 'medium',
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Đã thêm task vào Slot ${slotIndex}`);
  };

  // Subject Handlers
  const handleSaveSubject = (
    data: Omit<Subject, 'id' | 'createdAt' | 'spentMinutes'> & { id?: string }
  ) => {
    if (data.id) {
      setSubjects((prev) =>
        prev.map((s) => (s.id === data.id ? { ...s, ...data } : s))
      );
      showToast(`Đã cập nhật môn ${data.code}`);
    } else {
      const newSubject: Subject = {
        ...data,
        id: `subj-${Date.now()}`,
        spentMinutes: 0,
        createdAt: Date.now(),
      };
      setSubjects((prev) => [...prev, newSubject]);
      setSelectedSubjectId(newSubject.id);
      showToast(`Đã thêm môn ${data.code} thành công`);
    }
    setSubjectToEdit(null);
  };

  const handleDeleteSubject = (id: string) => {
    const subj = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    // Also remove from timetable
    setTimetable((prev) =>
      prev.map((t) => (t.subjectId === id ? { ...t, subjectId: undefined } : t))
    );
    showToast(`Đã xóa môn ${subj?.code || ''}`);
  };

  const handleAddMinutes = (subjectId: string, minutes: number, note?: string) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? { ...s, spentMinutes: s.spentMinutes + minutes }
          : s
      )
    );
    const subj = subjects.find((s) => s.id === subjectId);
    showToast(`+${minutes} phút đã được cộng vào ${subj?.code || 'môn học'}`);
  };

  const handleSubtractMinutes = (subjectId: string, minutes: number) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? { ...s, spentMinutes: Math.max(0, s.spentMinutes - minutes) }
          : s
      )
    );
    const subj = subjects.find((s) => s.id === subjectId);
    showToast(`Đã bớt ${minutes} phút ở môn ${subj?.code || ''}`);
  };

  // Timer Session Saved
  const handleSaveSession = (
    sessionData: Omit<StudySession, 'id' | 'timestamp'>
  ) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      timestamp: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    handleAddMinutes(sessionData.subjectId, sessionData.durationMinutes, sessionData.note);
  };

  // Task Handlers
  const handleAddTask = (
    taskData: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>
  ) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast('Đã thêm việc cần làm vào lịch học');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? Date.now() : undefined,
            }
          : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleClearCompletedTasks = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
    showToast('Đã dọn sạch các việc đã hoàn thành');
  };

  // Weekly Reflection Handlers
  const handleSaveAndResetWeek = (
    reflectionData: Omit<WeeklyReflection, 'id' | 'createdAt'>
  ) => {
    const newReflection: WeeklyReflection = {
      ...reflectionData,
      id: `ref-${Date.now()}`,
      createdAt: Date.now(),
    };
    setReflections((prev) => [newReflection, ...prev]);

    // Reset spent minutes on all subjects & timetable slots
    const resetResult = StorageService.resetWeekData(subjects, timetable);
    setSubjects(resetResult.subjects);
    setTimetable(resetResult.timetable);

    // Increment week number
    setSettings((prev) => ({
      ...prev,
      currentWeekNumber: prev.currentWeekNumber + 1,
      weekStartDate: new Date().toISOString().split('T')[0],
    }));

    showToast(`Đã lưu tự đánh giá & bắt đầu Tuần ${settings.currentWeekNumber + 1}!`);
  };

  const handleSaveReflectionOnly = (
    reflectionData: Omit<WeeklyReflection, 'id' | 'createdAt'>
  ) => {
    const newReflection: WeeklyReflection = {
      ...reflectionData,
      id: `ref-${Date.now()}`,
      createdAt: Date.now(),
    };
    setReflections((prev) => [newReflection, ...prev]);
    showToast('Đã lưu bài tự đánh giá tuần!');
  };

  const handleDeleteReflection = (id: string) => {
    setReflections((prev) => prev.filter((r) => r.id !== id));
  };

  // Sample data loader
  const handleLoadSamples = () => {
    setSubjects(FPTU_SAMPLE_SUBJECTS);
    setTimetable(FPTU_SAMPLE_TIMETABLE);
    setTasks(FPTU_SAMPLE_TASKS);
    showToast('Đã nạp bộ môn học & lịch 6 slot mẫu chuẩn FPTU!');
  };

  // Export / Import
  const handleExportBackup = () => {
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fptu-study-budget-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file sao lưu dữ liệu!');
  };

  const handleImportBackup = (jsonStr: string): boolean => {
    const ok = StorageService.importAllData(jsonStr);
    if (ok) {
      setSubjects(StorageService.getSubjects());
      setTimetable(StorageService.getTimetable());
      setTasks(StorageService.getTasks());
      setSessions(StorageService.getSessions());
      setReflections(StorageService.getReflections());
      setSettings(StorageService.getSettings());
      showToast('Đã phục hồi dữ liệu từ file sao lưu!');
      return true;
    }
    return false;
  };

  const handleResetAllData = () => {
    localStorage.clear();
    setSubjects(FPTU_SAMPLE_SUBJECTS);
    setTimetable(FPTU_SAMPLE_TIMETABLE);
    setTasks(FPTU_SAMPLE_TASKS);
    setSessions([]);
    setReflections([]);
    setSettings(DEFAULT_SETTINGS);
    showToast('Đã khôi phục cài đặt gốc');
  };

  // Quick stats calculation
  const totalBudgetHours = subjects.reduce((sum, s) => sum + s.weeklyBudgetHours, 0);
  const totalSpentMinutes = subjects.reduce((sum, s) => sum + s.spentMinutes, 0);
  const totalSpentHours = Math.round((totalSpentMinutes / 60) * 10) / 10;
  const overallPercent =
    totalBudgetHours > 0
      ? Math.round((totalSpentHours / totalBudgetHours) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700/60 animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          {toastMessage}
        </div>
      )}

      {/* Main Header */}
      <Header
        currentWeekNumber={settings.currentWeekNumber}
        slotDurationMinutes={settings.slotDurationMinutes}
        darkMode={settings.darkMode}
        onToggleDarkMode={() =>
          setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))
        }
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenReflection={() => setIsReflectionModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        hasPastReflections={reflections.length > 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'timetable'
                  ? 'bg-orange-600 text-white shadow-xs shadow-orange-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Lịch học 6 Slot/ngày
            </button>

            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'subjects'
                  ? 'bg-orange-600 text-white shadow-xs shadow-orange-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Môn học & Quỹ giờ
            </button>

            <button
              onClick={() => setActiveTab('timer')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'timer'
                  ? 'bg-orange-600 text-white shadow-xs shadow-orange-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TimerIcon className="w-4 h-4" />
              Đồng hồ Pomodoro
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'bg-orange-600 text-white shadow-xs shadow-orange-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Task theo Slot ({tasks.filter((t) => !t.completed).length})
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-orange-600 text-white shadow-xs shadow-orange-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Tiến độ tuần & Tự đánh giá
            </button>
          </div>

          {/* Quick Slot Rule pill */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 px-3 py-1">
            <span>Đã học tuần:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {totalSpentHours}h / {totalBudgetHours}h
            </span>
            <span
              className={`font-bold ml-1 ${
                overallPercent >= 100
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}
            >
              ({overallPercent}%)
            </span>
          </div>
        </div>

        {/* Tab 1: 6-Slot Timetable with embedded tasks & quick tracking */}
        {activeTab === 'timetable' && (
          <div className="space-y-6">
            <SlotTimetable
              subjects={subjects}
              timetable={timetable}
              tasks={tasks}
              slotDurationMinutes={settings.slotDurationMinutes}
              onUpdateTimetableSlot={handleUpdateTimetableSlot}
              onToggleSlotStudied={handleToggleSlotStudied}
              onAddTaskToSlot={handleAddTaskToSlot}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onStartTimerForSubject={(id) => {
                setSelectedSubjectId(id);
                setActiveTab('timer');
                showToast(`Đã bật đồng hồ cho môn ${subjects.find((s) => s.id === id)?.code}`);
              }}
            />

            {/* Quick analytics card preview right below timetable */}
            <WeeklyAnalytics
              subjects={subjects}
              slotDurationMinutes={settings.slotDurationMinutes}
              onOpenReflection={() => setIsReflectionModalOpen(true)}
              onOpenHistory={() => setIsHistoryModalOpen(true)}
              hasPastReflections={reflections.length > 0}
            />
          </div>
        )}

        {/* Tab 2: Subjects & Budget Setup */}
        {activeTab === 'subjects' && (
          <div className="space-y-6">
            <SubjectManager
              subjects={subjects}
              slotDurationMinutes={settings.slotDurationMinutes}
              onAddSubject={() => {
                setSubjectToEdit(null);
                setIsSubjectModalOpen(true);
              }}
              onEditSubject={(subject) => {
                setSubjectToEdit(subject);
                setIsSubjectModalOpen(true);
              }}
              onDeleteSubject={handleDeleteSubject}
              onAddMinutes={handleAddMinutes}
              onSubtractMinutes={handleSubtractMinutes}
              onSelectForTimer={(id) => {
                setSelectedSubjectId(id);
                setActiveTab('timer');
                showToast(`Đã chọn môn ${subjects.find((s) => s.id === id)?.code} cho đồng hồ`);
              }}
              onLoadSamples={handleLoadSamples}
            />

            <WeeklyAnalytics
              subjects={subjects}
              slotDurationMinutes={settings.slotDurationMinutes}
              onOpenReflection={() => setIsReflectionModalOpen(true)}
              onOpenHistory={() => setIsHistoryModalOpen(true)}
              hasPastReflections={reflections.length > 0}
            />
          </div>
        )}

        {/* Tab 3: Dedicated Timer & Pomodoro */}
        {activeTab === 'timer' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <TimerWidget
              subjects={subjects}
              selectedSubjectId={selectedSubjectId}
              onSelectSubject={setSelectedSubjectId}
              onSaveSession={handleSaveSession}
              slotDurationMinutes={settings.slotDurationMinutes}
              pomodoroWorkMinutes={settings.pomodoroWorkMinutes}
              pomodoroBreakMinutes={settings.pomodoroBreakMinutes}
              soundEnabled={settings.soundEnabled}
              onToggleSound={() =>
                setSettings((prev) => ({
                  ...prev,
                  soundEnabled: !prev.soundEnabled,
                }))
              }
            />

            {/* FPTU Slot Times Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs text-xs space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">
                Khung giờ chuẩn 6 Slot học Đại học FPT (135 phút/Slot):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-slate-700 dark:text-slate-300">
                {FPTU_SLOTS.map((slot) => (
                  <div
                    key={slot.slot}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <span className="font-mono font-bold text-orange-600 mr-1.5">
                      Slot {slot.slot}:
                    </span>
                    <span className="font-mono">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Tasks Manager */}
        {activeTab === 'tasks' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <TaskManager
              tasks={tasks}
              subjects={subjects}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onClearCompleted={handleClearCompletedTasks}
            />
          </div>
        )}

        {/* Tab 5: Analytics & Weekly Reflection */}
        {activeTab === 'analytics' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <WeeklyAnalytics
              subjects={subjects}
              slotDurationMinutes={settings.slotDurationMinutes}
              onOpenReflection={() => setIsReflectionModalOpen(true)}
              onOpenHistory={() => setIsHistoryModalOpen(true)}
              hasPastReflections={reflections.length > 0}
            />

            {reflections.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Nhật ký đánh giá các tuần gần đây
                  </h3>
                  <button
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Xem tất cả ({reflections.length})
                  </button>
                </div>
                <div className="text-xs text-slate-500">
                  Tuần gần nhất: Tuần {reflections[0]?.weekNumber} · Đánh giá: {reflections[0]?.rating}/5 sao · {reflections[0]?.totalHoursStudied} giờ đã học
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            FPTU Study Budget & Time Tracker · Ứng dụng quản lý thời gian học 6 Slot cho sinh viên FPT
          </div>
          <div className="flex items-center gap-3">
            <span>Dữ liệu lưu an toàn trên máy (localStorage)</span>
            <span>·</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-orange-600 dark:text-orange-400 hover:underline"
            >
              Sao lưu / Xuất file
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setSubjectToEdit(null);
        }}
        onSave={handleSaveSubject}
        subjectToEdit={subjectToEdit}
      />

      <ReflectionModal
        isOpen={isReflectionModalOpen}
        onClose={() => setIsReflectionModalOpen(false)}
        subjects={subjects}
        currentWeekNumber={settings.currentWeekNumber}
        slotDurationMinutes={settings.slotDurationMinutes}
        onSaveAndResetWeek={handleSaveAndResetWeek}
        onSaveOnly={handleSaveReflectionOnly}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        reflections={reflections}
        onDeleteReflection={handleDeleteReflection}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetAllData={handleResetAllData}
        subjects={subjects}
        timetable={timetable}
        tasks={tasks}
      />
    </div>
  );
}
