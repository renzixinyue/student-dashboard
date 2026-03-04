import { create } from 'zustand';

export interface LogEntry {
  id: string;
  timestamp: number;
  action: string;
  scoreChange: number;
  reason: string;
}

export interface Student {
  id: string;
  name: string;
  groupId: number;
  score: number;
  attendance: {
    present: number;
    absent: number;
    late: number;
  };
  history: LogEntry[];
}

export interface Session {
  id: string;
  timestamp: number;
}

export interface DB {
  students: Student[];
  sessions: Session[];
}

interface DashboardState {
  data: DB | null;
  loading: boolean;
  fetchData: () => Promise<void>;
  startClass: () => Promise<void>;
  updateScore: (target: 'student' | 'group', id: string | number, points: number, reason: string) => Promise<void>;
  markAttendance: (studentId: string, status: 'absent' | 'late') => Promise<void>;
  completeTask: (studentId: string) => Promise<void>;
  completeTaskAll: (taskName: string) => Promise<void>;
  resetSystem: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || '/api/dashboard';

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  loading: false,
  fetchData: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_URL}/data`);
      const data = await res.json();
      set({ data });
    } catch (e) {
      console.error(e);
    } finally {
      set({ loading: false });
    }
  },
  startClass: async () => {
    await fetch(`${API_URL}/start-class`, { method: 'POST' });
    get().fetchData();
  },
  updateScore: async (target, id, points, reason) => {
    await fetch(`${API_URL}/update-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, id, points, reason })
    });
    get().fetchData();
  },
  markAttendance: async (studentId, status) => {
    await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, status })
    });
    get().fetchData();
  },
  completeTask: async (studentId) => {
    await fetch(`${API_URL}/task-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId })
    });
    get().fetchData();
  },
  completeTaskAll: async (taskName) => {
    await fetch(`${API_URL}/task-complete-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskName })
    });
    get().fetchData();
  },
  resetSystem: async () => {
    await fetch(`${API_URL}/reset`, { method: 'POST' });
    get().fetchData();
  }
}));
