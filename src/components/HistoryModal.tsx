import React from 'react';
import { WeeklyReflection } from '../types';
import { X, Star, Calendar, Clock, Award, ChevronRight } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reflections: WeeklyReflection[];
  onDeleteReflection?: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  reflections,
  onDeleteReflection,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 rounded-xl text-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Lịch sử Tự đánh giá các Tuần
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Theo dõi sự tiến bộ và hành trình kỷ luật học tập qua từng tuần
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

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {reflections.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Chưa có bản ghi tổng kết tuần nào. Hãy hoàn thành tuần học đầu tiên và bấm "Tổng kết tuần & Tự đánh giá"!
            </div>
          ) : (
            reflections
              .sort((a, b) => b.weekNumber - a.weekNumber)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Tuần {item.weekNumber}
                        </span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= item.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Ngày tạo: {new Date(item.createdAt).toLocaleDateString('vi-VN')} · Đã học: {item.totalHoursStudied}h / {item.totalBudgetHours}h
                      </div>
                    </div>

                    {onDeleteReflection && (
                      <button
                        onClick={() => {
                          if (window.confirm('Xóa bản ghi tuần này?')) {
                            onDeleteReflection(item.id);
                          }
                        }}
                        className="text-xs text-slate-400 hover:text-red-500 p-1"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Môn tốn nhiều thời gian nhưng chưa hiệu quả:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5 pl-2 border-l-2 border-orange-400">
                        {item.mostTimeConsumingSubject}
                      </p>
                    </div>

                    {item.biggestObstacle && (
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Rào cản / trở ngại:
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5 pl-2 border-l-2 border-red-400">
                          {item.biggestObstacle}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Điều chỉnh tuần kế tiếp:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5 pl-2 border-l-2 border-emerald-400">
                        {item.adjustmentsForNextWeek}
                      </p>
                    </div>
                  </div>

                  {item.subjectSnapshots && item.subjectSnapshots.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 text-[11px]">
                      {item.subjectSnapshots.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-1 font-mono">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          <span>{s.code}:</span>
                          <span className="font-bold">{s.spentHours}h</span>
                          <span className="text-slate-400">/{s.budgetHours}h</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
