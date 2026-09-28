import React from 'react';
import { Subject } from '../types';
import {
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface WeeklyAnalyticsProps {
  subjects: Subject[];
  slotDurationMinutes: number;
  onOpenReflection: () => void;
  onOpenHistory: () => void;
  hasPastReflections: boolean;
}

export const WeeklyAnalytics: React.FC<WeeklyAnalyticsProps> = ({
  subjects,
  slotDurationMinutes,
  onOpenReflection,
  onOpenHistory,
  hasPastReflections,
}) => {
  const totalBudgetHours = subjects.reduce((sum, s) => sum + s.weeklyBudgetHours, 0);
  const totalSpentMinutes = subjects.reduce((sum, s) => sum + s.spentMinutes, 0);
  const totalSpentHours = Math.round((totalSpentMinutes / 60) * 10) / 10;
  const overallPercent =
    totalBudgetHours > 0
      ? Math.round((totalSpentHours / totalBudgetHours) * 100)
      : 0;
  const totalSlotsStudied = (totalSpentMinutes / slotDurationMinutes).toFixed(1);

  // Top subject studied
  const sortedByTime = [...subjects].sort((a, b) => b.spentMinutes - a.spentMinutes);
  const topSubject = sortedByTime[0]?.spentMinutes > 0 ? sortedByTime[0] : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tổng kết Tuần & Quỹ giờ học
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {totalSlotsStudied} slot đã hoàn thành
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            So sánh thời gian tự học thực tế với ngân sách đã cam kết
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPastReflections && (
            <button
              onClick={onOpenHistory}
              className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-orange-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Lịch sử các tuần trước
            </button>
          )}
          <button
            onClick={onOpenReflection}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-xl shadow-xs shadow-orange-600/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            Tổng kết tuần & Tự đánh giá
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Tổng giờ đã học
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {totalSpentHours}
            </span>
            <span className="text-xs text-slate-500 font-medium">h</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ≈ {totalSlotsStudied} slot ({slotDurationMinutes}p)
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Quỹ ngân sách tuần
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {totalBudgetHours}
            </span>
            <span className="text-xs text-slate-500 font-medium">h</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Mục tiêu cho {subjects.length} môn
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Tỷ lệ hoàn thành
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono ${
                overallPercent >= 100
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : overallPercent >= 70
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {overallPercent}%
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {overallPercent >= 100
              ? 'Đạt chỉ tiêu tuần!'
              : `Còn thiếu ${(totalBudgetHours - totalSpentHours).toFixed(1)}h`}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Học nhiều nhất
          </div>
          <div className="flex items-baseline gap-1 truncate font-mono font-bold text-base text-slate-900 dark:text-white">
            {topSubject ? topSubject.code : '--'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {topSubject ? `${Math.round(topSubject.spentMinutes / 60 * 10) / 10}h đã nạp` : 'Chưa có dữ liệu'}
          </div>
        </div>
      </div>

      {/* Stacked Visual Bar for Distribution */}
      {totalSpentMinutes > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Phân bổ thời gian giữa các môn:</span>
            <span>100% thời gian tuần</span>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {subjects
              .filter((s) => s.spentMinutes > 0)
              .map((s) => {
                const sharePercent = ((s.spentMinutes / totalSpentMinutes) * 100).toFixed(1);
                return (
                  <div
                    key={s.id}
                    title={`${s.code}: ${sharePercent}% (${Math.round((s.spentMinutes / 60) * 10) / 10}h)`}
                    style={{
                      width: `${sharePercent}%`,
                      backgroundColor: s.color,
                    }}
                    className="h-full hover:opacity-90 transition-opacity"
                  />
                );
              })}
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
            {subjects
              .filter((s) => s.spentMinutes > 0)
              .map((s) => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-mono font-semibold">{s.code}</span>
                  <span className="text-slate-400">
                    ({((s.spentMinutes / totalSpentMinutes) * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Detailed comparison list */}
      <div className="space-y-2.5 pt-2">
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Chi tiết từng môn so với ngân sách mục tiêu:
        </h4>
        <div className="space-y-2">
          {subjects.map((s) => {
            const spentH = Math.round((s.spentMinutes / 60) * 10) / 10;
            const targetH = s.weeklyBudgetHours;
            const pct = targetH > 0 ? Math.round((spentH / targetH) * 100) : 0;
            const isCompleted = pct >= 100;

            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <div className="truncate">
                    <span className="font-mono font-bold text-slate-900 dark:text-white mr-2">
                      {s.code}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
                      {s.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-24 sm:w-36 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                  <div className="w-20 text-right font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">{spentH}h</span>
                    <span className="text-slate-400">/{targetH}h</span>
                  </div>
                  <div className="w-12 text-right">
                    <span
                      className={`font-bold ${
                        isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Callout to trigger reflection */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border border-orange-200/80 dark:border-orange-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-orange-950 dark:text-orange-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            Nhật ký tự vấn & Đánh giá hiệu quả (Metacognition)
          </h4>
          <p className="text-[11px] text-orange-800 dark:text-orange-300/80 mt-0.5">
            Tự nhìn nhận môn nào tốn thời gian nhưng chưa hiệu quả và lên chiến lược mới cho tuần tới.
          </p>
        </div>
        <button
          onClick={onOpenReflection}
          className="self-start sm:self-center shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-orange-700 dark:text-orange-300 bg-white dark:bg-slate-900 rounded-lg shadow-xs hover:bg-orange-50 transition"
        >
          Làm bài tự đánh giá
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
