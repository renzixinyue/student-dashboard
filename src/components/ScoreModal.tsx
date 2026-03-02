import React, { useState } from 'react';
import { Student } from '../store/useDashboardStore';
import { X, Check, ShieldAlert, Clock, Trophy, Calculator } from 'lucide-react';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: { type: 'student'; data: Student } | { type: 'group'; id: number; name: string } | null;
  onUpdateScore: (points: number, reason: string) => void;
  onMarkAttendance: (status: 'absent' | 'late') => void;
  onCompleteTask: () => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  onClose,
  target,
  onUpdateScore,
  onMarkAttendance,
  onCompleteTask
}) => {
  const [reason, setReason] = useState('');
  const [customPoints, setCustomPoints] = useState('');

  if (!isOpen || !target) return null;

  const handleScore = (points: number) => {
    onUpdateScore(points, reason || (points > 0 ? '奖励加分' : '违纪扣分'));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 border border-cyan-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-cyan-500/20 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          {target.type === 'student' ? target.data.name : target.name} - 评价管理
        </h2>

        {/* Attendance & Tasks (Student Only) */}
        {target.type === 'student' && (
          <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-slate-700">
            <button
              onClick={() => { onMarkAttendance('absent'); onClose(); }}
              className="flex flex-col items-center justify-center p-3 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-all text-red-400"
            >
              <ShieldAlert size={24} className="mb-2" />
              <span className="text-sm font-bold">旷课 (-4)</span>
            </button>
            <button
              onClick={() => { onMarkAttendance('late'); onClose(); }}
              className="flex flex-col items-center justify-center p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/20 transition-all text-yellow-400"
            >
              <Clock size={24} className="mb-2" />
              <span className="text-sm font-bold">迟到/早退 (-2)</span>
            </button>
            <button
              onClick={() => { onCompleteTask(); onClose(); }}
              className="flex flex-col items-center justify-center p-3 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 transition-all text-green-400"
            >
              <Trophy size={24} className="mb-2" />
              <span className="text-sm font-bold">实训任务 (+4)</span>
            </button>
          </div>
        )}

        {/* Score Adjustment */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator size={18} className="text-cyan-400" />
            <span className="text-sm font-medium text-slate-300">快速加减分</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 4].map(pt => (
              <button
                key={pt}
                onClick={() => handleScore(pt)}
                className="py-3 bg-cyan-600/20 border border-cyan-500/50 rounded-lg hover:bg-cyan-500 hover:text-white transition-all text-cyan-400 font-bold"
              >
                +{pt} 分
              </button>
            ))}
            {[-1, -2, -4].map(pt => (
              <button
                key={pt}
                onClick={() => handleScore(pt)}
                className="py-3 bg-pink-600/20 border border-pink-500/50 rounded-lg hover:bg-pink-500 hover:text-white transition-all text-pink-400 font-bold"
              >
                {pt} 分
              </button>
            ))}
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="输入加减分理由 (可选)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
