import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DB } from '../store/useDashboardStore';
import { Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface StatsPanelProps {
  data: DB;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ data }) => {
  // Process data for charts
  const groupScores = Array.from({ length: 6 }, (_, i) => {
    const groupId = i + 1;
    const students = data.students.filter(s => s.groupId === groupId);
    const score = students.reduce((sum, s) => sum + s.score, 0);
    return { name: `第${groupId}组`, score, groupId };
  });

  const totalStudents = data.students.length;
  const presentCount = data.students.filter(s => s.attendance.present > 0).length; // Just a rough metric for now
  // A better metric for "Attendance" in stats: Total Absences / Lates
  const totalAbsent = data.students.reduce((sum, s) => sum + s.attendance.absent, 0);
  const totalLate = data.students.reduce((sum, s) => sum + s.attendance.late, 0);
  const totalTasks = data.students.reduce((sum, s) => s.history.filter(h => h.action === 'task_complete').length, 0);

  const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b'];

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <div className="text-slate-400 text-sm">总人数</div>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-500/20 text-green-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-slate-400 text-sm">实训任务</div>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="p-3 rounded-full bg-red-500/20 text-red-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-slate-400 text-sm">旷课人次</div>
            <div className="text-2xl font-bold">{totalAbsent}</div>
          </div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-400">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-slate-400 text-sm">迟到/早退</div>
            <div className="text-2xl font-bold">{totalLate}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700 min-h-[300px]">
        <h3 className="text-lg font-bold mb-4 text-slate-300">各组总分统计</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupScores}>
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {groupScores.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
