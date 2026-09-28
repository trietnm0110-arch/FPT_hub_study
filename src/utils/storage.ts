import {
  Subject,
  TaskItem,
  StudySession,
  WeeklyReflection,
  AppSettings,
  SlotConfig,
  DaySlotAssignment,
} from '../types';

const STORAGE_KEYS = {
  SUBJECTS: 'fptu_study_subjects_v1',
  TASKS: 'fptu_study_tasks_v1',
  SESSIONS: 'fptu_study_sessions_v1',
  REFLECTIONS: 'fptu_study_reflections_v1',
  SETTINGS: 'fptu_study_settings_v1',
  TIMETABLE: 'fptu_study_timetable_v1',
};

export const COLOR_PRESETS = [
  '#F26F21', // FPT Orange
  '#2563EB', // Tech Blue
  '#10B981', // Emerald Green
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

export const FPTU_SLOTS: SlotConfig[] = [
  { slot: 1, startTime: '07:00', endTime: '09:15', durationMinutes: 135 },
  { slot: 2, startTime: '09:30', endTime: '11:45', durationMinutes: 135 },
  { slot: 3, startTime: '12:30', endTime: '14:45', durationMinutes: 135 },
  { slot: 4, startTime: '15:00', endTime: '17:15', durationMinutes: 135 },
  { slot: 5, startTime: '17:30', endTime: '19:45', durationMinutes: 135 },
  { slot: 6, startTime: '20:00', endTime: '22:15', durationMinutes: 135 },
];

export const DAYS_OF_WEEK = [
  { id: 1, name: 'Thứ 2', shortName: 'T2' },
  { id: 2, name: 'Thứ 3', shortName: 'T3' },
  { id: 3, name: 'Thứ 4', shortName: 'T4' },
  { id: 4, name: 'Thứ 5', shortName: 'T5' },
  { id: 5, name: 'Thứ 6', shortName: 'T6' },
  { id: 6, name: 'Thứ 7', shortName: 'T7' },
  { id: 0, name: 'Chủ Nhật', shortName: 'CN' },
];

export const FPTU_SAMPLE_SUBJECTS: Subject[] = [
  {
    id: 'subj-1',
    code: 'PRF192',
    name: 'Programming Fundamentals (C)',
    color: '#F26F21',
    weeklyBudgetHours: 7.0,
    spentMinutes: 270, // 2 slots
    createdAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'subj-2',
    code: 'CEA201',
    name: 'Computer Organization & Architecture',
    color: '#2563EB',
    weeklyBudgetHours: 5.0,
    spentMinutes: 135, // 1 slot
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'subj-3',
    code: 'MAE101',
    name: 'Mathematics for Engineering',
    color: '#10B981',
    weeklyBudgetHours: 6.0,
    spentMinutes: 135,
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'subj-4',
    code: 'CSI104',
    name: 'Introduction to Computer Science',
    color: '#8B5CF6',
    weeklyBudgetHours: 4.5,
    spentMinutes: 135,
    createdAt: Date.now() - 3 * 86400000,
  },
];

export const FPTU_SAMPLE_TIMETABLE: DaySlotAssignment[] = [
  { id: '1-1', dayOfWeek: 1, slotIndex: 1, subjectId: 'subj-1', room: 'BE-302', isStudied: true },
  { id: '1-3', dayOfWeek: 1, slotIndex: 3, subjectId: 'subj-2', room: 'DE-201', isStudied: false },
  { id: '2-2', dayOfWeek: 2, slotIndex: 2, subjectId: 'subj-3', room: 'AL-105', isStudied: true },
  { id: '3-1', dayOfWeek: 3, slotIndex: 1, subjectId: 'subj-1', room: 'BE-302', isStudied: true },
  { id: '3-4', dayOfWeek: 3, slotIndex: 4, subjectId: 'subj-4', room: 'Online', isStudied: false },
  { id: '4-2', dayOfWeek: 4, slotIndex: 2, subjectId: 'subj-2', room: 'DE-201', isStudied: true },
  { id: '5-3', dayOfWeek: 5, slotIndex: 3, subjectId: 'subj-3', room: 'AL-105', isStudied: false },
  { id: '6-1', dayOfWeek: 6, slotIndex: 1, subjectId: 'subj-4', room: 'Online', isStudied: true },
];

export const FPTU_SAMPLE_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Làm Workshop 3 Pointer & Con trỏ',
    subjectId: 'subj-1',
    dayOfWeek: 1,
    slotIndex: 1,
    targetSlot: 'Slot 1 (07:00 - 09:15)',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    priority: 'high',
    completed: true,
    completedAt: Date.now() - 3600000,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'task-2',
    title: 'Đọc Slide Chapter 4: Memory Hierarchy',
    subjectId: 'subj-2',
    dayOfWeek: 1,
    slotIndex: 3,
    targetSlot: 'Slot 3 (12:30 - 14:45)',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    priority: 'medium',
    completed: false,
    createdAt: Date.now() - 43200000,
  },
  {
    id: 'task-3',
    title: 'Làm bài tập Đạo hàm & Ma trận',
    subjectId: 'subj-3',
    dayOfWeek: 2,
    slotIndex: 2,
    targetSlot: 'Slot 2 (09:30 - 11:45)',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    priority: 'high',
    completed: false,
    createdAt: Date.now() - 20000000,
  },
  {
    id: 'task-4',
    title: 'Nộp Quiz Coursera tuần 2',
    subjectId: 'subj-4',
    dayOfWeek: 3,
    slotIndex: 4,
    targetSlot: 'Slot 4 (15:00 - 17:15)',
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    priority: 'low',
    completed: false,
    createdAt: Date.now() - 10000000,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  slotDurationMinutes: 135,
  slot1StartTime: '07:00',
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  soundEnabled: true,
  darkMode: false,
  currentWeekNumber: 1,
  weekStartDate: new Date().toISOString().split('T')[0],
};

