/**
 * 四象限視圖（陳宗賢老師理論）
 * 緊急/不緊急 × 重要/不重要
 * 任務卡只顯示標題，點擊向右展開心智圖
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types/task';
import { X, Users, FileText, CheckSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuadrantRadarViewProps {
  tasks: Task[];
  onStartTask: (task: Task) => void;
}

/**
 * 計算任務在四象限中的位置（帶碰撞檢測）
 */
function calculateTaskPositions(tasks: Task[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const minDistance = 25; // 最小距離（避免重疊）

  tasks.forEach((task) => {
    // X 軸：重要性（-100 到 +100）
    let importance = 0;
    switch (task.level) {
      case 'LEVEL_1_REVENUE':
        importance = 80; // 1級營收最重要
        break;
      case 'LEVEL_2_TRAFFIC':
        importance = 60; // 2級流量重要
        break;
      case 'LEVEL_3_ADMIN':
        importance = -20; // 3級行政不太重要
        break;
      case 'LEVEL_4_DAILY':
        importance = -60; // 日常最不重要
        break;
      default:
        importance = 0;
    }

    // Y 軸：緊急性（-100 到 +100）
    let urgency = 0;
    
    // 檢查是否已延遲
    if (task.deadline) {
      const deadline = new Date(task.deadline);
      const now = new Date();
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        // 已延遲
        urgency = 90;
      } else if (diffDays === 0) {
        // 今日截止
        urgency = 70;
      } else if (diffDays === 1) {
        // 明天截止
        urgency = 40;
      } else if (diffDays <= 7) {
        // 本週截止
        urgency = 10;
      } else {
        // 未來截止
        urgency = -30;
      }
    } else {
      // 無截止日期
      urgency = -50;
    }

    // 嘗試找到不重疊的位置
    let x = importance;
    let y = urgency;
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      // 檢查是否與現有位置重疊
      let hasCollision = false;
      for (const pos of Array.from(positions.values())) {
        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        if (distance < minDistance) {
          hasCollision = true;
          break;
        }
      }

      if (!hasCollision) {
        break;
      }

      // 有碰撞，嘗試新位置（螺旋式向外擴展）
      const angle = (attempts / maxAttempts) * Math.PI * 2;
      const radius = 5 + attempts * 2;
      x = importance + Math.cos(angle) * radius;
      y = urgency + Math.sin(angle) * radius;
      attempts++;
    }

    // 確保座標在範圍內（-100 到 +100）
    x = Math.max(-100, Math.min(100, x));
    y = Math.max(-100, Math.min(100, y));

    positions.set(task.id, { x, y });
  });

  return positions;
}

/**
 * 取得任務層級的顏色
 */
function getTaskLevelColor(level?: string): string {
  switch (level) {
    case 'LEVEL_1_REVENUE':
      return 'border-orange-500';
    case 'LEVEL_2_TRAFFIC':
      return 'border-blue-500';
    case 'LEVEL_3_ADMIN':
      return 'border-gray-500';
    case 'LEVEL_4_DAILY':
      return 'border-gray-300';
    default:
      return 'border-gray-400';
  }
}

/**
 * 取得任務的圖示
 */
