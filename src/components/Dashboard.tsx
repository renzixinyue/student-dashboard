import React, { useEffect, useState } from 'react';
import { useDashboardStore, Student } from '../store/useDashboardStore';
import { GroupCard } from './GroupCard';
import { ScoreModal } from './ScoreModal';
import { StatsPanel } from './StatsPanel';
import { Search, Play, RefreshCw, GraduationCap, Hammer, Settings, RotateCcw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    data, 
    loading, 
    fetchData, 
    startClass, 
    updateScore, 
    markAttendance,
    completeTask,
    completeTaskAll,
    resetSystem
  } = useDashboardStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<{ type: 'student'; data: Student } | { type: 'group'; id: number; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskMenuOpen, setTaskMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const taskModules = [
    "金属材料及热处理",
    "金属热加工工艺",
    "零件测绘",
    "零件成型工艺"
  ];

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStudentClick = (student: Student) => {
    setModalTarget({ type: 'student', data: student });
    setModalOpen(true);
  };

  const handleGroupClick = (groupId: number) => {
    setModalTarget({ type: 'group', id: groupId, name: `第 ${groupId} 组` });
    setModalOpen(true);
  };

  const filteredStudents = data?.students.filter(s => 
    s.name.includes(searchTerm) || s.id.includes(searchTerm)
  ) || [];

  const handleSearchSelect = (student: Student) => {
    handleStudentClick(student);
    setSearchTerm('');
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen text-cyan-400">
        <RefreshCw className="animate-spin mr-2" /> 加载数据中...
      </div>
    );
  }

  // Split groups for layout
  const groupsLeft = [1, 2, 3];
  const groupsRight = [4, 5, 6];

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <header className="flex justify-between items-center bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <GraduationCap size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              机械加工基础 - 课程评价大屏
            </h1>
            <div className="text-sm text-slate-400 flex gap-4">
              <span>班级：24级矿山机电与智能装备3班</span>
              <span>当前课次：{data.sessions.length + 1}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative group">
            <div className="flex items-center bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all w-64">
              <Search size={18} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="搜索学生姓名..."
                className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-20">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => handleSearchSelect(s)}
                      className="p-2 hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-700/50 last:border-0"
                    >
                      <span>{s.name}</span>
                      <span className="text-xs text-slate-500">第{s.groupId}组</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-slate-500 text-center text-sm">未找到学生</div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setTaskMenuOpen(!taskMenuOpen)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all active:scale-95"
            >
              <Hammer size={20} fill="currentColor" />
              实训任务 (+4)
            </button>
            
            {taskMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-64 z-20 overflow-hidden">
                {taskModules.map((module) => (
                  <button
                    key={module}
                    onClick={() => {
                      if (window.confirm(`确定要给全班同学添加"${module}"实训任务分数吗？`)) {
                        completeTaskAll(module);
                        setTaskMenuOpen(false);
                      }
                    }}
                    className="w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors border-b border-slate-700/50 last:border-0 text-sm"
                  >
                    {module}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => startClass()}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-105 transition-all active:scale-95"
          >
            <Play size={20} fill="currentColor" />
            开始上课 (+4)
          </button>

          {/* Admin Menu */}
          <div className="relative">
            <button
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              title="后台管理"
            >
              <Settings size={24} />
            </button>
            {adminMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-48 z-20 overflow-hidden">
                <button
                  onClick={() => {
                    if (window.confirm('确定要重置所有数据吗？此操作不可恢复！')) {
                      resetSystem();
                      setAdminMenuOpen(false);
                    }
                  }}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  全局复位
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Left Column: Groups 1-3 */}
        <div className="space-y-4 lg:col-span-1 overflow-y-auto pr-2 custom-scrollbar">
          {groupsLeft.map(gid => (
            <GroupCard 
              key={gid} 
              groupId={gid} 
              students={data.students.filter(s => s.groupId === gid)} 
              onStudentClick={handleStudentClick}
              onGroupClick={handleGroupClick}
            />
          ))}
        </div>

        {/* Middle Column: Stats */}
        <div className="lg:col-span-2">
          <StatsPanel data={data} />
        </div>

        {/* Right Column: Groups 4-6 */}
        <div className="space-y-4 lg:col-span-1 overflow-y-auto pr-2 custom-scrollbar">
          {groupsRight.map(gid => (
            <GroupCard 
              key={gid} 
              groupId={gid} 
              students={data.students.filter(s => s.groupId === gid)} 
              onStudentClick={handleStudentClick}
              onGroupClick={handleGroupClick}
            />
          ))}
        </div>
      </div>

      <ScoreModal 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); setModalTarget(null); }}
        target={modalTarget}
        onUpdateScore={(points, reason) => {
          if (modalTarget?.type === 'student') {
            updateScore('student', modalTarget.data.id, points, reason);
          } else if (modalTarget?.type === 'group') {
            updateScore('group', modalTarget.id, points, reason);
          }
        }}
        onMarkAttendance={(status) => {
          if (modalTarget?.type === 'student') {
            markAttendance(modalTarget.data.id, status);
          }
        }}
        onCompleteTask={() => {
          if (modalTarget?.type === 'student') {
            completeTask(modalTarget.data.id);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
