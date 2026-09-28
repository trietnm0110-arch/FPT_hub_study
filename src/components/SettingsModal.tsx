import React, { useState } from 'react';
import { AppSettings, Subject, DaySlotAssignment, TaskItem } from '../types';
import { FPTU_SLOTS, DAYS_OF_WEEK } from '../utils/storage';
import {
  X,
  Settings,
  Clock,
  Download,
  Upload,
  FileCode,
  Check,
  RotateCcw,
  Volume2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
  onResetAllData: () => void;
  subjects: Subject[];
  timetable: DaySlotAssignment[];
  tasks: TaskItem[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportBackup,
  onImportBackup,
  onResetAllData,
  subjects,
  timetable,
  tasks,
}) => {
  const [slotDuration, setSlotDuration] = useState<number>(settings.slotDurationMinutes);
  const [pomodoroWork, setPomodoroWork] = useState<number>(settings.pomodoroWorkMinutes);
  const [pomodoroBreak, setPomodoroBreak] = useState<number>(settings.pomodoroBreakMinutes);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);
  const [importStatus, setImportStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      slotDurationMinutes: Number(slotDuration) || 135,
      pomodoroWorkMinutes: Number(pomodoroWork) || 25,
      pomodoroBreakMinutes: Number(pomodoroBreak) || 5,
      soundEnabled,
    });
    onClose();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportBackup(content);
      if (success) {
        setImportStatus('Nhập dữ liệu sao lưu thành công!');
        setTimeout(() => {
          setImportStatus('');
          onClose();
        }, 1200);
      } else {
        setImportStatus('Lỗi: Tệp JSON sao lưu không hợp lệ.');
      }
    };
    reader.readAsText(file);
  };

  const generateStandaloneHtml = () => {
    // Generate an offline single-file HTML version containing full UI, slots, tasks, and scripts
    const subjectsJson = JSON.stringify(subjects);
    const timetableJson = JSON.stringify(timetable);
    const tasksJson = JSON.stringify(tasks);
    const slotsJson = JSON.stringify(FPTU_SLOTS);
    const daysJson = JSON.stringify(DAYS_OF_WEEK);

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FPTU Study Budget & Time Tracker (Offline Standalone)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen p-4 sm:p-6 font-sans">
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <header class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-orange-600 flex items-center gap-2">
          <i class="fa-solid fa-graduation-cap"></i> FPTU Study Budget & Time Tracker
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">Bản xuất ngoại tuyến độc lập (Single-Page HTML - 1 Slot = 135p, Bắt đầu 07:00).</p>
      </div>
      <div id="stats-summary" class="text-xs font-semibold px-3 py-1.5 bg-orange-50 text-orange-800 rounded-xl border border-orange-200">
        Đang nạp dữ liệu...
      </div>
    </header>

    <!-- 6-Slot Timetable Section -->
    <section class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-calendar-days text-orange-500"></i> Lịch học 6 Slot/ngày & Ghi chú Task
        </h2>
        <div id="day-tabs" class="flex gap-1"></div>
      </div>
      <div id="slots-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    </section>

    <!-- Subjects Section -->
    <section class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
        <i class="fa-solid fa-book-open text-orange-500"></i> Quỹ giờ học các môn
      </h2>
      <div id="subjects-container" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
    </section>
  </div>

  <script>
    let subjects = JSON.parse(localStorage.getItem('fptu_offline_subjects') || '${subjectsJson.replace(/'/g, "\\'")}');
    let timetable = JSON.parse(localStorage.getItem('fptu_offline_timetable') || '${timetableJson.replace(/'/g, "\\'")}');
    let tasks = JSON.parse(localStorage.getItem('fptu_offline_tasks') || '${tasksJson.replace(/'/g, "\\'")}');
    const slots = ${slotsJson};
    const days = ${daysJson};
    let currentDay = 1;

    function saveAll() {
      localStorage.setItem('fptu_offline_subjects', JSON.stringify(subjects));
      localStorage.setItem('fptu_offline_timetable', JSON.stringify(timetable));
      localStorage.setItem('fptu_offline_tasks', JSON.stringify(tasks));
      render();
    }

    function renderDays() {
      const tabs = document.getElementById('day-tabs');
      tabs.innerHTML = '';
      days.forEach(d => {
        const btn = document.createElement('button');
        btn.className = "px-3 py-1 text-xs font-bold rounded-lg " + (currentDay === d.id ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700");
        btn.textContent = d.name;
        btn.onclick = () => { currentDay = d.id; render(); };
        tabs.appendChild(btn);
      });
    }

    function renderSlots() {
      const container = document.getElementById('slots-grid');
      container.innerHTML = '';
      slots.forEach(slot => {
        const assignment = timetable.find(t => t.dayOfWeek === currentDay && t.slotIndex === slot.slot);
        const subj = subjects.find(s => s.id === assignment?.subjectId);
        const slotTasks = tasks.filter(t => t.dayOfWeek === currentDay && t.slotIndex === slot.slot);

        const card = document.createElement('div');
        card.className = "p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3";
        card.innerHTML = \`
          <div class="flex justify-between items-center font-bold text-xs">
            <span class="text-orange-600">Slot \${slot.slot} (\${slot.startTime} - \${slot.endTime})</span>
            <span class="text-slate-400">135p</span>
          </div>
          <div class="text-xs font-semibold">
            \${subj ? \`<span style="color:\${subj.color}">\${subj.code} - \${subj.name}</span>\` : '<span class="text-slate-400">-- Chưa chọn môn --</span>'}
          </div>
          <div class="text-[11px] space-y-1">
            <div class="font-bold text-slate-500">Tasks (\${slotTasks.length}):</div>
            \${slotTasks.map(t => \`<div class="\${t.completed ? 'line-through text-slate-400' : 'text-slate-700'}">• \${t.title}</div>\`).join('')}
          </div>
          <button onclick="markSlot(\${currentDay}, \${slot.slot})" class="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg">
            ✓ Đã học xong Slot (+135p)
          </button>
        \`;
        container.appendChild(card);
      });
    }

    function renderSubjects() {
      const container = document.getElementById('subjects-container');
      container.innerHTML = '';
      subjects.forEach(s => {
        const spentH = (s.spentMinutes / 60).toFixed(1);
        const pct = Math.min(Math.round((s.spentMinutes / 60 / s.weeklyBudgetHours) * 100), 100);
        const div = document.createElement('div');
        div.className = "p-4 rounded-xl border border-slate-200 bg-white";
        div.innerHTML = \`
          <div class="flex justify-between items-center mb-2">
            <span class="font-mono font-bold text-sm" style="color:\${s.color}">\${s.code} - \${s.name}</span>
            <span class="text-xs font-bold">\${spentH}h / \${s.weeklyBudgetHours}h (\${pct}%)</span>
          </div>
          <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
            <div style="width: \${pct}%; background-color:\${s.color}" class="h-full"></div>
          </div>
          <button onclick="addSubjectMinutes('\${s.id}', 135)" class="w-full py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg">
            +1 Slot (135 phút)
          </button>
        \`;
        container.appendChild(div);
      });
    }

    window.markSlot = function(day, slotIndex) {
      const assignment = timetable.find(t => t.dayOfWeek === day && t.slotIndex === slotIndex);
      if (assignment?.subjectId) {
        addSubjectMinutes(assignment.subjectId, 135);
      } else if (subjects[0]) {
        addSubjectMinutes(subjects[0].id, 135);
      }
    };

    window.addSubjectMinutes = function(id, mins) {
      const s = subjects.find(x => x.id === id);
      if (s) {
        s.spentMinutes += mins;
        saveAll();
        alert('Đã cộng ' + mins + ' phút vào môn ' + s.code);
      }
    };

    function render() {
      renderDays();
      renderSlots();
      renderSubjects();
      const totalSpent = (subjects.reduce((sum, s) => sum + s.spentMinutes, 0) / 60).toFixed(1);
      const totalBudget = subjects.reduce((sum, s) => sum + s.weeklyBudgetHours, 0);
      document.getElementById('stats-summary').textContent = 'Tổng đã học: ' + totalSpent + 'h / ' + totalBudget + 'h';
    }

    render();
  <\/script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fptu-study-budget-standalone-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Cài đặt & Quản lý dữ liệu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tùy chỉnh thời lượng Slot, Pomodoro, sao lưu dữ liệu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {importStatus && (
            <div className="p-3 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              {importStatus}
            </div>
          )}

          {/* Slot Duration Setting */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Quy chuẩn 1 Slot học FPTU (phút)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="30"
                max="240"
                step="5"
                value={slotDuration}
                onChange={(e) => setSlotDuration(parseInt(e.target.value) || 135)}
                className="w-32 px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                phút (Mặc định chuẩn FPTU là 135 phút. Slot 1 bắt đầu lúc 07:00 sáng)
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSlotDuration(135)}
                className="text-xs px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 font-semibold"
              >
                135 phút (FPTU Chuẩn)
              </button>
              <button
                type="button"
                onClick={() => setSlotDuration(90)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                90 phút (2 tiết)
              </button>
              <button
                type="button"
                onClick={() => setSlotDuration(60)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                60 phút (1 giờ)
              </button>
            </div>
          </div>

          {/* Pomodoro Settings */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Thời gian học Pomodoro
              </label>
              <input
                type="number"
                min="5"
                max="90"
                value={pomodoroWork}
                onChange={(e) => setPomodoroWork(parseInt(e.target.value) || 25)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
              />
              <span className="text-[10px] text-slate-400">phút (chuẩn 25p)</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Thời gian nghỉ
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={pomodoroBreak}
                onChange={(e) => setPomodoroBreak(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
              />
              <span className="text-[10px] text-slate-400">phút (chuẩn 5p)</span>
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Âm thanh chuông báo Timer
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Phát tiếng chuông thanh thoát khi hết phiên Pomodoro hoặc hết Slot
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                soundEnabled ? 'bg-orange-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Backup & Export Data */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Sao lưu & Chuyển dữ liệu (JSON & Standalone HTML)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                <Download className="w-3.5 h-3.5" />
                Xuất file sao lưu (JSON)
              </button>

              <label className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Nhập file sao lưu (JSON)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={generateStandaloneHtml}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-xl transition border border-orange-200 dark:border-orange-800"
            >
              <FileCode className="w-3.5 h-3.5" />
              Tải file index.html độc lập (Chạy offline)
            </button>
          </div>

          {/* Danger zone */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('CẢNH BÁO: Thao tác này sẽ xóa toàn bộ dữ liệu môn học, task và lịch sử tự đánh giá để đưa về mặc định ban đầu. Bạn có chắc không?')) {
                  onResetAllData();
                  onClose();
                }
              }}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Xóa sạch dữ liệu & khôi phục mẫu FPTU
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};
