import { Router } from 'express';
import { getDB, saveDB, resetDB, Student } from '../store.js';

const router = Router();

router.post('/reset', (req, res) => {
  const db = resetDB();
  res.json({ success: true, message: 'System reset successful', db });
});

router.get('/data', (req, res) => {
  const db = getDB();
  res.json(db);
});

router.post('/start-class', (req, res) => {
  const db = getDB();
  const timestamp = Date.now();
  
  // Create new session
  const sessionId = timestamp.toString();
  db.sessions.push({ id: sessionId, timestamp });

  // Add 4 points to everyone for attendance
  db.students.forEach(s => {
    s.score += 4;
    s.attendance.present += 1;
    s.history.push({
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      action: 'start_class',
      scoreChange: 4,
      reason: '开课签到'
    });
  });

  saveDB(db);
  res.json({ success: true, message: 'Class started', db });
});

router.post('/update-score', (req, res) => {
  const { target, id, points, reason } = req.body;
  const db = getDB();
  const timestamp = Date.now();

  if (target === 'student') {
    const student = db.students.find(s => s.id === id);
    if (student) {
      student.score += points;
      student.history.push({
        id: Math.random().toString(36).substr(2, 9),
        timestamp,
        action: 'manual_update',
        scoreChange: points,
        reason: reason || 'Teacher adjustment'
      });
    }
  } else if (target === 'group') {
    const groupStudents = db.students.filter(s => s.groupId === Number(id));
    if (groupStudents.length > 0) {
      const pointsPerStudent = parseFloat((points / groupStudents.length).toFixed(2));
      groupStudents.forEach(s => {
        s.score += pointsPerStudent;
        s.history.push({
          id: Math.random().toString(36).substr(2, 9),
          timestamp,
          action: 'group_update',
          scoreChange: pointsPerStudent,
          reason: `Group adjustment: ${reason || ''}`
        });
      });
    }
  }

  saveDB(db);
  res.json({ success: true, db });
});

router.post('/attendance', (req, res) => {
  const { studentId, status } = req.body; // status: 'absent' | 'late'
  const db = getDB();
  const timestamp = Date.now();
  const student = db.students.find(s => s.id === studentId);

  if (student) {
    if (status === 'absent') {
      // Deduct the 4 points given at start, or just penalize?
      // "Absence student separate deduction entry"
      // Assuming this is called AFTER start class, so we revert the +4 (attendance) and maybe mark absent.
      // But maybe "Absence" just means they get 0 for this class.
      // If we already gave +4, we should subtract 4.
      // Or maybe the user wants to deduct points explicitly.
      // Let's implement: Deduct 4 points (revert attendance)
      // And increment absent count.
      // Wait, "旷课学生单独设置减分入口". Maybe it's a manual deduction.
      // But typically absence means 0 score for that session.
      // I will deduct 4 points (cancelling the automatic +4).
      student.score -= 4;
      student.attendance.absent += 1;
      // Also decrement present count? Yes, if they were marked present automatically.
      student.attendance.present = Math.max(0, student.attendance.present - 1);
      
      student.history.push({
        id: Math.random().toString(36).substr(2, 9),
        timestamp,
        action: 'mark_absent',
        scoreChange: -4,
        reason: '旷课'
      });
    } else if (status === 'late') {
      // "Late/Early leave -2"
      // They are still present, but get -2 penalty.
      student.score -= 2;
      student.attendance.late += 1;
      student.history.push({
        id: Math.random().toString(36).substr(2, 9),
        timestamp,
        action: 'mark_late',
        scoreChange: -2,
        reason: '迟到/早退'
      });
    }
  }

  saveDB(db);
  res.json({ success: true, db });
});

router.post('/task-complete', (req, res) => {
  const { studentId } = req.body;
  const db = getDB();
  const timestamp = Date.now();
  const student = db.students.find(s => s.id === studentId);

  if (student) {
    student.score += 4;
    student.history.push({
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      action: 'task_complete',
      scoreChange: 4,
      reason: '实训任务完成'
    });
  }

  saveDB(db);
  res.json({ success: true, db });
});

router.post('/task-complete-all', (req, res) => {
  const { taskName } = req.body;
  const db = getDB();
  const timestamp = Date.now();

  db.students.forEach(student => {
    student.score += 4;
    student.history.push({
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      action: 'task_complete',
      scoreChange: 4,
      reason: `实训任务: ${taskName}`
    });
  });

  saveDB(db);
  res.json({ success: true, message: 'All students completed task', db });
});

export default router;
