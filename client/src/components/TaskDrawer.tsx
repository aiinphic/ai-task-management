/**
 * 任務側邊滑出面板
 * 從右側滑出,顯示選中分級的所有任務項目
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TimeSession } from "@/utils/timeTracking";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import { Task } from "@/types/task";

interface TaskDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: number | null; // 1-5級: 1=1級營收, 2=2級流量, 3=3級行政, 4=日常, 5=無(未分類)
  date: string; // 日期 (例如: "昨天 (週四 11/27)")
  sessions: TimeSession[]; // 該日的所有任務 sessions
  memberTasks?: Task[]; // 所有任務列表(用於顯示未執行任務)
  timeSlot?: 'morning' | 'afternoon' | null; // 時段篩選(上午/下午)
}

export function TaskDrawer({ open, onOpenChange, level, date, sessions, memberTasks = [], timeSlot = null }: TaskDrawerProps) {
  if (!level) return null;

  // 篩選出選中分級的任務
  let filteredSessions = sessions.filter((session) => session.taskLevel === level);
  
  // 如果指定了時段,進一步篩選
  if (timeSlot) {
    filteredSessions = filteredSessions.filter((session) => {
      const startTime = new Date(session.startTime);
      const hour = startTime.getHours();
      
      if (timeSlot === 'morning') {
        return hour < 12;
      } else {
        return hour >= 12;
      }
    });
  }
  
  // 如果是「空(無)」分類,顯示未執行的任務
  const unexecutedTasks = level === 5 ? memberTasks.filter(task => {
    // 只計算 pending 狀態的任務
    if (task.status !== 'pending') return false;
    
    // 檢查是否在當天的 timeLog 中有記錄
    const hasTimeLog = sessions.some(session => session.taskId === task.id);
    return !hasTimeLog;
  }) : [];

  // 分級標籤
  const levelLabels: Record<number, string> = {
    1: '1級|營收',
    2: '2級|流量',
    3: '3級|行政',
    4: '日常',
    5: '無(未分類)',
  };

  // 分級顏色
  const levelColors: Record<number, string> = {
    1: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white',
    2: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    3: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white',
    4: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700',
    5: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Badge className={levelColors[level]}>
              {levelLabels[level]}
            </Badge>
            <span className="text-sm font-normal text-muted-foreground">{date}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {/* 已執行的任務 */}
          {filteredSessions.length === 0 && unexecutedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              該分級無任務記錄
            </p>
          ) : (
            <>
              {filteredSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{session.taskTitle}</h4>
                      <span className="text-xs font-semibold text-primary whitespace-nowrap">
                        {session.durationMinutes}分鐘
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.startTime).toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {new Date(session.endTime).toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* 未執行的任務(只在「空(無)」分類顯示) */}
              {unexecutedTasks.map((task, index) => (
                <div
                  key={`unexecuted-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg border border-dashed bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{task.title}</h4>
                      <span className="text-xs font-semibold text-orange-600 whitespace-nowrap">
                        預估 {task.estimatedMinutes || 0}分鐘
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      待執行任務
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {(filteredSessions.length > 0 || unexecutedTasks.length > 0) && (
          <div className="pt-3 mt-6 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">總計</span>
              <span className="font-semibold text-primary">
                {filteredSessions.reduce((sum, s) => sum + s.durationMinutes, 0) + 
                 unexecutedTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0)} 分鐘
              </span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
