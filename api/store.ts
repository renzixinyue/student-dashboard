import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'api', 'data', 'db.json');
const STUDENTS_SOURCE = path.join(process.cwd(), 'src', 'data', 'students.json');

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

function seed(): DB {
  try {
    const raw = fs.readFileSync(STUDENTS_SOURCE, 'utf-8');
    const sourceData = JSON.parse(raw);
    
    // Shuffle
    const shuffled = sourceData.sort(() => 0.5 - Math.random());
    
    // Assign to 6 groups using modulo
    // We want to ensure 虚拟生01 is in Group 5 and 虚拟生02 is in Group 6 if they exist.
    // Or simpler: Just rely on modulo if the total count aligns.
    // Total students = 34 + 2 = 36. 36 % 6 == 0. So each group gets 6 students.
    // However, the user asked to "Add one virtual student to Group 5 and one to Group 6".
    // Since shuffling happens, we can't guarantee where they land with simple modulo unless we force it.
    
    const students: Student[] = [];
    const virtualStudents = shuffled.filter((s: any) => s['名字'].startsWith('虚拟生'));
    const realStudents = shuffled.filter((s: any) => !s['名字'].startsWith('虚拟生'));

    // Distribute real students first
    let counter = 0;
    realStudents.forEach((s: any) => {
        students.push({
            id: String(s['学号']),
            name: s['名字'],
            groupId: (counter % 6) + 1,
            score: 0,
            attendance: { present: 0, absent: 0, late: 0 },
            history: []
        });
        counter++;
    });

    // Manually place virtual students
    const v1 = virtualStudents.find((s: any) => s['名字'] === '虚拟生01');
    const v2 = virtualStudents.find((s: any) => s['名字'] === '虚拟生02');

    if (v1) {
        students.push({
            id: String(v1['学号']),
            name: v1['名字'],
            groupId: 5,
            score: 0,
            attendance: { present: 0, absent: 0, late: 0 },
            history: []
        });
    }
    if (v2) {
        students.push({
            id: String(v2['学号']),
            name: v2['名字'],
            groupId: 6,
            score: 0,
            attendance: { present: 0, absent: 0, late: 0 },
            history: []
        });
    }

    return {
      students,
      sessions: []
    };
  } catch (e) {
    console.error("Failed to seed DB", e);
    return { students: [], sessions: [] };
  }
}

export const resetDB = (): DB => {
  const data = seed();
  saveDB(data);
  return data;
};

export const getDB = (): DB => {
  if (!fs.existsSync(DB_PATH)) {
    const data = seed();
    saveDB(data);
    return data;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
};

export const saveDB = (data: DB) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};
