import { useState } from 'react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { X, Clock, CheckCircle2, Circle } from 'lucide-react';

interface RadarTaskViewProps {
  tasks: Task[];
  onStartTask: (task: Task) => void;
}

/**
 * 雷達圖核心任務視覺化
 * 左側：5個同心圓雷達圖，任務以紅點標示（距離中心越近越核心）
 * 右側：點擊紅點後展開垂直時間軸
 */
export function RadarTaskView({ tasks, onStartTask }: RadarTaskViewProps) {
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 計算任務在雷達圖上的位置
  const getTaskPosition = (task: Task, index: number) => {
    // Priority: 1-5，越高越核心（距離中心越近）
    const priority = getTaskPriority(task);
    const radius = 200 - (priority - 1) * 35; // Priority 5 在最內圈，Priority 1 在最外圈

    // 根據任務層級分配角度（0°, 90°, 180°, 270°）
    const angleOffset = getLevelAngle(task.level || 'LEVEL_1_REVENUE');
    // 在同一層級內分散任務
    const taskAngle = angleOffset + (index % 4) * 15;
    const angleRad = (taskAngle * Math.PI) / 180;

    const x = 300 + radius * Math.cos(angleRad);
    const y = 300 + radius * Math.sin(angleRad);

    return { x, y };
  };

  // 根據截止日期和層級計算 Priority (1-5)
  const getTaskPriority = (task: Task): number => {
    if (!task.deadline) return 1;

    const today = new Date();
    const deadline = new Date(task.deadline);
    const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // 已延遲 = Priority 5（最核心）
    if (daysUntilDeadline < 0) return 5;
    // 今天截止 = Priority 4
    if (daysUntilDeadline === 0) return 4;
    // 明天截止 = Priority 3
    if (daysUntilDeadline === 1) return 3;
    // 本週截止 = Priority 2
    if (daysUntilDeadline <= 7) return 2;
    // 其他 = Priority 1
    return 1;
  };

  // 根據任務層級分配角度
  const getLevelAngle = (level: string): number => {
    switch (level) {
      case 'LEVEL_1_REVENUE': return 0;    // 右側
      case 'LEVEL_2_TRAFFIC': return 90;   // 下方
      case 'LEVEL_3_ADMIN': return 180;    // 左側
      case 'LEVEL_4_DAILY': return 270;    // 上方
      default: return 45;                   // 右下
    }
  };

  // 處理滑鼠移入紅點
  const handleMouseEnter = (task: Task, event: React.MouseEvent) => {
    setHoveredTask(task);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  // 處理滑鼠移出紅點
  const handleMouseLeave = () => {
    setHoveredTask(null);
  };

  // 處理點擊紅點
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <div className="flex gap-8">
      {/* 左側：雷達圖 */}
      <div className="relative" style={{ width: '600px', height: '600px' }}>
        <svg width="600" height="600" className="absolute inset-0">
          {/* 5個同心圓 */}
          {[1, 2, 3, 4, 5].map((level) => (
            <circle
              key={level}
              cx="300"
              cy="300"
              r={200 - (level - 1) * 35}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}

          {/* 中心點標記 */}
          <circle cx="300" cy="300" r="4" fill="#ef4444" />
          <text x="300" y="320" textAnchor="middle" fontSize="12" fill="#6b7280">
            核心
          </text>

          {/* 任務紅點 */}
          {tasks.map((task, index) => {
            const { x, y } = getTaskPosition(task, index);
            const isSelected = selectedTask?.id === task.id;

            return (
              <g key={task.id}>
                {/* Pulse 動畫圓圈 */}
                <circle cx={x} cy={y} r="8" fill="#ef4444" opacity="0.3">
                  <animate
                    attributeName="r"
                    from="8"
                    to="12"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.3"
                    to="0"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* 主紅點 */}
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#ef4444"
                  stroke={isSelected ? '#3b82f6' : '#ffffff'}
                  strokeWidth={isSelected ? '3' : '2'}
                  className="cursor-pointer hover:r-8 transition-all"
                  onMouseEnter={(e) => handleMouseEnter(task, e)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleTaskClick(task)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip（黑色） */}
        {hoveredTask && (
          <div
            className="fixed z-50 bg-black text-white px-3 py-2 rounded-lg text-xs shadow-lg"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y + 10,
              pointerEvents: 'none',
            }}
          >
            <div className="font-bold mb-1">{hoveredTask.title}</div>
            <div className="text-gray-300">👤 {hoveredTask.assignee.name}</div>
            <div className="text-gray-300">
              📅 {hoveredTask.deadline
                ? new Date(hoveredTask.deadline).toLocaleDateString('zh-TW')
                : '無截止日期'}
            </div>
          </div>
        )}

        {/* 低優先標籤 */}
        <div className="absolute bottom-4 right-4 text-sm text-gray-500">
          低優先
        </div>
      </div>

      {/* 右側：垂直時間軸（點擊紅點後顯示） */}
      {selectedTask && (
        <div className="flex-1 bg-white rounded-lg border shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-bold text-lg">{selectedTask.title}</h3>
            <button
              onClick={() => setSelectedTask(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 總進度條 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">📊 總進度</span>
              <span className="text-sm font-bold text-blue-600">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>

          {/* 垂直時間軸 */}
          <div className="space-y-6">
            {/* 已完成步驟 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div className="w-0.5 h-12 bg-gray-300 mt-2" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">任務開始</div>
                <div className="text-xs text-gray-500">2025/12/01</div>
                <div className="text-xs text-green-600 mt-1">✓ 已完成</div>
              </div>
            </div>

            {/* 進行中步驟 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="w-0.5 h-12 bg-gray-300 mt-2" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">子任務 1：需求分析</div>
                <div className="text-xs text-gray-500">預計 2025/12/03</div>
                <div className="text-xs text-blue-600 mt-1">● 進行中</div>
              </div>
            </div>

            {/* 待處理步驟 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <Circle className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-600">子任務 2：開發實作</div>
                <div className="text-xs text-gray-500">預計 2025/12/05</div>
                <div className="text-xs text-gray-400 mt-1">○ 待處理</div>
              </div>
            </div>
          </div>

          {/* 開始執行按鈕 */}
          <Button
            onClick={() => {
              onStartTask(selectedTask);
              setSelectedTask(null);
            }}
            className="w-full mt-6"
          >
            ▶️ 開始執行
          </Button>
        </div>
      )}
    </div>
  );
}
