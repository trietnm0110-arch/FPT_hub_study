export interface Subject {
  id: string;
  code: string; // e.g. PRF192
  name: string; // e.g. Lập trình C cơ bản
  color: string; // hex color
  weeklyBudgetHours: number; // in hours, e.g. 6.0
  spentMinutes: number; // logged minutes this week
  createdAt: number;
}

export interface SlotConfig {
  slot: number; // 1 to 6
  startTime: string; // e.g. "07:00"
  endTime: string; // e.g. "09:15"
  durationMinutes: number; // 135
}

export interface DaySlotAssignment {
  id: string; // key: `${dayOfWeek}-${slotIndex}`
  dayOfWeek: number; // 1 = Thứ 2, 2 = Thứ 3, ..., 6 = Thứ 7, 0 = Chủ nhật
  slotIndex: number; // 1 to 6
  subjectId?: string;
  room?: string; // phòng học, e.g. "BE-302"
  isStudied?: boolean; // marked as completed for this slot
  note?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  subjectId?: string; // linked subject
  dayOfWeek?: number; // 1 = Thứ 2, ..., 0 = Chủ nhật
  slotIndex?: number; // 1 to 6 (attached directly to 1 of 6 slots)
  targetSlot?: string; // custom label if not slot 1-6
  dueDate?: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt?: number;
  createdAt: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  slotIndex?: number;
  durationMinutes: number;
  mode: 'slot' | 'pomodoro' | 'stopwatch' | 'manual';
  note?: string;
  timestamp: number;
}

export interface WeeklyReflection {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  rating: number; // 1 - 5 stars
  mostTimeConsumingSubject: string; // Question 1
  biggestObstacle: string; // Question 2
  adjustmentsForNextWeek: string; // Question 3
  keyTakeaway: string;
  totalHoursStudied: number;
  totalBudgetHours: number;
  subjectSnapshots: {
    code: string;
    name: string;
    spentHours: number;
    budgetHours: number;
    color: string;
  }[];
  createdAt: number;
}

export interface AppSettings {
  slotDurationMinutes: number; // default 135
  slot1StartTime: string; // "07:00"
  pomodoroWorkMinutes: number; // 25
  pomodoroBreakMinutes: number; // 5
  soundEnabled: boolean;
  darkMode: boolean;
  currentWeekNumber: number;
  weekStartDate: string;
}
