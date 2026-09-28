import React from 'react';
import {
  GraduationCap,
  Calendar,
  Sun,
  Moon,
  Settings,
  Sparkles,
  History,
  Clock,
} from 'lucide-react';

interface HeaderProps {
  currentWeekNumber: number;
  slotDurationMinutes: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenReflection: () => void;
  onOpenHistory: () => void;
  hasPastReflections: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentWeekNumber,
  slotDurationMinutes,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenReflection,
  onOpenHistory,
  hasPastReflections,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
                FPTU Study Budget
              </h1>
              <span className="hidden xs:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40">
                1 Slot = {slotDurationMinutes}p
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Quản lý thời gian học theo Slot & Tự đánh giá hiệu quả tuần
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Week Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60">
            <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>Tuần {currentWeekNumber}</span>
          </div>

          {/* Weekly Reflection Button */}
          <button
            onClick={onOpenReflection}
            title="Làm bài tự đánh giá tuần & Reset tuần mới"
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-xl shadow-xs shadow-orange-600/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Tổng kết tuần</span>
          </button>

          {/* History Button */}
          {hasPastReflections && (
            <button
              onClick={onOpenHistory}
              title="Lịch sử các tuần trước"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              <History className="w-4 h-4" />
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Cài đặt hệ thống & Sao lưu"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
