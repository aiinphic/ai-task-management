import { useState, useMemo, useEffect } from "react";
import { Task, User, Subtask } from "@/types/task";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Square, MessageSquarePlus, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";
import { getSymbolById } from "@/data/taskSymbols";
import { calculatePriorityScore } from "@/utils/priorityScore";
import { categorizeTask, PRIORITY_CATEGORIES, PriorityCategory, getTaskReasonLabel } from "@/utils/taskPriority";
import { SupplementDialog, SupplementData } from "@/components/SupplementDialog";
import { MiniPieChart } from "@/components/MiniPieChart";
import { TaskDrawer } from "@/components/TaskDrawer";
import { TaskDetailCard } from "@/components/TaskDetailCard";
import { DailySummaryDialog } from "@/components/DailySummaryDialog";
import { QuadrantRadarView } from "@/components/QuadrantRadarView";
import { RadarTaskView } from "@/components/RadarTaskView";

import {
  getTodayTimeLog,
  startTimeSession,
  endTimeSession,
  isPastEndTime,
  formatMinutesToHours,
  TimeSession,
  DailyTimeLog,
} from "@/utils/timeTracking";
import {
  calculateDailyPerformance,
  DailyPerformance,
} from "@/utils/performanceRating";
import { RatingBadge } from "@/components/RatingBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { shouldInitializeMockData, initializeMockData } from "@/utils/mockDataInit";

interface PersonalExecutionViewProps {
  member: User;
  tasks: Task[];
  onBack: () => void;
}