export const StorageService = {
  getSubjects(): Subject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load subjects', e);
    }
    return FPTU_SAMPLE_SUBJECTS;
  },

  saveSubjects(subjects: Subject[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch (e) {
      console.error('Failed to save subjects', e);
    }
  },

  getTimetable(): DaySlotAssignment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load timetable', e);
    }
    return FPTU_SAMPLE_TIMETABLE;
  },

  saveTimetable(timetable: DaySlotAssignment[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
    } catch (e) {
      console.error('Failed to save timetable', e);
    }
  },

  getTasks(): TaskItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load tasks', e);
    }
    return FPTU_SAMPLE_TASKS;
  },

  saveTasks(tasks: TaskItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  },

  getSessions(): StudySession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load sessions', e);
    }
    return [];
  },

  saveSessions(sessions: StudySession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions', e);
    }
  },

  getReflections(): WeeklyReflection[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load reflections', e);
    }
    return [];
  },

  saveReflections(reflections: WeeklyReflection[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
    } catch (e) {
      console.error('Failed to save reflections', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  exportAllData(): string {
    const backup = {
      subjects: this.getSubjects(),
      timetable: this.getTimetable(),
      tasks: this.getTasks(),
      sessions: this.getSessions(),
      reflections: this.getReflections(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.subjects)) this.saveSubjects(parsed.subjects);
      if (Array.isArray(parsed.timetable)) this.saveTimetable(parsed.timetable);
      if (Array.isArray(parsed.tasks)) this.saveTasks(parsed.tasks);
      if (Array.isArray(parsed.sessions)) this.saveSessions(parsed.sessions);
      if (Array.isArray(parsed.reflections)) this.saveReflections(parsed.reflections);
      if (parsed.settings) this.saveSettings(parsed.settings);
      return true;
    } catch (e) {
      console.error('Failed to parse import data', e);
      return false;
    }
  },

  resetWeekData(subjects: Subject[], timetable: DaySlotAssignment[]): { subjects: Subject[]; timetable: DaySlotAssignment[] } {
    const resetSubjects = subjects.map((s) => ({
      ...s,
      spentMinutes: 0,
    }));
    const resetTimetable = timetable.map((t) => ({
      ...t,
      isStudied: false,
    }));
    this.saveSubjects(resetSubjects);
    this.saveTimetable(resetTimetable);
    return { subjects: resetSubjects, timetable: resetTimetable };
  },
};
