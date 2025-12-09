import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Play, Pause, Clock } from "lucide-react";
import { Subtask } from "@/types/task";
import { TaskActionLog, ActionType } from "@/types/actionLog";
import { toast } from "sonner";

interface SubtaskCardProps {
  subtask: Subtask;
  onStatusChange: (
    subtaskId: string, 
    newStatus: Subtask['status'], 
    actualTime?: number,
    actionLog?: TaskActionLog
  ) => void;
}

export function SubtaskCard({ subtask, onStatusChange }: SubtaskCardProps) {
  const [elapsedTime, setElapsedTime] = useState(subtask.actualTime || 0);
  const [isRunning, setIsRunning] = useState(subtask.status === 'in-progress');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && subtask.status === 'in-progress') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 60000); // 每分鐘更新一次
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, subtask.status]);

  /**
   * 建立操作記錄
   */
  const createActionLog = (action: ActionType): TaskActionLog => {
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action,
      subtaskId: subtask.id,
    };
  };

  const handleStart = () => {
    const now = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    const actionLog = createActionLog(subtask.status === 'pending' ? 'start' : 'resume');
    
    setIsRunning(true);
    onStatusChange(subtask.id, 'in-progress', undefined, actionLog);
    
    if (subtask.status === 'pending') {
      toast.success(`子任務已開始 (${now})`);
    } else {
      toast.info(`繼續執行 (${now})`);
    }
  };

  const handlePause = () => {
    const now = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    const actionLog = createActionLog('pause');
    
    setIsRunning(false);
    onStatusChange(subtask.id, 'in-progress', elapsedTime, actionLog);
    toast.info(`已暫停計時 (${now})`);
  };

  const handleComplete = () => {
    const now = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    const actionLog = createActionLog('complete');
    
    setIsRunning(false);
    onStatusChange(subtask.id, 'completed', elapsedTime, actionLog);
    toast.success(`子任務已完成 (${now})`);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // 計算暫停次數(從 actionLogs 中統計)
  const pauseCount = subtask.actionLogs?.filter(log => log.action === 'pause').length || 0;

  return (
    <Card className={`p-4 transition-all ${
      subtask.status === 'completed' 
        ? 'bg-green-50 border-green-200' 
        : subtask.status === 'in-progress'
        ? 'bg-blue-50 border-blue-200'
        : 'bg-card border-border'
    }`}>
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className="flex-shrink-0 mt-1">
          {subtask.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : subtask.status === 'in-progress' ? (
            <div className="relative">
              <Circle className="w-5 h-5 text-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              </div>
            </div>
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm mb-2 ${
            subtask.status === 'completed' ? 'line-through text-muted-foreground' : 'text-card-foreground'
          }`}>
            {subtask.title}
          </h4>

          {/* Time Info - 純閱讀模式,不顯示預估時間 */}
          {subtask.status !== 'pending' && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className={subtask.status === 'in-progress' ? 'text-blue-600 font-medium' : ''}>
                  已投入 {formatTime(elapsedTime)}
                </span>
              </div>
              {pauseCount > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Pause className="w-3 h-3" />
                  <span>暫停 {pauseCount} 次</span>
                </div>
              )}
            </div>
          )}

          {/* Time Range */}
          {subtask.startTime && (
            <div className="text-xs text-muted-foreground mb-3">
              {subtask.startTime}
              {subtask.endTime && ` - ${subtask.endTime}`}
            </div>
          )}

          {/* 純閱讀模式 - 移除所有執行面按鈕 */}
          {subtask.status === 'completed' && (
            <div className="text-xs text-green-600 font-medium">
              ✓ 已完成 (實際投入 {formatTime(elapsedTime)})
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