export function PersonalExecutionView({ member, tasks, onBack }: PersonalExecutionViewProps) {
  const [showPlanningDialog, setShowPlanningDialog] = useState(false);
  const [currentSession, setCurrentSession] = useState<TimeSession | null>(null);
  const [todayLog, setTodayLog] = useState(getTodayTimeLog());
  const [dataInitialized, setDataInitialized] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  
  // 圓餅圖互動狀態 - 彈出視窗
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedPieDate, setSelectedPieDate] = useState<string | null>(null);
  const [selectedPieLevel, setSelectedPieLevel] = useState<number | null>(null);
  const [selectedDaySessions, setSelectedDaySessions] = useState<TimeSession[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon' | null>(null);
  
  // 時間軸篩選狀態 - 追蹤每個日期的選中層級
  const [selectedPieLevels, setSelectedPieLevels] = useState<Record<string, 'level1' | 'level2' | 'level3' | 'daily' | undefined>>({});
  
  // 今日工作總結對話框狀態
  const [showDailySummary, setShowDailySummary] = useState(false);
  
  // 假日顯示切換狀態
  const [showWeekends, setShowWeekends] = useState(false);

  // 篩選該人員負責的任務(不包含協作任務)
  const memberTasks = tasks.filter(task => 
    task.assignee.id === member.id
  );

  // 計算最近 5 天的時間分析(從 localStorage 讀取實際記錄 + 未執行任務預估時間)
  const recentDaysAnalysis = useMemo(() => calculateRecentDaysFromLogs(memberTasks, member.id, !showWeekends), [dataInitialized, memberTasks, member.id, showWeekends]);
  
  // 檢測逾期任務
  const overdueTasks = memberTasks.filter(task => {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    const now = new Date();
    return deadline < now && task.status !== 'completed';
  });

  // 處理規劃框提交
  const handlePlanningSubmit = (data: SupplementData) => {
    console.log('規劃框提交:', data);
    toast.success('規劃已儲存');
    setShowPlanningDialog(false);
  };
  
  // 處理結束今日工作
  const handleEndDay = () => {
    // 顯示今日工作總結
    setShowDailySummary(true);
  };

  // 處理圓餅圖點擊
  const handlePieClick = (level: 'level1' | 'level2' | 'level3' | 'daily', date: string, sessions: TimeSession[]) => {
    // 更新該日期的選中層級
    setSelectedPieLevels(prev => ({
      ...prev,
      [date]: prev[date] === level ? undefined : level, // 切換選中狀態
    }));
  };

  // 處理時間軸標籤點擊
  const handleTimelineLabelClick = (level: 'level1' | 'level2' | 'level3' | 'daily', date: string, sessions: TimeSession[], timeSlot: 'morning' | 'afternoon') => {
    // 篩選該時段的 sessions
    const timeSlotSessions = sessions.filter(s => {
      const startHour = new Date(s.startTime).getHours();
      if (timeSlot === 'morning') {
        return startHour >= 9 && startHour < 13.5; // 9:00-13:30
      } else {
        return startHour >= 13.5 && startHour < 18.5; // 13:30-18:30
      }
    });

    // 設定選中的層級和時段
    setSelectedPieLevel(level === 'level1' ? 1 : level === 'level2' ? 2 : level === 'level3' ? 3 : 4);
    setSelectedPieDate(date);
    setSelectedDaySessions(timeSlotSessions);
    setSelectedTimeSlot(timeSlot);
    setTaskDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 頂部導航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回部門選擇
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{member.name} 的執行模式</h1>
            <p className="text-sm text-muted-foreground">{member.department} - {member.position}</p>
          </div>
        </div>
        
        {/* 結束今日工作按鈕 */}
        <Button
          onClick={handleEndDay}
          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
        >
          🔥 今日工作
        </Button>
      </div>

      {/* 逾期任務警告 */}
      {overdueTasks.length > 0 && (
        <Card className="bg-red-50 border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">⚠️ 逾期任務提醒</h3>
              <p className="text-sm text-red-700 mt-1">
                您有 {overdueTasks.length} 個任務已逾期，請儘快處理！
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 最近 5 天時間分析 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">⏱️ 最近 5 天時間分析</h2>
          {/* 假日顯示切換按鈕 */}
          <Button
            variant={showWeekends ? "default" : "outline"}
            size="sm"
            onClick={() => setShowWeekends(!showWeekends)}
          >
            {showWeekends ? "📅 包含假日" : "📅 僅平日"}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {recentDaysAnalysis.map((day) => (
            <Card key={day.date} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm">
                    {day.dayLabel}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    工作時數: {day.totalHours}h
                  </p>
                </div>
                
                {/* 評級徽章 (帶 Tooltip) */}
                {day.sessions.length > 0 && day.performance && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <RatingBadge rating={day.performance.rating} score={day.performance.score} />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-white p-4 max-w-md">
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-semibold mb-2">時間分配分析</div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between items-center">
                                <span>1級任務時間</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-amber-500"
                                      style={{ width: `${day.performance.level1Percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-white">{day.performance.level1Percentage.toFixed(0)}%</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>2級任務時間</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500"
                                      style={{ width: `${day.performance.level2Percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-white">{day.performance.level2Percentage.toFixed(0)}%</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>3級任務時間</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gray-500"
                                      style={{ width: `${day.performance.level3Percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-white">{day.performance.level3Percentage.toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {day.performance.suggestions.length > 0 && (
                            <div>
                              <div className="text-sm font-semibold mb-2">建議</div>
                              <ul className="text-xs space-y-1">
                                {day.performance.suggestions.map((suggestion, index) => (
                                  <li key={index} className="text-white">• {suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <div className="flex items-start gap-4">
                {/* 圓餅圖 */}
                {day.sessions.length > 0 && (
                  <div className="flex-shrink-0">
                    <MiniPieChart
                      data={day.levelDistribution}
                      selectedLevel={selectedPieLevels[day.date] || undefined}
                      onLevelClick={(level) => handlePieClick(level, day.date, day.sessions)}
                    />
                  </div>
                )}

                {/* 時間軸 */}
                <div className="flex-1">
                  {day.sessions.length > 0 ? (
                    <div className="space-y-2">
                      {/* 時間軸 */}
                      <div className="space-y-1">
                        {['level1', 'level2', 'level3', 'daily'].map((levelKey) => {
                          const level = levelKey as 'level1' | 'level2' | 'level3' | 'daily';
                          const levelData = day.levelDistribution.find(d => d.level === level);
                          
                          if (!levelData || levelData.value === 0) {
                            // 顯示虛線佔位
                            return (
                              <div key={level} className="flex items-center gap-2">
                                <div 
                                  className="border-2 border-dashed rounded"
                                  style={{ 
                                    height: level === 'level1' ? '32px' : level === 'level2' ? '24px' : level === 'level3' ? '16px' : '12px',
                                    width: '100%',
                                    borderColor: levelData?.color || '#e5e7eb',
                                  }}
                                />
                              </div>
                            );
                          }

                          // 計算寬度百分比
                          const widthPercentage = (levelData.value / day.totalHours) * 100;

                          return (
                            <div key={level} className="flex items-center gap-2">
                              <div 
                                className="rounded cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ 
                                  backgroundColor: levelData.color,
                                  height: level === 'level1' ? '32px' : level === 'level2' ? '24px' : level === 'level3' ? '16px' : '12px',
                                  width: `${widthPercentage}%`,
                                }}
                                title={`${levelData.label}: ${levelData.value}h`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">尚未開始任務</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* AI 優先處理清單 - 四象限視圖 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">📋 AI 優先處理清單</h2>
          <div className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-500 text-white">
            🎯 四象限視圖
          </div>
        </div>
        
        {/* 固定顯示四象限視圖 */}
        <QuadrantRadarView
          tasks={memberTasks}
          onStartTask={(task) => {
            // 點擊任務卡片後展開心智圖，不再執行任務
            toast.info(`查看任務：${task.title}`);
          }}
        />
      </div>

      {/* 規劃框對話框 */}
      <SupplementDialog
        open={showPlanningDialog}
        onOpenChange={setShowPlanningDialog}
        onSubmit={handlePlanningSubmit}
      />
      
      {/* 任務列表彈出視窗 */}
      <TaskDrawer
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        level={selectedPieLevel}
        date={selectedPieDate || ''}
        sessions={selectedDaySessions}
        timeSlot={selectedTimeSlot}
        memberTasks={memberTasks}
      />

      {/* 今日工作總結對話框 */}
      <DailySummaryDialog
        open={showDailySummary}
        onClose={() => setShowDailySummary(false)}
        todayLog={todayLog}
        completedTasksCount={memberTasks.filter(t => t.status === 'completed').length}
        efficiencyRating="優秀"
      />
    </div>
  );
}

// 輔助函數：計算最近 5 天的時間分析
function calculateRecentDaysFromLogs(
  tasks: Task[],
  memberId: string,
  weekdaysOnly: boolean
): Array<{
  date: string;
  dayLabel: string;
  totalHours: number;
  sessions: TimeSession[];
  levelDistribution: Array<{ level: 'level1' | 'level2' | 'level3' | 'daily'; label: string; value: number; color: string }>;
  performance: DailyPerformance | null;
}> {
  const result: Array<{
    date: string;
    dayLabel: string;
    totalHours: number;
    sessions: TimeSession[];
    levelDistribution: Array<{ level: 'level1' | 'level2' | 'level3' | 'daily'; label: string; value: number; color: string }>;
    performance: DailyPerformance | null;
  }> = [];

  const today = new Date();
  let daysCollected = 0;
  let daysBack = 1; // 從昨天開始

  while (daysCollected < 5) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - daysBack);
    
    const dayOfWeek = targetDate.getDay(); // 0=週日, 6=週六
    
    // 如果只顯示平日，跳過週末
    if (weekdaysOnly && (dayOfWeek === 0 || dayOfWeek === 6)) {
      daysBack++;
      continue;
    }

    const dateStr = targetDate.toISOString().split('T')[0];
    const storageKey = `timeLog_${memberId}_${dateStr}`;
    const logData = localStorage.getItem(storageKey);

    let sessions: TimeSession[] = [];
    let totalMinutes = 0;

    if (logData) {
      const log: DailyTimeLog = JSON.parse(logData);
      sessions = log.sessions || [];
      totalMinutes = log.usedMinutes || 0;
    }

    // 計算層級分布
    const level1Minutes = sessions.filter(s => s.taskLevel === 1).reduce((sum, s) => sum + s.durationMinutes, 0);
    const level2Minutes = sessions.filter(s => s.taskLevel === 2).reduce((sum, s) => sum + s.durationMinutes, 0);
    const level3Minutes = sessions.filter(s => s.taskLevel === 3).reduce((sum, s) => sum + s.durationMinutes, 0);
    const dailyMinutes = sessions.filter(s => s.taskLevel === 4).reduce((sum, s) => sum + s.durationMinutes, 0);

    const levelDistribution = [
      { level: 'level1' as const, label: '1級', value: parseFloat((level1Minutes / 60).toFixed(1)), color: '#f59e0b' },
      { level: 'level2' as const, label: '2級', value: parseFloat((level2Minutes / 60).toFixed(1)), color: '#3b82f6' },
      { level: 'level3' as const, label: '3級', value: parseFloat((level3Minutes / 60).toFixed(1)), color: '#6b7280' },
      { level: 'daily' as const, label: '日常', value: parseFloat((dailyMinutes / 60).toFixed(1)), color: '#d1d5db' },
    ];

    // 計算評級
    let performance: DailyPerformance | null = null;
    if (sessions.length > 0) {
      const dailyLog: DailyTimeLog = {
        date: dateStr,
        sessions,
        usedMinutes: totalMinutes,
        remainingMinutes: 480 - totalMinutes,
        isEnded: false,
      };
      performance = calculateDailyPerformance(dailyLog);
    }

    // 生成日期標籤
    const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const dayName = dayNames[dayOfWeek];
    const monthDay = `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;
    
    let dayLabel = '';
    if (daysBack === 1) {
      dayLabel = `昨天 (${dayName} ${monthDay})`;
    } else if (daysBack === 2) {
      dayLabel = `前天 (${dayName} ${monthDay})`;
    } else {
      dayLabel = `${daysBack} 天前 (${dayName} ${monthDay})`;
    }

    result.push({
      date: dateStr,
      dayLabel,
      totalHours: parseFloat((totalMinutes / 60).toFixed(1)),
      sessions,
      levelDistribution,
      performance,
    });

    daysCollected++;
    daysBack++;
  }

  return result;
}
