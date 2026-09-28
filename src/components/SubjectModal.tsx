import React, { useState, useEffect } from 'react';
import { Subject } from '../types';
import { COLOR_PRESETS } from '../utils/storage';
import { X, BookOpen, Clock, Palette, Check } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Omit<Subject, 'id' | 'createdAt' | 'spentMinutes'> & { id?: string }) => void;
  subjectToEdit?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjectToEdit,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [weeklyBudgetHours, setWeeklyBudgetHours] = useState<number>(5);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subjectToEdit) {
      setCode(subjectToEdit.code);
      setName(subjectToEdit.name);
      setColor(subjectToEdit.color);
      setWeeklyBudgetHours(subjectToEdit.weeklyBudgetHours);
    } else {
      setCode('');
      setName('');
      setColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]);
      setWeeklyBudgetHours(5);
    }
    setError('');
  }, [subjectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Vui lòng nhập mã môn học (ví dụ: PRF192)');
      return;
    }
    if (!name.trim()) {
      setError('Vui lòng nhập tên môn học');
      return;
    }
    if (weeklyBudgetHours <= 0) {
      setError('Quỹ giờ học tuần phải lớn hơn 0');
      return;
    }

    onSave({
      ...(subjectToEdit ? { id: subjectToEdit.id } : {}),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      color,
      weeklyBudgetHours: Number(weeklyBudgetHours),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {subjectToEdit ? 'Chỉnh sửa Môn học' : 'Thêm Môn học mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Mã môn
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PRF192"
                maxLength={10}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold uppercase focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Tên môn học
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lập trình C cơ bản"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Quỹ giờ học mục tiêu / tuần (Hours Budget)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="50"
                value={weeklyBudgetHours}
                onChange={(e) => setWeeklyBudgetHours(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-20 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition"
                required
              />
              <Clock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <span className="absolute right-3 top-3 text-xs font-medium text-slate-400">
                giờ / tuần (~{Math.round((weeklyBudgetHours * 60) / 135 * 10) / 10} slot)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Khuyến nghị FPTU: 4 - 8 giờ/môn mỗi tuần tùy tín chỉ và độ khó.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Màu nhận diện môn học
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {color.toLowerCase() === c.toLowerCase() && (
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  )}
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  title="Chọn màu tùy chỉnh"
                />
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">
                  {color}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-xl shadow-xs shadow-orange-600/30 transition-colors"
            >
              {subjectToEdit ? 'Cập nhật môn học' : 'Lưu môn học'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
