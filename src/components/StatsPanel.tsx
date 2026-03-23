import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, Legend } from 'recharts';
import { DB } from '../store/useDashboardStore';
import { Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface StatsPanelProps {
  data: DB;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ data }) => {
  // Process data for charts
  let groupScores = Array.from({ length: 6 }, (_, i) => {
    const groupId = i + 1;
    const students = data.students.filter(s => s.groupId === groupId);
    const score = students.reduce((sum, s) => sum + s.score, 0);
    
    // Create an object with individual student scores for stacked bar chart
    const groupData: any = { name: `第${groupId}组`, totalScore: Number(score.toFixed(1)), groupId };
    
    // We only take up to 6 students per group for visualization clarity
    students.slice(0, 6).forEach((student, index) => {
      groupData[`student_${index}`] = Number(student.score.toFixed(1));
      groupData[`student_name_${index}`] = student.name;
    });

    // Add a tiny dummy value to hold the top label
    groupData.labelHolder = 0.0001;
    
    return groupData;
  });

  // Calculate ranks
  const sortedScores = [...groupScores].sort((a, b) => b.totalScore - a.totalScore);
  groupScores = groupScores.map(group => {
    const rank = sortedScores.findIndex(g => g.groupId === group.groupId) + 1;
    return { ...group, rank };
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
        <h3 className="text-lg font-bold mb-4 text-slate-300">各组总分及成员贡献统计</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupScores} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              formatter={(value: number, name: string, props: any) => {
                // If it's a student score, use the student's name for the label
                if (name.startsWith('student_') && !name.startsWith('student_name_')) {
                  const index = name.split('_')[1];
                  const studentName = props.payload[`student_name_${index}`];
                  return [value, studentName || name];
                }
                return [value, name];
              }}
            />
            {/* Generate up to 6 stacked bars for students in a group */}
            {Array.from({ length: 6 }).map((_, index) => (
              <Bar 
                key={`student_${index}`} 
                dataKey={`student_${index}`} 
                stackId="a" 
                fill={colors[index % colors.length]}
                radius={[0, 0, 0, 0]} 
                isAnimationActive={true}
              >
              </Bar>
            ))}
            
            {/* The invisible top bar holding the label */}
            <Bar dataKey="labelHolder" fill="transparent" stackId="a" radius={[4, 4, 0, 0]} isAnimationActive={false}>
               <LabelList 
                 dataKey="totalScore" 
                 position="top" 
                 fill="#fff" 
                 fontSize={14} 
                 fontWeight="bold" 
                 formatter={(value: number, entry: any) => {
                   if (value > 0) {
                     return `${value} (第${entry.payload.rank}名)`;
                   }
                   return '';
                 }} 
               />
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
