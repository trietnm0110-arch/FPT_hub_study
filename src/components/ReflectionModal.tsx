import React, { useState } from 'react';
import { Subject, WeeklyReflection } from '../types';
import {
  X,
  Star,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  currentWeekNumber: number;
  slotDurationMinutes: number;
  onSaveAndResetWeek: (reflection: Omit<WeeklyReflection, 'id' | 'createdAt'>) => void;
  onSaveOnly: (reflection: Omit<WeeklyReflection, 'id' | 'createdAt'>) => void;
}

const COMMON_OBSTACLES = [
  'Bị xao nhãng bởi mạng xã hội & game',
  'Thức khuya dậy trễ, mệt mỏi vào Slot sáng',
  'Tài liệu / Slide tiếng Anh khó hiểu',
  'Code lỗi Debug mãi không ra',
  'Dồn bài tập sát hạn chót nộp',
  'Chưa chuẩn bị bài trước khi lên giảng đường',
];

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  onClose,
  subjects,
  currentWeekNumber,
  slotDurationMinutes,
  onSaveAndResetWeek,
  onSaveOnly,
}) => {
  const [rating, setRating] = useState<number>(4);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [mostTimeConsumingSubject, setMostTimeConsumingSubject] = useState<string>('');
  const [biggestObstacle, setBiggestObstacle] = useState<string>('');
  const [adjustmentsForNextWeek, setAdjustmentsForNextWeek] = useState<string>('');
  const [keyTakeaway, setKeyTakeaway] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const totalSpentMinutes = subjects.reduce((sum, s) => sum + s.spentMinutes, 0);
  const totalHoursStudied = Math.round((totalSpentMinutes / 60) * 10) / 10;
  const totalBudgetHours = subjects.reduce((sum, s) => sum + s.weeklyBudgetHours, 0);

  const starLabels = [
    '',
    '1 Sao: Rất mất tập trung, bị trễ deadline',
    '2 Sao: Dưới kỳ vọng, chưa nỗ lực hết mình',
    '3 Sao: Bình thường, đạt mức vừa đủ',
    '4 Sao: Tốt! Tập trung cao và hoàn thành tốt',
    '5 Sao: Xuất sắc! Vượt chỉ tiêu và bứt phá',
  ];

  const buildReflectionData = (): Omit<WeeklyReflection, 'id' | 'createdAt'> => {
    return {
      weekNumber: currentWeekNumber,
      year: new Date().getFullYear(),
      startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
      endDate: new Date().toISOString(),
      rating,
      mostTimeConsumingSubject: mostTimeConsumingSubject || 'Không có',
      biggestObstacle: biggestObstacle || 'Không có',
      adjustmentsForNextWeek: adjustmentsForNextWeek || 'Duy trì phong độ',
      keyTakeaway: keyTakeaway || '',
      totalHoursStudied,
      totalBudgetHours,
      subjectSnapshots: subjects.map((s) => ({
        code: s.code,
        name: s.name,
        spentHours: Math.round((s.spentMinutes / 60) * 10) / 10,
        budgetHours: s.weeklyBudgetHours,
        color: s.color,
      })),
    };
  };

  const handleSaveAndReset = () => {
    if (!mostTimeConsumingSubject.trim()) {
      setError('Vui lòng trả lời câu hỏi tự vấn về môn học tiêu tốn nhiều thời gian nhất.');
      return;
    }
    if (!adjustmentsForNextWeek.trim()) {
      setError('Vui lòng ghi lại ít nhất 1 điều cần điều chỉnh cho tuần tới.');
      return;
    }

    onSaveAndResetWeek(buildReflectionData());
    onClose();
  };

  const handleSaveWithoutReset = () => {
    if (!mostTimeConsumingSubject.trim() || !adjustmentsForNextWeek.trim()) {
      setError('Vui lòng điền các câu hỏi tự vấn trước khi lưu.');
      return;
    }
    onSaveOnly(buildReflectionData());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-600 rounded-xl text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tổng kết Tuần {currentWeekNumber} & Nhật ký Tự đánh giá
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Phương pháp Metacognitive Reflection - Tự nhận thức để tiến bộ liên tục
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          {/* Weekly Numbers Snapshot */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Tổng giờ đã học: </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {totalHoursStudied}h / {totalBudgetHours}h
              </span>
              <span className="text-slate-400 ml-1">
                ({Math.round((totalSpentMinutes / slotDurationMinutes) * 10) / 10} slot)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {subjects.map((s) => (
                <div key={s.id} className="flex items-center gap-1 font-mono text-[11px]">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>
                    {s.code}: {Math.round((s.spentMinutes / 60) * 10) / 10}h
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 1. Star Rating: Satisfaction & Focus */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              1. Mức độ hài lòng & tập trung trong tuần qua:
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                {starLabels[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* 2. Question: Most time consuming subject */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-orange-600" />
              2. Môn học nào tiêu tốn nhiều thời gian nhất nhưng chưa hiệu quả?
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Xác định môn học bạn đã cày nhiều giờ nhưng kết quả bài Lab / Quiz chưa như mong muốn:
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setMostTimeConsumingSubject(`Môn ${s.code} (${s.name}): `)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-500 font-mono text-slate-700 dark:text-slate-300 transition"
                >
                  + {s.code}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setMostTimeConsumingSubject('Các môn đều phân bổ đều và hiệu quả.')}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-600 dark:text-slate-400 transition"
              >
                + Đều hiệu quả tốt
              </button>
            </div>
            <textarea
              rows={2}
              value={mostTimeConsumingSubject}
              onChange={(e) => setMostTimeConsumingSubject(e.target.value)}
              placeholder="Ví dụ: Môn PRF192 tốn nhiều thời gian làm Pointer nhưng chưa nắm vững lý thuyết..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition"
              required
            />
          </div>

          {/* 3. Question: Obstacles & Distractions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              3. Rào cản hoặc lý do làm gián đoạn thời gian học tuần này?
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_OBSTACLES.map((obs) => (
                <button
                  key={obs}
                  type="button"
                  onClick={() =>
                    setBiggestObstacle((prev) =>
                      prev ? `${prev}; ${obs}` : obs
                    )
                  }
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                >
                  + {obs}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={biggestObstacle}
              onChange={(e) => setBiggestObstacle(e.target.value)}
              placeholder="Ghi nhận rào cản bạn gặp phải..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition"
            />
          </div>

          {/* 4. Question: Actionable adjustments for next week */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              4. Cần điều chỉnh gì cụ thể cho tuần tới để đạt hiệu quả cao hơn?
            </label>
            <textarea
              rows={2}
              value={adjustmentsForNextWeek}
              onChange={(e) => setAdjustmentsForNextWeek(e.target.value)}
              placeholder="Ví dụ: Dành trọn Slot 2 Thứ 4 để giải hết Lab C, tắt thông báo điện thoại khi bật Pomodoro..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition"
              required
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Đóng
          </button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSaveWithoutReset}
              className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition"
            >
              Chỉ lưu đánh giá
            </button>

            {/* Crucial button: Start New Week & Reset Spent Minutes */}
            <button
              type="button"
              onClick={handleSaveAndReset}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-xl shadow-xs shadow-orange-600/30 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Lưu & Bắt đầu tuần mới (Reset giờ)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
