import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Square, Users as UsersIcon, AlertCircle } from "lucide-react";
import { Task } from "@/types/task";
import { getSymbolById } from "@/data/taskSymbols";
import { calculatePriorityScore, getPriorityLevel } from "@/utils/priorityScore";

interface TaskCardProps {
  task: Task;
  onStart?: (taskId: string) => void;
  onEnd?: (taskId: string) => void;
  onCardClick?: (taskId: string) => void;
  showActions?: boolean;
}

const durationConfig = {
  "10min": { label: "10 分鐘", value: 10 },
  "1hour": { label: "1 小時", value: 60 },
  "1day": { label: "1 天", value: 480 },
};

export function TaskCard({ task, onStart, onEnd, onCardClick, showActions = false }: TaskCardProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
  // 獲取符號資訊
  const symbol = task.symbolId ? getSymbolById(task.symbolId) : null;
  
  const levelGradients = {
    'LEVEL_1_REVENUE': 'bg-gradient-to-br from-amber-50 to-yellow-100',    // 金色
    'LEVEL_2_TRAFFIC': 'bg-gradient-to-br from-blue-50 to-cyan-100',       // 藍色
    'LEVEL_3_ADMIN': 'bg-gradient-to-br from-gray-50 to-slate-100',        // 灰色
    'LEVEL_4_DAILY': 'bg-gradient-to-br from-gray-50 to-gray-100',         // 淺灰色
  };
  
  const levelLabels = {
    'LEVEL_1_REVENUE': '1級|營收',
    'LEVEL_2_TRAFFIC': '2級|流量',
    'LEVEL_3_ADMIN': '3級|行政',
    'LEVEL_4_DAILY': '日常',
  };
  
  const levelGradient = task.level ? levelGradients[task.level] : 'bg-gradient-to-br from-gray-50 to-gray-100';
  const levelLabel = task.level ? levelLabels[task.level] : '未分類';

  const handleEnd = () => {
    if (onEnd) {
      setIsAnimatingOut(true);
      setTimeout(() => {
        onEnd(task.id);
      }, 500);
    }
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(task.id);
    }
  };

  return (
    <Card
      className={`aspect-square overflow-hidden transition-all duration-500 cursor-pointer hover:shadow-lg ${
        isAnimatingOut ? "opacity-0 scale-95 translate-x-full" : "opacity-100 scale-100"
      }`}
      onClick={handleCardClick}
    >
      {/* 上半部:符號圖示 */}
      <div className={`relative h-1/2 ${levelGradient} flex items-center justify-center`}>
        {/* 分級標籤(右上角) */}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md z-10">
          {levelLabel}
        </div>
        
        {/* 符號圖示 */}
        {symbol && (
          <img 
            src={symbol.iconPath} 
            alt={symbol.name}
            className="w-24 h-24 object-contain"
            title={symbol.name}
          />
        )}
      </div>
      
      {/* 下半部:任務標題與負責人 */}
      <div className="h-1/2 p-4 flex flex-col justify-center items-center bg-card">
        {/* 任務標題 */}
        <h3 className="font-bold text-base mb-3 line-clamp-2 text-center">
          {task.title}
        </h3>
        
        {/* 負責人標籤(置中) */}
        <Badge variant="secondary">
          {task.assignee.name}
        </Badge>
      </div>
    </Card>
  );
}
