import fs from 'fs';
import path from 'path';
import { supabase } from './supabaseClient.js';

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

function generateSeedData(): DB {
  try {
    const raw = fs.readFileSync(STUDENTS_SOURCE, 'utf-8');
    const sourceData = JSON.parse(raw);
    
    // Shuffle
    const shuffled = sourceData.sort(() => 0.5 - Math.random());
    
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
    // Fallback data if file read fails (e.g. in Vercel environment where file might not be accessible)
    // Actually, in Vercel, we can read files if configured correctly.
    // But let's provide a robust fallback just in case.
    const fallbackStudents = [
        {"学号":2407020301,"名字":"陈博轩"},{"学号":2407020302,"名字":"初玉龙"},{"学号":2407020303,"名字":"高嘉禹"},{"学号":2407020304,"名字":"郭浩远"},{"学号":2407020306,"名字":"菅晋源"},{"学号":2407020307,"名字":"刘映棋"},{"学号":2407020308,"名字":"芦兴康"},{"学号":2407020309,"名字":"鲁子桢"},{"学号":2407020310,"名字":"栾添"},{"学号":2407020311,"名字":"马鹤宁"},{"学号":2407020313,"名字":"乔冉阳"},{"学号":2407020314,"名字":"乔志轩"},{"学号":2407020315,"名字":"秦朔"},{"学号":2407020316,"名字":"秦兴宇"},{"学号":2407020318,"名字":"田绍暄"},{"学号":2407020319,"名字":"王冰洋"},{"学号":2407020320,"名字":"王超"},{"学号":2407020321,"名字":"王柯皓"},{"学号":2407020322,"名字":"吴嘉宇"},{"学号":2407020323,"名字":"郗响洋"},{"学号":2407020324,"名字":"许雄峰"},{"学号":2407020325,"名字":"薛凯勋"},{"学号":2407020326,"名字":"阎佳华"},{"学号":2407020327,"名字":"杨宏伟"},{"学号":2407020328,"名字":"张宝中"},{"学号":2407020329,"名字":"张博涵"},{"学号":2407020330,"名字":"张浩东"},{"学号":2407020331,"名字":"张凌瑄"},{"学号":2407020333,"名字":"赵青松"},{"学号":2407020334,"名字":"朱旭彬"},{"学号":2403020124,"名字":"温博宇"},{"学号":2404010103,"名字":"白宇轩"},{"学号":2401020112,"名字":"高舸扬"},{"学号":2401040126,"名字":"邬照宇"},{"学号":9999000001,"名字":"虚拟生01"},{"学号":9999000002,"名字":"虚拟生02"}
    ];
    
    // Shuffle
    const shuffled = fallbackStudents.sort(() => 0.5 - Math.random());
    const students: Student[] = [];
    let counter = 0;
    shuffled.forEach((s: any, i: number) => {
        students.push({
            id: String(s['学号']),
            name: s['名字'],
            groupId: (i % 6) + 1,
            score: 0,
            attendance: { present: 0, absent: 0, late: 0 },
            history: []
        });
    });
    
    return { students, sessions: [] };
  }
}

export const seedSupabase = async (): Promise<DB> => {
    const seedData = generateSeedData();

    // Clear existing data (optional, but good for reset)
    // For resetDB call, we want to clear.
    // For initial check, we check if empty.
    
    // Insert students
    const studentsPayload = seedData.students.map(s => ({
        id: s.id,
        name: s.name,
        group_id: s.groupId,
        score: s.score,
        present: s.attendance.present,
        absent: s.attendance.absent,
        late: s.attendance.late
    }));

    const { error: insertError } = await supabase.from('students').upsert(studentsPayload);
    if (insertError) {
        console.error('Error seeding students:', insertError);
        throw insertError;
    }

    // Since it's a reset/seed, no logs or sessions to insert initially (empty arrays)
    
    return seedData;
};

export const resetDB = async (): Promise<DB> => {
    // Delete all data
    await supabase.from('logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all logs
    await supabase.from('sessions').delete().neq('id', 'dummy'); // Delete all sessions
    // We can delete students too, or just reset their scores.
    // To be safe and reshuffle, let's delete students too.
    await supabase.from('students').delete().neq('id', 'dummy');

    return await seedSupabase();
};

export const getDB = async (): Promise<DB> => {
    // Check if students exist
    const { count, error: countError } = await supabase.from('students').select('*', { count: 'exact', head: true });
    
    if (countError) {
        console.error('Error checking students count:', countError);
        throw countError;
    }

    if (count === 0) {
        return await seedSupabase();
    }

    // Fetch all data
    const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('id', { ascending: true }); // Order by ID to keep consistent
    
    if (studentsError) throw studentsError;

    const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: true }); // Order logs by time

    if (logsError) throw logsError;

    const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*');

    if (sessionsError) throw sessionsError;

    // Transform to DB structure
    const students: Student[] = studentsData.map((s: any) => {
        const studentLogs = logsData
            .filter((l: any) => l.student_id === s.id)
            .map((l: any) => ({
                id: l.id,
                timestamp: Number(l.timestamp), // Ensure number
                action: l.action,
                scoreChange: l.score_change,
                reason: l.reason
            }));
        
        return {
            id: s.id,
            name: s.name,
            groupId: s.group_id,
            score: s.score,
            attendance: {
                present: s.present,
                absent: s.absent,
                late: s.late
            },
            history: studentLogs
        };
    });

    const sessions: Session[] = sessionsData.map((s: any) => ({
        id: s.id,
        timestamp: Number(s.timestamp)
    }));

    return { students, sessions };
};

export const saveDB = (data: DB) => {
    // No-op for Supabase implementation
};
