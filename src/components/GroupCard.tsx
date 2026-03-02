import React from 'react';
import { Student } from '../store/useDashboardStore';
import { User, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface GroupCardProps {
  groupId: number;
  students: Student[];
  onStudentClick: (student: Student) => void;
  onGroupClick: (groupId: number) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ groupId, students, onStudentClick, onGroupClick }) => {
  const totalScore = students.reduce((sum, s) => sum + s.score, 0);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
    >
      <div 
        className="flex justify-between items-center mb-4 cursor-pointer hover:text-cyan-400"
        onClick={() => onGroupClick(groupId)}
      >
        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          第 {groupId} 组
        </h3>
        <span className="text-2xl font-mono text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
          {totalScore.toFixed(1)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {students.map(student => (
          <div 
            key={student.id}
            onClick={() => onStudentClick(student)}
            className="flex items-center justify-between bg-slate-700/50 p-2 rounded cursor-pointer hover:bg-slate-600 transition-colors group"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                {student.name.slice(-2)}
              </div>
              <span className="truncate text-sm font-medium text-slate-200">{student.name}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-sm font-bold ${student.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {student.score > 0 ? '+' : ''}{student.score}
              </span>
              <div className="flex gap-1 mt-1">
                {student.attendance.absent > 0 && <ShieldAlert size={12} className="text-red-500" />}
                {student.attendance.late > 0 && <Clock size={12} className="text-yellow-500" />}
                {student.attendance.present > 0 && <ShieldCheck size={12} className="text-green-500/50" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
