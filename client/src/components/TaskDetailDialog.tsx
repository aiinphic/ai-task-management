import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task, Subtask } from "@/types/task";
import { Clock, User, Users } from "lucide-react";
import { SubtaskCard } from "@/components/SubtaskCard";
import { SupplementDialog, SupplementData } from "@/components/SupplementDialog";

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 模擬 AI 生成的子任務
const generateSubtasks = (task: Task): Subtask[] => {
  const subtasks: Subtask[] = [
    { id: "st1", title: "收集相關資料和素材", estimatedHours: 1, estimatedTime: 60, actualTime: 0, status: 'pending', completed: false },
    { id: "st2", title: "完成主要內容製作", estimatedHours: 1.5, estimatedTime: 90, actualTime: 0, status: 'pending', completed: false },
    { id: "st3", title: "初步檢查和修正", estimatedHours: 0.5, estimatedTime: 30, actualTime: 0, status: 'pending', completed: false },
    { id: "st4", title: "細節優化和完善", estimatedHours: 1.5, estimatedTime: 90, actualTime: 0, status: 'pending', completed: false },
    { id: "st5", title: "最終審核和調整", estimatedHours: 1.5, estimatedTime: 90, actualTime: 0, status: 'pending', completed: false },
    { id: "st6", title: "準備交付和文件整理", estimatedHours: 1, estimatedTime: 60, actualTime: 0, status: 'pending', completed: false },
  ];
  
  return subtasks;
};

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [showSupplementDialog, setShowSupplementDialog] = useState(false);

  useEffect(() => {
    if (task) {
      setSubtasks(task.subtasks || generateSubtasks(task));
    }
  }, [task]);

  const handleSupplementSubmit = (data: SupplementData) => {
    console.log('補充資料:', data);
    // TODO: 將資料發送給 AI 進行分析
    // TODO: 根據 AI 分析結果更新任務或新增任務
  };

  const handleSubtaskStatusChange = (subtaskId: string, newStatus: Subtask['status'], actualTime?: number) => {
    setSubtasks(prev =>
      prev.map(st => {
        if (st.id === subtaskId) {
          const updated: Subtask = { ...st, status: newStatus };
          
          if (newStatus === 'in-progress' && st.status === 'pending') {
            updated.startTime = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
          }
          
          if (newStatus === 'completed') {
            updated.endTime = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
            updated.actualTime = actualTime || st.actualTime;
          }
          
          if (actualTime !== undefined) {
            updated.actualTime = actualTime;
          }
          
          return updated;
        }
        return st;
      })
    );
  };

  if (!task) return null;

  const completedCount = subtasks.filter(st => st.status === 'completed').length;
  const progressPercent = Math.round((completedCount / subtasks.length) * 100);
  const totalActualTime = subtasks.reduce((sum, st) => sum + st.actualTime, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="w-3 h-3" />
                負責人: {task.assignee.name}
              </Badge>
              {task.collaborators.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  協作: {task.collaborators.map(c => c.name).join(", ")}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">{task.description}</p>

            {/* AI 分析增強欄位 */}
            <div className="space-y-4">
              {/* 任務方向 */}
              {task.taskDirection && (
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    任務方向
                  </h4>
                  <p className="text-sm text-indigo-800 leading-relaxed">
                    {task.taskDirection}
                  </p>
                </div>
              )}

              {/* 任務大綱 */}
              {task.taskOutline && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    任務大綱
                  </h4>
                  <div className="text-sm text-blue-800 whitespace-pre-line">
                    {task.taskOutline}
                  </div>
                </div>
              )}

              {/* AI 執行建議 */}
              {task.aiSuggestions && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI 執行建議
                  </h4>
                  <p className="text-sm text-green-800 leading-relaxed">
                    {task.aiSuggestions}
                  </p>
                </div>
              )}


              {/* 時程目標 */}
              {task.scheduleGoal && (
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    時程目標
                  </h4>
                  <p className="text-sm text-purple-800 leading-relaxed">
                    {task.scheduleGoal}
                  </p>
                </div>
              )}
              
              {/* 量化貢獻度 */}
              {task.quantitativeMetrics && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg">
                  <h4 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    📊 量化貢獻度（KPI）
                  </h4>
                  <div className="space-y-2">
                    {task.quantitativeMetrics.financial && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="font-semibold text-amber-900 min-w-[100px]">💰 金額：</span>
                        <span className="text-amber-800">{task.quantitativeMetrics.financial.description}</span>
                      </div>
                    )}
                    {task.quantitativeMetrics.quantity && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="font-semibold text-amber-900 min-w-[100px]">👥 數量：</span>
                        <span className="text-amber-800">{task.quantitativeMetrics.quantity.description}</span>
                      </div>
                    )}
                    {task.quantitativeMetrics.time && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="font-semibold text-amber-900 min-w-[100px]">⏱️ 時間：</span>
                        <span className="text-amber-800">{task.quantitativeMetrics.time.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 補充資料按鈕 */}
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSupplementDialog(true)}
                  className="gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  補充資料
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Subtasks */}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              關閉
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* 補充資料對話框 */}
      <SupplementDialog
        open={showSupplementDialog}
        onOpenChange={setShowSupplementDialog}
        onSubmit={handleSupplementSubmit}
      />
    </Dialog>
  );
}
