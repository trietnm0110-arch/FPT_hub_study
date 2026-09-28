import React, { useState } from 'react';
import { Subject } from '../types';
import { FPTU_SLOTS } from '../utils/storage';
import {
  Plus,
  Play,
  RotateCcw,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  ChevronDown,
  Clock,
} from 'lucide-react';

interface SubjectManagerProps {
  subjects: Subject[];
  slotDurationMinutes: number;
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onAddMinutes: (subjectId: string, minutes: number, note?: string) => void;
  onSubtractMinutes: (subjectId: string, minutes: number) => void;
  onSelectForTimer: (subjectId: string) => void;
  onLoadSamples: () => void;
}

export const SubjectManager: React.FC<SubjectManagerProps> = ({
  subjects,
  slotDurationMinutes,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onAddMinutes,
  onSubtractMinutes,
  onSelectForTimer,
  onLoadSamples,
}) => {
  const [customMinutesSubjectId, setCustomMinutesSubjectId] = useState<string | null>(null);
  const [customMinutesValue, setCustomMinutesValue] = useState<number>(60);
  const [showQuickActionMenuId, setShowQuickActionMenuId] = useState<string | null>(null);
  const [showSlotPickerSubjectId, setShowSlotPickerSubjectId] = useState<string | null>(null);

  const formatHoursMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins} phút`;
    if (mins === 0) return `${hours} giờ`;
    return `${hours}h ${mins}m`;
  };

  const handleCustomAdd = (subjectId: string) => {
    if (customMinutesValue > 0) {
      onAddMinutes(subjectId, customMinutesValue, `Tự học ${customMinutesValue}p`);
      setCustomMinutesSubjectId(null);
      setCustomMinutesValue(60);
    }
  };

  const handleSlotPick = (subjectId: string, slotNum: number, startTime: string) => {
    onAddMinutes(
      subjectId,
      slotDurationMinutes,
      `Học Slot ${slotNum} (${startTime}) - ${slotDurationMinutes}p`
    );
    setShowSlotPickerSubjectId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Môn học & Quỹ giờ tuần
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-400">
              1 Slot = {slotDurationMinutes} phút
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý ngân sách thời gian, đánh dấu nhanh Slot 1 - 6 (từ 07:00 sáng) hoặc đo lường theo giờ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subjects.length === 0 && (
            <button
              onClick={onLoadSamples}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Nạp môn mẫu FPTU
            </button>
          )}
          <button
            onClick={onAddSubject}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs shadow-orange-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Thêm môn học
          </button>
        </div>
      </div>

      {/* Grid of subjects */}
      {subjects.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Chưa có môn học nào trong kỳ
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Hãy bắt đầu bằng cách thêm các môn học như PRF192, CEA201, CSI104, MAE101 hoặc nạp dữ liệu mẫu nhanh.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onLoadSamples}
              className="px-4 py-2 text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/40 rounded-xl hover:bg-orange-100 transition"
            >
              Nạp môn mẫu FPTU
            </button>
            <button
              onClick={onAddSubject}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition"
            >
              Tự tạo môn học
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => {
            const spentHours = subject.spentMinutes / 60;
            const budgetHours = subject.weeklyBudgetHours;
            const percent = budgetHours > 0 ? Math.min(Math.round((spentHours / budgetHours) * 100), 200) : 0;
            const completedSlots = (subject.spentMinutes / slotDurationMinutes).toFixed(1);
            const targetSlots = ((budgetHours * 60) / slotDurationMinutes).toFixed(1);

            return (
              <div
                key={subject.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm text-white shadow-xs"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.code.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                            {subject.code}
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                        </div>
                        <h3 className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1">
                          {subject.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSelectForTimer(subject.id)}
                        title="Bật đồng hồ cho môn này"
                        className="p-1.5 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => onEditSubject(subject)}
                        title="Sửa môn học"
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa môn ${subject.code} - ${subject.name}?`)) {
                            onDeleteSubject(subject.id);
                          }
                        }}
                        title="Xóa môn học"
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress & Numbers */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-baseline justify-between text-xs">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                          {formatHoursMinutes(subject.spentMinutes)}
                        </span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {budgetHours}h tuần
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className="font-bold text-xs"
                          style={{
                            color: percent >= 100 ? '#10B981' : subject.color,
                          }}
                        >
                          {percent}%
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({completedSlots}/{targetSlots} slot)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(percent, 100)}%`,
                          backgroundColor: subject.color,
                        }}
                      />
                      {percent > 100 && (
                        <div
                          className="absolute top-0 bottom-0 bg-emerald-500 rounded-full opacity-60"
                          style={{
                            width: `${Math.min(percent - 100, 100)}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Tracking Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Primary Button: +1 Slot */}
                    <button
                      onClick={() => onAddMinutes(subject.id, slotDurationMinutes, `Học 1 Slot (${slotDurationMinutes}p)`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      +1 Slot ({slotDurationMinutes}p)
                    </button>

                    {/* Quick Slot Picker Button (Slot 1 -> Slot 6) */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowSlotPickerSubjectId(
                            showSlotPickerSubjectId === subject.id ? null : subject.id
                          )
                        }
                        title="Chọn Slot cụ thể (Slot 1: 07:00, Slot 2: 09:30...)"
                        className="py-1.5 px-2.5 text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 dark:hover:bg-orange-900/60 rounded-xl transition flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3 text-orange-500" />
                        Chọn Slot
                      </button>

                      {showSlotPickerSubjectId === subject.id && (
                        <div className="absolute right-0 bottom-full mb-1 z-30 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 text-xs space-y-1 animate-in fade-in zoom-in-95">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                            Đánh dấu theo Slot trong ngày:
                          </div>
                          {FPTU_SLOTS.map((slot) => (
                            <button
                              key={slot.slot}
                              onClick={() => handleSlotPick(subject.id, slot.slot, slot.startTime)}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-800 dark:text-slate-200 flex items-center justify-between"
                            >
                              <span className="font-bold">Slot {slot.slot} ({slot.startTime})</span>
                              <span className="text-[10px] text-slate-400">+{slotDurationMinutes}p</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Undo 1 Slot Button if has minutes */}
                    {subject.spentMinutes > 0 && (
                      <button
                        onClick={() => onSubtractMinutes(subject.id, slotDurationMinutes)}
                        title={`Bớt 1 Slot (-${slotDurationMinutes}p)`}
                        className="py-1.5 px-2 text-xs font-medium text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Custom minutes popover trigger */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowQuickActionMenuId(
                            showQuickActionMenuId === subject.id ? null : subject.id
                          )
                        }
                        className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {showQuickActionMenuId === subject.id && (
                        <div className="absolute right-0 bottom-full mb-1 z-20 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 text-xs space-y-1">
                          <button
                            onClick={() => {
                              onAddMinutes(subject.id, 30, 'Tự học 30p');
                              setShowQuickActionMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                          >
                            + 30 phút tự học
                          </button>
                          <button
                            onClick={() => {
                              onAddMinutes(subject.id, 45, 'Ôn bài 45p');
                              setShowQuickActionMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                          >
                            + 45 phút ôn bài
                          </button>
                          <button
                            onClick={() => {
                              onAddMinutes(subject.id, 60, 'Học 1 giờ');
                              setShowQuickActionMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                          >
                            + 1 giờ tròn
                          </button>
                          <button
                            onClick={() => {
                              setCustomMinutesSubjectId(subject.id);
                              setShowQuickActionMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold"
                          >
                            + Tùy chỉnh số phút...
                          </button>
                          {subject.spentMinutes > 0 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Đặt lại thời gian môn ${subject.code} về 0?`)) {
                                  onSubtractMinutes(subject.id, subject.spentMinutes);
                                }
                                setShowQuickActionMenuId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-medium"
                            >
                              Reset về 0 phút
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline custom minutes modal */}
                  {customMinutesSubjectId === subject.id && (
                    <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                      <input
                        type="number"
                        min="1"
                        max="600"
                        value={customMinutesValue}
                        onChange={(e) => setCustomMinutesValue(parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                        placeholder="Số phút"
                      />
                      <span className="text-xs text-slate-500">phút</span>
                      <button
                        onClick={() => handleCustomAdd(subject.id)}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setCustomMinutesSubjectId(null)}
                        className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                      >
                        Đóng
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
