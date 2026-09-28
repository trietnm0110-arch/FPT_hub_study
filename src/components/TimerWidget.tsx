import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudySession } from '../types';
import { playChimeSound } from '../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  Flame,
  Coffee,
  Timer as TimerIcon,
  ChevronDown,
  History,
} from 'lucide-react';

interface TimerWidgetProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (id: string) => void;
  onSaveSession: (session: Omit<StudySession, 'id' | 'timestamp'>) => void;
  slotDurationMinutes: number;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

type TimerMode = 'pomodoro' | 'break' | 'stopwatch' | 'fullSlot';

export const TimerWidget: React.FC<TimerWidgetProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  onSaveSession,
  slotDurationMinutes,
  pomodoroWorkMinutes,
  pomodoroBreakMinutes,
  soundEnabled,
  onToggleSound,
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(pomodoroWorkMinutes * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [sessionNote, setSessionNote] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize seconds depending on mode
  useEffect(() => {
    setIsActive(false);
    if (mode === 'pomodoro') {
      setSecondsLeft(pomodoroWorkMinutes * 60);
    } else if (mode === 'break') {
      setSecondsLeft(pomodoroBreakMinutes * 60);
    } else if (mode === 'fullSlot') {
      setSecondsLeft(slotDurationMinutes * 60);
    } else if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
    }
  }, [mode, pomodoroWorkMinutes, pomodoroBreakMinutes, slotDurationMinutes]);

  // Main ticking effect
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setStopwatchSeconds((prev) => prev + 1);
        } else {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              setIsActive(false);
              handleTimerFinish();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  const handleTimerFinish = () => {
    if (soundEnabled) {
      playChimeSound();
    }

    if (mode === 'pomodoro' && selectedSubject) {
      onSaveSession({
        subjectId: selectedSubject.id,
        durationMinutes: pomodoroWorkMinutes,
        mode: 'pomodoro',
        note: sessionNote || `Phiên Pomodoro ${pomodoroWorkMinutes}p`,
      });
      setCompletedSessionsCount((c) => c + 1);
      setSessionNote('');
    } else if (mode === 'fullSlot' && selectedSubject) {
      onSaveSession({
        subjectId: selectedSubject.id,
        durationMinutes: slotDurationMinutes,
        mode: 'slot',
        note: sessionNote || `1 Slot học tập (${slotDurationMinutes}p)`,
      });
      setSessionNote('');
    }
  };

  const handleSaveStopwatch = () => {
    if (!selectedSubject) return;
    const minutes = Math.max(1, Math.round(stopwatchSeconds / 60));
    onSaveSession({
      subjectId: selectedSubject.id,
      durationMinutes: minutes,
      mode: 'stopwatch',
      note: sessionNote || `Tự học bấm giờ (${minutes} phút)`,
    });
    setStopwatchSeconds(0);
    setIsActive(false);
    setSessionNote('');
    if (soundEnabled) playChimeSound();
  };

  const handleReset = () => {
    setIsActive(false);
    if (mode === 'pomodoro') setSecondsLeft(pomodoroWorkMinutes * 60);
    else if (mode === 'break') setSecondsLeft(pomodoroBreakMinutes * 60);
    else if (mode === 'fullSlot') setSecondsLeft(slotDurationMinutes * 60);
    else if (mode === 'stopwatch') setStopwatchSeconds(0);
  };

  const formatDisplayTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDisplaySeconds = mode === 'stopwatch' ? stopwatchSeconds : secondsLeft;
  const totalTargetSeconds =
    mode === 'pomodoro'
      ? pomodoroWorkMinutes * 60
      : mode === 'break'
      ? pomodoroBreakMinutes * 60
      : mode === 'fullSlot'
      ? slotDurationMinutes * 60
      : 3600;

  const progressPercent =
    mode === 'stopwatch'
      ? Math.min(100, (stopwatchSeconds / 3600) * 100)
      : Math.max(0, ((totalTargetSeconds - secondsLeft) / totalTargetSeconds) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      {/* Widget Top Bar */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 dark:bg-orange-950/60 rounded-xl text-orange-600 dark:text-orange-400">
            <TimerIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Đồng hồ Tự học FPTU
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Chạy Pomodoro hoặc bấm giờ thực tế tự học ngoài giờ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-orange-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl my-4 text-xs font-semibold">
        <button
          onClick={() => setMode('pomodoro')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 ${
            mode === 'pomodoro'
              ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Pomodoro ({pomodoroWorkMinutes}p)
        </button>
        <button
          onClick={() => setMode('break')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 ${
            mode === 'break'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          Nghỉ ({pomodoroBreakMinutes}p)
        </button>
        <button
          onClick={() => setMode('stopwatch')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 ${
            mode === 'stopwatch'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Bấm giờ tự do
        </button>
        <button
          onClick={() => setMode('fullSlot')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 ${
            mode === 'fullSlot'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          1 Slot ({slotDurationMinutes}p)
        </button>
      </div>

      {/* Target Subject Selector */}
      <div className="mb-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Gán thời gian học cho môn:
        </label>
        {subjects.length > 0 ? (
          <div className="relative">
            <select
              value={selectedSubject?.id || ''}
              onChange={(e) => onSelectSubject(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition cursor-pointer"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} ({Math.round((s.spentMinutes / 60) * 10) / 10}h / {s.weeklyBudgetHours}h)
                </option>
              ))}
            </select>
            <div
              className="w-3.5 h-3.5 rounded-full absolute left-3 top-3 pointer-events-none"
              style={{ backgroundColor: selectedSubject?.color || '#F26F21' }}
            />
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        ) : (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Chưa có môn học nào. Hãy thêm môn ở danh sách để cộng giờ!
          </p>
        )}
      </div>

      {/* Big Digital Display with Circular / Visual Meter */}
      <div className="py-6 flex flex-col items-center justify-center relative">
        <div className="relative flex items-center justify-center">
          <div className="text-center font-mono">
            <div className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {formatDisplayTime(currentDisplaySeconds)}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              {mode === 'stopwatch'
                ? `Đã trôi qua: ${Math.floor(stopwatchSeconds / 60)} phút`
                : isActive
                ? 'Đang tập trung cao độ...'
                : 'Sẵn sàng bắt đầu'}
            </div>
          </div>
        </div>

        {/* Mini progress bar under timer */}
        <div className="w-full max-w-xs h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-orange-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Quick session note input */}
      <div className="mb-4">
        <input
          type="text"
          value={sessionNote}
          onChange={(e) => setSessionNote(e.target.value)}
          placeholder="Ghi chú phiên học (ví dụ: Làm Assignment 1, Đọc Chap 3)..."
          className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition"
        />
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setIsActive(!isActive)}
          disabled={subjects.length === 0}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition ${
            isActive
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
              : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30'
          } ${subjects.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              Tạm dừng
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Bắt đầu
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          title="Đặt lại đồng hồ"
          className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {mode === 'stopwatch' && stopwatchSeconds >= 60 && (
          <button
            onClick={handleSaveStopwatch}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-600/20 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Lưu {Math.round(stopwatchSeconds / 60)}p vào môn
          </button>
        )}
      </div>

      {/* Session counter stats */}
      {completedSessionsCount > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Hôm nay: {completedSessionsCount} phiên hoàn thành</span>
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            +{completedSessionsCount * pomodoroWorkMinutes} phút đã cộng
          </span>
        </div>
      )}
    </div>
  );
};
