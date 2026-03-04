import { Router } from 'express';
import { getDB, resetDB, Student } from '../store.js';
import { supabase } from '../supabaseClient.js';

const router = Router();

router.post('/reset', async (req, res) => {
  try {
    const db = await resetDB();
    res.json({ success: true, message: 'System reset successful', db });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
});

router.get('/data', async (req, res) => {
  try {
    const db = await getDB();
    res.json(db);
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
});

router.post('/start-class', async (req, res) => {
  try {
    const db = await getDB();
    const timestamp = Date.now();
    
    // Create new session
    const sessionId = timestamp.toString();
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({ id: sessionId, timestamp });
    
    if (sessionError) throw sessionError;

    // Prepare updates
    const studentsPayload = db.students.map(s => ({
        id: s.id,
        name: s.name,
        group_id: s.groupId,
        score: s.score + 4,
        present: s.attendance.present + 1,
        absent: s.attendance.absent,
        late: s.attendance.late
    }));

    const logsPayload = db.students.map(s => ({
        student_id: s.id,
        timestamp,
        action: 'start_class',
        score_change: 4,
        reason: '开课签到'
    }));

    // Perform updates
    const { error: updateError } = await supabase.from('students').upsert(studentsPayload);
    if (updateError) throw updateError;

    const { error: logError } = await supabase.from('logs').insert(logsPayload);
    if (logError) throw logError;

    const updatedDB = await getDB();
    res.json({ success: true, message: 'Class started', db: updatedDB });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
});

router.post('/update-score', async (req, res) => {
  try {
    const { target, id, points, reason } = req.body;
    const db = await getDB();
    const timestamp = Date.now();

    if (target === 'student') {
      const student = db.students.find(s => s.id === id);
      if (student) {
        // Update student
        const { error: updateError } = await supabase
          .from('students')
          .update({ score: student.score + points })
          .eq('id', id);
        
        if (updateError) throw updateError;

        // Add log
        const { error: logError } = await supabase
          .from('logs')
          .insert({
            student_id: id,
            timestamp,
            action: 'manual_update',
            score_change: points,
            reason: reason || 'Teacher adjustment'
          });
        
        if (logError) throw logError;
      }
    } else if (target === 'group') {
      const groupStudents = db.students.filter(s => s.groupId === Number(id));
      if (groupStudents.length > 0) {
        const pointsPerStudent = parseFloat((points / groupStudents.length).toFixed(2));
        
        // Prepare bulk updates
        const studentsPayload = groupStudents.map(s => ({
            id: s.id,
            name: s.name,
            group_id: s.groupId,
            score: s.score + pointsPerStudent,
            present: s.attendance.present,
            absent: s.attendance.absent,
            late: s.attendance.late
        }));

        const logsPayload = groupStudents.map(s => ({
            student_id: s.id,
            timestamp,
            action: 'group_update',
            score_change: pointsPerStudent,
            reason: `Group adjustment: ${reason || ''}`
        }));

        const { error: updateError } = await supabase.from('students').upsert(studentsPayload);
        if (updateError) throw updateError;

        const { error: logError } = await supabase.from('logs').insert(logsPayload);
        if (logError) throw logError;
      }
    }

    const updatedDB = await getDB();
    res.json({ success: true, db: updatedDB });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
});

router.post('/attendance', async (req, res) => {
  try {
    const { studentId, status } = req.body; // status: 'absent' | 'late'
    const db = await getDB();
    const timestamp = Date.now();
    const student = db.students.find(s => s.id === studentId);

    if (student) {
      if (status === 'absent') {
        const newScore = student.score - 4;
        const newAbsent = student.attendance.absent + 1;
        const newPresent = Math.max(0, student.attendance.present - 1);

        const { error: updateError } = await supabase
            .from('students')
            .update({ score: newScore, absent: newAbsent, present: newPresent })
            .eq('id', studentId);
        if (updateError) throw updateError;

        const { error: logError } = await supabase.from('logs').insert({
            student_id: studentId,
            timestamp,
            action: 'mark_absent',
            score_change: -4,
            reason: '旷课'
        });
        if (logError) throw logError;

      } else if (status === 'late') {
        const newScore = student.score - 2;
        const newLate = student.attendance.late + 1;

        const { error: updateError } = await supabase
            .from('students')
            .update({ score: newScore, late: newLate })
            .eq('id', studentId);
        if (updateError) throw updateError;

        const { error: logError } = await supabase.from('logs').insert({
            student_id: studentId,
            timestamp,
            action: 'mark_late',
            score_change: -2,
            reason: '迟到/早退'
        });
        if (logError) throw logError;
      }
    }

    const updatedDB = await getDB();
    res.json({ success: true, db: updatedDB });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
});

router.post('/task-complete', async (req, res) => {
  try {
    const { studentId } = req.body;
    const db = await getDB();
    const timestamp = Date.now();
    const student = db.students.find(s => s.id === studentId);

    if (student) {
      const { error: updateError } = await supabase
        .from('students')
        .update({ score: student.score + 4 })
        .eq('id', studentId);
      if (updateError) throw updateError;

      const { error: logError } = await supabase.from('logs').insert({
        student_id: studentId,
        timestamp,
        action: 'task_complete',
        score_change: 4,
        reason: '实训任务完成'
      });
      if (logError) throw logError;
    }

    const updatedDB = await getDB();
    res.json({ success: true, db: updatedDB });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
});

router.post('/task-complete-all', async (req, res) => {
  try {
    const { taskName } = req.body;
    const db = await getDB();
    const timestamp = Date.now();

    const studentsPayload = db.students.map(s => ({
        id: s.id,
        name: s.name,
        group_id: s.groupId,
        score: s.score + 4,
        present: s.attendance.present,
        absent: s.attendance.absent,
        late: s.attendance.late
    }));

    const logsPayload = db.students.map(s => ({
        student_id: s.id,
        timestamp,
        action: 'task_complete',
        score_change: 4,
        reason: `实训任务: ${taskName}`
    }));

    const { error: updateError } = await supabase.from('students').upsert(studentsPayload);
    if (updateError) throw updateError;

    const { error: logError } = await supabase.from('logs').insert(logsPayload);
    if (logError) throw logError;

    const updatedDB = await getDB();
    res.json({ success: true, message: 'All students completed task', db: updatedDB });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
});

export default router;
