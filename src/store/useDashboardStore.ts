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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      set({ data });
    } catch (e) {
      console.error("Failed to fetch data:", e);
      // Initialize with empty data structure on error to avoid infinite loading
      set({ data: { students: [], sessions: [] } });
    } finally {
      set({ loading: false });
    }
  },
  startClass: async () => {
    try {
      const res = await fetch(`${API_URL}/start-class`, { method: 'POST' });
      if (!res.ok) throw new Error('Network response was not ok');
      const result = await res.json();
      if (result.success && result.db) {
        set({ data: result.db });
      } else {
        get().fetchData();
      }
    } catch (e) {
      console.error("Failed to start class:", e);
    }
  },
  updateScore: async (target, id, points, reason) => {
    try {
      const res = await fetch(`${API_URL}/update-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, id, points, reason })
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const result = await res.json();
      if (result.success && result.db) {
        set({ data: result.db });
      } else {
        get().fetchData();
      }
    } catch (e) {
      console.error("Failed to update score:", e);
    }
  },
  markAttendance: async (studentId, status) => {
    try {
      const res = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, status })
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const result = await res.json();
      if (result.success && result.db) {
        set({ data: result.db });
      } else {
        get().fetchData();
      }
    } catch (e) {
      console.error("Failed to mark attendance:", e);
    }
  },
  completeTask: async (studentId) => {
    try {
      const res = await fetch(`${API_URL}/task-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const result = await res.json();
      if (result.success && result.db) {
        set({ data: result.db });
      } else {
        get().fetchData();
      }
    } catch (e) {
      console.error("Failed to complete task:", e);
    }
  },
  completeTaskAll: async (taskName) => {
    try {
      const res = await fetch(`${API_URL}/task-complete-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskName })
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const result = await res.json();
      if (result.success && result.db) {
        set({ data: result.db });
      } else {
        get().fetchData();
      }
    } catch (e) {
      console.error("Failed to complete task for all:", e);
    }
  },
  resetSystem: async () => {
    try {
      const res = await fetch(`${API_URL}/reset`, { method: 'POST' });
      if (!res.ok) throw new Error('Network response was not ok');
      const result = await res.json();
      if (result.success && result.db) {
        set({ data: result.db });
      } else {
        get().fetchData();
      }
    } catch (e) {
      console.error("Failed to reset system:", e);
    }
  }
}));