function getTaskIcon(task: Task): string {
  if (task.deadline) {
    const deadline = new Date(task.deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '🔥'; // 已延遲
    if (diffDays === 0) return '⚡'; // 今日截止
    if (diffDays === 1) return '⏰'; // 明天截止
  }
  
  switch (task.level) {
    case 'LEVEL_1_REVENUE':
      return '💰';
    case 'LEVEL_2_TRAFFIC':
      return '📈';
    case 'LEVEL_3_ADMIN':
      return '📋';
    case 'LEVEL_4_DAILY':
      return '📝';
    default:
      return '📌';
  }
}

export function QuadrantRadarView({ tasks, onStartTask }: QuadrantRadarViewProps) {
  const [expandedTask, setExpandedTask] = useState<Task | null>(null);

  // 計算每個任務的位置（帶碰撞檢測）
  const taskPositions = calculateTaskPositions(tasks);
  const tasksWithPositions = tasks.map(task => ({
    task,
    position: taskPositions.get(task.id) || { x: 0, y: 0 },
  }));

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
      {/* 四象限背景 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 垂直線 */}
        <div className="absolute w-px h-full bg-gray-300" />
        {/* 水平線 */}
        <div className="absolute w-full h-px bg-gray-300" />
        
        {/* 中心點 */}
        <div className="absolute w-3 h-3 bg-gray-400 rounded-full" />
      </div>

      {/* 象限標籤 */}
      <div className="absolute top-4 left-4 text-sm font-medium text-gray-500">
        象限 IV<br />緊急但不重要
      </div>
      <div className="absolute top-4 right-4 text-sm font-medium text-gray-500">
        象限 I<br />緊急且重要
      </div>
      <div className="absolute bottom-4 left-4 text-sm font-medium text-gray-500">
        象限 III<br />不緊急不重要
      </div>
      <div className="absolute bottom-4 right-4 text-sm font-medium text-gray-500">
        象限 II<br />重要但不緊急
      </div>

      {/* 軸線標籤 */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-600">
        緊急
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-600">
        不緊急
      </div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600">
        不重要
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600">
        重要
      </div>

      {/* 任務卡片 */}
      <div className="absolute inset-0">
        {tasksWithPositions.map(({ task, position }) => {
          const isExpanded = expandedTask?.id === task.id;
          
          // 將 -100 到 +100 的座標轉換為像素位置
          const left = `${50 + position.x * 0.45}%`; // 中心點在 50%，乘以 0.45 讓範圍在 5%-95%
          const top = `${50 - position.y * 0.45}%`; // Y 軸反轉（上方是正值）

          return (
            <motion.div
              key={task.id}
              className="absolute"
              style={{
                left,
                top,
                transform: 'translate(-50%, -50%)',
                zIndex: isExpanded ? 50 : 10,
              }}
              animate={{
                opacity: expandedTask && !isExpanded ? 0.3 : 1,
              }}
            >
              {!isExpanded ? (
                // 未展開：小矩形框
                <button
                  onClick={() => setExpandedTask(task)}
                  className={`
                    px-3 py-2 bg-white rounded-lg border-2 shadow-sm
                    text-xs font-medium
                    hover:shadow-md transition-shadow
                    ${getTaskLevelColor(task.level)}
                  `}
                  style={{ 
                    minWidth: '120px', 
                    maxWidth: '180px', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    lineHeight: '1.5'
                  }}
                  title={task.title}
                >
                  {getTaskIcon(task)} {task.title.split(' - ')[0]}
                </button>
              ) : (
                // 已展開：心智圖中心節點
                <MindMapExpanded
                  task={task}
                  onClose={() => setExpandedTask(null)}
                  onStart={() => {
                    onStartTask(task);
                    setExpandedTask(null);
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 背景遮罩（點擊關閉心智圖） */}
      <AnimatePresence>
        {expandedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/10 cursor-pointer"
            style={{ zIndex: 40 }}
            onClick={() => setExpandedTask(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 心智圖展開視圖（簡潔版）
 * 只顯示任務輪廓，作為提醒用途
 */
function MindMapExpanded({
  task,
  onClose,
  onStart,
}: {
  task: Task;
  onClose: () => void;
  onStart: () => void;
}) {
  // 從 AI 分析中提取關鍵步驟（最多 5 個）
  const keySteps = task.aiGeneratedContent?.outline?.slice(0, 5) || [
    '確認任務需求',
    '規劃執行步驟',
    '準備所需資源',
    '執行並追蹤進度',
    '完成後檢視優化',
  ];

  return (
    <div className="bg-white rounded-lg border-2 border-blue-500 shadow-xl p-4" style={{ width: '320px' }}>
      {/* 關閉按鈕 */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      {/* 任務標題 */}
      <h3 className="font-bold text-base mb-3 pr-8">
        {getTaskIcon(task)} {task.title}
      </h3>
      
      {/* 關鍵步驟 */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-gray-500 mb-2">📋 關鍵步驟</div>
        <div className="space-y-1.5">
          {keySteps.map((step, index) => (
            <div key={index} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-blue-500 font-medium">{index + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 分隔線 */}
      <div className="border-t border-gray-200 my-3" />

      {/* 底部資訊 */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-2">
          {/* 負責人頭像 */}
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
              {task.assignee.name.charAt(task.assignee.name.length - 1)}
            </div>
            {/* 協作者頭像 */}
            {task.collaborators && task.collaborators.length > 0 && (
              <div className="flex -space-x-2">
                {task.collaborators.slice(0, 3).map((collaborator, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-medium border-2 border-white"
                    title={collaborator.name}
                  >
                    {collaborator.name.charAt(collaborator.name.length - 1)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* 層級標籤 */}
        <div className="px-2 py-1 rounded-full text-xs font-medium" style={{
          backgroundColor: getLevelBgColor(task.level),
          color: getLevelTextColor(task.level),
        }}>
          {getLevelLabel(task.level)}
        </div>
      </div>

      {/* 截止日期提示 */}
      {task.deadline && (
        <div className="text-xs text-gray-500 mb-3">
          📅 {new Date(task.deadline).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}
        </div>
      )}
    </div>
  );
}

/**
 * 心智圖子節點
 */
function MindMapNode({
  position,
  delay,
  icon,
  title,
  content,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  delay: number;
  icon: React.ReactNode;
  title: string;
  content: string;
}) {
  const positionStyles = {
    'top-left': 'left-0 top-0',
    'top-right': 'right-0 top-0',
    'bottom-left': 'left-0 bottom-0',
    'bottom-right': 'right-0 bottom-0',
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay }}
      className={`absolute ${positionStyles[position]}`}
      style={{ zIndex: 58 }}
    >
      <div className="bg-white rounded-lg border-2 border-gray-300 shadow-lg p-3 w-40">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h4 className="font-semibold text-xs">{title}</h4>
        </div>
        <p className="text-xs text-gray-600 whitespace-pre-line line-clamp-4">
          {content}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * 取得層級標籤
 */
function getLevelLabel(level?: string): string {
  switch (level) {
    case 'LEVEL_1_REVENUE':
      return '1級|營收';
    case 'LEVEL_2_TRAFFIC':
      return '2級|流量';
    case 'LEVEL_3_ADMIN':
      return '3級|行政';
    case 'LEVEL_4_DAILY':
      return '日常';
    default:
      return '未分類';
  }
}

/**
 * 取得層級背景色
 */
function getLevelBgColor(level?: string): string {
  switch (level) {
    case 'LEVEL_1_REVENUE':
      return '#fed7aa'; // 橙色
    case 'LEVEL_2_TRAFFIC':
      return '#bfdbfe'; // 藍色
    case 'LEVEL_3_ADMIN':
      return '#d1d5db'; // 灰色
    case 'LEVEL_4_DAILY':
      return '#e5e7eb'; // 淺灰色
    default:
      return '#f3f4f6';
  }
}

/**
 * 取得層級文字色
 */
function getLevelTextColor(level?: string): string {
  switch (level) {
    case 'LEVEL_1_REVENUE':
      return '#c2410c'; // 深橙色
    case 'LEVEL_2_TRAFFIC':
      return '#1e40af'; // 深藍色
    case 'LEVEL_3_ADMIN':
      return '#4b5563'; // 深灰色
    case 'LEVEL_4_DAILY':
      return '#6b7280'; // 中灰色
    default:
      return '#6b7280';
  }
}

/**
 * 取得時間軸內容
 */
function getTimelineContent(task: Task): string {
  if (!task.deadline) {
    return '無截止日期';
  }

  const deadline = new Date(task.deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const lines: string[] = [];
  
  if (diffDays < 0) {
    lines.push(`⚠️ 已延遲 ${Math.abs(diffDays)} 天`);
  }
  
  lines.push(`📅 ${deadline.toLocaleDateString('zh-TW')}`);
  
  if (diffDays === 0) {
    lines.push('🔥 今日截止');
  } else if (diffDays === 1) {
    lines.push('⏰ 明天截止');
  } else if (diffDays > 0 && diffDays <= 7) {
    lines.push(`📌 ${diffDays} 天後截止`);
  }

  return lines.join('\n');
}
